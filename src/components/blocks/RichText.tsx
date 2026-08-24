import {
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Lexical → the site's typography.
 *
 * The editor's toolbar is deliberately ordinary — bold, italic, links, lists,
 * two heading levels. What matters is that none of those map to a font size or
 * a colour here: they map to the same type scale every hand-written page uses,
 * so CMS prose and coded prose are indistinguishable.
 */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    if (children.length === 0) return null;
    return <p className="text-lead pretty mb-5 last:mb-0 text-ink/90">{children}</p>;
  },
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    if (node.tag === "h2") {
      return <h2 className="text-headline mt-12 mb-4 font-medium first:mt-0">{children}</h2>;
    }
    return <h3 className="text-title mt-8 mb-3 font-medium first:mt-0">{children}</h3>;
  },
  quote: ({ node, nodesToJSX }) => (
    <blockquote className="my-8 border-l border-rule pl-6 text-lead text-muted">
      {nodesToJSX({ nodes: node.children })}
    </blockquote>
  ),
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    const url = node.fields?.url ?? "#";
    const external = /^https?:\/\//.test(url);

    if (external) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          data-cursor-state="external"
          className="link-underline"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={url} className="link-underline">
        {children}
      </Link>
    );
  },
});

export function RichText({
  data,
  className,
}: {
  data?: SerializedEditorState | null;
  className?: string;
}) {
  if (!data) return null;

  return (
    <div className={cn("max-w-[62ch]", className)}>
      <LexicalRichText data={data} converters={converters} />
    </div>
  );
}
