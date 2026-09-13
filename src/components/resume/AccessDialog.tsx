"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/**
 * The one prompt, opened from any covered passage.
 *
 * A native <dialog>, so the browser handles the backdrop, the focus trap and
 * Escape, and a plain GET form inside it, so unlocking is a navigation rather
 * than a fetch — there is no state to get wrong and nothing to undo if it
 * fails. With scripting off the dialog never opens and the form at the foot of
 * the page still works; nothing here is the only way in.
 */
const MESSAGES: Record<string, string> = {
  unknown: "That code is not one of mine.",
  expired: "That code has expired. Ask me for another.",
  revoked: "That code has been turned off.",
  throttled: "Too many tries. Wait ten minutes.",
};

export const ACCESS_DIALOG_ID = "access-dialog";

function Message() {
  const status = useSearchParams().get("access");
  const dialog = useRef(false);

  /* A refused code arrives back as a query parameter on a fresh page, by which
     point the dialog someone typed it into is gone. Reopen it with the reason
     showing, rather than leaving them to find the prompt again. */
  useEffect(() => {
    if (!status || dialog.current) return;
    dialog.current = true;
    const element = document.getElementById(ACCESS_DIALOG_ID);
    if (element instanceof HTMLDialogElement && !element.open) element.showModal();
  }, [status]);

  const message = status ? MESSAGES[status] : null;
  if (!message) return null;
  return (
    <p className="text-small text-accent" role="alert">
      {message}
    </p>
  );
}

export function AccessDialog({ next = "/about" }: { next?: string }) {
  return (
    <dialog
      id={ACCESS_DIALOG_ID}
      data-print="hide"
      className={[
        "bg-paper text-ink m-auto w-[min(26rem,calc(100vw-2rem))] rounded-[10px] p-0",
        "shadow-[0_1px_2px_rgb(20_26_22/0.10),0_24px_60px_-24px_rgb(20_26_22/0.45)]",
        "ring-1 ring-white/60 backdrop:bg-ink/25 backdrop:backdrop-blur-[2px]",
      ].join(" ")}
    >
      <form method="get" action="/unlock" className="flex flex-col gap-4 p-6">
        <input type="hidden" name="next" value={next} />

        <div className="flex flex-col gap-2">
          <p className="meta text-muted">Private</p>
          <p className="text-small max-w-[34ch]">
            This part is not public. If I have given you an access code, it goes here.
          </p>
        </div>

        <input
          name="code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={32}
          aria-label="Access code"
          placeholder="ACCESS CODE"
          className={[
            "text-small border-rule-strong focus:border-ink w-full border-b bg-transparent",
            "py-1.5 font-mono tracking-[0.16em] uppercase outline-none placeholder:tracking-[0.14em]",
            "placeholder:text-muted/50",
          ].join(" ")}
        />

        <Suspense fallback={null}>
          <Message />
        </Suspense>

        <div className="mt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            /* formmethod="dialog" would submit; this simply closes. */
            onClick={(event) => event.currentTarget.closest("dialog")?.close()}
            className="text-small text-muted hover:text-ink px-3 py-1.5 transition-colors duration-[--duration-fast]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="text-small border-ink hover:bg-ink hover:text-paper border px-4 py-1.5 transition-colors duration-[--duration-fast]"
          >
            Unlock
          </button>
        </div>
      </form>
    </dialog>
  );
}
