"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type MotionState = {
  /** False when the user has asked for reduced motion. */
  motion: boolean;
  /** True only on a desktop-class pointer, with motion allowed and the flag on. */
  cursor: boolean;
  /** False until the first client effect runs — used to defer expensive mounts. */
  ready: boolean;
};

const MotionContext = createContext<MotionState>({ motion: true, cursor: false, ready: false });

/**
 * Owns the two global questions every effect needs to ask:
 * "may I move?" and "is this a fine pointer?".
 *
 * The answers are mirrored onto <html> as data-motion / data-cursor so CSS can
 * respond without a second media query, and exposed via context so JS can bail
 * out before it ever constructs a timeline.
 *
 * Reduced motion is honoured live — toggling it in the OS updates the site
 * without a reload.
 */
export function MotionProvider({
  children,
  cursorEnabled = true,
}: {
  children: ReactNode;
  /** From Site Settings. The custom cursor stays off on touch regardless. */
  cursorEnabled?: boolean;
}) {
  const [state, setState] = useState<MotionState>({ motion: true, cursor: false, ready: false });

  useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    const sync = () => {
      const motion = !reduceQuery.matches;
      const cursor = motion && pointerQuery.matches && cursorEnabled;

      document.documentElement.dataset.motion = motion ? "on" : "off";
      document.documentElement.dataset.cursor = cursor ? "on" : "off";

      setState({ motion, cursor, ready: true });
    };

    sync();
    reduceQuery.addEventListener("change", sync);
    pointerQuery.addEventListener("change", sync);

    return () => {
      reduceQuery.removeEventListener("change", sync);
      pointerQuery.removeEventListener("change", sync);
    };
  }, [cursorEnabled]);

  return <MotionContext.Provider value={state}>{children}</MotionContext.Provider>;
}

export const useMotion = () => useContext(MotionContext);
