import type { Resume } from "./types";
import { profile } from "./profile";

/**
 * One resume, two outputs.
 *
 * /resume renders this on screen, and the print stylesheet in globals.css turns
 * the same DOM into a clean A4. There is no second PDF document to keep in sync,
 * and there never should be.
 */
export const resume: Resume = {
  title: "Developer / Interface Engineer",
  profile: [
    "Engineer and designer working on interfaces where the hard part is the data, not the button. Ten years across product, platform and a fair amount of things that were supposed to be prototypes.",
    "Comfortable owning something end to end — schema, service, interface, and the conversation about what it should have been in the first place.",
  ],
  experience: [
    {
      organisation: "Placeholder Studio",
      role: "Senior Interface Engineer",
      period: "2025 — Now",
      location: "Amsterdam, NL",
      body: [
        "Lead engineer on the studio's research and reading tools. Own the front-end architecture and share ownership of the retrieval layer behind it.",
      ],
      highlights: [
        "Rebuilt the core reading surface; median time-to-working-set fell from ~40 minutes to under 6.",
        "Introduced a shared motion and layout system now used across four products.",
        "Mentor two engineers; run the weekly interface review.",
      ],
    },
    {
      organisation: "Placeholder Labs",
      role: "Full-stack Engineer",
      period: "2021 — 2025",
      location: "Remote",
      body: [
        "Second engineering hire. Built and then repeatedly rebuilt the booking platform as the company grew from three customers to several hundred.",
      ],
      highlights: [
        "Collapsed three conflicting availability models into one authoritative service, with zero migration downtime.",
        "Took deploys from weekly to roughly twelve a day.",
        "Set up the on-call rotation and, more usefully, the work that made it quiet.",
      ],
    },
    {
      organisation: "Placeholder Agency",
      role: "Front-end Developer",
      period: "2018 — 2021",
      location: "Berlin, DE",
      body: [
        "Client work across culture, publishing and retail. Mostly short projects, occasionally very strange ones.",
      ],
      highlights: [
        "Shipped nineteen sites; four are still running unchanged.",
        "Built the agency's accessibility checklist after losing an argument about it.",
      ],
    },
  ],
  education: [
    {
      organisation: "Placeholder University",
      role: "BSc, Computer Science",
      period: "2014 — 2018",
      location: "Placeholder City",
      body: ["Thesis on interactive data visualisation. Spent more time in the darkroom than is strictly defensible."],
    },
  ],
  projects: [
    {
      name: "Project Gamma",
      period: "2025 — Now",
      body: "Open-source image-set tool. Rust core, WebAssembly build, used in production by a small number of strangers.",
    },
    {
      name: "Project Delta",
      period: "2024",
      body: "A study of scroll-driven motion and reading comprehension, with twenty-two participants and eight variants.",
    },
    {
      name: "This site",
      period: "2026",
      body: "Personal space and ongoing testbed for interaction work that has nowhere else to go.",
    },
  ],
  skills: [
    { category: "Languages", items: ["TypeScript", "JavaScript", "Rust", "Python", "SQL", "GLSL"] },
    { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "GSAP", "Three.js", "WebGL"] },
    { category: "Backend", items: ["Node", "PostgreSQL", "Redis", "REST", "GraphQL"] },
    { category: "Practice", items: ["Interface design", "Accessibility", "Performance", "Design systems", "Mentoring"] },
  ],
  contact: [
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "GitHub", href: "https://github.com/your-handle", external: true },
    { label: "Website", href: "https://example.com", external: true },
  ],
  printNote: "References available on request.",
};
