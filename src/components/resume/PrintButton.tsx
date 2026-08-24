"use client";

import { cn } from "@/lib/utils";

/**
 * Opens the browser print dialog. The print stylesheet in globals.css turns the
 * page you are already looking at into an A4 document — there is no second PDF
 * to maintain, and no separate resume content anywhere in this repo.
 *
 * The one framed control on the site. It is an outline rather than a fill: the
 * page is warm paper and a solid black slab would sit on top of it instead of
 * in it. Hovering inverts it, which is where the fill earns its place — as the
 * response, not the resting state. Square corners, no shadow.
 */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-print="hide"
      className={cn(
        "group inline-flex items-center gap-3 border border-ink px-5 py-3",
        "text-small font-medium text-ink",
        "transition-colors duration-[--duration-fast] hover:bg-ink hover:text-paper",
        className,
      )}
    >
      Download CV
      <span
        aria-hidden="true"
        className="inline-block transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-y-0.5"
      >
        ↓
      </span>
    </button>
  );
}
