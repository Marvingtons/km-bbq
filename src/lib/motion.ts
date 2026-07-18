// Single source of truth for the site's motion language. Every entrance, hover
// timing, scrub, and reduced-motion check derives from here so the whole site
// animates with one voice instead of the per-component one-offs it grew.

export const MOTION = {
  /** Entrance reveal: fade + short rise. */
  duration: 0.6,
  rise: 24,
  stagger: 0.08,
  /**
   * The one entrance ease. `ease` is the cubic-bezier for framer-motion / CSS;
   * `gsapEase` is the nearest GSAP string for the scroll-pinned reveals that
   * can't take a bezier array. Same felt curve, two mechanisms.
   */
  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  gsapEase: "power2.out",
  /** Hover / state-change timing, in ms. */
  hoverMs: 300,
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
 */
export const PRELOADER = {
  /** Ember hairline scales in beneath the mark. */
  line: 0.5,
  /** Per-path fade+rise as the 8 lockup paths build in document order. */
  pathIn: 0.5,
  pathStagger: 0.11,
  pathRise: 8,
  /** The whole lockup settles from 1.04 -> 1 across the entire build. */
  lockupScaleFrom: 1.04,
  build: 2.2,
  /** "Korean Barbecue" eyebrow, overlapping the build's tail. */
  eyebrow: 0.5,
  /** Rest beat with the mark fully assembled (skipped if the page is ready). */
  hold: 0.7,
  /** Line stretches, lockup fades, cream field wipes upward. */
  exit: 0.8,
  exitLineStretch: 3,
  exitLockupScale: 0.985,
  ease: "expo.out",
  exitEase: "power4.inOut",
} as const;

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

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
