import type { Profile, Social } from "./types";

/**
 * ── EDIT ME FIRST ───────────────────────────────────────────────────────────
 * Your name, your one-liner, where you are. Everything visible on the home
 * page's hero and intro comes from this file.
 */
export const profile: Profile = {
  /* The name the site is signed with, everywhere. The one on the documents
     is Resume.legalName, which is private — see /about. */
  name: "Euan",
  shortName: "Euan",
  greeting: "Hi, I'm Euan 👋",
  /** Hero lines. Keep each under ~15 characters — see --text-hero in globals.css. */
  headline: ["Developer,", "builder,", "traveler,", "and occasional", "photographer."],
  roles: ["Developer", "Builder", "Photographer"],
  basedIn: "Amsterdam, NL",
  /* Deliberately without an employer. The work history on /about is
     private, and naming the current one here would hand over the most
     current part of it on the home page. */
  currently: "Building interfaces, mostly where the data is the hard part",
  intro: [
    "I'm interested in building useful software and thoughtful digital experiences.",
    "Outside the screen, I spend my time hiking, traveling and taking photographs.",
  ],
  interests: ["Technology", "Photography", "Hiking", "Travel"],
  email: "hello@example.com",
  year: "2026",
  seo: {
    title: "Your Name — Developer, builder, photographer",
    description:
      "A personal space: selected work, field notes from away from the screen, tools, photography and a formal resume.",
  },
};

/**
 * Social accounts. `platform` picks the icon — see
 * src/components/ui/social-icons.ts for the full list of available marks.
 */
export const socials: Social[] = [
  /* The repository this site is, not a personal profile. On the demonstration
     it is the thing someone clicking the icon is actually after; on the real
     site it is a sensible default to change in the admin. */
  { platform: "github", label: "GitHub", href: "https://github.com/MeowFl0wer/personal-site", handle: "MeowFl0wer/personal-site", external: true },
  { platform: "instagram", label: "Instagram", href: "https://instagram.com/your-handle", handle: "@your-handle", external: true },
  { platform: "x", label: "X", href: "https://x.com/your-handle", handle: "@your-handle", external: true, private: true },
  { platform: "bilibili", label: "Bilibili", href: "https://space.bilibili.com/your-id", handle: "your-id", external: true },
  { platform: "douyin", label: "Douyin", href: "https://www.douyin.com/user/your-id", handle: "@your-handle", external: true },
  { platform: "xiaohongshu", label: "Xiaohongshu", href: "https://xiaohongshu.com/user/profile/your-id", handle: "@your-handle", external: true },
  // WeChat has no public profile page. u.wechat.com links are what the app
  // itself generates; the alternative is pointing this at an uploaded QR image.
  { platform: "wechat", label: "WeChat", href: "https://u.wechat.com/your-id", handle: "your-wechat-id", external: true, private: true },
  { platform: "email", label: "Email", href: `mailto:${profile.email}`, handle: profile.email, external: true },
];
