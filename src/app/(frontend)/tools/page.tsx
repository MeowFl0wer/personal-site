import type { Metadata } from "next";
import { getBuiltTools, getUsedTools, toMedia } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";
import { BuiltToolList } from "@/components/tools/BuiltToolList";
import { UsedToolList } from "@/components/tools/UsedToolList";

export const metadata: Metadata = {
  title: "Tools",
  description: "Things I build, things I use.",
};

export default async function ToolsPage() {
  const [built, used] = await Promise.all([getBuiltTools(), getUsedTools()]);

  const builtItems = built.map((tool) => ({
    id: String(tool.id),
    name: tool.name,
    description: tool.description,
    stack: tool.stack ?? [],
    preview: toMedia(tool.screenshot, `${tool.name} screenshot`),
    links: [
      tool.github ? { label: "GitHub", href: tool.github, external: true } : null,
      tool.website ? { label: "Open", href: tool.website, external: true } : null,
    ].filter((link): link is { label: string; href: string; external: boolean } => link !== null),
  }));

  return (
    <div className="shell pt-10 md:pt-16">
      <SectionHeader index="03" label="Tools" lead={["Things I build,", "things I use."]} />

      {builtItems.length > 0 ? (
        <section className="mt-[clamp(4rem,12vh,9rem)]">
          <Reveal>
            <h2 className="meta">Built</h2>
          </Reveal>
          <RuleReveal className="mt-4 mb-10" />
          <BuiltToolList tools={builtItems} />
        </section>
      ) : null}

      {used.length > 0 ? (
        <section className="mt-[clamp(4rem,12vh,9rem)]">
          <Reveal>
            <h2 className="meta">Use</h2>
          </Reveal>
          <RuleReveal className="mt-4 mb-14" />
          <UsedToolList groups={used} />
        </section>
      ) : null}
    </div>
  );
}
