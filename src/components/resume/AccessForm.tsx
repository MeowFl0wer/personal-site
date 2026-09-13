"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * The fields, shared by the dialog and by the prompt at the foot of the page.
 *
 * Both exist on purpose. The dialog is what a covered passage opens, and it
 * arrives where the reader is already looking; the prompt at the foot is what
 * someone finds when they have read the whole page and want to know what they
 * are missing — and it is the one that still works with scripting off, since
 * no dialog opens then.
 *
 * A plain GET form either way, so unlocking is a navigation: no fetch, no
 * state, nothing to undo when a code is refused.
 */
const MESSAGES: Record<string, string> = {
  unknown: "That code is not one of mine.",
  expired: "That code has expired. Ask me for another.",
  revoked: "That code has been turned off.",
  throttled: "Too many tries. Wait ten minutes.",
};

function Message() {
  const status = useSearchParams().get("access");
  const message = status ? MESSAGES[status] : null;
  if (!message) return null;
  return (
    <p className="text-small text-accent" role="alert">
      {message}
    </p>
  );
}

export function AccessForm({
  next = "/about",
  onCancel,
  className,
  demoCode,
}: {
  next?: string;
  /** Only the dialog has somewhere to go back to. */
  onCancel?: () => void;
  className?: string;
  /** Set on the demonstration, where there is no server to check a code
      against and the form simply turns the switch off. */
  demoCode?: string;
}) {
  const [refused, setRefused] = useState(false);

  const onDemoSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!demoCode) return;
    event.preventDefault();
    const typed = new FormData(event.currentTarget).get("code");
    if (String(typed ?? "").trim().toUpperCase() !== demoCode.toUpperCase()) {
      setRefused(true);
      return;
    }
    document.documentElement.dataset.demoMask = "off";
    try {
      window.localStorage.setItem("demo-mask", "off");
    } catch {
      // Private windows throw; the switch still applies to this page.
    }
    document.querySelectorAll("dialog[open]").forEach((element) => {
      if (element instanceof HTMLDialogElement) element.close();
    });
  };

  return (
    <form
      method="get"
      action="/unlock"
      onSubmit={demoCode ? onDemoSubmit : undefined}
      className={cn("flex flex-col gap-4", className)}
    >
      <input type="hidden" name="next" value={next} />

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
          "py-1.5 font-mono tracking-[0.16em] uppercase outline-none",
          "placeholder:text-muted/50 placeholder:tracking-[0.14em]",
        ].join(" ")}
      />

      {/* useSearchParams opts its subtree out of the static render; without the
          boundary the whole page would be dragged dynamic with it. */}
      {demoCode ? (
        refused ? (
          <p className="text-small text-accent" role="alert">
            Not the demo code. It is on the page below.
          </p>
        ) : null
      ) : (
        <Suspense fallback={null}>
          <Message />
        </Suspense>
      )}

      <div className="mt-1 flex items-center justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-small text-muted hover:text-ink px-3 py-1.5 transition-colors duration-[--duration-fast]"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className={[
            "text-small border-ink text-ink border px-4 py-1.5",
            "transition-colors duration-[--duration-fast]",
            "hover:bg-ink hover:text-paper",
          ].join(" ")}
        >
          Unlock
        </button>
      </div>
    </form>
  );
}
