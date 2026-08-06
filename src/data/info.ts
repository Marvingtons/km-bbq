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
    /**
     * LUNCH IS A WEEKDAY PRICE. Confirmed 2026-08-06: $21.99 applies Monday to
     * Friday until the cutoff above, and Saturday and Sunday are dinner
     * pricing all day.
     *
     * THE CLOCK ALONE IS NO LONGER THE ANSWER, and that is the whole of this
     * change: every "is it lunch right now" question has to ask the DAY first.
     * `serviceAt()` below is the one place that decides, and nothing else may
     * compare a wall clock to `until` on its own.
     *
     * DAY NUMBERS, NOT NAMES, and deliberately: `HOURS_SPEC` already keys off
     * `dayNums` with JS `getDay()` semantics (0 = Sunday), and two day
     * representations in the one file that exists to prevent drift is exactly
     * the drift. The change brief sketched `['mon','tue',...]`; this is the
     * same set in the notation the file already speaks.
     *
     * NOTE: this does NOT touch opening hours. The doors open at the same
     * times all week (see HOURS_SPEC). Only the price window moved.
     */
    days: [1, 2, 3, 4, 5],
  }),
  dinner: service({ price: 30.99, label: "Dinner" }),
  /** Table time limit, and the "last call" beat the staff actually run. */
  seatingMinutes: 90,
  seatingLabel: "90 min",
  lastCallMinutes: 75,
} as const;

/** "3:30 PM" — the boundary, formatted once for every surface that names it. */
export const LUNCH_UNTIL = time12(PRICING.lunch.until);

/* ---------------------------------------------------------------------------
   THE QUALIFIERS, WRITTEN ONCE.

   Six surfaces now have to say "weekdays only" in their own register, and a
   price rule that is retyped per surface is a price rule that will disagree
   with itself. These are the only strings any component may print for it.

   EN DASHES ARE CORRECT HERE. `Mon–Fri` and `Sat–Sun` are RANGES, the same
   class as `Sun–Thu` in HOURS and `12:00 PM – 9:30 PM` in the time strings —
   not em dashes joining clauses. The copy pass's sweep excludes ranges
   explicitly, and its final grep only forbids `—`.
   --------------------------------------------------------------------------- */

/** "Mon–Fri". The long form, for anywhere with room for it. */
export const LUNCH_DAYS_LABEL = "Mon–Fri";
/** "M–F". The compact form, for the hero's one-line phone layout. */
export const LUNCH_DAYS_SHORT = "M–F";
/** "Sat–Sun". Named rather than inferred, so the weekend is one string too. */
export const DINNER_DAYS_LABEL = "Sat–Sun";

/** "Mon–Fri until 3:30 PM" — the lunch window as a full phrase. */
export const LUNCH_WINDOW_LINE = `${LUNCH_DAYS_LABEL} until ${LUNCH_UNTIL}`;
/** "after 3:30 PM and all day Sat–Sun" — the dinner window as a full phrase. */
export const DINNER_WINDOW_LINE = `after ${LUNCH_UNTIL} and all day ${DINNER_DAYS_LABEL}`;

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

/* 24h form for openingHoursSpecification, and the source the sticky bar reads
   to work out tonight's close. `day` is JS getDay(): 0 = Sunday.

   ===========================================================================
   TODO: CONFIRM WITH CLIENT — THE DOOR SIGN DISAGREES WITH THESE HOURS.
   ===========================================================================
   Found 2026-08-06 while propagating the weekday-lunch rule. The restaurant's
   own "HOURS OF BUSINESS" sign is legible in `public/images/outside.png`, the
   storefront photograph this site already ships in the Contact section, and it
   reads:

       MONDAY - FRIDAY
         LUNCH TIME   11:30AM - 3:30PM
         DINNER TIME   4:30AM - 9:30PM     <- "4:30AM" is a typo ON THE SIGN
       SATURDAY & SUNDAY
                      11:30AM - 9:30PM

   IT CORROBORATES THE PRICING CHANGE, which is why it is worth trusting at
   all: lunch is a Monday-to-Friday service ending at 3:30, and the weekend has
   no lunch sitting listed. That is exactly the rule this file now encodes.

   It also disagrees with the three values below, in three ways:

     1. OPENS. The sign says 11:30 AM every day; we publish 12:00 PM.
     2. A WEEKDAY BREAK. The sign shows lunch ending at 3:30 and dinner
        starting at 4:30, i.e. an hour when the doors are shut. We publish one
        continuous block.
     3. SATURDAY CLOSE. The sign says 9:30 PM at the weekend; we publish
        10:00 PM on Friday AND Saturday.

   NOT CHANGED, DELIBERATELY, and for two reasons. The change brief that
   surfaced this was explicit that hours are out of scope ("this is a pricing
   window change only"), and a photograph is evidence rather than a record: the
   sign may predate the hours the owner gave us, or the reverse. Publishing an
   opening time an hour early is the kind of error that sends someone to a
   locked door, and guessing which source is current is not a decision to make
   from a JPEG.

   Note that none of this makes the PRICING copy wrong: "dinner applies after
   3:30 PM" holds whether or not the room is shut between 3:30 and 4:30.
   =========================================================================== */
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
 * IS THIS MOMENT INSIDE THE LUNCH WINDOW? Day first, then clock.
 *
 * THE ONE PREDICATE, and everything about lunch pricing goes through it. The
 * rule used to be a single comparison against `until`, so every caller could
 * reasonably ask the question itself; with a day term as well, a caller that
 * asks it itself is a caller that will forget the weekend. Nothing outside this
 * file compares a wall clock to `PRICING.lunch.until`.
 *
 * Takes a day and minutes rather than a Date, because `serviceAt` has to ask it
 * about a moment that is not now: the next time the doors open.
 */
function isLunchWindow(day: number, minutes: number): boolean {
  const days: readonly number[] = PRICING.lunch.days;
  return days.includes(day) && minutes < minutesOf(PRICING.lunch.until);
}

/** Is the visitor's own moment a lunch-priced one? The public form. */
export function isLunchAt(now: Date): boolean {
  return isLunchWindow(now.getDay(), now.getHours() * 60 + now.getMinutes());
}

/**
 * WHICH SERVICE THE VISITOR IS BEING QUOTED, from their own wall clock AND
 * their own calendar.
 *
 * Open, inside the lunch window   -> lunch   (weekday, before the cutoff)
 * Open, outside it                -> dinner  (weekday evening, or any weekend)
 * Closed                          -> whatever the doors next open INTO, which
 *                                    is the only useful answer to "what does it
 *                                    cost" at 11pm.
 *
 * THE CLOSED BRANCH NOW HAS TO CARRY THE DAY WITH IT. It used to find the next
 * block and compare its `opens` time to the cutoff, which was sufficient while
 * lunch was a pure clock rule. It is not any more: the doors open at noon every
 * day of the week, so on a Friday night that test says "opens at 12, 12 is
 * before 3:30, therefore lunch" — and Saturday has no lunch. The search tracks
 * which DAY it lands on and asks the same predicate the open branch does.
 *
 * Bounded by seven days, because a schedule with no open days would otherwise
 * loop forever. Same guard `nextOpenLabel` uses.
 *
 * Lives here rather than in the bar because the footer, the nav overlay and the
 * menu toggle quote the same two windows, and a rule about prices belongs with
 * the prices.
 */
export function serviceAt(now: Date): typeof PRICING.lunch | typeof PRICING.dinner {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  if (isOpenAt(now)) {
    return isLunchWindow(day, minutes) ? PRICING.lunch : PRICING.dinner;
  }

  // Closed. Find the next moment the doors open, as a (day, minute) pair, and
  // ask the same question of it.
  const today = blockFor(day);
  if (today && minutes < minutesOf(today.opens)) {
    return isLunchWindow(day, minutesOf(today.opens))
      ? PRICING.lunch
      : PRICING.dinner;
  }
  for (let i = 1; i <= 7; i++) {
    const nextDay = (day + i) % 7;
    const block = blockFor(nextDay);
    if (block) {
      return isLunchWindow(nextDay, minutesOf(block.opens))
        ? PRICING.lunch
        : PRICING.dinner;
    }
  }
  return PRICING.dinner;
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
