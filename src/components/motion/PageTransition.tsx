"use client";

import { useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { useMotion } from "./MotionProvider";
import { duration, ease } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Route change handling.
 *
 * Kept intentionally minimal: a short fade up on arrival, plus the two bits of
 * housekeeping a smooth-scrolled app actually needs — reset Lenis to the top
 * without animating there, and refresh ScrollTrigger once the new page has laid
 * out. Skipping either is what causes "the new page starts halfway down" and
 * "reveals fire at the wrong time".
 *
 * There is no exit animation. An exit transition means holding the old page
 * while the new one loads, which on a content site costs more than it returns.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const scope = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const { motion, ready } = useMotion();
  const first = useRef(true);

  useGSAP(
    () => {
      if (!scope.current) return;

      if (!first.current) {
        lenis?.scrollTo(0, { immediate: true });
      }

      if (ready && motion) {
        gsap.from(scope.current, {
          opacity: 0,
          y: first.current ? 0 : 12,
          duration: duration.ui,
          ease: ease.primary,
        });
      }

      first.current = false;

      // The new route's images and fonts settle a beat after mount.
      const refresh = setTimeout(() => ScrollTrigger.refresh(), 220);
      return () => clearTimeout(refresh);
    },
    { dependencies: [pathname, ready, motion], scope },
  );

  return (
    <div ref={scope} data-route={pathname}>
      {children}
    </div>
  );
}
