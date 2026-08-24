# Personal site

A personal digital space — work, life, photography, tools, resume, writing — with a real
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
    globals/            Home, Resume, SiteSettings
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

`/resume` prints to a clean A4 from the same DOM the screen uses — one data source, two
outputs.

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
