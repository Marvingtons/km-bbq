import { ScrollReveal } from "./ScrollReveal";

interface Dish {
  name: string;
  description: string;
  price: string;
  tag?: string;
}

const FEATURED_DISHES: Dish[] = [
  {
    name: "Wagyu Galbi",
    description:
      "Short ribs marinated in a soy-pear blend, grilled over live charcoal until caramelized.",
    price: "$00",
    tag: "Signature",
  },
  {
    name: "Samgyeopsal",
    description:
      "Thick-cut pork belly, crisp-edged and paired with fresh perilla, garlic, and doenjang.",
    price: "$00",
  },
  {
    name: "Chadolbaegi",
    description:
      "Paper-thin brisket slices that cook in seconds — dipped in sesame oil and salt.",
    price: "$00",
    tag: "Chef's Pick",
  },
  {
    name: "LA Galbi",
    description:
      "Cross-cut flanken ribs in our house marinade, charred on the edges and sweet through.",
    price: "$00",
  },
  {
    name: "Bulgogi",
    description:
      "Tender ribeye in a sesame-ginger marinade — the classic that never disappoints.",
    price: "$00",
  },
  {
    name: "Spicy Pork (Jeyuk)",
    description:
      "Gochujang-marinated pork with onions and green onion — bold, smoky, addictive.",
    price: "$00",
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
        {/* TODO: Replace with <Image> dish photo above content */}
        <div className="mb-4 aspect-[3/2] w-full bg-neutral-100 flex items-center justify-center">
          <span className="font-sans text-xs text-neutral-400">
            TODO: dish photo
          </span>
        </div>
        <h3 className="font-serif text-xl font-light text-foreground">
          {dish.name}
        </h3>
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
