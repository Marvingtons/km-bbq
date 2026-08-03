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
  /** Scrub catch-up, in seconds. Was 1 — a full second of the page still
   *  moving after the wheel stopped, compounded on top of Lenis's own
   *  smoothing, which read as the page lagging behind the reader. */
  scrub: 0.5,
} as const;

/** Fixed site-header height, in px. One value; sections and jump offsets read it. */
export const NAV_H = 68;

/**
 * The hero->About window transition's scroll cost, as a fraction of one
 * viewport. This is the site's only stretch of held scroll.
 *
 * Written in THREE places and they must agree: Hero's `md:h-[160vh]` (100vh
 * sticky stage + 60vh of travel), About's `md:-mt-[60vh]`, and this constant,
 * which is what About's story reveal measures its trigger against. Change one,
 * change all three in the same commit.
 */
export const HERO_SCRUB = 0.6;

/**
 * Preloader choreography. CAPPED AT 1.2 SECONDS, TOTAL.
 *
 * It used to run ~3.0s best case — a 2.2s scripted build, a 0.7s "deliberate
 * rest beat" with nothing happening, and a 0.8s wipe — and it could park
 * indefinitely waiting on `window.load`, with a 10s CSS failsafe behind it. The
 * whole time, `html.preloading` held `overflow: hidden`, so someone standing
 * outside deciding where to eat was looking at a locked, empty rectangle.
 *
 * PRELOADER.total is the contract, and Preloader.tsx enforces it with a timed
 * exit rather than trusting the sum of the beats. The load-await is gone: the
 * page is server-rendered, so there is nothing worth waiting for that is worth
 * a second of someone's evening.
 *
 * All values in seconds.
 */
export const PRELOADER = {
  /** Total wall-clock budget, in seconds. Enforced, not aspirational. */
  total: 1.2,
  /** Flame hairline scales in beneath the mark. */
  line: 0.28,
  /** Per-path fade+rise as the 8 lockup paths build in document order. */
  pathIn: 0.3,
  pathStagger: 0.035,
  pathRise: 8,
  /** The whole lockup settles from 1.03 -> 1 across the build. */
  lockupScaleFrom: 1.03,
  build: 0.62,
  /** The eyebrow, overlapping the build's tail. */
  eyebrow: 0.26,
  /** Line stretches, lockup fades, the field wipes upward. */
  exit: 0.36,
  exitLineStretch: 3,
  exitLockupScale: 0.985,
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
