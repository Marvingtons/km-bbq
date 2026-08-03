import { ScrollReveal } from "./ScrollReveal";
import { SocialLinks } from "./SocialLinks";
import { ContactMap, DirectionsLink } from "./ContactMap";
import { HOURS, ADDRESS, PHONE, DIRECTIONS_URL } from "@/data/info";

// The two things a visitor is here for — when you are open, and where you are —
// sit side by side as a pair of cards rather than as two stacked runs of text in
// a narrow column.
//
// SQUARE, per the radius rule: these hold only type, which makes them
// structural surfaces rather than frames around an image. The photo radius is
// reserved for things that ARE a picture or hold one.
//
// p-5 at 375: at p-7 the card walls left the hours rows ~270px of usable width
// and both the day range and the time wrapped mid-phrase.
const card =
  "h-full rounded-none border border-char-3 bg-char-2/70 p-5 shadow-card sm:p-8";

export function Contact() {
  return (
    <section
      id="contact"
      className="grain relative bg-char py-section md:py-section-lg"
      aria-labelledby="contact-heading"
    >
      <div className="grid-page gap-y-6">
        {/* Eyebrow, heading and body all start at column 1, like every other
            section. The mark sits above them in the same column. */}
        <div className="col-text mb-6">
          <ScrollReveal>
            <p className="eyebrow mb-4">Find us</p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            {/* NOTE: the only h2 on the site with no italic accent word. "Stop
                by" is two function words; emphasising either reads as a typo
                rather than as emphasis, and inventing a third word to italicise
                would be worse than the gap. Left deliberately plain. */}
            <h2 id="contact-heading" className="h2-scale">
              Stop by
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            {/* One sentence. The first half of this line used to name the
                street, which the address block directly beneath it already
                does. */}
            <p className="copy measure mt-4">
              Walk in whenever we are open.
            </p>
          </ScrollReveal>
        </div>

        {/* items-stretch + h-full on the cards so the pair shares one height
            whatever the hours table does. */}
        <div className="col-full grid items-stretch gap-6 md:grid-cols-2">
          <ScrollReveal className="h-full">
            <div className={card}>
              <h3 className="mb-5 font-display text-md font-normal text-bone">
                Hours
              </h3>
              <dl className="space-y-3">
                {HOURS.map(({ days, time }) => (
                  <div
                    key={days}
                    className="flex items-start justify-between gap-3 border-b border-char-3 pb-3 font-sans text-sm last:border-b-0 last:pb-0"
                  >
                    <dt className="font-normal text-bone/70">{days}</dt>
                    {/* The time is the answer; never let it break across
                        lines even when the day range does. */}
                    <dd className="whitespace-nowrap font-medium text-bone">
                      {time}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 font-sans text-xs font-normal text-bone/50">
                Walk-in only. No reservations needed.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05} className="h-full">
            <div className={card}>
              <h3 className="mb-4 font-display text-md font-normal text-bone">
                Location
              </h3>
              {/* Both lines are live: the address opens maps, the number dials.
                  On a phone these are the two things anyone is here for, so
                  neither should be plain text. */}
              <address className="copy not-italic text-bone/70">
                <a
                  href={DIRECTIONS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block underline-offset-4 hover:underline"
                >
                  {ADDRESS.street}
                  <br />
                  {ADDRESS.region}
                </a>
                <br />
                <a
                  href={PHONE.href}
                  className="mt-2 inline-flex min-h-11 items-center font-semibold text-ember underline-offset-4 hover:underline"
                >
                  {PHONE.display}
                </a>
              </address>
              <SocialLinks tone="light" className="mt-5" />
            </div>
          </ScrollReveal>
        </div>

        {/* Map runs the full track, under both cards. An interactive Google
            embed, lazy-loaded so it stays out of the LCP path. SQUARE: it is a
            structural surface, not a photograph. */}
        <ScrollReveal delay={0.08} className="col-full">
          <div className="aspect-[16/10] w-full overflow-hidden rounded-none border border-char-3 shadow-card md:aspect-[21/9]">
            <ContactMap />
          </div>
          {/* Under the map, not floating on it — see DirectionsLink. Aligned to
              the same column edge as the heading, not centred. */}
          <div className="mt-4 flex">
            <DirectionsLink />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
