/**
 * SEED DATA CONTRACT.
 *
 * /content is no longer what the site reads at request time — that is the CMS,
 * via src/lib/cms.ts. These files are the starter content that `npm run seed`
 * loads into the database on first run, plus the few plain shapes that client
 * components still take as props (Media, Photo, NavItem, Social).
 *
 * Editing a file here changes nothing on a running site. Edit at /admin instead.
 */

/* ------------------------------------------------------------------ shared */

export type Media = {
  /** Path under /public, or an absolute URL. */
  src: string;
  /** Required. Empty string only for genuinely decorative media. */
  alt: string;
  width: number;
  height: number;
  /** Optional short loop shown on hover. Muted, no audio track needed. */
  video?: string;
  /** Frame shown before the video decodes. Defaults to `src`. */
  poster?: string;
};

export type Link = {
  label: string;
  href: string;
  external?: boolean;
};

/* ----------------------------------------------------------------- profile */

export type Profile = {
  name: string;
  /** Shown in the nav and as the document title suffix. */
  shortName: string;
  greeting: string;
  /** Hero lines. Each string is rendered on its own line, very large. */
  headline: string[];
  roles: string[];
  basedIn: string;
  currently: string;
  /** Big-type intro paragraphs on the home page. */
  intro: string[];
  interests: string[];
  email: string;
  /** Displayed top-right of the hero. */
  year: string;
  seo: {
    title: string;
    description: string;
  };
};

/* -------------------------------------------------------------- navigation */

export type NavItem = {
  label: string;
  href: string;
  /** When false the item is omitted from nav but the route still exists. */
  enabled: boolean;
};

/* ---------------------------------------------------------------- projects */

export type ProjectSection = {
  heading: string;
  body: string[];
};

export type Project = {
  slug: string;
  /** Index shown in the list: "01", "02"… derived if omitted. */
  title: string;
  year: string;
  /** e.g. "Web / AI / Tool" — shown as a mono meta line. */
  discipline: string;
  role: string;
  stack: string[];
  /** One-line summary used in lists. */
  summary: string;
  /** Shown on hover in the project index and at the top of the case study. */
  cover: Media;
  link?: Link;
  /** Case-study body. Order is preserved. */
  sections: ProjectSection[];
  gallery: Media[];
  /** Surface on the home page's Selected Work block. */
  featured: boolean;
};

/* -------------------------------------------------------------------- life */

export type FieldNote = {
  id: string;
  /** "OUTDOORS" | "TRAVEL" | … drives the section grouping. */
  category: string;
  title: string;
  place: string;
  date: string;
  /** Small mono facts: distance, elevation, film stock, whatever fits. */
  facts: { label: string; value: string }[];
  body?: string;
  media: Media[];
  /** Editorial rhythm hint. The layout, not the data, decides the exact grid. */
  emphasis: "full" | "wide" | "inset" | "small";
};

export type LifeContent = {
  intro: string[];
  notes: FieldNote[];
};

/* ----------------------------------------------------------------- gallery */

export type Photo = Media & {
  id: string;
  place: string;
  date: string;
  caption?: string;
};

/* ------------------------------------------------------------------- tools */

export type BuiltTool = {
  id: string;
  name: string;
  description: string;
  stack: string[];
  links: Link[];
  preview?: Media;
};

export type ToolGroup = {
  category: string;
  items: { name: string; note?: string; href?: string }[];
};

/* ------------------------------------------------------------------ resume */

export type ResumeEntry = {
  organisation: string;
  role: string;
  period: string;
  location?: string;
  body: string[];
  /** Optional bullet list under the prose. */
  highlights?: string[];
};

export type ResumeSkillGroup = {
  category: string;
  items: string[];
};

export type Resume = {
  /** Overrides Profile.roles for the formal document. */
  title: string;
  /** The photograph at the top of /about. Omitted from print. */
  portrait?: Media;
  profile: string[];
  experience: ResumeEntry[];
  education: ResumeEntry[];
  projects: { name: string; period: string; body: string }[];
  skills: ResumeSkillGroup[];
  contact: Link[];
  /** Shown in the print header only. */
  printNote?: string;
};

/* -------------------------------------------------------------------- blog */

/** Frontmatter contract for /content/blog/*.mdx. */
export type PostFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  cover?: Media;
  tags?: string[];
  draft?: boolean;
  category?: string;
};

export type Post = PostFrontmatter & {
  slug: string;
  /** Derived at read time — never authored by hand. */
  readingTime: number;
  content: string;
};

/* ----------------------------------------------------------------- socials */

export type Social = Link & {
  /** Short mono handle shown next to the label. */
  handle?: string;
  /** Icon key — see src/components/ui/social-icons.ts. */
  platform?: string;
};
