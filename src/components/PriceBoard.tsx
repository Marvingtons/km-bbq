import Link from "next/link";
import { Reveal } from "./Reveal";

const INCLUDED = [
  "Fresh veggies & wraps",
  "Banchan",
  "House dipping sauces",
  "Free drink refills",
  "Free ice cream",
];

export function PriceBoard() {
  return (
    <section className="border-y-2 border-brand-ink bg-brand-ink text-brand-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-brand-yellow">
              The deal
            </p>
            <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl">
              One price.
              <br />
              <span className="text-brand-orange">Zero math.</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-brand-cream/75">
              Every cut, every side, every round is covered by one per-person
              price. No per-plate charges, no upsells — premium and signature
              cuts included.
            </p>
            <ul className="mt-7 flex flex-wrap gap-3" role="list">
              {INCLUDED.map((item) => (
                <li
                  key={item}
                  className="rounded-full border-2 border-brand-cream/30 px-4 py-1.5 font-display text-sm font-bold uppercase tracking-wide text-brand-cream/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex flex-col gap-6 sm:flex-row lg:justify-end">
              <div className="-rotate-2 flex-1 rounded-2xl border-2 border-brand-ink bg-brand-yellow p-7 text-brand-ink shadow-[6px_6px_0_#f18b23] sm:max-w-56">
                <p className="font-display text-sm font-bold uppercase tracking-[0.2em]">
                  Lunch
                </p>
                <p className="mt-1 font-display text-5xl font-extrabold tracking-tight">
                  $22.99
                </p>
                <p className="mt-2 text-sm font-medium text-brand-ink/70">
                  per person
                </p>
              </div>
              <div className="rotate-1 flex-1 rounded-2xl border-2 border-brand-ink bg-brand-orange p-7 text-brand-ink shadow-[6px_6px_0_#f7c948] sm:max-w-56 sm:translate-y-6">
                <p className="font-display text-sm font-bold uppercase tracking-[0.2em]">
                  Dinner
                </p>
                <p className="mt-1 font-display text-5xl font-extrabold tracking-tight">
                  $29.99
                </p>
                <p className="mt-2 text-sm font-medium text-brand-ink/70">
                  per person
                </p>
              </div>
            </div>
            <p className="mt-10 text-sm text-brand-cream/70 lg:text-right">
              Walk-in only — no reservations.{" "}
              <Link
                href="/menu"
                className="font-bold text-brand-yellow underline underline-offset-4 transition-colors hover:text-brand-orange"
              >
                See everything included →
              </Link>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
