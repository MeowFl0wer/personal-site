import { Reveal } from "@/components/motion/Reveal";
import { SocialRow } from "@/components/ui/SocialIcon";
import type { Social } from "@content/types";

/**
 * One line: the credit at the left, the accounts as glyphs at the right.
 *
 * It has been cut down twice, and both cuts were the same argument. It used to
 * run four columns — accounts, a copy of the navigation, the email address, the
 * credit — and three of those were the site repeated back at the reader. Above
 * them sat a display-size sign-off, "Let's make something interesting.", printed
 * at the bottom of every page: a slogan addressed to nobody, which is not a
 * reason to keep a reader on the page, and which said the same thing on the
 * archive as on the résumé.
 *
 * What is left is the one thing that appears nowhere else and the one set of
 * links that genuinely leads away.
 */
export function Footer({
  socials,
  name,
  year,
  basedIn,
}: {
  socials: Social[];
  name: string;
  year: string;
  basedIn: string;
}) {
  return (
    <footer data-site-footer className="mt-[var(--section-gap)] border-t border-rule">
      <div className="shell py-10 md:py-12">
        {/* `top bottom`, not Reveal's usual `top 88%`.
            The footer is the one element that always sits at the very bottom of
            the document, so the highest its top can ever reach is
            `viewportHeight − footerHeight`. While this was a tall block ending
            in a display-size sign-off that was comfortably past 88%; as a 123px
            strip it lands at 87.7% and the trigger never fires, leaving the
            credit and the accounts stuck at opacity 0. Firing as it enters the
            viewport is reachable at any height. */}
        <Reveal start="top bottom">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="meta text-muted">
              © {year} {name}
              {basedIn ? <span className="ml-3 opacity-60">{basedIn}</span> : null}
            </p>

            {socials.length > 0 ? (
              <SocialRow links={socials} showLabels={false} className="gap-x-6" />
            ) : null}
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
