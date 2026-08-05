"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION_OK } from "./motion";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   THE ONE REVEAL, AND IT IS DECLARED IN THE MARKUP.

   The site had two entrance systems doing the same job in different engines:
   `<ScrollReveal>` (framer-motion `useInView`, per-element wrapper divs, a CSS
   class to opt out under reduced motion) and hand-written `gsap.from` blocks in
   About, Favorites and Pick Your Fire. Same intent, two durations, two easings,
   two reduced-motion stories, and every new section had to pick one.

   This is one engine with a declarative surface. A component marks WHAT should
   arrive and in what order; nothing about the timing, the distance, the curve
   or the reduced-motion bracket lives in a component any more.

     data-reveal              fade + rise. The default, and most things.
     data-reveal="rule"       scaleX 0->1 from the left. The hairline under a
                              heading, which should draw rather than fade.
     data-reveal="image"      fade + rise, PLUS the inner <img> settling from
                              1.06 to 1. The card must be overflow-hidden or
                              the settle shows its seams.
     data-reveal-group        a trigger boundary. Everything inside it arrives
                              on ONE ScrollTrigger, staggered in DOM order.
     data-reveal-stagger="n"  override the group's stagger.

   ONE TRIGGER PER GROUP, NOT PER ELEMENT. Per-element triggers are what made
   the old system feel like a slot machine: eight cards each deciding for
   themselves when to arrive, so the group's rhythm depended on scroll speed.
   A group fires once and the stagger is its own.

   INITIAL STATES ARE SET BY JS, NEVER BY CSS. Every tween is a `fromTo`, and a
   `fromTo` immediate-renders its from-state when the timeline is built — so the
   hidden state exists only once this module has run. If the bundle fails, if
   GSAP never loads, if the browser is too old, the markup is already the
   finished state and nothing has hidden it. The previous system needed a
   `.scroll-reveal` CSS rule to undo an inline `opacity: 0` under reduced
   motion, and that rule existed because a JS failure could otherwise leave the
   whole page invisible.

   REDUCED MOTION IS A BRACKET, NOT A BRANCH. Everything below is inside
   `gsap.matchMedia(MOTION_OK)`, so under `prefers-reduced-motion: reduce` no
   timeline is constructed, no from-state is written, and the page is simply the
   finished page. Nothing to undo.
   =========================================================================== */

export const REVEAL = {
  /** The rise, in px. Matches MOTION.rise; named here because it is the one
   *  number a reader actually perceives as "the site's entrance". */
  y: 24,
  dur: 0.7,
  ease: "power2.out",
  stagger: 0.08,

  /** The hairline under a heading. Draws from the left, just after it. */
  ruleDur: 0.5,
  ruleOffset: 0.1,

  /** The photographic settle. Never a parallax — it resolves and stops. */
  imageFrom: 1.06,
  imageDur: 0.9,

  /** Deliberately generous: it fires as the group's top clears the lower
   *  quarter, so a fast scroller meets content that is already arriving
   *  rather than content that starts arriving once they have stopped. */
  start: "top 78%",

  /**
   * THE STAGGER CAP, and it is a correctness rule rather than a preference.
   * `/menu` has categories with eight rows; the Banchan block used to have
   * more. At 0.04s each an unbounded stagger is fine, but the same code runs
   * over the gallery and over a 20-row category, and 20 x 0.08 is 1.6 seconds
   * of a reader watching a list assemble. Past this index everything shares the
   * last slot and arrives together.
   */
  maxIndex: 8,
} as const;

type Kind = "" | "rule" | "image";

/**
 * Members of `group`, in DOM order, excluding anything that belongs to a
 * NESTED group — otherwise a category inside a section would animate twice,
 * once on its own trigger and once on its parent's.
 */
function membersOf(group: HTMLElement): HTMLElement[] {
  return Array.from(group.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
    (el) => el.closest("[data-reveal-group]") === group
  );
}

/**
 * Build the reveals for one root. Call it from a section's own component with a
 * ref to that section; the groups inside are found automatically.
 *
 * `gsap.context` scopes every selector and collects every tween and trigger, so
 * the cleanup is one `revert()` — which matters on a route change, where a
 * leaked ScrollTrigger keeps measuring a detached element forever.
 */
export function useReveal(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // The root itself counts as a group when it declares one, so a simple
        // section needs one attribute rather than a wrapper.
        const groups = Array.from(
          root.querySelectorAll<HTMLElement>("[data-reveal-group]")
        );
        if (root.matches("[data-reveal-group]")) groups.unshift(root);

        for (const group of groups) {
          const members = membersOf(group);
          if (!members.length) continue;

          const stagger = Number(group.dataset.revealStagger) || REVEAL.stagger;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: group,
              start: REVEAL.start,
              // ONCE. Nothing on this site re-plays an entrance: an element
              // that fades out when you scroll back up takes away the thing
              // the reader returned to look at.
              once: true,
            },
          });

          // Positions are tracked explicitly rather than derived from the
          // index, because the rule is not on the grid — it follows its heading
          // by a fixed offset, whatever the stagger happens to be.
          let pos = 0;
          let last = 0;

          members.forEach((el, i) => {
            const kind = (el.dataset.reveal || "") as Kind;

            if (kind === "rule") {
              // Sits against the element BEFORE it, not against the grid.
              pos = last + REVEAL.ruleOffset;
              tl.fromTo(
                el,
                { scaleX: 0 },
                {
                  scaleX: 1,
                  duration: REVEAL.ruleDur,
                  ease: REVEAL.ease,
                  transformOrigin: "left center",
                },
                pos
              );
              // The rule is a beat, not a step: what follows it resumes the
              // grid from where the heading left off.
              return;
            }

            pos = Math.min(i, REVEAL.maxIndex) * stagger;
            last = pos;

            tl.fromTo(
              el,
              { autoAlpha: 0, y: REVEAL.y },
              {
                autoAlpha: 1,
                y: 0,
                duration: REVEAL.dur,
                ease: REVEAL.ease,
              },
              pos
            );

            if (kind === "image") {
              const img = el.querySelector("img");
              if (img) {
                // THE SETTLE RIDES THE SAME POSITION as the card's own fade, so
                // the photograph resolves as the card arrives rather than after
                // it. Longer than the fade on purpose — the card lands and the
                // picture is still coming to rest, which is the whole effect.
                tl.fromTo(
                  img,
                  { scale: REVEAL.imageFrom },
                  {
                    scale: 1,
                    duration: REVEAL.imageDur,
                    ease: REVEAL.ease,
                  },
                  pos
                );
              }
            }
          });
        }
      });

      return () => mm.revert();
    }, root);

    return () => ctx.revert();
  }, [ref]);
}
