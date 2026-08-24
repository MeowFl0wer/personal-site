/** Minimal class joiner. Not worth a dependency at this size. */
export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/** "01", "02", … — the site's section and index numbering. */
export const pad = (n: number, width = 2) => String(n).padStart(width, "0");

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Frame-rate independent damping factor. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
