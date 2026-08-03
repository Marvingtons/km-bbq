// THE one source for the restaurant's facts. Hours, address, phone, prices and
// the seating limit live here and nowhere else. Contact, the sticky bar, the
// nav, the footer, the menu page, metadata and the JSON-LD all render from it,
// so nothing can drift and structured data always matches the visible page.
//
// Moved here from src/lib/restaurant.ts — the brief asked for data/info.ts and
// two files holding the same constants would have been the drift this exists to
// prevent. See REDESIGN-CONFLICTS.md #5.

export const SITE_URL = "https://kmbbq.com";

export const BUSINESS = {
  name: "KM.BBQ",
  tagline: "All-You-Can-Eat Korean BBQ in Oceanside",
  cuisine: "Korean",
  priceRange: "$$",
} as const;

// PRICE IS CONTENT. These render in the hero, the sticky bar and the menu page.
export const PRICING = {
  lunch: "$21.99",
  dinner: "$30.99",
  /** Table time limit, and the "last call" beat the staff actually run. */
  seatingMinutes: 90,
  seatingLabel: "90 min",
  lastCallMinutes: 75,
} as const;

// The real in-store promotion, quoted verbatim wherever it appears.
export const CLOCK_PROMO = {
  target: "10.00",
  rule: "Stop it dead on 10.00 seconds and your next visit is free.",
} as const;

export const PHONE = {
  display: "(760) 433-1888",
  href: "tel:+17604331888",
} as const;

export const ADDRESS = {
  street: "2216 S El Camino Real #108–109",
  region: "Oceanside, CA 92054",
  /** Short form for the sticky bar and the hero eyebrow. */
  city: "Oceanside, CA",
} as const;

// Structured address for schema.org PostalAddress and local SEO.
export const ADDRESS_PARTS = {
  street: "2216 S El Camino Real #108-109",
  city: "Oceanside",
  state: "CA",
  zip: "92054",
  country: "US",
} as const;

export const GEO = { lat: 33.1767, lng: -117.3503 } as const;

// 24h form for openingHoursSpecification, and the source the sticky bar reads
// to work out tonight's close. `day` is JS getDay(): 0 = Sunday.
export const HOURS_SPEC = [
  {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    dayNums: [0, 1, 2, 3, 4],
    opens: "12:00",
    closes: "21:30",
    closeLabel: "9:30 PM",
  },
  {
    days: ["Friday", "Saturday"],
    dayNums: [5, 6],
    opens: "12:00",
    closes: "22:00",
    closeLabel: "10:00 PM",
  },
] as const;

export const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(
    "KM.BBQ, 2216 S El Camino Real #108-109, Oceanside, CA 92054"
  );

export const HOURS = [
  { days: "Sunday – Thursday", short: "Sun–Thu", time: "12:00 PM – 9:30 PM" },
  { days: "Friday – Saturday", short: "Fri–Sat", time: "12:00 PM – 10:00 PM" },
] as const;

export type SocialKey = "instagram" | "tiktok" | "yelp";

export const SOCIALS: { key: SocialKey; label: string; href: string }[] = [
  {
    key: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/kmkoreanbbq/",
  },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@kmkoreanbbq" },
  { key: "yelp", label: "Yelp", href: "https://www.yelp.com/biz/km-bbq-oceanside-2" },
];
