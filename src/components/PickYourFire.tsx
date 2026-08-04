"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { DualGrill } from "./illustrations/DualGrill";
import { PillLink } from "./PillLink";

/**
 * PICK YOUR FIRE. The one thing about this restaurant that a photograph cannot
 * show: every table has its own grill, and it can be gas or charcoal.
 *
 * It sits directly after About because that section already says "every table
 * gets its own grill, gas or charcoal" in a single clause. This is that clause
 * given a diagram and a reason to care.
 *
 * NO NEW PANEL TREATMENT. The section is the page's own warm ground — the
 * illustration is the object here, and putting it on a card would make it a
 * specimen rather than a piece of the room.
 *
 * MOTION IS DELIBERATELY THIN. This is filled artwork, not line art: it has no
 * strokes to draw on and no shapes worth revealing one by one. One entrance,
 * once, and one idle loop on the embers (that loop lives in globals.css with
 * the illustration's other styles, because it is a property of the artwork
 * rather than of this section).
 */

// gsap's power2.out, as a cubic-bezier — the site's own --ease-house is a
// different curve and this entrance was specified with power2.out.
const POWER2_OUT = [0.215, 0.61, 0.355, 1] as const;

export function PickYourFire() {
  const ref = useRef<HTMLDivElement>(null);
  // 30% of the section in view, once. `amount` rather than a rootMargin string
  // so the trigger scales with the section instead of with the viewport.
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.7, delay, ease: POWER2_OUT },
  });

  return (
    <section
      id="pick-your-fire"
      aria-labelledby="fire-heading"
      className="grain relative bg-sand py-section md:py-section-lg"
    >
      <div ref={ref} className="grid-page items-center gap-y-10">
        {/* ILLUSTRATION FIRST IN THE DOM, so it leads on phones without an
            order-* override. On desktop it takes the left ~45%. */}
        <motion.div
          className="scroll-reveal col-figure"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={
            inView
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 24, scale: 0.96 }
          }
          transition={{ duration: 0.7, ease: POWER2_OUT }}
        >
          <div className="w-[min(480px,88vw)] max-w-full">
            <DualGrill />
          </div>
        </motion.div>

        <div className="col-beside">
          <motion.p className="scroll-reveal eyebrow" {...rise(0.15)}>
            Pick your fire
          </motion.p>
          <motion.h2
            id="fire-heading"
            className="scroll-reveal h2-scale mt-4"
            {...rise(0.15)}
          >
            Gas or charcoal
          </motion.h2>
          <motion.p className="scroll-reveal copy measure mt-4" {...rise(0.22)}>
            Every table has its own grill, built into the top. Gas runs even and
            hot and needs almost nothing from you — good if you are feeding a
            table and want to keep talking.
          </motion.p>
          <motion.p className="scroll-reveal copy measure mt-4" {...rise(0.29)}>
            Charcoal takes a little more attention and gives it back as smoke
            and char on the edges of the meat. Same price either way. Ask for
            charcoal when you walk in.
          </motion.p>
          <motion.div className="scroll-reveal mt-7" {...rise(0.36)}>
            <PillLink href="/menu" arrow>
              See the menu
            </PillLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
