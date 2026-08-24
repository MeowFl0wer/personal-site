# Admin Guide

Everything you need to run this site without opening a code editor.

If you have forgotten how any of this works, **start here and stay here** — you should
never need to read the source to publish something.

---

## The one rule

```
Git  →  design, animation, components, block types, schema
CMS  →  words, projects, photos, order, layout choices, publishing
```

If you find yourself editing a file to change a sentence, something has gone wrong.
If you find yourself wishing the admin had a colour picker, that is working as intended —
see [Why can't I…](#why-cant-i) at the bottom.

---

## 1. Getting in

Go to **`/admin`** — locally that is <http://localhost:3000/admin>.

Sign in with the email and password created by `npm run seed` (they came from
`SEED_EMAIL` / `SEED_PASSWORD` in `.env.local`).

**Change the seeded password immediately**: click your avatar, top right → **Account** →
set a new password.

Forgot it? Click *Forgot password* on the sign-in screen. In development the reset email
is printed to the terminal rather than sent.

---

## 2. The layout of the admin

The left sidebar has three groups:

```
Site        Users, Settings
Media       Media
Content     Work, Life, Gallery, Tools — Built, Tools — Use, Blog, Home, Resume
```

**Collections** (Work, Life, Gallery, Tools, Blog) hold many items — you add and delete
rows. **Globals** (Home, Resume, Settings) are single documents you edit in place.

The **Dashboard** shows how much of everything there is and what you touched last.

---

## 3. Editing the home page

**Content → Home.** Four tabs:

| Tab | What's in it |
| --- | --- |
| **Identity** | Your name, roles, where you are, what you're doing now, interests |
| **Hero** | The greeting and the big headline lines |
| **Intro** | The large paragraphs under the hero, and the footer sign-off |
| **Sections** | The order of the home page |

### Changing "Hi, I'm …"

**Hero** tab → **Greeting**. Type whatever you like; emoji are fine.

Below it, **Headline** is a list of lines, each rendered on its own line at the largest
size on the site:

```
Developer,
builder,
traveler,
and occasional
photographer.
```

Add, remove, or drag lines with the handles on the left.

> **Keep each line under about 15 characters.** The hero type is enormous; longer lines
> wrap awkwardly on a laptop. This is the one place where the length of what you type
> actually matters.

### Reordering the home page

**Sections** tab. Drag the rows. Each row is one of the six designed home sections:

```
☰ 01 — Hero
☰ 02 — About
☰ 03 — Selected Work
☰ 04 — Life Preview
☰ 05 — Tools Preview
☰ 06 — Resume / Contact
```

- **Drag** to reorder. The `01 / 02 / 03` labels on the live page renumber automatically.
- **Visible** — uncheck to hide a section without deleting it.
- **Motion** — `Default`, `Subtle`, or `None` for that section.
- **Label** — overrides the small mono heading (e.g. `AWAY FROM THE SCREEN`).

Hero can be moved but not meaningfully removed: if it is missing the page puts it back at
the top.

Then press **Publish changes**.

---

## 4. Work

**Content → Work.** Each project has three tabs.

### Creating a project

1. **Create New**.
2. **Overview**: Title, Summary (one line — it appears in the index), Year, Discipline
   (`Web / AI`), Role, Stack, links. The **Slug** in the right sidebar fills itself in
   from the title.
3. **Media**: a **Cover** (required) and optionally a **Preview Video** — a short muted
   loop that plays when someone hovers the project in the index. Without one, the cover
   image is used.
4. **Case Study**: the body, built from blocks. See [§8](#8-blocks).
5. **Featured** (Overview tab) puts it on the home page. Keep that to three or four.
6. **Save Draft** → **Preview** → **Publish**.

Drag rows in the Work list to change the order of `/work`.

---

## 5. Life

**Content → Life.** This is the page with the most layout freedom.

### Creating a field note

1. **Create New**.
2. **Story** tab: Title, Category (Hiking / Travel / Photography / Outdoor / Personal),
   Place, Date (free text — `June 2026`), Description, Cover.
3. **Trail** tab — *optional*, for walks: Distance, Elevation, Duration, Difficulty,
   Trail name. Leave it empty for anything that is not a hike and none of it renders.
4. **Layout** tab:
   - **Preset** — a designed starting arrangement (Editorial, Field Note, Photo Essay,
     Travel Journal, Minimal).
   - **Theme** — Light or Dark. Dark moves the page onto the same near-black ground as
     the gallery. It does not introduce new colours.
   - **Blocks** — the body. See [§8](#8-blocks).
5. **Preview**, then **Publish**.

It appears at `/life/your-slug` and in the grouped index on `/life`.

---

## 6. Gallery

**Content → Gallery.** This is what the 3D ring on `/gallery` turns through.

### Adding photographs

1. **Create New** → **Image** → upload, or pick something already in the Media Library.
2. Fill in **Place** and **Date** (both required — they are the caption under the ring).
3. Optional: Title, Caption, Camera / Lens / Focal length, Tags, Featured.

Width, height, aspect ratio and file size are read from the file automatically, and the
web-sized versions are generated on upload. **Upload the full-resolution file** — visitors
never download it.

### Reordering

Drag rows in the Gallery list. **The ring reads this order directly.** There is nothing
else to change and no Three.js setting to touch — the scene is built from your sequence.

Changes are live as soon as you save; the gallery has no draft state.

---

## 7. Tools, Resume, Blog

### Tools

Two collections:

- **Tools — Built**: name, description, stack, website, GitHub, screenshot, video.
- **Tools — Use**: name, a one-line note, a category (Development / Design / Hardware /
  Photography / Elsewhere).

Drag to reorder in both. The categories become the column headings on `/tools`.

### Resume

**Content → Resume.** Five tabs: Profile, Experience, Education, Projects & Skills,
Contact.

To add a job: **Experience** tab → **Add Role** → Organisation, Role, Start, End (or tick
**Current**), Location, then Description paragraphs and Highlights. Drag rows to reorder —
newest first reads best.

> **The web page and the PDF are the same document.** `/resume` on screen and the
> **Print / Save PDF** button both render this one record. There is no second file to keep
> in sync, and there is nothing you can do here that makes them disagree.

To produce a PDF: open `/resume`, click **Print / Save PDF**, and choose *Save as PDF*.
The print stylesheet hides the navigation and footer and tightens the spacing to A4.

### Blog

**Content → Blog.** Fields: Title, Description, Category, Tags, Cover, Published At, and a
block-based Body.

- **Published At in the future** = scheduled. It stays off the site until that moment, but
  you can still preview it.
- The blog is **hidden by default**. To turn it on: **Site → Settings → Features →
  Blog Enabled**. "Writing" then appears in the navigation, in its reserved slot:
  `Work · Life · Writing · Tools · Resume`. No code change, no redeploy.

---

## 8. Blocks

Blocks are how you lay out a Work case study, a Life story or a blog post. Add, delete,
duplicate, drag to reorder, or collapse them. Every block has a **Layout** section
(collapsed by default) with the same controls.

### The layout controls

| Control | Options | What it does |
| --- | --- | --- |
| **Width** | Narrow · Normal · Wide · Full bleed | How much of the grid the block uses |
| **Align** | Left · Center · Right | Text alignment |
| **Spacing** | None · Small · Medium · Large · XL | Space *below* the block |
| **Theme** | Auto · Light · Dark | Auto follows the page; Light/Dark set this block's ground |
| **Motion** | None · Subtle · Default | How much it animates |
| **Visible** | on / off | Hide without deleting |

These are names, not numbers. What "Wide" or "Large" measures is decided by the design
system, so if the site's proportions are ever retuned, every page you have already built
retunes with them.

### The blocks

**Text**

| Block | Use it for |
| --- | --- |
| **Text** | Body prose. Bold, italic, links, lists, two heading levels. |
| **Heading** | A section heading inside the body. |
| **Large Statement** | One or more short lines at display size. The loudest thing you can place. |
| **Section Intro** | `01 / WORK` plus a large lead — the same opening every page uses. |
| **Pull Quote** | A quote with optional attribution. |
| **Stats** | A row of label/value figures (`Distance — 24 km`). |
| **Location Metadata** | Place, date and coordinates as mono figures. |

**Media**

| Block | Use it for |
| --- | --- |
| **Image** | A normal-width image. |
| **Wide Image** | Wider than the text column. |
| **Full Bleed Image** | Edge to edge. |
| **Photo Pair** | Two images side by side. Ratio: 50/50, 40/60, 60/40, 30/70. **Offset** staggers the second one. |
| **Image + Text** | Image one side, prose the other. Choose which side and the split. |
| **Video** | A video from the Media Library, with optional poster, autoplay, loop, controls. |
| **Gallery** | A grid of chosen gallery photographs, or the most recent ones. |

Image blocks also have **Fit** (Cover or Contain) and **Parallax** (gentle scroll drift,
automatically off when a visitor has asked for reduced motion).

**Interactive**

| Block | Use it for |
| --- | --- |
| **Project Preview** | A compact list of chosen projects, linked. |
| **Tool Preview** | A compact list of chosen built tools. |

There is deliberately no block that drops a WebGL scene into an arbitrary page. The heavy
interactive pieces each have one home — the hero, the work index, the gallery — and that
is what keeps them feeling like a signature rather than a habit.

---

## 9. Media

**Media → Media.** One library for the whole site.

- **Upload** — drag files in, or use the upload button. Images and video (mp4, webm, mov).
- **Alt text is required.** It is what a screen reader announces and what shows if the
  image fails. The site will not ship an image without it.
- **Reuse, don't re-upload.** Any image or upload field lets you choose an existing file.
  One file, one row, referenced from as many pages as you like.
- **Replacing a file** in place updates it everywhere it is used.
- **Deleting** — check what references it first. A deleted image leaves a gap.

Every upload is automatically resized to 400 / 800 / 1400 / 2000 / 2800px WebP versions,
and the page picks the right one for the screen. Upload the original.

---

## 10. Draft, Preview, Publish

Work, Life, Blog, Home and Resume all have drafts. Gallery and Tools do not — they are
small and structural, so a save is immediately live.

The flow:

```
Edit  →  Save Draft  →  Preview  →  Publish
```

- **Save Draft** stores your changes without touching the live site. Nothing a visitor
  sees changes until you publish.
- **Preview** (the ⧉ icon next to the publish button) opens the real page with your
  unpublished content, animations and all. It is the actual site, not a mock-up. A banner
  across the top says you are in preview; **Exit preview** returns you to the live version.
- **Live Preview** (the 👁 icon) shows the page side by side with the editor and updates as
  you type.
- **Publish changes** makes it live. The affected pages rebuild themselves within a few
  seconds — there is no deploy step, no `git push`, nothing to run.

### Undoing something

Open the item → **Versions** tab → pick a timestamp → **Restore**. Every save is kept (the
last 30 per item). If you rearrange a page and hate it, this is the way back.

---

## 11. Site settings

**Site → Settings.**

| Tab | Contains |
| --- | --- |
| **General** | Site name, URL, email, accent colour |
| **SEO** | Default title, description, share image |
| **Navigation** | Order, labels, visibility |
| **Social** | The links in the footer |
| **Features** | Blog Enabled, custom cursor, 3D gallery |

**Navigation** — drag to reorder, rename freely, uncheck to hide. The *URLs* are a fixed
list you pick from rather than type, so it is not possible to create a dead link.

**Accent colour** is a choice of five tones that were checked against the palette, not a
free colour picker.

---

## 12. Backup

Two things to copy. Both matter; neither is in Git.

**The database** — everything you have written.

```bash
cp data/site.db ~/backups/site-$(date +%F).db
```

Do this before anything drastic. Restoring is the reverse: stop the site, copy the file
back, start it.

**The media** — every image and video.

- *Local / single server:* copy the `media/` directory.
- *Object storage:* the files are in your S3/R2 bucket; use its own versioning or
  lifecycle backup.

A backup of one without the other is not a backup: the database holds the references, the
storage holds the files.

To wipe and start over from the placeholder content:

```bash
rm data/site.db && npm run seed
```

---

## 13. Why can't I…

Things that are missing on purpose, so you do not go looking:

| "Why can't I…" | Because |
| --- | --- |
| …pick any colour? | The palette is the design. One accent, from a checked list. |
| …change the font or type sizes? | The type scale is what makes every page look like the same site. |
| …set a margin of 73px? | Spacing is five named steps. Arbitrary values are how a design system dies. |
| …drag a box anywhere on the page? | This is a block editor, not a page builder. Blocks compose; the grid does not bend. |
| …set an animation duration? | The motion system decides timings so everything shares one physics. You choose *how much*: None, Subtle, Default. |
| …put the 3D gallery in the middle of a blog post? | One complex effect, one home. Reused a fourth time it stops reading as a signal and starts reading as a tic. |
| …edit a page's URL? | You can edit slugs on items. The five top-level routes are fixed so the nav can never point at nothing. |

If you genuinely need one of these, it is a code change — and it should be, because it is a
change to the design system rather than to the content.

---

## 14. If something breaks

| Symptom | Try |
| --- | --- |
| Published change not showing | Hard-reload. If it persists, re-save and publish again — the revalidation hook runs on publish. |
| Preview shows the old version | You may have left draft mode. Click **Exit preview**, then Preview again. |
| Image looks wrong or is missing | Check it still exists in Media. Re-upload and re-select if it was deleted. |
| Locked out after failed logins | Payload locks the account for 10 minutes after 8 attempts. Wait, or use *Forgot password*. |
| Admin won't load after a code update | `npm run generate:importmap && npm run generate:types`, then restart. |
| Everything is broken | Restore `data/site.db` from a backup. |
