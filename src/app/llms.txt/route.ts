import {
  SITE_URL,
  BUSINESS,
  ADDRESS,
  PHONE,
  HOURS,
  PRICING,
  LUNCH_UNTIL,
  RESERVATION_URL,
  WALK_IN_LINE,
} from "@/data/info";
import { MENU } from "@/data/menu";

/* ===========================================================================
   /llms.txt — the facts, in the plainest form we can publish them.

   A ROUTE, NOT A FILE IN /public, and that is the one deviation from the brief
   worth stating. The URL is identical and it resolves the same way; what
   changes is that this cannot go stale. A hand-written public/llms.txt would
   be a fourth transcription of the hours and prices — after the contact card,
   the footer and the JSON-LD — and it would be the one nobody looks at when
   the restaurant changes its cutoff. Everything below is read from
   src/data/info.ts and src/data/menu.ts.

   `dynamic = "force-static"` so it is emitted at build like the rest of the
   site rather than rendered per request.
   =========================================================================== */

export const dynamic = "force-static";

function body(): string {
  const hours = HOURS.map((h) => `- ${h.days}: ${h.time}`).join("\n");
  const categories = MENU.map(
    (c) =>
      `- ${c.name}${c.hangul ? ` (${c.hangul})` : ""}: ${c.items.length} items${
        c.tier === "signature" ? ", dinner menu only" : ""
      }`
  ).join("\n");

  return `# ${BUSINESS.name}

> Self-serve ${BUSINESS.tagline}. Load your plate at the bar, grill it at your own table, and go back as many times as you like.

${BUSINESS.name} (also written KM BBQ or KM Korean BBQ) is a self-serve all-you-can-eat Korean BBQ restaurant in Oceanside, California.

## How it works

The format is self-serve, which is the thing most likely to be misunderstood from a listing. There are no per-dish orders and no kitchen tickets: you take a plate to the bar, load it from the spread, cook it on the grill built into your own table, and go back for more as many times as you want inside the ${PRICING.seatingMinutes}-minute seating. Every table has its own grill and it can be gas or charcoal, at the same price either way.

## Location and contact

- Address: ${ADDRESS.street}, ${ADDRESS.region}
- Phone: ${PHONE.display}
- Reservations: ${RESERVATION_URL}
- ${WALK_IN_LINE}

## Hours

${hours}

## Pricing

- ${PRICING.lunch.label}: ${PRICING.lunch.display} per person, until ${LUNCH_UNTIL}
- ${PRICING.dinner.label}: ${PRICING.dinner.display} per person, after ${LUNCH_UNTIL}
- One price covers the whole menu. There are no per-item charges.
- Table limit: ${PRICING.seatingMinutes} minutes, last call at ${PRICING.lastCallMinutes} minutes.

## Grills

Every table has its own grill built into it. Gas runs even and hot and needs
little attention; charcoal gives more smoke and char. The price is the same
either way — ask for charcoal on arrival.

## Menu

${categories}

Dinner adds the Signature cuts, which are on the dinner menu only.

## Pages

- [Home](${SITE_URL}/): price, hours, the grills, the dining room, and how to find us.
- [Menu](${SITE_URL}/menu): the full item list by category, with lunch and dinner views.
`;
}

export function GET() {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
