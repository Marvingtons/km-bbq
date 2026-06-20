import { ScrollReveal } from "./ScrollReveal";

export function About() {
  return (
    <section
      id="about"
      className="py-32 px-6"
      aria-labelledby="about-heading"
      style={{
        backgroundImage: "url('/images/korea-bbq-mural.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="mx-auto max-w-7xl flex justify-center">
        {/* Radial glow keeps text readable if doodles encroach on smaller screens */}
        <div
          className="max-w-2xl w-full text-center px-6 py-12 sm:px-12"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(250,244,236,0.82) 45%, rgba(250,244,236,0.45) 70%, transparent 100%)",
          }}
        >
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
              Our Story
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="about-heading"
              className="font-serif text-5xl font-light leading-snug text-foreground md:text-6xl"
            >
              A Tradition{" "}
              <em className="italic text-brand-blue">Born in Fire</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="mt-8 space-y-5 font-sans text-base font-light leading-relaxed text-foreground/80">
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
      </div>
    </section>
  );
}
