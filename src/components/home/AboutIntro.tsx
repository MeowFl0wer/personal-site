import { Reveal } from "@/components/motion/Reveal";
import { SectionNumber } from "@/components/ui/SectionHeader";
import type { Home } from "@/payload-types";

/**
 * Big-type self-introduction with three small facts alongside.
 * No card, no border, no background — just the grid and a hairline above.
 */
export function AboutIntro({ home, index, label }: { home: Home; index: string; label: string }) {
  const intro = (home.intro ?? []).map((row) => row.text).filter(Boolean);
  const interests = home.interests ?? [];

  return (
    <section className="shell section">
      <Reveal>
        <SectionNumber index={index} label={label} />
      </Reveal>
      <hr className="rule mt-4" />

      <div className="grid-12 mt-12 gap-y-14 md:mt-20">
        <Reveal className="col-span-4 md:col-span-6 lg:col-span-8" stagger="block">
          <div className="text-headline flex max-w-[24ch] flex-col gap-8 font-medium">
            {intro.map((paragraph) => (
              <p key={paragraph} data-reveal-item className="pretty">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal
          className="col-span-4 flex flex-col gap-10 md:col-span-6 lg:col-span-3 lg:col-start-10"
          delay={0.1}
          stagger="tight"
        >
          {home.basedIn ? (
            <div data-reveal-item className="flex flex-col gap-2">
              <span className="meta text-muted">Based in</span>
              <span className="text-small">{home.basedIn}</span>
            </div>
          ) : null}

          {home.currently ? (
            <div data-reveal-item className="flex flex-col gap-2">
              <span className="meta text-muted">Currently</span>
              <span className="text-small">{home.currently}</span>
            </div>
          ) : null}

          {interests.length > 0 ? (
            <div data-reveal-item className="flex flex-col gap-2">
              <span className="meta text-muted">Interests</span>
              <ul className="flex flex-col gap-1">
                {interests.map((interest) => (
                  <li key={interest} className="text-small">
                    {interest}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
