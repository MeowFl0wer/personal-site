import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLifeEntry, getLifeEntries, lifeFigures, toMedia } from "@/lib/cms";
import { SectionNumber } from "@/components/ui/SectionHeader";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Figure } from "@/components/ui/Meta";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = async () => {
  const entries = await getLifeEntries();
  return entries.map((entry) => ({ slug: entry.slug }));
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params;
  const entry = await getLifeEntry(slug);
  if (!entry) return {};
  return { title: entry.title, description: entry.description ?? undefined };
};

/**
 * A single field note.
 *
 * The whole body is blocks, so the arrangement is the admin's — but every
 * arrangement lands on the same grid, the same type scale and the same motion
 * system. `theme: dark` moves the page onto the void ground; it does not
 * introduce a new palette.
 */
export default async function LifeEntryPage({ params }: Params) {
  const { slug } = await params;
  const entry = await getLifeEntry(slug);
  if (!entry) notFound();

  const cover = toMedia(entry.cover, entry.title);
  const figures = lifeFigures(entry);
  const dark = entry.theme === "dark";

  return (
    <article className={cn(dark && "on-void bg-void pb-[clamp(4rem,12vh,9rem)]")}>
      <div className="shell pt-10 md:pt-16">
        <Reveal>
          <SectionNumber index="02" label={entry.category} />
        </Reveal>
        <RuleReveal className="mt-4" />

        <div className="grid-12 mt-12 items-end gap-y-8 md:mt-16">
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-7">
            <h1 className="text-display max-w-[16ch] font-medium">{entry.title}</h1>
            {entry.description ? (
              <p className="text-lead pretty mt-6 max-w-[48ch] text-muted">{entry.description}</p>
            ) : null}
          </Reveal>

          <Reveal className="col-span-4 flex flex-col gap-6 md:col-span-6 lg:col-span-4 lg:col-start-9" delay={0.08}>
            <div className="flex flex-col gap-2">
              {entry.date ? <span className="meta text-muted">{entry.date}</span> : null}
              {entry.place ? <span className="text-small">{entry.place}</span> : null}
              {entry.coordinates ? <span className="meta text-muted">{entry.coordinates}</span> : null}
            </div>

            {figures.length > 0 ? (
              <dl className="flex flex-wrap gap-x-10 gap-y-4">
                {figures.map((figure) => (
                  <Figure key={figure.label} label={figure.label} value={figure.value} />
                ))}
              </dl>
            ) : null}
          </Reveal>
        </div>

        {cover ? (
          <Reveal className="mt-14 md:mt-20">
            <Parallax className="aspect-[16/9] w-full">
              <MediaFrame media={cover} className="h-full" ratio="16 / 9" sizes="100vw" priority />
            </Parallax>
          </Reveal>
        ) : null}

        <div className="mt-[clamp(4rem,10vh,8rem)]">
          <BlockRenderer blocks={entry.layout} />
        </div>

        <nav className="mt-[clamp(4rem,12vh,9rem)] border-t border-rule pt-8" aria-label="Life">
          <ArrowLink href="/life" arrow="←" className="text-small">
            All field notes
          </ArrowLink>
        </nav>
      </div>
    </article>
  );
}
