# Personal site

A personal digital space — about, work, life, photography, tools, writing — with a real
admin behind it.

**Editorial Minimal × Kinetic Tech.** Static is quiet: typography, whitespace, hairlines
and images. Interaction is where the technology shows. Nothing moves unless you move it.

- **Site** → `/`
- **Admin** → `/admin`
- **Day-to-day use** → [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- **What's borrowed from open source, and why** → [REFERENCES.md](./REFERENCES.md)

---

## Run it

```bash
npm install
cp .env.example .env.local     # then fill in the secrets below
npm run placeholders           # generate the placeholder photography
npm run seed                   # create the owner account + starter content
npm run dev
```

Open <http://localhost:3000>, and <http://localhost:3000/admin> to sign in.

Minimum `.env.local`:

```bash
PAYLOAD_SECRET=          # openssl rand -base64 32
PREVIEW_SECRET=          # openssl rand -base64 24
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URI=file:./data/site.db
SEED_EMAIL=you@example.com
SEED_PASSWORD=           # change it in the admin after first sign-in
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm run start` | Production build and serve |
| `npm run seed` | Load starter content (`--force` to overwrite existing) |
| `npm run placeholders` | Regenerate the placeholder images |
| `npm run generate:types` | Regenerate `src/payload-types.ts` after a schema change |
| `npm run generate:importmap` | Regenerate the admin import map after adding an admin component |
| `npm run lint` | ESLint |

---

## Architecture

### The division of labour

```
Git  →  design system · animation · components · block types · schema
CMS  →  words · projects · photos · order · layout choices · publishing
```

Neither side reaches into the other. Adding a project is a CMS action; adding a *kind* of
block is a code change. That boundary is the whole design.

### File structure

```
content/            Starter data for `npm run seed`. NOT read at runtime.
src/
  payload.config.ts     CMS entry point: db, storage, collections, globals
  payload/
    access.ts           3 rules: public reads published, owner does everything
    blocks/             The block library — 16 designed block types
    collections/        Users, Media, Projects, Life, Gallery, Tools, Posts
    globals/            Home, About/Resume, SiteSettings
    fields/             Shared field sets: layout presets, slug
    hooks/revalidate.ts Publish → rebuild the affected pages
    components/         Admin dashboard
  lib/
    cms.ts              THE content layer: CMS documents → plain component props
    motion.ts           Motion tokens — the site's physics
    scroll-signal.ts    The single scroll-velocity source
  components/
    blocks/             Block renderers + presets.ts (names → grid)
    motion/             Reveal, Parallax, Cursor, HoverPreview, ProximityField, …
    gallery/            The WebGL ring, its grid fallback, the fullscreen viewer
    home/ work/ tools/ layout/ ui/
  app/
    (frontend)/         The public site — its own root layout
    (payload)/          The admin — its own root layout
    globals.css         Design tokens, grid, print stylesheet
```

Two route groups, two root layouts. The admin's JavaScript is never downloaded by a
visitor, and the site's animation runtime is never downloaded by the admin.

### Content flow

```
/admin  →  SQLite (data/site.db)  →  src/lib/cms.ts  →  components
                                          ↑
                       the only file that knows Payload exists
```

`src/lib/cms.ts` maps CMS documents onto plain shapes (`Media`, `Photo`, `NavItem`).
Components take props and know nothing about the CMS — which is why swapping the CMS
would be a one-file migration, and why a component can be read without understanding it.

### Animation system

One rule: **there is exactly one of everything.**

- **One scroll authority.** Lenis owns scrolling, driven from GSAP's ticker so
  ScrollTrigger can never be a frame behind it.
- **One velocity signal.** `scrollSignal` is written by that single loop and read by the
  work-index distortion, the gallery ring, and anything added later. They cannot disagree.
- **One entrance animation.** `<Reveal>`. Every page uses it.
- **One hover preview.** Shared by the home page, `/work` and `/tools`.
- **One set of motion tokens.** `src/lib/motion.ts`. If two things feel like they come
  from different worlds, that file is the fix.

Each expensive effect has one home: proximity repulsion on the hero and `/tools`, velocity
distortion on `/work`, the ring on `/gallery`.

Nothing runs when nothing is happening. The velocity signal settles to exactly zero, the
proximity field detaches its loop when the cursor leaves, and the gallery canvas renders
on demand rather than every frame.

### WebGL

Three.js is imported in exactly one place — `GalleryStage`, via `next/dynamic` with
`ssr: false` — so visiting any other route never downloads a WebGL renderer.

The ring places each photograph at an angle on a cylinder, wraps the angle to ±π (which is
what makes it infinite in both directions), culls anything outside the front arc, and
drives rotation from scroll progress plus drag momentum. Clicking projects the plane's
screen box and hands it to GSAP Flip, which expands it to fullscreen and back.

It degrades honestly: below 768px, under reduced motion, without WebGL, or with the
feature switched off in Settings, `/gallery` renders a staggered editorial grid that opens
the same viewer through the same transition.

### Accessibility and print

`prefers-reduced-motion` is honoured live and globally: no proximity, no inertia, no
cursor, no 3D. Animations set their own start state in JavaScript, so with JS disabled
every page renders fully visible and correct.

`/about` prints to a clean A4 resume from the same DOM the screen uses — one data source,
two outputs. The portrait is the only thing the print version drops.

`/resume` permanently redirects to `/about`, so links shared before the rename still land.

---

## Deploying

The site and the admin are one Next.js app, so it is one deploy.

**Database.** SQLite by default (`data/site.db`) — fine on a VPS or in Docker with a
persistent volume. On a serverless host, point `DATABASE_URI` at a hosted libSQL/Turso
database and set `DATABASE_AUTH_TOKEN`. No code change.

**Media.** Local disk is development only — files written to the container do not survive
a redeploy on most hosts. Set `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
`S3_ENDPOINT` and `S3_PUBLIC_URL` and every upload goes to S3-compatible object storage
(Cloudflare R2, Backblaze B2, AWS S3) instead. Again, no code change — uploads are
addressed through Payload, never by path.

**Publishing.** Pressing Publish revalidates the affected pages. No build, no deploy, no
commit.

---

## The GitHub Pages preview

There are two deployments of this codebase, and only one of them runs a server.

| | Preview | Real site |
| --- | --- | --- |
| Where | GitHub Pages — `demov1.euan.im` | own server |
| What ships | a folder of HTML, CSS, JS and images | the Next app with Payload inside it |
| Database at runtime | none | SQLite / libSQL |
| `/admin`, `/api`, draft mode, redirects | not built | as documented above |
| Updated by | pushing to `main` | pressing Publish |

**`npm run build:static`** produces `out/`. Serve that directory with anything.

Payload still runs *while the build runs* — the pages read their content from it exactly
as they do on a server, and what ships is the rendered result. "No database in preview" is
a statement about the deployed artefact, not about the machine that produced it. CI seeds a
throwaway database inside the runner and discards it with the runner.

### What the deployment is allowed to touch

`src/` does not know which target it is being built for, and it must stay that way — the
real site is the one that matters, and the preview must never become a reason to change it.
Everything Pages-specific lives in exactly three places:

- **`next.config.ts`** — one `STATIC_EXPORT` branch. Deployment config by definition.
- **`scripts/build-static.mjs`** — the build, and the three things config cannot express.
- **`.github/workflows/deploy-preview.yml`** — when it runs.

### The three things that need a script

1. **The CMS routes have to be out of the way.** `/admin/[[...segments]]` has no
   `generateStaticParams` and `/api/[...slug]` answers POSTs — both are what a static export
   refuses to emit. They are moved aside for the build and moved back afterwards, including
   on failure and on Ctrl-C.
2. **Media has to become ordinary files.** Payload serves uploads from
   `/api/media/file/<name>`, a route that will not exist. The files are copied into
   `public/media/` and the URLs are rewritten *in the exported output*. It has to be the
   output: Payload derives an upload's `url` when the document is read, so rewriting the
   database changes nothing, and it cannot be the image loader either — the gallery hands
   raw URLs to three.js and two components set `<video src>` directly, so a third of the
   images never pass through `next/image` at all.
3. **`redirects` does not survive a static export.** `/resume` → `/about` is emitted as a
   meta-refresh stub instead.

### basePath

`next/image` does **not** add `basePath` to `src`. That is the trap this setup is built
around, and it is why the media rewrite understands two URL forms — the one Next has
already prefixed and the one it left alone.

- **Custom domain** (`demov1.euan.im`): `NEXT_PUBLIC_BASE_PATH` empty. This is the default.
- **Bare project URL** (`…github.io/personal-site`): set it to `/personal-site`.

It is inlined into the client bundles at build time, so switching it means rebuilding —
which is what the workflow's `base_path` input is for.

### Where it publishes

Today, the project URL: **MeowFl0wer.github.io/personal-site**. The workflow turns Pages on
itself the first time it runs (`enablement: true`), so there is nothing to click.

To move it to **demov1.euan.im**:

1. Add a DNS `CNAME` for `demov1` → `MeowFl0wer.github.io`, and wait for it to resolve.
2. In the workflow, set `BASE_PATH: ''` and `PAGES_CNAME: 'demov1.euan.im'`.

Those two change **together**. A CNAME published for a name that does not resolve yet takes
the preview offline, and a base path left set would prefix every URL on a domain that has
no such directory.
