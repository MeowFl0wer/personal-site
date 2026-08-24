"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMotion } from "./MotionProvider";
import { duration, ease, spring } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

/**
 * Custom cursor.
 *
 * A dot, and a word when a word is useful. Any element can request a label:
 *
 *   <a data-cursor-state="view">        →  VIEW
 *   <button data-cursor-state="play">   →  PLAY
 *   <div data-cursor-state="drag">      →  DRAG
 *   <a data-cursor-state="external">    →  ↗
 *
 * Rules it must not break: it never intercepts pointer events, it never appears
 * on touch or reduced motion, and the native cursor is only hidden while this
 * one is actually mounted — so a JS failure leaves a usable page.
 */
const LABELS: Record<string, string> = {
  view: "VIEW",
  play: "PLAY",
  drag: "DRAG",
  open: "OPEN",
  external: "↗",
  close: "CLOSE",
};

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<string | null>(null);
  const { cursor, ready } = useMotion();

  useGSAP(
    () => {
      if (!ready || !cursor || !dot.current) return;

      const moveDot = {
        x: gsap.quickTo(dot.current, "x", { duration: spring.cursor.follow, ease: "power3.out" }),
        y: gsap.quickTo(dot.current, "y", { duration: spring.cursor.follow, ease: "power3.out" }),
      };
      const moveLabel = {
        x: gsap.quickTo(label.current, "x", { duration: spring.cursor.label, ease: "power3.out" }),
        y: gsap.quickTo(label.current, "y", { duration: spring.cursor.label, ease: "power3.out" }),
      };

      gsap.set([dot.current, label.current], { autoAlpha: 0 });
      let seen = false;

      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        if (!seen) {
          seen = true;
          gsap.to([dot.current, label.current], { autoAlpha: 1, duration: duration.fast });
        }
        moveDot.x(event.clientX);
        moveDot.y(event.clientY);
        moveLabel.x(event.clientX);
        moveLabel.y(event.clientY);

        const target = (event.target as Element | null)?.closest?.("[data-cursor-state]");
        setState(target?.getAttribute("data-cursor-state") ?? null);
      };

      const onLeave = () => {
        seen = false;
        gsap.to([dot.current, label.current], { autoAlpha: 0, duration: duration.fast });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);

      return () => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
      };
    },
    { dependencies: [ready, cursor] },
  );

  useGSAP(
    () => {
      if (!ready || !cursor) return;
      const active = state !== null;

      gsap.to(dot.current, {
        scale: active ? 0 : 1,
        duration: duration.fast,
        ease: ease.primary,
      });
      gsap.to(label.current, {
        scale: active ? 1 : 0.6,
        opacity: active ? 1 : 0,
        duration: duration.fast,
        ease: ease.primary,
      });
    },
    { dependencies: [state, ready, cursor] },
  );

  if (!ready || !cursor) return null;

  return (
    <>
      <div
        ref={dot}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[100] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink mix-blend-difference"
        style={{ willChange: "transform", backgroundColor: "#f1f0eb" }}
      />
      <div
        ref={label}
        aria-hidden="true"
        className="meta pointer-events-none fixed top-0 left-0 z-[100] -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-2 opacity-0 mix-blend-difference"
        style={{ willChange: "transform", color: "#f1f0eb", border: "1px solid rgba(241,240,235,.6)" }}
      >
        {state ? (LABELS[state] ?? state.toUpperCase()) : ""}
      </div>
    </>
  );
}
