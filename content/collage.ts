/**
 * The arrangements the home page starts out wearing.
 *
 * GENERATED — written by `npm run collage:save` from whatever is currently in
 * the database. Arrange the pieces in /admin, run that, and commit: this file
 * is what a fresh checkout, the server and the static preview all seed from.
 *
 * Editing it by hand works and is sometimes the quickest thing to do, but the
 * next save overwrites it, so do not leave anything here that is not also in
 * the admin.
 *
 * Positions are percentages of the card's own box. Negative values hang a
 * piece off the edge, which is most of what makes it look stuck on rather than
 * printed.
 */
export type CollagePieceSeed = {
  image: string;
  x: number;
  y: number;
  width: number;
  rotate: number;
  behind?: boolean;
};

export type CollageThemeSeed = {
  label: string;
  card: string;
  alt: string;
  pieces: CollagePieceSeed[];
  wash: { sky: string; haze: string; landFade: string; land: string };
};

/** How the arrangements take their turn. Editable in the admin like the rest. */
export const collageSettings = {
  autoplay: true,
  /** Seconds each arrangement holds before the next slides in. */
  dwell: 3,
};

export const collageThemes: CollageThemeSeed[] = [
  {
    label: "Ridge",
    card: "card-hills",
    alt: "Illustration of rolling green hills with a figure sitting in the grass",
    pieces: [
      { image: "pine-tree", x: 65.2, y: -13.4, width: 48, rotate: -7 },
      { image: "hills-green", x: -27.9, y: 12.6, width: 69.4, rotate: -4 },
      { image: "figure-front", x: 83.6, y: 42.6, width: 49.6, rotate: 4 },
      { image: "forest-autumn", x: -18.2, y: 68.7, width: 66.3, rotate: 0 },
    ],
    wash: { sky: "#e0eaf2", haze: "#edf1f2", landFade: "#f0f4ea", land: "#e8efdc" },
  },
  {
    label: "Plateau",
    card: "card-yaks",
    alt: "Illustration of pale blue mountains above a plain, with yaks grazing",
    pieces: [
      { image: "pine-branch", x: -17.3, y: -7.8, width: 45.8, rotate: 9 },
      { image: "ridge-red", x: 39.6, y: 69.3, width: 80.7, rotate: 3 },
      { image: "figure-neon", x: -20.8, y: 46.5, width: 36.6, rotate: 0 },
      { image: "sunset-figure", x: 66.8, y: 0.8, width: 62.2, rotate: 0 },
    ],
    wash: { sky: "#e3eaf0", haze: "#eff1ee", landFade: "#f3f1e6", land: "#f0ead9" },
  },
  {
    label: "Coast",
    card: "card-coast",
    alt: "Illustration of reeds bending in front of a flat blue sea",
    pieces: [
      { image: "reeds-gold", x: 72.4, y: -20.9, width: 41.4, rotate: -9 },
      { image: "sea-stacks", x: 75.5, y: 77.3, width: 85.4, rotate: -1 },
      { image: "figure-striped", x: -31.6, y: 43.4, width: 51.1, rotate: 4 },
      { image: "figure-blue", x: 93.9, y: 22.3, width: 37.8, rotate: 3 },
    ],
    wash: { sky: "#dde8f0", haze: "#e9eff2", landFade: "#eef3ee", land: "#e6efe9" },
  },
  {
    label: "Snowline",
    card: "card-ridges",
    alt: "Illustration of distant blue ridges layered above a green slope",
    pieces: [
      { image: "snow-peak", x: 61.8, y: -13.9, width: 56.5, rotate: 6 },
      { image: "figure-side", x: -31, y: 10.6, width: 59.2, rotate: 0 },
      { image: "snow-summit", x: -36.3, y: 75.1, width: 71, rotate: 4 },
      { image: "figure-puffer", x: 85.2, y: 32.7, width: 50.9, rotate: -3 },
      { image: "figure-mirror", x: 42.2, y: 49.8, width: 43.8, rotate: 2 },
    ],
    wash: { sky: "#e1eaf3", haze: "#eef1f5", landFade: "#f1f3f6", land: "#e9edf2" },
  },
];
