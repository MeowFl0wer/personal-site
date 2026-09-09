/**
 * The one visual value the CMS may set.
 *
 * Not a colour picker — a choice from a fixed set of tones that were checked
 * against the ground wash and the near black. Everything else about the
 * palette, the type and the motion stays in Git, which is what keeps every page
 * the admin builds inside the same design language.
 *
 * The wash runs warm at one corner and cool at the other, so both a warm and a
 * cool tone have somewhere to sit. Harbour picks up its cool end and is the
 * default; clay picks up the warm one and still holds.
 */
const ACCENTS: Record<string, string> = {
  harbor: "#2b6479",
  clay: "#b8412a",
  ink: "#14161a",
  moss: "#4a5a3f",
  slate: "#3f4a57",
  ochre: "#8a6a24",
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
