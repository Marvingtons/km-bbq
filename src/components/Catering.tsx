import { ScrollReveal } from "./ScrollReveal";

export function Catering() {
  return (
    <section
      id="catering"
      className="relative overflow-hidden bg-brand-blue py-28 px-6"
      aria-labelledby="catering-heading"
    >
      {/* Subtle decorative circle */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full border border-white/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full border border-white/10"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl text-center text-white">
        <ScrollReveal>
          <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
            Catering &amp; Events
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2
            id="catering-heading"
            className="font-serif text-5xl font-light leading-snug md:text-6xl"
          >
            {/* TODO: heading copy */}
            Bring the Grill{" "}
            <em className="italic text-brand-pink">to Your Event</em>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-white/70">
            {/* TODO: catering description copy */}
            From intimate dinners to large-scale corporate events, we bring
            live-fire Korean BBQ anywhere. Custom menus, full service, and an
            experience your guests will talk about long after the last ember
            cools.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <ul className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8 font-sans text-sm text-white/60">
            {/* TODO: Replace with actual service highlights */}
            {[
              "Private Dining",
              "Corporate Events",
              "Weddings",
              "Pop-Ups",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-brand-orange" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#contact"
              className="rounded-full bg-brand-orange px-8 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-85"
            >
              Inquire About Catering
            </a>
            <a
              href="#"
              className="rounded-full border border-white/30 px-8 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {/* TODO: link to catering PDF or page */}
              Download Our Package
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
