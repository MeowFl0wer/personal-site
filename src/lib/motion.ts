/**
 * Motion tokens — the physics of this site.
 *
 * Every animation, DOM or WebGL, borrows from this file. If two things on the
 * site feel like they come from different worlds, the fix belongs here, not in
 * the component.
 *
 * These mirror the CSS custom properties in globals.css. CSS transitions read
 * the variables; GSAP and Three read these constants.
 */

export const ease = {
  /** The house curve. Fast out, long settle. Used for almost everything. */
  primary: "power3.out",
  /** Same shape expressed as a bezier, for CSS and for Three.js helpers. */
  primaryBezier: [0.22, 1, 0.36, 1] as const,
  /** Symmetric — only for things that leave and come back. */
  inOut: "power2.inOut",
} as const;

export const duration = {
  /** Hover states, cursor labels, small type transitions. */
  fast: 0.26,
  /** The default for UI: reveals, link underlines, preview open/close. */
  ui: 0.6,
  /** Section-scale reveals. */
  slow: 0.9,
  /** Full-scene moves: gallery expand, page transitions. */
  scene: 1.3,
} as const;

/** Stagger presets, so two lists never drift out of rhythm. */
export const stagger = {
  tight: 0.04,
  line: 0.075,
  block: 0.12,
} as const;

/**
 * Spring/damping constants for the continuous effects. These are the only
 * places springs are allowed — everything else uses `ease.primary`.
 */
export const spring = {
  /** Proximity repulsion: how hard a character is pushed, and how it settles. */
  proximity: {
    /** Pixels of displacement at zero distance. Deliberately small. */
    strength: 22,
    /** Degrees of rotation at zero distance. Smaller still. */
    rotation: 5,
    /** Influence radius in pixels. */
    radius: 150,
    /** Seconds for a character to reach the cursor-driven target. */
    follow: 0.5,
    /** Seconds to return to rest once the cursor leaves. */
    release: 0.9,
  },
  /** Cursor follow damping. Short enough that the dot reads as the pointer
      rather than as something chasing it. */
  cursor: {
    follow: 0.12,
    label: 0.18,
  },
  /** Hover preview inertia. */
  preview: {
    follow: 0.55,
    scaleFrom: 0.94,
  },
  /** Gallery ring. */
  ring: {
    /** Multiplier from normalised scroll velocity to angular velocity. */
    drive: 0.85,
    /** Per-frame catch-up toward the target angle. Higher = more attached to
        the input, lower = longer coast. */
    follow: 0.2,
    /**
     * Radians of rotation per pixel dragged.
     *
     * Derived from the geometry rather than guessed: the front photo is roughly
     * 760px wide on a desktop viewport and spans about 0.42 rad of the ring, so
     * ~0.00055 rad/px tracks the pointer 1:1. A touch above that feels
     * intentional without running away from the hand.
     */
    dragPerPixel: 0.00075,
    /** Per-frame decay of drag momentum after release. */
    momentumDecay: 0.95,
    /** How strongly the ring is pulled toward the nearest photo when idle. */
    snapStrength: 0.06,
    /** Below this angular speed, snapping takes over. */
    snapThreshold: 0.0025,
    /**
     * Vertical swing, in world units, between a photograph on the right of the
     * ring and one on the left. Right goes down, left goes up, so the path runs
     * lower-right to upper-left.
     *
     * Applied per plane rather than by rotating the whole ring: rotating the
     * group multiplies the offset by the ring radius (~9 units), which throws
     * the side photographs off the screen. Here the number *is* the amplitude —
     * ~0.6 against a 2.6-unit photo height is a shallow diagonal, which is what
     * "interleaved, not a rollercoaster" means.
     */
    verticalAmplitude: 0.6,
    /** Radians each plane leans at the extremes. Barely perceptible on purpose. */
    lean: 0.05,
    /** Per-photo vertical stagger in world units, so they are not one rigid plane. */
    stagger: 0.18,
  },
} as const;

/** Scroll velocity normalisation. Above this px/frame the signal clamps to 1. */
export const VELOCITY_CLAMP = 45;

/** Work index: how far media may distort at full scroll velocity. */
export const workDistortion = {
  maxSkewDeg: 4.5,
  maxScaleY: 0.06,
  maxScaleX: 0.02,
} as const;

/**
 * Life archive: rows pinch toward their own centre line as they pass the middle
 * of the screen.
 *
 * Unlike workDistortion this is weighted by where the row is, not just how fast
 * the page is moving — the squeeze peaks at the viewport centre and is gone by
 * the edges. That is what makes it read as the page having a focal point rather
 * than the whole list wobbling.
 */
export const archiveSqueeze = {
  /** Horizontal pinch at full velocity, dead centre. 0.12 = 12% narrower. */
  maxScaleX: 0.12,
  /** A little vertical give, so the row compresses rather than just narrowing. */
  maxScaleY: 0.03,
  /** Fraction of half the viewport over which the weight falls to zero. */
  falloff: 0.85,
  /** Per-frame approach to the target, so a flick eases instead of snapping. */
  follow: 0.16,
} as const;
