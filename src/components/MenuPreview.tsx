import Image from "next/image";
import { ScrollReveal } from "./ScrollReveal";

interface Dish {
  name: string;
  korean: string;
  description: string;
  price: string;
  image: string;
  tag?: string;
}

const FEATURED_DISHES: Dish[] = [
  {
    name: "Galbi",
    korean: "갈비",
    description:
      "Short ribs marinated in a soy-pear blend, grilled over live charcoal until caramelized.",
    price: "$00",
    image: "/images/galbi.png",
    tag: "Signature",
  },
  {
    name: "Samgyeopsal",
    korean: "삼겹살",
    description:
      "Thick-cut pork belly, crisp-edged and paired with fresh perilla, garlic, and doenjang.",
    price: "$00",
    image: "/images/samgyeopsal.png",
  },
  {
    name: "Chadolbaegi",
    korean: "차돌박이",
    description:
      "Paper-thin brisket slices that cook in seconds — dipped in sesame oil and salt.",
    price: "$00",
    image: "/images/chadolbaegi.png",
    tag: "Chef's Pick",
  },
  {
    name: "Japchae",
    korean: "잡채",
    description:
      "Glass noodles stir-fried with vegetables and beef in a sweet soy sesame sauce.",
    price: "$00",
    image: "/images/japchae.png",
  },
  {
    name: "Bulgogi",
    korean: "불고기",
    description:
      "Tender ribeye in a sesame-ginger marinade — the classic that never disappoints.",
    price: "$00",
    image: "/images/bulgogi.png",
  },
  {
    name: "Kimchi",
    korean: "김치",
    description:
      "House-fermented napa cabbage with gochugaru, garlic, and ginger — bold, smoky, addictive.",
    price: "$00",
    image: "/images/kimchi.png",
    tag: "Spicy",
  },
];

function DishCard({ dish, index }: { dish: Dish; index: number }) {
  return (
    <ScrollReveal delay={index * 0.07} className="group">
      <div className="relative flex flex-col border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
        {dish.tag && (
          <span className="mb-3 inline-block font-sans text-xs font-medium tracking-widest uppercase text-brand-orange">
            {dish.tag}
          </span>
        )}
        <div className="relative mb-4 aspect-[3/2] w-full overflow-hidden bg-neutral-100">
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <h3 className="font-serif text-xl font-light text-foreground">
          {dish.name}
        </h3>
        <p className="font-sans text-sm font-light text-foreground/40">
          {dish.korean}
        </p>
        <p className="mt-2 font-sans text-sm font-light leading-relaxed text-foreground/60">
          {dish.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-sans text-sm font-medium text-brand-blue">
            {dish.price}
          </span>
          <span className="font-sans text-xs text-foreground/40 transition-colors group-hover:text-brand-orange">
            {/* TODO: wire up to menu page */}+
          </span>
        </div>
      </div>
    </ScrollReveal>
  );
}

export function MenuPreview() {
  return (
    <section
      id="menu"
      className="bg-white py-28 px-6"
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
              {/* TODO: section label */}
              Featured Cuts
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="menu-heading"
              className="font-serif text-5xl font-light text-foreground md:text-6xl"
            >
              {/* TODO: heading */}
              The Grill Awaits
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl font-sans text-base font-light text-foreground/60">
              {/* TODO: subline */}A curated selection of our most-loved cuts.
              Each one sourced, marinated, and served with intention.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_DISHES.map((dish, i) => (
            <DishCard key={dish.name} dish={dish} index={i} />
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-14 text-center">
            <a
              href="#"
              className="inline-flex rounded-full border border-brand-blue px-8 py-3 font-sans text-sm font-medium text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
            >
              {/* TODO: link to /menu page */}
              View Full Menu
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
