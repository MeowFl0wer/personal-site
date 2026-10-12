import type { Access } from "payload";

/**
 * Access control for a single-owner site.
 *
 * There is no RBAC, no teams, no workspaces — deliberately. Two rules cover
 * everything: the public can read published content, and the signed-in owner
 * can do anything.
 *
 * If a second editor is ever needed, add a `role` field to Users and widen
 * `ownerOnly`. Nothing else has to change.
 */

/** Public read. Drafts are excluded separately by `readPublished`. */
export const anyone: Access = () => true;

/** Any authenticated user — on this site, that is the owner. */
export const ownerOnly: Access = ({ req }) => Boolean(req.user);

/**
 * Readable by the site's own server, and over HTTP only when signed in.
 *
 * For the globals the public pages are rendered from but which also hold what
 * those pages withhold: the private half of the résumé, the private socials.
 * /about covers those while it renders, on the server — so the page is safe,
 * but `GET /api/globals/resume` (or the same through GraphQL) would hand an
 * anonymous caller the uncovered document. Cloudflare Access in front of /api
 * stopped that, and it was the only thing that did (found 2026-10-12): one
 * misconfigured rule away from the whole point of the access codes.
 *
 * `payloadAPI` is how Payload says where a request came from. "local" is this
 * server's own code — the pages, the static export, the scripts — which keeps
 * reading exactly as before, every other access rule (private media included)
 * still applied. REST and GraphQL are someone on the network, and they now get
 * a 403 unless signed in to the admin.
 */
export const localOrOwner: Access = ({ req }) => Boolean(req.user) || req.payloadAPI === "local";

/**
 * Public sees published only; the signed-in owner sees drafts too, which is
 * what makes draft preview work without a second, unprotected code path.
 */
export const readPublished: Access = ({ req }) => {
  if (req.user) return true;
  return {
    _status: { equals: "published" },
  };
};
