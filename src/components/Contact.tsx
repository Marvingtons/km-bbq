import { ScrollReveal } from "./ScrollReveal";
import { ContactMap } from "./ContactMap";
import { SocialChips } from "./SocialLinks";

const HOURS = [
  { day: "Sunday – Thursday", time: "12:00 PM – 9:30 PM" },
  { day: "Friday – Saturday", time: "12:00 PM – 10:00 PM" },
];

// Reveal as soon as an element's top clears the bottom fifth of the viewport,
// and keep the animation short — fast scrollers were reaching this section
// before the default (later, 0.7s) reveal made the content legible.
const REVEAL = { margin: "0px 0px -20% 0px", duration: 0.45 } as const;

export function Contact() {
  return (
    <section
      id="contact"
      className="bg-cream-deep py-section px-6"
      aria-labelledby="contact-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <ScrollReveal {...REVEAL}>
            <p className="mb-4 transform-gpu font-sans text-xs font-medium tracking-[0.3em] uppercase text-ember-deep">
              Find us
            </p>
          </ScrollReveal>
          <ScrollReveal {...REVEAL} delay={0.05}>
            <h2
              id="contact-heading"
              className="transform-gpu font-serif text-5xl font-light text-foreground md:text-6xl"
            >
              Stop by
            </h2>
          </ScrollReveal>
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Hours + Location share one card grid: matched padding, the locked
              radius and elevation shadow. Stacks on mobile, two-up on desktop. */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hours */}
            <ScrollReveal {...REVEAL}>
              <div className="flex h-full flex-col rounded-card bg-cream p-6 shadow-card transform-gpu">
                <h3 className="mb-5 font-serif text-2xl font-light text-foreground">
                  Hours
                </h3>
                <dl className="space-y-3">
                  {HOURS.map(({ day, time }) => (
                    <div
                      key={day}
                      className="flex items-start justify-between border-b border-ink/10 pb-3 font-sans text-sm"
                    >
                      <dt className="text-warm">{day}</dt>
                      <dd className="font-medium text-foreground">{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </ScrollReveal>

            {/* Location */}
            <ScrollReveal {...REVEAL} delay={0.05}>
              <div className="flex h-full flex-col rounded-card bg-cream p-6 shadow-card transform-gpu">
                <h3 className="mb-4 font-serif text-2xl font-light text-foreground">
                  Location
                </h3>
                <address className="not-italic font-sans text-sm leading-relaxed text-warm">
                  2216 S El Camino Real #108–109
                  <br />
                  Oceanside, CA 92054
                  <br />
                  <a
                    href="tel:+17604331888"
                    className="mt-2 inline-block text-ember-deep underline-offset-4 hover:underline"
                  >
                    (760) 433-1888
                  </a>
                </address>

                {/* Socials — same chip treatment as the footer, in the light
                    tone for the cream card. */}
                <SocialChips
                  tone="light"
                  only={["Instagram", "TikTok"]}
                  className="mt-auto pt-6"
                />
              </div>
            </ScrollReveal>
          </div>

          {/* Map — brand-styled (warm cream/charcoal, ember pin) in its own
              card, sharing the locked radius and shadow. */}
          <ScrollReveal {...REVEAL} delay={0.08}>
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-card border border-ink/10 shadow-card">
              <ContactMap />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
