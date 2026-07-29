"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   SeamMotion — scroll-driven transitions BETWEEN sections
   ---------------------------------------------------------------------------
   Coordinates everything that happens at a section boundary so the page reads
   as one continuous piece instead of stacked panels. Nothing here pins or eats
   scroll distance; every effect rides normal scrolling and only ever scrubs
   transform / opacity / background-color / stroke-dashoffset. All of it lives
   inside a `MOTION_OK` matchMedia, so reduced-motion users get plain stacked
   sections (static backgrounds, no parallax) — the timelines are never built
   at all.

   `calm` (used on /menu) skips parallax and the handoffs, which belong to the
   home page's composed sections rather than to a dense list.

   NOTE: the background-continuity pass that used to live here (scrubbing each
   flagged section from the previous section's tone to its own) is gone. It
   existed to soften a cream -> paper -> cream sequence of section grounds; the
   page now has exactly two grounds, cream and plum-ink, and each of the two
   changes between them is marked by the ember hairline instead. There is
   nothing left to morph.

   NOTE ON STRUCTURE: the original version of this ran across six boundaries,
   including one between the About mural and House Favorites. Those are one
   section now (the consolidation pass merged them, and above lg they share a
   pinned stage), so that internal seam is gone and the mural's trailing marks
   were repointed at the real About -> Gallery boundary instead.
   =========================================================================== */

export function SeamMotion({ calm = false }: { calm?: boolean }) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    // THE WINDOW gets its own matchMedia because it needs a width condition as
    // well as a motion one, and because crossing 768px must tear the timeline
    // down rather than leave a half-clipped panel frozen on screen.
    mm.add(
      { motion: MOTION_OK, wide: "(min-width: 768px)" },
      (context) => {
        const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
        if (!motion || !wide || calm) return;
        const sel = (s: string) => document.querySelector<HTMLElement>(s);

      // 1 — THE WINDOW: Hero -> About. The one boundary where the page changes
      // what it is made of, footage to paint.
      //
      // The idea is that the video was never a background — it is a window, and
      // scrolling reveals that the painted world was behind it the whole time.
      // So the frame CLIPS down to an inset rounded panel, and what is exposed
      // around it is About's real mural, full-bleed. Not a copy of the asset,
      // not a crossfade: the actual section, sitting behind the stage because
      // Hero.tsx runs 200vh with a sticky stage and About is pulled up 100vh to
      // meet it. Read the arithmetic block in Hero.tsx before touching this.
      //
      // WHY THE MURAL AND THE ABOUT COPY NEED NO TWEEN: they are genuinely
      // scrolling. About rises behind the window under its own steam across
      // this exact window, which is why its heading and body "rise into place
      // alongside the shrinking panel" without a single keyframe. The only
      // thing animated here is the clip.
      //
      // CLIP-PATH AND TRANSFORM ONLY. No width, no height, no top/left — the
      // panel never triggers layout, so CLS through the whole transition is 0.
      //
      // The window is the hero's own 100vh of sticky travel. It ENDS on the
      // pixel where the stage releases and About's pin engages, so the two
      // never overlap.
      //
      // Reduced motion never reaches here (MOTION_OK), and neither does
      // anything under 768px (see the media query below): both get the static
      // stacked page with the ember hairline as the whole transition.
      const heroWindow = sel(".hero-window");
      const heroMedia = sel(".hero-media");

      if (heroWindow) {
        // THE PANEL'S RESTING SHAPE IS READ OFF THE GRID, not hard-coded.
        //
        // Fixed percentages cannot sit on this grid: `.track` is a centred
        // max-width column, so its left edge is 5.21% of the viewport at 1440px
        // and 0% at 1280px. A constant inset lands on the column at one width
        // and floats 11px inside it at another. So the left edge is measured
        // from the live track, and the right edge is placed on a real column
        // boundary (end of column 9 of 12, gutters accounted for), which is
        // what opens the reveal band down the right.
        //
        // Function-based so `invalidateOnRefresh` re-reads it on resize.
        //
        // TOP AND BOTTOM stay proportional, and the bottom one is the tight
        // constraint: the hero's copy runs from the eyebrow at 41% of the frame
        // to the CTA's bottom edge at 89%, and the whole block has to stay
        // INSIDE the panel. A deeper inset (20% was the first attempt) puts the
        // panel edge through the middle of the subhead — half the line over
        // video, half over mural — and strands type on painted mural where the
        // measured contrast does not apply.
        const restingInset = () => {
          const track = document.querySelector<HTMLElement>("#home .track");
          const vw = window.innerWidth;
          let leftPct = 6;
          let rightPct = 25;
          if (track) {
            const r = track.getBoundingClientRect();
            const GAP = 24;
            const COLS = 12;
            const colW = (r.width - GAP * (COLS - 1)) / COLS;
            // Right edge of column 9: nine columns plus the eight gutters
            // between them, measured from the track's left edge.
            const panelRight = r.left + colW * 9 + GAP * 8;
            leftPct = (r.left / vw) * 100;
            rightPct = ((vw - panelRight) / vw) * 100;
          }
          return { top: 10, right: rightPct, bottom: 7, left: leftPct };
        };

        gsap.fromTo(
          heroWindow,
          { clipPath: "inset(0% 0% 0% 0% round 0px)" },
          {
            clipPath: () => {
              const i = restingInset();
              return `inset(${i.top}% ${i.right}% ${i.bottom}% ${i.left}% round var(--radius-photo))`;
            },
            ease: MOTION.gsapEase,
            scrollTrigger: {
              trigger: "#home",
              // Start a beat in, not at scroll 0: the hero should read as a
              // full-bleed hero for a moment before it admits it is a window.
              start: "top top-=12%",
              end: "bottom bottom",
              scrub: MOTION.scrub,
              invalidateOnRefresh: true,
            },
          }
        );

        // The footage inside the panel drifts against the clip, so the window
        // reads as moving over a world that carries on behind it rather than
        // as a shrinking picture. Transform only.
        if (heroMedia) {
          gsap.fromTo(
            heroMedia,
            { yPercent: 0 },
            {
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger: "#home",
                start: "top top",
                end: "bottom bottom",
                scrub: MOTION.scrub,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      }
      }
    );

    // Everything else on the page: motion-gated only, no width condition.
    mm.add(MOTION_OK, () => {
      const sel = (s: string) => document.querySelector<HTMLElement>(s);

      if (calm) return; // /menu stays calm past this point.

      // NOTE: a generic [data-seam-parallax] pass used to live here. Its only
      // consumers were the extracted mural spot marks, which have been removed
      // site-wide, so it was drifting nothing.

      // 4 — HANDOFF: the featured Galbi card releases with a slight lag (moves
      // a touch slower than scroll) as About exits, so it hangs on while the
      // gallery rises to meet it.
      //
      // yPercent 2, not 7. At 7 this pushed the card down ~40px on a 571px
      // card, and since the card sits directly above the "See the full menu"
      // pill, the lag drove it straight into the button exactly when the
      // button became visible. The pinned stage has no spare height to simply
      // push the pill further down, so the lag itself had to come back to
      // where it reads as a release (~11px) rather than a shove.
      const galbi = sel("#about .grill-dish");
      if (galbi) {
        gsap.fromTo(
          galbi,
          { yPercent: 0 },
          {
            yPercent: 2,
            ease: "none",
            scrollTrigger: {
              trigger: galbi.closest("section"),
              start: "center 60%",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // NOTE: the Hero -> About boundary is handled at the top of this block.
      // An older version put a row of ember and WHITE dots here to soften the
      // cut between a dark hero and a cream About; the dots went when the hero
      // went cream (white on cream is invisible) and they are not coming back.
      // A handoff is two surfaces exchanging the page, not confetti thrown over
      // the join.

      // 6 — HANDOFF: About -> Gallery. A couple of mural accents drift down past
      // the boundary and fade, so the illustrated world trails off into the
      // photography instead of stopping at a border.
      const trail = gsap.utils.toArray<HTMLElement>(".mural-trail > *");
      if (trail.length) {
        gsap.fromTo(
          trail,
          { yPercent: 0, autoAlpha: 0.7 },
          {
            yPercent: 120,
            autoAlpha: 0,
            ease: "none",
            stagger: 0.06,
            // Without this, the from-state (autoAlpha 0.7) renders on load and
            // the marks sit visible for the whole section, not just at the
            // boundary — including behind the "See the full menu" pill, which
            // is an OUTLINE pill and therefore transparent at rest, so they
            // showed straight through it. The marks now stay hidden (CSS
            // opacity-0) until this trigger actually starts near the seam.
            immediateRender: false,
            scrollTrigger: {
              trigger: sel("#about"),
              start: "bottom 75%",
              end: "bottom 25%",
              scrub: true,
            },
          }
        );
      }

      // 7 — HARD CUT: Contact -> Footer. The dark footer settles up under the
      // cream: its content lags slightly as it enters, so the page comes to
      // rest on a surface rather than hitting a wall. The footer's own ember
      // hairline is the seam. transform only.
      const footerInner = sel("footer > .relative");
      if (footerInner) {
        gsap.fromTo(
          footerInner,
          { yPercent: 9 },
          {
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: "footer",
              start: "top bottom",
              end: "top 68%",
              scrub: true,
            },
          }
        );
      }
    });

    return () => mm.revert();
  }, [calm]);

  return null;
}
