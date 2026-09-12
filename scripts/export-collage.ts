/**
 * Writes the arrangement you made in the admin back into the repository.
 *
 *   npm run collage:save
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * The admin edits the database, and the database is not in Git — it is a local
 * file on whichever machine is running the site. So an arrangement dragged
 * into place there survives exactly until the next `npm run seed`, and never
 * reaches the server or the static preview at all.
 *
 * This closes that loop. It reads the live `collage` global, writes it out as
 * `content/collage.ts`, and copies any cut-out that was uploaded through the
 * admin into `public/placeholder/collage/` so the seed can find it again. Then
 * `git commit` makes it permanent, and a fresh checkout seeds back into the
 * same arrangement.
 *
 * Round trip: arrange in /admin → `npm run collage:save` → commit.
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { getPayload } from "payload";
import config from "../src/payload.config";
import sharp from "sharp";
import type { Media } from "../src/payload-types";
import { NAMES, isCard } from "./collage-names.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const SEED_FILE = path.join(root, "content", "collage.ts");
const SEED_ART = path.join(root, "public", "placeholder", "collage");
const UPLOADS = path.join(root, "media");

const asMedia = (value: unknown): Media | null =>
  value && typeof value === "object" && "filename" in value ? (value as Media) : null;

const bare = (filename: string) => filename.replace(/\.[a-z0-9]+$/i, "");

/**
 * What the seed should call this picture.
 *
 * Choosing a piece in the admin normally means picking one the seed already
 * uploaded, and its name is already the right one. Uploading the original a
 * second time — which is the easier thing to do in that interface — brings the
 * generator's filename with it, and the same image would then be written into
 * the repository twice under two names, the second copy at full resolution
 * because it never went through the importer. The table catches that case and
 * points the seed back at the piece it already has.
 */
const nameOf = (doc: Media) => {
  const name = bare(doc.filename ?? "");
  const known = (NAMES as Record<string, string>)[`${name}.png`];
  return known ?? name;
};

/* Same ceilings as the importer, for the same reasons: a card is drawn at most
   336 px and a cut-out at about two thirds of that, both capped by width
   because width is what the page sets. */
const CARD_WIDTH = 1200;
const PIECE_WIDTH = 1100;

const main = async () => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "collage", depth: 2, overrideAccess: true });

  const themes = doc.themes ?? [];
  if (!themes.length) {
    console.error("No arrangements in the database. Nothing to write.");
    process.exit(1);
  }

  fs.mkdirSync(SEED_ART, { recursive: true });
  const pending: { source: string; target: string; name: string }[] = [];
  const copied: string[] = [];

  /* Anything chosen in the admin that was uploaded there rather than seeded
     has its file in /media, which is not in Git either. Copy it across so the
     committed seed is self-contained — otherwise this writes a reference to a
     picture nobody else has. */
  const ensureArt = (docMedia: Media) => {
    const filename = docMedia.filename;
    if (!filename) return;
    /* Under the name the seed will use, not the name it was uploaded with —
       otherwise a re-upload of a piece the seed already has lands beside it as
       a second copy that nothing references. */
    const target = path.join(SEED_ART, `${nameOf(docMedia)}.webp`);
    if (fs.existsSync(target)) return;
    const source = path.join(UPLOADS, filename);
    if (!fs.existsSync(source)) {
      console.warn(`  cannot find the file for ${filename} — seeding will fail on it`);
      return;
    }
    /* Queued rather than copied: an upload has not been through the importer,
       so it is whatever came off the generator — often three times the size it
       is ever drawn at. It gets the same treatment here that it would have got
       there, so the repository only ever holds art at a size the page uses. */
    pending.push({ source, target, name: bare(filename) });
  };

  const out: string[] = [];
  for (const theme of themes) {
    const card = asMedia(theme.card);
    if (!card) {
      console.warn(`  "${theme.label}" has no card — skipped`);
      continue;
    }
    ensureArt(card);

    const pieces = (theme.pieces ?? []).flatMap((piece) => {
      const image = asMedia(piece.image);
      if (!image) return [];
      ensureArt(image);
      return [
        `      { image: ${JSON.stringify(nameOf(image))}, x: ${piece.x}, y: ${piece.y}, width: ${piece.width}, rotate: ${piece.rotate}${piece.behind ? ", behind: true" : ""} },`,
      ];
    });

    out.push(
      [
        "  {",
        `    label: ${JSON.stringify(theme.label)},`,
        `    card: ${JSON.stringify(nameOf(card))},`,
        `    alt: ${JSON.stringify(theme.alt ?? "")},`,
        "    pieces: [",
        ...pieces,
        "    ],",
        `    wash: { sky: ${JSON.stringify(theme.wash?.sky ?? "")}, haze: ${JSON.stringify(theme.wash?.haze ?? "")}, landFade: ${JSON.stringify(theme.wash?.landFade ?? "")}, land: ${JSON.stringify(theme.wash?.land ?? "")} },`,
        "  },",
      ].join("\n"),
    );
  }

  /* The header is rewritten rather than preserved: this file is generated now,
     and a hand-written note at the top of a generated file is a lie waiting to
     happen. */
  const contents = `/**
 * The arrangements the home page starts out wearing.
 *
 * GENERATED — written by \`npm run collage:save\` from whatever is currently in
 * the database. Arrange the pieces in /admin, run that, and commit: this file
 * is what a fresh checkout, the server and the static preview all seed from.
 *
 * Editing it by hand works and is sometimes the quickest thing to do, but the
 * next save overwrites it, so do not leave anything here that is not also in
 * the admin.
 *
 * Positions are percentages of the card's own box. Negative values hang a
 * piece off the edge, which is most of what makes it look stuck on rather than
 * printed.
 */
export type CollagePieceSeed = {
  image: string;
  x: number;
  y: number;
  width: number;
  rotate: number;
  behind?: boolean;
};

export type CollageThemeSeed = {
  label: string;
  card: string;
  alt: string;
  pieces: CollagePieceSeed[];
  wash: { sky: string; haze: string; landFade: string; land: string };
};

/** How the arrangements take their turn. Editable in the admin like the rest. */
export const collageSettings = {
  autoplay: ${doc.autoplay !== false},
  /** Seconds each arrangement holds before the next slides in. */
  dwell: ${doc.dwell ?? 7},
};

export const collageThemes: CollageThemeSeed[] = [
${out.join("\n")}
];
`;

  for (const { source, target, name } of pending) {
    const pipeline = sharp(source);
    if (isCard(name)) {
      await pipeline.resize(CARD_WIDTH, null, { withoutEnlargement: true }).webp({ quality: 86 }).toFile(target);
    } else {
      await pipeline
        .trim({ threshold: 10 })
        .resize(PIECE_WIDTH, null, { withoutEnlargement: true })
        .webp({ quality: 92, alphaQuality: 92 })
        .toFile(target);
    }
    copied.push(path.basename(target));
  }

  fs.writeFileSync(SEED_FILE, contents);

  console.log(`Wrote ${out.length} arrangements to content/collage.ts`);
  console.log(`Playback: autoplay ${doc.autoplay !== false ? "on" : "off"}, ${doc.dwell ?? 7}s each`);
  if (copied.length) {
    console.log(`Brought ${copied.length} newly uploaded piece(s) into public/placeholder/collage:`);
    for (const name of copied) console.log(`  ${name}`);
  }
  console.log("\nCommit content/collage.ts (and any copied art) to make it permanent.");
  process.exit(0);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
