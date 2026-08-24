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

      {/* Two columns rather than two stacked sections. Use and Built are the
          same page answering the same question from opposite ends, and stacking
          them meant scrolling past all of one to reach the other. Side by side,
          the whole answer is one screen.

          They stay stacked below lg: at six columns each half is too narrow for
          a two-column list of tool names to hold together. */}
      <div className="grid-12 mt-[clamp(4rem,12vh,9rem)] gap-x-[clamp(2rem,4vw,5rem)] gap-y-[clamp(3.5rem,10vh,7rem)]">
        {used.length > 0 ? (
          <section className="col-span-4 md:col-span-6 lg:col-span-6">
            <Reveal>
              <h2 className="meta">Use</h2>
            </Reveal>
            <RuleReveal className="mt-4 mb-12" />
            <UsedToolList groups={used} />
          </section>
        ) : null}

        {builtItems.length > 0 ? (
          <section className="col-span-4 md:col-span-6 lg:col-span-6">
            <Reveal>
              <h2 className="meta">Built</h2>
            </Reveal>
            <RuleReveal className="mt-4 mb-8" />
            <BuiltToolList tools={builtItems} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
