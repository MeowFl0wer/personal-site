"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ProximityField, ProximityItem, SplitChars } from "@/components/motion/ProximityField";
import { useMotion } from "@/components/motion/MotionProvider";
import { duration, ease, stagger } from "@/lib/motion";
import type { Home } from "@/payload-types";

gsap.registerPlugin(useGSAP);

/**
 * Home hero.
 *
 * Static: a name, a year, a greeting, a few short lines and two facts. That is
 * the whole design — it has to hold up with every script blocked.
 *
 * Interactive: proximity repulsion on the greeting's characters and the headline
 * words. One of only two places on the site that uses it (the other is /tools),
 * which is what keeps it feeling like a signature rather than a habit.
 *
 * Every string comes from the CMS.
 */
export function Hero({ home }: { home: Home }) {
  const scope = useRef<HTMLElement>(null);
  const { motion, ready } = useMotion();

  const headline = (home.headline ?? []).map((line) => line.text).filter(Boolean);

  useGSAP(
    () => {
      if (!ready || !motion) return;

      // First paint only. Everything else on the page reveals on scroll.
      gsap
        .timeline({ defaults: { ease: ease.primary } })
        .from("[data-hero-meta]", { opacity: 0, duration: duration.ui }, 0)
        .from("[data-hero-greeting]", { opacity: 0, y: 18, duration: duration.slow }, 0.1)
        .from(
          "[data-hero-line]",
          { opacity: 0, y: 28, duration: duration.slow, stagger: stagger.line },
          0.2,
        )
        .from("[data-hero-foot]", { opacity: 0, duration: duration.slow }, 0.6);
    },
    { scope, dependencies: [ready, motion] },
  );

  return (
    <section
      ref={scope}
      className="shell flex min-h-[calc(100svh-5rem)] flex-col justify-between pt-8 pb-12 md:pt-12"
    >
      {/* NAME ————————————————————————————————— YEAR */}
      <div data-hero-meta className="flex items-baseline justify-between">
        <p className="meta">{home.name}</p>
        {home.year ? <p className="meta text-muted">{home.year}</p> : null}
      </div>

      <div className="py-[clamp(2rem,6vh,5rem)]">
        <ProximityField as="div" radius={130} strength={16} rotation={4}>
          <p data-hero-greeting className="text-headline mb-[clamp(1.25rem,3.5vh,2.5rem)] font-medium">
            <SplitChars text={home.greeting} />
          </p>

          <h1 className="text-hero font-medium">
            {headline.map((line) => (
              <span key={line} data-hero-line className="block">
                <ProximityItem>{line}</ProximityItem>
              </span>
            ))}
          </h1>
        </ProximityField>
      </div>

      {/* BASED IN / CURRENTLY ——————————————————— Scroll ↓ */}
      <div data-hero-foot className="grid-12 items-end gap-y-8">
        {home.basedIn ? (
          <div className="col-span-4 flex flex-col gap-1.5 md:col-span-3">
            <span className="meta text-muted">Based in</span>
            <span className="text-small">{home.basedIn}</span>
          </div>
        ) : null}
        {home.currently ? (
          <div className="col-span-4 flex flex-col gap-1.5 md:col-span-4">
            <span className="meta text-muted">Currently</span>
            <span className="text-small">{home.currently}</span>
          </div>
        ) : null}
        <p className="meta col-span-4 text-muted md:col-span-5 md:justify-self-end">
          Scroll <span aria-hidden="true">↓</span>
        </p>
      </div>
    </section>
  );
}
