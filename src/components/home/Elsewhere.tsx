import { getSocials } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The last home section. When the blog toggle is switched on in Site Settings,
 * the Writing entry appears here alongside Resume with no other change — that is
 * the whole point of keeping the slot reserved.
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

  const links = [
    { label: "Resume", href: "/resume", external: false },
    ...(blogEnabled ? [{ label: "Writing", href: "/blog", external: false }] : []),
    ...socials.map((social) => ({
      label: social.label,
      href: social.href,
      external: social.external,
    })),
  ];

  return (
    <section className="shell section">
      <SectionHeader index={index} label={label} lead={["Need the formal version?"]} />

      <Reveal className="mt-14 md:mt-20" stagger="block">
        <ul className="border-t border-rule">
          {links.map((link) => (
            <li key={link.label} data-reveal-item className="border-b border-rule">
              <ArrowLink
                href={link.href}
                external={link.external}
                arrow={link.external ? "↗" : "→"}
                className="text-headline w-full justify-between py-6 font-medium"
              >
                {link.label}
              </ArrowLink>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-10" delay={0.1}>
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
