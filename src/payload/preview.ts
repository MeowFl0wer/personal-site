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
export const PREVIEW_SECRET = process.env.PREVIEW_SECRET ?? "dev-preview-secret";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? process.env.PAYLOAD_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const previewUrl = (collection: string, path: string) => {
  const params = new URLSearchParams({
    secret: PREVIEW_SECRET,
    collection,
    path: path || "/",
  });
  return `${SITE_URL}/next/preview?${params.toString()}`;
};
