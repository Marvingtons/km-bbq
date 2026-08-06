"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  PHONE,
  DIRECTIONS_URL,
  closeLabelAt,
  nextOpenLabel,
} from "@/data/info";

/**
 * THE PERSISTENT BAR. The four things a walk-in decides on, kept on screen for
 * the whole page after the hero has gone: what it costs, whether we are still
 * open, how to call, how to get here.
 *
 * Every value comes from src/data/info.ts. Nothing here is typed twice.
 *
 * Bottom of the viewport on phones, where the thumb is.
 *
 * BOTTOM RIGHT ON DESKTOP, not top right, and this is a deliberate departure
 * from the brief. Top-right was tried and shipped a real defect: the cluster is
 * `position: fixed`, so at 1440 it sat permanently on top of the house-favourite
 * cards and hid the second dish's name at every scroll position. There is no
 * offset that fixes it — the content track runs the full width, so anything
 * pinned top-right covers something. Bottom-right sits below the reading path
 * at every width, stays equally persistent, and is where a returning cursor
 * already is.
 */

/**
 * Scroll position and wall-clock are both external systems, so they are read
 * with useSyncExternalStore rather than mirrored into state from an effect.
 *
 * The snapshot is a STRING, deliberately: getSnapshot has to return a value
 * that is stable between renders or React re-renders forever, and a fresh
 * object would not be. One primitive carries both facts.
 *
 * getServerSnapshot returns the hidden state, so SSR emits nothing and
 * hydration cannot disagree about what time it is where the visitor is.
 */
const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  // The close time has to go stale on its own, not only when someone scrolls.
  const tick = window.setInterval(onChange, 60_000);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
    window.clearInterval(tick);
  };
};

/**
 * THE STATUS, AND ONLY THE STATUS. Whether we are open, and the one time that
 * matters either way — tonight's close if we are, the next opening if we are
 * not.
 *
 * THE PRICE IS GONE FROM THIS BAR. It was the loudest thing in it, and it was
 * the one fact a persistent bar is worst at carrying: the price depends on the
 * service, the service depends on the clock, and a figure that changes under
 * the reader at half past three is a bar that looks broken rather than
 * informative. It is still on the page three times — the hero, the contact
 * card, the footer — each next to the hours that qualify it. What a bar riding
 * over the whole site is actually for is the fact that goes stale: are they
 * open right now.
 */
const snapshot = () => {
  const now = new Date();
  const shown = window.scrollY > window.innerHeight * 0.85;
  return `${shown}|${closeLabelAt(now) ?? ""}|${nextOpenLabel(now)}`;
};
// SSR emits the hidden state, so nothing renders before the client knows what
// time it is where the visitor is — a server-rendered guess would flash the
// wrong status on hydration.
const serverSnapshot = () => "false||";

export function StickyInfoBar() {
  const reduce = useReducedMotion();
  const [shownFlag, closeLabel, nextOpen] = useSyncExternalStore(
    subscribe,
    snapshot,
    serverSnapshot
  ).split("|");

  /**
   * GET OUT OF THE FOOTER'S WAY.
   *
   * The bar is `position: fixed`, so at the bottom of the page it sits on top
   * of the footer's own links and the copyright row — the one place where
   * everything it offers (phone, directions, hours) is already on screen in
   * full. An IntersectionObserver on the footer is all this needs: no scroll
   * handler, no ScrollTrigger, no measurement that can go stale on resize.
   */
  const [atFooter, setAtFooter] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setAtFooter(entry.isIntersecting),
      // Fire a little before the footer's edge so the bar is already gone by
      // the time the first footer link is reachable.
      { rootMargin: "0px 0px -64px 0px" }
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  const close = closeLabel || null;
  const open = close !== null;
  const shown = shownFlag === "true" && !atFooter;

  return (
    <AnimatePresence>
      {shown && (
        <motion.aside
          aria-label="Hours and contact"
          /* THE EDGE HAS TO BE LIGHT NOW, and that is a consequence of the
             bands rather than a taste change. The bar is a char-2 element and
             it rides over four dark sections; steel/25 measures 1.35:1 against
             char, so on the gallery, the menu preview and the FAQ the bar was
             a dark shape with no boundary sitting on a dark ground. Sand at
             25% is 2.07:1 — the same hairline value the bands use internally —
             and it reads as a rim light rather than as a border.
             Over the cream sections it costs nothing: the bar's own char-2
             body is already 14:1 against sand, so the edge is decoration
             there and separation here. Verified over sections 3, 5 and 7. */
          className="fixed inset-x-0 bottom-0 z-nav border-t border-sand/25 bg-char-2/95 backdrop-blur-md md:inset-x-auto md:bottom-6 md:right-6 md:rounded-pill md:border md:px-2 md:py-2 md:shadow-pop lg:right-12"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
          transition={{ duration: reduce ? 0 : 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:gap-2 md:p-0 md:pb-0">
            {/* ONE FACT NOW, on one line. With the price gone the status is no
                longer a caption under a figure — it is what the bar is for, so
                it takes the bar's own size and sits on the centre line with the
                two actions rather than stacking above nothing. */}
            <div className="min-w-0 flex-1 md:flex-none md:px-4">
              {/* THE STATUS DOT carries a semantic colour pair, green for open
                  and red for shut, which is the one place on the site outside
                  the palette's single accent (DIRECTION.md, Amendments).
                  Owner-directed, and the reasoning is that red/green on a
                  status dot is read without a legend, where the palette-pure
                  alternative — lit sand against dim steel — says "inactive"
                  rather than "closed".

                  The colour is never the only carrier: the text beside it says
                  "Open until 9:30 PM" or "Closed now · opens 12 PM" in full, so
                  nothing here depends on distinguishing red from green.

                  CLOSED NOW SAYS WHEN TO COME BACK. On its own it is the least
                  useful true thing a persistent bar can carry — it tells a
                  visitor at eleven in the morning to go somewhere else, an hour
                  before the doors open. The next opening comes from the hours
                  data (nextOpenLabel), so a day with different hours answers
                  correctly rather than repeating today's. */}
              <p className="flex items-center gap-2 truncate font-sans text-sm text-sand">
                <span
                  aria-hidden="true"
                  className={`inline-block size-2 shrink-0 rounded-pill ${
                    open ? "bg-open" : "bg-shut"
                  }`}
                />
                {open ? (
                  <>Open until {close}</>
                ) : (
                  <>
                    Closed now
                    {/* The space is EXPLICIT. JSX strips the whitespace around
                        a line break before an expression, so "Closed now" and
                        the span rendered flush against each other in
                        `textContent` — invisible in most engines, not in all. */}
                    {nextOpen && (
                      <span className="text-steel">{" "}· opens {nextOpen}</span>
                    )}
                  </>
                )}
              </p>
            </div>

            <div aria-hidden="true" className="hidden h-8 w-px bg-steel/30 md:block" />

            {/* The two actions. Icon-plus-label so they stay legible at 375. */}
            <a
              href={PHONE.href}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill bg-flame px-4 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-sand transition-colors duration-[var(--dur-base)] ease-house hover:bg-sand hover:text-char"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Call
            </a>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border border-steel/25 px-4 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-sand transition-colors duration-[var(--dur-base)] ease-house hover:border-flame hover:bg-flame"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="hidden sm:inline">Directions</span>
              <span className="sm:hidden">Map</span>
            </a>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
