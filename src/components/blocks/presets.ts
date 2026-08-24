import { cn } from "@/lib/utils";

/**
 * WHERE PRESETS BECOME DESIGN.
 *
 * The CMS stores the word "wide". This file is the only place that decides what
 * "wide" means, and it answers in the site's own grid — never in pixels. Change
 * the design here and every page the admin has ever built changes with it,
 * because none of them stored a measurement.
 *
 * This is the mechanism that makes the block editor safe: an editor can arrange
 * anything and still cannot produce a layout that is off the grid.
 */

export type Width = "narrow" | "normal" | "wide" | "full";
export type Align = "left" | "center" | "right";
export type Spacing = "none" | "small" | "medium" | "large" | "xl";
export type Theme = "auto" | "light" | "dark";
export type Motion = "none" | "subtle" | "default";
export type Ratio = "50-50" | "40-60" | "60-40" | "30-70";

/** Column spans on the shared 12 / 6 / 4 grid. */
export const widthClass: Record<Width, string> = {
  narrow: "col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-4",
  normal: "col-span-4 md:col-span-6 lg:col-span-8 lg:col-start-3",
  wide: "col-span-4 md:col-span-6 lg:col-span-12",
  // Full bleed escapes the shell's gutters without escaping the page.
  full: "col-span-4 md:col-span-6 lg:col-span-12 -mx-[var(--gutter)]",
};

export const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/** Space *below* a block. Named steps, drawn from the section rhythm. */
export const spacingClass: Record<Spacing, string> = {
  none: "mb-0",
  small: "mb-6 md:mb-8",
  medium: "mb-12 md:mb-16",
  large: "mb-20 md:mb-28",
  xl: "mb-28 md:mb-40",
};

export const themeClass: Record<Theme, string> = {
  auto: "",
  light: "bg-paper text-ink",
  dark: "on-void",
};

/** Column split for paired media. */
export const ratioClasses: Record<Ratio, [string, string]> = {
  "50-50": ["lg:col-span-6", "lg:col-span-6"],
  "40-60": ["lg:col-span-5", "lg:col-span-7"],
  "60-40": ["lg:col-span-7", "lg:col-span-5"],
  "30-70": ["lg:col-span-4", "lg:col-span-8"],
};

/**
 * Blocks arrive as loose records (their shape varies by type), so this accepts
 * any object and reads the layout keys defensively rather than forcing every
 * caller to narrow first.
 */
type LayoutInput = {
  width?: unknown;
  align?: unknown;
  spacing?: unknown;
  theme?: unknown;
  motion?: unknown;
  visible?: unknown;
  /** Blocks carry their own content fields too; they are simply ignored here. */
  [key: string]: unknown;
};

const pick = <T extends string>(value: unknown, allowed: Record<T, unknown>, fallback: T): T =>
  typeof value === "string" && value in allowed ? (value as T) : fallback;

/** Resolves a block's stored preset names into one className. */
export const layoutClasses = (layout: LayoutInput | undefined, extra?: string) => {
  const theme = pick(layout?.theme, themeClass, "auto");

  return cn(
    widthClass[pick(layout?.width, widthClass, "normal")],
    alignClass[pick(layout?.align, alignClass, "left")],
    spacingClass[pick(layout?.spacing, spacingClass, "medium")],
    themeClass[theme],
    // A block that sets its own ground needs its own padding, or the colour
    // runs edge to edge with the type hard against it.
    theme !== "auto" ? "px-[var(--gutter)] py-16 md:py-24" : undefined,
    extra,
  );
};

/** `none` and `subtle` both mean "less"; the amount stays in the motion system. */
export const motionOf = (layout: LayoutInput | undefined): Motion =>
  pick<Motion>(layout?.motion, { none: 1, subtle: 1, default: 1 } as Record<Motion, unknown>, "default");

export const isVisible = (layout: LayoutInput | undefined) => layout?.visible !== false;
