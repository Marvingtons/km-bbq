"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PillLink } from "./PillLink";
import { MediaStage } from "./MediaStage";
import { EYEBROW, HEADLINE, SUBHEAD, CTA_LABEL, CTA_HREF } from "./hero/copy";
import { PRICING, BUSINESS, ADDRESS } from "@/data/info";
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
      {/* SAND, not the accent — the same rule as the sticky bar. The price
          takes the accent everywhere it sits on the warm ground, but the hero
          type sits on a graded photograph whose lower third is effectively
          char, where the accent measures 3.15:1. The price stays the
          second-largest element on the page; size carries it, not hue.

          This is a symptom of the hero being deferred to pass two rather than a
          settled answer: the hero is still a dark photographic frame inside a
          warm-light site. See DIRECTION.md, "Open, not decided" #3. */}
      <span className="font-display text-2xl font-black text-sand [font-stretch:87.5%]">
        {amount}
      </span>
      <span className="eyebrow text-sand/70">{label}</span>
    </span>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  // Parts arrive in reading order. The headline rises WITHOUT fading: framer
  // writes `initial` as an inline style into the SSR HTML, so `opacity: 0`
  // there leaves the largest piece of type on the page unpainted until React
  // hydrates — which once cost 5.5s of LCP here.
  /**
   * The hero's own entrance, and the one place on the site allowed a longer
   * beat than the 0.7s standard reveal.
   *
   * 0.09s apart rather than 0.08: this is five lines at display scale on an
   * empty screen with nothing above them competing, so the interval can be
   * read rather than merely felt. `slow` gives the price line a 0.9s rise —
   * it is the last thing to arrive and the offer, so it settles rather than
   * snapping, and it is the only 0.9 in an entrance anywhere on the site.
   */
  const rise = (i: number, { fade = true, slow = false } = {}) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: fade
            ? { opacity: 0, y: slow ? MOTION.rise * 1.5 : MOTION.rise }
            : { y: MOTION.rise },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: slow ? 0.9 : MOTION.dur.reveal,
            delay: 0.1 + i * 0.09,
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
       commit: the two are one number written twice.

       `lg:`, not `md:`. The window clips into About's square media frame, and
       that frame only exists above 1024 — below it About is plain stacked
       flow with nothing to dock into, and this extra viewport would be a full
       screen of opaque hero sliding up over an unread story. One bracket for
       the whole composed sequence, the same one the pinned gallery uses. */
    <section
      id="home"
      className="pointer-events-none relative z-nav h-screen motion-safe:lg:h-[160vh]"
      aria-label="Hero"
    >
      {/* THE BACKDROP IS NOT IN THE STAGE ANY MORE, and that is the whole of
          the one-video story. It has to stay viewport-aligned from here until
          About's illustration takes over, roughly two viewports down, and the
          stage stops being viewport-aligned the moment it releases. So the
          media sits in its own layer that never scrolls and is placed by
          clip-path instead — see MediaStage.tsx. It is a child of `#home` so
          that below 1024, where none of that runs, it is simply `absolute
          inset-0` inside a one-viewport hero, exactly as it used to be. */}
      <MediaStage />

      <div className="hero-stage sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="pointer-events-auto relative z-nav flex w-full flex-1 items-end">
          <div className="track w-full pb-16 pt-10 text-left sm:pb-20 lg:pb-24">
            <div className="hero-exit-support">
              <motion.p className="eyebrow text-sand/80" {...rise(0)}>
                {EYEBROW}
              </motion.p>
            </div>

            <div className="hero-exit-display">
              {/* THE VISIBLE LOCKUP IS UNCHANGED. What changed is the h1's
                  ACCESSIBLE AND CRAWLABLE text.

                  It read "All-You-Can-Eat" — the page's only h1, naming neither
                  the business nor what it sells nor where it is. Every one of
                  those facts is on the screen (the eyebrow says Korean BBQ ·
                  Oceanside, the mark is in the nav, the price line is directly
                  below), but they are in four elements and the heading tied
                  them to nothing.

                  So the display type is untouched and an `sr-only` span carries
                  the rest of the sentence. This is not hidden keyword text: it
                  is the same claim the page makes visibly three inches away, in
                  the element whose job is to say what the page is about. A
                  screen reader now hears a heading that identifies the
                  restaurant instead of an adjective. */}
              <motion.h1 className="display mt-4 text-sand" {...rise(1, { fade: false })}>
                <span className="sr-only">{`${BUSINESS.name} — `}</span>
                {/* `data-headline` is the hook for the VISIBLE lockup. The
                    sr-only fragments are absolutely positioned and clipped to
                    1px, but a Range over their contents still reports the
                    untruncated text width — so anything measuring "does the
                    headline overflow 375px?" has to be pointed at the visible
                    span explicitly or it reads 759px of hidden text and fails.
                    tools/verify-mobile.mjs uses this. */}
                <span data-headline>{HEADLINE}</span>
                <span className="sr-only">
                  {" "}
                  Korean BBQ in {ADDRESS.city}
                </span>
              </motion.h1>
            </div>

            <div className="hero-exit-support">
              {/* THE PRICE. flex-wrap rather than a fixed line: at 375 the two
                  cells stack instead of the figures breaking mid-number. */}
              {/* THE PRICE ARRIVES LAST, and its DOM position is not its
                  timing. It sits above the subhead because that is the reading
                  order — the offer, then the rule of the room — but it is the
                  thing the hero is FOR, so it lands after everything else and
                  takes the longer rise to do it. Reordering the markup to get
                  that would have traded a correct reading order for a timing
                  the delay already expresses. */}
              <motion.p
                className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1"
                {...rise(4, { slow: true })}
              >
                <Price amount={PRICING.lunch.display} label={PRICING.lunch.label} />
                <span aria-hidden="true" className="text-sand/50">
                  ·
                </span>
                <Price amount={PRICING.dinner.display} label={PRICING.dinner.label} />
              </motion.p>

              <motion.p className="copy measure mt-4 text-sand/80" {...rise(2)}>
                {SUBHEAD}
              </motion.p>

              <motion.div className="mt-7" {...rise(3)}>
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
