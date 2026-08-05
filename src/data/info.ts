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

/**
 * 24h "HH:MM" as the site writes clock times: "4:00 PM", "9:30 PM".
 *
 * Exported because two different kinds of value need it — a service cutoff and
 * an opening-hours boundary — and a second formatter is how "4:00 PM" and
 * "4 PM" end up on the same page.
 */
export function time12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Minutes since midnight, for comparing "HH:MM" against a wall clock. */
const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * PRICE IS CONTENT, and it is now also a SCHEDULE. These render in the hero,
 * the sticky bar, the contact card, the footer and the menu page.
 *
 * `price` is the number and nothing formats it twice — `display` is derived
 * from it below, so there is exactly one place the figure is written. The old
 * shape held pre-formatted strings ("$21.99"), which was fine while price was
 * the only fact; it is not, now that the bar has to know which window we are in.
 */
const service = <T extends { price: number; label: string }>(s: T) => ({
  ...s,
  display: `$${s.price.toFixed(2)}`,
});

export const PRICING = {
  lunch: service({
    price: 21.99,
    label: "Lunch",
    /**
     * CONFIRMED with the restaurant, 2026-08-04. It shipped as a placeholder
     * 4:00 PM for one patch; it is 3:30.
     *
     * Load-bearing: the sticky bar switches from the lunch price to the dinner
     * price on this number, the menu page's service toggle defaults from it,
     * and the contact card and footer both print it. One value, five surfaces.
     */
    until: "15:30",
  }),
  dinner: service({ price: 30.99, label: "Dinner" }),
  /** Table time limit, and the "last call" beat the staff actually run. */
  seatingMinutes: 90,
  seatingLabel: "90 min",
  lastCallMinutes: 75,
} as const;

/** "4:00 PM" — the boundary, formatted once for every surface that names it. */
export const LUNCH_UNTIL = time12(PRICING.lunch.until);

// The real in-store promotion, quoted verbatim wherever it appears.
export const CLOCK_PROMO = {
  target: "10.00",
  // FACTUAL CORRECTION. The poster by the door says a perfect 10.00 wins THAT
  // MEAL, not a future one — "your next visit is free" was promising something
  // the restaurant does not offer, which is the one class of error Law 1 exists
  // to prevent. One string, and every surface that quotes the promotion reads
  // it from here.
  rule: "Stop it dead on 10.00 seconds and your all-you-can-eat is free.",
  /**
   * WHOSE MEAL IT IS, and it is one line because it kept being read wrong.
   * "your all-you-can-eat is free" beside a section about a TABLE game reads as
   * the table eating free — which is a much larger promise than the restaurant
   * makes. The prize is one cover: the person who pressed the button. Stated
   * here rather than in the component so every surface that quotes the
   * promotion can quote the qualifier with it.
   */
  scope: "Yours, not the whole table's, so everyone gets a shot.",
  /** The win state, in the same singular. */
  won: "one free AYCE for the presser",
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

/** Today's block, or undefined on a day we never open. */
const blockFor = (day: number) =>
  HOURS_SPEC.find((b) => (b.dayNums as readonly number[]).includes(day));

/** Are we serving right now? The sticky bar's dot and its price both ask this. */
export function isOpenAt(now: Date): boolean {
  const block = blockFor(now.getDay());
  if (!block) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (
    minutes >= minutesOf(block.opens) && minutes < minutesOf(block.closes)
  );
}

/** Tonight's closing label, or null when we are shut. */
export function closeLabelAt(now: Date): string | null {
  return isOpenAt(now) ? (blockFor(now.getDay())?.closeLabel ?? null) : null;
}

/**
 * WHEN WE NEXT OPEN, short form — "12 PM".
 *
 * "Closed now" on its own is the least useful true thing a bar can say: it
 * tells a visitor to go somewhere else. "Closed now · opens 12 PM" tells them
 * to come back, which is the same fact doing the restaurant's job.
 *
 * Derived from the hours rather than assumed, so a day with different opening
 * times answers correctly: today's block if we have not opened yet, otherwise
 * the next day we actually open. Bounded by a week, because a schedule with no
 * open days at all would otherwise loop forever.
 */
export function nextOpenLabel(now: Date): string {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = blockFor(now.getDay());
  if (today && minutes < minutesOf(today.opens)) return short12(today.opens);
  for (let i = 1; i <= 7; i++) {
    const block = blockFor((now.getDay() + i) % 7);
    if (block) return short12(block.opens);
  }
  return short12(HOURS_SPEC[0].opens);
}

/** "12:00" -> "12 PM"; "12:30" -> "12:30 PM". Drops a zero minute, because a
 *  bar this small should not spend three characters saying "on the hour". */
function short12(hhmm: string): string {
  return time12(hhmm).replace(":00", "");
}

/**
 * WHICH SERVICE THE VISITOR IS BEING QUOTED, from their own wall clock.
 *
 * Open, before the cutoff  -> lunch
 * Open, after the cutoff   -> dinner
 * Closed                   -> whatever comes NEXT, which is the only useful
 *                             answer to "what does it cost" at 11pm. We open at
 *                             noon and the cutoff is in the afternoon, so the
 *                             next service is lunch — but that is DERIVED from
 *                             the opening time rather than assumed, so moving
 *                             either number keeps the answer honest.
 *
 * Lives here rather than in the bar because the contact card and the footer
 * quote the same two windows, and a rule about prices belongs with the prices.
 */
export function serviceAt(now: Date): typeof PRICING.lunch | typeof PRICING.dinner {
  const cutoff = minutesOf(PRICING.lunch.until);
  if (isOpenAt(now)) {
    const minutes = now.getHours() * 60 + now.getMinutes();
    return minutes < cutoff ? PRICING.lunch : PRICING.dinner;
  }
  // Closed: quote the service the doors next open into. Today's block if we
  // have not opened yet, otherwise tomorrow's — either way it is the `opens`
  // time that decides, not the hour it happens to be now.
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const today = blockFor(day);
  const beforeToday = today && minutes < minutesOf(today.opens);
  const next = beforeToday
    ? today
    : (blockFor((day + 1) % 7) ?? blockFor(day) ?? HOURS_SPEC[0]);
  return minutesOf(next.opens) < cutoff ? PRICING.lunch : PRICING.dinner;
}

/**
 * RESERVATIONS, and they are real. The site said "walk-in only, no reservations
 * needed" everywhere — that was true when it was written and is not now: the
 * restaurant takes bookings through Yelp. Both facts are true at once, so the
 * copy the site carries is "Walk-ins welcome · Reservations available" rather
 * than a straight swap that would turn away someone who just wanted to show up.
 */
export const RESERVATION_URL =
  "https://www.yelp.com/reservations/km-bbq-oceanside-2";

/** The one line every surface uses to say it. Changed in one place. */
export const WALK_IN_LINE = "Walk-ins welcome · Reservations available";

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
