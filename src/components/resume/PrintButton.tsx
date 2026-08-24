"use client";

import { cn } from "@/lib/utils";

/**
 * Opens the browser print dialog. The print stylesheet in globals.css turns the
 * page you are already looking at into an A4 document — there is no second PDF
 * to maintain, and no separate resume content anywhere in this repo.
 *
 * It reads as "Download CV" because that is what the reader wants from it, but
 * it is deliberately still a link affordance rather than a filled button: the
 * site has exactly one of those (a word, a rule, an arrow) and a CV download is
 * not the thing to break it for.
 */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-print="hide"
      className={cn(
        "group inline-flex items-baseline gap-2 text-small text-ink transition-colors duration-[--duration-fast]",
        className,
      )}
    >
      <span className="link-underline font-medium">Download CV</span>
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-y-0.5"
      >
        ↓
      </span>
    </button>
  );
}
