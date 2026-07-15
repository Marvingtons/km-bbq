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
   transform / opacity / clip-path / background-color. All of it lives inside a
   `MOTION_OK` matchMedia, so reduced-motion users get the plain stacked
   sections (static backgrounds, threads shown fully drawn, no parallax).

   `calm` (used on /menu) keeps only the two seam-safe effects — background
   continuity and the thread motif — and skips parallax / overlaps in the dense
   list content.
   =========================================================================== */

export function SeamMotion({ calm = false }: { calm?: boolean }) {
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const sel = (s: string) => document.querySelector<HTMLElement>(s);
      const boundaryZone = { start: "top bottom", end: "top 70%", scrub: true } as const;

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

      // 2 — CONNECTIVE MOTIF. The ember thread at each seam draws itself down as
      // the seam scrolls up through the upper viewport. stroke-dashoffset only.
      gsap.utils.toArray<SVGLineElement>(".seam-thread-line").forEach((line) => {
        const host = (line.closest(".seam-thread") as HTMLElement) ?? line;
        gsap.fromTo(
          line,
          { strokeDashoffset: 72 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: { trigger: host, start: "top 88%", end: "top 52%", scrub: true },
          }
        );
      });

      if (calm) return; // /menu stays calm past this point.

      // 3 — DEPTH. Decorative background textures drift at ~0.85x scroll so the
      // boundary zones feel layered, never body copy. transform only.
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

      // 4 — HANDOFF: House Favorites -> Gallery. The featured Galbi card releases
      // with a slight lag (moves a touch slower than scroll) as the section
      // exits, so it hangs on while the gallery heading rises to meet it.
      const galbi = sel('[aria-labelledby="favorites-heading"] .grill-dish');
      if (galbi) {
        gsap.fromTo(
          galbi,
          { yPercent: 0 },
          {
            yPercent: 7,
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

      // 5 — HARD CUT: Hero -> About. The mural's first scattered elements drift
      // up into the last of the hero, so the illustrated world arrives before
      // the section does. transform + opacity.
      const dots = gsap.utils.toArray<HTMLElement>(".hero-arrival > *");
      if (dots.length) {
        gsap.fromTo(
          dots,
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

      // 6 — HANDOFF: About mural -> House Favorites. A couple of mural accents
      // drift down past the boundary and fade, so the illustrated world trails
      // off into the photography world instead of stopping at a border.
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
      // cream — its content lags slightly as it enters, so the page feels like
      // it comes to rest on a surface rather than hitting a wall. The ember
      // hairline (already there, and shimmering) is the seam. transform only.
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
