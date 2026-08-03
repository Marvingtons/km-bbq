// THE menu. Both the homepage's house favourites and /menu render from these
// records, so the two cannot disagree about what a dish is called or what it
// is. They used to: the homepage said "Galbi — Signature", /menu said "Beef
// Short Ribs" and filed it under Premium, and a visitor who followed "See the
// full menu" looking for Galbi did not find it.
//
// ONE NAMING CONVENTION: `Romanized Korean — English`.
//
// It cannot apply to everything, and it is not forced where it does not fit.
// Two cases take English alone:
//
//   1. No Korean name exists in the record (Teriyaki Beef, Pork Chop, Hot Dog,
//      Lamb, Corn Cheese...). Inventing one would be inventing provenance.
//   2. The Korean IS a transliteration of the English — 샐러드 is "salad",
//      데리야키 치킨 is "teriyaki chicken", 참깨볼 is "sesame ball". Romanizing
//      those back out produces "Deriyaki Chikin", which is nobody's name for
//      anything. The hangul is still shown; it just is not romanized.
//
// Romanizations are Revised Romanization of the hangul already in the record —
// a transliteration of existing data, not a new claim about the food.

export interface MenuItem {
  /** Stable key. Also the deep-link fragment within a category. */
  id: string;
  /** The romanized Korean where there is one, otherwise the English name. */
  name: string;
  /** The English gloss, when `name` is romanized. Omitted when they'd repeat. */
  english?: string;
  hangul?: string;
  desc: string;
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
  items: MenuItem[];
}

export const MENU: MenuCategory[] = [
  {
    id: "beef",
    name: "Beef",
    hangul: "소고기",
    items: [
      {
        id: "bulgogi",
        name: "Bulgogi",
        english: "Marinated Ribeye",
        hangul: "불고기",
        desc: "Thin ribeye in a soy, sesame and pear marinade. Sweet, savory, and fast on the grill.",
        image: "/images/bulgogi.png",
      },
      {
        id: "teriyaki-beef",
        name: "Teriyaki Beef",
        desc: "Tender beef glazed in a glossy house teriyaki that caramelizes over the coals.",
        image: "/images/teriyaki-beef.png",
      },
      {
        id: "chadolbaegi",
        name: "Chadolbaegi",
        english: "Beef Brisket",
        hangul: "차돌박이",
        desc: "Paper-thin brisket that sears in seconds. Dip it in sesame oil and a pinch of salt.",
        image: "/images/chadolbaegi.png",
      },
    ],
  },
  {
    id: "pork",
    name: "Pork",
    hangul: "돼지고기",
    items: [
      {
        id: "samgyeopsal",
        name: "Samgyeopsal",
        english: "Sliced Pork Belly",
        hangul: "삼겹살",
        desc: "Thick-cut pork belly, grilled crisp and juicy. Wrap it up your way.",
        image: "/images/samgyeopsal.png",
      },
      {
        id: "pork-chop",
        name: "Pork Chop",
        desc: "Simply seasoned pork, charred on your own grill for a smoky bite.",
        image: "/images/pork-chop.png",
      },
      {
        id: "jeyuk-bokkeum",
        name: "Jeyuk Bokkeum",
        english: "Spicy Pork Belly",
        hangul: "제육볶음",
        desc: "Pork belly in a gochujang chili marinade. Sweet heat with a smoky finish.",
        image: "/images/spicy-pork-belly.png",
      },
    ],
  },
  {
    id: "chicken",
    name: "Chicken",
    hangul: "닭고기",
    items: [
      {
        id: "maeun-dak",
        name: "Maeun Dak",
        english: "Spicy Chicken",
        hangul: "매운 닭",
        desc: "Boneless chicken in a fiery gochujang glaze with a touch of sweetness.",
        image: "/images/spicy-chicken.png",
      },
      {
        id: "teriyaki-chicken",
        name: "Teriyaki Chicken",
        hangul: "데리야키 치킨",
        desc: "Sweet-savory teriyaki chicken that grills up golden and tender.",
        image: "/images/teriyaki-chicken.png",
      },
    ],
  },
  {
    id: "seafood",
    name: "Seafood",
    hangul: "해산물",
    items: [
      {
        id: "saeu",
        name: "Saeu",
        english: "Shrimp, Peeled",
        hangul: "새우",
        desc: "Peeled shrimp, quick to grill and ready for the dipping sauce.",
        image: "/images/shrimp-no-head.png",
      },
      {
        id: "daeha",
        name: "Daeha",
        english: "Head-On Shrimp",
        hangul: "대하",
        desc: "Whole head-on shrimp grilled in the shell for deeper, sweeter flavor.",
        image: "/images/head-shrimp.png",
      },
      {
        id: "saengseon",
        name: "Saengseon",
        english: "Fish Fillet",
        hangul: "생선",
        desc: "Mild white fish fillet, light and flaky straight off the grill.",
        image: "/images/fresh-fish-fillet.png",
      },
      {
        id: "ojingeo",
        name: "Ojingeo",
        english: "Spicy Squid",
        hangul: "오징어",
        desc: "Tender squid tossed in a spicy chili marinade with a smoky char.",
        image: "/images/spicy-squid.png",
      },
    ],
  },
  {
    id: "rice-and-more",
    name: "Rice, Noodles & More",
    navLabel: "Rice & More",
    items: [
      {
        id: "hot-dog",
        name: "Hot Dog",
        desc: "A grill-friendly favorite the whole table reaches for.",
        image: "/images/hot-dog.png",
      },
      {
        id: "kimchi-bokkeumbap",
        name: "Kimchi Bokkeumbap",
        english: "Kimchi Fried Rice",
        hangul: "김치볶음밥",
        desc: "Rice fried with house kimchi for a savory, tangy kick.",
        image: "/images/kimchi-fried-rice.png",
      },
      {
        id: "japchae",
        name: "Japchae",
        english: "Glass Noodles",
        hangul: "잡채",
        desc: "Glass noodles stir-fried with vegetables in sweet sesame soy.",
        image: "/images/japchae.png",
      },
      {
        id: "mandu",
        name: "Mandu",
        english: "Fried Pot Stickers",
        hangul: "만두",
        desc: "Crisp pan-fried dumplings with a savory, juicy filling.",
        image: "/images/fried-pot-stickers.png",
      },
    ],
  },
  {
    id: "vegetables",
    name: "Vegetables",
    hangul: "야채",
    items: [
      {
        id: "hobak",
        name: "Hobak",
        english: "Korean Squash",
        hangul: "호박",
        desc: "Sweet slices that caramelize beautifully over the grill.",
        image: "/images/pumpkin.png",
      },
      {
        id: "squash",
        name: "Squash",
        desc: "Tender squash, lightly charred and naturally sweet.",
        image: "/images/squash.png",
      },
      {
        id: "beoseot",
        name: "Beoseot",
        english: "Mushrooms",
        hangul: "버섯",
        desc: "Assorted mushrooms that soak up the smoke as they grill.",
        image: "/images/mushroom.png",
      },
      {
        id: "yangpa",
        name: "Yangpa",
        english: "Onion",
        hangul: "양파",
        desc: "Sweet onions that turn golden and jammy on the grill.",
        image: "/images/onion.png",
      },
      {
        id: "garlic-broccoli",
        name: "Garlic Broccoli",
        desc: "Crisp-tender broccoli tossed with savory garlic.",
        image: "/images/garlic-broccoli.png",
      },
      {
        id: "kongnamul",
        name: "Kongnamul",
        english: "Bean Sprouts",
        hangul: "콩나물",
        desc: "Crisp seasoned bean sprouts. A cool, clean side.",
        image: "/images/salt-beansprout.png",
      },
    ],
  },
  {
    id: "banchan",
    name: "Banchan & Sides",
    hangul: "반찬",
    tag: "Included",
    navLabel: "Banchan",
    items: [
      {
        id: "lettuce-salad",
        name: "Lettuce Salad",
        hangul: "샐러드",
        desc: "Fresh greens in a light, tangy dressing.",
        image: "/images/lettuce-salad.png",
      },
      {
        id: "kimchi",
        name: "Kimchi",
        english: "Napa Cabbage",
        hangul: "김치",
        desc: "House-fermented napa cabbage. Tangy, a little spicy, and hard to put down.",
        image: "/images/kimchi.png",
      },
      {
        id: "danmuji",
        name: "Danmuji",
        english: "Pickled Radish",
        hangul: "단무지",
        desc: "Crunchy pickled radish, bright and refreshing.",
        image: "/images/radish.png",
      },
      {
        id: "oi-muchim",
        name: "Oi Muchim",
        english: "Spicy Cucumber",
        hangul: "오이무침",
        desc: "Cucumbers in a cool, spicy sesame dressing.",
        image: "/images/spicy-cucumber.png",
      },
      {
        id: "potato-salad",
        name: "Potato Salad",
        hangul: "감자 샐러드",
        desc: "Creamy Korean-style potato salad.",
        image: "/images/potato-salad.png",
      },
      {
        id: "eomuk",
        name: "Eomuk",
        english: "Fishcake",
        hangul: "어묵",
        desc: "Savory stir-fried fish cake in a light sauce.",
        image: "/images/fishcake.png",
      },
      {
        id: "gyeranjjim",
        name: "Gyeranjjim",
        english: "Steamed Egg",
        hangul: "계란찜",
        desc: "Silky, fluffy steamed egg custard.",
        image: "/images/steamed-egg.png",
      },
      {
        id: "bap",
        name: "Bap",
        english: "Steamed Rice",
        hangul: "밥",
        desc: "Warm steamed white rice. The perfect base.",
        image: "/images/plain-rice.png",
      },
    ],
  },
  {
    id: "dessert",
    name: "Dessert",
    hangul: "디저트",
    tag: "Free",
    items: [
      {
        id: "sesame-balls",
        name: "Sesame Balls",
        hangul: "참깨볼",
        desc: "Chewy fried dough rolled in toasted sesame seeds.",
        image: "/images/sesame-balls.png",
      },
      {
        id: "fried-doughnuts",
        name: "Fried Doughnuts",
        desc: "Warm, golden doughnuts dusted with sugar.",
        image: "/images/fried-doughnuts.png",
      },
      {
        id: "ice-cream",
        name: "Ice Cream",
        desc: "A cold, sweet finish. Self-serve and unlimited.",
        image: "/images/ice-cream.png",
      },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tag: "Included",
    blurb:
      "Included for everyone at the table, at the same one price as the rest of the menu.",
    items: [
      {
        id: "galbi",
        name: "Galbi",
        english: "Beef Short Ribs",
        hangul: "갈비",
        desc: "Bone-in short ribs marinated in a soy-pear blend, grilled at your table until caramelized.",
        image: "/images/galbi.png",
      },
      {
        id: "beef-finger-meat",
        name: "Beef Finger Meat",
        desc: "Prized meat from between the ribs. Deeply beefy and tender.",
        image: "/images/beef-finger-meat.png",
      },
      {
        id: "freshly-cut-steak",
        name: "Freshly Cut Steak",
        desc: "House-cut steak, fresh and grill-ready.",
        image: "/images/freshly-cut-steak.png",
      },
      {
        id: "lamb",
        name: "Lamb",
        desc: "Tender lamb with a savory, aromatic char.",
        image: "/images/lamb.png",
      },
      {
        id: "marinated-chef-beef",
        name: "Marinated Chef Beef",
        desc: "The chef's beef in a house marinade.",
        image: "/images/marinated-chef-beef.png",
      },
      {
        id: "marinated-pork-belly",
        name: "Marinated Pork Belly",
        desc: "Pork belly soaked in a savory house marinade.",
        image: "/images/marinated-pork-belly.png",
      },
      {
        id: "beef-skirt-steak",
        name: "Beef Skirt Steak",
        desc: "Richly marbled skirt steak that chars beautifully.",
        image: "/images/beef-skirt-steak.png",
      },
      {
        id: "mussels",
        name: "Mussels",
        desc: "Plump mussels grilled in the shell.",
        image: "/images/mussels.png",
      },
      {
        id: "popcorn-chicken",
        name: "Popcorn Chicken",
        desc: "Crispy, bite-size fried chicken.",
        image: "/images/popcorn-chicken.png",
      },
      {
        id: "corn-cheese",
        name: "Corn Cheese",
        desc: "Sweet corn baked with melty, bubbling cheese.",
        image: "/images/corn-cheese.png",
      },
    ],
  },
];

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
 * data — they are pointers into it, so a card can never show a name, a photo
 * or a description that /menu does not.
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
 * Resolved at module load, and it THROWS on a bad id rather than rendering a
 * hole. A featured dish pointing at a record that does not exist is exactly the
 * failure this file was created to make impossible, so it should break the
 * build, not the page.
 */
export const FEATURED: FeaturedDish[] = FEATURED_IDS.map((id) => {
  for (const category of MENU) {
    const item = category.items.find((i) => i.id === id);
    if (item) return { item, category, href: `/menu#${category.id}` };
  }
  throw new Error(
    `FEATURED references "${id}", which is not in MENU. Add the dish or fix the id.`
  );
});

/** `Galbi — Beef Short Ribs`, or just `Teriyaki Beef` when there is no gloss. */
export function displayName(item: MenuItem): string {
  return item.english ? `${item.name} — ${item.english}` : item.name;
}

/** Jump-bar targets. Derived, so a new category cannot be missed. */
export const JUMP_TARGETS = MENU.map((c) => ({
  label: c.navLabel ?? c.name,
  id: c.id,
}));
