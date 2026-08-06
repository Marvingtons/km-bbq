// Hero copy, kept apart from the layout so wording changes never touch the
// lockup.
//
// Positioning: KM.BBQ is a SELF-SERVE all-you-can-eat grill house that takes
// walk-ins and, now, reservations. The price and the clock are still the
// headline, because they are the offer.
//
// The self-serve bar has been promoted from "not a differentiator sentence" to
// the first thing the sub-line says, and that note is reversed deliberately.
// The mechanic is the differentiator: you get up, load a plate from the spread,
// grill it, and go back — there is no server to flag down and no kitchen ticket
// between you and the next round. Order-based language undersold it, and it is
// also a high-value search term ("KBBQ buffet"). Everything here is still a
// fact from src/data/info.ts or the record.

/** Oceanside, not San Diego. See REDESIGN-CONFLICTS.md #1. */
export const EYEBROW = "Korean BBQ · Oceanside, CA";

/** The offer, set at display scale. One line, no ornament. */
export const HEADLINE = "All-You-Can-Eat";

/**
 * The rule of the room, in the order a visitor needs it. "No reservations" was
 * true when this was written and is not now — the restaurant books through
 * Yelp — and a hero that turns away someone looking to reserve is the most
 * expensive place on the site to be out of date.
 */
export const SUBHEAD =
  "Self-serve bar. 90 minutes on the clock. Walk in, or book ahead.";

/**
 * The one CTA label on the site. `See the menu` is the site-wide standard;
 * `View menu` and `See the full menu` are retired.
 */
export const CTA_LABEL = "See the menu";
export const CTA_HREF = "/menu";
