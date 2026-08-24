import { getFeaturedProjects, projectCover } from "@/lib/cms";
import { ProjectList } from "@/components/work/ProjectList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLinkLarge } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/motion/Reveal";

export async function SelectedWork({ index, label }: { index: string; label: string }) {
  const projects = await getFeaturedProjects();
  if (projects.length === 0) return null;

  // Flattened here so the list component stays a plain client component that
  // knows nothing about Payload.
  const items = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    year: project.year,
    discipline: project.discipline,
    summary: project.summary,
    cover: projectCover(project),
  }));

  return (
    <section className="shell section">
      <SectionHeader index={index} label={label} />

      <div className="mt-12 md:mt-16">
        <ProjectList projects={items} />
      </div>

      <Reveal className="mt-10 flex justify-end" delay={0.1}>
        <ArrowLinkLarge href="/work">View all work</ArrowLinkLarge>
      </Reveal>
    </section>
  );
}
