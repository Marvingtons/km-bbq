"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeroVideo } from "./HeroVideo";
import { HeroCta } from "./hero/HeroCta";
import { EYEBROW, HEADLINE, SUBHEAD } from "./hero/copy";
import { MOTION } from "@/lib/motion";

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
          initial: { opacity: 0, y: MOTION.rise },
          animate: { opacity: 1, y: 0 },
          // Duration and curve from the shared table. This used to carry its
          // own 0.7s and its own inline bezier.
          transition: {
            duration: MOTION.dur.reveal,
            delay: 0.2 + i * 0.12,
            ease: MOTION.ease,
          },
        };

  const [first, second] = HEADLINE.big.split(" ");

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-plum-ink"
      aria-label="Hero"
    >
      {/* Background video — holds its first frame while the preloader is up
          and starts the loop from the top as the overlay fades. The poster
          paints the first frame immediately while the clip streams in; the
          section's charcoal base covers any moment before the poster paints so
          there's never a cream flash. */}
      <HeroVideo className="absolute inset-0 h-full w-full object-cover" />

      {/* Scrim, in two forms, and lighter than it was. Both are plum-ink at a
          scrubbed alpha rather than their own near-black: the section's base is
          plum-ink, so the scrim is the same surface fading in, not a second
          dark colour laid over it. The alphas are unchanged from the measured
          curves below — plum-ink is within 0.3% luminance of the value they
          were solved against, which is far inside the margin they carry.

          The previous curves were
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
            "linear-gradient(to top, color-mix(in srgb, var(--color-plum-ink) 90%, transparent) 0%, color-mix(in srgb, var(--color-plum-ink) 78%, transparent) 30%, color-mix(in srgb, var(--color-plum-ink) 44%, transparent) 55%, color-mix(in srgb, var(--color-plum-ink) 8%, transparent) 78%, transparent 100%)",
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
            "linear-gradient(to top, color-mix(in srgb, var(--color-plum-ink) 92%, transparent) 0%, color-mix(in srgb, var(--color-plum-ink) 84%, transparent) 30%, color-mix(in srgb, var(--color-plum-ink) 72%, transparent) 50%, color-mix(in srgb, var(--color-plum-ink) 58%, transparent) 65%, color-mix(in srgb, var(--color-plum-ink) 30%, transparent) 80%, color-mix(in srgb, var(--color-plum-ink) 8%, transparent) 92%, transparent 100%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen w-full items-end">
        {/* The hero copy sits on the SAME track as every other section, so
            the eyebrow, the display lockup and the CTA all begin on the page
            grid rather than at the viewport edge. Variant B is untouched: the
            split scale, the indent on the second word and the clipping are
            exactly as they were, they just start from the track. */}
        <div className="track w-full pb-16 text-left text-white sm:pb-20 lg:pb-24">
          {/* Same eyebrow metrics as every other section (the shared `.eyebrow`
              class), with two documented overrides: it is WHITE, not ember, and
              semibold rather than medium. Measured against real frames of the
              clip, ember text over this footage lands at ~1.1-2.0:1 — it sits
              inside the video's own orange hue range, so it stops separating
              from the background no matter how the scrim is tuned. This is the
              only eyebrow on the site that does not sit on a ground. */}
          <motion.p
            className="eyebrow mb-3 font-semibold text-white"
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
            <span className="block text-[21vw] lg:text-[10.5vw]">
              {first}
            </span>
            <span className="block whitespace-nowrap pl-8 text-[21vw] lg:pl-[18vw] lg:text-[11.5vw]">
              {second}
            </span>
          </motion.h1>

          <div>
            <motion.p
              className="mt-4 font-sans text-copy font-semibold uppercase tracking-[0.2em] text-white"
              {...rise(2)}
            >
              {HEADLINE.tail}
            </motion.p>
            <motion.p
              className="copy measure mt-3 text-white"
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
