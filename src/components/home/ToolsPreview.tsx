import { getBuiltTools, getUsedTools } from "@/lib/cms";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowLinkLarge } from "@/components/ui/ArrowLink";
import { Reveal } from "@/components/motion/Reveal";

/** A preview only — the full lists, and the proximity field, live on /tools. */
export async function ToolsPreview({ index, label }: { index: string; label: string }) {
  const [built, used] = await Promise.all([getBuiltTools(), getUsedTools()]);
  if (built.length === 0 && used.length === 0) return null;

  const everyday = used.flatMap((group) => group.items).slice(0, 8);

  return (
    <section className="shell section">
      <SectionHeader index={index} label={label} lead={["Things I build", "and things I use."]} />

      <div className="grid-12 mt-16 gap-y-14 md:mt-24">
        <Reveal className="col-span-4 md:col-span-6 lg:col-span-5" stagger="tight">
          <p className="meta mb-6 text-muted">Built by me</p>
          <ul className="flex flex-col">
            {built.slice(0, 4).map((tool) => (
              <li key={tool.id} data-reveal-item className="border-t border-rule py-4">
                <span className="text-title font-medium">{tool.name}</span>
                <span className="mt-1 block text-small text-muted">{tool.description}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8" delay={0.1} stagger="tight">
          <p className="meta mb-6 text-muted">Everyday stack</p>
          <ul className="columns-2 gap-8">
            {everyday.map((item) => (
              <li key={item.name} data-reveal-item className="mb-2 text-small">
                {item.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal className="mt-16 flex justify-end" delay={0.1}>
        <ArrowLinkLarge href="/tools">All tools</ArrowLinkLarge>
      </Reveal>
    </section>
  );
}
