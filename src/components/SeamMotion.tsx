"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_OK } from "@/lib/motion";

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

   `calm` (used on /menu) keeps only the seam-safe effect, background
   continuity, and skips parallax and handoffs in the dense list content.

   NOTE ON STRUCTURE: the original version of this ran across six boundaries,
   including one between the About mural and House Favorites. Those are one
   section now (the consolidation pass merged them, and above lg they share a
   pinned stage), so that internal seam is gone and the mural's trailing marks
   were repointed at the real About -> Gallery boundary instead.
   =========================================================================== */

export function SeamMotion({ calm = false }: { calm?: boolean }) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const sel = (s: string) => document.querySelector<HTMLElement>(s);
      // Boundary zones are short and sit in the upper viewport, so a seam
      // resolves as it arrives rather than trailing the whole section.
      const boundaryZone = {
        start: "top bottom",
        end: "top 70%",
        scrub: true,
      } as const;

      // 1 — BACKGROUND CONTINUITY. Each flagged section scrubs its background
      // from the previous section's tone (matched at the seam) to its own base
      // tone over the first ~30vh, so the cream family breathes instead of
      // switching panels. background-color only.
      gsap.utils.toArray<HTMLElement>("[data-seam-morph]").forEach((el) => {
        gsap.fromTo(
          el,
          { backgroundColor: el.dataset.from },
          {
            backgroundColor: el.dataset.to,
            ease: "none",
            immediateRender: true,
            scrollTrigger: { trigger: el, ...boundaryZone },
          }
        );
      });

      if (calm) return; // /menu stays calm past this point.

      // 3 — DEPTH. Decorative background textures drift at ~0.85x scroll so the
      // boundary zones feel layered. Body copy never moves. transform only.
      gsap.utils.toArray<HTMLElement>("[data-seam-parallax]").forEach((el) => {
        const amt = Number(el.dataset.parallax ?? 6);
        gsap.fromTo(
          el,
          { yPercent: -amt },
          {
            yPercent: amt,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });

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

      // 5 — HARD CUT: Hero -> About. The mural's first scattered marks drift up
      // into the last of the hero, so the illustrated world arrives before the
      // section does. transform + opacity.
      const arrival = gsap.utils.toArray<HTMLElement>(".hero-arrival > *");
      if (arrival.length) {
        gsap.fromTo(
          arrival,
          { yPercent: 70, autoAlpha: 0 },
          {
            yPercent: -45,
            autoAlpha: 1,
            ease: "none",
            stagger: 0.05,
            scrollTrigger: {
              trigger: "#home",
              start: "bottom bottom",
              end: "bottom 72%",
              scrub: true,
            },
          }
        );
      }

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
