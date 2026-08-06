"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DualGrill } from "./illustrations/DualGrill";
import { PillLink } from "./PillLink";
import { MOTION, MOTION_OK, NAV_H, FIRE_COPY_IN } from "@/lib/motion";
import { useScrollRefresh } from "@/lib/useScrollRefresh";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   PICK YOUR FIRE — the first thing after the hero, and the page's one trick.

   The hero's own clip — the same <video> element, still playing — narrows out
   of full bleed, passes THROUGH a rounded panel, opens into a circle and
   dissolves off a finished illustration of the grill. Leave the hero and you
   are looking at the thing the restaurant is about within half a screen.

   THE SECTION PINS. It is exactly one viewport, it locks the moment its top
   reaches the top of the screen, and from there scroll drives the sequence
   rather than the layout: the panel opens to a circle, the footage dissolves
   off a bare pan, and the grill builds itself piece by piece — burner plate,
   dial, coals, grate, seam, fire. The copy sits still on the left through all
   of it. That is the point of pinning: before this the composed view existed
   for a moment and then scrolled apart mid-sequence, so the reader was reading
   a caption that was leaving while the picture it captioned was still arriving.

   IT COSTS HELD SCROLL, and that is the trade. See PIN_VH in MediaStage.tsx —
   the distance is a hard cap, the section itself shrank from 1.4 viewports to
   1.0 to give some of it back, and tools/verify-assembly.mjs fails if the
   pin-spacer grows past the cap.

   OUR STORY IS NOT IN THIS SECTION. It moved out, to its own quiet slot after
   the menu preview, because a section cannot open on a mechanism and also
   open on a story: the reader was being asked to read three paragraphs about
   the restaurant while a video turned into a diagram beside them, and the two
   were competing for the same attention. See About.tsx.

   THIS FILE DOES NOT OWN THE MOTION. The media is one fixed layer that spans
   the hero and this section, so the choreography lives with the element it
   moves: see MediaStage.tsx, which also owns the pin because the pin's scrub
   IS that timeline. What lives here is the LAYOUT that layer is measured
   against — `.media-frame` is the square the circle is inscribed in,
   `.media-rest` is where the panel passes through and is also the hero's dock
   target — plus the copy, its entrance, and the one-shot build below 1024.
   =========================================================================== */

export function PickYourFire() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const svg = section?.querySelector<SVGSVGElement>(".dual-grill");
    if (!section || !svg) return;

    const grillLayer = section.querySelector<HTMLElement>(".grill-layer");
    const rim = svg.querySelector<SVGGraphicsElement>(".rim");

    /* ------------------------------------------------------------------
       THE MATCH, and it is the whole trick.

       The frame is square and the circle at the end of the morph is therefore
       exactly the frame's width. The chassis has to be the same circle: same
       centre, same diameter. It is not, on its own — the artwork's outer rim
       spans 138 x 139.7 of a 150-unit viewBox and sits a little above centre,
       so dropped into a square box it renders ~7% small and off by a couple of
       percent vertically. At 520px that is a visible ring of empty frame and a
       chassis that slides sideways under footage that did not.

       So the rim is MEASURED and the layer is transformed to fit: scale so the
       rim's mean outer diameter (bbox plus its own stroke, which getBBox does
       not include) becomes the frame's width, then translate so the rim's
       centre lands on the frame's. In percentages of the layer's own box, so
       it is a constant of the ARTWORK and survives every resize without being
       recomputed.

       Non-uniform scaling is not an option — the rim is 1.2% taller than it is
       wide and stretching it to a true circle would stretch the coals and the
       grate with it. The mean splits the error: ~1.7px of radius each way at
       520px, well inside the "few px" the match has to hold to.
       ------------------------------------------------------------------ */
    if (rim && grillLayer) {
      const b = rim.getBBox();
      if (b.width && b.height) {
        const stroke = parseFloat(getComputedStyle(rim).strokeWidth) || 0;
        const d = (b.width + stroke + (b.height + stroke)) / 2;
        const k = 150 / d;
        const cx = b.x + b.width / 2;
        const cy = b.y + b.height / 2;
        grillLayer.style.setProperty("--dg-fit", `${k}`);
        grillLayer.style.setProperty("--dg-x", `${(0.5 - (cx * k) / 150) * 100}%`);
        grillLayer.style.setProperty("--dg-y", `${(0.5 - (cy * k) / 150) * 100}%`);
      }
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      /* ================================================================
         THE MOBILE ONE-SHOT IS GONE, AND ITS ABSENCE IS THE FEATURE.

         There used to be a `(max-width: 1023px)` builder here that played a
         paused 1.2s assembly timeline on the SVG when the illustration scrolled
         into view. It was a perfectly good animation and it was the reason the
         mobile morph "did not ship": it is a DIFFERENT feature occupying the
         same slot, so below 1024 the video stayed up in the hero and scrolled
         away while a separate grill built itself in a block underneath the
         copy. Two elements, which is exactly what was reported.

         The morph runs at every width now. MediaStage owns the whole sequence
         at both breakpoints from one builder — see the note there — so there is
         nothing left for this file to animate about the artwork.

         REDUCED MOTION STILL BUILDS NOTHING. No timeline, no ScrollTrigger, no
         initial states, at any width. The art is assembled in the markup and
         the embers are at full opacity, so the correct static state costs
         exactly zero lines, and `collectGrill` / `setAssemblyInitial` are never
         called to hide anything that would then need restoring.
         ================================================================ */

      /* ================================================================
         THE COPY IS NOT IN THE SCRUB. The media is a scrubbed mechanism; the
         copy is a plain entrance, once. Forcing it into the timeline would
         make reading it a function of scroll position.
         ================================================================ */
      mm.add({ motion: MOTION_OK, wide: "(min-width: 1024px)" }, (c) => {
        const { motion, wide } = c.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;

        // THE HEADING IS TRIGGERED OFF THE PAGE'S SCROLL, NOT OFF ITS OWN
        // POSITION, and that is a correctness rule rather than a preference. It
        // is underneath an opaque video until the clip has passed it, and a
        // heading revealed by a hard clip sweeping across it is half a glyph at
        // a time. FIRE_COPY_IN is just past that frame.
        //
        // Its position would not do. This block's distance from the top of the
        // page is a function of viewport HEIGHT and the panel's edge of
        // viewport WIDTH, so a `top 80%` start and the sweep drift apart with
        // the aspect ratio — at 1440x900 they agree to within a few pixels,
        // and on a short wide laptop they do not.
        //
        // IT IS THE SAME NUMBER ON A PHONE, and that is not a coincidence: the
        // dock spans exactly one viewport at both breakpoints (from the stage
        // entering the bottom of the screen to its top reaching the top), so a
        // fraction of a viewport of scroll is the same fraction of the dock
        // either way. What differs is only which edge is doing the covering —
        // the left one sweeping off a copy column, or the top one sweeping down
        // off a centred heading.
        const fromPageScroll = {
          trigger: "#home",
          start: () => window.innerHeight * FIRE_COPY_IN,
          invalidateOnRefresh: true,
          // Plays once. It used to reverse, so scrolling back up took the copy
          // you were reading away again.
          toggleActions: "play none none none" as const,
        };

        gsap.from(".fire-head", {
          opacity: 0,
          y: MOTION.rise,
          duration: MOTION.dur.reveal,
          ease: MOTION.gsapEase,
          scrollTrigger: fromPageScroll,
        });

        /* THE BODY. On a wide screen it is the same block as the heading and
           arrives with it. On a phone it is below the hold, so the pin is still
           holding it off-screen at FIRE_COPY_IN and it has to wait for its own
           arrival instead.

           `pinnedContainer` is load-bearing on that path. ScrollTrigger resolves
           a start position from where the trigger sits in the DOCUMENT, and a
           pinned ancestor displaces every descendant by the pin's distance — so
           without this the reveal fires ~70% of a viewport early, while the copy
           is still behind the fixed stage, and by the time the reader reaches it
           the entrance has already played. */
        gsap.from(".fire-body", {
          opacity: 0,
          y: MOTION.rise,
          duration: MOTION.dur.reveal,
          ease: MOTION.gsapEase,
          scrollTrigger: wide
            ? fromPageScroll
            : {
                trigger: ".fire-body",
                start: "top 88%",
                pinnedContainer: ".fire-stage",
                invalidateOnRefresh: true,
                toggleActions: "play none none none",
              },
        });
      });

      return () => mm.revert();
    }, section);

    return () => ctx.revert();
  }, []);

  useScrollRefresh();

  return (
    <section
      ref={sectionRef}
      id="pick-your-fire"
      aria-labelledby="fire-heading"
      // -mt-[60vh] cancels the hero's extra 60vh, so this section's first
      // screen is what the hero's window reveals as it clips down and the net
      // document height is unchanged. One number, written here, in Hero's
      // h-[160vh], and as HERO_SCRUB. Change one, change all three.
      //
      // `lg:` not `md:`, and BOTH halves move together. Where the clip never
      // runs the stage stays full-bleed and opaque for that whole extra
      // viewport and then slides up over the section, which is unreadable — so
      // the hero's extra height and this negative margin are one switch, and
      // it is thrown at the same 1024px the sticky column and the pinned
      // gallery use. Below it the page is plain stacked sections.
      //
      // `overflow-x-clip`, NOT `overflow-hidden`. `hidden` on either axis makes
      // the element a scroll container, and `position: sticky` resolves against
      // its nearest scrolling ancestor — so the media frame stuck to a box that
      // does not scroll, which is indistinguishable from not sticking at all.
      className="grain relative z-base overflow-x-clip bg-sand motion-safe:lg:-mt-[60vh]"
      style={{ ["--nav-h" as string]: `${NAV_H}px` } as React.CSSProperties}
    >
      {/* THE SEAM IS GONE, AND SO IS THE COMPONENT.

          `<SectionSeam />` was a chrome hairline drawn wherever the page's
          ground changed, and this was its last placement on the site — the
          hero's photography handing over to sand. Its own rule was that two
          sections sharing a ground are joined by rhythm rather than by a rule,
          which held while a ground change was the exception. Every boundary on
          this page is a ground change now, so the same rule applied honestly
          would put a hairline on all eight of them: a border on every section,
          which is the one thing this site has never done. Bands are hard cuts.
          See DIRECTION.md amendment A4. */}

      {/* WITHOUT JAVASCRIPT nothing ever clips the media layer, so the sticky
          column would park an illustration in a viewport that never releases
          it. This drops the whole desktop layout back to the stacked one, which
          is correct without a line of script. It is a <noscript> rather than a
          JS-toggled class so the scripted path takes its real layout on the
          first paint and never reflows into it. */}
      {/* WITHOUT JAVASCRIPT NOTHING EVER CLIPS THE MEDIA LAYER, so every box
          the morph needs has to be handed back to normal flow.

          THE MEDIA QUERY IS GONE FROM THIS BLOCK. It used to be wrapped in
          `@media (min-width: 1024px)`, because that was the only bracket where
          the morph's geometry existed. The geometry is now a property of motion
          rather than of width, so the undo has to be too — left as it was, a
          phone with JS off got a fixed, full-screen, unclipped video layer
          pinned over the entire page, which is the worst failure state on the
          site.

          `.media-stage` / `.hero-window` are the important two and they were
          never in here at all: `position: fixed` with no clip is a video
          covering the document forever. They go back to being the hero's own
          absolutely-positioned backdrop, which is what they are for. */}
      <noscript>
        <style>{`
          .media-stage, .hero-window { position: absolute; }
          .fire-stage {
            display: flex;
            min-height: 0;
            gap: 3.5rem;
            padding-block: var(--spacing-section);
          }
          .fire-hold { display: contents; }
          .fire-head { order: 1; width: auto; }
          .fire-body { order: 2; padding-block: 0; }
          .media-col, .media-frame { display: contents; }
          .media-frame { clip-path: none; }
          .media-rest { display: none; }
          .grill-layer {
            order: 3;
            position: relative;
            inset: auto;
            width: min(480px, 88vw);
            transform: none;
          }
        `}</style>
      </noscript>

      {/* DOM ORDER IS THE STACKED READING ORDER: copy, then the illustration
          it explains. Above 1024 with motion the grid puts them side by side;
          below it, `display: contents` drops the wrappers and this order is
          what is left. */}
      <div className="fire-stage track">
        {/* THE MOBILE PANEL, and it exists only below 1024 and under reduced
            motion. Up there the media is the fixed video layer passing through
            this section's frame; down here that layer is the hero's backdrop
            and scrolls away with it, so this section needs media of its own —
            and it must not be a second <video>. The poster IS a frame of the
            same clip, at 58KB against 2.3MB, which is the right trade for a
            panel that was never going to move. */}
        {/* THE MOBILE STILL PANEL IS GONE.

            Below 1024 this section carried a full-bleed photograph of a single
            cut of beef held in tongs over a grill — a frame of the hero clip,
            used as a stand-in because the fixed video layer scrolls away with
            the hero down here and the section had no media of its own.

            It was the wrong image in the wrong place. Whatever the clip is, a
            close-up of one piece of meat is not what "GAS OR CHARCOAL" is
            about, and the section already owns the artwork that IS about it:
            the dual-grill illustration directly below, which builds itself on
            entry. The panel was a second, unrelated piece of media stacked on
            top of the one that answers the heading.

            THE FILE STAYS. `/images/hero-poster.webp` is the hero video's
            poster — HeroBackdrop renders it under the clip and it is the LCP
            element, the reduced-motion state, and the landing place for every
            playback failure path. Deleting it would take the hero's floor out
            from under it. See the note in HeroBackdrop.tsx. */}
        {/* THE HOLD — exactly one viewport once the morph runs, and the thing
            the pin holds still.

            IT EXISTS TO KEEP THE BODY COPY OUT OF THE PIN. On a phone the
            composed view is the heading with the object under it, and the two
            paragraphs cannot be part of that: a pinned box shows only its first
            viewport, so copy inside it would be held off-screen for the whole
            sequence and then appear all at once. With the copy outside, the pin
            releases and the reader simply scrolls onto it.

            Above 1024 the box has no job — the grid composes head, body and
            media directly — so it is `display: contents` there and generates no
            box at all. Same DOM, two layouts, no duplicated markup. */}
        <div className="fire-hold">
          <div className="fire-head">
            <p className="eyebrow">Pick your fire</p>
            <h2 id="fire-heading" className="h2-scale mt-4">
              Gas or charcoal
            </h2>
          </div>

          <div className="media-col">
            {/* THE FRAME IS SQUARE, because the end of the morph is a circle
                inscribed in it and only a square box makes one. What passes
                through a rectangle is the CLIP, not the box.

                THERE IS NO VIDEO IN HERE. The footage is one fixed layer that
                spans the hero and this section (MediaStage.tsx); this frame is
                the GEOMETRY that layer is measured against, plus the
                illustration the footage dissolves off. It carries `overflow:
                hidden` because the artwork is scaled up until its rim fills the
                frame, so its own viewBox overhangs. */}
            <div className="media-frame">
              {/* ONE MEASURED BOX FOR TWO JOBS, and that is the point of it
                  existing at all. It is the shape the panel passes through, and
                  it is where the hero's window docks — `.col-media` is the name
                  that scrub measures. Written as two sets of numbers they would
                  agree until someone tuned one of them; written as one box they
                  cannot disagree. It paints nothing. */}
              <div className="media-rest col-media" aria-hidden="true" />

              <div className="grill-layer">
                <DualGrill />
              </div>
            </div>
          </div>
        </div>

        {/* THE BODY. Inside `.fire-stage` so the desktop grid can place it under
            the heading in column one, but outside `.fire-hold` so a phone's pin
            never holds it. `data-reveal` is only read below 1024 — see the
            entrance in this file. */}
        <div className="fire-body" data-reveal-group>
          <div className="copy measure space-y-4" data-reveal>
            {/* VERBATIM. The band brief listed this section's copy as
                explicitly unchanged, so the em dash below stays even though the
                copy pass bans new ones. */}
            <p>
              Every table has its own grill, built into the top. Gas runs even
              and hot and needs almost nothing from you — good if you are
              feeding a table and want to keep talking.
            </p>
            <p>
              Charcoal takes a little more attention and gives it back as smoke
              and char on the edges of the meat. Same price either way. Ask for
              charcoal when you walk in.
            </p>
          </div>
          <div className="mt-8 flex" data-reveal>
            <PillLink href="/menu" arrow>
              See the menu
            </PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
