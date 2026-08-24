import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLifeEntries, toMedia } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Life — Archive",
  description: "Every field note, in order.",
};

/**
 * The whole index, one note per row.
 *
 * /life is edited: six large, twelve compact, the rest here. This page is the
 * opposite — no hierarchy, no rhythm, nothing dropped. It is the page you open
 * when you already know roughly what you are looking for, so the job is density
 * and a scannable left edge, not composition.
 */
export default async function LifeArchivePage() {
  const entries = await getLifeEntries();

  return (
    <div className="shell pt-10 md:pt-16">
      <SectionHeader
        index="02.2"
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
        <Reveal className="mt-[clamp(3rem,9vh,6rem)]" stagger="block">
          <ul className="border-t border-rule">
            {entries.map((entry) => {
              const cover = toMedia(entry.cover, entry.title);

              return (
                <li key={entry.id} data-reveal-item className="border-b border-rule">
                  <Link
                    href={`/life/${entry.slug}`}
                    data-cursor-state="view"
                    className="group grid-12 items-center gap-y-3 py-5"
                  >
                    <div className="col-span-1">
                      {cover ? (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.06]">
                          <Image
                            src={cover.src}
                            alt={cover.alt}
                            fill
                            sizes="120px"
                            className="object-cover transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:scale-[1.04]"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="col-span-3 md:col-span-3 lg:col-span-6">
                      <h2 className="text-title font-medium transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-x-1">
                        {entry.title}
                      </h2>
                      {entry.description ? (
                        <p className="mt-1.5 line-clamp-1 max-w-[62ch] text-small text-muted">
                          {entry.description}
                        </p>
                      ) : null}
                    </div>

                    {entry.place ? (
                      <p className="meta col-span-2 text-muted md:col-span-1 lg:col-span-2">
                        {entry.place}
                      </p>
                    ) : (
                      <span className="col-span-2 md:col-span-1 lg:col-span-2" />
                    )}

                    <p className="meta col-span-2 text-muted md:col-span-1 lg:col-span-3 lg:justify-self-end">
                      {entry.date}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      )}

      <Reveal className="mt-14 flex justify-end">
        <ArrowLink href="/life" arrow="←" className="text-small">
          Back to Life
        </ArrowLink>
      </Reveal>
    </div>
  );
}
