import type { Metadata } from "next";
import { getProjects, projectCover } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WorkIndex } from "@/components/work/WorkIndex";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects, experiments and things I've built.",
};

export default async function WorkPage() {
  const projects = await getProjects();

  const items = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    year: project.year,
    discipline: project.discipline,
    summary: project.summary,
    cover: projectCover(project),
  }));

  return (
    <div className="shell section pt-10 md:pt-16">
      <SectionHeader
        index="01"
        label="Work"
        lead={["Selected projects,", "experiments and", "things I've built."]}
        aside={
          <span className="meta text-muted">
            {items.length} {items.length === 1 ? "project" : "projects"}
          </span>
        }
      />

      {items.length > 0 ? (
        <WorkIndex projects={items} />
      ) : (
        <p className="text-headline mt-20 text-muted">Nothing published yet.</p>
      )}
    </div>
  );
}
