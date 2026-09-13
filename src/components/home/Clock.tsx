"use client";

import { useSyncExternalStore } from "react";

/**
 * The year in the hero's top-right corner, made current.
 *
 * An external store rather than state in an effect, because that is what the
 * time is: it lives outside React, it changes on its own, and every clock on
 * the page should agree. Reading it through useSyncExternalStore also gives
 * the server render an honest answer — nothing yet — so hydration has nothing
 * to disagree about, which a rendered timestamp always would.
 *
 * The tick is aligned to the wall clock rather than to whenever the first
 * render happened. A bare 1000ms interval drifts, and within a minute or two
 * the seconds visibly stop matching the system clock.
 */
const pad = (value: number) => String(value).padStart(2, "0");

const format = (date: Date) =>
  `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

const listeners = new Set<() => void>();
let snapshot = "";
let timer: number | undefined;

/* Cached, and only ever replaced on a tick. getSnapshot has to return the same
   value until something changes or React re-renders forever. */
const read = () => {
  if (!snapshot) snapshot = format(new Date());
  return snapshot;
};

const tick = () => {
  const now = new Date();
  snapshot = format(now);
  for (const listener of listeners) listener();
  timer = window.setTimeout(tick, 1000 - now.getMilliseconds());
};

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  if (timer === undefined) timer = window.setTimeout(tick, 1000 - new Date().getMilliseconds());
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };
};

export function Clock({ fallback }: { fallback: string }) {
  const value = useSyncExternalStore(subscribe, read, () => null);

  if (!value) {
    // The same nineteen characters, so the corner is the right size already.
    return (
      <p className="meta text-muted tabular-nums" aria-hidden="true">
        {fallback}
      </p>
    );
  }

  const seconds = value.slice(-2);
  const rest = value.slice(0, -2);

  return (
    <p className="meta text-muted flex items-baseline tabular-nums">
      {/* Read once, not once a second: a live region here would announce the
          time to a screen reader on every tick. */}
      <span className="sr-only">{value}</span>

      <span aria-hidden="true">{rest}</span>

      <span aria-hidden="true" className="inline-flex overflow-hidden">
        {seconds.split("").map((digit, index) => (
          <span
            // Keyed on the value, so a changed digit is a new element and the
            // animation runs again — and on the position too, or the two
            // digits would swap places whenever they matched.
            key={`${index}-${digit}`}
            className="animate-[digit-roll_var(--duration-fast)_var(--ease-primary)] inline-block"
          >
            {digit}
          </span>
        ))}
      </span>
    </p>
  );
}
