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

/**
 * Social accounts. `platform` picks the icon — see
 * src/components/ui/social-icons.ts for the full list of available marks.
 */
export const socials: Social[] = [
  { platform: "github", label: "GitHub", href: "https://github.com/your-handle", handle: "@your-handle", external: true },
  { platform: "instagram", label: "Instagram", href: "https://instagram.com/your-handle", handle: "@your-handle", external: true },
  { platform: "x", label: "X", href: "https://x.com/your-handle", handle: "@your-handle", external: true },
  { platform: "bilibili", label: "Bilibili", href: "https://space.bilibili.com/your-id", handle: "your-id", external: true },
  { platform: "douyin", label: "Douyin", href: "https://www.douyin.com/user/your-id", handle: "@your-handle", external: true },
  { platform: "xiaohongshu", label: "Xiaohongshu", href: "https://xiaohongshu.com/user/profile/your-id", handle: "@your-handle", external: true },
  // WeChat has no public profile page. u.wechat.com links are what the app
  // itself generates; the alternative is pointing this at an uploaded QR image.
  { platform: "wechat", label: "WeChat", href: "https://u.wechat.com/your-id", handle: "your-wechat-id", external: true },
  { platform: "email", label: "Email", href: `mailto:${profile.email}`, handle: profile.email, external: true },
];
