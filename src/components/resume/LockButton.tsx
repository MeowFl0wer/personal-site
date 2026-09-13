"use client";

import { ACCESS_DIALOG_ID } from "./AccessDialog";

/**
 * The affordance on a covered passage.
 *
 * It lies over the whole fragment rather than sitting beside it, so the target
 * is the thing you were looking at. The lock itself only appears under the
 * pointer or on focus: with a record broken into this many fragments, a lock
 * standing on every one of them would be a page of padlocks.
 *
 * The `em` sizing matters — these wrap everything from a display-sized name to
 * a date in mono, and a fixed 16px lock is enormous on one and lost on the
 * other.
 */
export function LockButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={`${label} — locked. Enter an access code to read it.`}
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
          // Nothing hovers on a touch screen, so there the lock simply stands.
          "[@media(hover:none)]:opacity-90",
          // Glass: a pale fill, a lit top edge, and a soft drop beneath it.
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
