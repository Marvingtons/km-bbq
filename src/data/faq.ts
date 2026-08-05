import { PRICING, LUNCH_UNTIL, HOURS } from "./info";
import { MENU } from "./menu";

/* ===========================================================================
   THE QUESTIONS PEOPLE ACTUALLY ASK, ANSWERED FROM THE RECORD.

   Every answer is derived from src/data/info.ts or src/data/menu.ts. Nothing
   here is written prose about the restaurant — if a fact is not in the data,
   the question is not on this list.

   THE ANSWERS RENDER TWICE: once as the visible FAQ section, once inside the
   `FAQPage` node in the JSON-LD graph. Both read THIS array, because the FAQ
   rich-result guidelines require the marked-up answer to be present on the page
   — marking up an answer a visitor cannot find is the specific thing they
   prohibit, and two copies of a string is how that happens by accident.

   NOT ANSWERED HERE, ON PURPOSE:

     PARKING. The brief asked for it and nothing in the record establishes
     where, whether it is free, or how many spaces — the storefront photograph
     shows a strip-mall unit and that is the whole of what we know. A plausible
     "free parking in the plaza" is exactly the kind of small invention that
     costs trust at the door. Flagged as TODO: CONFIRM WITH CLIENT.
   =========================================================================== */

export interface Faq {
  q: string;
  a: string;
}

const signature = MENU.find((c) => c.id === "signature");
const signatureCount = signature?.items.length ?? 0;

export const FAQS: Faq[] = [
  {
    q: "How much is all-you-can-eat?",
    a: `${PRICING.lunch.display} per person for lunch, until ${LUNCH_UNTIL}, and ${PRICING.dinner.display} per person for dinner after that. One price covers the whole menu — there are no per-item charges.`,
  },
  {
    q: "How long do we get at the table?",
    a: `${PRICING.seatingMinutes} minutes, with last call at ${PRICING.lastCallMinutes} minutes so there is time for a final round. Order as many times as you like within that.`,
  },
  {
    q: "Do you take reservations?",
    a: "Yes. Reservations are booked through Yelp, and there is a link on this page and in the footer.",
  },
  {
    q: "Can we just walk in?",
    a: "Yes — walk-ins are welcome any time we are open. Booking ahead is optional, not required.",
  },
  {
    q: "Is it gas or charcoal?",
    a: "Both. Every table has its own grill built into it, and you can ask for charcoal when you walk in — the price is the same either way.",
  },
  {
    q: "What is included in the price?",
    a: "Banchan, fresh vegetables and wraps, house dipping sauces, drink refills and ice cream are all included. So is everything on the Premium list.",
  },
  {
    q: "What is the difference between lunch and dinner?",
    a: `Dinner adds the Signature cuts — ${signatureCount} items that are on the dinner menu only, after ${LUNCH_UNTIL}. Everything else on the menu is available at both services.`,
  },
  {
    q: "What are your hours?",
    a: `${HOURS.map((h) => `${h.days}, ${h.time}`).join(". ")}.`,
  },
];
