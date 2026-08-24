"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMotion } from "./MotionProvider";
import { spring } from "@/lib/motion";

gsap.registerPlugin(useGSAP);

const ITEM_ATTR = "data-proximity-item";

type ProximityFieldProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Influence radius in px. */
  radius?: number;
  /** Max displacement in px at zero distance. */
  strength?: number;
  /** Max rotation in degrees at zero distance. */
  rotation?: number;
};

/**
 * Distance-driven repulsion.
 *
 * Any descendant carrying `data-proximity-item` is pushed gently away from the
 * cursor, with influence falling off to nothing at `radius`. Used in exactly two
 * places — the home hero and the tools page — so that it reads as a signature
 * rather than a habit.
 *
 * Restraint is enforced by the defaults in `spring.proximity`: ~22px and ~5°.
 * Anything larger and the type stops being readable, which fails the brief.
 *
 * Reference (idea only, no code copied): Halo-Lab/magnetic-hover — MIT.
 * Implemented on DOM + GSAP quickTo; there is no reason to involve WebGL here.
 *
 * Cost control: the per-frame loop is only attached while the pointer is inside
 * the padded bounds, and it detaches once everything has come to rest. With the
 * cursor elsewhere on the page this component does nothing at all.
 */
export function ProximityField({
  children,
  as: Tag = "div",
  className,
  radius = spring.proximity.radius,
  strength = spring.proximity.strength,
  rotation = spring.proximity.rotation,
}: ProximityFieldProps) {
  const scope = useRef<HTMLDivElement>(null);
  const { motion, ready } = useMotion();

  useGSAP(
    () => {
      const root = scope.current;
      if (!ready || !motion || !root) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const items = Array.from(root.querySelectorAll<HTMLElement>(`[${ITEM_ATTR}]`));
      if (items.length === 0) return;

      type Handle = {
        el: HTMLElement;
        x: (v: number) => void;
        y: (v: number) => void;
        r: (v: number) => void;
        cx: number;
        cy: number;
        /** Current output, tracked so we know when the field has settled. */
        ox: number;
        oy: number;
      };

      const handles: Handle[] = items.map((el) => ({
        el,
        x: gsap.quickTo(el, "x", { duration: spring.proximity.follow, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: spring.proximity.follow, ease: "power3.out" }),
        r: gsap.quickTo(el, "rotation", { duration: spring.proximity.follow, ease: "power3.out" }),
        cx: 0,
        cy: 0,
        ox: 0,
        oy: 0,
      }));

      let dirty = true;
      const measure = () => {
        for (const handle of handles) {
          // Measure the untransformed box so displacement never feeds back on itself.
          const rect = handle.el.getBoundingClientRect();
          handle.cx = rect.left + rect.width / 2 - handle.ox;
          handle.cy = rect.top + rect.height / 2 - handle.oy;
        }
        dirty = false;
      };

      const pointer = { x: -9999, y: -9999 };
      let running = false;
      let restFrames = 0;

      const frame = () => {
        if (dirty) measure();

        let displaced = false;

        for (const handle of handles) {
          const dx = handle.cx - pointer.x;
          const dy = handle.cy - pointer.y;
          const distance = Math.hypot(dx, dy);

          let tx = 0;
          let ty = 0;
          let tr = 0;

          if (distance < radius) {
            // Smoothstep falloff: no hard edge as a character enters the field.
            const t = 1 - distance / radius;
            const falloff = t * t * (3 - 2 * t);
            const inv = distance === 0 ? 0 : 1 / distance;
            tx = dx * inv * falloff * strength;
            ty = dy * inv * falloff * strength;
            tr = (dx > 0 ? 1 : -1) * falloff * rotation;
            displaced = true;
          }

          handle.ox = tx;
          handle.oy = ty;
          handle.x(tx);
          handle.y(ty);
          handle.r(tr);
        }

        // Stop the loop once the pointer has left and the tweens have settled.
        restFrames = displaced ? 0 : restFrames + 1;
        if (restFrames > 45) stop();
      };

      const start = () => {
        if (running) return;
        running = true;
        restFrames = 0;
        gsap.ticker.add(frame);
      };

      const stop = () => {
        if (!running) return;
        running = false;
        gsap.ticker.remove(frame);
      };

      const onPointerMove = (event: PointerEvent) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;

        const bounds = root.getBoundingClientRect();
        const near =
          event.clientX > bounds.left - radius &&
          event.clientX < bounds.right + radius &&
          event.clientY > bounds.top - radius &&
          event.clientY < bounds.bottom + radius;

        if (near) start();
      };

      const invalidate = () => {
        dirty = true;
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("resize", invalidate);
      window.addEventListener("scroll", invalidate, { passive: true });

      return () => {
        stop();
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", invalidate);
        window.removeEventListener("scroll", invalidate);
        gsap.set(items, { x: 0, y: 0, rotation: 0 });
      };
    },
    { scope, dependencies: [ready, motion, radius, strength, rotation] },
  );

  const Component = Tag as unknown as "div";

  return (
    <Component ref={scope} className={className}>
      {children}
    </Component>
  );
}

/**
 * Splits text into per-character spans for ProximityField.
 *
 * The container keeps the readable string as its accessible name and the split
 * spans are hidden from assistive tech, so screen readers get one clean phrase
 * instead of a stream of single letters.
 */
export function SplitChars({
  text,
  className,
  charClassName,
}: {
  text: string;
  className?: string;
  charClassName?: string;
}) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, index) =>
          char === " " ? (
            <span key={index}> </span>
          ) : (
            <span
                key={index}
              {...{ [ITEM_ATTR]: "" }}
              className={charClassName}
              style={{ display: "inline-block", willChange: "transform" }}
            >
              {char}
            </span>
          ),
        )}
      </span>
    </span>
  );
}

/** Marks any single element as a proximity target (used for words, icons, labels). */
export function ProximityItem({
  children,
  className,
  as: Tag = "span",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const Component = Tag as unknown as "span";

  return (
    <Component
      {...{ [ITEM_ATTR]: "" }}
      className={className}
      style={{ display: "inline-block", willChange: "transform" }}
    >
      {children}
    </Component>
  );
}
