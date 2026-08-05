// Hero copy, kept apart from the layout so wording changes never touch the
// lockup.
//
// Positioning: KM.BBQ is an all-you-can-eat grill house that takes walk-ins
// and, now, reservations. The price and the clock ARE the offer, so they are
// the headline — not a differentiator sentence about self-serve, and not a
// mood word. Everything here is a fact from src/data/info.ts.

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
export const SUBHEAD = "90 minutes on the clock. Walk in, or book ahead.";

/**
 * The one CTA label on the site. `See the menu` is the site-wide standard;
 * `View menu` and `See the full menu` are retired.
 */
export const CTA_LABEL = "See the menu";
export const CTA_HREF = "/menu";
