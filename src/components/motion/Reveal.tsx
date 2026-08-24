"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMotion } from "./MotionProvider";
import { duration, ease, stagger as staggerTokens } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds of delay after the trigger fires. */
  delay?: number;
  /** Travel distance in px. Keep it small — this is a settle, not an entrance. */
  y?: number;
  /**
   * When set, animates direct children marked `data-reveal-item` instead of the
   * wrapper, staggered. Falls back to the wrapper if no items are present.
   */
  stagger?: keyof typeof staggerTokens | false;
  /** ScrollTrigger start. Default fires a little before the element is fully in view. */
  start?: string;
};

/**
 * The site's one entrance animation.
 *
 * Deliberately boring: opacity and a few pixels of Y, on the house curve. Every
 * page uses this rather than inventing its own, which is what makes the whole
 * site feel like one document.
 *
 * The hidden state is set by GSAP at run time, never in CSS — so with JS off or
 * reduced motion on, the markup renders exactly as authored, fully visible.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  y = 20,
  stagger = false,
  start = "top 88%",
}: RevealProps) {
  const scope = useRef<HTMLDivElement>(null);
  const { motion, ready } = useMotion();

  useGSAP(
    () => {
      if (!ready || !motion || !scope.current) return;

      const items = stagger ? Array.from(scope.current.querySelectorAll("[data-reveal-item]")) : [];
      const targets: gsap.TweenTarget = items.length > 0 ? items : scope.current;

      gsap.from(targets, {
        opacity: 0,
        y,
        duration: duration.slow,
        ease: ease.primary,
        delay,
        stagger: items.length > 0 && stagger ? staggerTokens[stagger] : 0,
        scrollTrigger: {
          trigger: scope.current,
          start,
          once: true,
        },
      });
    },
    { scope, dependencies: [ready, motion] },
  );

  // A polymorphic `as` widens every prop to `never` under TS. The component is
  // always a block-level element, so we type it as one.
  const Component = Tag as unknown as "div";

  return (
    <Component ref={scope} className={className} data-reveal="">
      {children}
    </Component>
  );
}

/**
 * A 1px rule that draws itself left-to-right when it scrolls into view.
 * The site's other recurring motion. Renders as a plain <hr> without JS.
 */
export function RuleReveal({ className, delay = 0 }: { className?: string; delay?: number }) {
  const ref = useRef<HTMLHRElement>(null);
  const { motion, ready } = useMotion();

  useGSAP(
    () => {
      if (!ready || !motion || !ref.current) return;

      gsap.from(ref.current, {
        scaleX: 0,
        transformOrigin: "left center",
        duration: duration.scene,
        ease: ease.primary,
        delay,
        scrollTrigger: { trigger: ref.current, start: "top 92%", once: true },
      });
    },
    { dependencies: [ready, motion] },
  );

  return <hr ref={ref} className={className ? `rule ${className}` : "rule"} data-rule-reveal="" />;
}
