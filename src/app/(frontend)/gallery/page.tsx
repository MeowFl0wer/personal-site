import type { Metadata } from "next";
import { getGallery, getSettings } from "@/lib/cms";
import { SectionNumber } from "@/components/ui/SectionHeader";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal, RuleReveal } from "@/components/motion/Reveal";
import { GalleryStage } from "@/components/gallery/GalleryStage";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from trails, trains and everywhere in between.",
};

/**
 * Gallery lives under Life but keeps its own route, and its own ground: the one
 * dark passage on the site, so the photographs supply all the colour.
 *
 * The order the ring turns through is exactly the order of the Gallery
 * collection in the admin — drag a row there and the 3D scene follows. The admin
 * never touches a Three.js parameter.
 */
export default async function GalleryPage() {
  const [photos, settings] = await Promise.all([getGallery(), getSettings()]);

  return (
    <div className="on-void -mt-px min-h-screen bg-void text-void-ink">
      <div className="shell pt-10 md:pt-16">
        <Reveal>
          <SectionNumber index="02.1" label="Gallery" />
        </Reveal>
        <RuleReveal className="mt-4" />

        <div className="grid-12 mt-12 items-end gap-y-8 pb-[clamp(3rem,8vh,6rem)] md:mt-16">
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-7" stagger="line">
            <h1 className="text-display font-medium">
              <span data-reveal-item className="block">
                Photographs,
              </span>
              <span data-reveal-item className="block">
                in no particular order.
              </span>
            </h1>
          </Reveal>

          <Reveal
            className="col-span-4 flex flex-col gap-3 md:col-span-6 lg:col-span-3 lg:col-start-10"
            delay={0.08}
          >
            <span className="meta text-void-muted">{photos.length} photographs</span>
            <ArrowLink href="/life" arrow="←" className="text-small">
              Back to Life
            </ArrowLink>
          </Reveal>
        </div>
      </div>

      {photos.length > 0 ? (
        <GalleryStage photos={photos} webglEnabled={settings.webglGallery !== false} />
      ) : (
        <div className="shell pb-[clamp(4rem,12vh,9rem)]">
          <p className="text-headline text-void-muted">No photographs yet.</p>
        </div>
      )}
    </div>
  );
}
