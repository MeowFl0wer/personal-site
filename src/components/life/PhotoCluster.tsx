import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Media } from "@content/types";

/** Beyond this the cluster stops counting and the note's own page takes over. */
export const CLUSTER_MAX = 4;

/**
 * A note's photographs, arranged by how many there are.
 *
 *   1  a single plate
 *   2  side by side
 *   3  overlapped left to right, like cards dealt across a table
 *   4+ a two-by-two grid, and the fifth onward only exist on the note's page
 *
 * The arrangement is the count, which is the point: you can tell from across the
 * room whether a note is one photograph or a set, without reading anything. Four
 * is the ceiling because five in any of these shapes is no longer a glance, and
 * a row that has to be studied is a row that has stopped being an index.
 *
 * Three is the only arrangement that overlaps, and it overlaps horizontally at
 * full height — no rotation. A fanned, tilted stack fights everything else here:
 * this site has no rounded corners and no tilted anything, and rotating a plate
 * also shortens it, so the row's images would stop lining up with each other.
 * Sliding them sideways keeps every top and bottom edge on the same two lines.
 */
export function PhotoCluster({
  images,
  title,
  className,
}: {
  images: Media[];
  title: string;
  className?: string;
}) {
  const shown = images.slice(0, CLUSTER_MAX);
  if (shown.length === 0) return null;

  // No `position` here on purpose. cn() is a plain string joiner with no
  // tailwind-merge, so a position class in this shared string cannot be
  // overridden by the branches below — both would land in the class list and
  // Tailwind's own ordering would pick `relative`, which silently took the
  // three-image plates out of absolute positioning and stacked them down the
  // page. Each branch states its own.
  const plate = "overflow-hidden bg-ink/[0.06]";
  // One box for every arrangement, so the row's height never depends on how
  // many photographs a note happens to carry.
  const sizes = "(max-width: 768px) 40vw, 220px";

  if (shown.length === 3) {
    // Dealt across, not fanned. Each plate is full height and 46% wide, stepped
    // by 27% so the three of them span the box exactly; the later card always
    // sits in front, which is what makes it read as a stack with an order
    // rather than three overlapping rectangles.
    const offsets = ["left-0 z-10", "left-[27%] z-20", "left-[54%] z-30"];

    return (
      <div className={cn("relative aspect-[3/2] w-full", className)}>
        {shown.map((image, index) => (
          <div
            key={image.src}
            className={cn(
              plate,
              "absolute top-0 h-full w-[46%]",
              // A paper-coloured bar down the leading edge separates each plate
              // from the one behind it without drawing a border anyone reads as
              // a frame. The first card's is off-box and never seen.
              "shadow-[-4px_0_0_0_var(--color-paper)]",
              offsets[index],
            )}
          >
            <Image
              src={image.src}
              alt={image.alt || title}
              fill
              sizes={sizes}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  const grid =
    shown.length === 1
      ? "grid-cols-1 grid-rows-1"
      : shown.length === 2
        ? "grid-cols-2 grid-rows-1"
        : "grid-cols-2 grid-rows-2";

  return (
    <div className={cn("grid aspect-[3/2] w-full gap-1.5", grid, className)}>
      {shown.map((image) => (
        <div key={image.src} className={cn(plate, "relative h-full w-full")}>
          <Image
            src={image.src}
            alt={image.alt || title}
            fill
            sizes={sizes}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
