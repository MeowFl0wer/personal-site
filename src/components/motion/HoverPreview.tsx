"use client";

import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useMotion } from "./MotionProvider";
import { duration, ease, spring } from "@/lib/motion";
import type { Media } from "@content/types";

gsap.registerPlugin(useGSAP);

type PreviewApi = {
  show: (media: Media) => void;
  hide: () => void;
  enabled: boolean;
};

const PreviewContext = createContext<PreviewApi>({ show: () => {}, hide: () => {}, enabled: false });

/**
 * ONE hover-preview implementation, shared by /work, the home page's selected
 * work block and the built tools list. Adding a fourth consumer should mean
 * wrapping it in a provider, never writing this again.
 *
 * Behaviour: a single fixed-position plate follows the cursor with inertia,
 * clip-reveals upward, scales 0.94 → 1, and plays a muted loop when the media
 * has one. Only one plate exists in the DOM regardless of list length.
 *
 * Disabled entirely without a fine pointer or under reduced motion — consumers
 * check `enabled` and render an inline thumbnail instead.
 */
export function HoverPreviewProvider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const plate = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [media, setMedia] = useState<Media | null>(null);
  const { motion, cursor, ready } = useMotion();

  // The preview needs a fine pointer; it is a hover affordance by definition.
  // Reduced motion keeps it, but without the inertia (see the follow below).
  const enabled = ready && cursor;

  const follow = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const visible = useRef(false);

  useGSAP(
    () => {
      if (!enabled || !plate.current) return;

      const followDuration = motion ? spring.preview.follow : 0;
      follow.current = {
        x: gsap.quickTo(plate.current, "x", { duration: followDuration, ease: "power3.out" }),
        y: gsap.quickTo(plate.current, "y", { duration: followDuration, ease: "power3.out" }),
      };

      gsap.set(plate.current, { autoAlpha: 0 });
      gsap.set(inner.current, { clipPath: "inset(100% 0% 0% 0%)", scale: spring.preview.scaleFrom });

      const onMove = (event: PointerEvent) => {
        if (!visible.current) return;
        follow.current?.x(event.clientX);
        follow.current?.y(event.clientY);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { dependencies: [enabled, motion] },
  );

  const show = useCallback(
    (next: Media) => {
      if (!enabled) return;
      setMedia(next);
      visible.current = true;

      gsap.killTweensOf([plate.current, inner.current]);
      gsap.to(plate.current, { autoAlpha: 1, duration: duration.fast, ease: ease.primary });
      gsap.to(inner.current, {
        clipPath: "inset(0% 0% 0% 0%)",
        scale: 1,
        duration: motion ? duration.ui : 0.01,
        ease: ease.primary,
      });
    },
    [enabled, motion],
  );

  const hide = useCallback(() => {
    if (!enabled) return;
    visible.current = false;

    gsap.killTweensOf([plate.current, inner.current]);
    gsap.to(plate.current, {
      autoAlpha: 0,
      duration: duration.fast,
      ease: ease.primary,
      onComplete: () => {
        // Reset so the next reveal starts from the same place every time.
        gsap.set(inner.current, { clipPath: "inset(100% 0% 0% 0%)", scale: spring.preview.scaleFrom });
        video.current?.pause();
      },
    });
  }, [enabled]);

  const api = useMemo(() => ({ show, hide, enabled }), [show, hide, enabled]);

  return (
    <PreviewContext.Provider value={api}>
      <div className={className}>
        {children}

        {enabled ? (
          <div
            ref={plate}
            aria-hidden="true"
            className="pointer-events-none fixed top-0 left-0 z-40 -translate-x-1/2 -translate-y-1/2 opacity-0"
            style={{ willChange: "transform" }}
          >
            <div
              ref={inner}
              className="relative h-[clamp(180px,22vw,320px)] w-[clamp(260px,30vw,440px)] overflow-hidden bg-ink/5"
            >
              {media ? (
                media.video ? (
                  <video
                    ref={video}
                    key={media.video}
                    src={media.video}
                    poster={media.poster ?? media.src}
                    muted
                    loop
                    playsInline
                    autoPlay
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    key={media.src}
                    src={media.src}
                    alt=""
                    fill
                    sizes="440px"
                    className="object-cover"
                    priority={false}
                  />
                )
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </PreviewContext.Provider>
  );
}

export const useHoverPreview = () => useContext(PreviewContext);

/**
 * Wraps a list row. Pointer enter/leave drives the shared plate; focus does the
 * same thing so keyboard users get the preview too.
 */
export function HoverPreviewTrigger({
  media,
  children,
  className,
}: {
  media: Media;
  children: ReactNode;
  className?: string;
}) {
  const { show, hide } = useHoverPreview();

  return (
    <div
      className={className}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") show(media);
      }}
      onPointerLeave={hide}
      onFocusCapture={() => show(media)}
      onBlurCapture={hide}
    >
      {children}
    </div>
  );
}
