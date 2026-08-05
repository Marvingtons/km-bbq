"use client";

import { useRef } from "react";
import Image from "next/image";
import { PillLink } from "./PillLink";
import { useReveal } from "@/lib/reveal";
import {
  HOURS,
  ADDRESS,
  PHONE,
  PRICING,
  LUNCH_UNTIL,
  DIRECTIONS_URL,
  RESERVATION_URL,
  WALK_IN_LINE,
} from "@/data/info";

/**
 * VISIT. When we are open, where we are, and what to look for from the parking
 * lot. For a walk-in-only restaurant this is the conversion section, so it now
 * sits ahead of the game rather than behind it.
 *
 * THE GOOGLE MAPS EMBED IS GONE. It shipped Google's own chrome — "Keyboard
 * shortcuts", "Map data ©2026", "Report a map error" — inside our own page, and
 * at the zoom the address needs it labelled Texas Roadhouse, Chili's, Krispy
 * Kreme and a competing Korean BBQ. We were spending a section of the page
 * advertising the neighbours. What replaces it is what a visitor actually
 * wants: the storefront, so they can recognise it, and a Directions link that
 * hands off to the map app they already use.
 *
 * A styled dark static map is logged as NEEDS-ASSETS #4 — a nice-to-have, not
 * a blocker.
 */
/* THE CARDS SIZE TO THEIR CONTENT NOW.
   `h-full` plus `items-stretch` made both cards as tall as the taller one, and
   the taller one is Hours — which grew when it took on the lunch/dinner block.
   Location has four lines and a button, so it was carrying about 90px of empty
   card below its last element: a bordered box with nothing in the bottom third,
   which reads as something failed to load.

   28px of padding rather than 20/28: one value at both breakpoints, tighter at
   desktop than the `sm:p-7` it replaces at the point where the cards are
   narrowest and the slack was most visible. */
const card = "rounded-card border border-sand-3 bg-sand-2 p-7";

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      ref={ref}
      id="contact"
      className="grain relative bg-sand py-section md:py-section-lg"
      aria-labelledby="contact-heading"
    >
      <div className="grid-page gap-y-6">
        {/* The header cadence: eyebrow, heading, rule, copy. Same four beats in
            the same order on every section — see lib/reveal.ts. */}
        <div className="col-text mb-6" data-reveal-group>
          <p className="eyebrow" data-reveal>
            Find us
          </p>
          <h2 id="contact-heading" className="h2-scale mt-4" data-reveal>
            Stop by
          </h2>
          <span
            aria-hidden="true"
            className="mt-5 block h-0.5 w-16 bg-steel"
            data-reveal="rule"
          />
          <p className="copy measure mt-6" data-reveal>
            Walk in whenever we are open. {PRICING.lunch.display} at lunch,{" "}
            {PRICING.dinner.display} at dinner, {PRICING.seatingMinutes} minutes
            at the table.
          </p>
        </div>

        {/* items-start, so each card ends where its content ends. */}
        <div
          className="col-full grid items-start gap-6 md:grid-cols-2"
          data-reveal-group
        >
          <div data-reveal>
            <div className={card}>
              <h3 className="card-title mb-5">Hours</h3>
              <dl className="space-y-3">
                {HOURS.map(({ days, time }) => (
                  <div
                    key={days}
                    className="flex items-start justify-between gap-3 border-b border-sand-3 pb-3 font-sans text-sm last:border-b-0 last:pb-0"
                  >
                    <dt className="text-ash">{days}</dt>
                    {/* The time is the answer; never let it break across lines
                        even when the day range does. */}
                    <dd className="whitespace-nowrap font-semibold text-ink">
                      {time}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* PRICE BELONGS IN THE HOURS CARD, because "when" and "how
                  much" are one question at a walk-in restaurant and the answer
                  changes at four o'clock. Same two-column pattern as the day
                  rows above — label left, the figure right, never wrapping —
                  so it reads as more of the same table rather than as a
                  second component that happens to sit under one.

                  The divider is heavier than the row rules only in that it is
                  the one with space around it: it separates two KINDS of fact,
                  where the rules inside each group separate rows of one kind. */}
              <dl className="mt-5 space-y-3 border-t border-sand-3 pt-5">
                {[PRICING.lunch, PRICING.dinner].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-start justify-between gap-3 font-sans text-sm"
                  >
                    <dt className="text-ash">{s.label}</dt>
                    <dd className="whitespace-nowrap text-ash">
                      <span className="font-semibold text-ink">
                        {s.display}
                      </span>
                      <span className="mx-2 text-sand-3" aria-hidden="true">
                        ·
                      </span>
                      {s === PRICING.lunch
                        ? `until ${LUNCH_UNTIL}`
                        : `after ${LUNCH_UNTIL}`}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* BOTH FACTS, and they are both true. The card said "Walk-in
                  only. No reservations needed." — accurate when it was written,
                  and now the opposite of what the restaurant does. A straight
                  swap to "reservations" would have been the same mistake in the
                  other direction: someone who just wants to turn up still can.
                  One line from data/info.ts, so this cannot drift again. */}
              <p className="mt-5 font-sans text-xs text-ash">{WALK_IN_LINE}</p>
              <a
                href={RESERVATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-2 inline-flex min-h-11 items-center gap-1.5 font-sans text-sm font-semibold text-flame underline-offset-4 transition-colors duration-[var(--dur-base)] ease-house hover:text-ink hover:underline"
              >
                Reserve a table
                <span
                  aria-hidden="true"
                  className="transition-transform duration-[var(--dur-base)] ease-house group-hover:translate-x-0.5"
                >
                  →
                </span>
              </a>
            </div>
          </div>

          <div data-reveal>
            <div className={card}>
              <h3 className="card-title mb-4">Location</h3>
              {/* Both lines are live: the address opens maps, the number dials.
                  On a phone these are the two things anyone is here for. */}
              <address className="copy not-italic">
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block underline-offset-4 transition-colors duration-[var(--dur-base)] ease-house hover:text-ink hover:underline"
                >
                  {ADDRESS.street}
                  <br />
                  {ADDRESS.region}
                </a>
                <br />
                <a
                  href={PHONE.href}
                  className="mt-3 inline-flex min-h-11 items-center font-semibold text-flame underline-offset-4 transition-colors duration-[var(--dur-base)] ease-house hover:text-ink hover:underline"
                >
                  {PHONE.display}
                </a>
              </address>

              {/* THE ACTION SITS WITH THE FACT IT ACTS ON. It used to float
                  below the storefront photograph, a full card away from the
                  address it opens — so the card said where we are and offered
                  no way to go there, and the button said "get directions"
                  with nothing above it to say directions to what.

                  THE SOCIALS ARE GONE FROM HERE, not moved: they are in the
                  footer, which is forty pixels further down the page. Two sets
                  of the same three icons within one screen is not redundancy
                  the reader forgives, it is a second thing to scan. */}
              <div className="mt-6">
                <PillLink href={DIRECTIONS_URL} external arrow tone="outline">
                  Get directions
                </PillLink>
              </div>
            </div>
          </div>
        </div>

        {/* WAYFINDING, and the one place the storefront photo belongs.

            It is a daylight phone snapshot of a strip-mall unit, which is why
            it is not in the gallery. It is also the most useful image on the
            site here: the sign is legible, so a walk-in knows what they are
            looking for. Strip-mall honesty is an asset at the door and a
            liability in a gallery.

            No neighbour is named — nothing in the record establishes who shares
            the plaza, and Law 1 does not bend for a caption. */}
        <div className="col-full" data-reveal-group>
          {/* THE WHOLE FACADE, AND NOTHING CROPPED.

              It was in a 21:9 window with `object-position: 50% 12%` — a number
              arrived at by arithmetic, because the source is 1254x1254 and a
              21:9 window shows 43% of a square image, so the crop had to be
              aimed at the sign and everything else was thrown away. The awning,
              the door and the unit numbers were simply not on the page, and
              those are the things a walk-in is matching against the plaza.

              THE CARD IS THE PHOTOGRAPH'S OWN SHAPE. `aspect-square` is the
              file's real 1:1, so `object-cover` has nothing to cover: the frame
              and the image are the same rectangle and no pixel is discarded.
              `contain` would have been the other way to show it whole and is
              wrong here — it letterboxes, and bars of card ground down the
              sides of a photograph on a cream page read as a broken image
              rather than as a decision.

              THE HEIGHT IS CAPPED AND THE COMPOSITION CENTRED. A square at the
              full 1280 track is 1280px tall, which is a screen and a half of
              storefront on a section that is meant to be a signpost. 72vh, and
              the frame's width follows from the same ratio — so the cap changes
              how big the photograph is, never which part of it you see. */}
          <figure
            className="mx-auto overflow-hidden rounded-card border border-sand-3 bg-sand-2"
            style={{ maxWidth: "min(100%, 72vh)" }}
            data-reveal="image"
          >
            {/* The card is the FIGURE, and the media box inside it deliberately
                does not carry `.photo`: that recipe brings its own radius and
                its own chrome inset hairline, which would double the card's.
                The one thing it does carry — the house grade — is applied to
                the image directly so the treatment still matches every other
                photograph on the site. */}
            <div className="relative aspect-square w-full">
              <Image
                src="/images/outside.png"
                alt="The KM.BBQ storefront: the sign above the entrance, the awning and the door"
                fill
                sizes="(max-width: 768px) 100vw, 72vh"
                className="object-cover [filter:saturate(1.06)_contrast(1.02)_brightness(1.02)]"
              />
            </div>
            {/* The caption is BELOW the photograph now, not on it. A line of
                wayfinding is information, and information on a card belongs on
                the card's ground where it is legible without a chip. */}
            <figcaption className="eyebrow border-t border-sand-3 px-5 py-4">
              In the plaza at {ADDRESS.street}
            </figcaption>
          </figure>
          {/* NOTHING SITS UNDER THE PHOTOGRAPH. The directions button moved
              into the Location card, beside the address it acts on. What is
              left is a card that ends on its own caption, so the section's
              closing edge is the figure's — which is why the bottom margin
              below is on the grid rather than on a trailing element: the
              section has to end deliberately, not run into the footer. */}
        </div>
      </div>
    </section>
  );
}
