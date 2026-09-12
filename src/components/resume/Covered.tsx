import { cn } from "@/lib/utils";
import type { Covered as Shape } from "@/lib/cms";

/**
 * Where something private would be.
 *
 * Bars, not blur. A blur filter needs the thing it is blurring to be in the
 * page, and then it is only a picture of privacy — one developer console away
 * from being read. These are drawn from a count and a rough line length that
 * the server sends instead of the content, so the page keeps its weight and
 * the words never leave the database.
 *
 * That shape is itself a small disclosure: a visitor can count the jobs. It is
 * the disclosure that makes the page read as withheld rather than empty, which
 * is the point — but it is worth knowing it is there.
 */
export function Covered({
  shape,
  label,
  className,
}: {
  shape: Shape;
  /** Named for a screen reader, which otherwise meets a row of empty boxes. */
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)} role="group" aria-label={`${label} — locked`}>
      {Array.from({ length: Math.max(1, shape.rows) }, (_, row) => (
        <div key={row} className="flex flex-col gap-2">
          {Array.from({ length: Math.max(1, shape.lines) }, (_, line) => (
            <span
              key={line}
              aria-hidden="true"
              className="block h-[0.7em] rounded-[2px] bg-ink/[0.10]"
              /* Uneven on purpose: a stack of identical bars reads as a
                 loading skeleton, and this is not going to finish loading. */
              style={{ width: `${[92, 74, 83, 61, 88, 69][(row + line) % 6]}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
