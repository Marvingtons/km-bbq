"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PillLink } from "./PillLink";
import { HeroBackdrop } from "./HeroBackdrop";
import { EYEBROW, HEADLINE, SUBHEAD, CTA_LABEL, CTA_HREF } from "./hero/copy";
import { PRICING } from "@/data/info";
import { MOTION } from "@/lib/motion";

/**
 * THE HERO. Five things: the eyebrow, the offer, the price, the rule of the
 * room, and one button.
 *
 * The price is the second-largest element on the page and it is above the fold,
 * because for an all-you-can-eat restaurant the price IS the offer. The
 * previous hero set "SELF SERVE" at 21vw in a light didone and never put a
 * number anywhere on the homepage.
 *
 * NOTHING IS LAYERED OVER THE GROUND. No veil, no scrim, no glyph halo, no
 * blurred plate, no radial copy pool. All of that existed to hold ink legible
 * over bright grill footage; on --char, bone measures ~13:1 unaided, so the
 * entire legibility apparatus is deleted rather than ported.
 *
 * THE PRICE LINE IS NOT AT --text-display, deliberately. The brief asked for
 * display scale; "$21.99 Lunch · $30.99 Dinner" is 27 characters against the
 * headline's 15, so at the same step it overruns the track at every width above
 * a phone. It takes --text-2xl in the display face at 900 instead, which keeps
 * it the loudest thing after the headline and lets it wrap as two price/label
 * pairs rather than as broken numbers.
 */

/** One price cell: the figure, then what it buys. */
function Price({ amount, label }: { amount: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-display text-2xl font-black text-flame [font-stretch:87.5%]">
        {amount}
      </span>
      <span className="eyebrow text-bone/70">{label}</span>
    </span>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  // Parts arrive in reading order. The headline rises WITHOUT fading: framer
  // writes `initial` as an inline style into the SSR HTML, so `opacity: 0`
  // there leaves the largest piece of type on the page unpainted until React
  // hydrates — which once cost 5.5s of LCP here.
  const rise = (i: number, fade = true) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: fade ? { opacity: 0, y: MOTION.rise } : { y: MOTION.rise },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: MOTION.dur.reveal,
            delay: 0.1 + i * 0.08,
            ease: MOTION.ease,
          },
        };

  return (
    /* 160vh where the window transition runs, one viewport everywhere else.
       ------------------------------------------------------------------
       The stage is `sticky` inside a 160vh container, so it holds for
       160 - 100 = 60vh and releases exactly where About's top reaches the
       viewport top. About is pulled up by the same 60vh, so net document height
       is unchanged.

       60vh, down from 100vh — the brief's cap on the transition's scroll cost,
       and the site's ONLY remaining stretch of held scroll once the gallery pin
       is gone. Do not change 160vh without changing About's -mt in the same
       commit: the two are one number written twice. */
    <section
      id="home"
      className="pointer-events-none relative z-nav h-screen motion-safe:md:h-[160vh]"
      aria-label="Hero"
    >
      <div className="hero-stage sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* THE WINDOW — the box SeamMotion clips. Exactly viewport-sized so
            inset() percentages mean what they say. The media inside carries an
            8% vertical bleed, which is the drift's travel room, so it has to be
            a separate box from the thing being clipped. */}
        <div className="hero-window absolute inset-0 overflow-hidden">
          <HeroBackdrop className="hero-media absolute inset-x-0 -inset-y-[8%]" />
        </div>

        {/* The flame hairline at the panel's seam, drawn by the scrub once the
            window has docked. No height until it is measured. */}
        <span
          aria-hidden="true"
          className="hero-dock-seam pointer-events-none absolute left-0 top-0 z-nav w-px origin-top scale-y-0 bg-gradient-to-b from-transparent via-flame/70 to-transparent"
        />

        <div className="pointer-events-auto relative z-nav flex w-full flex-1 items-end">
          <div className="track w-full pb-16 pt-10 text-left sm:pb-20 lg:pb-24">
            <div className="hero-exit-support">
              <motion.p className="eyebrow text-ember" {...rise(0)}>
                {EYEBROW}
              </motion.p>
            </div>

            <div className="hero-exit-display">
              <motion.h1 className="display mt-4 text-bone" {...rise(1, false)}>
                {HEADLINE}
              </motion.h1>
            </div>

            <div className="hero-exit-support">
              {/* THE PRICE. flex-wrap rather than a fixed line: at 375 the two
                  cells stack instead of the figures breaking mid-number. */}
              <motion.p
                className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1"
                {...rise(2)}
              >
                <Price amount={PRICING.lunch} label="Lunch" />
                <span aria-hidden="true" className="text-flame/60">
                  ·
                </span>
                <Price amount={PRICING.dinner} label="Dinner" />
              </motion.p>

              <motion.p className="copy measure mt-4 text-bone/80" {...rise(3)}>
                {SUBHEAD}
              </motion.p>

              <motion.div className="mt-7" {...rise(4)}>
                <PillLink href={CTA_HREF} arrow>
                  {CTA_LABEL}
                </PillLink>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
