# REFERENCES

Open-source research log for this site. Every non-trivial interaction was checked against
existing GitHub / OSS implementations **before** being written.

Legend for **Usage**:

- `DEPENDENCY` — installed and used as a library, unmodified.
- `ADAPTED` — code/technique read, then rewritten for this codebase (license permits reuse).
- `REFERENCE` — only the interaction idea / information architecture was studied. No code copied.

---

## 0. CMS / Admin — the decision

The brief for `/admin` was explicit: research mature open source first, and do not
hand-roll authentication, a media library, a rich text editor, a draft system, CRUD or
file uploads.

**Chosen: [Payload CMS](https://github.com/payloadcms/payload) 3.88, MIT.**

| Candidate | URL | License | Verdict |
| --- | --- | --- | --- |
| **Payload 3** | https://github.com/payloadcms/payload | MIT | **Chosen.** See below. |
| Directus | https://github.com/directus/directus | BSL 1.1 (converts to GPL after 3 yrs) | Rejected. A **separate service** — a second app, second deploy, second thing to keep running for a personal site. Its admin cannot live at `yourname.com/admin`. Its licence is also no longer OSI-approved. |
| Strapi | https://github.com/strapi/strapi | MIT (core) | Rejected. Also a separate service, and its content modelling is GUI-first: the schema lives in a database rather than in code, so a block type could not be reviewed in a pull request alongside the component that renders it. Its plugin ecosystem is its strength, and we need none of it. |
| TinaCMS | https://github.com/tinacms/tinacms | Apache-2.0 | Rejected on the brief's own terms. Tina is git-backed: publishing writes a commit and triggers a redeploy. §37 says content publishing must not require `git commit` / `git push`, and §39 asks for a real database. |
| Sanity / Contentful | — | Proprietary SaaS | Rejected. Not self-hosted, not open source, and content ends up somewhere I do not control. |

**Why Payload wins for this project, point by point against the brief:**

| Requirement | How Payload covers it |
| --- | --- |
| `/admin` on the same site | Payload 3 mounts *inside* the Next app as a route group. There is one server, one deploy, one domain. `/admin` and `/` are separate route groups with separate root layouts, so the editor's JS never reaches a visitor (§26). |
| Constrained block editor, not a page builder (§6) | The `blocks` field type is exactly this: a drag-to-reorder list of *named, code-defined* block types. An editor can only insert blocks that exist in `src/payload/blocks/` and only set the fields those blocks declare. |
| Layout presets, no raw CSS (§9, §32) | Every layout control is a `select` of named options. `src/components/blocks/presets.ts` is the only place a name becomes a measurement. There is no field anywhere that accepts a colour, font, margin, duration or easing. |
| Draft → Preview → Publish (§22, §23) | `versions: { drafts: true }` plus Next draft mode. Preview renders the **real** frontend, animations included — there is no second preview renderer to drift. |
| Version history + restore (§24) | Built in. `maxPerDoc: 30` keeps a rolling window; the Versions tab restores any of them. Nothing git-like was written by hand. |
| Media library, image processing (§14, §16, §17) | One `media` collection with sharp-generated derivatives (400 → 2800px, WebP). Uploaded once, referenced everywhere. |
| Owner auth, no RBAC theatre (§25) | Payload's built-in auth on a single `users` collection: hashing, sessions, lockout, reset. `src/payload/access.ts` is 3 rules and ~20 lines. |
| Drag ordering (§15, §18, §19) | `orderable: true` on collections; arrays and blocks are drag-sortable by default. |
| Database (§27) | SQLite via libSQL/Drizzle — one file, back it up by copying it, fully type-safe. The same adapter takes a hosted Turso URL for serverless production. |
| Publish updates production (§37) | `afterChange` hooks call `revalidatePath`. Saving a draft revalidates nothing; publishing does. |
| Typed end to end | `payload generate:types` emits `src/payload-types.ts`, so a renamed field breaks the build rather than the page. |

**What was deliberately still written by hand, and why:** the block *renderers*
(`src/components/blocks/`), the layout preset mapping, and the frontend content layer
(`src/lib/cms.ts`). These are the design system, and the whole architecture depends on
them staying in Git rather than in the database.

**Known issue:** `npm audit` reports moderate advisories in `drizzle-kit`'s transitive
`esbuild` dev-server dependency, via `@payloadcms/db-sqlite`. It affects a local dev
tool, not the runtime, and there is no fixed version available upstream yet.

---

## 1. Runtime dependencies

| Project | URL | License | What we use it for | Usage |
| --- | --- | --- | --- | --- |
| **Lenis** (darkroomengineering) | https://github.com/darkroomengineering/lenis | MIT | Smooth scroll + the single global scroll-velocity source (`lenis/react` → `ReactLenis`, `useLenis`) | DEPENDENCY |
| **GSAP** (GreenSock) | https://github.com/greensock/GSAP | GreenSock Standard "No Charge" License — free incl. commercial since Apr 2025 (Webflow) | All timeline animation: `ScrollTrigger`, `Observer`, `Flip`, `quickTo` | DEPENDENCY |
| **@gsap/react** | https://github.com/greensock/react | Same as GSAP | `useGSAP()` — React 19 / StrictMode-safe animation scoping + auto-cleanup | DEPENDENCY |
| **three.js** | https://github.com/mrdoob/three.js | MIT | WebGL runtime for `/gallery` only | DEPENDENCY |
| **@react-three/fiber** | https://github.com/pmndrs/react-three-fiber | MIT | React renderer for three.js (R3F v9 = React 19 compatible) | DEPENDENCY |
| **@react-three/drei** | https://github.com/pmndrs/drei | MIT | `useTexture`, `Preload` helpers in the ring gallery | DEPENDENCY |
| **geist** (Vercel) | https://github.com/vercel/geist-font | SIL OFL 1.1 | Geist Sans + Geist Mono, self-hosted via `next/font` | DEPENDENCY |
| **payload** + **@payloadcms/next** | https://github.com/payloadcms/payload | MIT | The CMS and the `/admin` panel. See section 0. | DEPENDENCY |
| **@payloadcms/db-sqlite** | https://github.com/payloadcms/payload | MIT | Database adapter (libSQL + Drizzle) | DEPENDENCY |
| **@payloadcms/richtext-lexical** | https://github.com/payloadcms/payload | MIT | Rich text editing and its JSX renderer | DEPENDENCY |
| **@payloadcms/storage-s3** | https://github.com/payloadcms/payload | MIT | Production media on S3-compatible object storage | DEPENDENCY |

> **Removed in the CMS migration:** `gray-matter` and `next-mdx-remote`. Blog posts are
> blocks in the database now, so there is no MDX file to parse and no second content
> pipeline to maintain.

> **On GSAP's license:** GSAP is not MIT, but since April 2025 the *Standard "No Charge" License*
> (https://gsap.com/standard-license) covers commercial use of every plugin at no cost, including
> ScrollTrigger, Observer and Flip. The only thing it forbids is reselling GSAP itself. That is
> compatible with a personal site. If that ever becomes a problem, `ScrollVelocityProvider`,
> `Reveal` and `ProximityField` are the only hard couplings and each is <150 lines.

---

## 2. Techniques studied, then re-implemented

| Source | URL | License | Idea taken | Usage |
| --- | --- | --- | --- | --- |
| GreenSock — "Skew on scroll using scroll velocity" | https://codepen.io/GreenSock/pen/eYpGLYL | GreenSock demo (free to use/modify) | `getVelocity()` → clamp → skew/scale, then ease back to 0 on `scrollEnd`. Our `ScrollVelocityProvider` takes velocity from **Lenis** instead of ScrollTrigger so there is exactly one velocity source for the whole site. | ADAPTED |
| Codrops — "Creating Wavy Infinite Carousels in R3F with GLSL Shaders" | https://tympanus.net/codrops/2025/11/26/creating-wavy-infinite-carousels-in-react-three-fiber-with-glsl-shaders/ | Codrops demos: MIT-style, attribution appreciated | The `mod()` wrap trick for an infinite carousel — when a plane passes the end of the range its offset is recomputed so it re-enters seamlessly. Our `RingGallery` applies the same wrap to an **angular** (cylindrical) range instead of a linear one, and does it on the CPU per-frame — no shader in v1. | ADAPTED (technique only, no code copied) |
| Codrops — "Building an Infinite GSAP Scroll Gallery with Parallax and Flip Transitions" | https://tympanus.net/codrops/2026/07/30/building-an-infinite-gsap-scroll-gallery-with-parallax-and-flip-transitions/ | Codrops demos: MIT-style | The FLIP-to-fullscreen pattern: capture the thumbnail rect, mount a fullscreen node, `Flip.from()` between them. We project the 3D ring plane to screen space to get the "thumbnail" rect, then FLIP a DOM node. | ADAPTED |
| Halo-Lab / **magnetic-hover** | https://github.com/Halo-Lab/magnetic-hover | MIT | Proximity model: radius → normalized falloff → transform. Not installed: it is a non-React, ~1 kB DOM utility and we need per-character GSAP `quickTo` setters plus reduced-motion handling. `ProximityField` re-implements the falloff (`1 - d/r`, eased) in ~120 lines. | REFERENCE |
| ToonRombaut / **magnetic-elements** | https://github.com/ToonRombaut/magnetic-elements | MIT | Same class of effect; confirmed the repulsion-vs-attraction sign convention and damping ranges. | REFERENCE |
| jmarellanes / gsap custom cursor | https://github.com/jmarellanes/gsap__change-cursor-hover--01 | MIT | Frame-rate-independent damped cursor follow via `gsap.quickTo` rather than a manual rAF lerp. | REFERENCE |
| scriptex / **react-round-carousel** | https://github.com/scriptex/react-round-carousel | MIT | Evaluated as an off-the-shelf 3D ring. **Rejected**: it is a CSS-3D-transform DOM carousel, not WebGL, with no scroll-velocity/inertia model and no path to a Flip-to-fullscreen transition. Keeping it would have meant fighting it. | REFERENCE (rejected) |
| pmndrs — R3F infinite scroll carousel discussion #3013 | https://github.com/pmndrs/react-three-fiber/discussions/3013 | — | Latency findings: drive rotation from a ref inside `useFrame`, never from React state. Our ring gallery holds all motion state in refs; React re-renders only on focus change. | REFERENCE |
| BRKalow / react-flip-toolkit | https://github.com/BRKalow/react-flip-toolkit | MIT | Considered for the gallery expand. **Rejected**: GSAP Flip is already in the bundle; adding a second FLIP engine is dead weight. | REFERENCE (rejected) |

---

## 3. Information-architecture / UX references

Studied for content hierarchy only. No design system, component code or visual language copied.

| Project | URL | License | What was studied |
| --- | --- | --- | --- |
| **Simple Portfolio** (ImBIOS / and similar forks) | https://github.com/ImBIOS/simple-portfolio · https://simple-portfolio.vicbox.dev | MIT | Two things. The `/about` masthead — portrait, name, role line and accounts as one opening unit rather than a page banner. And the record beneath it: Profile → Experience → Education → Projects → Skills → Contact, and how much whitespace a formal page can carry. We did **not** take its card visuals or its avatar chrome. |
| **Magic Portfolio** (once-ui-system) | https://github.com/once-ui-system/magic-portfolio · https://demo.magic-portfolio.com/about | MIT | The `/about` arrangement: standing facts (based in, currently) as a short labelled column beside the portrait, with the introduction set large next to it — so the page reads as a person before it reads as a résumé. Also blog + gallery content organisation and the project→post rhythm. We did **not** adopt Once UI, its sticky table of contents, or its timeline chrome. |
| **Astro Resume** (srleom) | https://github.com/srleom/astro-resume | MIT | The "Tools / Uses" page split — grouped plain lists with tiny labels instead of logo grids. |
| **developerFolio** (saadpasta) | https://github.com/saadpasta/developerFolio | MIT | Only the tone of the opening line — `Hi, I'm ... 👋`. Explicitly **not** taken: illustrations, tech-logo walls, its visual style. |

---

## 4. Deliberately not used

- **ScrollSmoother** — Lenis already owns scrolling; two smooth-scroll engines fight each other.
- **CSS `scroll-snap`** — conflicts with Lenis' virtual scroll. Soft snap is done with GSAP
  `ScrollToPlugin` driven off Lenis' own `scrollend`-equivalent, so there is one authority on scroll.
- **Any UI component library** (shadcn/ui, Radix, MUI) — the *public site* is typography,
  rules and media. A component kit would push it toward the SaaS look the brief rules out.
  (The admin panel is Payload's own UI, which is fine: nobody but me ever sees it.)
- **A second ORM on top of Payload** — Payload's collections *are* the schema and the
  query layer. Wrapping them in Drizzle or Prisma by hand would mean two definitions of
  every field and no type safety between them.
- **A free-form page builder** — see §6 of the brief. Blocks compose; the design system
  does not bend.
