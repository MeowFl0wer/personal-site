import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
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
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
