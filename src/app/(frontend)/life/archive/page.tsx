import type { Metadata } from "next";
import Link from "next/link";
import { getLifeEntries, lifeImages } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/motion/Reveal";
import { ArchiveVelocity } from "@/components/life/ArchiveVelocity";
import { PhotoCluster, CLUSTER_MAX } from "@/components/life/PhotoCluster";

export const metadata: Metadata = {
  title: "Life — Archive",
  description: "Every field note, in order.",
};

/**
 * The whole index, one note per row.
 *
 * /life is edited: six large, twelve compact, the rest here. This page is the
 * opposite — no hierarchy, no rhythm, nothing dropped. It is the page you open
 * when you already know roughly what you are looking for.
 *
 * The measure is narrower than the shell and the rows are twice the height they
 * were. Both are the same decision: a row is now a set of photographs rather
 * than one thumbnail, and a set needs room to be read as a set. Pulling the
 * column in also gives the rows a centre line to pinch toward — see
 * ArchiveVelocity, the one effect on this page.
 */
export default async function LifeArchivePage() {
  const entries = await getLifeEntries();

  return (
    <div className="shell pt-10 md:pt-16">
      <SectionHeader
        index="03.2"
        label="Archive"
        lead={["Everything, in order."]}
        aside={
          <ArrowLink href="/life" arrow="←" className="text-small">
            Life
          </ArrowLink>
        }
      />

      {entries.length === 0 ? (
        <p className="text-headline mt-20 text-muted">Nothing published yet.</p>
      ) : (
        <ArchiveVelocity className="mx-auto mt-[clamp(3rem,9vh,6rem)] w-full max-w-[1080px]">
          <Reveal stagger="block">
            <ul className="border-t border-rule">
              {entries.map((entry) => {
                // The real count, not one-more-than-we-draw: "+2 inside" has
                // to be the number of photographs actually waiting on the note.
                const images = lifeImages(entry);
                const extra = images.length - CLUSTER_MAX;

                return (
                  <li key={entry.id} className="border-b border-rule">
                    {/* The transform sits on this inner element, not the <li>:
                        scaling the list item would drag its border with it and
                        the rules would visibly shrink as the row passed. */}
                    <div
                      data-archive-row
                      data-reveal-item
                      style={{ willChange: "transform", transformOrigin: "center center" }}
                    >
                      <Link
                        href={`/life/${entry.slug}`}
                        data-cursor-state="view"
                        className="group grid-12 items-center gap-x-8 gap-y-6 py-9 md:py-11"
                      >
                        <div className="col-span-4 md:col-span-2 lg:col-span-4">
                          <PhotoCluster images={images} title={entry.title} />
                        </div>

                        <div className="col-span-4 md:col-span-4 lg:col-span-6">
                          <h2 className="text-title font-medium transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-x-1">
                            {entry.title}
                          </h2>

                          {entry.description ? (
                            <p className="mt-2 line-clamp-2 max-w-[52ch] text-small text-muted">
                              {entry.description}
                            </p>
                          ) : null}

                          <div className="meta mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-muted">
                            {entry.place ? <span>{entry.place}</span> : null}
                            {extra > 0 ? (
                              <span className="opacity-70">+{extra} inside</span>
                            ) : null}
                          </div>
                        </div>

                        <p className="meta col-span-4 text-muted md:col-span-6 lg:col-span-2 lg:justify-self-end">
                          {entry.date}
                        </p>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </ArchiveVelocity>
      )}

      <Reveal className="mx-auto mt-14 flex w-full max-w-[1080px] justify-end">
        <ArrowLink href="/life" arrow="←" className="text-small">
          Back to Life
        </ArrowLink>
      </Reveal>
    </div>
  );
}
