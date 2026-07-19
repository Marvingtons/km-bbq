"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeroVideo } from "./HeroVideo";
import { HeroCta } from "./hero/HeroCta";
import { EYEBROW, HEADLINE, SUBHEAD } from "./hero/copy";

/**
 * The hero: big-type lockup over the grill clip.
 *
 * "SELF SERVE" is set enormous and stacked, with SERVE indented far enough that
 * its tail runs off the right edge (the section clips it) for momentum.
 * Everything else drops to supporting scale beneath it, so the type itself is
 * the visual event.
 */
export function Hero() {
  const reduce = useReducedMotion();

  // Parts arrive in reading order; reduced motion renders every part at its
  // final state immediately.
  const rise = (i: number) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.7,
            delay: 0.2 + i * 0.12,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
          },
        };

  const [first, second] = HEADLINE.big.split(" ");

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-charcoal"
      aria-label="Hero"
    >
      {/* Background video — holds its first frame while the preloader is up
          and starts the loop from the top as the overlay fades. The poster
          paints the first frame immediately while the clip streams in; the
          section's charcoal base covers any moment before the poster paints so
          there's never a cream flash. */}
      <HeroVideo className="absolute inset-0 h-full w-full object-cover" />

      {/* Scrim, in two forms, and lighter than it was. The previous curves were
          tuned for a lockup that stood ~430px tall and pushed the eyebrow up
          near mid-frame; at the reduced type size the whole copy block sits
          lower, so the density can come down with it and hand a good part of
          the frame back to the video. Re-measured against real frames of the
          clip after the resize — every element still clears AA. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(16,10,6,0.9) 0%, rgba(16,10,6,0.78) 30%, rgba(16,10,6,0.44) 55%, rgba(16,10,6,0.08) 78%, transparent 100%)",
        }}
      />
      {/* The desktop curve's mid-band is set by the eyebrow, not the display
          type. The eyebrow is 12px, so it needs 4.5:1 rather than the 3:1 the
          headline gets, and it sits ~59% up the frame. Solving against the
          measured backdrop there (video luminance ~0.45) puts the required
          alpha at ~0.60; it carries 0.64 at that height for margin. Above 80%
          the curve is materially lighter than it was, which is where the
          reclaimed video band comes from. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(to top, rgba(16,10,6,0.92) 0%, rgba(16,10,6,0.84) 30%, rgba(16,10,6,0.72) 50%, rgba(16,10,6,0.58) 65%, rgba(16,10,6,0.3) 80%, rgba(16,10,6,0.08) 92%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen w-full items-end">
        <div className="w-full pb-16 text-left text-white sm:pb-20 lg:pb-24">
          {/* The eyebrow is WHITE, not ember. Measured against real frames of
              the clip, ember text over this footage lands at ~1.1-2.0:1 — it
              sits inside the video's own orange hue range, so it stops
              separating from the background no matter how the scrim is tuned. */}
          <motion.p
            className="mb-3 px-6 font-sans text-xs font-semibold uppercase tracking-[0.28em] text-white lg:px-16"
            {...rise(0)}
          >
            {EYEBROW}
          </motion.p>

          {/* The display lockup. Tracking is pulled tight and leading is sub-1
              so the two words read as one mass.

              Sized so the type and the video SHARE the frame. At 15/17vw the
              lockup stood ~430px tall at 1440 and was the only thing on screen;
              it is now ~30% smaller (10.5/11.5vw, ~151/166px), which leaves a
              real band of grill footage legible above and to the right of it.
              The stagger indent came down with it: at 34vw the second word ran
              off the edge, which was the point when the type was edge-to-edge,
              but at this size it would just strand the word in the middle. */}
          <motion.h1
            className="font-serif font-light uppercase leading-[0.8] tracking-[-0.03em]"
            {...rise(1)}
          >
            <span className="block px-6 text-[21vw] lg:px-16 lg:text-[10.5vw]">
              {first}
            </span>
            <span className="block whitespace-nowrap pl-8 text-[21vw] lg:pl-[18vw] lg:text-[11.5vw]">
              {second}
            </span>
          </motion.h1>

          <div className="px-6 lg:px-16">
            <motion.p
              className="mt-4 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-white"
              {...rise(2)}
            >
              {HEADLINE.tail}
            </motion.p>
            <motion.p
              className="mt-3 max-w-md font-sans text-base font-light leading-relaxed text-white"
              {...rise(3)}
            >
              {SUBHEAD}
            </motion.p>
            <motion.div className="mt-7" {...rise(4)}>
              <HeroCta />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Seam: Hero -> About. The mural's first scattered marks drift up into
          the last of the hero as you scroll, so the illustrated world arrives
          before the section does. Driven by SeamMotion; hidden at rest and for
          reduced motion. */}
      <div
        className="hero-arrival pointer-events-none absolute inset-x-0 bottom-[7%] z-10 mx-auto flex max-w-sm items-center justify-center gap-7 motion-reduce:hidden"
        aria-hidden="true"
      >
        {[
          { s: 7, c: "var(--color-ember)", o: 0.9 },
          { s: 4, c: "rgba(255,255,255,0.7)", o: 0.7 },
          { s: 9, c: "var(--color-ember)", o: 0.8 },
          { s: 5, c: "rgba(255,255,255,0.6)", o: 0.6 },
          { s: 6, c: "var(--color-ember)", o: 0.85 },
          { s: 4, c: "rgba(255,255,255,0.7)", o: 0.7 },
        ].map((d, i) => (
          <span
            key={i}
            className="block rounded-full"
            style={{ width: d.s, height: d.s, background: d.c, opacity: d.o }}
          />
        ))}
      </div>
    </section>
  );
}
