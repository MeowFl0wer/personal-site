/**
 * The image loader for the static export.
 *
 * It returns the source unchanged, on purpose.
 *
 * `next/image`'s default loader calls back to a server that a folder of HTML on
 * GitHub Pages does not have, so a static export must name a custom one. The
 * obvious thing to put here would be the basePath prefix — `next/image` does
 * NOT add basePath to `src` by itself, which is the trap this project would
 * otherwise fall into. It is not enough, though: three of this site's images
 * never reach `next/image` at all. The gallery hands raw URLs to three.js as
 * WebGL textures, and the hover preview and the video block set `<video src>`
 * directly. A fix that lives in this file would leave all three broken.
 *
 * So the URLs are corrected one level down instead — at the source, in the
 * database the build reads from, where every consumer sees the same answer.
 * See `rewriteMediaUrls` in scripts/build-static.mjs.
 *
 * Sizes are ignored because the export ships the file as uploaded. Payload has
 * already produced the derivatives; picking between them is a server's job.
 */
export default function staticImageLoader({ src }) {
  return src;
}
