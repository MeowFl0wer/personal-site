"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Two ways out, bottom right.
 *
 * The navigation is sticky and the name in its corner has always gone home,
 * but by the foot of a long page nobody is looking at the corner any more.
 * These are for that moment, which is why they are not there at the start:
 * a control that appears when it becomes useful is quieter than one that sits
 * on the page from the first screen waiting to be needed.
 *
 * Not on the dark routes. The gallery is a full-screen ring of photographs with
 * its own controls and its own cursor, and a pair of pale buttons floating over
 * it is a different site's furniture.
 */
const DARK_ROUTES = ["/gallery"];

/** Far enough that the header has left, near enough to still feel like a way back. */
const APPEAR_AFTER = 420;

/** Air between the lower button and the footer's rule. */
const CLEARANCE = 20;

export function PageControls() {
  const pathname = usePathname();
  const [shown, setShown] = useState(false);
  /* How far to ride up so the pair never sits on the footer. */
  const [lift, setLift] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      setShown(window.scrollY > APPEAR_AFTER);

      /* Fixed controls and a page that ends are a bad pair: at the foot of the
         document these would come to rest on top of the credit and the
         accounts. So at the end of the scroll they stop being fixed in
         practice and sit above the rule that opens the footer — which is the
         line the footer draws for itself, so this stays right if that block
         ever changes height. */
      const element = box.current;
      const footer = document.querySelector("[data-site-footer]");
      if (!element || !footer) return setLift(0);

      const bottom = Number.parseFloat(window.getComputedStyle(element).bottom) || 0;
      const restingEdge = window.innerHeight - bottom;
      const line = footer.getBoundingClientRect().top;
      setLift(Math.max(0, restingEdge - (line - CLEARANCE)));
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const dark = DARK_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  if (dark) return null;

  const home = pathname === "/";

  return (
    <div
      ref={box}
      data-print="hide"
      aria-hidden={!shown}
      /* One transform carries both movements. Tailwind's translate utilities
         would fight the lift for the same property. */
      style={{ transform: `translateY(${(shown ? 0 : 8) - lift}px)` }}
      className={cn(
        "fixed right-[clamp(20px,4.5vw,64px)] bottom-[clamp(20px,4vh,40px)] z-40",
        "flex flex-col gap-2 transition-[opacity,transform] duration-[--duration-ui] ease-[--ease-primary]",
        shown ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      {/* Only where there is somewhere to go. On the home page itself the
          second button would be a link to the page you are reading. */}
      {home ? null : (
        <Link
          href="/"
          tabIndex={shown ? undefined : -1}
          className={cn(
            "meta border-rule-strong bg-paper/80 text-muted hover:border-ink hover:bg-ink hover:text-paper",
            "grid size-11 place-items-center border backdrop-blur-[3px]",
            "transition-colors duration-[--duration-fast]",
          )}
        >
          Home
        </Link>
      )}

      <button
        type="button"
        tabIndex={shown ? undefined : -1}
        aria-label="Back to top"
        onClick={() => {
          /* Lenis owns scrolling, and it listens for this — a scrollTo on the
             window with smooth behaviour would fight it. */
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        className={cn(
          "meta border-rule-strong bg-paper/80 text-muted hover:border-ink hover:bg-ink hover:text-paper",
          "grid size-11 cursor-pointer place-items-center border backdrop-blur-[3px]",
          "transition-colors duration-[--duration-fast]",
        )}
      >
        <span aria-hidden="true" className="text-[14px] leading-none">
          ↑
        </span>
      </button>
    </div>
  );
}
