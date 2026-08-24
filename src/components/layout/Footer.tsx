import { Reveal } from "@/components/motion/Reveal";
import { SocialRow } from "@/components/ui/SocialIcon";
import type { Social } from "@content/types";

/**
 * The footer is a full section, not a strip of small print: the sign-off is set
 * at display size and carries the bottom of every page.
 *
 * Under it, one line and nothing else. It used to run four columns — accounts,
 * a copy of the navigation, the email address, and the credit — and three of
 * those were the same links the reader had already been given twice: the nav is
 * fixed at the top of every page, and the address is on /about beside the CV.
 * A footer that repeats the site back at you is filler with a border on it.
 *
 * What is left is the one thing that appears nowhere else (the credit) and the
 * one set of links that genuinely leads away (the accounts, as glyphs — their
 * names are already spelled out on /about).
 */
export function Footer({
  signOff,
  socials,
  name,
  year,
  basedIn,
}: {
  signOff: string[];
  socials: Social[];
  name: string;
  year: string;
  basedIn: string;
}) {
  return (
    <footer data-site-footer className="mt-[var(--section-gap)] border-t border-rule">
      <div className="shell py-16 md:py-24">
        {signOff.length > 0 ? (
          <Reveal stagger="line">
            <p className="text-display max-w-[16ch] font-medium">
              {signOff.map((line) => (
                <span key={line} data-reveal-item className="block">
                  {line}
                </span>
              ))}
            </p>
          </Reveal>
        ) : null}

        <Reveal className="mt-16 md:mt-24" delay={0.08}>
          <div className="flex flex-col gap-6 border-t border-rule pt-8 md:flex-row md:items-center md:justify-between">
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
