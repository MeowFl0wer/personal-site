import { getLifeEntries, toMedia } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLinkLarge } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { MediaFrame } from "@/components/ui/MediaFrame";

/**
 * Home's quietest section by design — this is where the site slows down before
 * Tools and the footer. Two large images and one line of type.
 *
 * It used to end with a row of category names — Hiking, Travel, Photography,
 * Elsewhere — derived from whatever categories happened to exist. That is the
 * same three-buckets idea /life was rebuilt to get rid of, just printed on the
 * home page: it advertised the taxonomy as the subject, so anything outside it
 * looked like it did not belong here. The rule it sat on stays, because the
 * section still needs a line to close on before Explore life.
 */
export async function LifePreview({ index, label }: { index: string; label: string }) {
  const entries = await getLifeEntries();
  if (entries.length === 0) return null;

  const covers = entries
    .map((entry) => toMedia(entry.cover, entry.title))
    .filter((media): media is NonNullable<typeof media> => Boolean(media));

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

      <Reveal className="mt-16 flex justify-end border-t border-rule pt-8 md:mt-24" delay={0.1}>
        <ArrowLinkLarge href="/life">Explore life</ArrowLinkLarge>
      </Reveal>
    </section>
  );
}
