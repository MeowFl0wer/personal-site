"use client";

/**
 * Opens the browser print dialog. The print stylesheet in globals.css turns the
 * page you are already looking at into an A4 document — there is no second PDF
 * to maintain, and no separate resume content anywhere in this repo.
 */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      data-print="hide"
      className="meta link-underline text-muted transition-colors hover:text-ink"
    >
      Print / Save PDF
    </button>
  );
}
