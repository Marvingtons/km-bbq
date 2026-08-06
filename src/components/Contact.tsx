"use client";

import { useRef } from "react";
import Image from "next/image";
import { ADDRESS } from "@/data/info";
import { useReveal } from "@/lib/reveal";

/* ===========================================================================
   THE STOREFRONT. One photograph, one caption, and nothing else.

   THE "STOP BY" CARDS ARE GONE. This section used to carry an Hours card and a
   Location card — hours, both prices, the walk-in line, the reservation link,
   the address, the phone number and a directions button — and every one of
   those facts is now carried somewhere a visitor is more likely to be when
   they want it:

     hours          the footer's HOURS column, the FAQ ("What are your
                    hours?"), and the sticky bar, which is the only one that
                    answers "are you open RIGHT NOW".
     both prices    the hero, the footer's HOURS column, the FAQ, /menu's
                    price band, and the menu's own service toggle.
     reservations   the nav's Reserve pill, the mobile takeover, the footer's
                    VISIT column, the FAQ, and the JSON-LD.
     phone          the nav pill, the footer, the sticky bar's Call.
     directions     the footer, and the sticky bar's Directions.
     address        the footer's VISIT column, and this caption.

   Checked before the deletion, not after. What was left once you take the
   duplicates out is the one thing this section could say that nothing else
   does: what the place looks like from the parking lot.

   IT KEEPS `id="contact"`, because the nav's CONTACT link means "where is it",
   and this is now the whole of that answer on the home page.
   =========================================================================== */

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="contact-heading"
      /* CREAM — the calm between the FAQ's band and the footer's, and the last
         light room on the page.

         Bottom padding only used to be right: a `<SectionDivider />` above
         carried the rest between this and the FAQ. It is gone, so this section
         owns both ends of its own rhythm. */
      className="grain relative bg-sand py-section md:py-section-lg"
    >
      {/* 0.15 — the caption lands a beat after the card it belongs to, which is
          the order a reader takes them in: the photograph, then the line that
          says where it is. The group has exactly two members, so the stagger is
          a two-step cadence rather than a rhythm. */}
      <div className="grid-page" data-reveal-group data-reveal-stagger="0.15">
        {/* The heading is `sr-only`: the photograph and its caption say
            "here is the place" without a label over them, but the section is
            `aria-labelledby` it and the nav lands on it, so it needs a real
            accessible name rather than an unlabelled region. */}
        <h2 id="contact-heading" className="sr-only">
          Find us
        </h2>

        <div className="col-full">
          {/* THE WHOLE FACADE, AND NOTHING CROPPED. The card is the
              photograph's own 1:1 (the file is 1254x1254), so `object-cover`
              has nothing to cover and no pixel is discarded. `contain` would
              letterbox, and bars of card ground down the sides of a photograph
              on a cream page read as a broken image rather than a decision.

              Capped at 72vh and centred: the cap changes how big the
              photograph is, never which part of it you see. */}
          <figure
            className="mx-auto overflow-hidden rounded-card border border-sand-3 bg-sand-2"
            style={{ maxWidth: "min(100%, 72vh)" }}
            data-reveal="image"
          >
            <div className="relative aspect-square w-full">
              <Image
                src="/images/outside.png"
                alt="The KM.BBQ storefront: the sign above the entrance, the awning and the door"
                fill
                sizes="(max-width: 768px) 100vw, 72vh"
                className="object-cover [filter:saturate(1.06)_contrast(1.02)_brightness(1.02)]"
              />
            </div>
            {/* Wayfinding. A line of information belongs on the card's own
                ground where it is legible, not chipped over the picture. */}
            <figcaption
              className="eyebrow border-t border-sand-3 px-5 py-4"
              data-reveal
            >
              In the plaza at {ADDRESS.street}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
