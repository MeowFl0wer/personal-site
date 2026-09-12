import { cn } from "@/lib/utils";

/**
 * Marks a passage as not this reader's to read.
 *
 * It renders its children — the real components, in the real grid, with the
 * real number of rows — and blurs them. The words inside were swapped for
 * others of the same shape on the server, so there is nothing underneath to
 * uncover; this is a statement about reading rather than a lock.
 *
 * The blur alone was uncomfortable, and the reason is worth keeping: a smear
 * with no edge gives the eye nothing to settle on, so it keeps trying to focus
 * on text that will never resolve. What was missing was not more blur — it was
 * a boundary. So the words get a plain blur, scaled in `em` so it holds at any
 * type size, and the region gets a rim.
 *
 * The rim is where the glass is. A hard rectangle reads as a box drawn over the
 * page; the same rectangle displaced by a slow noise field reads as the edge of
 * something poured over it. See GlassFilter — it is applied to the rim and to
 * nothing else, because the same treatment over prose disturbs the baseline and
 * looks like a fault.
 */

const STRENGTH = {
  normal: "blur-[0.4em]",
  /** For type that is already large, where the same ratio bleeds into its neighbours. */
  light: "blur-[0.24em]",
} as const;

export function Covered({
  children,
  className,
  strength = "normal",
}: {
  children: React.ReactNode;
  className?: string;
  strength?: keyof typeof STRENGTH;
}) {
  return (
    <span
      // A group rather than an image: what is announced is that something is
      // here and withheld, not a description of nonsense words.
      role="group"
      aria-label="Locked — an access code shows this"
      className={cn("relative isolate inline-block max-w-full align-top", className)}
    >
      <span
        aria-hidden="true"
        className={cn("block opacity-[0.8] select-none", STRENGTH[strength])}
      >
        {children}
      </span>

      {/* The rim. No fill — a fill is what made the earlier attempts read as a
          panel, and the ground behind the words is doing no harm. Light along
          the top edge and shadow along the bottom is what tells you a surface
          is raised; the displacement is what stops it being a rectangle. */}
      <span
        aria-hidden="true"
        style={{ filter: "url(#glass-edge)" }}
        className={cn(
          "pointer-events-none absolute -inset-x-2 -inset-y-1.5 rounded-[10px]",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.85),inset_0_-1px_0_rgb(20_26_22/0.08),0_1px_3px_-1px_rgb(20_26_22/0.10)]",
          "ring-1 ring-white/45",
        )}
      />
    </span>
  );
}

function Maybe({
  locked,
  children,
  className,
  strength,
}: {
  locked: boolean;
  children: React.ReactNode;
  className?: string;
  strength?: keyof typeof STRENGTH;
}) {
  if (!locked) return <>{children}</>;
  return (
    <Covered className={cn("block", className)} strength={strength}>
      {children}
    </Covered>
  );
}

Covered.Maybe = Maybe;
