import { getSocials } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SocialRow } from "@/components/ui/SocialIcon";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The last home section.
 *
 * Two kinds of destination, kept visually separate rather than mixed into one
 * list: the site's own formal pages as large type, and the social accounts as a
 * row of glyphs. Mixing them made "GitHub" look like a page on this site.
 *
 * When the blog toggle is switched on in Site Settings, Writing appears in the
 * first group with no other change — that is the point of the reserved slot.
 */
export async function Elsewhere({
  index,
  label,
  email,
  blogEnabled,
}: {
  index: string;
  label: string;
  email: string;
  blogEnabled: boolean;
}) {
  const socials = await getSocials();

  const pages = [
    { label: "Resume", href: "/resume" },
    ...(blogEnabled ? [{ label: "Writing", href: "/blog" }] : []),
  ];

  return (
    <section className="shell section">
      <SectionHeader index={index} label={label} lead={["Need the formal version?"]} />

      <Reveal className="mt-14 md:mt-20" stagger="block">
        <ul className="border-t border-rule">
          {pages.map((page) => (
            <li key={page.label} data-reveal-item className="border-b border-rule">
              <ArrowLink
                href={page.href}
                arrow="→"
                className="text-headline w-full justify-between py-6 font-medium"
              >
                {page.label}
              </ArrowLink>
            </li>
          ))}
        </ul>
      </Reveal>

      {socials.length > 0 ? (
        <Reveal className="mt-12" delay={0.08}>
          <p className="meta mb-6 text-muted">Find me on</p>
          <SocialRow links={socials} className="gap-x-8 gap-y-4" />
        </Reveal>
      ) : null}

      <Reveal className="mt-14" delay={0.1}>
        <p className="text-small text-muted">
          Or just say hello —{" "}
          <a href={`mailto:${email}`} className="link-underline text-ink">
            {email}
          </a>
        </p>
      </Reveal>
    </section>
  );
}
