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
   page now has exactly two grounds, cream and char-2, and each of the two
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
      const dockCell = sel("#about .col-media");
      const about = document.getElementById("about");
      const seam = sel(".hero-dock-seam");
      const exitSupport = gsap.utils.toArray<HTMLElement>("#home .hero-exit-support");
      const exitDisplay = sel(".hero-exit-display");

      if (heroWindow) {
        // THE DOCK IS READ OFF ABOUT'S REAL MEDIA CELL.
        //
        // The version this replaces measured `#home .track` and did column
        // arithmetic on the result. `.track` is border-box and carries
        // `padding-inline`, so its rect is the PADDING box: at 1440 that made a
        // column 84.667px wide where the real one is 76.667px, and put column
        // 1's left edge a whole gutter out. The panel had never been on the
        // grid. A grid cell cannot be wrong about the grid, so measure one.
        //
        // HORIZONTAL is scroll-invariant and read live. VERTICAL is taken
        // ABOUT-RELATIVE, which is exact rather than merely tidy: on the one
        // frame the panel docks, About's top IS the window's top (see the
        // arithmetic block in Hero.tsx). Taking the difference also survives
        // About being pinned by transform, because both rects translate
        // together.
        //
        // Percentages are of `.hero-window`'s OWN rect, never innerWidth:
        // `inset()` resolves against the clip's reference box, and
        // `scrollbar-gutter: stable` guarantees innerWidth is a scrollbar
        // wider than that box at all times — a permanent error, not an edge
        // case.
        const dock = () => {
          if (!dockCell || !about) return null;
          const w = heroWindow.getBoundingClientRect();
          const c = dockCell.getBoundingClientRect();
          const a = about.getBoundingClientRect();
          if (!w.width || !w.height || !c.width || !c.height) return null;
          const top = ((c.top - a.top) / w.height) * 100;
          const height = (c.height / w.height) * 100;
          const left = ((c.left - w.left) / w.width) * 100;
          // `.bleed-right` is 100vw-based, so a bleeding cell reads a few px
          // past the clip's box. Clamping is what makes it flush, not negative.
          const right = Math.max(0, ((w.right - c.right) / w.width) * 100);
          const bottom = 100 - top - height;
          if (top < 0 || bottom < 0 || left + right >= 100) return null;
          return { top, right, bottom, left };
        };

        // The corner radius comes from the CELL's resolved radius, so the
        // docked panel and the column it docks into agree by construction
        // rather than by two numbers being kept in sync. It is also why this is
        // a resolved px number: GSAP cannot interpolate
        // `round var(--radius-photo)`, which is what shipped before.
        const radiusPx = () =>
          dockCell ? parseFloat(getComputedStyle(dockCell).borderTopLeftRadius) || 0 : 0;

        let D = dock();
        const P = { t: 0, r: 0 };

        // Written as a string once per tick rather than tweened as a property,
        // because clip-path is one property carrying four numbers and a radius
        // that move on different schedules.
        const paint = () => {
          const k = D ? P.t : 0;
          const t = D ? D.top * k : 0;
          const r = D ? D.right * k : 0;
          const b = D ? D.bottom * k : 0;
          const l = D ? D.left * k : 0;
          heroWindow.style.clipPath =
            `inset(${t}% ${r}% ${b}% ${l}% round ${P.r}px 0px 0px ${P.r}px)`;
        };

        // Layout of an out-of-flow element, once per refresh — not animation.
        // Only scaleY scrubs.
        const placeSeam = () => {
          if (!seam || !D) return;
          const w = heroWindow.getBoundingClientRect();
          gsap.set(seam, {
            left: (D.left / 100) * w.width - 1,
            top: (D.top / 100) * w.height,
            height: ((100 - D.top - D.bottom) / 100) * w.height,
            transformOrigin: "top center",
          });
        };

        paint();
        placeSeam();

        // ONE PLAYHEAD FOR THE WHOLE GESTURE, and that is the load-bearing
        // decision. `start: "top top"` / `end: "bottom bottom"` maps timeline
        // progress 1:1 onto scrollY 0 -> 100vh, so the phase positions below
        // are literally the brief's percentages. Because the copy's exit and
        // the clip share one playhead, no amount of scrub catch-up, dropped
        // frame or fast flick can reorder them: the type is gone before a clip
        // edge exists, at EVERY scroll position, by construction rather than by
        // clearance.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: paint,
          scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom bottom",
            scrub: MOTION.scrub,
            invalidateOnRefresh: true,
            onRefresh: () => {
              D = dock();
              placeSeam();
              paint();
            },
          },
        });

        // PHASE A (0.04 -> 0.24). The copy leaves before the panel moves.
        // Every tween is a `fromTo` with an explicit from-state:
        // `invalidateOnRefresh` re-reads the start value of a `.to()` off the
        // live element, so a mid-scroll refresh would record "opacity 0.4" as
        // the start and scrolling back would never restore the copy. A `fromTo`
        // declares its start and survives invalidation. `immediateRender:
        // false` leaves framer's entrance alone until the scrub actually moves.
        // gsapEaseInOut because this reverses.
        if (exitSupport.length)
          tl.fromTo(
            exitSupport,
            { y: 0, autoAlpha: 1 },
            {
              y: -MOTION.rise,
              autoAlpha: 0,
              duration: 0.12,
              stagger: 0.04,
              ease: MOTION.gsapEaseInOut,
              immediateRender: false,
            },
            0.04
          );
        if (exitDisplay)
          tl.fromTo(
            exitDisplay,
            { y: 0, autoAlpha: 1 },
            {
              y: -MOTION.rise,
              autoAlpha: 0,
              duration: 0.12,
              ease: MOTION.gsapEaseInOut,
              immediateRender: false,
            },
            0.12
          );

        // The corner radius resolves in the first tenth, while the frame is
        // still full-bleed and its corners are the viewport's own — so it is a
        // CONSTANT for the entire geometric travel and the hero's rest frame
        // stays square. Rounding the rest frame would put two notches on the
        // LCP paint; ramping it during the dock would fail the "radius constant
        // across the scrub" assertion.
        tl.fromTo(P, { r: 0 }, { r: () => radiusPx(), duration: 0.1 }, 0);

        // PHASE B (0.30 -> 0.80). The empty frame shrinks into the cell.
        tl.fromTo(P, { t: 0 }, { t: 1, duration: 0.5, ease: MOTION.gsapEase }, 0.3);

        // PHASE C (0.82 -> 0.96). The hairline draws at the seam.
        if (seam)
          tl.fromTo(
            seam,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.14,
              ease: MOTION.gsapEase,
              immediateRender: false,
            },
            0.82
          );

        // The footage drifts against the clip, on the SAME playhead, so it can
        // never desync from the shape it drifts inside. The 8% vertical bleed
        // on `.hero-media` is the travel room.
        if (heroMedia)
          tl.fromTo(heroMedia, { yPercent: 0 }, { yPercent: 4, duration: 1 }, 0);

        // If `.col-media` is ever missing, hidden or zero-sized, `dock()`
        // returns null, `paint()` writes full-bleed, and the hero simply never
        // clips. It cannot blank.
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
