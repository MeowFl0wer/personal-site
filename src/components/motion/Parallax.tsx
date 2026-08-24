"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMotion } from "./MotionProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scrubbed parallax. Life's only effect, and deliberately gentle: the media
 * drifts `amount` percent of its own height across the full scroll pass.
 *
 * The inner element is overscaled to match, so the drift can never expose an
 * edge, and the wrapper clips. Without JS the image simply sits still and fills
 * its frame — which is the layout the page was designed around anyway.
 */
export function Parallax({
  children,
  amount = 6,
  className,
}: {
  children: ReactNode;
  /** Percent of the element's height it may drift in each direction. */
  amount?: number;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const { motion, ready } = useMotion();

  useGSAP(
    () => {
      if (!ready || !motion || !frame.current || !inner.current) return;

      // Overscale by twice the drift so the frame stays covered at both extremes.
      const scale = 1 + (amount * 2) / 100;

      gsap.fromTo(
        inner.current,
        { yPercent: -amount, scale },
        {
          yPercent: amount,
          ease: "none",
          scrollTrigger: {
            trigger: frame.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { dependencies: [ready, motion, amount] },
  );

  return (
    <div ref={frame} className={className} style={{ overflow: "hidden" }}>
      <div ref={inner} className="h-full w-full" style={{ willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
