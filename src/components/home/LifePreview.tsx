import { getLifeEntries, toMedia } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLinkLarge } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { MediaFrame } from "@/components/ui/MediaFrame";

const PILLAR_LABELS: Record<string, string> = {
  hiking: "Hiking",
  travel: "Travel",
  photography: "Photography",
  outdoor: "Outdoors",
  personal: "Personal",
  other: "Elsewhere",
};

/**
 * Home's quietest section by design — this is where the site slows down before
 * Tools and the footer. Two large images, one line of type, three words.
 */
export async function LifePreview({ index, label }: { index: string; label: string }) {
  const entries = await getLifeEntries();
  if (entries.length === 0) return null;

  const covers = entries
    .map((entry) => toMedia(entry.cover, entry.title))
    .filter((media): media is NonNullable<typeof media> => Boolean(media));

  // Pillars are derived from what actually exists, not from a second list to
  // keep in sync.
  const pillars = Array.from(new Set(entries.map((entry) => entry.category))).map(
    (category) => PILLAR_LABELS[category] ?? category,
  );

  return (
    <section className="shell section">
      <SectionHeader
        index={index}
        label={label}
        lead={["When I'm not building things,", "I'm usually somewhere outside."]}
      />

      <div className="grid-12 mt-16 gap-y-8 md:mt-24">
        {covers[0] ? (
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-7">
            <Parallax className="aspect-[4/3] w-full">
              <MediaFrame
                media={covers[0]}
                className="h-full"
                ratio="4 / 3"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            </Parallax>
          </Reveal>
        ) : null}

        {covers[1] ? (
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end" delay={0.12}>
            <Parallax className="aspect-[3/4] w-full">
              <MediaFrame
                media={covers[1]}
                className="h-full"
                ratio="3 / 4"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </Parallax>
          </Reveal>
        ) : null}
      </div>

      {pillars.length > 0 ? (
        <Reveal className="mt-16 md:mt-24" stagger="tight">
          <ul className="flex flex-wrap items-baseline gap-x-10 gap-y-4 border-t border-rule pt-8">
            {pillars.map((pillar) => (
              <li key={pillar} data-reveal-item className="meta">
                {pillar}
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}

      <Reveal className="mt-10 flex justify-end" delay={0.1}>
        <ArrowLinkLarge href="/life">Explore life</ArrowLinkLarge>
      </Reveal>
    </section>
  );
}
