import { cn } from "@/lib/utils";

/**
 * Marks a passage as not this reader's to read.
 *
 * It renders its children — the real components, in the real grid, with the
 * real number of rows — and softens them. The words inside have already been
 * swapped for others of the same shape on the server, so what is being blurred
 * is not the content; there is nothing underneath to uncover. The blur is a
 * statement about reading, not a lock.
 *
 * Which is why it is gentle. A heavy frosted panel is a piece of furniture that
 * has to be placed, sized and lined up with something, and the page already has
 * a layout that works. Two pixels of blur and no selection is enough to say
 * "not for you" without redesigning the paragraph.
 */
export function Covered({
  children,
  className,
  /** Small things — a name — need less blur than a block of prose. */
  strength = "normal",
}: {
  children: React.ReactNode;
  className?: string;
  strength?: "light" | "normal";
}) {
  return (
    <span
      // A group rather than an image: what is announced is that something is
      // here and withheld, not a description of nonsense words.
      role="group"
      aria-label="Locked — an access code shows this"
      className={cn(
        "inline-block max-w-full align-top select-none",
        strength === "light" ? "blur-[2.5px]" : "blur-[3px]",
        className,
      )}
    >
      {/* The substituted text is noise; reading it aloud would be worse than
          saying nothing. The label above carries the meaning. */}
      <span aria-hidden="true">{children}</span>
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
