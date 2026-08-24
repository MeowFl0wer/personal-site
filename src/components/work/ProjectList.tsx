"use client";

import Link from "next/link";
import Image from "next/image";
import { HoverPreviewProvider, HoverPreviewTrigger, useHoverPreview } from "@/components/motion/HoverPreview";
import { Reveal } from "@/components/motion/Reveal";
import { pad } from "@/lib/utils";
import type { Media } from "@content/types";

/** The flat shape the list needs. Server components map CMS docs into this. */
export type ProjectListItem = {
  slug: string;
  title: string;
  year: string;
  discipline: string;
  summary: string;
  cover: Media;
};

/**
 * The text-only project index used on the home page.
 *
 * Static state is a numbered list, a title, a year and a hairline. Nothing else.
 * The media only exists on hover, in the shared preview plate — which is what
 * lets this section stay quiet while still being the most alive thing on the page.
 *
 * Where there is no hover (touch, reduced motion), each row shows a small inline
 * thumbnail instead, so the same information is available by other means.
 */
function ProjectRow({ project, index }: { project: ProjectListItem; index: number }) {
  const { enabled } = useHoverPreview();

  return (
    <li data-reveal-item>
      <HoverPreviewTrigger media={project.cover}>
        <Link
          href={`/work/${project.slug}`}
          data-cursor-state="view"
          className="group block border-b border-rule py-6 md:py-8"
        >
          <div className="grid-12 items-center gap-y-3">
            <span className="meta col-span-1 text-muted">{pad(index + 1)}</span>

            <span className="col-span-3 md:col-span-5 lg:col-span-5">
              <span className="text-title block font-medium transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-x-2">
                {project.title}
              </span>
              <span className="mt-1 block text-small text-muted">{project.summary}</span>
            </span>

            {/* Inline thumbnail — the fallback path for touch and reduced motion. */}
            {!enabled ? (
              <span className="relative col-span-4 aspect-[16/10] overflow-hidden bg-ink/[0.06] md:col-span-3">
                <Image
                  src={project.cover.src}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 40vw, 25vw"
                  className="object-cover"
                />
              </span>
            ) : (
              <span className="meta col-span-4 hidden text-muted lg:col-span-3 lg:block">
                {project.discipline}
              </span>
            )}

            <span className="meta col-span-4 text-muted md:col-span-3 lg:col-span-3 lg:justify-self-end">
              {project.year}
            </span>
          </div>
        </Link>
      </HoverPreviewTrigger>
    </li>
  );
}

export function ProjectList({ projects }: { projects: ProjectListItem[] }) {
  return (
    <HoverPreviewProvider>
      <Reveal stagger="block">
        <ul className="border-t border-rule">
          {projects.map((project, index) => (
            <ProjectRow key={project.slug} project={project} index={index} />
          ))}
        </ul>
      </Reveal>
    </HoverPreviewProvider>
  );
}
