<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Two deployments, one codebase

This repo is deployed twice, and only one of them runs a server.

| | Preview | Real site |
| --- | --- | --- |
| Where | GitHub Pages — `meowfl0wer.github.io/personal-site`, later `demov1.euan.im` | own server, not yet set up |
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

## Before saying the server build is unaffected

```bash
npm run build          # 41 routes, /admin and /api among them
npm run build:static   # 37 pages in out/, no /admin, no /api
```
