"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { useMotion } from "@/components/motion/MotionProvider";
import { duration, ease } from "@/lib/motion";
import { pad } from "@/lib/utils";
import type { Photo } from "@content/types";

gsap.registerPlugin(Flip, useGSAP);

export type OriginRect = { left: number; top: number; width: number; height: number };

/**
 * Fullscreen photo viewer.
 *
 * The transition is a real FLIP: a throwaway ghost element is placed at the
 * origin rect — the projected screen box of the 3D plane, or the <img> in the
 * grid fallback — the figure is fitted onto it, and GSAP Flip animates the
 * difference back to the fullscreen layout. Same code path for both sources,
 * which is why the WebGL and non-WebGL galleries feel identical here.
 *
 * UI is deliberately almost absent: close, a counter, a place and a date.
 */
export function GalleryViewer({
  photos,
  index,
  origin,
  onClose,
  onStep,
}: {
  photos: Photo[];
  index: number;
  origin: OriginRect | null;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const overlay = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const { motion } = useMotion();
  const lenis = useLenis();
  const photo = photos[index];

  useGSAP(
    () => {
      if (!figure.current || !overlay.current) return;

      gsap.set(overlay.current, { autoAlpha: 1 });
      gsap.from(overlay.current, {
        backgroundColor: "rgba(11,11,11,0)",
        duration: motion ? duration.ui : 0.01,
        ease: ease.primary,
      });
      gsap.from("[data-viewer-ui]", {
        opacity: 0,
        duration: motion ? duration.ui : 0.01,
        delay: motion ? 0.3 : 0,
        ease: ease.primary,
      });

      if (!origin || !motion) {
        gsap.from(figure.current, { opacity: 0, duration: motion ? duration.ui : 0.01 });
        return;
      }

      const ghost = document.createElement("div");
      ghost.style.cssText = `position:fixed;left:${origin.left}px;top:${origin.top}px;width:${origin.width}px;height:${origin.height}px;pointer-events:none;visibility:hidden;`;
      document.body.appendChild(ghost);

      // Fit the fullscreen figure onto the origin box, record that as the FLIP
      // start state, then release it and animate the difference.
      Flip.fit(figure.current, ghost);
      const state = Flip.getState(figure.current);
      gsap.set(figure.current, { clearProps: "transform" });

      Flip.from(state, {
        duration: duration.scene,
        ease: ease.primary,
        absolute: false,
        onComplete: () => ghost.remove(),
      });
    },
    { dependencies: [] },
  );

  /**
   * Closing runs the FLIP in reverse, back onto the box the photo came from,
   * and only unmounts once that has finished. Without this the expand is a
   * one-way trick and the close reads as a bug.
   */
  const closing = useRef(false);
  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;

    if (!figure.current || !overlay.current || !origin || !motion) {
      onClose();
      return;
    }

    const ghost = document.createElement("div");
    ghost.style.cssText = `position:fixed;left:${origin.left}px;top:${origin.top}px;width:${origin.width}px;height:${origin.height}px;pointer-events:none;visibility:hidden;`;
    document.body.appendChild(ghost);

    gsap.to("[data-viewer-ui]", { opacity: 0, duration: duration.fast });
    gsap.to(overlay.current, {
      backgroundColor: "rgba(11,11,11,0)",
      duration: duration.scene * 0.8,
      ease: ease.primary,
    });

    Flip.fit(figure.current, ghost, {
      duration: duration.scene * 0.8,
      ease: ease.primary,
      onComplete: () => {
        ghost.remove();
        onClose();
      },
    });
  }, [motion, onClose, origin]);

  // Focus management, keyboard controls, and stopping the page behind.
  useEffect(() => {
    closeButton.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
    };

    // Lenis owns scrolling, so it is what has to be told to stop — not body
    // overflow, which it would simply ignore.
    lenis?.stop();
    window.addEventListener("keydown", onKey);

    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [lenis, requestClose, onStep]);

  if (!photo) return null;

  const aspect = photo.width / photo.height;

  // Rendered into <body>. The page-transition wrapper carries a transform,
  // which creates a stacking context — a fixed overlay inside it can never rise
  // above the sticky nav, however high its z-index.
  return createPortal(
    <div
      ref={overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.place}, ${photo.date}`}
      className="on-void fixed inset-0 z-[90] flex flex-col opacity-0"
      style={{ backgroundColor: "#0b0b0b" }}
    >
      <div data-viewer-ui className="shell flex items-baseline justify-between py-6">
        <button
          ref={closeButton}
          type="button"
          onClick={requestClose}
          data-cursor-state="close"
          className="meta link-underline"
        >
          <span aria-hidden="true">←</span> Close
        </button>
        <span className="meta text-muted">
          {pad(index + 1)} / {pad(photos.length)}
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-[var(--gutter)] pb-4">
        {/* Sized from the viewport rather than from the parent: the box is
            exactly the photo, which is what makes the FLIP land on the photo
            and not on a letterboxed container. */}
        <div
          ref={figure}
          className="relative"
          style={{
            aspectRatio: `${photo.width} / ${photo.height}`,
            width: `min(90vw, ${(aspect * 74).toFixed(2)}vh)`,
          }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="90vw"
            priority
            className="object-contain"
          />
        </div>
      </div>

      <div data-viewer-ui className="shell flex items-end justify-between gap-8 py-6">
        <div>
          <p className="text-small">{photo.place}</p>
          <p className="meta mt-1 text-muted">{photo.date}</p>
          {photo.caption ? <p className="meta mt-1 text-muted">{photo.caption}</p> : null}
        </div>

        <div className="flex gap-6">
          <button type="button" onClick={() => onStep(-1)} className="meta link-underline">
            Prev
          </button>
          <button type="button" onClick={() => onStep(1)} className="meta link-underline">
            Next
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
