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

export const collageThemes: CollageThemeSeed[] = [
  {
    label: "Ridge",
    card: "card-hills",
    alt: "Illustration of rolling green hills with a figure sitting in the grass",
    pieces: [
      { image: "pine-tree", x: 84, y: -9, width: 30, rotate: -7 },
      { image: "hills-green", x: -13, y: 62, width: 60, rotate: -4 },
      { image: "figure-front", x: 76, y: 52, width: 33, rotate: 3 },
    ],
    wash: { sky: "#e0eaf2", haze: "#edf1f2", landFade: "#f0f4ea", land: "#e8efdc" },
  },
  {
    label: "Plateau",
    card: "card-yaks",
    alt: "Illustration of pale blue mountains above a plain, with yaks grazing",
    pieces: [
      { image: "pine-branch", x: -15, y: -8, width: 34, rotate: 9 },
      { image: "ridge-red", x: 46, y: 60, width: 66, rotate: 3 },
      { image: "figure-neon", x: -6, y: 50, width: 24, rotate: -4 },
    ],
    wash: { sky: "#e3eaf0", haze: "#eff1ee", landFade: "#f3f1e6", land: "#f0ead9" },
  },
  {
    label: "Coast",
    card: "card-coast",
    alt: "Illustration of reeds bending in front of a flat blue sea",
    pieces: [
      { image: "reeds-gold", x: 83, y: -10, width: 30, rotate: -9 },
      { image: "sea-stacks", x: 50, y: 64, width: 64, rotate: -3 },
      { image: "figure-striped", x: -10, y: 52, width: 32, rotate: 4 },
    ],
    wash: { sky: "#dde8f0", haze: "#e9eff2", landFade: "#eef3ee", land: "#e6efe9" },
  },
  {
    label: "Snowline",
    card: "card-ridges",
    alt: "Illustration of distant blue ridges layered above a green slope",
    pieces: [
      { image: "snow-peak", x: 79, y: -8, width: 36, rotate: 6 },
      { image: "snow-summit", x: -14, y: 60, width: 62, rotate: 4 },
      { image: "figure-puffer", x: 79, y: 52, width: 29, rotate: -3 },
    ],
    wash: { sky: "#e1eaf3", haze: "#eef1f5", landFade: "#f1f3f6", land: "#e9edf2" },
  },
];
