"use client";

import Link from "next/link";
import { VelocityMedia } from "@/components/motion/VelocityMedia";
import { SoftSnap } from "@/components/motion/SoftSnap";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { pad } from "@/lib/utils";
import type { Media } from "@content/types";

/** Flat shape mapped from the CMS by the page. */
export type WorkIndexItem = {
  slug: string;
  title: string;
  year: string;
  discipline: string;
  summary: string;
  cover: Media;
};

/**
 * The Work index: a project index with immersive media, not a grid of cards.
 *
 * Each entry is a snap target, and each entry's media passes through
 * VelocityMedia so it stretches and skews with scroll speed. Both effects read
 * the same global velocity signal, so they cannot disagree with each other.
 *
 * The alternating column placement is the only editorial trick here — the
 * heading baseline and the mono meta line stay in identical positions on every
 * entry so the page still scans as a list.
 */
export function WorkIndex({ projects }: { projects: WorkIndexItem[] }) {
  return (
    <>
      {/* Snap to the top of each entry, clearing the sticky nav. */}
      <SoftSnap selector="[data-snap-item]" offset={96} />

      <ol className="mt-16 md:mt-24">
        {projects.map((project, index) => {
          const flipped = index % 2 === 1;

          return (
            <li
              key={project.slug}
              data-snap-item
              className="border-t border-rule pt-8 pb-[clamp(4rem,12vh,10rem)]"
            >
              <Link
                href={`/work/${project.slug}`}
                data-cursor-state="view"
                className="group block"
              >
                <div className="grid-12 gap-y-8">
                  {/* Meta column — fixed position on every entry. */}
                  <div className="col-span-4 flex items-baseline justify-between md:col-span-6 lg:col-span-12">
                    <span className="meta text-muted">{pad(index + 1)}</span>
                    <span className="meta text-muted">{project.year}</span>
                  </div>

                  <div
                    className={
                      flipped
                        ? "col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:row-start-2"
                        : "col-span-4 md:col-span-6 lg:col-span-4"
                    }
                  >
                    <h2 className="text-display font-medium">
                      <span className="inline-block transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-x-2">
                        {project.title}
                      </span>
                    </h2>
                    <p className="meta mt-4 text-muted">{project.discipline}</p>
                    <p className="mt-6 max-w-[36ch] text-small text-muted">{project.summary}</p>
                  </div>

                  <div
                    className={
                      flipped
                        ? "col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-1 lg:row-start-2"
                        : "col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-6"
                    }
                  >
                    <VelocityMedia>
                      <MediaFrame
                        media={project.cover}
                        ratio="8 / 5"
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        priority={index === 0}
                      />
                    </VelocityMedia>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
