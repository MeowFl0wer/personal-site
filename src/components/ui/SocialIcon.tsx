import { SOCIAL_ICONS } from "./social-icons";
import { cn } from "@/lib/utils";

/**
 * A social link as a glyph.
 *
 * The mark is drawn in `currentColor` at a single weight, so it inherits the
 * page's ink and works unchanged on the dark ground. No brand colours, no
 * filled chips, no rounded badges — the icons have to sit in an editorial page
 * without turning it into a button bar.
 *
 * An unknown platform falls back to the generic website mark rather than
 * rendering nothing, so a link is never silently invisible.
 */
export function SocialIcon({
  platform,
  className,
  size = 18,
}: {
  platform: string;
  className?: string;
  size?: number;
}) {
  const icon = SOCIAL_ICONS[platform] ?? SOCIAL_ICONS.website;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0 fill-current", className)}
    >
      <path d={icon.path} />
    </svg>
  );
}

export const socialLabel = (platform: string, fallback: string) =>
  SOCIAL_ICONS[platform]?.label ?? fallback;

/**
 * The row of social links used in the Elsewhere block and on About.
 *
 * Each link is a glyph plus its name. Keeping the name visible costs a little
 * space and buys a lot: icon-only rows are a guessing game, and screen readers
 * get a real label rather than a title attribute.
 */
export function SocialRow({
  links,
  className,
  showLabels = true,
}: {
  links: { label: string; href: string; platform?: string | null; handle?: string | null }[];
  className?: string;
  showLabels?: boolean;
}) {
  if (links.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", className)}>
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <a
            href={link.href}
            target={link.href.startsWith("/") ? undefined : "_blank"}
            rel={link.href.startsWith("/") ? undefined : "noreferrer noopener"}
            data-cursor-state="external"
            className="group inline-flex items-center gap-2.5 text-muted transition-colors duration-[--duration-fast] hover:text-ink"
          >
            <SocialIcon platform={link.platform ?? "website"} />
            {showLabels ? (
              <span className="link-underline text-small">{link.label}</span>
            ) : (
              <span className="sr-only">{link.label}</span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
