/**
 * The refraction, defined once for the page.
 *
 * A gaussian blur spreads every letter the same way in every direction, which
 * is why enough of it to be unreadable reads as a smudge rather than as
 * anything. Glass does not do that. It bends what is behind it by an amount
 * that varies across the surface, so lines swim and thicken and thin, and the
 * eye still recognises writing while being unable to resolve a single letter.
 *
 * `feTurbulence` generates that variation and `feDisplacementMap` pushes the
 * pixels around by it. A blur goes in first — displacing sharp edges alone
 * gives a torn, digital look rather than a wet one.
 *
 * Two of them because displacement is measured in pixels and cannot scale with
 * the type the way a blur in `em` can: a name set at 64px needs to move much
 * further than a line of 14px prose before it stops being a name.
 */
export function GlassFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      // Out of the flow entirely; this element exists only to hold the filters.
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id="glass-prose" x="-12%" y="-25%" width="124%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="soft" />
          {/* Wider than it is tall: the ripple runs along the line, which is
              how writing behind real glass comes apart. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011 0.042"
            numOctaves="2"
            seed="11"
            result="ripple"
          />
          <feDisplacementMap
            in="soft"
            in2="ripple"
            scale="20"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter id="glass-display" x="-12%" y="-25%" width="124%" height="150%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="soft" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.005 0.014"
            numOctaves="2"
            seed="4"
            result="ripple"
          />
          <feDisplacementMap
            in="soft"
            in2="ripple"
            scale="78"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
