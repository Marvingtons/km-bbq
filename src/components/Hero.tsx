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

      {/* Scrim, in two forms. The display type occupies most of the lower half
          and needs a consistent floor beneath all of it, not just a band at the
          bottom edge. At lg the lockup is ~430px tall, which pushes the eyebrow
          up near mid-frame where the mobile curve has already thinned out
          (measured 2.3:1 there), so the desktop version carries the same
          density considerably further up. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(to top, rgba(16,10,6,0.93) 0%, rgba(16,10,6,0.85) 32%, rgba(16,10,6,0.6) 58%, rgba(16,10,6,0.16) 80%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(to top, rgba(16,10,6,0.93) 0%, rgba(16,10,6,0.88) 40%, rgba(16,10,6,0.76) 62%, rgba(16,10,6,0.5) 80%, rgba(16,10,6,0.12) 94%, transparent 100%)",
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

          {/* The oversized lockup. Tracking is pulled tight and leading is
              sub-1 so the two words read as one mass. */}
          <motion.h1
            className="font-serif font-light uppercase leading-[0.82] tracking-[-0.03em]"
            {...rise(1)}
          >
            <span className="block px-6 text-[26vw] lg:px-16 lg:text-[15vw]">
              {first}
            </span>
            {/* At 375 the word is already wider than the viewport; at lg the
                indent is what runs it off the edge. */}
            <span className="block whitespace-nowrap pl-10 text-[26vw] lg:pl-[34vw] lg:text-[17vw]">
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
