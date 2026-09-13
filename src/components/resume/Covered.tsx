import { cn } from "@/lib/utils";
import { LockButton } from "./LockButton";
import { DemoLock } from "./DemoLock";

/**
 * Marks one passage as not this reader's to read.
 *
 * One passage — an organisation, a role, a paragraph, a date. Not a section.
 * Covering a whole block at once produced a single grey slab where a record
 * should be, and the eye has nothing to do with a slab. Covered field by
 * field, the page keeps its rhythm: you can see that there are three jobs,
 * that each has a name and a title and two paragraphs, and that every one of
 * those is being withheld from you individually.
 *
 * The words inside were swapped for others of the same shape on the server, so
 * there is nothing underneath to uncover; the blur is a statement about
 * reading rather than a lock. It is scaled in `em` so it holds from a
 * display-sized name down to a date in mono.
 *
 * The rim is what the blur was missing. A smear with no boundary gives the eye
 * nothing to settle on and it keeps trying to focus; an edge tells it where to
 * stop. No fill — a fill is what made earlier attempts read as a panel.
 */

const STRENGTH = {
  normal: "blur-[0.4em]",
  /** For type that is already large, where the same ratio bleeds into its neighbours. */
  light: "blur-[0.24em]",
} as const;

export function Covered({
  children,
  className,
  label = "This",
  strength = "normal",
  align = "top",
}: {
  children: React.ReactNode;
  className?: string;
  /** Read out to anyone who cannot see the blur. */
  label?: string;
  strength?: keyof typeof STRENGTH;
  /** `baseline` sits the fragment on the line it follows rather than above it. */
  align?: "top" | "baseline";
}) {
  return (
    <span
      className={cn(
        "relative isolate inline-block max-w-full",
        align === "baseline" ? "align-baseline" : "align-top",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("block opacity-[0.8] select-none", STRENGTH[strength])}
      >
        {children}
      </span>

      {/* A rectangle, and left as one. An earlier version pushed this edge
          around with a noise field to keep it from reading as a box; it read
          as a warped box instead. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -inset-x-2 -inset-y-1 rounded-[8px] ring-1 ring-white/45",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.85),inset_0_-1px_0_rgb(20_26_22/0.07),0_1px_3px_-1px_rgb(20_26_22/0.10)]",
        )}
      />

      <LockButton label={label} />
    </span>
  );
}

/**
 * The same thing, for a passage that is only sometimes covered.
 *
 * Three states rather than two, because the demonstration needs a fourth way
 * of being honest. On the real site a passage is either yours to read or it is
 * not, and the server decides before anything is sent. On the demonstration
 * there is nothing to withhold — the writing is invented — so the covering
 * becomes a switch, and it has to work in a page with no server behind it.
 *
 * `demo` renders the passage plainly and marks it. A single attribute on
 * <html>, set by the switch, is what blurs every marked passage at once; see
 * globals.css. Nothing is hidden either way, and the demonstration says so.
 */
function Maybe({
  locked,
  demo = false,
  children,
  className,
  label,
  strength,
  align = "top",
}: {
  locked: boolean;
  demo?: boolean;
  children: React.ReactNode;
  className?: string;
  label?: string;
  strength?: keyof typeof STRENGTH;
  align?: "top" | "baseline";
}) {
  if (demo) {
    return (
      <span
        data-demo-private
        data-demo-label={label}
        className={cn(
          "relative isolate inline-block max-w-full",
          // Same choice as the covered path. Left on align-top, a name beside a
          // display-sized heading hangs off its cap height instead of sitting
          // on the line, which is where it looked wrong on the demonstration.
          align === "baseline" ? "align-baseline" : "align-top",
          className,
        )}
      >
        <span data-demo-text className="block">
          {children}
        </span>
        <span data-demo-rim aria-hidden="true" className="pointer-events-none absolute" />
        <DemoLock label={label ?? "This"} />
      </span>
    );
  }

  if (!locked) return <>{children}</>;
  return (
    <Covered className={cn("block", className)} label={label} strength={strength} align={align}>
      {children}
    </Covered>
  );
}

Covered.Maybe = Maybe;
