import {
  SITE_URL,
  BUSINESS,
  PHONE,
  ADDRESS_PARTS,
  GEO,
  HOURS_SPEC,
  SOCIALS,
} from "@/lib/restaurant";

// JSON-LD is built from the same restaurant data the page renders, so the
// structured data can never disagree with the visible hours/address/phone —
// which is exactly the mismatch Google penalizes.

const restaurant = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${SITE_URL}/#restaurant`,
  name: BUSINESS.name,
  url: SITE_URL,
  image: `${SITE_URL}/og.png`,
  telephone: PHONE.href.replace("tel:", ""),
  servesCuisine: BUSINESS.cuisine,
  priceRange: BUSINESS.priceRange,
  // The site is walk-in only ("No reservations needed").
  acceptsReservations: false,
  menu: `${SITE_URL}/menu`,
  address: {
    "@type": "PostalAddress",
    streetAddress: ADDRESS_PARTS.street,
    addressLocality: ADDRESS_PARTS.city,
    addressRegion: ADDRESS_PARTS.state,
    postalCode: ADDRESS_PARTS.zip,
    addressCountry: ADDRESS_PARTS.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: GEO.lat,
    longitude: GEO.lng,
  },
  openingHoursSpecification: HOURS_SPEC.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days,
    opens: h.opens,
    closes: h.closes,
  })),
  sameAs: SOCIALS.map((s) => s.href),
};

export function RestaurantSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurant) }}
    />
  );
}

export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.path === "/" ? SITE_URL : `${SITE_URL}${item.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
