import type { Metadata } from "next";
import Link from "next/link";
import { getLifeEntries, toMedia } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLinkLarge } from "@/components/ui/ArrowLink";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Life",
  description: "Away from the screen. Places I've been, trails I've walked, things worth remembering.",
};

const CATEGORY_LABELS: Record<string, string> = {
  hiking: "Outdoors",
  outdoor: "Outdoors",
  travel: "Travel",
  photography: "Photography",
  personal: "Personal",
  other: "Elsewhere",
};

/**
 * Life / Field Notes — the index.
 *
 * Grouped by category and laid out asymmetrically, with parallax as the only
 * effect. It should read like a travel magazine, not a feed, which mostly means
 * resisting the urge to make every image the same size: the placement below
 * cycles through four positions rather than repeating one.
 */
export default async function LifePage() {
  const entries = await getLifeEntries();

  const grouped = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const label = CATEGORY_LABELS[entry.category] ?? entry.category;
    (acc[label] ??= []).push(entry);
    return acc;
  }, {});

  return (
    <div className="shell pt-10 md:pt-16">
      <SectionHeader
        index="02"
        label="Life"
        lead={["Away from the screen.", "Places I've been,", "trails I've walked,", "things worth remembering."]}
        aside={
          <ArrowLinkLarge href="/gallery" cursorState="open">
            Gallery
          </ArrowLinkLarge>
        }
      />

      {entries.length === 0 ? (
        <p className="text-headline mt-20 text-muted">Nothing published yet.</p>
      ) : (
        <div className="mt-[clamp(4rem,12vh,9rem)]">
          {Object.entries(grouped).map(([label, items]) => (
            <section key={label} className="mb-[clamp(3rem,8vh,6rem)]">
              <Reveal>
                <h2 className="meta">{label}</h2>
              </Reveal>
              <RuleReveal className="mt-4 mb-[clamp(3rem,8vh,6rem)]" />

              <div className="grid-12 gap-y-[clamp(3rem,9vh,7rem)]">
                {items.map((entry, index) => {
                  const cover = toMedia(entry.cover, entry.title);
                  // A repeating four-step rhythm keeps the page staggered
                  // without ever being random.
                  const placement = [
                    "col-span-4 md:col-span-6 lg:col-span-7",
                    "col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-[8vh]",
                    "col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-2",
                    "col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7",
                  ][index % 4];

                  return (
                    <Reveal key={entry.id} className={placement}>
                      <Link href={`/life/${entry.slug}`} data-cursor-state="view" className="group block">
                        {cover ? (
                          <Parallax className="w-full" amount={4}>
                            <MediaFrame media={cover} sizes="(max-width: 1024px) 100vw, 50vw" />
                          </Parallax>
                        ) : null}

                        <div className="mt-5 flex items-baseline justify-between gap-6">
                          <h3
                            className={cn(
                              "text-headline max-w-[20ch] font-medium",
                              "transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-x-1",
                            )}
                          >
                            {entry.title}
                          </h3>
                          <span className="meta shrink-0 text-muted">{entry.date}</span>
                        </div>

                        {entry.place ? <p className="meta mt-2 text-muted">{entry.place}</p> : null}
                        {entry.description ? (
                          <p className="mt-3 max-w-[46ch] text-small text-muted">{entry.description}</p>
                        ) : null}
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Reveal className="border-t border-rule pt-10">
        <p className="text-headline max-w-[20ch] font-medium">
          There are more photographs than there are stories.
        </p>
        <div className="mt-8">
          <ArrowLinkLarge href="/gallery" cursorState="open">
            Open the gallery
          </ArrowLinkLarge>
        </div>
      </Reveal>
    </div>
  );
}
