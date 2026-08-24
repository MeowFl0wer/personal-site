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
 *
 * The entry stacks rather than running as a twelve-column row. This list now
 * lives in one half of the page beside Use, and a row of four columns inside a
 * six-column container is four columns of two words each. The screenshot is
 * carried by the cursor preview on a pointer device and falls back to an inline
 * image everywhere else, which is the only place it costs vertical space.
 */
function ToolRow({ tool, index }: { tool: BuiltToolItem; index: number }) {
  const { enabled } = useHoverPreview();

  const row = (
    <div className="border-b border-rule py-7">
      {!enabled && tool.preview ? (
        <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden bg-ink/[0.06]">
          <Image
            src={tool.preview.src}
            alt={tool.preview.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="flex items-baseline gap-4">
        <span className="meta shrink-0 text-muted">{pad(index + 1)}</span>
        <h3 className="text-title font-medium">{tool.name}</h3>
      </div>

      <p className="mt-2 max-w-[46ch] text-small text-muted">{tool.description}</p>

      {tool.stack.length > 0 ? (
        <p className="meta mt-4 text-muted">{tool.stack.join(" / ")}</p>
      ) : null}

      {tool.links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
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
      ) : null}
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
      {/* No border-t: the section heading above already draws the rule that
          opens this list, and two hairlines a gap apart read as a mistake. */}
      <Reveal stagger="block">
        <ul>
          {tools.map((tool, index) => (
            <ToolRow key={tool.id} tool={tool} index={index} />
          ))}
        </ul>
      </Reveal>
    </HoverPreviewProvider>
  );
}
