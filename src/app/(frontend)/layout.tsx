import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../globals.css";

import { getSettings, getNavigation, getSocials, getHome, getCollage, toMedia } from "@/lib/cms";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageTransition } from "@/components/motion/PageTransition";
import { Cursor } from "@/components/motion/Cursor";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { PreviewBanner } from "@/components/layout/PreviewBanner";
import { CollageGround } from "@/components/home/CollageGround";
import { AccentTheme } from "@/components/layout/AccentTheme";

/** SEO comes from Site Settings, so the title is editable without a deploy. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const image = toMedia(settings.seoImage);

  return {
    metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined,
    title: {
      default: settings.seoTitle,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.seoDescription,
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      type: "website",
      images: image ? [{ url: image.src, width: image.width, height: image.height }] : undefined,
    },
  };
}

// The sky end of the ground wash — what sits behind the browser chrome at the
// top of a page. Mirrors --wash-sky in globals.css.
export const viewport: Viewport = { themeColor: "#e0eaf2" };

/**
 * The public site's shell. Completely separate from the admin's shell in
 * (payload) — they render different <html> documents, so nothing from the CMS
 * editor is ever downloaded by a visitor.
 *
 * Provider order matters:
 *   MotionProvider → decides whether anything may move at all
 *   SmoothScroll   → owns scroll + publishes the one velocity signal
 *   PageTransition → needs Lenis to reset scroll on route change
 */
export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [settings, navigation, socials, home, collage, { isEnabled: preview }] = await Promise.all([
    getSettings(),
    getNavigation(),
    getSocials(),
    getHome(),
    getCollage(),
    draftMode(),
  ]);

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      // CollageGround writes data-collage here before React hydrates, which is
      // the whole point of it — the ground wash has to be right on the first
      // paint. React would otherwise report the attribute it did not render.
      // This suppresses that for <html>'s own attributes and nothing deeper.
      suppressHydrationWarning
    >
      <body>
        <CollageGround themes={collage.themes} />
        <AccentTheme accent={settings.accentColor ?? "harbor"} />
        <MotionProvider cursorEnabled={settings.cursorEnabled !== false}>
          <SmoothScroll>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
            >
              Skip to content
            </a>

            {preview ? <PreviewBanner /> : null}

            <Cursor />
            <Navigation name={home.name} items={navigation} />

            <main id="main">
              <PageTransition>{children}</PageTransition>
            </main>

            <Footer
              socials={socials}
              name={home.name}
              year={home.year ?? ""}
              basedIn={home.basedIn ?? ""}
            />
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
