// One source for the restaurant's contact facts. Contact, the menu info band,
// the footer, metadata, and the JSON-LD all render from here so hours, address,
// phone, and links can never drift out of sync — and so structured data always
// matches the visible content (which is what search engines check for).

// Production origin. Used for metadataBase, canonical URLs, sitemap, robots, and
// the JSON-LD `url`/`@id`. NOTE: placeholder — replace with the real production
// domain before launch (see the "could not confirm" note in the SEO handoff).
export const SITE_URL = "https://kmbbq.com";

export const BUSINESS = {
  name: "KM.BBQ",
  // Short, human tagline used across metadata and the OG card.
  tagline: "All-You-Can-Eat Korean BBQ in Oceanside",
  cuisine: "Korean",
  // Per-person lunch/dinner run about $22 to $31; "$$" is the schema convention.
  priceRange: "$$",
} as const;

export const PHONE = {
  display: "(760) 433-1888",
  href: "tel:+17604331888",
} as const;

export const ADDRESS = {
  street: "2216 S El Camino Real #108–109",
  region: "Oceanside, CA 92054",
} as const;

// Structured address for schema.org PostalAddress and local SEO.
export const ADDRESS_PARTS = {
  street: "2216 S El Camino Real #108-109",
  city: "Oceanside",
  state: "CA",
  zip: "92054",
  country: "US",
} as const;

// Approximate storefront coordinates for schema `geo` (verify the exact point
// against the Google Business Profile before launch).
export const GEO = { lat: 33.1767, lng: -117.3503 } as const;

// Opening hours in 24h form for openingHoursSpecification. Mirrors the human
// HOURS below — keep the two in step.
export const HOURS_SPEC = [
  {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
    opens: "12:00",
    closes: "21:30",
  },
  { days: ["Friday", "Saturday"], opens: "12:00", closes: "22:00" },
] as const;

// A directions deep-link to the storefront (used by the footer + contact CTA).
export const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent("KM.BBQ, 2216 S El Camino Real #108-109, Oceanside, CA 92054");

export const HOURS = [
  { days: "Sunday – Thursday", short: "Sun–Thu", time: "12:00 PM – 9:30 PM" },
  { days: "Friday – Saturday", short: "Fri–Sat", time: "12:00 PM – 10:00 PM" },
] as const;

export type SocialKey = "instagram" | "tiktok" | "yelp";

export const SOCIALS: { key: SocialKey; label: string; href: string }[] = [
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/kmkoreanbbq/" },
  { key: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@kmkoreanbbq" },
  { key: "yelp", label: "Yelp", href: "https://www.yelp.com/biz/km-bbq-oceanside-2" },
];
