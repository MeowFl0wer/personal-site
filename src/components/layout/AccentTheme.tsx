/**
 * The one visual value the CMS may set.
 *
 * Not a colour picker — a choice from a fixed set of tones that were checked
 * against the ground wash and the near black. Everything else about the
 * palette, the type and the motion stays in Git, which is what keeps every page
 * the admin builds inside the same design language.
 *
 * The wash runs sky at one corner and meadow at the other, so both a blue and
 * a green tone have somewhere to sit. Harbour is the sky itself and is the
 * default; moss picks up the meadow end.
 *
 * Ochre is the dirt path. It runs through every one of those ridge
 * photographs and is the only warm note in any of them, which makes it the
 * one tone here that adds a hue rather than echoing one — switchable from the
 * CMS without touching this file.
 */
const ACCENTS: Record<string, string> = {
  harbor: "#37718f",
  clay: "#b8412a",
  ink: "#141a16",
  moss: "#4a5a3f",
  slate: "#3f4a57",
  ochre: "#9a6b39",
};

export function AccentTheme({ accent }: { accent: string }) {
  const value = ACCENTS[accent] ?? ACCENTS.harbor;

  return (
    <style
      // A single custom property override; no other token is exposed this way.
      dangerouslySetInnerHTML={{ __html: `:root{--color-accent:${value};}` }}
    />
  );
}
