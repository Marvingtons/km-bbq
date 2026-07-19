import { ScrollReveal } from "./ScrollReveal";
import { SocialLinks } from "./SocialLinks";
import { ContactMap } from "./ContactMap";
import { HOURS, ADDRESS, PHONE, DIRECTIONS_URL } from "@/lib/restaurant";

// The two things a visitor is here for — when you are open, and where you are —
// sit side by side as a pair of cards rather than as two stacked runs of text in
// a narrow column. The card treatment is the site's own: paper-line hairline,
// warm shadow, same radius as the map below.
// p-5 at 375: at p-7 the card walls left the hours rows ~270px of usable width
// and both the day range and the time wrapped mid-phrase.
const card =
  "h-full rounded-2xl border border-paper-line bg-white/70 p-5 shadow-warm sm:p-8";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative bg-cream px-6 py-24"
      aria-labelledby="contact-heading"
    >
      {/* max-w-5xl, not 7xl: wide enough for the card pair and the map to feel
          like one composition, narrow enough that neither is adrift in cream. */}
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
              Find us
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2
              id="contact-heading"
              className="font-serif text-4xl font-light text-foreground md:text-5xl"
            >
              Stop by
            </h2>
          </ScrollReveal>
        </div>

        {/* items-stretch + h-full on the cards so the pair shares one height
            whatever the hours table does. */}
        <div className="grid items-stretch gap-6 md:grid-cols-2">
          <ScrollReveal className="h-full">
            <div className={card}>
              <h3 className="mb-5 font-serif text-2xl font-light text-foreground">
                Hours
              </h3>
              <dl className="space-y-3">
                {HOURS.map(({ days, time }) => (
                  <div
                    key={days}
                    className="flex items-start justify-between gap-3 border-b border-paper-line pb-3 font-sans text-sm last:border-b-0 last:pb-0"
                  >
                    <dt className="text-foreground/70">{days}</dt>
                    {/* The time is the answer; never let it break across
                        lines even when the day range does. */}
                    <dd className="whitespace-nowrap font-medium text-foreground">
                      {time}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 font-sans text-xs font-light text-foreground/50">
                Walk-in only. No reservations needed.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.05} className="h-full">
            <div className={card}>
              <h3 className="mb-4 font-serif text-2xl font-light text-foreground">
                Location
              </h3>
              {/* Both lines are live: the address opens maps, the number dials.
                  On a phone these are the two things anyone is here for, so
                  neither should be plain text. */}
              <address className="font-sans text-sm font-light not-italic leading-relaxed text-foreground/70">
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
                  className="mt-2 inline-flex min-h-11 items-center font-semibold text-ember-deep underline-offset-4 hover:underline"
                >
                  {PHONE.display}
                </a>
              </address>
              <SocialLinks tone="light" className="mt-5" />
            </div>
          </ScrollReveal>
        </div>

        {/* Map runs the full width of the section container, under both cards.
            An interactive Google embed, lazy-loaded so it stays out of the LCP
            path. The card radius is clipped by the wrapper's overflow-hidden,
            so the iframe inherits the system shape. */}
        <ScrollReveal delay={0.08}>
          <div className="mt-6 aspect-[16/10] w-full overflow-hidden rounded-2xl border border-paper-line shadow-warm md:aspect-[21/9]">
            <ContactMap />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
