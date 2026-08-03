"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PRICING, PHONE, DIRECTIONS_URL, HOURS_SPEC } from "@/data/info";

/**
 * THE PERSISTENT BAR. The four things a walk-in decides on, kept on screen for
 * the whole page after the hero has gone: what it costs, whether we are still
 * open, how to call, how to get here.
 *
 * Every value comes from src/data/info.ts. Nothing here is typed twice.
 *
 * Bottom of the viewport on phones, where the thumb is. A compact cluster at
 * the top right on desktop, clear of the nav bar.
 */

/** Tonight's closing time, or null when we are shut. */
function todaysClose(now: Date): string | null {
  const day = now.getDay();
  const block = HOURS_SPEC.find((b) => (b.dayNums as readonly number[]).includes(day));
  if (!block) return null;
  const [h, m] = block.closes.split(":").map(Number);
  const closesAt = h * 60 + m;
  const [oh, om] = block.opens.split(":").map(Number);
  const opensAt = oh * 60 + om;
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes >= closesAt || minutes < opensAt) return null;
  return block.closeLabel;
}

export function StickyInfoBar() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(false);
  // Rendered only after mount. Opening hours depend on the visitor's clock,
  // which the server cannot know — computing this during SSR would either
  // hydrate-mismatch or bake one visitor's evening into the static HTML.
  const [close, setClose] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setClose(todaysClose(new Date()));
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const open = close !== undefined && close !== null;

  return (
    <AnimatePresence>
      {shown && close !== undefined && (
        <motion.aside
          aria-label="Price, hours and contact"
          className="fixed inset-x-0 bottom-0 z-nav border-t border-char-3 bg-char-2/95 backdrop-blur-md md:inset-x-auto md:bottom-auto md:right-6 md:top-[5.25rem] md:rounded-pill md:border md:px-2 md:py-2 md:shadow-pop lg:right-12"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0, y: 16 }}
          transition={{ duration: reduce ? 0 : 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:gap-2 md:p-0 md:pb-0">
            {/* Price + status. The two facts, stacked tight. */}
            <div className="min-w-0 flex-1 md:flex-none md:px-4">
              <p className="font-display text-md font-black leading-none text-flame [font-stretch:87.5%]">
                {PRICING.lunch}
                <span className="eyebrow ml-2 text-bone/60">Lunch</span>
              </p>
              <p className="mt-1 flex items-center gap-1.5 truncate font-sans text-xs text-smoke">
                <span
                  aria-hidden="true"
                  className={`inline-block size-1.5 shrink-0 rounded-pill ${
                    open ? "bg-ember" : "bg-char-3"
                  }`}
                />
                {open ? `Open until ${close}` : "Closed now"}
              </p>
            </div>

            <div aria-hidden="true" className="hidden h-8 w-px bg-char-3 md:block" />

            {/* The two actions. Icon-plus-label so they stay legible at 375. */}
            <a
              href={PHONE.href}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill bg-flame px-4 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-bone transition-colors duration-[var(--dur-base)] ease-house hover:bg-ember hover:text-char"
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
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border border-char-3 px-4 font-sans text-xs font-semibold uppercase tracking-[0.08em] text-bone transition-colors duration-[var(--dur-base)] ease-house hover:border-flame hover:bg-flame"
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
