import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SocialRow } from "@/components/ui/SocialIcon";
import type { NavItem, Social } from "@content/types";

/**
 * The footer is a full section, not a strip of small print: the sign-off is set
 * at display size and carries the bottom of every page. Every string here is
 * editable in the CMS.
 */
export function Footer({
  signOff,
  socials,
  navigation,
  email,
  name,
  year,
  basedIn,
}: {
  signOff: string[];
  socials: Social[];
  navigation: NavItem[];
  email: string;
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

        <div className="grid-12 mt-16 gap-y-10 md:mt-24">
          <div className="col-span-4 md:col-span-3">
            <p className="meta mb-4 text-muted">Elsewhere</p>
            <SocialRow links={socials} className="flex-col items-start gap-y-2" />
          </div>

          <div className="col-span-4 md:col-span-3">
            <p className="meta mb-4 text-muted">Sections</p>
            <ul className="flex flex-col gap-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-small link-underline">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/gallery" className="text-small link-underline">
                  Gallery
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-4 md:col-span-3">
            <p className="meta mb-4 text-muted">Contact</p>
            <a href={`mailto:${email}`} className="text-small link-underline">
              {email}
            </a>
          </div>

          <div className="col-span-4 md:col-span-3 md:justify-self-end">
            <p className="meta text-muted">
              © {year} {name}
            </p>
            {basedIn ? <p className="meta mt-2 text-muted">{basedIn}</p> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
