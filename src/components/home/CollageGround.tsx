import { COLLAGE_STORAGE_KEY, type CollageThemeView } from "./collage-types";

/**
 * The ground wash for every arrangement, plus the script that picks one before
 * the first paint.
 *
 * The colours are CMS data now, so they cannot live in the stylesheet. They
 * are emitted the same way the accent is — one small block of custom property
 * overrides, no component taught about them. The first arrangement's colours
 * also become the bare `:root` values, which is what an arrival with nothing
 * stored, a blocked localStorage, or a deleted arrangement all fall back to.
 *
 * The collage itself is client-only and can afford to arrive a moment late.
 * This cannot: it covers the viewport, so a returning visitor would watch the
 * whole page change colour under them. The script runs from the document body
 * ahead of any painting, which is the only place that problem can be solved —
 * and the reason <html> carries suppressHydrationWarning.
 */
/**
 * A CMS string is about to be written straight into a <style> and a <script>,
 * and both of those elements end at a literal `<`. Neither a colour nor an
 * arrangement's id can legitimately contain one — every value here is a hex
 * triplet or an id — so dropping it costs nothing and closes the only way out
 * of the element. The quote and the backslash go too, because the id is also
 * written inside a quoted attribute selector.
 *
 * Belt and braces rather than trust: these fields are the owner's to set, so
 * this is not defending against a stranger. It is making it impossible for a
 * typo in a colour field to take the homepage down with a parse error, and for
 * a future editor to be a way in.
 */
const cssSafe = (value: string) => value.replace(/[<>{}]/g, "");
const selectorSafe = (value: string) => cssSafe(value).replace(/["\\]/g, "");

/** `<` inside a JSON string literal, so `</script>` cannot end the script. */
const jsonSafe = (json: string) => json.replace(/</g, "\\u003c");

export function CollageGround({ themes }: { themes: CollageThemeView[] }) {
  if (!themes.length) return null;

  const stops = (theme: CollageThemeView) =>
    [
      theme.wash.sky && `--wash-sky:${cssSafe(theme.wash.sky)}`,
      theme.wash.haze && `--wash-haze:${cssSafe(theme.wash.haze)}`,
      theme.wash.landFade && `--wash-meadow-fade:${cssSafe(theme.wash.landFade)}`,
      theme.wash.land && `--wash-meadow:${cssSafe(theme.wash.land)}`,
    ]
      .filter(Boolean)
      .join(";");

  const css = [
    `:root{${stops(themes[0])}}`,
    ...themes.map((theme) => `:root[data-collage="${selectorSafe(theme.id)}"]{${stops(theme)}}`),
  ].join("");

  const known = jsonSafe(JSON.stringify(themes.map((theme) => theme.id)));
  const script = `try{var k=${JSON.stringify(COLLAGE_STORAGE_KEY)},t=localStorage.getItem(k);if(t&&${known}.indexOf(t)>-1)document.documentElement.dataset.collage=t}catch(e){}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
