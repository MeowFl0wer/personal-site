import { requiredSecret } from "@/lib/secrets";

/**
 * Draft preview.
 *
 * The Preview button in the admin points at /next/preview, which validates a
 * shared secret, turns on Next's draft mode, and redirects to the real page.
 *
 * The route lives under /next rather than /api because Payload owns the whole
 * of /api via its catch-all route — a preview endpoint there would be swallowed.
 * The page then queries Payload with `draft: true`, so what you see is the
 * actual frontend — real layout, real animation — rendering unpublished content.
 *
 * There is no separate "preview renderer" to drift out of sync with the site.
 */
/**
 * Read when it is used, not when this module loads.
 *
 * The static export runs `next build` with NODE_ENV=production and has no
 * preview endpoint at all — the whole route is moved aside for it — so
 * demanding the secret at import time would fail a build that never needed it.
 * Every caller below is a callback the admin invokes at runtime.
 */
export const previewSecret = () => requiredSecret("PREVIEW_SECRET", "development-only-preview-secret");

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PAYLOAD_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const previewUrl = (collection: string, path: string) => {
  const params = new URLSearchParams({
    secret: previewSecret(),
    collection,
    path: path || "/",
  });
  return `${SITE_URL}/next/preview?${params.toString()}`;
};
