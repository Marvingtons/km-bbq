"use client";

import { useRef } from "react";
import Image from "next/image";
import { useReveal } from "@/lib/reveal";

/* ===========================================================================
   OUR STORY — and it is quiet on purpose.

   It used to open the page, sharing a section with the grill sequence: three
   paragraphs about the restaurant on the left while a video turned into a
   diagram on the right. Two things asking for the same attention, and the copy
   lost — nobody reads a founding story while something is morphing beside it.

   So it sits here instead, after the menu preview, where the reader has already
   had the mechanism and the food and is willing to be told what the place is.
   By this point the page's animation budget is spent (hero, the match cut, the
   pinned gallery below), and the correct amount of motion left for this section
   is one fade. There is no scrub and no sticky column, and nothing here reacts
   to scroll after its entrance has played. The media is a framed piece of
   artwork and it does not move — a second animated illustration on this page
   would be arguing with the one the section above is built around.

   IT KEEPS `id="about"`, because the nav's ABOUT link means this copy, not the
   slot it used to occupy. Pick Your Fire took `#pick-your-fire`.

   NO CTA. The block above this one is the menu preview and it ends with "See
   the menu"; a second menu button here would be pointing the reader back at
   what they have just scrolled through. The gallery is next and speaks for
   itself.
   =========================================================================== */

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  // ONE ENTRANCE, ONCE, AND NOTHING ELSE — now expressed in the shared system
  // rather than a hand-written gsap.from here. The copy block and the artwork
  // are one group, so they arrive together instead of as a two-beat reveal.
  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      className="grain relative z-base bg-sand py-section md:py-section-lg"
    >
      <div className="grid-page items-center gap-y-10" data-reveal-group>
        <div className="story-copy col-story">
          <p className="eyebrow" data-reveal>
            Our story
          </p>
          <h2 id="about-heading" className="h2-scale mt-4" data-reveal>
            It started with a grill
          </h2>
          <span
            aria-hidden="true"
            className="mt-5 block h-0.5 w-16 bg-steel"
            data-reveal="rule"
          />
          <div className="copy measure mt-8 space-y-5" data-reveal>
            <p>
              KM.BBQ started with one idea: really good Korean BBQ that you cook
              yourself. Every table gets its own grill, gas or charcoal.
            </p>
            <p>
              We pick our meat carefully and marinate it in house, using recipes
              we have leaned on for years. You grill it fresh, right where you
              sit, cooked exactly how you like it.
            </p>
            <p>
              Pull up a chair and take your time. Order more whenever you want.
              Good food, a hot grill, and no reason to rush.
            </p>
          </div>
        </div>

        {/* NOT A PHOTOGRAPH, AND IT MUST NOT BE FRAMED LIKE ONE.

            `about.png` is a cave-painting-style illustration — figures cooking
            around a shared fire, ochre and rust and charcoal pigment laid on a
            warm parchment ground. That ground is warmer than the page's
            (--color-sand), which is the whole problem: dropped in bare under
            `.photo` it reads as a PATCH OF the page that has gone slightly
            wrong, a rectangle of cream that does not match the cream around it.

            So it is DECLARED ARTWORK. A cream mat in the page's own ground, a
            hairline frame in an ochre pulled from the pigment, and a caption
            underneath. The mat is the piece that does the reconciling: it puts
            an unambiguous band of true page-cream between the parchment and the
            page, so the eye reads two grounds because there is an object, not
            because something is off. See `.artwork-card` in globals.css.

            THE CAPTION IS PROVENANCE, NOT DECORATION. It credits the painted
            mural on the dining room's back wall — the one visible along the
            back of `interior.png` in the gallery — which this illustration is
            after. It does not get reworded into something generic; without it
            the piece is an unattributed illustration on a restaurant's page,
            which is exactly the failure DIRECTION.md records against the old
            `mural-left`/`mural-right` artwork.

            `.photo` is deliberately NOT used: it carries a photographic grade
            (saturate/contrast/brightness) and a warm bottom scrim, both of
            which are corrections for a photograph sitting into the ground and
            both of which are wrong on flat pigment that is meant to sit ON it.

            The dining-room photograph this replaced (live-grill) is in the
            gallery strip, tile 4, captioned "Mid-service". It was not deleted.

            DOM order copy-then-artwork, which is the stacked reading order
            below 768; above it the grid puts them side by side. */}
        {/* `data-reveal="image"` on the FIGURE, so the piece and its provenance
            line arrive as one object while the artwork itself settles from 1.06
            inside the frame. The frame is overflow-hidden, so the settle reads
            as the picture coming to rest in its mat rather than as a scaling
            box. */}
        <figure
          className="story-artwork artwork-card col-panel"
          data-reveal="image"
        >
          <div className="artwork-frame">
            <Image
              src="/images/about.png"
              alt="Cave painting style illustration of figures cooking over a shared fire, after the mural in the KM BBQ dining room"
              /* INTRINSIC DIMENSIONS, NOT `fill`. The artwork is 1916x821 and
                 every pixel of it has to be visible — a `fill` box would need
                 an aspect ratio restated here, and a restated ratio is a crop
                 waiting for someone to reframe the source. Given the real
                 numbers the box IS the aspect ratio and cropping is not
                 expressible. */
              width={1916}
              height={821}
              quality={72}
              sizes="(max-width: 767px) 100vw, 42vw"
              draggable={false}
              className="select-none"
            />
          </div>
          <figcaption className="eyebrow artwork-caption">
            Around the fire · After the mural in our dining room
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
