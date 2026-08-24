import type { Photo } from "./types";

/**
 * Photographs for /gallery.
 *
 * To add one: drop the file in /public/placeholder/gallery (or your own folder)
 * and append an entry here. The 3D ring, the reduced-motion grid and the
 * fullscreen viewer all read from this single array, in this order.
 *
 * Landscape and portrait both work — the ring reads `width`/`height` and sizes
 * each plane to its own aspect ratio.
 */
const p = (
  id: string,
  place: string,
  date: string,
  width: number,
  height: number,
  caption?: string,
): Photo => ({
  id,
  src: `/placeholder/gallery/${id}.jpg`,
  alt: `Photograph — ${place}, ${date}`,
  width,
  height,
  place,
  date,
  caption,
});

export const gallery: Photo[] = [
  p("g-01", "Mount Placeholder", "June 2026", 1600, 1067, "First light on the ridge"),
  p("g-02", "Kyoto, Japan", "May 2026", 1067, 1600),
  p("g-03", "Northern Route", "October 2025", 1600, 1067),
  p("g-04", "Tokyo, Japan", "May 2026", 1067, 1600, "Shinjuku, 23:40"),
  p("g-05", "Atlantic Coast", "February 2025", 1600, 1067),
  p("g-06", "Kanazawa, Japan", "May 2026", 1600, 1067),
  p("g-07", "Mount Placeholder", "June 2026", 1067, 1600),
  p("g-08", "Northern Route", "October 2025", 1600, 1067, "Hut, last light"),
  p("g-09", "Atlantic Coast", "February 2025", 1067, 1600),
  p("g-10", "Various", "2025", 1600, 1067),
  p("g-11", "Tokyo, Japan", "May 2026", 1600, 1067),
  p("g-12", "Mount Placeholder", "June 2026", 1067, 1600),
  p("g-13", "Northern Route", "October 2025", 1600, 1067),
  p("g-14", "Various", "2024", 1600, 1067, "Contact sheet, frame 11"),
];

export const galleryIntro = {
  title: "Gallery",
  lead: ["Photographs,", "in no particular order."],
  /** Small print under the ring. */
  hint: "Scroll or drag · Click to open",
};
