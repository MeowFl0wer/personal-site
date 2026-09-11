"use client";

import Image from "next/image";
import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { collageStore } from "./collage-store";
import { COLLAGE_THEMES, type CollagePiece } from "./collage-themes";

/**
 * The arrangement of printed pieces in the empty half of the hero.
 *
 * Client-only, and deliberately so. It is decoration: the hero is complete
 * without it, so rendering it on the server would buy a flash of the wrong
 * theme for anyone who has chosen one — the stored choice cannot be read until
 * the client runs, and a `useState` initialiser that reaches for localStorage
 * is a hydration mismatch waiting to happen. The ground wash behind it does not
 * have that luxury and is set before first paint by the inline script in the
 * frontend layout; this catches up a moment later, under a fade.
 *
 * Below `lg` there is no empty half to fill — the headline uses the whole width
 * — so the whole thing is left out rather than shrunk into a corner.
 */
export function Collage() {
  const theme = useSyncExternalStore(
    collageStore.subscribe,
    collageStore.get,
    collageStore.getServerSnapshot,
  );

  // The ground wash lives on <html>, outside anything React renders. The
  // inline script in the layout has already set it from storage; this keeps it
  // in step with a choice made here.
  useEffect(() => {
    if (theme) document.documentElement.dataset.collage = theme;
  }, [theme]);

  if (!theme) return null;

  const active = COLLAGE_THEMES.find((entry) => entry.id === theme) ?? COLLAGE_THEMES[0];

  return (
    <div
      data-collage-root
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] items-center justify-center lg:flex"
    >
      <div className="flex flex-col items-center gap-[clamp(1.5rem,4vh,2.75rem)]">
        <div className="relative w-[clamp(15rem,22vw,21rem)]" style={{ aspectRatio: "4 / 5" }}>
          {active.pieces.filter((piece) => piece.behind).map((piece, index) => (
            <Piece key={`behind-${index}`} piece={piece} />
          ))}

          <Image
            src={active.card}
            alt={active.alt}
            sizes="(min-width: 1024px) 22vw, 0px"
            className="absolute inset-0 h-full w-full origin-center -rotate-[1.5deg] object-cover shadow-[0_1px_2px_rgba(20,26,22,0.10),0_18px_40px_-18px_rgba(20,26,22,0.35)]"
          />

          {active.pieces.filter((piece) => !piece.behind).map((piece, index) => (
            <Piece key={`over-${index}`} piece={piece} />
          ))}
        </div>

        <ThemeSwitch theme={theme} onChange={collageStore.set} />
      </div>
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
 * are four states of one thing, only one of which can be true, and arrow keys
 * moving between them is what a screen reader user will expect.
 */
function ThemeSwitch({ theme, onChange }: { theme: string; onChange: (id: string) => void }) {
  return (
    <div
      role="radiogroup"
      aria-label="Home artwork"
      className="pointer-events-auto flex items-center gap-3"
    >
      {COLLAGE_THEMES.map((entry) => {
        const active = entry.id === theme;
        return (
          <button
            key={entry.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={entry.label}
            title={entry.label}
            onClick={() => onChange(entry.id)}
            className="group -m-2 cursor-pointer p-2"
          >
            <span
              className={cn(
                "block size-2 rounded-full border transition-[background-color,border-color,transform] duration-[--duration-fast] ease-[--ease-primary]",
                active
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
