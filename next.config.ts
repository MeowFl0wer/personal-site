import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // The floating route indicator Next draws bottom-left in development. It has
  // never shipped to visitors — it does not exist in a production build — but
  // it sits on top of the page while working on it, which is exactly where the
  // custom cursor and the gallery overlay live.
  devIndicators: false,
  images: {
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
  // /resume became /about. The old URL has been shared, so it keeps working —
  // permanently, because the move is not going to be reversed.
  redirects: async () => [{ source: "/resume", destination: "/about", permanent: true }],
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
