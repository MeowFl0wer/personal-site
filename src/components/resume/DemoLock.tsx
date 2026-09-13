"use client";

import { ACCESS_DIALOG_ID } from "./AccessDialog";

/**
 * The lock on a demonstration passage.
 *
 * Same affordance as the real one, but it only exists while the switch is on —
 * CSS decides that, from the attribute on <html>, so the button can be in the
 * page from the start and cost nothing while the page is open.
 */
export function DemoLock({ label }: { label: string }) {
  return (
    <button
      type="button"
      data-demo-lock
      aria-label={`${label} — covered by the demonstration switch`}
      onClick={() => {
        const element = document.getElementById(ACCESS_DIALOG_ID);
        if (element instanceof HTMLDialogElement) element.showModal();
      }}
      className="group absolute inset-0 z-10 grid cursor-pointer place-items-center"
    >
      <span
        aria-hidden="true"
        className={[
          "flex items-center justify-center rounded-full opacity-0 transition-opacity",
          "duration-[--duration-fast] group-hover:opacity-100 group-focus-visible:opacity-100",
          "[@media(hover:none)]:opacity-90",
          "bg-white/55 ring-1 ring-white/70 backdrop-blur-[2px]",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.9),0_1px_4px_-1px_rgb(20_26_22/0.35)]",
          "size-[1.9em] max-h-9 max-w-9",
        ].join(" ")}
      >
        <svg viewBox="0 0 16 16" className="size-[0.95em] max-h-4 max-w-4" fill="none">
          <path
            d="M4.5 7V5.2a3.5 3.5 0 1 1 7 0V7"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <rect x="3" y="7" width="10" height="7" rx="1.6" fill="currentColor" opacity="0.85" />
        </svg>
      </span>
    </button>
  );
}
