"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useReveal } from "@/lib/reveal";
import { MenuJumpNav } from "@/components/MenuJumpNav";
import { CategoryMark, type MarkId } from "@/components/illustrations/CategoryMark";
import { MENU, JUMP_TARGETS, badgesOf, type MenuItem, type MenuCategory } from "@/data/menu";
import { PRICING, LUNCH_UNTIL, serviceAt, time12, HOURS_SPEC } from "@/data/info";

/* ===========================================================================
   THE BOARD — the menu as TYPE, not as a product grid.

   EVERY PER-ITEM PHOTOGRAPH IS GONE, and it is a provenance fix rather than a
   redesign. The images were stock and generated: plausible Korean BBQ, none of
   it cooked in this kitchen, presented under the restaurant's own item names as
   if it were theirs. That is the one thing DIRECTION.md does not allow, and no
   amount of styling makes a picture of somebody else's galbi honest.

   What replaces them is the thing a printed menu has always been — a list of
   names, set well. Rows on the cream, hairline-divided, no cards. The five
   photographs that survive are on the HOMEPAGE preview, where they are five
   specific assets the restaurant owns; nothing on this page requests an image.

   THE SERVICE TOGGLE IS NOT A FILTER UI, it is the two printed cards. The
   restaurant hands you the green menu before half three and the red one after,
   and the difference between them is exactly one section. So the control shows
   what each card costs and when it applies, defaults to whichever card the
   visitor would be handed right now, and lets them look at the other.
   =========================================================================== */

type Service = "lunch" | "dinner";

/** Category id -> ink mark. Every category has one; the map is exhaustive. */
const MARK: Record<string, MarkId> = {
  beef: "beef",
  pork: "pork",
  chicken: "chicken",
  seafood: "seafood",
  "rice-and-more": "rice-and-more",
  vegetables: "vegetables",
  banchan: "banchan",
  dessert: "dessert",
  premium: "premium",
  signature: "signature",
};

/** "12" -> "12:00 PM", for the toggle's own label. */
const OPENS = time12(HOURS_SPEC[0].opens);
/** "12–3:30", the compact form the segmented control uses. */
const LUNCH_WINDOW = `${OPENS.replace(":00", "").replace(" PM", "").replace(" AM", "")}–${LUNCH_UNTIL.replace(" PM", "").replace(" AM", "")}`;

function Row({ item }: { item: MenuItem }) {
  return (
    <li
      className="menu-row border-b border-char/30 py-3.5 last:border-b-0"
      data-reveal
    >
      <div className="flex items-baseline gap-x-3">
        {/* THE PRINTED NUMBER, and it is how people actually order. Small,
            smoke, display face so it reads as a label rather than as part of
            the name. */}
        <span className="shrink-0 font-display text-xs font-bold text-ash [font-stretch:87.5%]">
          {item.num} ·
        </span>
        <h3 className="menu-row-name font-display text-[1.1rem] font-bold leading-tight text-char transition-colors duration-150 ease-house [font-stretch:87.5%]">
          {item.korean ? (
            <>
              {item.korean.toUpperCase()}
              <span className="text-ash"> — {item.name.toUpperCase()}</span>
            </>
          ) : (
            item.name.toUpperCase()
          )}
        </h3>
        {/* BADGES COME FROM THE DATA AND NOWHERE ELSE — condition AND label.
            There is no badge string in this file; `badgesOf` in data/menu.ts
            owns both, so a designation cannot appear on the page without a
            field in the record behind it. */}
        <span className="ml-auto flex shrink-0 items-center gap-1.5">
          {badgesOf(item).map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </span>
      </div>
      {item.hangul && (
        <p className="mt-0.5 font-sans text-xs text-ash">{item.hangul}</p>
      )}
      {item.desc && <p className="copy mt-1 text-sm">{item.desc}</p>}
    </li>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow rounded-pill border border-sand-3 px-2 py-0.5 text-[0.65rem] leading-normal text-ash">
      {children}
    </span>
  );
}

function Category({
  category,
  hidden = false,
}: {
  category: MenuCategory;
  hidden?: boolean;
}) {
  return (
    /* BREAK BEFORE, NEVER INSIDE. The two columns are CSS columns, which flow
       top-to-bottom then across — the right reading order for a list — but by
       default they will split a category between the foot of one column and
       the head of the next, orphaning a header from its items. `break-inside:
       avoid` keeps each category whole. */
    /* EACH CATEGORY IS ITS OWN REVEAL GROUP, so a category deep in the second
       column arrives when the reader reaches it rather than when the board
       does. 0.04s between rows — half the site's stagger, because these are
       lines of a list and not objects — and lib/reveal.ts caps the index at 8,
       so a long category's tail arrives with its eighth row instead of two
       seconds later. */
    <section
      id={category.id}
      className={`mb-9 break-inside-avoid scroll-mt-36 ${hidden ? "hidden" : ""}`}
      // aria-hidden with `hidden`, so a screen reader in the lunch view is not
      // told about a section a sighted reader cannot see. The markup is still
      // in the document, which is the point — this is a display state, not a
      // publishing decision.
      aria-hidden={hidden || undefined}
      data-reveal-group
      data-reveal-stagger="0.04"
    >
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-char/30 pb-3">
        <CategoryMark id={MARK[category.id]} />
        <h2
          className="font-display text-lg font-extrabold uppercase leading-none text-char [font-stretch:87.5%]"
          data-reveal
        >
          {category.name}
        </h2>
        {category.hangul && (
          <span className="font-sans text-sm text-ash">{category.hangul}</span>
        )}
        {category.tag && <span className="eyebrow ml-auto">{category.tag}</span>}
      </div>
      {category.blurb && (
        <p className="copy mb-4 text-sm" data-reveal>
          {category.blurb}
        </p>
      )}
      <ul role="list">
        {category.items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function Segment({
  active,
  onClick,
  label,
  window: win,
  price,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  window: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 rounded-pill px-4 py-2.5 text-center font-sans transition-colors duration-[var(--dur-base)] ease-house active:translate-y-px active:duration-[var(--dur-press)] motion-reduce:transition-none ${
        active
          ? "bg-flame text-sand"
          : "text-ash hover:text-ink"
      }`}
    >
      <span className="eyebrow block text-inherit">{label}</span>
      <span className="mt-1 block text-xs">
        {win} · {price}
      </span>
    </button>
  );
}

/**
 * THE VISITOR'S CLOCK, AS AN EXTERNAL STORE — which is what it is.
 *
 * The obvious version is `useState(() => serviceAt(new Date()))`, and it is
 * wrong: the server has no visitor clock, so it renders LUNCH, and an evening
 * visitor's first client render says DINNER. That is a hydration mismatch, and
 * React does not merely warn about it — it discards the server HTML for the
 * subtree and re-renders on the client, which is the whole point of streaming
 * this page as static thrown away.
 *
 * `useSyncExternalStore` is the supported answer. `getServerSnapshot` returns
 * lunch, hydration matches it exactly, and React re-reads the client snapshot
 * immediately afterwards — so an evening visitor lands on DINNER within a frame
 * without the tree ever disagreeing with itself. Same mechanism the sticky bar
 * uses for the same reason.
 *
 * LUNCH is the right thing to put in the HTML, incidentally: it is the card
 * with the whole core menu on it, so a reader with no JS at all sees more of
 * the restaurant, not less.
 */
const subscribeClock = (onChange: () => void) => {
  const tick = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(tick);
};
const clockSnapshot = (): Service =>
  serviceAt(new Date()) === PRICING.dinner ? "dinner" : "lunch";
const clockServerSnapshot = (): Service => "lunch";

export function MenuBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  useReveal(boardRef);

  // The clock proposes; the reader disposes. `null` means "nobody has touched
  // the control", and only then does the clock decide — so a visitor who
  // switches to lunch at 8pm stays on lunch when the minute ticks over.
  const [override, setOverride] = useState<Service | null>(null);
  const byClock = useSyncExternalStore(
    subscribeClock,
    clockSnapshot,
    clockServerSnapshot
  );
  const service = override ?? byClock;
  const setService = setOverride;

  const showSignature = service === "dinner";
  // Core and premium are on BOTH printed cards; signature is on the red one.
  /* EVERY ITEM SHIPS IN THE HTML. THE TOGGLE ONLY HIDES.

     This filtered `MENU` down to the lunch card, which meant the three
     dinner-only Signature items — 1B, 4B, 5B — did not exist in the server
     payload at all. `useSyncExternalStore` returns lunch on the server by
     design, so the ONLY rendering a crawler or an AI assistant without JS ever
     saw was the lunch card, and three real menu items were invisible to search.
     That is a crawl bug, not a display preference: the page's job is to publish
     the menu.

     So every category renders, always, and the Signature section is hidden with
     `hidden` (plus aria-hidden, so it leaves the a11y tree with it) in the lunch
     view. `hidden` rather than unmounting, because the point is that the markup
     is present.

     The jump pills still filter — a pill that scrolls to a hidden section is a
     dead control, and a nav is not content a crawler needs. */
  const targets = JUMP_TARGETS.filter(
    (t) => t.tier !== "signature" || showSignature
  );

  return (
    <div ref={boardRef}>
      <div className="grid-page pb-6">
        <div className="col-full">
          <div
            role="group"
            aria-label="Lunch or dinner menu"
            className="flex max-w-md gap-1 rounded-pill border border-sand-3 bg-sand-2 p-1"
          >
            <Segment
              active={service === "lunch"}
              onClick={() => setService("lunch")}
              label={PRICING.lunch.label}
              window={LUNCH_WINDOW}
              price={PRICING.lunch.display}
            />
            <Segment
              active={service === "dinner"}
              onClick={() => setService("dinner")}
              label={PRICING.dinner.label}
              window={`After ${LUNCH_UNTIL.replace(" PM", "").replace(" AM", "")}`}
              price={PRICING.dinner.display}
            />
          </div>
        </div>
      </div>

      <MenuJumpNav targets={targets} />

      <div className="grid-page pb-20 pt-10">
        <div className="col-full">
          {/* WITH THE PHOTOGRAPHS GONE THIS LINE CARRIES MORE. It used to be a
              caption under a wall of pictures; it is now the first thing a
              reader meets, and it answers the only question a price-per-item
              menu would have raised. */}
          <p className="copy measure mb-9 text-md text-ink">
            Everything is included in the all-you-can-eat price. No per-item
            charges.
          </p>

          {/* CROSSFADE, KEYED ON THE SERVICE. The shared categories are
              identical between the two cards, so keying the whole column would
              re-mount and re-animate rows that did not change. The key is on a
              wrapper that only the fade reads; React keeps the DOM. */}
          <div
            key={service}
            className="menu-columns motion-safe:animate-[menu-fade_0.25s_var(--ease-house)]"
          >
            {MENU.map((category) => (
              <Category
                key={category.id}
                category={category}
                hidden={category.tier === "signature" && !showSignature}
              />
            ))}

            {/* THE TEASER, and it is deliberately not a link. Signature is on
                the dinner card only; saying so where the section would be is
                more useful than hiding it, and making it clickable would be
                offering something the lunch price does not include. */}
            {!showSignature && (
              <p className="eyebrow mt-2 break-inside-avoid rounded-card border border-dashed border-sand-3 px-4 py-4 text-ash">
                Signature · Dinner only · After {LUNCH_UNTIL}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
