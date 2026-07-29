// Single source of truth for the site's motion language. Every entrance, hover
// timing, scrub, and reduced-motion check derives from here so the whole site
// animates with one voice instead of the per-component one-offs it grew.

export const MOTION = {
  /**
   * THE DURATION TABLE, in seconds. Mirrored as `--dur-*` in globals.css —
   * CSS and JS cannot share a literal, so they share a documented table.
   * Nothing on the site may invent a duration outside this set.
   *
   *   press   the dome going down. Faster than it comes back up, because
   *           that is what a real button feels like.
   *   quick   underlines, small state flips, the dome coming back up
   *   base    THE DEFAULT. Hovers, colour changes, every control.
   *   slow    surfaces cross-fading (the nav bar), image scale on hover
   *   reveal  content arriving on scroll
   *   stage   a full-viewport surface moving (the preloader's exit wipe)
   */
  dur: {
    press: 0.09,
    quick: 0.18,
    base: 0.3,
    slow: 0.5,
    reveal: 0.6,
    stage: 0.8,
  },

  /**
   * THE TWO HOUSE CURVES, plus one stated exception.
   *
   *   ease / gsapEase             everything that arrives and settles
   *   easeInOut / gsapEaseInOut   everything that reverses or wipes
   *   press (CSS only, --ease-press)  EXCEPTION: the game dome's overshoot
   *
   * Two forms of each because the two engines take different arguments:
   * framer-motion and CSS take a cubic-bezier, and GSAP has no bezier parser
   * without the CustomEase plugin, so it gets the nearest named curve. Same
   * felt curve, two mechanisms.
   *
   * Before this, About drifted on power2.out, the preloader built on expo.out
   * and exited on power4.inOut, and the clock pressed on its own bezier. Four
   * personalities. They are one now.
   */
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  gsapEase: "power2.out",
  easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  gsapEaseInOut: "power2.inOut",

  /** Entrance reveal: the distance content rises through, in px. */
  rise: 24,
  stagger: 0.08,
  /** Scrub catch-up for pinned, scroll-driven timelines. */
  scrub: 1,
} as const;

/** Fixed site-header height, in px. One value; sections and jump offsets read it. */
export const NAV_H = 68;

/**
 * Preloader choreography. The mark building is the point, so these beats are
 * deliberately longer than a minimal loader — but the timeline is load-aware
 * (the HOLD is skipped when the page is already ready) so it never feels stuck.
 * All values in seconds.
 *
 * Every MOVE here draws its duration and its curve from MOTION above. The two
 * values that are NOT moves — `build` (how long the whole assembly lasts) and
 * `hold` (the rest beat once it is assembled) — are the length of a scene, not
 * the speed of a transition, so they stay as their own numbers.
 */
export const PRELOADER = {
  /** Ember hairline scales in beneath the mark. */
  line: MOTION.dur.slow,
  /** Per-path fade+rise as the 8 lockup paths build in document order. */
  pathIn: MOTION.dur.slow,
  pathStagger: 0.11,
  pathRise: 8,
  /** The whole lockup settles from 1.04 -> 1 across the entire build. */
  lockupScaleFrom: 1.04,
  build: 2.2,
  /** "Korean Barbecue" eyebrow, overlapping the build's tail. */
  eyebrow: MOTION.dur.slow,
  /** Rest beat with the mark fully assembled (skipped if the page is ready). */
  hold: 0.7,
  /** Line stretches, lockup fades, cream field wipes upward. */
  exit: MOTION.dur.stage,
  exitLineStretch: 3,
  exitLockupScale: 0.985,
  /* Was "expo.out" / "power4.inOut" — two curves this sequence had invented
     for itself. The build now settles on the house curve and the wipe reverses
     on the house in-out, so the loading screen and the page move alike. */
  ease: MOTION.gsapEase,
  exitEase: MOTION.gsapEaseInOut,
} as const;

/** Module-private: only `prefersReducedMotion()` below reads it. Components
 *  that need the query as a string should use `MOTION_OK` or the hook. */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The positive form, for gsap.matchMedia(). Everything scroll-driven registers
 * inside this query so reduced motion gets the plain stacked page by
 * construction — the timelines are never created at all, rather than created
 * and then skipped.
 */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/**
 * Imperative reduced-motion check for GSAP / vanilla contexts (SSR-safe).
 * React components should use `useReducedMotion()` from framer-motion instead.
 */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  );
}
