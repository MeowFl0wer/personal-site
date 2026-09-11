import type { StaticImageData } from "next/image";

import ridgeCard from "@/assets/collage/ridge-card.webp";
import ridgeHills from "@/assets/collage/ridge-hills.webp";
import ridgeFigure from "@/assets/collage/ridge-figure.webp";
import ridgePine from "@/assets/collage/ridge-pine.webp";

import plateauCard from "@/assets/collage/plateau-card.webp";
import plateauRidge from "@/assets/collage/plateau-ridge.webp";
import plateauFigure from "@/assets/collage/plateau-figure.webp";
import plateauBranch from "@/assets/collage/plateau-branch.webp";

import coastCard from "@/assets/collage/coast-card.webp";
import coastStacks from "@/assets/collage/coast-stacks.webp";
import coastFigure from "@/assets/collage/coast-figure.webp";
import coastReeds from "@/assets/collage/coast-reeds.webp";

import snowCard from "@/assets/collage/snow-card.webp";
import snowSummit from "@/assets/collage/snow-summit.webp";
import snowFigure from "@/assets/collage/snow-figure.webp";
import snowPeak from "@/assets/collage/snow-peak.webp";

/**
 * The four arrangements the home page can wear.
 *
 * Each is a printed card with three cut-outs laid over it, and each one is
 * placed by hand — a grid of evenly spaced stickers reads as a component, and
 * the whole point of the thing is that someone put it there.
 *
 * `id` is also the value of `data-collage` on <html>, which is what re-points
 * the ground wash in globals.css. The two have to stay in step: a theme added
 * here with no matching block there will swap the artwork and leave the page
 * the wrong colour behind it.
 *
 * Positions are percentages of the card's own box, so the whole collage scales
 * with one clamp on the container and nothing needs a breakpoint.
 */
export type CollagePiece = {
  image: StaticImageData;
  /** Percentage of the card's width. Height follows the aspect ratio. */
  width: number;
  /** Percentages of the card's box. Negative values hang off the edge. */
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  rotate: number;
  /** Above the card by default; below it for anything meant to sit behind. */
  behind?: boolean;
};

export type CollageTheme = {
  id: string;
  /** Shown on the switch, and read out as the control's label. */
  label: string;
  /** Alt text for the card. The pieces are decorative and carry none. */
  alt: string;
  card: StaticImageData;
  pieces: CollagePiece[];
};

export const COLLAGE_THEMES: CollageTheme[] = [
  {
    id: "ridge",
    label: "Ridge",
    alt: "Illustration of rolling green hills with a figure sitting in the grass",
    card: ridgeCard,
    pieces: [
      { image: ridgePine, width: 30, right: -14, top: -9, rotate: -7 },
      { image: ridgeHills, width: 60, left: -13, bottom: 16, rotate: -4 },
      { image: ridgeFigure, width: 33, right: -9, bottom: -6, rotate: 3 },
    ],
  },
  {
    id: "plateau",
    label: "Plateau",
    alt: "Illustration of pale blue mountains above a plain, with yaks grazing",
    card: plateauCard,
    pieces: [
      { image: plateauBranch, width: 34, left: -15, top: -8, rotate: 9 },
      { image: plateauRidge, width: 66, right: -12, bottom: 14, rotate: 3 },
      { image: plateauFigure, width: 24, left: -6, bottom: -7, rotate: -4 },
    ],
  },
  {
    id: "coast",
    label: "Coast",
    alt: "Illustration of reeds bending in front of a flat blue sea",
    card: coastCard,
    pieces: [
      { image: coastReeds, width: 30, right: -13, top: -10, rotate: -9 },
      { image: coastStacks, width: 64, right: -14, bottom: 18, rotate: -3 },
      { image: coastFigure, width: 32, left: -10, bottom: -6, rotate: 4 },
    ],
  },
  {
    id: "snow",
    label: "Snowline",
    alt: "Illustration of distant blue ridges layered above a green slope",
    card: snowCard,
    pieces: [
      { image: snowPeak, width: 36, right: -15, top: -8, rotate: 6 },
      { image: snowSummit, width: 62, left: -14, bottom: 15, rotate: 4 },
      { image: snowFigure, width: 29, right: -8, bottom: -7, rotate: -3 },
    ],
  },
];

export const DEFAULT_COLLAGE = COLLAGE_THEMES[0].id;

/** Shared with the no-flash script in the frontend layout. */
export const COLLAGE_STORAGE_KEY = "collage-theme";
