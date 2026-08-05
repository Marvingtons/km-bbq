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

    // THE HERO -> ABOUT WINDOW IS NOT HERE ANY MORE.
    //
    // It was the largest thing in this file: a scrubbed clip-path that shrank
    // the hero's footage into About's media cell. It moved to MediaStage.tsx
    // when the video became a single fixed element spanning both sections —
    // the clip no longer ENDS at a section boundary, it carries straight on
    // into the circle and the match cut, so it is one gesture belonging to one
    // element rather than a seam between two sections. This file is for the
    // latter, and had no business owning half of the former.

    // Everything else on the page: motion-gated only, no width condition.
    mm.add(MOTION_OK, () => {
      const sel = (s: string) => document.querySelector<HTMLElement>(s);

      if (calm) return; // /menu stays calm past this point.

      // NOTE: a generic [data-seam-parallax] pass used to live here. Its only
      // consumers were the extracted mural spot marks, which have been removed
      // site-wide, so it was drifting nothing.

      // 4 — HANDOFF: the featured Galbi card releases with a slight lag (moves
      // a touch slower than scroll) as the menu preview exits, so it hangs on
      // while the next section rises to meet it.
      //
      // yPercent 2, not 7. At 7 this pushed the card down ~40px on a 571px
      // card, and since the card sits directly above the "See the menu"
      // pill, the lag drove it straight into the button exactly when the
      // button became visible. The pinned stage has no spare height to simply
      // push the pill further down, so the lag itself had to come back to
      // where it reads as a release (~11px) rather than a shove.
      const galbi = sel(".favorites .grill-dish");
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

      // 6 — REMOVED. A disc, a squiggle and a second disc used to drift down
      // across the About -> Gallery boundary, fading as they went. They were
      // drawn to echo the mural, and the mural is gone, so they were echoing
      // nothing. `.mural-trail` no longer exists in the markup either, so this
      // timeline was querying an empty set.

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
