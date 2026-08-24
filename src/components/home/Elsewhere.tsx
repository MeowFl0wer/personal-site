import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The last home section: where to go next on this site.
 *
 * It has been stripped to that. It used to carry a "Find me on" row of accounts
 * and an email address underneath, and both were already somewhere better — the
 * accounts are in the footer, which begins about a screen below this, and the
 * address is on /about beside the CV button, which is where someone deciding to
 * write to me actually is. Repeating them here was the home page ending on
 * things the reader would meet again before they finished scrolling.
 *
 * When the blog toggle is switched on in Site Settings, Writing appears in the
 * list with no other change — that is the point of the reserved slot.
 */
export async function Elsewhere({
  index,
  label,
  blogEnabled,
}: {
  index: string;
  label: string;
  blogEnabled: boolean;
}) {
  // "The formal version" is /about: the introduction is the top of that page,
  // the resume is the rest of it.
  const pages = [
    { label: "About Me", href: "/about" },
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
    </section>
  );
}
