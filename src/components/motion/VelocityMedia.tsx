"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMotion } from "./MotionProvider";
import { workDistortion } from "@/lib/motion";
import { scrollSignal } from "@/lib/scroll-signal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll-velocity distortion — Work's signature effect.
 *
 * Reads the site-wide velocity signal (never measures scroll itself, see
 * lib/scroll-signal.ts) and turns it into a small vertical stretch plus a skew.
 * At rest the transform is exactly identity, so a stationary page is completely
 * undistorted.
 *
 * Technique adapted from GreenSock's "Skew on scroll using scroll velocity"
 * (codepen.io/GreenSock/pen/eYpGLYL), with the velocity taken from Lenis so the
 * whole site shares one number.
 *
 * Cost: the per-frame writer only runs while the element is on screen, and it
 * short-circuits to a single early return once velocity has settled to zero.
 */
export function VelocityMedia({
  children,
  className,
  /** 0 … 1 scale on the shared maximums, so a small thumb can distort less. */
  intensity = 1,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { motion, ready } = useMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!ready || !motion || !el) return;

      const setSkew = gsap.quickSetter(el, "skewY", "deg");
      const setScaleY = gsap.quickSetter(el, "scaleY");
      const setScaleX = gsap.quickSetter(el, "scaleX");

      let onScreen = false;
      let settled = true;

      const frame = () => {
        if (!onScreen) return;

        const v = scrollSignal.velocity;

        if (v === 0) {
          if (settled) return; // Nothing to do — do nothing.
          setSkew(0);
          setScaleY(1);
          setScaleX(1);
          settled = true;
          return;
        }

        settled = false;
        const magnitude = Math.abs(v);
        setSkew(-v * workDistortion.maxSkewDeg * intensity);
        setScaleY(1 + magnitude * workDistortion.maxScaleY * intensity);
        setScaleX(1 - magnitude * workDistortion.maxScaleX * intensity);
      };

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          onScreen = self.isActive;
          if (!onScreen) {
            setSkew(0);
            setScaleY(1);
            setScaleX(1);
            settled = true;
          }
        },
      });

      gsap.ticker.add(frame);

      return () => {
        gsap.ticker.remove(frame);
        trigger.kill();
        gsap.set(el, { skewY: 0, scaleY: 1, scaleX: 1 });
      };
    },
    { dependencies: [ready, motion, intensity] },
  );

  return (
    <div ref={ref} className={className} style={{ willChange: "transform", transformOrigin: "center center" }}>
      {children}
    </div>
  );
}
