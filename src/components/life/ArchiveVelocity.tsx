"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMotion } from "@/components/motion/MotionProvider";
import { archiveSqueeze } from "@/lib/motion";
import { scrollSignal } from "@/lib/scroll-signal";
import { clamp } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

/**
 * The archive's one effect: while the page is moving, rows pinch toward their
 * own centre line, hardest at the middle of the screen.
 *
 * Two things separate it from VelocityMedia, which distorts everything on
 * screen equally:
 *
 *   - the amount is weighted by distance from the viewport centre, so the page
 *     gets a focal point instead of a uniform wobble, and rows leaving at the
 *     edges are already back to identity before they go;
 *   - one ticker drives every row. A twenty-one row archive with a component
 *     and a ScrollTrigger each is twenty-one subscriptions to the same number,
 *     recomputing the same velocity twenty-one times a frame.
 *
 * Velocity comes from the shared signal (lib/scroll-signal.ts) and is never
 * measured here — there is one scroll authority on this site. At rest the
 * transform is exactly identity, and the loop short-circuits once it gets there,
 * so a stationary archive costs nothing.
 */
export function ArchiveVelocity({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const { motion, ready } = useMotion();

  useGSAP(
    () => {
      const root = scope.current;
      if (!ready || !motion || !root) return;

      const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-archive-row]"));
      if (rows.length === 0) return;

      const setters = rows.map((row) => ({
        row,
        scaleX: gsap.quickSetter(row, "scaleX") as (v: number) => void,
        scaleY: gsap.quickSetter(row, "scaleY") as (v: number) => void,
        /** Eased per row, so each one arrives at its own target in its own time. */
        current: 0,
      }));

      let settled = true;

      const frame = () => {
        const target = Math.abs(scrollSignal.velocity);

        // Everything has come to rest and already been reset — do nothing.
        if (settled && target === 0) return;

        const middle = window.innerHeight / 2;
        const reach = middle * archiveSqueeze.falloff;
        let moving = false;

        for (const item of setters) {
          const rect = item.row.getBoundingClientRect();

          // Offscreen rows are not drawn and not worth measuring against.
          if (rect.bottom < 0 || rect.top > window.innerHeight) {
            if (item.current !== 0) {
              item.current = 0;
              item.scaleX(1);
              item.scaleY(1);
            }
            continue;
          }

          const distance = Math.abs(rect.top + rect.height / 2 - middle);
          // 1 at the centre line, 0 by the edge of the reach. Squared so the
          // focus is a point rather than a broad band.
          const weight = (1 - clamp(distance / reach, 0, 1)) ** 2;

          const want = target * weight;
          item.current += (want - item.current) * archiveSqueeze.follow;

          if (item.current < 0.0005) {
            if (item.current !== 0) {
              item.current = 0;
              item.scaleX(1);
              item.scaleY(1);
            }
            continue;
          }

          moving = true;
          item.scaleX(1 - item.current * archiveSqueeze.maxScaleX);
          item.scaleY(1 - item.current * archiveSqueeze.maxScaleY);
        }

        settled = !moving;
      };

      gsap.ticker.add(frame);

      return () => {
        gsap.ticker.remove(frame);
        gsap.set(rows, { scaleX: 1, scaleY: 1 });
      };
    },
    { scope, dependencies: [ready, motion] },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
