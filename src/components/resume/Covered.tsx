import { cn } from "@/lib/utils";

/**
 * Marks a passage as not this reader's to read.
 *
 * It renders its children — the real components, in the real grid, with the
 * real number of rows — and puts them behind glass. The words inside were
 * swapped for others of the same shape on the server, so there is nothing
 * underneath to uncover; this is a statement about reading rather than a lock.
 *
 * Three things stacked, and each is doing a different job:
 *
 *  1. A blur in `em`, so the floor of illegibility holds at any type size and
 *     holds even where the SVG filter below does not run.
 *  2. The refraction — see GlassFilter. This is what keeps it from reading as
 *     a smudge: the line swims instead of dissolving, and the eye goes on
 *     recognising writing it cannot resolve.
 *  3. The pane itself: a sheen across it and a lit top edge. Rounded and
 *     inset, so it reads as an object laid over the text rather than as a
 *     rectangle that happens to be a different colour — which is exactly how
 *     the first attempt failed.
 */

const GRADE = {
  prose: { blur: "blur-[0.16em]", filter: "url(#glass-prose)", radius: "rounded-[6px]" },
  display: { blur: "blur-[0.1em]", filter: "url(#glass-display)", radius: "rounded-[10px]" },
} as const;

export function Covered({
  children,
  className,
  strength = "normal",
}: {
  children: React.ReactNode;
  className?: string;
  /** `light` is for type that is already large — a name, a date. */
  strength?: "light" | "normal";
}) {
  const grade = strength === "light" ? GRADE.display : GRADE.prose;

  return (
    <span
      // A group rather than an image: what is announced is that something is
      // here and withheld, not a description of nonsense words.
      role="group"
      aria-label="Locked — an access code shows this"
      className={cn("relative isolate inline-block max-w-full align-top", className)}
    >
      <span aria-hidden="true" className={cn("block select-none", grade.blur)}>
        <span className="block opacity-[0.78]" style={{ filter: grade.filter }}>
          {children}
        </span>
      </span>

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-x-1 -inset-y-1.5",
          grade.radius,
          "bg-gradient-to-br from-white/20 via-white/5 to-white/12",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.55),inset_0_-1px_0_rgb(255_255_255/0.18)]",
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
  strength?: "light" | "normal";
}) {
  if (!locked) return <>{children}</>;
  return (
    <Covered className={cn("block", className)} strength={strength}>
      {children}
    </Covered>
  );
}

Covered.Maybe = Maybe;
