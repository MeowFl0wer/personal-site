"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotion } from "./MotionProvider";
import { scrollSignal } from "@/lib/scroll-signal";
import { VELOCITY_CLAMP } from "@/lib/motion";
import { clamp } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll authority for the whole site.
 *
 * Three things happen here and nowhere else:
 *
 * 1. Lenis smooths the scroll.
 * 2. GSAP's ticker drives Lenis' rAF — one loop, not two, so ScrollTrigger and
 *    Lenis can never be a frame apart (the usual source of scroll jitter).
 *    See github.com/darkroomengineering/lenis/discussions/366.
 * 3. The same loop publishes the normalised velocity into `scrollSignal`.
 *
 * Under reduced motion Lenis is configured as a pass-through (no wheel
 * smoothing, no lerp) and the velocity signal is pinned to 0, which turns off
 * every downstream distortion without any consumer needing to know why.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const { motion } = useMotion();

  useEffect(() => {
    const smoothed = { value: 0 };

    const update = (time: number) => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;

      // Lenis' rAF expects milliseconds; GSAP's ticker reports seconds.
      lenis.raf(time * 1000);

      const raw = motion ? lenis.velocity : 0;
      const target = clamp(raw / VELOCITY_CLAMP, -1, 1);

      // Ease toward the target so a single violent wheel tick cannot spike the
      // whole site, and so the signal decays to 0 on its own when scrolling stops.
      smoothed.value += (target - smoothed.value) * 0.18;
      if (Math.abs(smoothed.value) < 0.0015) smoothed.value = 0;

      scrollSignal.raw = raw;
      scrollSignal.velocity = smoothed.value;
      scrollSignal.scroll = lenis.scroll;
      scrollSignal.progress = lenis.progress || 0;
      scrollSignal.moving = smoothed.value !== 0;
      if (raw > 0.5) scrollSignal.direction = 1;
      else if (raw < -0.5) scrollSignal.direction = -1;
    };

    gsap.ticker.add(update);
    // Without this, a slow frame makes GSAP "catch up" and Lenis lurches.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      scrollSignal.velocity = 0;
      scrollSignal.raw = 0;
      scrollSignal.moving = false;
    };
  }, [motion]);

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;

    lenis.on("scroll", ScrollTrigger.update);
    return () => {
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [motion]);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        // We drive rAF from GSAP's ticker above.
        autoRaf: false,
        // Smoothing is a short settle, not a glide. At 0.1 the page keeps
        // travelling long after the wheel stops, which reads as lag rather than
        // as smoothness; 0.22 still removes the stepping but stays attached to
        // the input.
        lerp: motion ? 0.22 : 1,
        smoothWheel: motion,
        // Touch devices keep native scrolling — smoothing it costs more than it gives.
        syncTouch: false,
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      }}
    >
      {children}
    </ReactLenis>
  );
}

/**
 * Imperative scroll, for the few places that need it (nav anchors, the gallery
 * close button restoring position). Always goes through Lenis so nothing ever
 * fights the smooth scroller.
 */
export const scrollTo = (target: string | number | HTMLElement, offset = 0) => {
  const lenis = (window as unknown as { lenis?: { scrollTo: (t: unknown, o?: object) => void } }).lenis;
  if (lenis) lenis.scrollTo(target, { offset });
  else if (typeof target === "number") window.scrollTo({ top: target + offset });
};
