import { COLLAGE_STORAGE_KEY, DEFAULT_COLLAGE } from "./collage-themes";

/**
 * Puts the stored artwork choice on <html> before the first paint.
 *
 * The collage itself is client-only and can afford to arrive a moment late.
 * The ground wash behind it cannot: it covers the viewport, so a returning
 * visitor would watch the whole page change colour under them. This runs from
 * the document head, ahead of any rendering, which is the only place that
 * problem can be solved.
 *
 * Deliberately tiny and deliberately silent. Site data can be blocked, in which
 * case there is nothing to read and the default already applies.
 */
export function CollageGround() {
  const script = `try{var t=localStorage.getItem(${JSON.stringify(COLLAGE_STORAGE_KEY)});if(t)document.documentElement.dataset.collage=t}catch(e){}`;

  return (
    <script
      // Runs before paint; nothing about it depends on React having hydrated.
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}

export { DEFAULT_COLLAGE };
