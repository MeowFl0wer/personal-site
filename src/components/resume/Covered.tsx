import { cn } from "@/lib/utils";

/**
 * Marks a passage as not this reader's to read.
 *
 * It renders its children — the real components, in the real grid, with the
 * real number of rows — and smears them. The words inside were swapped for
 * others of the same shape on the server, so there is nothing underneath to
 * uncover; the blur is a statement about reading rather than a lock.
 *
 * Which is exactly why it has to be convincing. A smear you can read through
 * does not say "withheld", it says "something has gone wrong with this text" —
 * and the reader's next move is to squint at nonsense rather than to ask for a
 * code.
 *
 * The blur is in `em`, so it scales with whatever it is wrapping. A fixed
 * radius cannot work across a 64px name and 14px prose: the first pass used
 * three pixels for both, which left the name perfectly legible and was the
 * whole complaint. Everything here is relative to the type.
 */

const STRENGTH = {
  /* Enough that letterforms run together into ribbons at any size. */
  normal: "blur-[0.45em]",
  /* For type that is already large, where the same ratio would bleed a long
     way past the line box and into its neighbours. */
  light: "blur-[0.26em]",
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
      className={cn("inline-block max-w-full align-top", className)}
    >
      {/* The smear, and nothing else. A pane of backdrop-filter over the top
          was tried and removed: whatever it does to the ground, it does inside
          a rectangle, and that rectangle is visible as a lighter box around
          every covered passage — which is the panel this was meant to avoid.
          A blur that scales with the type does the whole job on its own.

          `saturate` and a little transparency take the ink down to the weight
          of something seen through glass rather than something printed badly.
          `select-none` because a selection rectangle over unreadable text is
          an invitation to try copying it. */}
      <span
        aria-hidden="true"
        className={cn("block select-none opacity-[0.82] saturate-[0.85]", STRENGTH[strength])}
      >
        {children}
      </span>

    </span>
  );
}

/**
 * The same thing, for a passage that is only sometimes locked.
 *
 * Saves the caller from writing the section twice, which is how the two copies
 * drift apart and one of them forgets to be covered.
 */
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
