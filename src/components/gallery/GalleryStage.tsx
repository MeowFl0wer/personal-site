"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useMotion } from "@/components/motion/MotionProvider";
import { GalleryGrid } from "./GalleryGrid";
import { GalleryViewer, type OriginRect } from "./GalleryViewer";
import { clamp, pad } from "@/lib/utils";
import { spring } from "@/lib/motion";
import type { Photo } from "@content/types";

/**
 * Three.js is loaded here and only here. `next/dynamic` with `ssr: false` keeps
 * the R3F runtime out of every other route's bundle — visiting /work must never
 * download a WebGL renderer.
 */
const RingScene = dynamic(
  () => import("./RingGallery").then((mod) => mod.RingScene),
  { ssr: false, loading: () => null },
);

/**
 * Viewport width as an external store, so the render can read it directly
 * instead of syncing it into state from an effect.
 */
const WIDE_QUERY = "(min-width: 768px)";

const subscribeWide = (onChange: () => void) => {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const isWide = () => window.matchMedia(WIDE_QUERY).matches;

/** WebGL support probe. Cheap, cached, and run once on the client. */
let webglSupport: boolean | null = null;
const supportsWebGL = () => {
  if (webglSupport !== null) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    webglSupport = false;
  }
  return webglSupport;
};

export function GalleryStage({
  photos,
  webglEnabled = true,
}: {
  photos: Photo[];
  /** From Site Settings. Off renders the editorial grid for everyone. */
  webglEnabled?: boolean;
}) {
  const { motion, ready } = useMotion();
  const [focused, setFocused] = useState<{ index: number; rect: OriginRect | null } | null>(null);
  const [nearest, setNearest] = useState(0);

  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const drag = useRef(0);
  const dragging = useRef(false);
  /** Set by the scene once it mounts. Lets this file ask for a frame without
      importing anything from @react-three/fiber. */
  const invalidate = useRef<() => void>(() => {});
  /** True while a drag is in flight, so the click that ends it does not open
      the photo the pointer happens to be over. */
  const suppressOpen = useRef(false);

  /* ---- Which gallery do we render? --------------------------------------
     Four conditions, all of which can only be answered on the client:
     the flag, reduced motion, a wide enough viewport, and actual WebGL. */
  const wide = useSyncExternalStore(subscribeWide, isWide, () => false);
  const mode: "pending" | "ring" | "grid" = !ready
    ? "pending"
    : webglEnabled && motion && wide && supportsWebGL()
      ? "ring"
      : "grid";

  /* ---- Scroll → rotation -------------------------------------------------- */
  useEffect(() => {
    if (mode !== "ring") return;

    const update = () => {
      const el = track.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      progress.current = distance <= 0 ? 0 : clamp(-rect.top / distance, 0, 1);
      invalidate.current();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [mode]);

  /* ---- Drag → rotation, with release momentum ----------------------------- */
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "ring") return;
    const el = stage.current;
    if (!el) return;

    /** Movement in px before a press counts as a drag rather than a click. */
    const DRAG_THRESHOLD = 5;

    let pointerId: number | null = null;
    let startX = 0;
    let lastX = 0;
    let velocity = 0;
    let raf = 0;
    let captured = false;

    const decay = () => {
      velocity *= spring.ring.momentumDecay;
      drag.current += velocity;
      invalidate.current();
      if (Math.abs(velocity) > 0.00002) raf = requestAnimationFrame(decay);
      else velocity = 0;
    };

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      lastX = event.clientX;
      velocity = 0;
      captured = false;
      cancelAnimationFrame(raf);
      // Deliberately no setPointerCapture here: capturing on pointerdown
      // redirects the subsequent pointerup away from the canvas, which kills
      // the click that opens a photo. We only capture once it is really a drag.
    };

    const onMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;

      if (!captured) {
        if (Math.abs(event.clientX - startX) < DRAG_THRESHOLD) return;
        captured = true;
        dragging.current = true;
        suppressOpen.current = true;
        el.setPointerCapture(event.pointerId);
      }

      // Near 1:1 with the pointer — see spring.ring.dragPerPixel for why.
      const delta = (event.clientX - lastX) * -spring.ring.dragPerPixel;
      lastX = event.clientX;
      drag.current += delta;
      velocity = delta;
      invalidate.current();
    };

    const onUp = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      dragging.current = false;

      if (captured) {
        el.releasePointerCapture(event.pointerId);
        captured = false;
        // Let the click that ends a drag pass without opening a photo.
        setTimeout(() => {
          suppressOpen.current = false;
        }, 0);
      }

      if (Math.abs(velocity) > 0.00005) raf = requestAnimationFrame(decay);
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      dragging.current = false;
      suppressOpen.current = false;
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [mode]);

  /* ---- Viewer ------------------------------------------------------------- */
  const close = useCallback(() => setFocused(null), []);
  const step = useCallback(
    (delta: number) =>
      setFocused((current) =>
        current
          ? {
              index: (current.index + delta + photos.length) % photos.length,
              // Stepping is a crossfade, not a FLIP — there is no origin box for
              // a photo that was never on screen.
              rect: null,
            }
          : current,
      ),
    [photos.length],
  );

  if (mode === "pending") {
    return <div className="min-h-[60svh]" aria-hidden="true" />;
  }

  if (mode === "grid") {
    return (
      <>
        <div className="shell pb-[clamp(4rem,12vh,9rem)]">
          <GalleryGrid
            photos={photos}
            onFocus={(index, rect) => setFocused({ index, rect })}
          />
        </div>

        {focused ? (
          <GalleryViewer
            photos={photos}
            index={focused.index}
            origin={focused.rect}
            onClose={close}
            onStep={step}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      {/* A tall track: the sticky stage inside it turns scroll into rotation
          without ever taking the scroll away from the page. */}
      <div ref={track} className="relative h-[420svh]">
        <div
          ref={stage}
          className="sticky top-0 h-[100svh] w-full touch-pan-y overflow-hidden"
          data-cursor-state="drag"
        >
          <RingScene
            photos={photos}
            progress={progress}
            drag={drag}
            dragging={dragging}
            onFocus={({ index, rect }) => {
              if (suppressOpen.current) return;
              setFocused({ index, rect });
            }}
            onNearest={setNearest}
            onInvalidate={(fn) => {
              invalidate.current = fn;
            }}
          />

          {/* Overlay UI. Four small pieces of text and nothing else. */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pt-24 pb-8 md:pt-28">
            <div className="shell flex items-baseline justify-between">
              <span className="meta text-void-muted">Gallery</span>
              <span className="meta text-void-muted">
                {pad(nearest + 1)} / {pad(photos.length)}
              </span>
            </div>

            {/* Bottom left: whatever the photograph now at the centre of the
                ring knows about itself. Keyed on the index so it re-animates as
                the ring turns. */}
            <div className="shell flex items-end justify-between gap-8">
              <div key={nearest} data-gallery-caption className="max-w-[42ch]">
                <p className="text-small text-void-ink">{photos[nearest]?.place}</p>
                <p className="meta mt-1 text-void-muted">{photos[nearest]?.date}</p>
                {photos[nearest]?.caption ? (
                  <p className="meta mt-1 text-void-muted">{photos[nearest].caption}</p>
                ) : null}
              </div>
              <p className="meta shrink-0 text-void-muted">Scroll or drag · Click to open</p>
            </div>
          </div>
        </div>
      </div>

      {focused ? (
        <GalleryViewer
          photos={photos}
          index={focused.index}
          origin={focused.rect}
          onClose={close}
          onStep={step}
        />
      ) : null}
    </>
  );
}
