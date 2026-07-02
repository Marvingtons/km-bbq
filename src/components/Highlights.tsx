import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./Reveal";

const DISHES = [
  {
    name: "Galbi",
    korean: "갈비",
    image: "/images/galbi.png",
    alt: "Marinated bone-in short ribs on a black plate",
  },
  {
    name: "Prime NY Steak",
    korean: "스테이크",
    image: "/images/prime-new-york-steak.png",
    alt: "Prime New York strip steak",
  },
  {
    name: "Spicy Pork Belly",
    korean: "제육볶음",
    image: "/images/spicy-pork-belly.png",
    alt: "Pork belly in gochujang chili marinade",
  },
  {
    name: "Head Shrimp",
    korean: "대하",
    image: "/images/head-shrimp.png",
    alt: "Whole head-on shrimp ready for the grill",
  },
  {
    name: "Marbled Wagyu",
    korean: "와규",
    image: "/images/marbled-wagyu.png",
    alt: "Thinly sliced marbled wagyu beef",
  },
  {
    name: "Corn Cheese",
    korean: "콘치즈",
    image: "/images/corn-cheese.png",
    alt: "Sweet corn baked with melted cheese",
  },
];

export function Highlights() {
  return (
    <section className="scroll-mt-20 bg-brand-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-brand-red-deep">
                Crowd favorites
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-brand-ink sm:text-5xl">
                First trips off <span className="text-brand-blue">the line</span>
              </h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink bg-white px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-brand-ink shadow-[4px_4px_0_#211c18] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#211c18]"
            >
              See the full menu
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {DISHES.map((dish, i) => (
            <li key={dish.name}>
              <Reveal delay={(i % 3) * 100}>
                <figure className="group relative overflow-hidden rounded-2xl border-2 border-brand-ink">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={dish.image}
                      alt={dish.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <figcaption className="absolute bottom-3 left-3 -rotate-1 rounded-lg border-2 border-brand-ink bg-white px-3 py-1.5 shadow-[3px_3px_0_#211c18]">
                    <span className="font-display text-base font-extrabold uppercase tracking-tight text-brand-ink">
                      {dish.name}
                    </span>
                    <span className="ml-2 text-sm font-medium text-brand-ink/60">
                      {dish.korean}
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
