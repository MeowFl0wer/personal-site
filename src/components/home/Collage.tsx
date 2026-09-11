"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { cn } from "@/lib/utils";
import { collageStore, useCollageTheme } from "./collage-store";
import { COLLAGE_THEMES, type CollagePiece, type CollageTheme } from "./collage-themes";

/** How long each arrangement holds before the next one slides in. */
const DWELL = 7000;

/**
 * The arrangement of printed pieces in the empty half of the hero.
 *
 * Client-only, and deliberately so. It is decoration: the hero is complete
 * without it, so rendering it on the server would buy a flash of the wrong
 * theme for anyone who has chosen one — the stored choice cannot be read until
 * the client runs. The ground wash behind it does not have that luxury and is
 * set before first paint by the inline script in the frontend layout; this
 * catches up a moment later.
 *
 * Below `lg` there is no empty half to fill — the headline uses the whole width
 * — so the whole thing is left out rather than shrunk into a corner.
 */
export function Collage() {
  const stored = useCollageTheme();
  const { motion } = useMotion();

  /* Autoplay is a suggestion, not a carousel the visitor has to fight. One
     deliberate choice ends it for good; a hover only holds it. */
  const [pinned, setPinned] = useState(false);
  const [held, setHeld] = useState(false);

  const length = COLLAGE_THEMES.length;
  const active = Math.max(
    0,
    COLLAGE_THEMES.findIndex((theme) => theme.id === stored),
  );

  /* The store is the only record of which arrangement is showing — there is no
     second copy in component state to fall out of step with it, and writing to
     it from a timer is an ordinary event, not a render. */
  useEffect(() => {
    if (stored === null || pinned || held || !motion) return;
    const timer = window.setTimeout(() => {
      collageStore.set(COLLAGE_THEMES[(active + 1) % length].id);
    }, DWELL);
    return () => window.clearTimeout(timer);
  }, [stored, active, length, pinned, held, motion]);

  // The ground wash lives on <html>, outside anything React renders.
  useEffect(() => {
    if (stored !== null) document.documentElement.dataset.collage = stored;
  }, [stored]);

  if (stored === null) return null;

  const choose = (index: number) => {
    setPinned(true);
    collageStore.set(COLLAGE_THEMES[index].id);
  };

  return (
    <div
      data-collage-root
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] items-center justify-center lg:flex"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div className="flex flex-col items-center gap-[clamp(1.5rem,4vh,2.75rem)]">
        <div className="relative w-[clamp(15rem,22vw,21rem)]" style={{ aspectRatio: "4 / 5" }}>
          {COLLAGE_THEMES.map((theme, index) => {
            /* Signed distance, wrapped, so the arrangement after the current
               one always enters from the right and the one before always
               leaves to the left — no direction has to be tracked.

               Only the three that the animation can actually show are mounted:
               the one leaving, the one showing, and the one next up, which has
               to be in the document early enough to have loaded before it
               slides in. That holds at three however many arrangements there
               are. */
            const offset = ((index - active + length + 1) % length) - 1;
            if (Math.abs(offset) > 1) return null;
            return <Card key={theme.id} theme={theme} offset={offset} />;
          })}
        </div>

        <ThemeSwitch active={active} onChange={choose} />
      </div>
    </div>
  );
}

function Card({ theme, offset }: { theme: CollageTheme; offset: number }) {
  const active = offset === 0;
  return (
    <div
      aria-hidden={active ? undefined : true}
      className="absolute inset-0 transition-[opacity,transform] duration-[--duration-scene] ease-[--ease-primary]"
      style={{
        opacity: active ? 1 : 0,
        transform: `translateX(${offset * 3.5}rem)`,
      }}
    >
      {theme.pieces.filter((piece) => piece.behind).map((piece, index) => (
        <Piece key={`behind-${index}`} piece={piece} />
      ))}

      <Image
        src={theme.card}
        alt={active ? theme.alt : ""}
        sizes="(min-width: 1024px) 22vw, 0px"
        className="absolute inset-0 h-full w-full origin-center -rotate-[1.5deg] object-cover shadow-[0_1px_2px_rgba(20,26,22,0.10),0_18px_40px_-18px_rgba(20,26,22,0.35)]"
      />

      {theme.pieces.filter((piece) => !piece.behind).map((piece, index) => (
        <Piece key={`over-${index}`} piece={piece} />
      ))}
    </div>
  );
}

function Piece({ piece }: { piece: CollagePiece }) {
  return (
    <Image
      src={piece.image}
      alt=""
      aria-hidden="true"
      sizes="(min-width: 1024px) 16vw, 0px"
      className="absolute h-auto drop-shadow-[0_10px_14px_rgba(20,26,22,0.18)]"
      style={{
        width: `${piece.width}%`,
        left: piece.left === undefined ? undefined : `${piece.left}%`,
        right: piece.right === undefined ? undefined : `${piece.right}%`,
        top: piece.top === undefined ? undefined : `${piece.top}%`,
        bottom: piece.bottom === undefined ? undefined : `${piece.bottom}%`,
        transform: `rotate(${piece.rotate}deg)`,
      }}
    />
  );
}

/**
 * One dot per arrangement. A radio group rather than a row of buttons: these
 * are four states of one thing, only one of which can be true. Arrow keys move
 * between them, which is what the role promises and what a keyboard user will
 * try.
 */
function ThemeSwitch({ active, onChange }: { active: number; onChange: (index: number) => void }) {
  const step = (delta: number) => {
    const length = COLLAGE_THEMES.length;
    onChange((active + delta + length) % length);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Home artwork"
      className="pointer-events-auto flex items-center gap-3"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          step(1);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          step(-1);
        }
      }}
    >
      {COLLAGE_THEMES.map((theme, index) => {
        const current = index === active;
        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={current}
            aria-label={theme.label}
            title={theme.label}
            // Only the chosen dot is a tab stop; arrows move within the group.
            tabIndex={current ? 0 : -1}
            onClick={() => onChange(index)}
            className="group -m-2 cursor-pointer p-2"
          >
            <span
              className={cn(
                "block size-2 rounded-full border transition-[background-color,border-color,transform] duration-[--duration-fast] ease-[--ease-primary]",
                current
                  ? "scale-125 border-ink bg-ink"
                  : "border-rule-strong bg-transparent group-hover:border-ink",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
