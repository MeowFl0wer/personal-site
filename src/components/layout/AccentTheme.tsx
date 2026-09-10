/**
 * The one visual value the CMS may set.
 *
 * Not a colour picker — a choice from a fixed set of tones that were checked
 * against the ground wash and the near black. Everything else about the
 * palette, the type and the motion stays in Git, which is what keeps every page
 * the admin builds inside the same design language.
 *
 * The wash runs sea at one corner and scrub at the other, so both a blue and a
 * green tone have somewhere to sit. Harbour is the sea itself, read off the
 * photograph the palette came from, and is the default; moss picks up the land
 * end. Clay is the one warm tone left, and on this ground it is a deliberate
 * clash rather than a safe pick.
 */
const ACCENTS: Record<string, string> = {
  harbor: "#3a6d8c",
  clay: "#b8412a",
  ink: "#12181c",
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
