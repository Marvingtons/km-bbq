import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MenuJumpNav, type JumpTarget } from "@/components/MenuJumpNav";
import { SeamMotion } from "@/components/SeamMotion";
import { SeamThread } from "@/components/SeamThread";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Menu | KM.BBQ",
  description:
    "The full KM.BBQ menu. All-you-can-eat, self-serve Korean BBQ over live charcoal, with beef, pork, chicken, seafood, banchan, and premium cuts all included in one per-person price.",
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
  /** Short label for the jump nav; defaults to `name`. */
  navLabel?: string;
}

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const CATEGORIES: Category[] = [
  {
    name: "Beef",
    korean: "소고기",
    items: [
      {
        name: "Beef Bulgogi",
        korean: "불고기",
        desc: "Thin ribeye in a soy, sesame, and pear marinade. Sweet, savory, and fast on the grill.",
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
        desc: "Paper-thin brisket that sears in seconds. Dip it in sesame oil and a pinch of salt.",
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
        desc: "Thick-cut pork belly, grilled crisp and juicy. Wrap it up your way.",
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
        desc: "Pork belly in a gochujang chili marinade. Sweet heat with a smoky finish.",
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
        image: "/images/teriyaki-chicken.png",
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
        desc: "Mild white fish fillet, light and flaky straight off the grill.",
        image: "/images/fresh-fish-fillet.png",
      },
      {
        name: "Spicy Squid",
        korean: "오징어",
        desc: "Tender squid tossed in a spicy chili marinade with a smoky char.",
        // Stand-in until a squid shot exists: the spicy-octopus photo is the
        // same gochujang-coated cephalopod presentation. Swap when shot.
        image: "/images/spicy-octopus.png",
      },
    ],
  },
  {
    name: "Rice, Noodles & More",
    navLabel: "Rice & More",
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
        desc: "Crisp seasoned bean sprouts. A cool, clean side.",
        image: "/images/salt-beansprout.png",
      },
    ],
  },
  {
    name: "Banchan & Sides",
    korean: "반찬",
    tag: "Included",
    navLabel: "Banchan",
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
        desc: "House-fermented napa cabbage. Tangy and a little spicy.",
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
        image: "/images/fishcake.png",
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
        desc: "Warm steamed white rice. The perfect base.",
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
        desc: "A cold, sweet finish. Self-serve and unlimited.",
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
    desc: "Prized meat from between the ribs. Deeply beefy and tender.",
    image: "/images/beef-finger-meat.png",
  },
  {
    name: "Freshly Cut Steak",
    desc: "House-cut steak, fresh and grill-ready.",
    image: "/images/freshly-cut-steak.png",
  },
  {
    name: "Lamb",
    desc: "Tender lamb with a savory, aromatic char.",
    image: "/images/lamb.png",
  },
  {
    name: "Marinated Chef Beef",
    desc: "The chef's signature beef in a house marinade.",
    image: "/images/marinated-chef-beef.png",
  },
  {
    name: "Marinated Pork Belly",
    desc: "Pork belly soaked in a savory house marinade.",
    image: "/images/marinated-pork-belly.png",
  },
  {
    name: "Beef Skirt Steak",
    desc: "Richly marbled skirt steak that chars beautifully.",
    // Stand-in until a skirt-steak shot exists: prime-new-york-steak is the
    // same raw, marbled-beef presentation. Swap when shot.
    image: "/images/prime-new-york-steak.png",
  },
  {
    name: "Mussels",
    desc: "Plump mussels grilled in the shell.",
    image: "/images/mussels.png",
  },
  {
    name: "Popcorn Chicken",
    desc: "Crispy, bite-size fried chicken.",
    image: "/images/popcorn-chicken.png",
  },
  {
    name: "Corn Cheese",
    desc: "Sweet corn baked with melty, bubbling cheese.",
    image: "/images/corn-cheese.png",
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

// Every item carries its expected image path (see MISSING_IMAGES.md), but a
// photo may not have been shot yet. Resolve against public/ at render time so
// an absent file gets the lettered placeholder instead of a broken <img>.
const imageExists = (image: string) =>
  fs.existsSync(path.join(process.cwd(), "public", image));

// ---------------------------------------------------------------------------
// Presentational pieces
// ---------------------------------------------------------------------------

function ItemMedia({ item }: { item: Item }) {
  if (item.image && imageExists(item.image)) {
    return (
      <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-card bg-cream-deep">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          sizes={IMAGE_SIZES}
        />
      </div>
    );
  }

  // Branded fallback: a warm cream tile with a faint ember wash, the KM.BBQ
  // flame glyph, and the wordmark — so a dish still awaiting a photo reads as an
  // intentional, on-brand card rather than an empty/missing slot.
  return (
    <div
      aria-hidden="true"
      className="mb-4 flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-card bg-cream-deep"
      style={{
        backgroundImage:
          "radial-gradient(80% 90% at 50% 20%, color-mix(in srgb, var(--color-ember) 12%, transparent) 0%, transparent 70%)",
      }}
    >
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-ember/70"
      >
        <path d="M12 2c.4 3.1-1.6 4.6-3 6.2C7.4 9.9 6 11.6 6 14a6 6 0 0 0 12 0c0-1.8-.8-3.3-1.8-4.6-.3 1-.9 1.7-1.8 2C15 9 14.4 6.3 12 2Zm0 17.5A2.6 2.6 0 0 1 9.4 17c0-1.2.8-2 1.5-2.8.3.6.8 1 1.5 1.2.7-.3 1-.8 1.1-1.5.8.8 1.2 1.6 1.2 2.6a2.6 2.6 0 0 1-2.7 3Z" />
      </svg>
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-warm-muted select-none">
        KM<span className="text-ember/70">·</span>BBQ
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
      ? "border-ember/30 bg-cream"
      : variant === "signature"
        ? "border-ember/30 bg-cream"
        : "border-ink/10 bg-cream";

  const topBar =
    variant === "premium"
      ? "bg-ember"
      : variant === "signature"
        ? "bg-ember"
        : null;

  return (
    <div className="group h-full">
      {/* transform-gpu: promotes the whole card to its own compositing layer so
          its text rasterizes with uniform grayscale AA. Without it, the light
          warm-gray body copy picks up blue/red subpixel-AA fringing on Windows
          (ClearType), which reads as a multi-color tint / rendering bug. Same
          fix as the "The Grill Awaits" subtitle in About. */}
      <div
        className={`relative flex h-full flex-col overflow-hidden rounded-card border ${accent} p-5 transition-[transform,box-shadow] duration-300 transform-gpu hover:-translate-y-1 hover:border-ember/40 hover:shadow-card`}
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
          <p className="font-sans text-sm font-light text-warm-muted">
            {item.korean}
          </p>
        )}
        <p className="mt-2 font-sans text-sm font-light leading-relaxed text-warm">
          {item.desc}
        </p>
        {item.note && (
          <p className="mt-3 font-sans text-xs font-medium uppercase tracking-[0.12em] text-ember-deep">
            {item.note}
          </p>
        )}
      </div>
    </div>
  );
}

function CategorySection({ category }: { category: Category }) {
  return (
    <section id={slugify(category.name)} className="mt-16 scroll-mt-32 first:mt-0">
      <ScrollReveal>
        <div className="mb-7 flex transform-gpu flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-ink/10 pb-4">
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            {category.name}
          </h2>
          {category.korean && (
            <span className="font-sans text-base font-light text-warm-muted">
              {category.korean}
            </span>
          )}
          {category.tag && (
            <span className="ml-auto font-sans text-xs font-medium uppercase tracking-[0.2em] text-ember-deep">
              {category.tag}
            </span>
          )}
        </div>
      </ScrollReveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item, i) => (
          <ScrollReveal key={item.name} className="h-full" delay={(i % 6) * 0.06}>
            <ItemCard item={item} />
          </ScrollReveal>
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
      ? "border-ember/25 bg-cream"
      : "border-ember/20 bg-cream";
  // ember-deep, not ember: this is small uppercase label text on cream, where
  // plain ember only reaches 3.19:1 (below AA for normal text).
  const labelColor = "text-ember-deep";

  return (
    <section
      id={variant}
      className={`mt-12 scroll-mt-32 rounded-card border ${shell} p-6 sm:p-10`}
    >
      <ScrollReveal>
        <div className="mb-8 transform-gpu text-center">
          <p
            className={`mb-3 font-sans text-xs font-semibold uppercase tracking-[0.3em] ${labelColor}`}
          >
            {label}
          </p>
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            {title}
            {korean && (
              <span className="ml-3 align-middle font-sans text-base font-light text-warm-muted">
                {korean}
              </span>
            )}
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-sans text-sm font-light text-warm">
            {blurb}
          </p>
        </div>
      </ScrollReveal>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <ScrollReveal key={item.name} className="h-full" delay={(i % 6) * 0.06}>
            <ItemCard item={item} variant={variant} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const JUMP_TARGETS: JumpTarget[] = [
  ...CATEGORIES.map((c) => ({
    label: c.navLabel ?? c.name,
    id: slugify(c.name),
  })),
  { label: "Premium", id: "premium" },
];

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main className="bg-cream">
        {/* Header */}
        <section className="px-6 pt-32 pb-12 sm:pt-36 lg:pt-40">
          {/* transform-gpu: promote the header copy to its own compositing
              layer so it rasterizes with uniform grayscale AA. Without it the
              light warm-gray text picks up red/blue subpixel (ClearType)
              fringing on Windows that reads as a multi-color tint. */}
          <div className="mx-auto max-w-3xl text-center transform-gpu">
            <p className="mb-5 font-sans text-xs font-semibold uppercase tracking-[0.3em] text-ember-deep">
              All-You-Can-Eat · Self-Serve · Charcoal
            </p>
            <h1 className="font-serif text-5xl font-light leading-tight text-foreground sm:text-6xl">
              The Full <em className="italic text-ember">Spread</em>
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-warm">
              Pick whatever you like, grill it your way over live charcoal, and
              eat all you want. One price, everything included.
            </p>

            {/* Price band — full-width and evenly split on phones so the third
                cell never runs past the viewport edge; the compact inline pill
                returns from sm up. */}
            <div className="mx-auto mt-9 flex w-full max-w-md items-stretch rounded-card border border-ink/10 bg-cream shadow-card sm:inline-flex sm:w-auto sm:max-w-none">
              <div className="flex-1 px-3 py-5 text-center sm:flex-none sm:px-10">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-warm-muted">
                  Lunch
                </p>
                <p className="mt-1 font-serif text-2xl font-light text-ember sm:text-4xl">
                  $21.99
                </p>
                <p className="mt-1 font-sans text-xs font-light text-warm-muted">
                  per person
                </p>
              </div>
              <div aria-hidden="true" className="w-px bg-ink/10" />
              <div className="flex-1 px-3 py-5 text-center sm:flex-none sm:px-10">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-warm-muted">
                  Dinner
                </p>
                <p className="mt-1 font-serif text-2xl font-light text-ember sm:text-4xl">
                  $30.99
                </p>
                <p className="mt-1 font-sans text-xs font-light text-warm-muted">
                  per person
                </p>
              </div>
              <div aria-hidden="true" className="w-px bg-ink/10" />
              <div className="flex-1 px-3 py-5 text-center sm:flex-none sm:px-10">
                <p className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-warm-muted">
                  Seating
                </p>
                <p className="mt-1 font-serif text-2xl font-light text-ember sm:text-4xl">
                  90 min
                </p>
                <p className="mt-1 font-sans text-xs font-light text-warm-muted">
                  per table
                </p>
              </div>
            </div>

            <p className="mt-6 font-sans text-sm font-light text-warm">
              Walk-in only · No reservations needed
            </p>
            <p className="mt-2 font-sans text-sm font-light text-warm">
              Stop our clock at exactly{" "}
              <span className="font-medium text-ember-deep">10.00 seconds</span>{" "}
              and your next visit is free.
            </p>
          </div>
        </section>

        {/* Included strip — hairline dividers, no box */}
        <section className="px-6 pb-4">
          <div className="mx-auto max-w-4xl text-center transform-gpu">
            <p className="mb-4 font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-warm-muted">
              Included with every meal
            </p>
            <ul
              className="flex flex-wrap items-center justify-center"
              role="list"
            >
              {INCLUDED.map((label, i) => (
                <li
                  key={label}
                  className={`px-5 py-1 font-sans text-sm font-light text-warm ${
                    i < INCLUDED.length - 1
                      ? "border-r border-ink/10"
                      : ""
                  }`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Category jump nav — sticks just below the fixed site header */}
        <MenuJumpNav targets={JUMP_TARGETS} />

        {/* Categories */}
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-20">
          <p className="mb-10 transform-gpu text-center font-serif text-lg font-light italic text-warm">
            Everything is included in the all-you-can-eat price. No per-item
            charges.
          </p>

          {CATEGORIES.map((category) => (
            <CategorySection key={category.name} category={category} />
          ))}

          {/* Upgraded tiers */}
          <TierSection
            label="Premium"
            title="Premium Selection"
            blurb="The good stuff. Included for everyone at the table, same as the rest of the menu."
            items={PREMIUM}
            variant="premium"
          />
        </div>

        {/* Info band */}
        <section
          className="relative bg-cream-deep px-6 py-20"
          data-seam-morph
          data-from="#faf6ef"
          data-to="#f2ebdd"
        >
          <SeamThread />
          <div className="mx-auto max-w-5xl text-center transform-gpu">
            <h2 className="font-serif text-4xl font-light text-foreground md:text-5xl">
              Come Hungry
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ember-deep">
                  Hours
                </h3>
                <p className="mt-4 font-sans text-sm font-light leading-relaxed text-warm">
                  Sun–Thu 12:00 PM – 9:30 PM
                  <br />
                  Fri–Sat 12:00 PM – 10:00 PM
                </p>
              </div>
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ember-deep">
                  Location
                </h3>
                <p className="mt-4 font-sans text-sm font-light leading-relaxed text-warm">
                  2216 S El Camino Real #108–109
                  <br />
                  Oceanside, CA 92054
                </p>
              </div>
              <div>
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-ember-deep">
                  Walk-In
                </h3>
                <p className="mt-4 font-sans text-sm font-light leading-relaxed text-warm">
                  No reservations
                  <br />
                  <a
                    href="tel:+17604331888"
                    className="font-medium text-ember-deep underline-offset-4 hover:underline"
                  >
                    (760) 433-1888
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Calm: background continuity + seam motif only, no parallax/overlaps. */}
        <SeamMotion calm />
      </main>
      <Footer />
    </>
  );
}
