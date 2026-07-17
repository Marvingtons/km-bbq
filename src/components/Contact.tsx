import { ScrollReveal } from "./ScrollReveal";
import { SocialLinks } from "./SocialLinks";
import { HOURS, ADDRESS, PHONE } from "@/lib/restaurant";

export function Contact() {
  return (
    <section
      id="contact"
      className="bg-cream py-28 px-6"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-ember-deep">
              Find Us
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2
              id="contact-heading"
              className="font-serif text-4xl font-light text-foreground md:text-5xl"
            >
              Come to the Table
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
                <address className="not-italic font-sans text-sm font-light leading-relaxed text-foreground/70">
                  {ADDRESS.street}
                  <br />
                  {ADDRESS.region}
                  <br />
                  <a
                    href={PHONE.href}
                    className="mt-2 inline-block font-semibold text-ember-deep hover:underline underline-offset-4"
                  >
                    {PHONE.display}
                  </a>
                </address>

                {/* Socials */}
                <SocialLinks tone="light" className="mt-6" />
              </div>
            </ScrollReveal>

            {/* Map placeholder */}
            <ScrollReveal delay={0.08}>
              <div className="aspect-video w-full overflow-hidden border border-paper-line">
                <iframe
                  title="Map to KM BBQ Oceanside"
                  src="https://www.google.com/maps?q=2216+S+El+Camino+Real+%23108-109,+Oceanside,+CA+92054&output=embed"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
