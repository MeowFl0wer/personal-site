import type { Metadata } from "next";
import Link from "next/link";
import { getLifeEntries, toMedia } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink, ArrowLinkLarge } from "@/components/ui/ArrowLink";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { LifeCard } from "@/components/life/LifeCard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Life",
  description: "Away from the screen. Places I've been, trails I've walked, things worth remembering.",
};

/** Large, editorial treatment. Everything after this is a compact card. */
const FEATURED = 6;
/** Compact cards shown before the rest moves behind Earlier posts → More. */
const EARLIER = 12;

/**
 * Life / Field Notes — the index.
 *
 * One flow, not three buckets. It used to group by category — Photography,
 * Travel, Outdoors — which forced every note to declare which of three things it
 * was before it could be published, and quietly made those three the only
 * things this page could ever hold. A note about a bike, a week with no signal
 * or a market with no dinner is none of them. The category still exists on the
 * document for the CMS to sort by; the index simply no longer builds walls out
 * of it.
 *
 * What replaces it is a size hierarchy, which is what a magazine actually does:
 * six notes at full editorial size, the next twelve as compact cards, the rest
 * one click away. Parallax is the only effect, and only on the six.
 */
export default async function LifePage() {
  const entries = await getLifeEntries();

  const featured = entries.slice(0, FEATURED);
  const earlier = entries.slice(FEATURED, FEATURED + EARLIER);
  const hasArchive = entries.length > FEATURED + EARLIER;

  return (
    <div className="shell pt-10 md:pt-16">
      <SectionHeader
        index="03"
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
        <div className="grid-12 mt-[clamp(4rem,12vh,9rem)] gap-y-[clamp(3rem,9vh,7rem)]">
          {featured.map((entry, index) => {
            const cover = toMedia(entry.cover, entry.title);
            // A repeating four-step rhythm keeps the page staggered without
            // ever being random.
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
      )}

      {earlier.length > 0 ? (
        <section className="mt-[clamp(4rem,12vh,9rem)]">
          <Reveal>
            <h2 className="meta">Earlier posts</h2>
          </Reveal>
          <RuleReveal className="mt-4 mb-10" />

          {/* Three across on a wide screen, two at tablet, one on a phone —
              the card is an image beside two lines of text, and below about
              280px wide that stops being readable and starts being a stack. */}
          <div className="grid-12 gap-x-8 gap-y-10">
            {earlier.map((entry, index) => (
              <Reveal
                key={entry.id}
                className="col-span-4 md:col-span-3 lg:col-span-4"
                delay={(index % 3) * 0.04}
              >
                <LifeCard
                  href={`/life/${entry.slug}`}
                  cover={toMedia(entry.cover, entry.title)}
                  title={entry.title}
                  date={entry.date}
                  description={entry.description}
                />
              </Reveal>
            ))}
          </div>

          {hasArchive ? (
            <Reveal className="mt-12 flex justify-end" delay={0.06}>
              <ArrowLink href="/life/archive" className="text-small" cursorState="view">
                More
              </ArrowLink>
            </Reveal>
          ) : null}
        </section>
      ) : null}

      <Reveal className="mt-[clamp(4rem,12vh,9rem)] border-t border-rule pt-10">
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
