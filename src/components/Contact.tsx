import Image from "next/image";
import { ScrollReveal } from "./ScrollReveal";
import { SocialLinks } from "./SocialLinks";
import { PillLink } from "./PillLink";
import { HOURS, ADDRESS, PHONE, PRICING, DIRECTIONS_URL } from "@/data/info";

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
const card = "h-full rounded-card border border-sand-3 bg-sand-2 p-5 sm:p-7";

export function Contact() {
  return (
    <section
      id="contact"
      className="grain relative bg-sand py-section md:py-section-lg"
      aria-labelledby="contact-heading"
    >
      <div className="grid-page gap-y-6">
        <div className="col-text mb-6">
          <ScrollReveal>
            <p className="eyebrow">Find us</p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2 id="contact-heading" className="h2-scale mt-4">
              Stop by
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="copy measure mt-4">
              Walk in whenever we are open. {PRICING.lunch} at lunch,{" "}
              {PRICING.dinner} at dinner, {PRICING.seatingMinutes} minutes at
              the table.
            </p>
          </ScrollReveal>
        </div>

        {/* items-stretch + h-full so the pair shares one height whatever the
            hours table does. */}
        <div className="col-full grid items-stretch gap-6 md:grid-cols-2">
          <ScrollReveal className="h-full">
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
              <p className="mt-5 font-sans text-xs text-ash">
                Walk-in only. No reservations needed.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05} className="h-full">
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
              <SocialLinks tone="light" className="mt-5" />
            </div>
          </ScrollReveal>
        </div>

        {/* WAYFINDING, and the one place the storefront photo belongs.

            It is a daylight phone snapshot of a strip-mall unit, which is why
            it is not in the gallery. It is also the most useful image on the
            site here: the sign is legible, so a walk-in knows what they are
            looking for. Strip-mall honesty is an asset at the door and a
            liability in a gallery.

            No neighbour is named — nothing in the record establishes who shares
            the plaza, and Law 1 does not bend for a caption. */}
        <ScrollReveal delay={0.08} className="col-full">
          <figure className="photo aspect-[16/10] w-full md:aspect-[21/9]">
            <Image
              src="/images/outside.png"
              alt="The KM.BBQ storefront, with the sign above the entrance"
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover"
            />
            {/* The caption sits ON the photograph, so it cannot rely on the
                .photo scrim the way a caption in flow can — the scrim is light
                now and this frame is a bright daylight shot, so ink-on-scrim
                was landing on whatever the picture happened to put there. It
                gets its own sand chip instead: an opaque ground it carries with
                it, which is legible over any part of any photograph and does
                not require the scrim to be doing legibility work. */}
            <figcaption className="absolute inset-x-0 bottom-0 z-nav p-5">
              <span className="eyebrow rounded-pill bg-sand/95 px-3 py-1.5 text-ink">
                Look for the sign
              </span>
            </figcaption>
          </figure>
          <div className="mt-5 flex">
            <PillLink href={DIRECTIONS_URL} external arrow>
              Get directions
            </PillLink>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
