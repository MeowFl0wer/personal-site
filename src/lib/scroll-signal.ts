/**
 * THE single scroll-velocity source for the entire site.
 *
 * One module-level object, written by exactly one rAF loop (SmoothScroll), read
 * by everything else — the work index distortion, the gallery ring, the cursor,
 * and any future shader uniform.
 *
 * It is a mutable singleton rather than React state on purpose: consumers read
 * it inside their own animation frame, so publishing it through context would
 * mean re-rendering the tree sixty times a second for no benefit.
 *
 * Invariant: when the page is not scrolling, `velocity` settles to exactly 0
 * and the writer stops doing work. Nothing here spins in the background.
 */

export type ScrollSignal = {
  /** Smoothed, normalised velocity in roughly -1 … 1. Negative = scrolling up. */
  velocity: number;
  /** Raw Lenis velocity in px/frame, unclamped. For debugging and thresholds. */
  raw: number;
  /** Last non-zero direction. */
  direction: 1 | -1;
  /** Current scroll offset in px. */
  scroll: number;
  /** 0 … 1 through the document. */
  progress: number;
  /** True while the smoothed velocity is meaningfully non-zero. */
  moving: boolean;
};

export const scrollSignal: ScrollSignal = {
  velocity: 0,
  raw: 0,
  direction: 1,
  scroll: 0,
  progress: 0,
  moving: false,
};

/** Read-only accessor, for code that should not be able to write the signal. */
export const readScrollSignal = (): Readonly<ScrollSignal> => scrollSignal;
