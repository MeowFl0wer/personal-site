/**
 * The one visual value the CMS may set.
 *
 * Not a colour picker — a choice from a fixed set of tones that were checked
 * against the warm white and the near black. Everything else about the palette,
 * the type and the motion stays in Git, which is what keeps every page the
 * admin builds inside the same design language.
 */
const ACCENTS: Record<string, string> = {
  clay: "#b8412a",
  ink: "#111111",
  moss: "#4a5a3f",
  slate: "#3f4a57",
  ochre: "#8a6a24",
};

export function AccentTheme({ accent }: { accent: string }) {
  const value = ACCENTS[accent] ?? ACCENTS.clay;

  return (
    <style
      // A single custom property override; no other token is exposed this way.
      dangerouslySetInnerHTML={{ __html: `:root{--color-accent:${value};}` }}
    />
  );
}
