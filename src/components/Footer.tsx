"use client";

import { useRef } from "react";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { Dot } from "./Dot";
import { useReveal } from "@/lib/reveal";
import {
  PHONE,
  ADDRESS,
  HOURS,
  PRICING,
  LUNCH_WINDOW_LINE,
  DINNER_WINDOW_LINE,
  DIRECTIONS_URL,
  RESERVATION_URL,
  WALK_IN_LINE,
} from "@/data/info";

// Absolute hrefs so the footer works from any route: section links return to the
// home page (and scroll to the section), and "Menu" goes to the full menu page.
const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

// THE THREE COLUMN HEADINGS ARE ONE RECIPE, and it is `.eyebrow` — same size,
// weight and tracking as every other eyebrow on the site, with only the colour
// overridden for this ground. The accent lands at 3.4:1 on char-2 and fails AA
// at 12px; sand/60 measures 7.1:1 and a column label is not an affordance
// anyway. Nothing else may be added to this string: a per-column tweak is how
// three headings end up at three sizes.
const label = "eyebrow text-sand/60";

// EVERY COLUMN OPENS WITH THE SAME 36px ROW, which is what top-aligns the three
// eyebrows with the logo — the mark renders at exactly 36px (Logo's 148 × 44/180),
// so one height serves both and the four columns start their content on one
// line. `items-center` inside it, so a heading and a 36px mark centre on the
// same axis rather than sitting on the same top edge at two optical weights.
const topRow = "flex h-9 items-center";

// The gap under every column heading. One value, applied identically, so the
// four columns' first content lines share a baseline — it was `mt-5` on three
// of them and the logo's own block on the fourth.
const headingGap = "mt-5";

// Line-art phone glyph drawn to match the social icon set (18px, 1.5 stroke,
// round caps) so the contact row reads as one icon family. Replaces the ☎ emoji.
function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  // ONE REVEAL FOR THE WHOLE FOOTER, no stagger. Four columns arriving in
  // sequence at the bottom of the page is a choreography nobody scrolled down
  // to watch — the footer is a destination, so it is simply there.
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <footer
      ref={ref}
      data-reveal-group
      // char-2 rather than char: the footer is a raised surface, so it lifts
      // off the page ground by one step instead of being divided from it by a
      // rule. The whole site is dark now, so the four-colour mark sits here the
      // same way it sits everywhere else.
      // 72px of air above the columns, 28px below the divider. The top is
      // generous because the footer has to read as a new surface after the
      // page's last section; the bottom is tight because a copyright line
      // floating in 40px of black reads as an unfinished page.
      className="relative overflow-hidden border-t border-steel/25 bg-char-2 pb-7 pt-[72px] text-sand/70"
      role="contentinfo"
    >
      {/* Ambient warm glow for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-flame/10 blur-[120px]"
      />

      <div className="grid-page relative">
        <div className="col-full" data-reveal>
          {/* The four columns are a layout inside the footer, not four spans of
              the page's 12-column track — so they nest their own grid rather
              than reaching for raw col-span-* against `.grid-page`. That is
              what `.col-full` is for. */}
          {/* items-start, so the four columns hang from ONE top edge. Without
              it the grid's default `stretch` makes every column as tall as the
              tallest and any column that distributes its own children starts
              drifting off the shared baseline. */}
          <div className="grid items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr]">
          {/* Brand. The socials used to be pushed to the column's foot with
              md:mt-auto, which only worked while this was the tallest column;
              once Explore went back to a single column it stretched a 100px
              hole between the tagline and the icons. They sit directly under
              the tagline now and the column simply ends where it ends. */}
          <div className="flex flex-col">
            <div className={topRow}>
              <Logo size={148} className="opacity-90" />
            </div>
            <p className={`copy ${headingGap} max-w-xs text-sand/60`}>
              All-you-can-eat Korean BBQ in Oceanside, California. You pick the
              cuts and grill them yourself right at your table.
            </p>
            <SocialLinks tone="dark" className="mt-6" />
          </div>

          {/* Visit — NAP block + actions.

              NO NAME LINE. It read "KM.BBQ / 2216 S El Camino Real / Oceanside,
              CA" with the mark rendered 200px to its left in the same footer.
              A NAP block wants the name for machines, and the machines get it
              from the JSON-LD in RestaurantSchema.tsx — which is a better
              source than a line of text anyway, and does not spend a line of
              the visible footer repeating the logo. */}
          <div>
            <div className={topRow}>
              <h2 className={label}>Visit</h2>
            </div>
            <address className={`copy ${headingGap} not-italic text-sand/70`}>
              {ADDRESS.street}
              <br />
              {ADDRESS.region}
            </address>
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={PHONE.href}
                className="group inline-flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-sand/90 transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
              >
                <span className="text-sand transition-transform duration-[var(--dur-base)] ease-house group-hover:scale-110">
                  <PhoneIcon />
                </span>
                {PHONE.display}
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 w-fit items-center gap-1.5 font-sans text-sm font-medium text-sand transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
              >
                Get directions
                <span
                  aria-hidden="true"
                  className="transition-transform duration-[var(--dur-base)] ease-house group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
              <a
                href={RESERVATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 w-fit items-center gap-1.5 font-sans text-sm font-medium text-sand transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
              >
                Reserve a table
                <span
                  aria-hidden="true"
                  className="transition-transform duration-[var(--dur-base)] ease-house group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Hours — and now price, because they are one question.

              A visitor who has scrolled to the footer is deciding whether to
              come. "When are you open" and "what does it cost" are the two
              halves of that decision and they were a page apart; answering both
              in one column is the entire reason this block exists. Same source
              as the contact card and the sticky bar — data/info.ts. */}
          <div>
            <div className={topRow}>
              <h2 className={label}>Hours</h2>
            </div>
            <dl className={`${headingGap} space-y-2 font-sans text-sm`}>
              {HOURS.map(({ days, time }) => (
                <div key={days} className="flex flex-col">
                  <dt className="font-medium text-sand/80">{days}</dt>
                  <dd className="font-normal text-sand/60">{time}</dd>
                </div>
              ))}
            </dl>
            {/* THE PRICE WINDOWS, AND LUNCH IS A WEEKDAY PRICE.
                The second line under each figure used to read "until 3:30 PM" /
                "after 3:30 PM", which is only true Monday to Friday: a visitor
                reading this on a Saturday would have taken $21.99 as available
                and been wrong at the door. Both phrases come from
                LUNCH_WINDOW_LINE / DINNER_WINDOW_LINE in data/info.ts so the
                rule is written once for all six surfaces that state it. */}
            <dl className="mt-4 space-y-2 border-t border-steel/25 pt-4 font-sans text-sm">
              {[PRICING.lunch, PRICING.dinner].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="font-medium text-sand/80">
                    {s.label} · {s.display}
                  </dt>
                  <dd className="font-normal text-sand/60">
                    {s === PRICING.lunch ? LUNCH_WINDOW_LINE : DINNER_WINDOW_LINE}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-sans text-xs font-normal text-sand/50">
              {WALK_IN_LINE}
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation">
            <div className={topRow}>
              <h2 className={label}>Explore</h2>
            </div>
            {/* One column. Five items across two columns leaves Contact
                orphaned on a row by itself.

                TIGHT AND EVEN, which it was not. It ran `min-h-11` links with
                `space-y-1` between them: 44px boxes separated by 4px, so the
                rows were tall, the gaps were hairlines, and the list read as
                five unrelated blocks rather than one. Now the gap is the
                visible 12px and the row is the text — 38px of rhythm against
                48px, and the eye can see the interval.

                The tap box drops below 44px as a result. That rule is enforced
                on `header a` and the hero CTA (tools/verify-mobile.mjs), which
                are the targets a thumb reaches for; a footer link list is
                dense reference material and the brief asked for the tighter
                setting explicitly.

                LEFT-ALIGNED WITH THE HEADING, and the hover marker no longer
                breaks that. It used to grow from `w-0 mr-0` to `w-4 mr-2`
                INSIDE the flow, so hovering pushed the label 24px right and the
                list jittered under the cursor. The rule is absolutely
                positioned in the gutter now: it draws in the margin, and the
                label does not move. */}
            <ul className={`${headingGap} flex flex-col gap-3`} role="list">
              {NAV_LINKS.map(({ label: navLabel, href }) => (
                <li key={navLabel}>
                  <a
                    href={href}
                    className="group relative inline-flex items-center py-0.5 font-sans text-sm text-sand/70 transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute right-full mr-2 h-px w-0 bg-flame transition-all duration-[var(--dur-base)] ease-house group-hover:w-3 motion-reduce:transition-none"
                    />
                    {navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          </div>

        {/* The legal row sits under the four columns and lines up with the
            brand column's left edge. The divider spans the container — it is
            this row's own top border, so it cannot drift from the content it
            divides — and it is steel at 25%, the same hairline the nav and the
            footer's own top edge use. 28px of air below it. */}
        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-steel/25 pt-7 text-sand/55 sm:flex-row sm:items-center">
          <p className="font-sans text-xs">
            &copy; {year} KM<Dot />BBQ. All rights reserved.
          </p>
          {/* flex-wrap so the legal links wrap as whole phrases at 375 instead
              of breaking mid-label. */}
          <div className="flex flex-wrap items-center gap-x-5 font-sans text-xs">
            <a
              href="/privacy"
              className="inline-flex min-h-11 items-center transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="inline-flex min-h-11 items-center transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
            >
              Terms of Service
            </a>
            {/* Decorative divider, only when the row sits on one line. It sets no
                colour of its own — the pink that used to live here went with
                --color-neon-pink. */}
            <span aria-hidden="true" className="hidden sm:inline">
              |
            </span>
            <a
              href="https://norvix.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
            >
              Site by Norvix
            </a>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
