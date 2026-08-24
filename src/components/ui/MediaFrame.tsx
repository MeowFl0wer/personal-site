import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Media } from "@content/types";

/**
 * Every image on the site goes through here.
 *
 * One place to decide the loading strategy, the placeholder tone and the caption
 * treatment — and one place to change when the placeholder JPGs are swapped for
 * real photographs.
 */
export function MediaFrame({
  media,
  className,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 40vw",
  priority = false,
  ratio,
  fill = true,
  caption,
}: {
  media: Media;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** CSS aspect-ratio override, e.g. "3 / 2". Defaults to the media's own. */
  ratio?: string;
  fill?: boolean;
  caption?: string;
}) {
  const aspect = ratio ?? `${media.width} / ${media.height}`;

  return (
    <figure className={cn("relative w-full", className)}>
      <div className="relative w-full overflow-hidden bg-ink/[0.06]" style={{ aspectRatio: aspect }}>
        {fill ? (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <Image
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            sizes={sizes}
            priority={priority}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {caption ? <figcaption className="meta mt-3 text-muted">{caption}</figcaption> : null}
    </figure>
  );
}
