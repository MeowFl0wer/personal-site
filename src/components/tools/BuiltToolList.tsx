"use client";

import Image from "next/image";
import {
  HoverPreviewProvider,
  HoverPreviewTrigger,
  useHoverPreview,
} from "@/components/motion/HoverPreview";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { pad } from "@/lib/utils";
import type { Media } from "@content/types";

/** Flat shape mapped from the CMS by the page. */
export type BuiltToolItem = {
  id: string;
  name: string;
  description: string;
  stack: string[];
  preview?: Media;
  links: { label: string; href: string; external?: boolean }[];
};

/**
 * Built tools — the third consumer of the shared HoverPreview, and the reason it
 * was built as a provider rather than baked into the work list.
 */
function ToolRow({ tool, index }: { tool: BuiltToolItem; index: number }) {
  const { enabled } = useHoverPreview();

  const row = (
    <div className="grid-12 items-start gap-y-4 border-b border-rule py-8">
      <span className="meta col-span-1 text-muted">{pad(index + 1)}</span>

      <div className="col-span-3 md:col-span-5 lg:col-span-5">
        <h3 className="text-title font-medium">{tool.name}</h3>
        <p className="mt-2 max-w-[42ch] text-small text-muted">{tool.description}</p>
        <p className="meta mt-4 text-muted">{tool.stack.join(" / ")}</p>
      </div>

      {!enabled && tool.preview ? (
        <div className="relative col-span-4 aspect-[16/10] overflow-hidden bg-ink/[0.06] md:col-span-3">
          <Image
            src={tool.preview.src}
            alt={tool.preview.alt}
            fill
            sizes="(max-width: 768px) 40vw, 25vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="col-span-4 hidden lg:col-span-3 lg:block" />
      )}

      <div className="col-span-4 flex flex-col items-start gap-2 md:col-span-3 lg:col-span-3 lg:items-end">
        {tool.links.map((link) => (
          <ArrowLink
            key={link.label}
            href={link.href}
            external={link.external}
            arrow="↗"
            className="text-small"
          >
            {link.label}
          </ArrowLink>
        ))}
      </div>
    </div>
  );

  // The row is deliberately not a single link: each tool has two destinations,
  // so the links stay explicit rather than making the whole row ambiguous.
  return (
    <li data-reveal-item>
      {tool.preview ? (
        <HoverPreviewTrigger media={tool.preview}>{row}</HoverPreviewTrigger>
      ) : (
        row
      )}
    </li>
  );
}

export function BuiltToolList({ tools }: { tools: BuiltToolItem[] }) {
  return (
    <HoverPreviewProvider>
      <Reveal stagger="block">
        <ul className="border-t border-rule">
          {tools.map((tool, index) => (
            <ToolRow key={tool.id} tool={tool} index={index} />
          ))}
        </ul>
      </Reveal>
    </HoverPreviewProvider>
  );
}
