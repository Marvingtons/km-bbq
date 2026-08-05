/* ===========================================================================
   THE MENU, TRANSCRIBED FROM THE RESTAURANT'S OWN PRINTED CARDS.

   Everything here comes off the green (lunch) and red (dinner) menus. The set
   that was here before was INVENTED — plausible dishes with plausible
   descriptions and no relationship to what the kitchen serves — so this file
   is a replacement, not an edit. Nothing may be added to it that is not on
   those cards.

   ITEM NUMBERS ARE DATA, not decoration. Regulars order by number and the
   numbers are printed on the table; `1`, `4A`, `1B` are what a server hears.
   They are also non-contiguous on purpose — the printed dinner card publishes
   1B, 4B and 5B and nothing else in that range, and the gap is not ours to
   fill. No placeholders, no renumbering.

   ONE NAMING CONVENTION: `ROMANIZED — PRINTED ENGLISH`, with hangul.

   It applies ONLY where a standard Korean name exists for the printed English,
   and the bar for "exists" is a dish name people actually use — Bulgogi,
   Samgyeopsal, Japchae, Galbi. It is deliberately NOT applied to:

     - Dishes with no Korean name at all: Hot Dog, Onion Ring, Corn Cheese,
       Popcorn Chicken, Pork Chop, Lamb, Teriyaki anything.
     - Preparation descriptors rather than dishes: "Head Shrimp", "Freshly Cut
       Steak", "Sliced Beef Short Plate". Attaching a Korean dish name to those
       asserts a preparation the printed menu does not claim.
     - Words whose Korean is a transliteration of the English — 샐러드 is
       "salad", 참깨볼 is "sesame ball". Romanizing those back out produces
       "Selleodeu", which is nobody's name for anything.

   The previous file got this wrong in the direction that matters: it invented
   Korean names (매운 닭 for "Spicy Chicken", 대하 for "Head Shrimp") which read
   as provenance and were not. Where the record is silent, the English stands
   alone.
   =========================================================================== */

export type Tier = "core" | "premium" | "signature";

export interface MenuItem {
  /** Stable key, and the deep-link fragment within a category. */
  id: string;
  /** The restaurant's printed item number: "1", "12", "4A", "1B". */
  num: string;
  /** The PRINTED ENGLISH, verbatim off the card. */
  name: string;
  /** Romanized Korean, only where a standard dish name exists. */
  korean?: string;
  hangul?: string;
  /** Optional. A plain row is a fine row — see the note on descriptions below. */
  desc?: string;
  /** Category id; the derived `MENU` below groups on it. */
  category: string;
  /** True for every item whose PRINTED name starts with "Spicy". Nothing else. */
  spicy?: boolean;
  tier: Tier;
  /**
   * ONLY the five dishes the homepage preview shows. Every other item on
   * /menu is typographic — see the note in app/menu/MenuBoard.tsx. A photo
   * here means "this asset exists, is referenced, and must not be deleted".
   */
  image?: string;
}

export interface MenuCategory {
  /** Slug AND the anchor on /menu. Every link to a category uses this. */
  id: string;
  name: string;
  hangul?: string;
  tag?: string;
  /** Short label for the jump bar; defaults to `name`. */
  navLabel?: string;
  blurb?: string;
  /** The tier its items carry, which is what the service toggle filters on. */
  tier: Tier;
  items: MenuItem[];
}

/* ---------------------------------------------------------------------------
   DESCRIPTIONS ARE OPTIONAL AND FACTUAL.

   Kept where the old file happened to describe a real dish accurately; written
   fresh (twelve words or fewer) where the dish is self-evident; omitted where
   anything true would be a tautology. "Ice Cream" does not need a sentence,
   and the previous file's "Self-serve and unlimited" was a claim about service
   nobody checked.
   --------------------------------------------------------------------------- */

const CORE: MenuItem[] = [
  // --- BEEF ---------------------------------------------------------------
  {
    id: "bulgogi",
    num: "1",
    name: "Beef Bulgogi",
    korean: "Bulgogi",
    hangul: "불고기",
    desc: "Thin beef in a soy and sesame marinade. Sweet, savory, fast on the grill.",
    category: "beef",
    tier: "core",
    image: "/images/bulgogi.png",
  },
  {
    id: "teriyaki-beef",
    num: "2",
    name: "Teriyaki Beef",
    desc: "Beef in a glossy teriyaki glaze that caramelizes over the coals.",
    category: "beef",
    tier: "core",
  },
  {
    id: "chadolbaegi",
    num: "3",
    name: "Beef Brisket",
    korean: "Chadolbaegi",
    hangul: "차돌박이",
    desc: "Paper-thin brisket that sears in seconds. Dip it in sesame oil and salt.",
    category: "beef",
    tier: "core",
    image: "/images/chadolbaegi.png",
  },

  // --- PORK ---------------------------------------------------------------
  {
    id: "samgyeopsal",
    num: "4",
    name: "Sliced Pork Belly",
    korean: "Samgyeopsal",
    hangul: "삼겹살",
    desc: "Thick-cut pork belly, grilled crisp and juicy. Wrap it up your way.",
    category: "pork",
    tier: "core",
    image: "/images/samgyeopsal.png",
  },
  {
    id: "pork-chop",
    num: "5",
    name: "Pork Chop",
    desc: "Seasoned pork, charred on your own grill for a smoky bite.",
    category: "pork",
    tier: "core",
  },
  {
    id: "spicy-pork-belly",
    num: "11",
    name: "Spicy Pork Belly",
    korean: "Jeyuk Bokkeum",
    hangul: "제육볶음",
    desc: "Pork belly in a gochujang chili marinade. Sweet heat, smoky finish.",
    category: "pork",
    spicy: true,
    tier: "core",
  },

  // --- CHICKEN ------------------------------------------------------------
  {
    id: "spicy-chicken",
    num: "10",
    name: "Spicy Chicken",
    desc: "Boneless chicken in a chili marinade with a touch of sweetness.",
    category: "chicken",
    spicy: true,
    tier: "core",
  },
  {
    id: "teriyaki-chicken",
    num: "12",
    name: "Teriyaki Chicken",
    desc: "Sweet-savory teriyaki chicken that grills up golden and tender.",
    category: "chicken",
    tier: "core",
  },

  // --- SEAFOOD ------------------------------------------------------------
  {
    id: "shrimp-no-head",
    num: "6",
    name: "Shrimp (no head)",
    desc: "Peeled shrimp, quick to grill and ready for the dipping sauce.",
    category: "seafood",
    tier: "core",
  },
  {
    id: "head-shrimp",
    num: "7",
    name: "Head Shrimp",
    desc: "Whole shrimp grilled in the shell.",
    category: "seafood",
    tier: "core",
  },
  {
    id: "fresh-fish-fillet",
    num: "8",
    name: "Fresh Fish Fillet",
    desc: "White fish fillet, light and flaky straight off the grill.",
    category: "seafood",
    tier: "core",
  },
  {
    id: "spicy-squid",
    num: "9",
    name: "Spicy Squid",
    desc: "Squid in a chili marinade, grilled for a smoky char.",
    category: "seafood",
    spicy: true,
    tier: "core",
  },

  // --- RICE & MORE --------------------------------------------------------
  {
    id: "hot-dog",
    num: "13",
    name: "Hot Dog",
    category: "rice-and-more",
    tier: "core",
  },
  {
    id: "kimchi-fried-rice",
    num: "14",
    name: "Kimchi Fried Rice",
    korean: "Kimchi Bokkeumbap",
    hangul: "김치볶음밥",
    desc: "Rice fried with house kimchi. Savory with a tangy kick.",
    category: "rice-and-more",
    tier: "core",
  },
  {
    id: "japchae",
    num: "15",
    name: "Japchae",
    korean: "Japchae",
    hangul: "잡채",
    desc: "Glass noodles stir-fried with vegetables in sweet sesame soy.",
    category: "rice-and-more",
    tier: "core",
  },
  {
    id: "fried-pot-stickers",
    num: "16",
    name: "Fried Pot Stickers",
    korean: "Mandu",
    hangul: "만두",
    desc: "Pan-fried dumplings with a savory filling.",
    category: "rice-and-more",
    tier: "core",
  },
  {
    id: "fishcake",
    num: "28",
    name: "Fishcake",
    korean: "Eomuk",
    hangul: "어묵",
    desc: "Stir-fried fish cake in a light sauce.",
    category: "rice-and-more",
    tier: "core",
  },
  {
    id: "steamed-egg",
    num: "29",
    name: "Steamed Egg",
    korean: "Gyeranjjim",
    hangul: "계란찜",
    desc: "Silky steamed egg custard.",
    category: "rice-and-more",
    tier: "core",
  },
  {
    id: "plain-rice",
    num: "30",
    name: "Plain Rice",
    korean: "Bap",
    hangul: "밥",
    category: "rice-and-more",
    tier: "core",
  },

  // --- VEGETABLES ---------------------------------------------------------
  {
    id: "pumpkin",
    num: "17",
    name: "Pumpkin",
    korean: "Hobak",
    hangul: "호박",
    desc: "Sweet slices that caramelize over the grill.",
    category: "vegetables",
    tier: "core",
  },
  {
    id: "squash",
    num: "18",
    name: "Squash",
    desc: "Tender squash, lightly charred and naturally sweet.",
    category: "vegetables",
    tier: "core",
  },
  {
    id: "mushroom",
    num: "19",
    name: "Mushroom",
    korean: "Beoseot",
    hangul: "버섯",
    desc: "Soaks up the smoke as it grills.",
    category: "vegetables",
    tier: "core",
  },
  {
    id: "onion-ring",
    num: "20",
    name: "Onion Ring",
    category: "vegetables",
    tier: "core",
  },
  {
    id: "lettuce-salad",
    num: "21",
    name: "Lettuce Salad",
    desc: "Fresh greens in a light, tangy dressing.",
    category: "vegetables",
    tier: "core",
  },

  // --- BANCHAN ------------------------------------------------------------
  {
    id: "kimchi",
    num: "22",
    name: "Kimchi",
    korean: "Kimchi",
    hangul: "김치",
    desc: "House-fermented napa cabbage. Tangy, a little spicy.",
    category: "banchan",
    tier: "core",
    image: "/images/kimchi.png",
  },
  {
    id: "radish",
    num: "23",
    name: "Radish",
    desc: "Crunchy pickled radish, bright and refreshing.",
    category: "banchan",
    tier: "core",
  },
  {
    id: "garlic-broccoli",
    num: "24",
    name: "Garlic Broccoli",
    desc: "Crisp-tender broccoli tossed with garlic.",
    category: "banchan",
    tier: "core",
  },
  {
    id: "salt-beansprout",
    num: "25",
    name: "Salt Beansprout",
    korean: "Kongnamul",
    hangul: "콩나물",
    desc: "Crisp seasoned bean sprouts. A cool, clean side.",
    category: "banchan",
    tier: "core",
  },
  {
    id: "spicy-cucumber",
    num: "26",
    name: "Spicy Cucumber",
    korean: "Oi Muchim",
    hangul: "오이무침",
    desc: "Cucumbers in a cool, spicy sesame dressing.",
    category: "banchan",
    spicy: true,
    tier: "core",
  },
  {
    id: "potato-salad",
    num: "27",
    name: "Potato Salad",
    desc: "Creamy Korean-style potato salad.",
    category: "banchan",
    tier: "core",
  },

  // --- DESSERT ------------------------------------------------------------
  {
    id: "sesame-ball",
    num: "31",
    name: "Sesame Ball",
    desc: "Chewy fried dough rolled in toasted sesame seeds.",
    category: "dessert",
    tier: "core",
  },
  {
    id: "fried-doughnuts",
    num: "32",
    name: "Fried Doughnuts",
    desc: "Warm, golden doughnuts dusted with sugar.",
    category: "dessert",
    tier: "core",
  },
  {
    id: "ice-cream",
    num: "33",
    name: "Ice Cream",
    category: "dessert",
    tier: "core",
  },
];

/** Printed on BOTH cards, so it renders in both services. */
const PREMIUM: MenuItem[] = [
  {
    id: "galbi",
    num: "1A",
    name: "Beef Short Ribs",
    korean: "Galbi",
    hangul: "갈비",
    desc: "Bone-in short ribs in a soy-pear marinade, grilled until caramelized.",
    category: "premium",
    tier: "premium",
    image: "/images/galbi.png",
  },
  {
    id: "beef-finger-meat",
    num: "2A",
    name: "Beef Finger Meat",
    desc: "Meat from between the ribs. Deeply beefy and tender.",
    category: "premium",
    tier: "premium",
  },
  {
    id: "freshly-cut-steak",
    num: "3A",
    name: "Freshly Cut Steak",
    desc: "House-cut steak, fresh and grill-ready.",
    category: "premium",
    tier: "premium",
  },
  { id: "lamb", num: "4A", name: "Lamb", category: "premium", tier: "premium" },
  {
    id: "marinated-chef-beef",
    num: "5A",
    name: "Marinated Chef Beef",
    desc: "The chef's beef in a house marinade.",
    category: "premium",
    tier: "premium",
  },
  {
    id: "marinated-pork-belly",
    num: "6A",
    name: "Marinated Pork Belly",
    desc: "Pork belly in a savory house marinade.",
    category: "premium",
    tier: "premium",
  },
  {
    id: "beef-skirt-steak",
    num: "7A",
    name: "Beef Skirt Steak",
    desc: "Marbled skirt steak that chars beautifully.",
    category: "premium",
    tier: "premium",
  },
  {
    id: "mussels",
    num: "8A",
    name: "Mussels",
    desc: "Grilled in the shell.",
    category: "premium",
    tier: "premium",
  },
  {
    id: "popcorn-chicken",
    num: "9A",
    name: "Popcorn Chicken",
    desc: "Crispy, bite-size fried chicken.",
    category: "premium",
    tier: "premium",
  },
  {
    id: "corn-cheese",
    num: "10A",
    name: "Corn Cheese",
    desc: "Sweet corn baked with melted cheese.",
    category: "premium",
    tier: "premium",
  },
];

/**
 * DINNER CARD ONLY, and exactly these three.
 *
 * The printed dinner menu publishes 1B, 4B and 5B. 2B and 3B are not on the
 * card — whatever they are or were, the restaurant is not currently offering
 * them under those numbers, and a placeholder row would be the site claiming
 * to know something it does not. The gap in the numbering stays.
 */
const SIGNATURE: MenuItem[] = [
  {
    id: "prime-new-york-steak",
    num: "1B",
    name: "Prime New York Steak",
    category: "signature",
    tier: "signature",
  },
  {
    id: "beef-tongue",
    num: "4B",
    name: "Beef Tongue",
    desc: "Thin-sliced, quick over high heat.",
    category: "signature",
    tier: "signature",
  },
  {
    id: "sliced-beef-short-plate",
    num: "5B",
    name: "Sliced Beef Short Plate",
    category: "signature",
    tier: "signature",
  },
];

export const ITEMS: MenuItem[] = [...CORE, ...PREMIUM, ...SIGNATURE];

/**
 * CATEGORY ORDER IS THE PRINTED ORDER, with the two upgrade tiers last. The
 * jump bar, the page and the service toggle all read this one array, so a
 * category cannot exist in one and not the others.
 */
const CATEGORY_META: Omit<MenuCategory, "items">[] = [
  { id: "beef", name: "Beef", hangul: "소고기", tier: "core" },
  { id: "pork", name: "Pork", hangul: "돼지고기", tier: "core" },
  { id: "chicken", name: "Chicken", hangul: "닭고기", tier: "core" },
  { id: "seafood", name: "Seafood", hangul: "해산물", tier: "core" },
  {
    id: "rice-and-more",
    name: "Rice & More",
    hangul: "밥과 면",
    navLabel: "Rice & More",
    tier: "core",
  },
  { id: "vegetables", name: "Vegetables", hangul: "야채", tier: "core" },
  { id: "banchan", name: "Banchan", hangul: "반찬", tag: "Included", tier: "core" },
  { id: "dessert", name: "Dessert", hangul: "디저트", tag: "Included", tier: "core" },
  {
    id: "premium",
    name: "Premium",
    tag: "Included",
    blurb:
      "Included for everyone at the table, at the same one price as the rest of the menu.",
    tier: "premium",
  },
  {
    id: "signature",
    name: "Signature",
    tag: "Dinner only",
    blurb: "On the dinner menu, and included in the dinner price.",
    tier: "signature",
  },
];

/** Grouped, and it THROWS on an item whose category has no metadata. */
export const MENU: MenuCategory[] = CATEGORY_META.map((meta) => ({
  ...meta,
  items: ITEMS.filter((i) => i.category === meta.id),
}));

{
  const known = new Set(CATEGORY_META.map((c) => c.id));
  for (const item of ITEMS) {
    if (!known.has(item.category)) {
      throw new Error(
        `Menu item "${item.id}" is in category "${item.category}", which has no metadata.`
      );
    }
  }
}

/** Everything the one price covers, shown on both routes. */
export const INCLUDED = [
  "Fresh veggies & wraps",
  "Banchan included",
  "House dipping sauces",
  "Free drink refills",
  "Free ice cream",
];

/**
 * The homepage's house favourites, BY ID. They are not a second copy of the
 * data — they are pointers into it, so a card can never show a name or a
 * description that /menu does not. These five are also the only items that
 * carry an `image`, which is what keeps their assets referenced.
 */
const FEATURED_IDS = [
  "galbi",
  "samgyeopsal",
  "chadolbaegi",
  "bulgogi",
  "kimchi",
] as const;

export interface FeaturedDish {
  item: MenuItem;
  /** The category the dish actually lives in, and the anchor that proves it. */
  category: MenuCategory;
  href: string;
}

/**
 * Resolved at module load, and it THROWS on a bad id or a missing photo rather
 * than rendering a hole. A featured dish pointing at a record that does not
 * exist is exactly the failure this file was created to make impossible, so it
 * should break the build, not the page.
 */
export const FEATURED: FeaturedDish[] = FEATURED_IDS.map((id) => {
  for (const category of MENU) {
    const item = category.items.find((i) => i.id === id);
    if (item) {
      if (!item.image) {
        throw new Error(
          `FEATURED item "${id}" has no image. The homepage preview renders photos.`
        );
      }
      return { item, category, href: `/menu#${category.id}` };
    }
  }
  throw new Error(
    `FEATURED references "${id}", which is not in MENU. Add the dish or fix the id.`
  );
});

/**
 * `Galbi — Beef Short Ribs`, or just `Teriyaki Beef` where there is no Korean
 * name. THE ONE PLACE THIS STRING IS BUILT, so the homepage card and the /menu
 * row are character-identical by construction rather than by review.
 */
export function displayName(item: MenuItem): string {
  return item.korean ? `${item.korean} — ${item.name}` : item.name;
}

/**
 * THE BADGES AN ITEM HAS EARNED, and the only place their labels are written.
 *
 * The rendering component had `<Badge>Spicy</Badge>` gated on `item.spicy`,
 * which is correct behaviour and the wrong location: a designation is a claim
 * about the food, so both the CONDITION and the WORD belong to the data. A
 * literal in the view is how a "CHEF'S CHOICE" pill ends up on the page with
 * nothing in the record behind it.
 */
export function badgesOf(item: MenuItem): string[] {
  const out: string[] = [];
  // `spicy` is set only where the PRINTED name starts with "Spicy".
  if (item.spicy) out.push("Spicy");
  if (item.tier !== "core") out.push(item.tier);
  return out;
}

/** Jump-bar targets. Derived, so a new category cannot be missed. */
export const JUMP_TARGETS = MENU.map((c) => ({
  label: c.navLabel ?? c.name,
  id: c.id,
  tier: c.tier,
}));
