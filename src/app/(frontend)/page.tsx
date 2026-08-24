import { getHome, getHomeSections, getSettings } from "@/lib/cms";
import { Hero } from "@/components/home/Hero";
import { AboutIntro } from "@/components/home/AboutIntro";
import { SelectedWork } from "@/components/home/SelectedWork";
import { LifePreview } from "@/components/home/LifePreview";
import { ToolsPreview } from "@/components/home/ToolsPreview";
import { Elsewhere } from "@/components/home/Elsewhere";
import { pad } from "@/lib/utils";

/**
 * Home answers three questions and then gets out of the way: who I am, what I'm
 * doing, and where to go next. It is not a resume — /about is.
 *
 * The order of the sections below is not written here. It comes from the CMS,
 * where the six designed sections can be dragged into any order and hidden
 * individually. Hero is the one exception: it can be moved, but a home page
 * with no opening is a mistake rather than a layout choice, so if it has been
 * removed entirely it is put back at the top.
 */
export default async function HomePage() {
  const [home, sections, settings] = await Promise.all([getHome(), getHomeSections(), getSettings()]);

  const ordered = sections.some((section) => section.block === "hero")
    ? sections
    : [{ id: "hero-fallback", block: "hero" as const, visible: true, motion: "default" as const, label: null }, ...sections];

  // Section numbers follow the arrangement, so reordering renumbers the page.
  let counter = 0;

  return (
    <>
      {ordered.map((section) => {
        const key = `${section.block}-${section.id}`;
        // The hero carries no section number; everything after it does.
        const index = section.block === "hero" ? null : pad(++counter);

        switch (section.block) {
          case "hero":
            return <Hero key={key} home={home} />;

          case "about":
            return <AboutIntro key={key} home={home} index={index!} label={section.label ?? "About"} />;

          case "work":
            return (
              <SelectedWork key={key} index={index!} label={section.label ?? "Selected Work"} />
            );

          case "life":
            return (
              <LifePreview key={key} index={index!} label={section.label ?? "Away from the screen"} />
            );

          case "tools":
            return <ToolsPreview key={key} index={index!} label={section.label ?? "Tools"} />;

          case "elsewhere":
            return (
              <Elsewhere
                key={key}
                index={index!}
                label={section.label ?? "Elsewhere"}
                blogEnabled={settings.blogEnabled === true}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}
