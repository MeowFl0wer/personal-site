/**
 * What the collage needs to draw itself, and nothing else.
 *
 * The component renders on the client, so it cannot resolve a relation or read
 * a draft — everything it needs arrives already flattened by getCollage. This
 * type is the contract between the two, which is also what keeps a Payload
 * schema change from quietly reaching into a client bundle.
 *
 * The storage key lives here for the same reason: a server component and a
 * client one both need it, and it has to come from a module that imports
 * nothing. Keeping it beside the store pulled `useSyncExternalStore` into the
 * server graph and took every page down with it.
 */

/** Where the visitor's chosen arrangement is remembered. */
export const COLLAGE_STORAGE_KEY = "collage-theme";

export type CollageImage = {
  url: string;
  width: number;
  height: number;
  /** See `Media.unoptimized` — a private upload cannot go through the optimizer. */
  unoptimized?: boolean;
};

export type CollagePieceView = CollageImage & {
  /** All four are percentages of the card's own box. */
  x: number;
  y: number;
  scale: number;
  rotate: number;
  behind: boolean;
};

export type CollageThemeView = {
  id: string;
  label: string;
  alt: string;
  card: CollageImage;
  /** The four corners of the ground gradient this arrangement brings with it. */
  wash: { sky: string; haze: string; landFade: string; land: string };
  pieces: CollagePieceView[];
};

export type CollageView = {
  autoplay: boolean;
  /** Seconds each arrangement holds. */
  dwell: number;
  themes: CollageThemeView[];
};
