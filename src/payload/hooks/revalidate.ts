import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

/**
 * Publishing updates the live site. No git commit, no deploy.
 *
 * Pages are statically rendered for speed; these hooks tell Next which of them
 * just became stale. Saving a *draft* deliberately revalidates nothing — the
 * published site must not change until you press Publish, which is the whole
 * point of having drafts.
 */

const log = (paths: string[]) => {
  for (const path of paths) revalidatePath(path);
};

/** For collections whose docs each own a URL. */
export const revalidateCollection =
  (buildPaths: (slug: string) => string[]): CollectionAfterChangeHook =>
  ({ doc, previousDoc, req: { payload } }) => {
    const wasPublished = previousDoc?._status === "published";
    const isPublished = doc?._status === "published";

    // Nothing public changed: draft → draft.
    if (!wasPublished && !isPublished) return doc;

    const paths = new Set(buildPaths(doc.slug));

    // Unpublishing, or a slug change, has to clear the old URL as well.
    if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
      for (const path of buildPaths(previousDoc.slug)) paths.add(path);
    }

    payload.logger.info(`Revalidating: ${Array.from(paths).join(", ")}`);
    log(Array.from(paths));

    return doc;
  };

export const revalidateCollectionDelete =
  (buildPaths: (slug: string) => string[]): CollectionAfterDeleteHook =>
  ({ doc }) => {
    if (doc?.slug) log(buildPaths(doc.slug));
    return doc;
  };

/** For globals, which affect a fixed set of pages. */
export const revalidateGlobal =
  (paths: string[]): GlobalAfterChangeHook =>
  ({ doc }) => {
    if (doc?._status === "draft") return doc;
    log(paths);
    return doc;
  };

/** Site settings touch the nav and footer, so every page is affected. */
export const revalidateEverything: GlobalAfterChangeHook = ({ doc }) => {
  revalidatePath("/", "layout");
  return doc;
};

/** Gallery and tools have no drafts — any change is immediately public. */
export const revalidateAlways =
  (paths: string[]): CollectionAfterChangeHook & CollectionAfterDeleteHook =>
  ({ doc }) => {
    log(paths);
    return doc;
  };
