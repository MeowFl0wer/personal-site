import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import type {
  Media as MediaDoc,
  Home as HomeDoc,
  Resume as ResumeDoc,
  SiteSetting,
  Project as ProjectDoc,
  Life as LifeDoc,
  Gallery as GalleryDoc,
  BuiltTool as BuiltToolDoc,
  UsedTool as UsedToolDoc,
  Post as PostDoc,
} from "@/payload-types";
import type { Media, NavItem, Photo, Social } from "@content/types";

/**
 * THE CONTENT LAYER — the seam between the CMS and the design system.
 *
 * Components never see a Payload document. They see the same plain shapes they
 * always did (`Media`, `Photo`, `NavItem`…), and this file is the only place
 * that knows how a Payload row becomes one. That means:
 *
 *   - the CMS schema can change without touching a component,
 *   - a component can be read without knowing anything about Payload,
 *   - and if Payload were ever replaced, this file is the whole migration.
 *
 * Everything here is a React `cache()`d server function, so a page that asks for
 * site settings in four places still performs one query.
 */

const client = cache(async () => getPayload({ config }));

/** True while the admin's Preview button has put us in Next's draft mode. */
const isDraft = cache(async () => {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    // draftMode() throws outside a request scope (e.g. during static export).
    return false;
  }
});

/* ------------------------------------------------------------------- media */

const FALLBACK_MEDIA: Media = {
  src: "/placeholder/work/project-alpha-cover.jpg",
  alt: "",
  width: 1600,
  height: 1000,
};

type MediaRef = number | string | MediaDoc | null | undefined;

/**
 * Payload returns either an id or a populated document depending on `depth`.
 * Normalising that here keeps the ternary out of every component.
 */
export const toMedia = (ref: MediaRef, fallbackAlt = ""): Media | undefined => {
  if (!ref || typeof ref === "number" || typeof ref === "string") return undefined;

  return {
    src: ref.url ?? FALLBACK_MEDIA.src,
    alt: ref.alt ?? fallbackAlt,
    width: ref.width ?? 1600,
    height: ref.height ?? 1000,
    poster: undefined,
  };
};

/** Same, but guaranteed non-undefined for places that must render something. */
export const toMediaOrFallback = (ref: MediaRef, alt = ""): Media =>
  toMedia(ref, alt) ?? { ...FALLBACK_MEDIA, alt };

const isVideo = (ref: MediaRef) =>
  Boolean(ref && typeof ref === "object" && ref.mimeType?.startsWith("video/"));

/* -------------------------------------------------------------- site level */

export const getSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await client();
  return payload.findGlobal({ slug: "site-settings", depth: 1 });
});

/**
 * Navigation, with the Writing slot resolved.
 *
 * The blog toggle lives in Site Settings, so turning Writing on is a checkbox —
 * the slot is already in the list and simply becomes visible.
 */
export const getNavigation = cache(async (): Promise<NavItem[]> => {
  const settings = await getSettings();
  const items = settings.navigation ?? [];

  return items
    .map((item) => ({
      label: item.label,
      href: item.route,
      enabled:
        item.visible !== false && (item.route !== "/blog" || settings.blogEnabled === true),
    }))
    .filter((item) => item.enabled);
});

export const getSocials = cache(async (): Promise<Social[]> => {
  const settings = await getSettings();
  return (settings.socials ?? []).map((social) => ({
    label: social.label,
    href: social.href,
    handle: social.handle ?? undefined,
    external: !social.href.startsWith("/"),
  }));
});

/* -------------------------------------------------------------------- home */

export const getHome = cache(async (): Promise<HomeDoc> => {
  const payload = await client();
  return payload.findGlobal({ slug: "home", depth: 1, draft: await isDraft() });
});

/** Only the sections the admin left visible, in the order they were dragged into. */
export const getHomeSections = cache(async () => {
  const home = await getHome();
  return (home.sections ?? []).filter((section) => section.visible !== false);
});

/* ------------------------------------------------------------------ resume */

export const getResume = cache(async (): Promise<ResumeDoc> => {
  const payload = await client();
  return payload.findGlobal({ slug: "resume", depth: 0, draft: await isDraft() });
});

/* ------------------------------------------------------------------- work */

export const getProjects = cache(async (): Promise<ProjectDoc[]> => {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "projects",
    depth: 2,
    limit: 100,
    sort: "order",
    draft: await isDraft(),
  });
  return docs;
});

export const getFeaturedProjects = cache(async () =>
  (await getProjects()).filter((project) => project.featured),
);

export const getProject = cache(async (slug: string): Promise<ProjectDoc | null> => {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft: await isDraft(),
  });
  return docs[0] ?? null;
});

export const getNextProject = cache(async (slug: string) => {
  const projects = await getProjects();
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1 || projects.length < 2) return null;
  return projects[(index + 1) % projects.length];
});

/** Cover media plus its optional hover loop, in the shape HoverPreview wants. */
export const projectCover = (project: ProjectDoc): Media => {
  const cover = toMediaOrFallback(project.cover, `${project.title} — cover image`);
  const video = project.previewVideo;

  if (isVideo(video) && typeof video === "object" && video?.url) {
    return { ...cover, video: video.url, poster: cover.src };
  }
  return cover;
};

/* -------------------------------------------------------------------- life */

export const getLifeEntries = cache(async (): Promise<LifeDoc[]> => {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "life",
    depth: 2,
    limit: 100,
    sort: "order",
    draft: await isDraft(),
  });
  return docs;
});

export const getLifeEntry = cache(async (slug: string): Promise<LifeDoc | null> => {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "life",
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft: await isDraft(),
  });
  return docs[0] ?? null;
});

/** Trail figures, skipping the ones left empty. */
export const lifeFigures = (entry: LifeDoc) =>
  [
    { label: "Distance", value: entry.distance },
    { label: "Ascent", value: entry.elevation },
    { label: "Time", value: entry.duration },
    { label: "Difficulty", value: entry.difficulty },
  ].filter((figure): figure is { label: string; value: string } => Boolean(figure.value));

/* ----------------------------------------------------------------- gallery */

export const getGallery = cache(async (): Promise<Photo[]> => {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "gallery",
    depth: 1,
    limit: 300,
    sort: "order",
  });

  return docs
    .map((doc: GalleryDoc): Photo | null => {
      const media = toMedia(doc.image, `${doc.place}, ${doc.date}`);
      if (!media) return null;

      return {
        ...media,
        id: String(doc.id),
        place: doc.place,
        date: doc.date,
        caption: doc.caption ?? undefined,
      };
    })
    .filter((photo): photo is Photo => photo !== null);
});

/* ------------------------------------------------------------------- tools */

export const getBuiltTools = cache(async (): Promise<BuiltToolDoc[]> => {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "built-tools",
    depth: 1,
    limit: 100,
    sort: "order",
  });
  return docs;
});

const CATEGORY_LABELS: Record<string, string> = {
  development: "Development",
  design: "Design",
  hardware: "Hardware",
  photography: "Photography",
  other: "Elsewhere",
};

/** Grouped for display, preserving the admin's drag order within each group. */
export const getUsedTools = cache(async () => {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "used-tools",
    depth: 0,
    limit: 200,
    sort: "order",
  });

  const groups = new Map<string, { category: string; items: { name: string; note?: string; href?: string }[] }>();

  for (const tool of docs as UsedToolDoc[]) {
    const key = tool.category;
    if (!groups.has(key)) {
      groups.set(key, { category: CATEGORY_LABELS[key] ?? key, items: [] });
    }
    groups.get(key)!.items.push({
      name: tool.name,
      note: tool.note ?? undefined,
      href: tool.url ?? undefined,
    });
  }

  return Array.from(groups.values());
});

/* -------------------------------------------------------------------- blog */

export const getPosts = cache(async (): Promise<PostDoc[]> => {
  const payload = await client();
  const draft = await isDraft();

  const { docs } = await payload.find({
    collection: "posts",
    depth: 2,
    limit: 100,
    sort: "-publishedAt",
    draft,
    // Scheduled posts stay off the public site until their date arrives, but
    // remain visible in preview so you can check them before they go out.
    where: draft ? {} : { publishedAt: { less_than_equal: new Date().toISOString() } },
  });
  return docs;
});

export const getPost = cache(async (slug: string): Promise<PostDoc | null> => {
  const payload = await client();
  const { docs } = await payload.find({
    collection: "posts",
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft: await isDraft(),
  });
  return docs[0] ?? null;
});

export const getNextPost = cache(async (slug: string) => {
  const posts = await getPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1 || posts.length < 2) return null;
  return posts[(index + 1) % posts.length];
});

/** Reading time, derived rather than authored — see also the old lib/blog.ts. */
export const readingTime = (blocks: unknown): number => {
  const text = JSON.stringify(blocks ?? "");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })
    : "";
