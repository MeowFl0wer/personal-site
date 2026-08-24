"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { useMotion } from "./MotionProvider";

/**
 * Soft snap for the Work index.
 *
 * CSS `scroll-snap` is not an option here: it fights Lenis for control of the
 * scroll position and the result stutters. So the snap is advisory and runs
 * *after* the user has stopped — Lenis stays the only thing that ever moves the
 * page.
 *
 * Rules that keep it from feeling like a trap:
 *  - it only fires once scrolling has genuinely settled;
 *  - it only pulls if the nearest item is already close (`maxPull`), so a
 *    deliberate long scroll is never yanked back;
 *  - any real input cancels an in-flight snap immediately.
 */
export function SoftSnap({
  /** Elements to snap to. */
  selector = "[data-snap-item]",
  /** Distance from the top of the viewport the item should settle at, in px. */
  offset = 0,
  /** Ignore items further away than this fraction of the viewport height. */
  maxPull = 0.14,
  /** Milliseconds of stillness before the snap is allowed to fire. */
  settleDelay = 220,
}: {
  selector?: string;
  offset?: number;
  maxPull?: number;
  settleDelay?: number;
}) {
  const lenis = useLenis();
  const { motion, ready } = useMotion();
  const snapping = useRef(false);

  useEffect(() => {
    if (!ready || !motion || !lenis) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const settle = () => {
      if (snapping.current) return;

      const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
      if (items.length === 0) return;

      const threshold = window.innerHeight * maxPull;
      let best: HTMLElement | null = null;
      let bestDelta = Infinity;

      for (const item of items) {
        const delta = item.getBoundingClientRect().top - offset;
        if (Math.abs(delta) < Math.abs(bestDelta)) {
          bestDelta = delta;
          best = item;
        }
      }

      // Already there, or too far to be what the user meant. The threshold is
      // deliberately tight: a snap that reaches half a screen stops reading as
      // an assist and starts reading as the page taking the scroll off you.
      if (!best || Math.abs(bestDelta) < 4 || Math.abs(bestDelta) > threshold) return;

      snapping.current = true;
      lenis.scrollTo(best, {
        offset: -offset,
        duration: 0.55,
        easing: (t: number) => 1 - Math.pow(1 - t, 3), // matches ease.primary's tail
        lock: false,
        onComplete: () => {
          snapping.current = false;
        },
      });
    };

    const onScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(settle, settleDelay);
    };

    // Any deliberate input aborts an in-flight snap rather than fighting it.
    const cancel = () => {
      if (!snapping.current) return;
      snapping.current = false;
      lenis.stop();
      lenis.start();
    };

    lenis.on("scroll", onScroll);
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel);

    return () => {
      if (timer) clearTimeout(timer);
      lenis.off("scroll", onScroll);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
      snapping.current = false;
    };
  }, [lenis, motion, ready, selector, offset, maxPull, settleDelay]);

  return null;
}
