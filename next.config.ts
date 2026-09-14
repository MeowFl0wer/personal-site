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

        /**
         * The browser-side protections that are only switched on by a header.
         *
         * Server target only, and not because the preview does not deserve
         * them: `headers` is the same kind of thing as `redirects` — there is
         * no server in a static export to send one, and GitHub Pages does not
         * take instructions from this file. The preview's headers are whatever
         * is in front of it. Nothing under `src/` is involved either way.
         *
         * No Content-Security-Policy here yet. A useful one needs a nonce on
         * every inline script — the collage's first-paint script, the accent
         * block, and the ones Next injects itself — and a nonce needs
         * middleware, which a static export does not have. That is a decision
         * about how the site is rendered, not a header to bolt on, so it is
         * deliberately left for later rather than shipped as a permissive CSP
         * that would mostly be decoration.
         */
        headers: async () => [
          {
            source: "/:path*",
            headers: [
              // No content-type guessing. An upload that claims to be an image
              // does not get to be HTML because the bytes looked like it.
              { key: "X-Content-Type-Options", value: "nosniff" },

              // SAMEORIGIN, not DENY. The admin's live preview renders the
              // site in an iframe next to the editor, and it is the same
              // origin — DENY would break the CMS to defend against nothing.
              { key: "X-Frame-Options", value: "SAMEORIGIN" },

              // The one that matters most here: an access link is
              // `/unlock/<code>`, and without this the code travels in a
              // `Referer` to whatever the visitor clicks next.
              { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

              // Nothing on this site asks for any of these, so nothing on this
              // site should be able to.
              {
                key: "Permissions-Policy",
                value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
              },

              // Two years, subdomains included. No `preload`: that submits the
              // domain to a list browsers ship, and getting off it is slow —
              // worth doing deliberately once the real site is settled, not as
              // a side effect of adding a header.
              {
                key: "Strict-Transport-Security",
                value: "max-age=63072000; includeSubDomains",
              },
            ],
          },
        ],
      }),
};

// withPayload stays on both paths. The static export has no /admin and no /api,
// but the pages still read from Payload while the build runs, so its aliases
// and server-package handling are needed either way.
export default withPayload(nextConfig, { devBundleServerPackages: false });
