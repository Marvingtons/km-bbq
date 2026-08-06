import {
  SITE_URL,
  BUSINESS,
  PHONE,
  ADDRESS_PARTS,
  GEO,
  HOURS_SPEC,
  SOCIALS,
  PRICING,
  RESERVATION_URL,
} from "@/data/info";
import { MENU } from "@/data/menu";

/* ===========================================================================
   STRUCTURED DATA, BUILT FROM THE SAME RECORDS THE PAGE RENDERS.

   Every value here is read from src/data/info.ts or src/data/menu.ts. Nothing
   is retyped, so the markup cannot drift from the visible page — which is the
   one thing that turns structured data from an asset into a liability, because
   search surfaces render the MARKUP and not the copy.

   ONE `@graph` PER PAGE, not a stack of separate <script> tags. Nodes reference
   each other by `@id`, so the Restaurant on the homepage and the Menu on /menu
   are the same entity to a parser rather than two restaurants that happen to
   share a name.

   WHAT IS DELIBERATELY ABSENT:
     - Per-item `offers`/prices. The menu is all-you-can-eat; an item price does
       not exist, and inventing one to fill a recommended field would be a
       claim about what the restaurant charges.
     - `aggregateRating` / `review`. We hold no first-party review data, and
       marking up someone else's is the classic penalty.
     - `servesCuisine` beyond "Korean", `hasMenuItem` nutrition, `starRating`.
       No record, no field.

   An absent field is fine. A wrong field is a liability.
   =========================================================================== */

const ID = {
  restaurant: `${SITE_URL}/#restaurant`,
  website: `${SITE_URL}/#website`,
  menu: `${SITE_URL}/menu#menu`,
} as const;

/** Absolute, because a relative URL in JSON-LD is not resolvable by every parser. */
export const abs = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

/**
 * `priceRange` as a RANGE, which is what it is. Schema.org wants a human
 * string here, and "$$" told a parser nothing a visitor could act on — the two
 * real numbers are the offer.
 */
const priceRange = `${PRICING.lunch.display} - ${PRICING.dinner.display}`;

/** The restaurant itself. The homepage's primary entity. */
export function restaurantNode() {
  return {
    "@type": "Restaurant",
    "@id": ID.restaurant,
    name: BUSINESS.name,
    // The names people actually type. All three are the same business; this is
    // the field that tells a parser so rather than leaving it to guess.
    alternateName: ["KM BBQ", "KM Korean BBQ"],
    /* THE ENTITY DESCRIPTION, and the field was simply absent before.
       It is the same claim the h1's entity statement, the meta description and
       llms.txt make, in the same order — category, format, price, mechanic —
       because an assistant reading the graph and a searcher reading a snippet
       should not get two different accounts of the same restaurant.
       It says NOTHING about how the Premium or Signature tiers reach the table.
       See the accuracy note in src/data/faq.ts. */
    description: `Self-serve all-you-can-eat Korean BBQ in ${ADDRESS_PARTS.city}, ${ADDRESS_PARTS.state}. ${PRICING.lunch.display} lunch, ${PRICING.dinner.display} dinner. Load your plate at the self-serve bar and grill it at your own table, with a grill built into every table.`,
    url: SITE_URL,
    logo: abs("/icon-512.png"),
    image: [abs("/images/outside.png"), abs("/og.png")],
    telephone: PHONE.href.replace("tel:", ""),
    servesCuisine: BUSINESS.cuisine,
    priceRange,
    currenciesAccepted: "USD",
    acceptsReservations: RESERVATION_URL,
    menu: `${SITE_URL}/menu`,
    hasMenu: { "@id": ID.menu },
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
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: RESERVATION_URL,
        inLanguage: "en-US",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/IOSPlatform",
          "http://schema.org/AndroidPlatform",
        ],
      },
      result: {
        "@type": "FoodEstablishmentReservation",
        name: "Reserve a table",
      },
    },
    sameAs: SOCIALS.map((s) => s.href),
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": ID.website,
    url: SITE_URL,
    name: BUSINESS.name,
    inLanguage: "en-US",
    publisher: { "@id": ID.restaurant },
  };
}

/**
 * THE MENU, GENERATED FROM `data/menu.ts`. Never a hand-written copy — a second
 * transcription of 46 items is a second thing to keep current, and the first
 * one to go stale is always the invisible one.
 *
 * Sections are the page's own categories in the page's own order, including
 * Signature, which is on the dinner card only and is described as such rather
 * than omitted: a parser asking "what do they serve" should get the whole
 * answer, and the restriction is information, not a reason to hide three items.
 */
export function menuNode() {
  return {
    "@type": "Menu",
    "@id": ID.menu,
    name: `${BUSINESS.name} Menu`,
    url: `${SITE_URL}/menu`,
    inLanguage: "en-US",
    description:
      "All-you-can-eat Korean BBQ, grilled at your table. One price covers the whole menu; there are no per-item charges.",
    hasMenuSection: MENU.map((category) => ({
      "@type": "MenuSection",
      name: category.name,
      ...(category.tier === "signature"
        ? { description: "On the dinner menu only, after 3:30 PM." }
        : category.blurb
          ? { description: category.blurb }
          : {}),
      hasMenuItem: category.items.map((item) => ({
        "@type": "MenuItem",
        // The same string the page prints, from the same builder — see
        // `displayName` in data/menu.ts. Item numbers are not part of the name:
        // they are the restaurant's ordering shorthand, not the dish.
        name: item.korean ? `${item.korean} — ${item.name}` : item.name,
        ...(item.desc ? { description: item.desc } : {}),
        // NO `offers`. See the header note: item prices do not exist here.
      })),
    })),
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

/**
 * FAQ, and it must MATCH THE VISIBLE TEXT CHARACTER FOR CHARACTER. That is not
 * a style rule — marking up answers a visitor cannot find on the page is what
 * the FAQ rich-result guidelines specifically prohibit. Both the section and
 * this node render from the same `FAQS` array in data/faq.ts.
 */
export function faqNode(faqs: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** Wrap nodes into the one `@graph` a page emits. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/**
 * SELF-CHECK, AT BUILD TIME. Walks the emitted graph for the three things that
 * make structured data actively harmful: an empty string, a placeholder that
 * escaped review, and a URL that never got its domain. It THROWS — a build that
 * fails is cheaper than a graph that ships a `TODO` to Google.
 */
export function assertClean(node: unknown, path = "$"): void {
  if (typeof node === "string") {
    if (node.trim() === "") throw new Error(`Empty string in JSON-LD at ${path}`);
    if (/TODO|TBD|FIXME|lorem|placeholder|example\.com|localhost/i.test(node)) {
      throw new Error(`Placeholder in JSON-LD at ${path}: ${JSON.stringify(node)}`);
    }
    if (/^\/(?!\/)/.test(node) && path.endsWith("url")) {
      throw new Error(`Relative URL in JSON-LD at ${path}: ${node}`);
    }
    return;
  }
  if (node === null || node === undefined) {
    throw new Error(`Null/undefined in JSON-LD at ${path}`);
  }
  if (Array.isArray(node)) {
    node.forEach((child, i) => assertClean(child, `${path}[${i}]`));
    return;
  }
  if (typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      assertClean(value, `${path}.${key}`);
    }
  }
}
