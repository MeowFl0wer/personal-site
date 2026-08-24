import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Media } from "@content/types";

/**
 * A field note at card size: the photograph on the left, the date and the note
 * itself to the right of it.
 *
 * The thumbnail is a fixed square rather than the note's own aspect ratio. A
 * grid of these is read as a list, and a list whose rows are different heights
 * because one photograph was a portrait is a list that has stopped being
 * scannable. The real ratio is still there on the note's own page and in the
 * six large entries above.
 */
export function LifeCard({
  href,
  cover,
  title,
  date,
  description,
  className,
}: {
  href: string;
  cover?: Media;
  title: string;
  date?: string | null;
  description?: string | null;
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-cursor-state="view"
      className={cn("group flex items-start gap-5", className)}
    >
      {cover ? (
        <div className="relative size-24 shrink-0 overflow-hidden bg-ink/[0.06]">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:scale-[1.03]"
          />
        </div>
      ) : null}

      <div className="min-w-0">
        {date ? <p className="meta text-muted">{date}</p> : null}

        <h3 className="mt-1.5 text-small font-medium transition-transform duration-[--duration-ui] ease-[--ease-primary] group-hover:translate-x-0.5">
          {title}
        </h3>

        {description ? (
          <p className="mt-1.5 line-clamp-2 text-small text-muted">{description}</p>
        ) : null}
      </div>
    </Link>
  );
}
