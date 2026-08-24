"use client";

import Image from "next/image";
import { useRef } from "react";
import { pad } from "@/lib/utils";
import type { Photo } from "@content/types";
import type { OriginRect } from "./GalleryViewer";

/**
 * The gallery without WebGL.
 *
 * Used on small screens, when reduced motion is on, when WebGL is unavailable,
 * and when the feature flag is off. It is a real design, not an apology: a
 * staggered editorial grid on the same dark ground, opening the same fullscreen
 * viewer through the same FLIP.
 */
export function GalleryGrid({
  photos,
  onFocus,
}: {
  photos: Photo[];
  onFocus: (index: number, rect: OriginRect) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  return (
    <ul className="grid-12 gap-y-[clamp(2.5rem,7vh,5rem)]">
      {photos.map((photo, index) => {
        const portrait = photo.height > photo.width;
        // A repeating four-step rhythm keeps the grid staggered without random.
        const placement = [
          "col-span-4 md:col-span-4 lg:col-span-5 lg:col-start-1",
          "col-span-4 md:col-span-3 lg:col-span-4 lg:col-start-8 lg:mt-[6vh]",
          "col-span-4 md:col-span-4 md:col-start-3 lg:col-span-4 lg:col-start-3",
          "col-span-4 md:col-span-5 lg:col-span-5 lg:col-start-8",
        ][index % 4];

        return (
          <li key={photo.id} className={placement}>
            <button
              type="button"
              ref={(node) => {
                refs.current[index] = node;
              }}
              data-cursor-state="open"
              onClick={() => {
                const node = refs.current[index];
                if (!node) return;
                const rect = node.getBoundingClientRect();
                onFocus(index, {
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                });
              }}
              className="group block w-full text-left"
            >
              <div
                className="relative w-full overflow-hidden bg-white/5"
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={portrait ? "(max-width: 768px) 100vw, 33vw" : "(max-width: 768px) 100vw, 45vw"}
                  className="object-cover transition-transform duration-[--duration-scene] ease-[--ease-primary] group-hover:scale-[1.02]"
                />
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-small">{photo.place}</span>
                <span className="meta text-muted">{pad(index + 1)}</span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
