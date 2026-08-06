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

     HOW PREMIUM AND SIGNATURE REACH THE TABLE. The self-serve bar is
     established for the core spread and the site now says so in five places.
     Whether the Premium and dinner-only Signature cuts are ALSO on that bar, or
     are brought out by staff, is not established anywhere in the record — and
     the two answers imply visibly different visits. So nothing on this site
     states either one. Every sentence that mentions those tiers talks about
     what the price INCLUDES and stops there, which is a fact we do hold.

     This is the same discipline as the parking answer, and it is easy to break
     by accident: a single "…and the Premium cuts are there too" would do it.
     Flagged as TODO: CONFIRM WITH CLIENT.
   =========================================================================== */

export interface Faq {
  q: string;
  a: string;
}

const signature = MENU.find((c) => c.id === "signature");
const signatureCount = signature?.items.length ?? 0;

export const FAQS: Faq[] = [
  // FIRST, because it is the question the format actually raises. Someone who
  // has never been to a self-serve KBBQ house does not know whether they order,
  // queue, or get up — and every other answer on this list reads differently
  // once they do.
  {
    q: "How does it work?",
    a: `Serve yourself. Load your plate at the self-serve bar, grill at your table, and go back as many times as you want within your ${PRICING.seatingMinutes} minutes. No ordering, no waiting.`,
  },
  {
    q: "How much is all-you-can-eat?",
    // LUNCH IS A WEEKDAY PRICE, and this answer is the one a searcher is most
    // likely to see out of context — it is the first result the FAQ rich card
    // shows. So it states both halves of the rule in full rather than leaning
    // on the reader having seen the price strip.
    a: `${PRICING.lunch.display} per person for lunch, Monday through Friday until ${LUNCH_UNTIL}. ${PRICING.dinner.display} per person for dinner, which applies after ${LUNCH_UNTIL} on weekdays and all day Saturday and Sunday. One price covers the whole menu. There are no per-item charges.`,
  },
  {
    q: "How long do we get at the table?",
    a: `${PRICING.seatingMinutes} minutes, with last call at ${PRICING.lastCallMinutes} minutes so there is time for a final round. Go back as many times as you like within that.`,
  },
  {
    q: "Do you take reservations?",
    a: "Yes. Reservations are booked through Yelp, and there is a link on this page and in the footer.",
  },
  {
    q: "Can we just walk in?",
    a: "Yes. Walk-ins are welcome any time we are open, and booking ahead is optional rather than required.",
  },
  {
    q: "Is it gas or charcoal?",
    a: "Both. Every table has its own grill built into it, and you can ask for charcoal when you walk in. The price is the same either way.",
  },
  // TWO SENTENCES, AND THE SPLIT IS DELIBERATE. The first says what the spread
  // is and where it lives; the second says Premium is included in the price and
  // says NOTHING about how it reaches the table. Written as one sentence — "…all
  // at the self-serve bar, and so is everything on the Premium list" — it would
  // claim the Premium cuts are self-serve, which is not established. See the
  // accuracy note at the foot of this file.
  {
    q: "What is included in the price?",
    a: "Banchan, fresh vegetables and wraps, house dipping sauces, drink refills and ice cream are all included, and the spread lives at the self-serve bar. Everything on the Premium list is included in the price too.",
  },
  {
    q: "What is the difference between lunch and dinner?",
    // THE WEEKEND CLAUSE. Both halves of the difference move with the day:
    // dinner PRICING and the Signature cuts run from 3:30 on a weekday and from
    // opening on a Saturday or Sunday. Someone planning a weekend visit is
    // exactly who asks this question.
    a: `Dinner adds the Signature cuts: ${signatureCount} items that are on the dinner menu only. On weekdays dinner starts after ${LUNCH_UNTIL}, and on Saturday and Sunday dinner pricing and the Signature cuts run all day. Everything else on the menu is available at both services.`,
  },
  {
    q: "What are your hours?",
    a: `${HOURS.map((h) => `${h.days}, ${h.time}`).join(". ")}.`,
  },
];
