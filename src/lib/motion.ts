/* ===========================================================================
   MOTION — one shared vocabulary for the whole site
   ---------------------------------------------------------------------------
   Every animation (GSAP scroll work + framer-motion reveals) pulls its easing,
   duration, and stagger from here so the site moves with one personality:
   warm, smooth, a little playful. Scroll-driven motion is transform/opacity
   only. Reduced motion is gated through ONE query/helper, never per-component
   guesswork.
   =========================================================================== */

// The single media query every motion path checks.
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

/** SSR-safe read of the user's reduced-motion preference. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Easings. GSAP takes the string names; framer-motion takes the cubic-bezier
// arrays (same curves, so both libraries feel identical).
export const EASE = {
  /** Default entrance: quick out, long gentle settle. */
  out: "power3.out",
  outArr: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** Symmetric ease for scrubbed / reversible moves. */
  inOut: "power2.inOut",
  inOutArr: [0.65, 0, 0.35, 1] as [number, number, number, number],
  /** Playful settle with a touch of overshoot — buttons, pops, the game. */
  back: "back.out(1.7)",
} as const;

// Durations, in seconds.
export const DUR = {
  fast: 0.4,
  base: 0.6,
  slow: 0.9,
} as const;

// Stagger steps, in seconds.
export const STAGGER = {
  tight: 0.06,
  base: 0.09,
  loose: 0.14,
} as const;

/** How far cards/copy rise as they fade in (px). */
export const RISE = 26;

// framer-motion variants for the standard "fade + small rise" reveal, so
// components share the exact curve GSAP uses. `custom` = stagger index.
export const fadeRise = {
  hidden: { opacity: 0, y: RISE },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DUR.base,
      ease: EASE.outArr,
      delay: i * STAGGER.base,
    },
  }),
};
