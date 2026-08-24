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
 * Public sees published only; the signed-in owner sees drafts too, which is
 * what makes draft preview work without a second, unprotected code path.
 */
export const readPublished: Access = ({ req }) => {
  if (req.user) return true;
  return {
    _status: { equals: "published" },
  };
};
