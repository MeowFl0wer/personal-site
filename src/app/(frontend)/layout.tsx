import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../globals.css";

import { getSettings, getNavigation, getSocials, getHome, toMedia } from "@/lib/cms";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { PageTransition } from "@/components/motion/PageTransition";
import { Cursor } from "@/components/motion/Cursor";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { PreviewBanner } from "@/components/layout/PreviewBanner";
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

export const viewport: Viewport = { themeColor: "#f1f0eb" };

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
  const [settings, navigation, socials, home, { isEnabled: preview }] = await Promise.all([
    getSettings(),
    getNavigation(),
    getSocials(),
    getHome(),
    draftMode(),
  ]);

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <AccentTheme accent={settings.accentColor ?? "clay"} />
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
              signOff={(home.signOff ?? []).map((line) => line.text)}
              socials={socials}
              navigation={navigation}
              email={settings.email}
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
