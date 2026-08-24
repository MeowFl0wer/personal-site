import type { Project } from "./types";

const cover = (slug: string) => ({
  src: `/placeholder/work/${slug}-cover.jpg`,
  alt: `Placeholder cover image for the ${slug} case study`,
  width: 1600,
  height: 1000,
});

const shot = (slug: string, n: number, alt: string) => ({
  src: `/placeholder/work/${slug}-0${n}.jpg`,
  alt,
  width: 1400,
  height: 1000,
});

/**
 * Selected work. `featured: true` surfaces a project on the home page —
 * keep that to three or four.
 *
 * To add a project: append an object here. The index page, the case study
 * route, the home page block and the "next project" link all pick it up.
 */
export const projects: Project[] = [
  {
    slug: "project-alpha",
    title: "Project Alpha",
    year: "2026",
    discipline: "Web / AI",
    role: "Design & Engineering",
    stack: ["TypeScript", "Next.js", "WebGL", "Python"],
    summary:
      "A research interface that turns a large, messy document corpus into something you can actually read.",
    // To make the hover preview play a short loop instead of showing a still,
    // drop an .mp4 in /public and add:
    //   video: "/placeholder/work/project-alpha-preview.mp4",
    //   poster: "/placeholder/work/project-alpha-cover.jpg",
    // HoverPreview already handles both cases; no placeholder videos ship here.
    cover: cover("project-alpha"),
    link: { label: "alpha.example.com", href: "https://example.com", external: true },
    featured: true,
    sections: [
      {
        heading: "Overview",
        body: [
          "Alpha started as an internal tool for a team drowning in unstructured research. The brief was small — make search less painful — but the real problem sat one level up: nobody could tell which of the forty thousand documents were worth opening.",
          "The result is a reading surface rather than a search box. Retrieval happens quietly in the background; what you see is a ranked, annotated body of text you can move through at speed.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "The existing tool returned a list of ten blue links and a relevance score nobody trusted. Analysts were exporting results to spreadsheets and re-reading everything by hand, which meant the tool was measurably slower than not using it.",
        ],
      },
      {
        heading: "Process",
        body: [
          "We instrumented three weeks of real sessions before writing any code, then rebuilt the interaction around the thing people were actually doing: skimming, discarding, and keeping a short working set.",
          "Prototypes were tested at full data volume from week one. Anything that felt fine on fifty documents and collapsed on fifty thousand was cut early rather than optimised late.",
        ],
      },
      {
        heading: "Solution",
        body: [
          "A two-pane reader with a persistent working set, keyboard-first navigation, and inline provenance on every claim. Ranking is explained in plain language at the point of use instead of as an opaque number.",
          "The heavy lifting runs server-side and streams in; the interface never blocks on a model call.",
        ],
      },
      {
        heading: "Result",
        body: [
          "Median time to a usable working set dropped from around forty minutes to under six. The spreadsheet export, which was the honest measure of failure, stopped being used within a month.",
        ],
      },
    ],
    gallery: [
      shot("project-alpha", 1, "Placeholder: the two-pane reading surface"),
      shot("project-alpha", 2, "Placeholder: inline provenance detail"),
      shot("project-alpha", 3, "Placeholder: the working set panel"),
    ],
  },
  {
    slug: "project-beta",
    title: "Project Beta",
    year: "2025",
    discipline: "Product / Platform",
    role: "Lead Engineer",
    stack: ["React", "Node", "PostgreSQL", "Terraform"],
    summary:
      "A booking platform rebuilt from the schema up, from a codebase that took eleven minutes to deploy.",
    cover: cover("project-beta"),
    link: { label: "beta.example.com", href: "https://example.com", external: true },
    featured: true,
    sections: [
      {
        heading: "Overview",
        body: [
          "Beta is the second life of a platform that had grown for six years without anyone being allowed to stop and tidy. The rebuild had one non-negotiable constraint: it had to happen without a migration weekend.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "Availability was modelled three different ways in three different services, and they disagreed often enough that support had a documented process for apologising.",
        ],
      },
      {
        heading: "Process",
        body: [
          "We collapsed availability into a single authoritative model behind a read API, then moved consumers over one at a time with the old and new paths running in parallel and diffed in production for six weeks.",
        ],
      },
      {
        heading: "Solution",
        body: [
          "One schema, one writer, well-defined read replicas, and a deployment pipeline that finishes in under ninety seconds.",
        ],
      },
      {
        heading: "Result",
        body: [
          "Double-booking incidents went to zero and stayed there. Deploy frequency went from weekly to roughly a dozen times a day, which turned out to matter more than any single feature we shipped.",
        ],
      },
    ],
    gallery: [
      shot("project-beta", 1, "Placeholder: availability model diagram"),
      shot("project-beta", 2, "Placeholder: booking flow"),
      shot("project-beta", 3, "Placeholder: operations dashboard"),
    ],
  },
  {
    slug: "project-gamma",
    title: "Project Gamma",
    year: "2025",
    discipline: "Tool / Open Source",
    role: "Author",
    stack: ["Rust", "WebAssembly", "TypeScript"],
    summary:
      "A tiny command-line tool for reshaping image sets, later compiled to WebAssembly so it runs in the browser.",
    cover: cover("project-gamma"),
    link: { label: "github.com/your-handle/gamma", href: "https://github.com", external: true },
    featured: true,
    sections: [
      {
        heading: "Overview",
        body: [
          "Gamma exists because I kept writing the same forty-line script to prepare photographs for the web, badly, once per project.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "Existing tools were either enormous or assumed a single canonical output size. Photography sets need per-image decisions — crop intent, orientation, and a sane cap on file size — applied consistently across a few hundred files.",
        ],
      },
      {
        heading: "Process",
        body: [
          "Written first as a throwaway binary for my own use, then rewritten once the interface had stopped changing for a month. The WebAssembly build came later, mostly to see whether the core could survive without a filesystem.",
        ],
      },
      {
        heading: "Solution",
        body: [
          "A single declarative config, parallel processing, and deterministic output, so re-running it never produces a diff unless the inputs changed.",
        ],
      },
      {
        heading: "Result",
        body: [
          "It runs on every image in this site's gallery. A small number of strangers use it too, which is a strange and pleasant thing.",
        ],
      },
    ],
    gallery: [
      shot("project-gamma", 1, "Placeholder: command-line output"),
      shot("project-gamma", 2, "Placeholder: the browser build"),
      shot("project-gamma", 3, "Placeholder: before and after set"),
    ],
  },
  {
    slug: "project-delta",
    title: "Project Delta",
    year: "2024",
    discipline: "Interface / Experiment",
    role: "Design & Engineering",
    stack: ["Three.js", "GLSL", "GSAP"],
    summary:
      "An experiment in scroll-driven typography — how far a page can move before it stops being readable.",
    cover: cover("project-delta"),
    featured: false,
    sections: [
      {
        heading: "Overview",
        body: [
          "Delta is not a product. It is a set of controlled experiments about motion and reading, built because I wanted an honest answer rather than a taste-based one.",
        ],
      },
      {
        heading: "Problem",
        body: [
          "Motion-heavy sites are usually judged on whether they impress. I wanted to know where they start to cost comprehension.",
        ],
      },
      {
        heading: "Process",
        body: [
          "Eight variants of the same article, identical copy, escalating motion. Twenty-two readers, recall tested afterwards.",
        ],
      },
      {
        heading: "Solution",
        body: [
          "Motion that is tied to scroll position reads as physics and costs almost nothing. Motion that is tied to time, and happens without input, costs a lot.",
        ],
      },
      {
        heading: "Result",
        body: [
          "The finding shaped this entire site: interaction is expressive, but nothing moves unless you move it.",
        ],
      },
    ],
    gallery: [
      shot("project-delta", 1, "Placeholder: variant grid"),
      shot("project-delta", 2, "Placeholder: motion study"),
      shot("project-delta", 3, "Placeholder: recall results"),
    ],
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export const getProject = (slug: string) => projects.find((project) => project.slug === slug);

/** Wraps around, so the last case study points back at the first. */
export const getNextProject = (slug: string) => {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return undefined;
  return projects[(index + 1) % projects.length];
};
