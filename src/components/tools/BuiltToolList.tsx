"use client";

import Image from "next/image";
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
 * Built tools.
 *
 * The entry stacks rather than running as a twelve-column row. This list lives
 * in one half of the page beside Use, and a row of four columns inside a
 * six-column container is four columns of two words each.
 *
 * The screenshot sits beside the words, not above them. It used to be carried
 * by a cursor preview and only appeared inline as the fallback; once that went
 * away and it showed for everyone, a full-width 16:10 plate turned each entry
 * into a poster and pushed the next tool off the screen. Held to a third of
 * the column it reads as what it is — a thumbnail of the thing, next to the
 * description of the thing.
 */
function ToolRow({ tool, index }: { tool: BuiltToolItem; index: number }) {
  const row = (
    <div className="flex items-start gap-[clamp(1rem,2.5vw,2rem)] border-b border-rule py-7">
      {/* The words, from the number to the last link. min-w-0 so a long stack
          line wraps instead of pushing the picture out of the column. */}
      <div className="min-w-0 flex-1">
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

      {/* Second in the source so a screen reader hears the tool's name before
          its picture, and on the right because that is where it belongs. */}
      {tool.preview ? (
        <div className="relative aspect-[4/3] w-[32%] max-w-[190px] shrink-0 overflow-hidden bg-ink/[0.06]">
          <Image
            src={tool.preview.src}
            alt={tool.preview.alt}
            fill
            sizes="(max-width: 768px) 30vw, 190px"
            className="object-cover"
          />
        </div>
      ) : null}
    </div>
  );

  // The row is deliberately not a single link: each tool has two destinations,
  // so the links stay explicit rather than making the whole row ambiguous.
  return <li data-reveal-item>{row}</li>;
}

export function BuiltToolList({ tools }: { tools: BuiltToolItem[] }) {
  return (
    <>
      {/* No border-t: the section heading above already draws the rule that
          opens this list, and two hairlines a gap apart read as a mistake. */}
      <Reveal stagger="block">
        <ul>
          {tools.map((tool, index) => (
            <ToolRow key={tool.id} tool={tool} index={index} />
          ))}
        </ul>
      </Reveal>
    </>
  );
}
