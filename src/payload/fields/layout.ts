import type { Field } from "payload";

/**
 * Shared layout controls.
 *
 * This file is the whole reason the admin cannot break the design: every block
 * gets its layout from these presets, and a preset is a *name* — `wide`,
 * `large`, `subtle` — never a pixel value. The frontend decides what each name
 * means, so the design system stays in Git while the arrangement stays in the CMS.
 *
 * There is deliberately no field anywhere in this project for a raw colour,
 * font size, margin, duration or easing.
 */

export const WIDTHS = ["narrow", "normal", "wide", "full"] as const;
export const ALIGNMENTS = ["left", "center", "right"] as const;
export const SPACINGS = ["none", "small", "medium", "large", "xl"] as const;
export const THEMES = ["auto", "light", "dark"] as const;
export const MOTIONS = ["none", "subtle", "default"] as const;
export const RATIOS = ["50-50", "40-60", "60-40", "30-70"] as const;
export const FITS = ["cover", "contain"] as const;

const option = (value: string, label: string) => ({ value, label });

export const widthField = (defaultValue: (typeof WIDTHS)[number] = "normal"): Field => ({
  name: "width",
  type: "select",
  defaultValue,
  admin: { width: "25%", description: "How much of the grid this block occupies." },
  options: [
    option("narrow", "Narrow"),
    option("normal", "Normal"),
    option("wide", "Wide"),
    option("full", "Full bleed"),
  ],
});

export const alignField = (defaultValue: (typeof ALIGNMENTS)[number] = "left"): Field => ({
  name: "align",
  type: "select",
  defaultValue,
  admin: { width: "25%" },
  options: [option("left", "Left"), option("center", "Center"), option("right", "Right")],
});

export const spacingField = (defaultValue: (typeof SPACINGS)[number] = "medium"): Field => ({
  name: "spacing",
  type: "select",
  defaultValue,
  admin: { width: "25%", description: "Space below this block." },
  options: SPACINGS.map((value) => option(value, value === "xl" ? "XL" : value[0].toUpperCase() + value.slice(1))),
});

export const themeField = (): Field => ({
  name: "theme",
  type: "select",
  defaultValue: "auto",
  admin: { width: "25%", description: "Auto follows the page." },
  options: [option("auto", "Auto"), option("light", "Light"), option("dark", "Dark")],
});

export const motionField = (): Field => ({
  name: "motion",
  type: "select",
  defaultValue: "default",
  admin: {
    width: "25%",
    description: "How much this block animates. Exact timings stay in the motion system.",
  },
  options: [option("none", "None"), option("subtle", "Subtle"), option("default", "Default")],
});

export const visibleField = (): Field => ({
  name: "visible",
  type: "checkbox",
  defaultValue: true,
  admin: { width: "25%", description: "Uncheck to hide without deleting." },
});

/**
 * The standard control strip appended to every block, collapsed by default so
 * the editor sees content first and layout second.
 */
export const layoutGroup = (
  overrides: { width?: (typeof WIDTHS)[number]; spacing?: (typeof SPACINGS)[number] } = {},
): Field => ({
  type: "collapsible",
  label: "Layout",
  admin: { initCollapsed: true },
  fields: [
    {
      type: "row",
      fields: [
        widthField(overrides.width),
        alignField(),
        spacingField(overrides.spacing),
        themeField(),
      ],
    },
    {
      type: "row",
      fields: [motionField(), visibleField()],
    },
  ],
});

export const ratioField = (): Field => ({
  name: "ratio",
  type: "select",
  defaultValue: "50-50",
  admin: { width: "50%" },
  options: [
    option("50-50", "50 / 50"),
    option("40-60", "40 / 60"),
    option("60-40", "60 / 40"),
    option("30-70", "30 / 70"),
  ],
});

export const fitField = (): Field => ({
  name: "fit",
  type: "select",
  defaultValue: "cover",
  admin: { width: "50%" },
  options: [option("cover", "Cover"), option("contain", "Contain")],
});
