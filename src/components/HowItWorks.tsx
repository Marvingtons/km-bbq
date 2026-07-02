import Image from "next/image";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    number: "1",
    badge: "bg-brand-blue text-white",
    title: "Load your plate",
    body: "Hit the self-serve line and grab whatever looks good — beef, pork, seafood, veggies, banchan. No ordering, no waiting.",
    image: "/images/freshly-cut-steak.png",
    alt: "Tray of freshly cut steak ready for the grill",
  },
  {
    number: "2",
    badge: "bg-brand-red text-white",
    title: "Grill it yourself",
    body: "Every table has a live charcoal grill. Sear it fast, char it slow — you're the chef, so it comes out exactly how you like it.",
    image: "/images/live-grill.png",
    alt: "Steak, shrimp, and onions cooking over a live charcoal grill",
  },
  {
    number: "3",
    badge: "bg-brand-orange text-brand-ink",
    title: "Go back for more",
    body: "Unlimited rounds until you wave the white napkin. Banchan, dipping sauces, drink refills, and ice cream are all included.",
    image: "/images/banchan-spread.png",
    alt: "Spread of banchan side dishes including kimchi and cucumbers",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 border-b-2 border-brand-ink bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <Reveal>
          <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-brand-red-deep">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-brand-ink sm:text-5xl">
            You&rsquo;re the chef tonight
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 100}>
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-brand-ink bg-brand-cream shadow-[6px_6px_0_#211c18]">
                <div className="relative aspect-[4/3] border-b-2 border-brand-ink">
                  <Image
                    src={step.image}
                    alt={step.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span
                    aria-hidden="true"
                    className={`absolute top-4 left-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-brand-ink font-display text-2xl font-extrabold shadow-[3px_3px_0_#211c18] ${step.badge}`}
                  >
                    {step.number}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight text-brand-ink">
                    <span className="sr-only">Step {step.number}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-brand-ink/75">
                    {step.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
