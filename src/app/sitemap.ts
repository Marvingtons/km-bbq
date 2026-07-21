import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/restaurant";

/**
 * The XML sitemap, emitted at /sitemap.xml by the App Router file convention.
 * Search engines only: nothing links to it from the UI, and robots.ts is what
 * points crawlers at it.
 *
 * WHAT IS AND IS NOT A ROUTE. This site has exactly four public routes. About,
 * Gallery and Contact are ANCHORS on the home page (#about, #gallery,
 * #contact) — there is no app/about/page.tsx and never has been. They are
 * deliberately absent here, because either way of adding them would hurt:
 *   - "/about" would be a 404, and submitting 404s is worse than omitting
 *     them (Search Console reports them as errors against the property).
 *   - "https://kmbbq.com/#about" gets discarded anyway: Google strips the
 *     fragment and dedupes it to the home page, so it adds noise, not reach.
 * Those sections are already indexed as part of the home page's content, which
 * is the correct outcome for anchors.
 *
 * Utility routes are excluded on purpose: /robots.txt, /sitemap.xml,
 * /manifest.webmanifest, the generated icon routes and the 404 are all either
 * non-content or non-indexable.
 */

// Build time. Honest for the two content routes, which change whenever the
// site is redeployed.
const BUILT = new Date();

// The legal pages carry their own effective date in visible copy ("Last
// updated July 1, 2026"), so they claim THAT date rather than the build's.
// Stamping all four routes with one identical build timestamp is what makes
// Google discount lastmod as a signal: it only carries weight when it
// demonstrably tracks real content changes.
const LEGAL_UPDATED = new Date("2026-07-01T00:00:00.000Z");

type Entry = {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified: Date;
};

const ROUTES: Entry[] = [
  // The home page carries the hero, about, gallery, the game and contact.
  { path: "/", priority: 1, changeFrequency: "weekly", lastModified: BUILT },
  // The menu is what people actually search for, and what changes most.
  { path: "/menu", priority: 0.9, changeFrequency: "weekly", lastModified: BUILT },
  // Required, rarely read, and should never outrank the real content.
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly", lastModified: LEGAL_UPDATED },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly", lastModified: LEGAL_UPDATED },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    // ABSOLUTE urls, built from SITE_URL. A sitemap carrying relative paths or
    // a localhost origin is silently useless to a crawler, so this never
    // depends on request context. The root is emitted without a trailing
    // slash, matching the canonical that layout.tsx declares.
    url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
    lastModified: r.lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
