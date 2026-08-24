import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, getProjects, getNextProject, toMediaOrFallback } from "@/lib/cms";
import { SectionNumber } from "@/components/ui/SectionHeader";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { MetaItem, MetaRow } from "@/components/ui/Meta";
import { ArrowLink, ArrowLinkLarge } from "@/components/ui/ArrowLink";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { pad } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export const generateStaticParams = async () => {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: project.slug }));
};

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary };
};

/**
 * Case study template.
 *
 * The Work index is the loud page; this one is not. Reveals and a hairline are
 * the entire motion budget, because the job of this page is to be read.
 *
 * The body is whatever blocks the CMS holds — adding a case study never means
 * writing MDX or touching a component again.
 */
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();

  const next = await getNextProject(slug);
  const index = projects.findIndex((item) => item.slug === slug);
  const cover = toMediaOrFallback(project.cover, `${project.title} — cover image`);

  return (
    <article className="shell pt-10 md:pt-16">
      <Reveal>
        <SectionNumber index={pad(Math.max(index, 0) + 1)} label="Case study" />
      </Reveal>
      <RuleReveal className="mt-4" />

      <Reveal className="mt-10 md:mt-16">
        <h1 className="text-display max-w-[16ch] font-medium">{project.title}</h1>
      </Reveal>

      <Reveal className="mt-12 md:mt-16" delay={0.05}>
        <MetaRow>
          <MetaItem label="Role">{project.role ?? "—"}</MetaItem>
          <MetaItem label="Year">{project.year}</MetaItem>
          <MetaItem label="Stack">{(project.stack ?? []).join(", ") || "—"}</MetaItem>
          <MetaItem label="Link">
            {project.projectUrl ? (
              <ArrowLink href={project.projectUrl} external arrow="↗">
                {new URL(project.projectUrl).hostname}
              </ArrowLink>
            ) : project.githubUrl ? (
              <ArrowLink href={project.githubUrl} external arrow="↗">
                GitHub
              </ArrowLink>
            ) : (
              <span className="text-muted">—</span>
            )}
          </MetaItem>
        </MetaRow>
      </Reveal>

      <Reveal className="mt-14 md:mt-20" delay={0.1}>
        <MediaFrame media={cover} ratio="16 / 9" sizes="100vw" priority />
      </Reveal>

      <div className="mt-[clamp(4rem,10vh,8rem)]">
        <BlockRenderer blocks={project.layout} />
      </div>

      <nav className="mt-[clamp(5rem,14vh,11rem)] border-t border-rule pt-8" aria-label="Project">
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <ArrowLink href="/work" arrow="←" className="text-small">
            All work
          </ArrowLink>

          {next ? (
            <ArrowLinkLarge href={`/work/${next.slug}`} cursorState="view">
              Next — {next.title}
            </ArrowLinkLarge>
          ) : null}
        </div>
      </nav>
    </article>
  );
}
