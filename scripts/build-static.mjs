/**
 * Builds the GitHub Pages preview.
 *
 *   npm run build:static
 *   NEXT_PUBLIC_BASE_PATH=/personal-site npm run build:static
 *
 * Produces `out/` — HTML, CSS, JS and media, servable by anything. No database,
 * no CMS, no auth, no server actions, nothing that needs Node at request time.
 *
 * ── Why a script and not just `next build` ──────────────────────────────────
 *
 * Three things have to happen around the build that config cannot express, and
 * all three are deployment concerns that must not leak into `src/`:
 *
 *  1. The CMS routes have to be out of the way. `/admin/[[...segments]]` has no
 *     generateStaticParams and `/api/[...slug]` answers POSTs; both are exactly
 *     what a static export refuses to emit. They are moved aside for the
 *     duration and moved back afterwards — see `withRoutesHidden`, which
 *     restores on failure and on Ctrl-C.
 *
 *  2. Media has to become ordinary files. Payload serves uploads from
 *     `/api/media/file/<name>`, which is a route that will not exist. The files
 *     are copied into `public/media/` and the URLs in the database are
 *     rewritten to match, so `next/image`, the gallery's WebGL textures and the
 *     `<video>` tags all get the same corrected path without a line of
 *     application code knowing about any of it.
 *
 *  3. `redirects` does not survive a static export. /resume → /about is emitted
 *     as a meta-refresh stub instead.
 *
 * Payload still runs while the build runs — the pages read their content from
 * it exactly as they do on a server, and what ships is the rendered result.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "out");
const PUBLIC_MEDIA = path.join(root, "public", "media");
const HIDDEN = path.join(root, ".static-build-hidden");
/** The build reads a copy, never the working database. See `stageDatabase`. */

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const CNAME = process.env.PAGES_CNAME ?? "";
/** Only used to fail early with a useful message if nothing has been seeded. */
const DB_FILE = (process.env.DATABASE_URI ?? "file:./data/site.db").replace(/^file:/, "");

/** Routes a static export cannot emit. Relative to the repo root. */
const SERVER_ONLY_ROUTES = [
  // The whole CMS: the admin panel and Payload's REST/GraphQL handlers.
  "src/app/(payload)",
  // Draft mode — it sets a cookie and reads the request.
  "src/app/(frontend)/next",
];

const log = (...args) => console.log("·", ...args);

const run = (command, args, extraEnv = {}) => {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...extraEnv },
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with ${result.status}`);
  }
};

/**
 * Moves the server-only routes out of the tree, runs `fn`, and puts them back
 * whatever happens — including on Ctrl-C, which is the case that would
 * otherwise leave someone's checkout missing its admin panel with no clue why.
 */
const withRoutesHidden = async (fn) => {
  fs.rmSync(HIDDEN, { recursive: true, force: true });
  fs.mkdirSync(HIDDEN, { recursive: true });

  const moved = [];
  const restore = () => {
    for (const { from, to } of moved.reverse()) {
      if (fs.existsSync(to)) {
        fs.mkdirSync(path.dirname(from), { recursive: true });
        fs.renameSync(to, from);
      }
    }
    moved.length = 0;
    fs.rmSync(HIDDEN, { recursive: true, force: true });
  };

  const onSignal = () => {
    restore();
    process.exit(130);
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);

  try {
    for (const relative of SERVER_ONLY_ROUTES) {
      const from = path.join(root, relative);
      if (!fs.existsSync(from)) continue;
      const to = path.join(HIDDEN, relative.replace(/[/\\]/g, "__"));
      fs.renameSync(from, to);
      moved.push({ from, to });
      log(`hidden for the build: ${relative}`);
    }
    return await fn();
  } finally {
    restore();
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
    log("server-only routes restored");
  }
};

/** Copies Payload's upload directory into public/ so the export includes it. */
const copyMedia = () => {
  const source = path.join(root, "media");
  fs.rmSync(PUBLIC_MEDIA, { recursive: true, force: true });

  if (!fs.existsSync(source)) {
    log("no media/ directory — nothing to copy");
    return 0;
  }

  fs.cpSync(source, PUBLIC_MEDIA, { recursive: true });
  const count = fs.readdirSync(PUBLIC_MEDIA).length;
  log(`copied ${count} media files into public/media/`);
  return count;
};

/**
 * Points every stored media URL at the copied files.
 *
 * `/api/media/file/x.webp` → `${BASE_PATH}/media/x.webp`.
 *
 * Doing it here rather than in a component is what keeps the application code
 * ignorant of the deployment: the gallery's three.js textures and the `<video>`
 * tags read these same URLs and never touch `next/image`, so a fix in the image
 * loader would have covered maybe half the images on the site.
 *
 * Every column Payload generates for a derivative ends in `url`, so they are
 * found rather than listed — a new image size in the Media collection must not
 * silently ship broken.
 */
/**
 * Points every media URL in the exported files at the copied files.
 *
 * `/api/media/file/x.webp` → `${BASE_PATH}/media/x.webp`.
 *
 * This runs on the output rather than on the database, and that is not laziness
 * — it is the only place it works. Payload derives an upload's `url` when the
 * document is read, from the collection slug, so the value stored in the row is
 * overwritten on its way out. Rewriting the database changes nothing; the build
 * reads `/media/x.webp` off the disk and still renders `/api/media/file/x.webp`.
 * (Verified: the swapped-in database probed correctly and the export was
 * unchanged.) The alternative is a custom storage adapter, which is a lot of
 * machinery for a preview and would change how the real server behaves too.
 *
 * It has to be the output and not the image loader for the opposite reason:
 * three of this site's images never reach `next/image`. The gallery hands raw
 * URLs to three.js as WebGL textures, and the hover preview and the video block
 * set `<video src>` directly. Rewriting the files catches all of them.
 */
const rewriteExportedMediaUrls = () => {
  const REWRITABLE = new Set([".html", ".txt", ".js", ".json", ".css"]);
  const to = `${BASE_PATH}/media/`;

  // Two forms, and the order matters. Next has already applied basePath to the
  // URLs it emitted, so most of them read `/personal-site/api/media/file/x`;
  // replacing the bare substring inside one of those produces
  // `/personal-site/personal-site/media/x`, which is how this was found. The
  // prefixed form is therefore consumed first, and the bare form only catches
  // whatever Next left alone.
  const forms = BASE_PATH
    ? [`${BASE_PATH}/api/media/file/`, "/api/media/file/"]
    : ["/api/media/file/"];

  let files = 0;
  let occurrences = 0;

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!REWRITABLE.has(path.extname(entry.name))) continue;

      const before = fs.readFileSync(full, "utf8");
      if (!forms.some((form) => before.includes(form))) continue;

      let after = before;
      for (const form of forms) {
        occurrences += after.split(form).length - 1;
        after = after.split(form).join(to);
      }
      fs.writeFileSync(full, after);
      files += 1;
    }
  };

  walk(OUT);
  log(`rewrote ${occurrences} media URLs in ${files} exported files → ${to}`);

  return occurrences;
};

/** A static stand-in for the /resume → /about redirect a server would issue. */
const writeRedirectStub = (from, to) => {
  const target = `${BASE_PATH}${to}`;
  const dir = path.join(OUT, from.replace(/^\//, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <link rel="canonical" href="${target}" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <script>location.replace(${JSON.stringify(target)} + location.hash);</script>
  </head>
  <body>
    <p>This page moved to <a href="${target}">${target}</a>.</p>
  </body>
</html>
`,
  );
  log(`redirect stub: ${from} → ${target}`);
};

const main = async () => {
  log(`base path: ${BASE_PATH || "(none — root of the domain)"}`);

  if (!fs.existsSync(DB_FILE)) {
    throw new Error(`No database at ${DB_FILE}. Run \`npm run seed\` first.`);
  }

  fs.rmSync(OUT, { recursive: true, force: true });
  // The whole build directory, not just part of it. Two reasons, and both were
  // found the hard way:
  //   - tsconfig pulls route types out of `.next/types` and `.next/dev/types`,
  //     and those still describe the CMS routes this build is about to hide, so
  //     the type check fails before the export starts;
  //   - the render cache is keyed on the source, not on the database behind it.
  //     A warm cache happily re-serves pages built against the un-rewritten
  //     media URLs, and the export ships /api/media/file/… paths that resolve to
  //     nothing. A static build has to be a cold one.
  // Everything here is regenerated by the next `next dev` or `next build`.
  fs.rmSync(path.join(root, ".next"), { recursive: true, force: true });

  copyMedia();

  await withRoutesHidden(() => {
    run("npx", ["next", "build"], {
      STATIC_EXPORT: "1",
      NEXT_PUBLIC_BASE_PATH: BASE_PATH,
      // Also what turns off the sqlite adapter's dev schema push, so the build
      // reads the database without writing to it.
      NODE_ENV: "production",
    });
  });

  if (!fs.existsSync(OUT)) {
    throw new Error("next build produced no out/ directory");
  }

  // Without this GitHub Pages runs the output through Jekyll, which drops every
  // directory beginning with an underscore — including _next, i.e. all of it.
  rewriteExportedMediaUrls();

  fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
  log("wrote .nojekyll");

  writeRedirectStub("/resume", "/about");

  if (CNAME) {
    fs.writeFileSync(path.join(OUT, "CNAME"), `${CNAME}\n`);
    log(`wrote CNAME: ${CNAME}`);
  }

  const pages = fs
    .readdirSync(OUT, { recursive: true })
    .filter((entry) => String(entry).endsWith("index.html")).length;
  log(`done — ${pages} pages in out/`);
};

main().catch((error) => {
  console.error("\nStatic build failed:\n", error.message);
  process.exit(1);
});
