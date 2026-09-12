"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

/**
 * The one prompt on the page, shared by everything covered.
 *
 * A plain GET form, so it works with scripting off — the same reason the rest
 * of the site does. What needs the client is only the message after a code is
 * refused: the unlock route sends the reason back as a query parameter, and
 * reading that on the server would make /about dynamic, which the static
 * export refuses outright. So the form renders statically and the one line of
 * feedback arrives with the client.
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

export function AccessPrompt({ next = "/about" }: { next?: string }) {
  return (
    <form
      method="get"
      action="/unlock"
      data-print="hide"
      className="flex flex-col gap-3 border-t border-rule pt-6"
    >
      <input type="hidden" name="next" value={next} />

      <p className="text-small max-w-[48ch] text-muted">
        The covered parts are my name, where I have worked and studied, and what the projects
        actually were. If I have given you a code, it goes here.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="access-code" className="meta text-muted">
          Access code
        </label>
        <input
          id="access-code"
          name="code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={32}
          className="text-small border-b border-rule-strong bg-transparent py-1 font-mono tracking-[0.14em] uppercase outline-none focus:border-ink"
        />
        <button
          type="submit"
          className="text-small border border-ink px-4 py-1.5 transition-colors duration-[--duration-fast] hover:bg-ink hover:text-paper"
        >
          Unlock
        </button>
      </div>

      {/* Suspense because useSearchParams opts its subtree out of the static
          render; without it the whole page would be dragged dynamic with it. */}
      <Suspense fallback={null}>
        <Message />
      </Suspense>
    </form>
  );
}
