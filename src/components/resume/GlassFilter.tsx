/**
 * The wobble in the edge of the pane, defined once for the page.
 *
 * It is applied to the rim and to nothing else. Running the displacement over
 * the words themselves was tried and is wrong: at display size it reads as
 * water, but at fourteen pixels it disturbs the baseline and the passage looks
 * like a scan that failed rather than like something withheld.
 *
 * On an edge it does exactly what is wanted. A rectangle announces itself as a
 * rectangle no matter how faint it is; the same rectangle pushed around by a
 * low-frequency noise field stops being a shape the eye can name, and becomes
 * the boundary of a poured material.
 */
export function GlassFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter id="glass-edge" x="-20%" y="-40%" width="140%" height="180%">
          {/* Long, lazy waves. A high frequency here reads as a torn edge
              rather than a poured one. */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.013"
            numOctaves="2"
            seed="19"
            result="ripple"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="ripple"
            scale="9"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
