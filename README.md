# Personal site

A personal digital space — about, work, life, photography, tools, writing — with a real
admin behind it.

**Editorial Minimal × Kinetic Tech.** Static is quiet: typography, whitespace, hairlines
and images. Interaction is where the technology shows. Nothing moves unless you move it.

- **Site** → `/`
- **Admin** → `/admin`
- **Day-to-day use** → [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- **What's borrowed from open source, and why** → [REFERENCES.md](./REFERENCES.md)
- **What you may reuse** → [Licence](#licence)

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
| `npm run build:static` | Build the GitHub Pages preview into `out/` — see [below](#the-github-pages-preview) |
| `npm run preview:static` | Serve `out/` on :4000, to check the preview before pushing |
| `npm run photos` | Import a directory of photographs into the gallery |
| `npm run collage` | Import a directory of cut-outs for the home page collage |
| `npm run collage:save` | Write the current collage arrangement back to `content/` |
| `npm run payload` | Payload's own CLI |

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

### The first run, in order

```bash
npm ci
npm run build
npm run migrate                 # creates the schema — see below
npm run seed                    # first deploy only; creates the owner + starter content
npm start
```

**`npm run migrate` is not optional, and it is the step that is easy to miss.**
In development the SQLite adapter pushes schema changes straight into the file, so
nothing ever asks you to think about migrations. In production that is off —
`push: false` — and a database nobody has migrated has no tables at all. The
symptom is not a helpful error at startup; it is the site coming up and then
answering `500` with `SQLITE_ERROR: no such table: site_settings` on the first
request. Mounting an empty persistent volume is not enough on its own.

Migrations live in `src/migrations/` and are committed. **After any change to a
collection, a global or a field, generate one and commit it with the change:**

```bash
npm run migrate:create some_name_for_it
npm run migrate:status          # what has and has not been applied
```

### Environment

`PAYLOAD_SECRET` and `PREVIEW_SECRET` have no fallback in production — see
[.env.example](./.env.example), which says which one stops the process and which
one only breaks the Preview button.

**`PAYLOAD_SECRET` cannot be rotated casually.** It signs admin sessions *and* the
cookie that unlocks the private half of `/about`, so changing it signs everyone out
and invalidates every access code already in someone's hands.

### Database

SQLite by default (`data/site.db`) — fine on a VPS or in Docker **with a persistent
volume**. On a serverless host, point `DATABASE_URI` at a hosted libSQL/Turso database
and set `DATABASE_AUTH_TOKEN`. No code change. Back up by copying the file.

### Media

Local disk is development only — uploads written next to the app do not survive a
redeploy on most hosts. Setting `S3_BUCKET`, `S3_ACCESS_KEY_ID` and
`S3_SECRET_ACCESS_KEY` moves every upload to S3-compatible object storage (Cloudflare
R2, Backblaze B2, AWS S3); `S3_ENDPOINT`, `S3_REGION` and `S3_PUBLIC_URL` are covered
in `.env.example`, including which of them the storage plugin never sees. No code
change either way — uploads are addressed through Payload, never by path.

### Behind a reverse proxy

**The proxy must set `x-forwarded-for` itself, replacing whatever the client sent.**
The unlock endpoint rate-limits on that header. A proxy that passes the client's own
value through lets the limit be sidestepped; a proxy that sets nothing at all puts
every visitor in one bucket, where three wrong codes from anyone locks out everyone
for a minute. There is a server-wide ceiling behind the per-address one either way,
so this is not the only thing standing there — but it is the one that is supposed to
work.

TLS and the http → https redirect belong to the proxy. The app sends HSTS itself; see
`headers()` in [next.config.ts](./next.config.ts) and check the `includeSubDomains` on
it suits the domain before going live.

### Publishing

Pressing Publish writes the change and revalidates the affected paths. Every route is
currently rendered per request, so an edit is visible immediately regardless — the
revalidation is there for when that stops being true. No build, no deploy, no commit.

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

**<https://demov1.euan.im>** — a custom domain at its own root, which is why
`BASE_PATH` is empty in the workflow and `PAGES_CNAME` is set. The bare project URL,
`meowfl0wer.github.io/personal-site`, redirects here.

Pages has to be enabled once before the workflow can deploy — the workflow token is not
allowed to create the site itself, whatever `permissions` says. Already done for this repo;
a fork needs `Settings → Pages → Source: GitHub Actions`, or:

```bash
gh api repos/OWNER/REPO/pages -X POST -f build_type=workflow
```

To go back to the bare project URL, set `BASE_PATH: '/personal-site'` and
`PAGES_CNAME: ''` in the workflow. Those two change **together**. A CNAME published for a
name that does not resolve takes the preview offline, and a base path left set would
prefix every URL on a domain that has no such directory.

**"Enforce HTTPS" in the Pages settings is greyed out, and that is expected.** The
domain resolves to Cloudflare, not to GitHub, so GitHub cannot validate it and cannot
issue a certificate for it. Visitors still get TLS — Cloudflare's, valid for
`*.euan.im`. What that arrangement does not give you is the http → https redirect;
that switch is *Always Use HTTPS*, in Cloudflare, not here. Turning GitHub's own
enforcement back on would mean pointing the record at GitHub directly, which is a
choice about who serves the preview, not a checkbox.

---

## The demonstration, and what is only in it

<https://demov1.euan.im> is a **demonstration**. It is the same application as
the real site, built as a folder of static files with no database and no server
behind it, and two things behave differently there. Both are switched by one
Site Settings checkbox — **Demo mode** — which `scripts/build-static.mjs` turns
on in the throwaway database it builds the preview from. It is off everywhere
else, including on a fresh install.

| | Demonstration | Real site |
| --- | --- | --- |
| The notice on arrival, and at the foot of the home page | shown | never rendered |
| The private half of /about | shown, with a switch that covers it | withheld — the words are not sent |
| The name beside Euan | `[Real name]` | whatever is typed into /admin |
| Access codes | one demo code, checked in the browser | issued and revoked in the admin, checked on the server |

**The two are not the same mechanism, and the difference is the point.** On the
real site a visitor without a grant never receives the private words at all —
there is nothing in the page to uncover. On the demonstration everything is in
the page and a blur is laid over it, because a folder of static files has no
server to withhold anything and nothing there is worth withholding: the writing
is invented and the name is a placeholder.

So: the demonstration shows you what the feature looks like. It is not the
feature. Anyone reading this code to borrow the privacy work wants
`src/lib/unlocked.ts`, `src/lib/access.ts` and `getResume` in `src/lib/cms.ts`
— not the demo switch.

The demo-only pieces are `src/components/layout/DemoNotice.tsx`,
`src/components/resume/DemoSwitch.tsx`, `src/components/resume/DemoLock.tsx`,
and the block marked `THE DEMONSTRATION'S PRIVACY SWITCH` in
`src/app/globals.css`. They ship in the bundle but render nothing with the
checkbox off.

---

## Licence

Two licences, because there are two different things here.

**The code is MIT** — see [LICENSE](./LICENSE). Take it, change it, build your own
site on it, ship it commercially. The only condition the licence imposes is the usual
one: keep the copyright notice with the source.

**The photographs are not licensed at all** — see [LICENSE-MEDIA](./LICENSE-MEDIA).
Every picture in `public/placeholder/` was taken and made by hand, and the cut-outs on
the home page are of a real person. They are in the repository because the code will
not run without images, not because they are being given away. That includes using
them as placeholders, and includes training data.

If you fork this, **replace the pictures before you deploy**. There is a script for
exactly that:

```bash
npm run photos -- "/path/to/your/own/photographs"
npm run collage -- "/path/to/your/own/cut-outs"
npm run seed -- --force
```

**A link back is asked for, not demanded.** If this site is running somewhere because
of this repository, a credit in the footer pointing at
[github.com/MeowFl0wer/personal-site](https://github.com/MeowFl0wer/personal-site)
would be appreciated. MIT does not make that a condition and this README does not
either — a licence that demanded a visible credit would stop being MIT, and people
avoid licences they have to read carefully. It is a request, and most people honour
requests.

Want to use a photograph anyway? Open an issue. The answer is often yes.
