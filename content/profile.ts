import type { Profile, Social } from "./types";

/**
 * ── EDIT ME FIRST ───────────────────────────────────────────────────────────
 * Your name, your one-liner, where you are. Everything visible on the home
 * page's hero and intro comes from this file.
 */
export const profile: Profile = {
  name: "Your Name",
  shortName: "Your Name",
  greeting: "Hi, I'm Your Name 👋",
  /** Hero lines. Keep each under ~15 characters — see --text-hero in globals.css. */
  headline: ["Developer,", "builder,", "traveler,", "and occasional", "photographer."],
  roles: ["Developer", "Builder", "Photographer"],
  basedIn: "Amsterdam, NL",
  currently: "Building interfaces at Placeholder Studio",
  intro: [
    "I'm interested in building useful software and thoughtful digital experiences.",
    "Outside the screen, I spend my time hiking, traveling and taking photographs.",
  ],
  interests: ["Technology", "Photography", "Hiking", "Travel"],
  email: "hello@example.com",
  year: "2026",
  signOff: ["Let's make", "something", "interesting."],
  seo: {
    title: "Your Name — Developer, builder, photographer",
    description:
      "A personal space: selected work, field notes from away from the screen, tools, photography and a formal resume.",
  },
};

export const socials: Social[] = [
  { label: "GitHub", href: "https://github.com/your-handle", handle: "@your-handle", external: true },
  { label: "Instagram", href: "https://instagram.com/your-handle", handle: "@your-handle", external: true },
  { label: "Read.cv", href: "https://read.cv/your-handle", handle: "@your-handle", external: true },
  { label: "Email", href: `mailto:${profile.email}`, handle: profile.email, external: true },
];
