import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Full Menu — KM.BBQ",
  description:
    "The full KM.BBQ spread — all-you-can-eat, self-serve charcoal Korean BBQ. Beef, pork, chicken, seafood, banchan, and premium cuts, all included in one per-person price.",
};

// ---------------------------------------------------------------------------
// Menu data
// ---------------------------------------------------------------------------

interface Item {
  name: string;
  korean?: string;
  desc: string;
  image?: string;
  note?: string;
}

interface Category {
  name: string;
  korean?: string;
  tag?: string;
  items: Item[];
}

const CATEGORIES: Category[] = [
  {
    name: "Beef",
    korean: "소고기",
    items: [
      {
        name: "Beef Bulgogi",
        korean: "불고기",
        desc: "Thin ribeye in a soy, sesame, and pear marinade — sweet, savory, and quick on the grill.",
        image: "/images/bulgogi.png",
      },
      {
        name: "Teriyaki Beef",
        desc: "Tender beef glazed in a glossy house teriyaki that caramelizes over the coals.",
        image: "/images/teriyaki-beef.png",
      },
      {
        name: "Beef Brisket",
        korean: "차돌박이",
        desc: "Paper-thin brisket that sears in seconds — dip in sesame oil and a pinch of salt.",
        image: "/images/chadolbaegi.png",
      },
    ],
  },
  {
    name: "Pork",
    korean: "돼지고기",
    items: [
      {
        name: "Sliced Pork Belly",
        korean: "삼겹살",
        desc: "Thick-cut pork belly grilled crisp-edged and juicy — wrap it up your way.",
        image: "/images/samgyeopsal.png",
      },
      {
        name: "Pork Chop",
        desc: "Simply seasoned pork, charred over live charcoal for a smoky bite.",
        image: "/images/pork-chop.png",
      },
      {
        name: "Spicy Pork Belly",
        korean: "제육볶음",
        desc: "Pork belly in a gochujang chili marinade — sweet heat with a smoky finish.",
        image: "/images/spicy-pork-belly.png",
      },
    ],
  },
  {
    name: "Chicken",
    korean: "닭고기",
    items: [
      {
        name: "Spicy Chicken",
        korean: "매운 닭",
        desc: "Boneless chicken in a fiery gochujang glaze with a touch of sweetness.",
        image: "/images/spicy-chicken.png",
      },
      {
        name: "Teriyaki Chicken",
        korean: "데리야키 치킨",
        desc: "Sweet-savory teriyaki chicken that grills up golden and tender.",
      },
    ],
  },
  {
    name: "Seafood",
    korean: "해산물",
    items: [
      {
        name: "Shrimp (no head)",
        korean: "새우",
        desc: "Peeled shrimp, quick to grill and ready for the dipping sauce.",
        image: "/images/shrimp-no-head.png",
      },
      {
        name: "Head Shrimp",
        korean: "대하",
        desc: "Whole head-on shrimp grilled in the shell for deeper, sweeter flavor.",
        image: "/images/head-shrimp.png",
      },
      {
        name: "Fresh Fish Fillet",
        korean: "생선",
        desc: "Mild white fish fillet — light and flaky straight off the grill.",
      },
      {
        name: "Spicy Squid",
        korean: "오징어",
        desc: "Tender squid tossed in a spicy chili marinade with a smoky char.",
      },
      {
        name: "Spicy Octopus",
        korean: "문어",
        desc: "Octopus in a bold chili marinade — tender with a smoky, spicy kick.",
        image: "/images/spicy-octopus.png",
      },
    ],
  },
  {
    name: "Rice, Noodles & More",
    items: [
      {
        name: "Hot Dog",
        desc: "A grill-friendly favorite the whole table reaches for.",
        image: "/images/hot-dog.png",
      },
      {
        name: "Kimchi Fried Rice",
        korean: "김치볶음밥",
        desc: "Rice fried with house kimchi for a savory, tangy kick.",
        image: "/images/kimchi-fried-rice.png",
      },
      {
        name: "Japchae",
        korean: "잡채",
        desc: "Glass noodles stir-fried with vegetables in sweet sesame soy.",
        image: "/images/japchae.png",
      },
      {
        name: "Fried Pot Stickers",
        korean: "만두",
        desc: "Crisp pan-fried dumplings with a savory, juicy filling.",
        image: "/images/fried-pot-stickers.png",
      },
    ],
  },
  {
    name: "Vegetables",
    korean: "야채",
    items: [
      {
        name: "Pumpkin",
        korean: "호박",
        desc: "Sweet slices that caramelize beautifully over charcoal.",
        image: "/images/pumpkin.png",
      },
      {
        name: "Squash",
        desc: "Tender squash, lightly charred and naturally sweet.",
        image: "/images/squash.png",
      },
      {
        name: "Mushroom",
        korean: "버섯",
        desc: "Assorted mushrooms that soak up the smoke as they grill.",
        image: "/images/mushroom.png",
      },
      {
        name: "Onion Ring",
        korean: "양파",
        desc: "Sweet onions that turn golden and jammy on the grill.",
        image: "/images/onion.png",
      },
      {
        name: "Garlic Broccoli",
        desc: "Crisp-tender broccoli tossed with savory garlic.",
        image: "/images/garlic-broccoli.png",
      },
      {
        name: "Salt Beansprout",
        korean: "콩나물",
        desc: "Crisp seasoned bean sprouts — a cool, clean side.",
        image: "/images/salt-beansprout.png",
      },
    ],
  },
  {
    name: "Banchan & Sides",
    korean: "반찬",
    tag: "Included",
    items: [
      {
        name: "Lettuce Salad",
        korean: "샐러드",
        desc: "Fresh greens in a light, tangy dressing.",
        image: "/images/lettuce-salad.png",
      },
      {
        name: "Kimchi",
        korean: "김치",
        desc: "House-fermented napa cabbage — bold, tangy, and a little spicy.",
        image: "/images/kimchi.png",
      },
      {
        name: "Radish",
        korean: "단무지",
        desc: "Crunchy pickled radish, bright and refreshing.",
        image: "/images/radish.png",
      },
      {
        name: "Spicy Cucumber",
        korean: "오이무침",
        desc: "Cucumbers in a cool, spicy sesame dressing.",
        image: "/images/spicy-cucumber.png",
      },
      {
        name: "Potato Salad",
        korean: "감자 샐러드",
        desc: "Creamy Korean-style potato salad.",
        image: "/images/potato-salad.png",
      },
      {
        name: "Fishcake",
        korean: "어묵",
        desc: "Savory stir-fried fish cake in a light sauce.",
      },
      {
        name: "Steamed Egg",
        korean: "계란찜",
        desc: "Silky, fluffy steamed egg custard.",
        image: "/images/steamed-egg.png",
      },
      {
        name: "Plain Rice",
        korean: "밥",
        desc: "Warm steamed white rice — the perfect base.",
        image: "/images/plain-rice.png",
      },
    ],
  },
  {
    name: "Dessert",
    korean: "디저트",
    tag: "Free",
    items: [
      {
        name: "Sesame Ball",
        korean: "참깨볼",
        desc: "Chewy fried dough rolled in toasted sesame seeds.",
        image: "/images/sesame-balls.png",
      },
      {
        name: "Fried Doughnuts",
        desc: "Warm, golden doughnuts dusted with sugar.",
        image: "/images/fried-doughnuts.png",
      },
      {
        name: "Ice Cream",
        desc: "A cold, sweet finish — self-serve and unlimited.",
        image: "/images/ice-cream.png",
      },
    ],
  },
];

const PREMIUM: Item[] = [
  {
    name: "Beef Short Ribs",
    korean: "갈비",
    desc: "Marinated bone-in short ribs, rich and caramelized.",
    image: "/images/galbi.png",
  },
  {
    name: "Beef Finger Meat",
    desc: "Prized meat from between the ribs — deeply beefy and tender.",
    image: "/images/beef-finger-meat.png",
  },
  {
    name: "Freshly Cut Steak",
    desc: "House-cut steak, fresh and grill-ready.",
    image: "/images/freshly-cut-steak.png",
  },
  { name: "Lamb", desc: "Tender lamb with a savory, aromatic char." },
  {
    name: "Marinated Chef Beef",
    desc: "The chef's signature beef in a house marinade.",
    image: "/images/marinated-chef-beef.png",
  },
  {
    name: "Marinated Pork Belly",
    desc: "Pork belly soaked in a savory house marinade.",
  },
  {
    name: "Beef Skirt Steak",
    desc: "Richly marbled skirt steak that chars beautifully.",
  },
  {
    name: "Mussels",
    desc: "Plump mussels grilled in the shell.",
    image: "/images/mussels.png",
  },
  { name: "Popcorn Chicken", desc: "Crispy, bite-size fried chicken." },
  {
    name: "Corn Cheese",
    desc: "Sweet corn baked with melty, bubbling cheese.",
    image: "/images/corn-cheese.png",
  },
];

const SIGNATURE: Item[] = [
  {
    name: "Prime New York Steak",
    desc: "Prime-grade New York strip — full-flavored and tender.",
    image: "/images/prime-new-york-steak.png",
  },
  { name: "Prime Cut Steak", desc: "A premium prime cut, marbled and juicy." },
  { name: "Beef Roll", desc: "Thin beef rolled around a savory filling." },
  {
    name: "Beef Tongue",
    korean: "우설",
    desc: "Delicately sliced beef tongue — a grilling delicacy.",
    image: "/images/beef-tongue.png",
  },
  {
    name: "Sliced Beef Short Plate",
    desc: "Thinly sliced short plate, quick-searing and rich.",
  },
  {
    name: "Lamb Chop",
    desc: "Bone-in lamb chop, juicy and aromatic off the charcoal.",
    note: "Limit 2 per person",
  },
  {
    name: "Butter Garlic Jumbo Shrimp",
    desc: "Jumbo shrimp in rich butter and roasted garlic.",
    image: "/images/butter-garlic-jumbo-shrimp.png",
  },
  {
    name: "Miso Garlic Jumbo Shrimp",
    desc: "Jumbo shrimp glazed with savory miso and garlic.",
  },
];

const INCLUDED = [
  "Fresh veggies & wraps",
  "Banchan included",
  "House dipping sauces",
  "Free drink refills",
  "Free ice cream",
];

const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

// ---------------------------------------------------------------------------
// Presentational pieces
// ---------------------------------------------------------------------------

function ItemMedia({ item }: { item: Item }) {
  if (item.image) {
    return (
      <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden bg-neutral-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes={IMAGE_SIZES}
        />
      </div>
    );
  }

  // Tasteful placeholder: a soft cream gradient with the dish's serif initial,
  // so cards without a photo still read as intentional rather than broken.
  return (
    <div
      aria-hidden="true"
      className="mb-4 flex aspect-[16/9] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#f3ebdd] to-[#e7dac3]"
    >
      <span className="font-serif text-5xl font-light text-[#c8b692] select-none">
        {item.name.charAt(0)}
      </span>
    </div>
  );
}

function ItemCard({
  item,
  variant = "default",
}: {
  item: Item;
  variant?: "default" | "premium" | "signature";
}) {
  const accent =
    variant === "premium"
      ? "border-brand-orange/30 bg-white"
      : variant === "signature"
        ? "border-brand-blue/30 bg-white"
        : "border-neutral-200 bg-white";

  const topBar =
    variant === "premium"
      ? "bg-brand-orange"
      : variant === "signature"
        ? "bg-brand-blue"
        : null;

  return (
    <div className="group h-full">
      <div
        className={`relative flex h-full flex-col border ${accent} p-5 transition-shadow hover:shadow-md`}
      >
        {topBar && (
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 top-0 h-0.5 ${topBar}`}
          />
        )}
        <ItemMedia item={item} />
        <h3 className="font-serif text-xl font-light text-foreground">
          {item.name}
        </h3>
        {item.korean && (
          <p className="font-sans text-sm font-light text-foreground/40">
            {item.korean}
          </p>
        )}
        <p className="mt-2 font-sans text-sm font-light leading-relaxed text-foreground/60">
          {item.desc}
        </p>
        {item.note && (
          <p className="mt-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-brand-red">
            {item.note}
          </p>
        )}
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: Category }) {
  return (
    <section className="mt-16 first:mt-0">
      <div className="mb-7 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-[#e4d9c4] pb-4">
        <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
          {category.name}
        </h2>
        {category.korean && (
          <span className="font-sans text-base font-light text-foreground/40">
            {category.korean}
          </span>
        )}
        {category.tag && (
          <span className="ml-auto font-sans text-xs font-medium uppercase tracking-[0.2em] text-brand-orange">
            {category.tag}
          </span>
        )}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <ItemCard key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}

function TierSection({
  label,
  title,
  korean,
  blurb,
  items,
  variant,
}: {
  label: string;
  title: string;
  korean?: string;
  blurb: string;
  items: Item[];
  variant: "premium" | "signature";
}) {
  const shell =
    variant === "premium"
      ? "border-brand-orange/25 bg-[#fbf6ee]"
      : "border-brand-blue/20 bg-[#f2f4fc]";
  const labelColor =
    variant === "premium" ? "text-brand-orange" : "text-brand-blue";

  return (
    <section className={`mt-12 rounded-2xl border ${shell} p-6 sm:p-10`}>
      <div className="mb-8 text-center">
        <p
          className={`mb-3 font-sans text-xs font-semibold uppercase tracking-[0.3em] ${labelColor}`}
        >
          {label}
        </p>
        <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
          {title}
          {korean && (
            <span className="ml-3 align-middle font-sans text-base font-light text-foreground/40">
              {korean}
            </span>
          )}
        </h2>
        <p className="mx-auto mt-3 max-w-xl font-sans text-sm font-light text-foreground/60">
          {blurb}
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.name} item={item} variant={variant} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main className="bg-brand-cream">
        {/* Header */}
        <section className="px-6 pt-32 pb-12 sm:pt-36 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-brand-orange">
              All-You-Can-Eat · Self-Serve · Charcoal
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight text-foreground sm:text-6xl">
              The Full <em className="italic text-brand-blue">Spread</em>
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-foreground/60">
              Pick whatever you like, grill it your way over live charcoal, and
              eat all you want. One price, everything included.
            </p>

            {/* Price band */}
            <div className="mx-auto mt-9 inline-flex items-stretch rounded-2xl border border-[#e4d9c4] bg-white shadow-[0_8px_30px_-18px_rgba(26,26,26,0.45)]">
              <div className="px-8 py-5 text-center sm:px-12">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/45">
                  Lunch
                </p>
                <p className="mt-1 font-serif text-3xl font-light text-brand-red sm:text-4xl">
                  $22.99
                </p>
                <p className="mt-1 font-sans text-xs font-light text-foreground/40">
                  per person
                </p>
              </div>
              <div aria-hidden="true" className="w-px bg-[#e4d9c4]" />
              <div className="px-8 py-5 text-center sm:px-12">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/45">
                  Dinner
                </p>
                <p className="mt-1 font-serif text-3xl font-light text-brand-red sm:text-4xl">
                  $29.99
                </p>
                <p className="mt-1 font-sans text-xs font-light text-foreground/40">
                  per person
                </p>
              </div>
            </div>

            <p className="mt-6 font-sans text-sm font-light text-foreground/50">
              Walk-in only · No reservations needed
            </p>
          </div>
        </section>

        {/* Included strip — hairline dividers, no box */}
        <section className="px-6 pb-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-foreground/40">
              Included with every meal
            </p>
            <ul
              className="flex flex-wrap items-center justify-center"
              role="list"
            >
              {INCLUDED.map((label, i) => (
                <li
                  key={label}
                  className={`px-5 py-1 font-sans text-sm font-light text-[#5a5550] ${
                    i < INCLUDED.length - 1
                      ? "border-r border-[#ddd2bf]"
                      : ""
                  }`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Categories */}
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
          <p className="mb-10 text-center font-serif text-lg font-light italic text-foreground/55">
            Everything is included in the all-you-can-eat price — no per-item
            charges.
          </p>

          {CATEGORIES.map((category) => (
            <CategorySection key={category.name} category={category} />
          ))}

          {/* Upgraded tiers */}
          <TierSection
            label="Premium"
            title="Premium Selection"
            blurb="A step up in cut and indulgence — included for everyone at the table."
            items={PREMIUM}
            variant="premium"
          />
          <TierSection
            label="Signature"
            title="Signature Selection"
            blurb="Our finest cuts and specialties — the very best of the spread."
            items={SIGNATURE}
            variant="signature"
          />
        </div>

        {/* Info band */}
        <section className="bg-[#f3ebdd] px-6 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="font-serif text-4xl font-light text-foreground md:text-5xl">
              Come Hungry
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                  Hours
                </h3>
                <p className="mt-4 font-sans text-sm font-light leading-relaxed text-foreground/70">
                  Sun–Thu 12:00 PM – 9:30 PM
                  <br />
                  Fri–Sat 12:00 PM – 10:00 PM
                </p>
              </div>
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                  Location
                </h3>
                <p className="mt-4 font-sans text-sm font-light leading-relaxed text-foreground/70">
                  2216 S El Camino Real #108–109
                  <br />
                  Oceanside, CA 92054
                </p>
              </div>
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                  Walk-In
                </h3>
                <p className="mt-4 font-sans text-sm font-light leading-relaxed text-foreground/70">
                  No reservations
                  <br />
                  <a
                    href="tel:+17604331888"
                    className="font-medium text-brand-blue transition-colors hover:text-brand-orange"
                  >
                    (760) 433-1888
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
