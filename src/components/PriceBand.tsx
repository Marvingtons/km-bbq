import { PRICING } from "@/data/info";

/**
 * The price board. One component, rendered on both routes, reading the one
 * pricing record — so lunch, dinner and the seating limit can never disagree
 * between the homepage and /menu.
 *
 * Three cells, hairline-divided, no box. `flex` rather than `inline-flex` so
 * the cells share the width at 375 instead of overflowing.
 */
const CELLS = [
  { label: "Lunch", value: PRICING.lunch, note: "per person", loud: true },
  { label: "Dinner", value: PRICING.dinner, note: "per person", loud: true },
  {
    label: "Your table",
    value: PRICING.seatingLabel,
    note: `last call at ${PRICING.lastCallMinutes}`,
    loud: false,
  },
];

export function PriceBand({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex max-w-xl items-stretch overflow-hidden rounded-card border border-char-3 bg-char-2 ${className}`}
    >
      {CELLS.map((cell, i) => (
        <div
          key={cell.label}
          className={`flex-1 px-4 py-5 sm:px-7 ${
            i > 0 ? "border-l border-char-3" : ""
          }`}
        >
          <p className="eyebrow">{cell.label}</p>
          <p
            className={`mt-2 font-display text-lg font-black [font-stretch:87.5%] ${
              cell.loud ? "text-flame" : "text-bone"
            }`}
          >
            {cell.value}
          </p>
          <p className="mt-1 font-sans text-xs text-smoke">{cell.note}</p>
        </div>
      ))}
    </div>
  );
}
