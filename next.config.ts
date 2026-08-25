import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * One config, two targets.
 *
 * The real site is a Next server with Payload mounted inside it. The preview on
 * GitHub Pages is a folder of HTML — no database, no CMS, no auth, no server
 * actions, nothing that needs Node at request time.
 *
 * The difference is a single environment variable, and everything it switches
 * lives in this file, `scripts/build-static.mjs` and `.github/workflows/`.
 * Nothing under `src/` knows which target it is being built for, which is the
 * point: the preview is a deployment of the same application, not a fork of it.
 *
 * Note that Payload is still a *build-time* dependency of the static export.
 * The pages fetch their content from it while `next build` runs, exactly as
 * they do for a server build, and what ships is the rendered result. "No
 * database in preview" is a statement about the deployed artefact, not about
 * the machine that produced it.
 */
const STATIC = process.env.STATIC_EXPORT === "1";

/**
 * `/personal-site` when the preview is served from a GitHub project path,
 * empty once it answers on demov1.euan.im. It has to be baked in at build time
 * — Next inlines it into the client bundles — so the domain is chosen by the
 * workflow, not at runtime.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // The floating route indicator Next draws bottom-left in development. It has
  // never shipped to visitors — it does not exist in a production build — but
  // it sits on top of the page while working on it, which is exactly where the
  // custom cursor and the gallery overlay live.
  devIndicators: false,

  images: STATIC
    ? {
        // A static export cannot use the default loader — that one calls back
        // to a server. The custom loader is an identity function that exists
        // only to satisfy that requirement: media URLs are already correct by
        // the time they reach it, rewritten at the source. See
        // scripts/build-static.mjs.
        loader: "custom",
        loaderFile: "./scripts/static-image-loader.mjs",
      }
    : {
        // Media served from object storage in production; local uploads in dev.
        remotePatterns: process.env.S3_PUBLIC_URL
          ? [{ protocol: "https", hostname: new URL(process.env.S3_PUBLIC_URL).hostname }]
          : [],
        formats: ["image/avif", "image/webp"],
      },

  // Three.js and the admin bundle both benefit; neither ends up in the other's
  // chunks because /admin and the site are separate route groups.
  experimental: {
    optimizePackageImports: ["three", "@react-three/drei"],
  },

  ...(STATIC
    ? {
        output: "export" as const,
        basePath: BASE_PATH || undefined,
        assetPrefix: BASE_PATH || undefined,
        // `/about/index.html` rather than `/about.html`. GitHub Pages resolves
        // a directory to its index without any server config; extensionless
        // files are a rewrite rule we do not get to write there.
        trailingSlash: true,
        // `redirects` is one of the features a static export cannot express —
        // there is no server to answer with a 308. The /resume → /about
        // redirect is emitted as a meta-refresh stub instead, by the build
        // script, so a link shared before the rename still lands.
      }
    : {
        // /resume became /about. The old URL has been shared, so it keeps
        // working — permanently, because the move is not going to be reversed.
        redirects: async () => [
          { source: "/resume", destination: "/about", permanent: true },
        ],
      }),
};

// withPayload stays on both paths. The static export has no /admin and no /api,
// but the pages still read from Payload while the build runs, so its aliases
// and server-package handling are needed either way.
export default withPayload(nextConfig, { devBundleServerPackages: false });
