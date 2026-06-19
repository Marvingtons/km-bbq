import { ScrollReveal } from "./ScrollReveal";

export function About() {
  return (
    <section
      id="about"
      className="py-28 px-6"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 lg:items-center">
          {/* Left — story text */}
          <div>
            <ScrollReveal>
              <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
                {/* TODO: Replace label */}
                Our Story
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h2
                id="about-heading"
                className="font-serif text-5xl font-light leading-snug text-foreground md:text-6xl"
              >
                {/* TODO: Replace headline */}
                A Tradition{" "}
                <em className="italic text-brand-blue">Born in Fire</em>
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="mt-8 space-y-5 font-sans text-base font-light leading-relaxed text-foreground/70">
                {/* TODO: Replace story paragraphs */}
                <p>
                  KM.BBQ was born from a simple obsession: the perfect bite.
                  Founded in [Year] by [Founder Name], our restaurant brings the
                  warmth of Korean family grilling to every table — live
                  charcoal, hand-trimmed cuts, and banchan made fresh daily.
                </p>
                <p>
                  We source our meats from [local farms / partners], choosing
                  quality over convenience. Every cut is marinated in-house
                  using recipes passed down through generations, balanced with
                  our own modern touches.
                </p>
                <p>
                  This is not fast food. This is slow fire, shared plates, and
                  the kind of meal you remember.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <a
                href="#menu"
                className="mt-10 inline-flex items-center gap-2 font-sans text-sm font-medium text-brand-orange hover:gap-3 transition-all"
              >
                Explore our menu
                <span aria-hidden="true">→</span>
              </a>
            </ScrollReveal>
          </div>

          {/* Right — image placeholder */}
          <ScrollReveal direction="left" delay={0.15}>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-neutral-200">
              {/* TODO: Replace with <Image> of restaurant / chef / ambiance */}
              <div className="flex h-full items-center justify-center">
                <p className="font-sans text-sm text-neutral-400">
                  TODO: About photo (4:5 ratio recommended)
                </p>
              </div>
              {/* Decorative accent */}
              <div
                className="absolute -bottom-4 -right-4 h-32 w-32 rounded-sm border border-brand-orange/30"
                aria-hidden="true"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
