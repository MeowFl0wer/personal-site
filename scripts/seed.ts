/**
 * Seeds the database from the placeholder content in /content.
 *
 *   npm run seed
 *
 * This is what turns /content from "the runtime source of the site" into
 * "starter data" — after seeding, every one of these values is editable at
 * /admin and nothing reads these files at request time again.
 *
 * Safe to re-run: it clears the collections it owns first. It will NOT delete
 * your owner account, and it refuses to touch a database that already has real
 * content unless you pass --force.
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

// A standalone script does not get Next's env loading, so do it here before
// anything imports the Payload config and reads DATABASE_URI / PAYLOAD_SECRET.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local — fall back to whatever is already in the environment.
}

import { getPayload } from "payload";
import config from "../src/payload.config";
import type { Life as LifeDoc } from "../src/payload-types";

import { profile, socials } from "../content/profile";
import { projects } from "../content/projects";
import { life } from "../content/life";
import { gallery } from "../content/gallery";
import { builtTools, usedTools } from "../content/tools";
import { resume } from "../content/resume";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(dirname, "..", "public");

const force = process.argv.includes("--force");

/** Rich text needs Lexical's shape; this is the minimum valid document. */
const richText = (paragraphs: string[]) => ({
  root: {
    type: "root" as const,
    format: "" as const,
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: paragraphs.map((text) => ({
      type: "paragraph" as const,
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      textFormat: 0,
      children: [
        {
          type: "text" as const,
          detail: 0,
          format: 0,
          mode: "normal" as const,
          style: "",
          text,
          version: 1,
        },
      ],
    })),
  },
});

const lines = (values: string[]) => values.map((text) => ({ text }));

const run = async () => {
  const payload = await getPayload({ config });

  /* ---- guard ----------------------------------------------------------- */
  const existing = await payload.count({ collection: "projects", overrideAccess: true });
  if (existing.totalDocs > 0 && !force) {
    console.log(
      `\nThere are already ${existing.totalDocs} projects in the database.\n` +
        `Seeding would delete them. Re-run with --force if that is what you want.\n`,
    );
    process.exit(0);
  }

  /* ---- owner ----------------------------------------------------------- */
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;

  const users = await payload.count({ collection: "users", overrideAccess: true });
  if (users.totalDocs === 0) {
    if (!email || !password) {
      console.error("Set SEED_EMAIL and SEED_PASSWORD in .env.local before seeding.");
      process.exit(1);
    }
    await payload.create({
      collection: "users",
      data: { email, password, name: profile.name },
      overrideAccess: true,
    });
    console.log(`Created owner account: ${email}`);
  } else {
    console.log("Owner account already exists — leaving it alone.");
  }

  /* ---- clear ----------------------------------------------------------- */
  for (const collection of ["projects", "life", "gallery", "built-tools", "used-tools", "posts", "media"] as const) {
    await payload.delete({ collection, where: { id: { exists: true } }, overrideAccess: true });
  }
  console.log("Cleared content collections.");

  /* ---- media ----------------------------------------------------------- */
  // Every placeholder JPG becomes a Media row, so the library is populated and
  // pages reference uploads rather than hard-coded /public paths.
  const mediaBySrc = new Map<string, number>();

  const upload = async (src: string, alt: string) => {
    if (mediaBySrc.has(src)) return mediaBySrc.get(src)!;

    const filePath = path.join(publicDir, src.replace(/^\//, ""));
    if (!fs.existsSync(filePath)) {
      console.warn(`  missing file, skipping: ${src}`);
      return undefined;
    }

    const doc = await payload.create({
      collection: "media",
      data: { alt },
      filePath,
      overrideAccess: true,
    });

    mediaBySrc.set(src, doc.id);
    return doc.id;
  };

  /** For fields the schema marks required — fail loudly rather than half-seed. */
  const uploadRequired = async (src: string, alt: string) => {
    const id = await upload(src, alt);
    if (id === undefined) {
      throw new Error(
        `Required media is missing: ${src}\nRun \`npm run placeholders\` first, or point the content file at a file that exists.`,
      );
    }
    return id;
  };

  console.log("Uploading placeholder media…");

  /* ---- globals --------------------------------------------------------- */
  await payload.updateGlobal({
    slug: "site-settings",
    overrideAccess: true,
    data: {
      siteName: profile.shortName,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      email: profile.email,
      accentColor: "clay",
      seoTitle: profile.seo.title,
      seoDescription: profile.seo.description,
      blogEnabled: false,
      cursorEnabled: true,
      webglGallery: true,
      navigation: [
        { route: "/work", label: "Work", visible: true },
        { route: "/life", label: "Life", visible: true },
        { route: "/blog", label: "Writing", visible: true },
        { route: "/tools", label: "Tools", visible: true },
        { route: "/resume", label: "Resume", visible: true },
      ],
      socials: socials.map((social) => ({
        label: social.label,
        href: social.href,
        handle: social.handle,
      })),
    },
  });

  await payload.updateGlobal({
    slug: "home",
    overrideAccess: true,
    data: {
      name: profile.name,
      shortName: profile.shortName,
      roles: profile.roles,
      basedIn: profile.basedIn,
      currently: profile.currently,
      year: profile.year,
      interests: profile.interests,
      greeting: profile.greeting,
      headline: lines(profile.headline),
      intro: lines(profile.intro),
      signOff: lines(profile.signOff),
      sections: [
        { block: "hero", visible: true, motion: "default" },
        { block: "about", visible: true, motion: "default", label: "About" },
        { block: "work", visible: true, motion: "default", label: "Selected Work" },
        { block: "life", visible: true, motion: "subtle", label: "Away from the screen" },
        { block: "tools", visible: true, motion: "subtle", label: "Tools" },
        { block: "elsewhere", visible: true, motion: "default", label: "Elsewhere" },
      ],
      _status: "published",
    },
  });

  await payload.updateGlobal({
    slug: "resume",
    overrideAccess: true,
    data: {
      title: resume.title,
      profile: lines(resume.profile),
      printNote: resume.printNote,
      experience: resume.experience.map((entry) => {
        const [start, end] = entry.period.split("—").map((part) => part.trim());
        return {
          organisation: entry.organisation,
          role: entry.role,
          location: entry.location,
          start,
          end: end === "Now" ? undefined : end,
          current: end === "Now",
          body: lines(entry.body),
          highlights: lines(entry.highlights ?? []),
        };
      }),
      education: resume.education.map((entry) => {
        const [start, end] = entry.period.split("—").map((part) => part.trim());
        return {
          organisation: entry.organisation,
          role: entry.role,
          location: entry.location,
          start,
          end,
          current: false,
          body: lines(entry.body),
          highlights: [],
        };
      }),
      projects: resume.projects,
      skills: resume.skills,
      contact: resume.contact.map((link) => ({
        label: link.label,
        href: link.href,
        external: link.external ?? false,
      })),
      _status: "published",
    },
  });

  console.log("Seeded globals.");

  /* ---- work ------------------------------------------------------------ */
  for (const project of projects) {
    const cover = await uploadRequired(project.cover.src, project.cover.alt);

    // The old MDX-style sections become Heading + Text block pairs, so the
    // case study arrives already editable rather than as one opaque blob.
    const layout = project.sections.flatMap((section) => [
      {
        blockType: "heading" as const,
        text: section.heading,
        level: "h2" as const,
        width: "normal" as const,
        spacing: "small" as const,
      },
      {
        blockType: "text" as const,
        body: richText(section.body),
        width: "normal" as const,
        spacing: "large" as const,
      },
    ]);

    const galleryBlocks = [];
    for (const shot of project.gallery) {
      const id = await upload(shot.src, shot.alt);
      if (id) {
        galleryBlocks.push({
          blockType: "wideImage" as const,
          image: id,
          width: "wide" as const,
          spacing: "large" as const,
          parallax: true,
        });
      }
    }

    await payload.create({
      collection: "projects",
      overrideAccess: true,
      draft: false,
      data: {
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        year: project.year,
        discipline: project.discipline,
        role: project.role,
        stack: project.stack,
        projectUrl: project.link?.href,
        featured: project.featured,
        cover,
        layout: [...layout, ...galleryBlocks],
        _status: "published",
      },
    });
  }
  console.log(`Seeded ${projects.length} projects.`);

  /* ---- life ------------------------------------------------------------ */
  const CATEGORY: Record<string, "hiking" | "travel" | "photography"> = {
    Outdoors: "hiking",
    Travel: "travel",
    Photography: "photography",
  };

  for (const note of life.notes) {
    const cover = note.media[0] ? await upload(note.media[0].src, note.media[0].alt) : undefined;

    // Typed against the generated schema, so a block field renamed in
    // src/payload/blocks fails the build here rather than at runtime.
    const layout: NonNullable<LifeDoc["layout"]> = [];

    if (note.body) {
      layout.push({
        blockType: "text",
        body: richText([note.body]),
        width: "normal",
        spacing: "large",
      });
    }

    if (note.facts.length > 0) {
      layout.push({
        blockType: "stats",
        items: note.facts,
        width: "normal",
        spacing: "large",
      });
    }

    // A pair when there are two spare images, single wide images otherwise.
    const rest = note.media.slice(1);
    if (rest.length >= 2) {
      const left = await upload(rest[0].src, rest[0].alt);
      const right = await upload(rest[1].src, rest[1].alt);
      if (left && right) {
        layout.push({
          blockType: "photoPair",
          left,
          right,
          ratio: "50-50",
          offset: true,
          width: "wide",
          spacing: "large",
        });
      }
    } else if (rest.length === 1) {
      const id = await upload(rest[0].src, rest[0].alt);
      if (id) {
        layout.push({
          blockType: "wideImage",
          image: id,
          width: "wide",
          spacing: "large",
          parallax: true,
        });
      }
    }

    await payload.create({
      collection: "life",
      overrideAccess: true,
      draft: false,
      data: {
        title: note.title,
        slug: note.id,
        category: CATEGORY[note.category] ?? "other",
        place: note.place,
        date: note.date,
        description: note.body,
        cover,
        distance: note.facts.find((fact) => fact.label === "Distance")?.value,
        elevation: note.facts.find((fact) => fact.label === "Ascent")?.value,
        duration: note.facts.find((fact) => fact.label === "Time")?.value,
        preset: "editorial",
        theme: "light",
        layout,
        _status: "published",
      },
    });
  }
  console.log(`Seeded ${life.notes.length} life stories.`);

  /* ---- gallery --------------------------------------------------------- */
  for (const photo of gallery) {
    const image = await upload(photo.src, photo.alt);
    if (!image) continue;

    await payload.create({
      collection: "gallery",
      overrideAccess: true,
      data: {
        image,
        place: photo.place,
        date: photo.date,
        caption: photo.caption,
      },
    });
  }
  console.log(`Seeded ${gallery.length} gallery photographs.`);

  /* ---- tools ----------------------------------------------------------- */
  for (const tool of builtTools) {
    const screenshot = tool.preview ? await upload(tool.preview.src, tool.preview.alt) : undefined;

    await payload.create({
      collection: "built-tools",
      overrideAccess: true,
      data: {
        name: tool.name,
        description: tool.description,
        stack: tool.stack,
        github: tool.links.find((link) => link.label === "GitHub")?.href,
        website: tool.links.find((link) => link.label === "Demo")?.href,
        screenshot,
      },
    });
  }

  const CATEGORY_KEYS: Record<string, "development" | "design" | "hardware" | "other"> = {
    Development: "development",
    Design: "design",
    Hardware: "hardware",
    Elsewhere: "other",
  };

  for (const group of usedTools) {
    for (const item of group.items) {
      await payload.create({
        collection: "used-tools",
        overrideAccess: true,
        data: {
          name: item.name,
          note: item.note,
          category: CATEGORY_KEYS[group.category] ?? "other",
        },
      });
    }
  }
  console.log("Seeded tools.");

  /* ---- blog ------------------------------------------------------------ */
  await payload.create({
    collection: "posts",
    overrideAccess: true,
    draft: false,
    data: {
      title: "On restraint",
      slug: "on-restraint",
      description:
        "Why the most interesting websites are usually the quietest ones until you touch them.",
      category: "Notes",
      tags: ["design", "motion"],
      publishedAt: new Date("2026-06-14").toISOString(),
      layout: [
        {
          blockType: "text",
          body: richText([
            "There is a particular kind of website that announces itself. Everything moves, every section has its own idea about what a page is, and by the third scroll you have stopped reading and started waiting.",
            "The alternative is not a boring page. It is a page that holds still until you do something.",
          ]),
          width: "normal",
          spacing: "large",
        },
        {
          blockType: "heading",
          text: "Static is a design problem",
          level: "h2",
          width: "normal",
          spacing: "small",
        },
        {
          blockType: "text",
          body: richText([
            "The test I keep coming back to is simple: turn every animation off and look at what is left. If the page is only good in motion, the motion is doing work the design should have done.",
          ]),
          width: "normal",
          spacing: "large",
        },
      ],
      _status: "published",
    },
  });
  console.log("Seeded 1 blog post.");

  console.log("\nDone. Start the site with `npm run dev` and sign in at /admin.\n");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
