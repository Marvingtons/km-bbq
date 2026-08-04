"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DualGrill } from "./illustrations/DualGrill";
import { PillLink } from "./PillLink";

gsap.registerPlugin(ScrollTrigger);

/**
 * PICK YOUR FIRE. The one thing about this restaurant that a photograph cannot
 * show: every table has its own grill, and it can be gas or charcoal.
 *
 * THE ILLUSTRATION ASSEMBLES AS YOU SCROLL, in real hardware order — pan,
 * burner plate, coals, grate, ignition. Scrubbed, unpinned, reversible. It
 * rides the section's own travel; there is no pin and no added scroll cost,
 * which matters because the site is already over its dead-scroll budget (see
 * DIRECTION.md amendment A3).
 *
 * THE COPY COLUMN IS NOT IN THE SCRUB. It keeps the framer-motion triggered
 * reveal it has always had — one fade-and-rise, once. Two systems on one
 * section is deliberate: the artwork is a scrubbed mechanism, the copy is a
 * plain entrance, and forcing the copy into the timeline would make reading it
 * depend on scroll position.
 */

// gsap's power2.out, as a cubic-bezier — for the copy column only.
const POWER2_OUT = [0.215, 0.61, 0.355, 1] as const;

/**
 * PHASE BOUNDARIES, as fractions of a 1-unit timeline. Named because they are
 * referenced in three places — the timeline, the ember hand-off maths, and the
 * verifier — and a magic number written three times is a bug waiting to
 * happen.
 */
const P = {
  chassis: [0.0, 0.2],
  gasSurface: [0.2, 0.3],
  slots: [0.28, 0.45],
  bowl: [0.45, 0.5],
  coals: [0.48, 0.65],
  grate: [0.65, 0.8],
  mesh: [0.68, 0.85],
  divider: [0.85, 0.93],
  embers: [0.9, 1.0],
} as const;

const span = ([a, b]: readonly [number, number]) => b - a;

export function PickYourFire() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(copyRef, { once: true, amount: 0.3 });

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.7, delay, ease: POWER2_OUT },
  });

  useEffect(() => {
    const section = sectionRef.current;
    const svg = section?.querySelector<SVGSVGElement>(".dual-grill");
    if (!section || !svg) return;

    const q = <T extends Element>(sel: string) =>
      Array.from(svg.querySelectorAll<T>(sel));

    const chassis = svg.querySelector("#chassis");
    const gasSurface = svg.querySelector("#gas-surface");
    const bowl = svg.querySelector("#charcoal-ground");
    const grate = svg.querySelector("#grate");
    const divider = svg.querySelector<SVGLineElement>(".divider");
    const slots = q<SVGGraphicsElement>("#gas-surface .dial");
    const embers = q<SVGGraphicsElement>("#coals .ember, #coals .ember-deep");
    const coals = q<SVGGraphicsElement>("#coals > *").filter(
      (el) => !embers.includes(el)
    );
    const mesh = q<SVGGeometryElement>("#grate > *");

    /* ------------------------------------------------------------------
       ORDERINGS AND RANDOMNESS, COMPUTED ONCE.

       These must not change between refreshes: a coal that tumbles in with a
       different rotation every time ScrollTrigger recalculates would twitch
       on resize, and a re-shuffled pour would re-order mid-scroll.
       ------------------------------------------------------------------ */

    // Clockwise sweep for the dial. Measured from each mark's own bounding-box
    // centre against the viewBox centre — NOT DOM order, which follows the
    // order the artwork was drawn in and wanders.
    //
    // Bearing is 0 at twelve o'clock and increases clockwise. The dial only
    // occupies the LEFT semicircle, so its marks run from roughly 180 (six
    // o'clock) to 360 (twelve), and ascending bearing is therefore a clean
    // bottom-round-to-top clockwise sweep.
    const CX = 75;
    const CY = 75;
    const bearing = (el: SVGGraphicsElement) => {
      const b = el.getBBox();
      const dx = b.x + b.width / 2 - CX;
      const dy = b.y + b.height / 2 - CY;
      return (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2);
    };
    const slotsCW = [...slots].sort((a, b) => bearing(a) - bearing(b));

    // A loose pour, not a ring filling in order.
    const coalsShuffled = gsap.utils.shuffle([...coals]);
    const coalSpin = coals.map(() => gsap.utils.random(-14, 14, 1));
    const spinOf = new Map(coals.map((el, i) => [el, coalSpin[i]]));

    // Horizontals first, then verticals, so the grid weaves rather than
    // appearing. Orientation is measured, not assumed from tag name — the
    // grate is a mix of <line>, <rect>, <polygon> and <polyline>.
    const meshOrdered = [...mesh].sort((a, b) => {
      const ab = a.getBBox();
      const bb = b.getBBox();
      const aHoriz = ab.width >= ab.height ? 0 : 1;
      const bHoriz = bb.width >= bb.height ? 0 : 1;
      return aHoriz - bHoriz;
    });

    const dashPrep = (el: SVGGeometryElement) => {
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      return len;
    };

    /** What the timeline alone wants the embers at, for a given progress. */
    const emberOpacityAt = (p: number) =>
      gsap.utils.clamp(0, 1, (p - P.embers[0]) / span(P.embers));

    const ctx = gsap.context(() => {
      /* ---------------------------------------------------------------
         INITIAL STATES ARE SET HERE, NEVER IN CSS.

         That is the whole safety story for this section: if the bundle
         fails, ScrollTrigger never initialises, or the browser is too old,
         nothing has hidden anything and the illustration renders fully
         assembled. A CSS `opacity: 0` would have made a JS failure into a
         blank square.
         --------------------------------------------------------------- */
      const setInitial = () => {
        gsap.set(chassis, { autoAlpha: 0, scale: 1.06, transformOrigin: "50% 50%" });
        gsap.set(gasSurface, { autoAlpha: 0, x: -28 });
        gsap.set(slots, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
        gsap.set(bowl, { autoAlpha: 0 });
        coals.forEach((el) =>
          gsap.set(el, { autoAlpha: 0, y: -20, rotation: spinOf.get(el), transformOrigin: "50% 50%" })
        );
        gsap.set(grate, { autoAlpha: 0, y: -16, scale: 1.05, transformOrigin: "50% 50%" });
        mesh.forEach(dashPrep);
        if (divider) dashPrep(divider);
        gsap.set(embers, { autoAlpha: 0 });
      };

      /**
       * The ember idle loop, built paused.
       *
       * It tweens opacity ONLY, and only between 0.65 and 1, so at the
       * hand-off boundary it can never drive the embers below the value the
       * timeline is holding them at. Everything else about them — visibility,
       * the autoAlpha ramp — stays the timeline's.
       */
      const buildEmberLoop = () =>
        gsap.fromTo(
          embers,
          { opacity: 0.65 },
          {
            opacity: 1,
            duration: 0.9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            stagger: { each: 0.45, from: "random" },
            paused: true,
            // WITHOUT THIS THE LOOP WINS BEFORE IT EVER PLAYS. `fromTo`
            // immediate-renders its from-value at creation time — `paused`
            // stops it advancing, not from painting — so building it stamped
            // opacity 0.65 onto the embers and held it there. They glowed at
            // the top of the page, through the whole assembly, and after
            // scrubbing back to zero.
            immediateRender: false,
          }
        );

      /**
       * The assembly, as a 1-unit timeline. Every tween is positioned by
       * absolute time so the phase boundaries in `P` are the literal truth of
       * the animation rather than the sum of whatever came before.
       *
       * `ease: "none"` throughout when scrubbed — the scroll position IS the
       * easing, and any other curve makes the scrub feel like it is lagging
       * the wheel. Shape comes from phase placement and duration only.
       */
      const buildTimeline = (ease: string, grateEase: string) => {
        const tl = gsap.timeline({ paused: true, defaults: { ease } });

        // 1. The pan is set down.
        tl.to(chassis, { autoAlpha: 1, scale: 1, duration: span(P.chassis) }, P.chassis[0]);

        // 2. Burner plate slides in from the left, then the dial sweeps on.
        tl.to(gasSurface, { autoAlpha: 1, x: 0, duration: span(P.gasSurface) }, P.gasSurface[0]);
        tl.to(
          slotsCW,
          {
            autoAlpha: 1,
            scale: 1,
            duration: span(P.slots) * 0.35,
            stagger: { amount: span(P.slots) * 0.65 },
          },
          P.slots[0]
        );

        // 3. The bowl appears, then the coals tumble in loose order.
        tl.to(bowl, { autoAlpha: 1, duration: span(P.bowl) }, P.bowl[0]);
        tl.to(
          coalsShuffled,
          {
            autoAlpha: 1,
            y: 0,
            rotation: 0,
            duration: span(P.coals) * 0.3,
            stagger: { amount: span(P.coals) * 0.7 },
          },
          P.coals[0]
        );

        // 4. THE FEATURED BEAT. The grate descends onto the coals; because
        //    #grate renders after #coals it visibly lands over them.
        tl.to(
          grate,
          { autoAlpha: 1, y: 0, scale: 1, duration: span(P.grate), ease: grateEase },
          P.grate[0]
        );
        tl.to(
          meshOrdered,
          {
            strokeDashoffset: 0,
            duration: span(P.mesh) * 0.55,
            stagger: { amount: 0.08 },
          },
          P.mesh[0]
        );

        // 5. Ignition.
        if (divider) {
          tl.to(divider, { strokeDashoffset: 0, duration: span(P.divider) }, P.divider[0]);
        }
        tl.to(embers, { autoAlpha: 1, duration: span(P.embers) }, P.embers[0]);

        return tl;
      };

      const mm = gsap.matchMedia();

      /* ---------------- DESKTOP: scrubbed, unpinned, reversible --------- */
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          setInitial();
          const tl = buildTimeline("none", "none");
          tl.pause(0);

          /**
           * HAND-OFF: KILL AND REBUILD, NOT PAUSE AND RESUME.
           *
           * Pausing was the obvious approach and it leaked. A staggered yoyo
           * still owns its per-target sub-tweens while paused, so a `gsap.set`
           * issued straight after `pause()` raced them — and one ember of four
           * reliably stayed at the loop's 0.65 floor all the way back down to
           * progress 0, glowing under an otherwise disassembled grill.
           *
           * Killing removes the tween and every sub-tween with it, so there is
           * never more than one loop in existence and nothing survives to
           * re-apply a value. Rebuilding costs one tween over four targets.
           */
          let loop: gsap.core.Tween | null = null;
          const stopLoop = (progress: number) => {
            if (!loop) return;
            loop.kill();
            loop = null;
            gsap.set(embers, { opacity: emberOpacityAt(progress) });
          };

          const st = ScrollTrigger.create({
            trigger: section,
            start: "top 85%",
            end: "center center",
            scrub: 0.4,
            invalidateOnRefresh: true,
            animation: tl,
            onUpdate: (self) => {
              // The loop only runs where the timeline has finished with the
              // embers. Below 0.9 the timeline owns them again, and it is
              // handed back the exact value it wants for this progress so a
              // reader who stops mid-hand-off sees no discontinuity.
              if (self.progress > 0.95) {
                if (!loop) loop = buildEmberLoop().play(0);
              } else {
                stopLoop(self.progress);
              }
            },
          });

          return () => {
            st.kill();
            tl.kill();
            loop?.kill();
          };
        }
      );

      /* ---------------- MOBILE: one-shot, eased, no scrub --------------- */
      mm.add(
        "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        () => {
          setInitial();
          const loop = buildEmberLoop();
          // Easing IS allowed here: nothing is tracking the wheel, so the
          // motion has to carry its own weight.
          const tl = buildTimeline("power2.out", "back.out(1.4)");
          tl.pause(0);
          tl.eventCallback("onComplete", () => loop.play());

          const st = ScrollTrigger.create({
            trigger: section,
            start: "top 70%",
            once: true,
            onEnter: () => tl.timeScale(1 / 1.6).play(),
          });

          return () => {
            st.kill();
            tl.kill();
            loop.kill();
          };
        }
      );

      /* ---------------- REDUCED MOTION: nothing is built ----------------
         No timeline, no ScrollTrigger, no initial states. The art is already
         assembled in the markup and the embers are already at full opacity,
         so the correct static state costs exactly zero lines. */
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pick-your-fire"
      aria-labelledby="fire-heading"
      className="grain relative bg-sand py-section md:py-section-lg"
    >
      <div className="grid-page items-center gap-y-10">
        {/* ILLUSTRATION FIRST IN THE DOM, so it leads on phones without an
            order-* override. On desktop it takes the left ~45%.

            NO WRAPPER ENTRANCE. It used to fade and rise as a block; the
            assembly IS the entrance now, and running both meant the whole
            illustration faded up while its own parts were still arriving. */}
        <div className="col-figure">
          <div className="w-[min(480px,88vw)] max-w-full">
            <DualGrill />
          </div>
        </div>

        <div ref={copyRef} className="col-beside">
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
