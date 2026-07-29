"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PillLink } from "./PillLink";
import { HeroVideo } from "./HeroVideo";
import { EYEBROW, HEADLINE, SUBHEAD, CTA_LABEL, CTA_HREF } from "./hero/copy";
import { MOTION } from "@/lib/motion";

/**
 * The hero: big-type lockup over the grill clip. Five things and nothing else —
 * eyebrow, the SELF SERVE lockup, the supporting line, the CTA, and the video
 * they all sit on.
 *
 * VARIANT B, unchanged: "SELF SERVE" is set enormous and stacked, with SERVE
 * indented so the two words read as one mass with a split scale. Everything
 * else drops to supporting scale beneath it, so the type is the visual event.
 *
 * NO MURAL HERE. A band of the painting used to run across the top of this
 * section. On a cream ground it framed the type; over footage it read as a
 * sticker — a contained rectangle of illustration pasted onto a photograph,
 * with its own hard edges arguing with the frame behind it. The mural is not a
 * decoration to sprinkle, it is a full-bleed surface, and it has one home: the
 * About section, where it runs edge to edge and opens under its own parallax.
 * The hero hands off TO that (see SeamMotion), which is worth more than a
 * preview of it. Do not put a panel of it back here.
 *
 * -------------------------------------------------------------------------
 * THE LAYER STACK OVER THE FOOTAGE IS: video, poster, type. Nothing else.
 *
 * No veil, no scrim, no gradient, no wash, at any opacity or any shape. Two
 * versions of a cream scrim have already been built and deleted here — a
 * full-frame one at 55%, and a "shaped" one confined to the copy column. The
 * second failed for a reason worth writing down: cream at 55% over this clip's
 * near-black grill vents composites to rgb(171,162,152), which is GREY, and
 * because it fell off horizontally while being masked vertically its edge read
 * as a diagonal grey wash across the lower right. A local veil is still a veil.
 *
 * Legibility is bought at the glyphs instead — a tight cream halo, sized in
 * proportion to each type size, defined in globals.css. Every pixel of footage
 * not directly behind a letterform is untouched and fully saturated.
 * If you are about to add a rectangle over the video, don't.
 * -------------------------------------------------------------------------
 *
 * THE TYPE COLOUR IS INK, and the ground is still cream. What was actually
 * wrong with the original hero was never the footage — it was a near-black
 * scrim under white type, which read as steakhouse-premium and misrepresented a
 * bright, casual, all-you-can-eat room. Cream is the base layer under the
 * video and the halo colour on the type. Do not swap either to black or white.
 * See the memory note on the warm direction.
 *
 * WHY THE HALO IS LOAD-BEARING. Measured per glyph against the actual pixels
 * behind each letterform, on the clip's brightest / busiest / darkest frames,
 * bare ink fails badly: the display line runs 14-29% of its glyph pixels under
 * 3:1, the Korean BBQ line 86-100% under 4.5:1, the subhead 51-99% under 4.5:1.
 * This footage covers nearly the whole luminance range behind the type,
 * frequently within one frame — a blown-out window at #FFFFFF and near-black
 * vents at #000406 — so there is no type colour, light or dark, that survives
 * it unaided. The current measured numbers live in the report and are
 * reproducible with tools/hero-glyph-contrast.mjs --effective.
 *
 * (If you re-run any of that: downsample with a BOX filter. ImageMagick's
 * default Lanczos has negative lobes, rings past the real pixel range, and
 * under-reports contrast — it invented a phantom 4.58:1 here once already.)
 *
 * Two of the site's standard type colours still cannot be used on this surface,
 * and both are corrected below rather than left quietly failing.
 */
export function Hero() {
  const reduce = useReducedMotion();

  // Parts arrive in reading order; reduced motion renders every part at its
  // final state immediately.
  // `fade = false` for the display lockup, and the reason is measurable.
  // framer writes the `initial` state as an INLINE STYLE into the SSR HTML, so
  // `opacity: 0` there means the biggest piece of TYPE on the page is unpainted
  // until React hydrates, which once cost 5.5s of Largest Contentful Paint.
  // The poster is the LCP element again now that the video is back, but this
  // still matters: the lockup is the second-largest paint and the one that
  // carries the message, so it should not wait on hydration either. Rising
  // without fading keeps the choreography and paints the text in frame one.
  const rise = (i: number, fade = true) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: fade ? { opacity: 0, y: MOTION.rise } : { y: MOTION.rise },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: MOTION.dur.reveal,
            delay: 0.2 + i * 0.12,
            ease: MOTION.ease,
          },
        };

  const [first, second] = HEADLINE.big.split(" ");

  return (
    /* TWO VIEWPORTS TALL, and the second one is the window transition.
       ------------------------------------------------------------------
       The hero used to be a single `min-h-screen` section. It is now a 200vh
       scroll container holding a `sticky` stage, and About is pulled up by
       -100vh to sit BEHIND that stage. The arithmetic is what makes the
       transition free:

         scroll 0        hero full-bleed; About's top sits at 100vh, just off
                         the bottom of the viewport and behind the stage
         0 -> 100vh      the stage sticks. The video clips down to an inset
                         panel, and About rises behind it — so the mural is
                         revealed by the shrinking window, and About's heading
                         and copy rise into place at the same time, because
                         they are genuinely scrolling, not being animated.
         100vh           the stage stops sticking at exactly the scroll
                         position where About's top reaches the viewport top,
                         which is exactly where About's own pin begins. The
                         two hand over on the same frame.
         100 -> 200vh    the shrunken panel scrolls off over pinned About.

       Net document height is unchanged (200vh section - 100vh pull = the 100vh
       the hero used to occupy), and About's pinned timeline is untouched — it
       still starts on `top top` and needed no offset, because the sticky stage
       releases on the same pixel. Do not "simplify" the -100vh away without
       redoing this arithmetic; it is load-bearing.

       pointer-events-none on the container, auto on the stage: the container's
       lower viewport overlaps pinned About, and a transparent box still eats
       clicks meant for About's buttons. */
    <section
      id="home"
      className="pointer-events-none relative z-20 h-[200vh]"
      aria-label="Hero"
    >
      <div className="hero-stage pointer-events-auto sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* THE WINDOW. This is the element the transition clips, and it is
            exactly viewport-sized so `inset()` percentages mean what they say.
            It is a separate box from the media inside it precisely because the
            media carries an 8% vertical bleed — clipping a box that extends
            past the frame would put the panel's rounded edges off-screen. */}
        {/* NOTHING PAINTS ON THE STAGE ITSELF — no background, no grain. Every
            surface lives inside `.hero-window` below, so that when the window
            clips down what is exposed around it is About's mural, not a cream
            plate. A background here would make the reveal impossible. */}
        <div className="hero-window absolute inset-0 overflow-hidden">
          {/* THE MEDIA STACK — cream ground, poster, then the clip.

              `-inset-y-[8%]` rather than `inset-0`: SeamMotion drifts this
              layer as the hero leaves so the footage lags behind the scroll
              rather than sliding away with it. A layer flush to the frame would
              drag a bare cream edge in the moment it moved. The bleed is the
              travel room, larger than the ~5% the drift actually uses. */}
          <HeroVideo className="hero-media absolute -inset-y-[8%] inset-x-0" />

          {/* NO OVERLAY OF ANY KIND SITS HERE. Not a veil, not a shaped scrim,
              not a gradient. The layer stack over the footage is exactly:
              video, poster fallback (both inside HeroVideo), and the type.
              Nothing else.

              A shaped cream scrim used to live at this spot, 55% down the left
              of the frame and gone by 62%. On paper it was warm and local. On
              this footage it was neither: cream at 55% over the near-black
              grill vents composites to rgb(171,162,152), which is grey, and
              because it fell off horizontally while being masked vertically its
              edge read as a diagonal grey wash across the lower right. Measured
              against the same frame with it hidden, it was lifting rgb(76,64,51)
              to rgb(171,162,152) — the exact "milking" the whole treatment
              exists to avoid, just confined to one corner.
              Legibility is now bought entirely at the glyphs. See globals.css. */}
        </div>

        <div className="relative z-10 flex w-full flex-1 items-end">
        {/* The hero copy sits on the SAME track as every other section, so the
            eyebrow, the display lockup and the CTA all begin on the page grid
            rather than at the viewport edge. */}
        <div className="track w-full pb-16 pt-10 text-left sm:pb-20 lg:pb-24">
          {/* The shared eyebrow, overridden to INK — the one eyebrow on the
              site that does not carry ember-deep, and the globals.css note on
              `.eyebrow` reserves exactly this exception for exactly this
              reason. Ember-deep (#9A5A1A) measures 1.57:1 against the darkest
              scrimmed block; it is a warm mid-brown and the footage is full of
              warm mid-brown. Ink takes it to 5.00:1. */}
          <motion.p className="hero-copy-glow eyebrow mb-3 text-ink" {...rise(0)}>
            {EYEBROW}
          </motion.p>

          {/* The display lockup. Tracking is pulled tight and leading is sub-1
              so the two words read as one mass. The sizes and the indent are
              Variant B's and are unchanged — only the colour moved from white
              to ink. */}
          {/* `hero-display-glow` is ladder rung 1, and it is on the display
              line alone. SERVE runs out to 58.7% of the frame at 1440 — past
              the midpoint the column scrim is not allowed to cross — so the
              scrim cannot reach its tail and the halo is what carries it
              there. Over cream it is cream on cream, and disappears. */}
          <motion.h1
            className="hero-display-glow font-serif font-light uppercase leading-[0.8] tracking-[-0.03em] text-ink"
            {...rise(1, false)}
          >
            <span className="block text-[21vw] lg:text-[10.5vw]">{first}</span>
            <span className="block whitespace-nowrap pl-8 text-[21vw] lg:pl-[18vw] lg:text-[11.5vw]">
              {second}
            </span>
          </motion.h1>

          <div>
            <motion.p
              className="hero-copy-glow mt-4 font-sans text-copy font-semibold uppercase tracking-[0.2em] text-ink"
              {...rise(2)}
            >
              {HEADLINE.tail}
            </motion.p>
            {/* Body copy, overridden to INK for the same reason as the
                eyebrow: --color-body (#5A5550) is defined as "solid body copy
                on cream" and measures 2.12:1 on the darkest scrimmed block.
                Ink takes it to 5.00:1. The softer grey goes back the moment
                this copy is not over footage. */}
            <motion.p className="hero-copy-glow copy measure mt-3 text-ink" {...rise(3)}>
              {SUBHEAD}
            </motion.p>
            {/* The system pill, with its cream fill restored. This exception
                exists because of the video and only because of the video:
                ember (#F18B23) sits inside the grill footage's own hue range,
                and an unfilled ember outline measures 1.00:1 against #5A3E1E
                at frame 132 — the control's edge simply dissolves into the
                picture. An opaque cream fill makes the pill a solid object
                again, so its label is ink-on-cream at a constant 15.9:1 and
                its border is ember-on-cream exactly as everywhere else, both
                independent of whatever frame is behind it. */}
            <motion.div className="mt-7" {...rise(4)}>
              <PillLink href={CTA_HREF} arrow className="bg-cream">
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
