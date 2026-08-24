import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The site's only link affordance: a word, a rule that draws itself on hover,
 * and an arrow. No buttons, no pills, no filled rectangles.
 */
export function ArrowLink({
  href,
  children,
  external,
  className,
  arrow = "→",
  cursorState,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
  arrow?: "→" | "↗" | "←" | null;
  cursorState?: string;
}) {
  const back = arrow === "←";

  const marker = arrow ? (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block transition-transform duration-[--duration-ui] ease-[--ease-primary]",
        back ? "group-hover:-translate-x-1" : "group-hover:translate-x-1",
      )}
    >
      {arrow}
    </span>
  ) : null;

  // A back arrow leads; every other arrow follows.
  const content = back ? (
    <>
      {marker}
      <span className="link-underline">{children}</span>
    </>
  ) : (
    <>
      <span className="link-underline">{children}</span>
      {marker}
    </>
  );

  const classes = cn("group inline-flex items-baseline gap-2", className);
  const state = cursorState ?? (external ? "external" : undefined);

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
        data-cursor-state={state}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} data-cursor-state={state}>
      {content}
    </Link>
  );
}

/** Big display-size version, used at the end of home page sections. */
export function ArrowLinkLarge(props: Parameters<typeof ArrowLink>[0]) {
  return <ArrowLink {...props} className={cn("text-title font-medium", props.className)} />;
}
