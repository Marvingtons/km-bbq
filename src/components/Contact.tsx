import { ScrollReveal } from "./ScrollReveal";
import { SocialLinks } from "./SocialLinks";
import { ContactMap } from "./ContactMap";
import { HOURS, ADDRESS, PHONE, DIRECTIONS_URL } from "@/lib/restaurant";

export function Contact() {
  return (
    <section
      id="contact"
      className="relative bg-cream py-28 px-6"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-ember-deep">
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

        <div className="mx-auto max-w-2xl">
          {/* Info */}
          <div className="space-y-12">
            {/* Hours */}
            <ScrollReveal>
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-5">
                  Hours
                </h3>
                <dl className="space-y-3">
                  {HOURS.map(({ days, time }) => (
                    <div
                      key={days}
                      className="flex items-start justify-between border-b border-paper-line pb-3 font-sans text-sm"
                    >
                      <dt className="text-foreground/70">{days}</dt>
                      <dd className="font-medium text-foreground">{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </ScrollReveal>

            {/* Address */}
            <ScrollReveal delay={0.05}>
              <div>
                <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-4">
                  Location
                </h3>
                {/* Both lines are live: the address opens maps, the number
                    dials. On a phone these are the two things anyone is here
                    for, so neither should be plain text. */}
                <address className="not-italic font-sans text-sm font-light leading-relaxed text-foreground/70">
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

                {/* Socials */}
                <SocialLinks tone="light" className="mt-6" />
              </div>
            </ScrollReveal>

            {/* Map. A baked static render rather than a Google embed — same
                information, none of the third-party JS or cookies. */}
            <ScrollReveal delay={0.08}>
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-paper-line">
                <ContactMap />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
