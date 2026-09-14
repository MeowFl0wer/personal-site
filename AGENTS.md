<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Two deployments, one codebase

This repo is deployed twice, and only one of them runs a server.

| | Preview | Real site |
| --- | --- | --- |
| Where | GitHub Pages — `demov1.euan.im` (the project URL redirects there) | own server, not yet set up |
| What ships | a folder of static HTML, CSS, JS, images | the Next app with Payload inside it |
| Runtime deps | none | SQLite/libSQL, Payload, Node |
| `/admin`, `/api`, draft mode, `redirects` | not built | as normal |
| Updated by | push to `main` | pressing Publish in the CMS |

**The real site is the one that matters. The preview must never become a reason
to change it.**

## The constraint

`src/` does not know which target it is being built for, and it has to stay that
way. Everything deployment-specific lives in exactly three places:

- `next.config.ts` — one `STATIC_EXPORT` branch. Deployment config already.
- `scripts/build-static.mjs` — the build, and what config cannot express.
- `.github/workflows/deploy-preview.yml` — when it runs.

Verify rather than assume, because this is easy to erode by accident:

```bash
git diff --stat <before-the-pages-work>..HEAD -- src/   # must be empty
```

If a Pages problem seems to need a change under `src/`, it is the wrong fix.
Every one so far had an answer outside it — see the reasoning in the header of
`scripts/build-static.mjs`, which records what was tried and why it failed.

## Things that have already bitten

- **`next/image` does NOT prefix `src` with `basePath`.** But Next *has* already
  prefixed the URLs it emitted, so anything rewriting them must handle both
  forms or it produces `/personal-site/personal-site/…`.
- **Payload derives an upload's `url` on read.** Rewriting the database does
  nothing; the media rewrite has to run on the exported output.
- **A third of the images never reach `next/image`.** The gallery hands raw URLs
  to three.js, and two components set `<video src>` directly. A fix in the image
  loader only covers part of the site.
- **The static build must be cold.** The render cache is keyed on source, not on
  the database behind it, so a warm one re-serves stale media URLs.
- **Pages must already exist.** `enablement: true` cannot create it — the
  workflow token is refused. It was enabled once, by hand.
- **Payload's Local API defaults to `overrideAccess: true`.** So a `find` that
  looks like it respects `access.read` does not, and the access control in
  `payload/access.ts` sat there as dead code while unpublished drafts rendered
  on the public site. `draft: false` is not a substitute — it picks which
  version to return, not which documents the reader may see. Every read in
  `lib/cms.ts` passes `overrideAccess: false` and a user; keep it that way.
- **`next/image` fetches the source without cookies.** The optimizer builds its
  internal request from scratch — url, method, socket, no headers — so Payload
  sees an anonymous reader and refuses anything marked private. It fails closed,
  which hides the problem: the file is not leaked, it is simply invisible to the
  person holding a valid grant too. Private uploads are served `unoptimized`.
- **Production does not push schema.** `push` is on only outside production, so
  a schema change that "just worked" in dev reaches a production database as
  nothing at all. Generate a migration with `npm run migrate:create` and commit
  it alongside the change; `src/migrations/` is part of the source.
- **A path that starts with `/` can still leave the site.** `/\evil.example`
  passes `startsWith("/") && !startsWith("//")` and the URL parser resolves it
  to another origin. Only the parser knows — see `lib/safe-redirect.ts`, which
  also explains why it returns a `URL` rather than a path: the same-origin
  pathname `//evil.example` escapes again if anyone resolves it a second time.
- **Never regenerate `package-lock.json` with `node_modules` present.** npm
  prunes the lock to the platform it can see, and the Linux native packages —
  swc, sharp, lightningcss — quietly vanish. `npm ci` then fails on CI and on
  the server. Remove both, or neither.

## Before saying the server build is unaffected

```bash
npm test               # the redirect allow-list, which is security-relevant
npm run build          # 19 routes, /admin and /api among them
npm run build:static   # 37 pages in out/, no /admin, no /api
```

The `(41/41)` in the server build's output is prerender units, not routes — the
route table underneath it is the thing with 19 rows in it. They have been
confused before, in this file.
