const DEFAULT_ITEMS = [
  "Galbi",
  "Bulgogi",
  "Samgyeopsal",
  "Chadolbaegi",
  "Head Shrimp",
  "Corn Cheese",
  "Japchae",
  "Kimchi Fried Rice",
  "Beef Tongue",
  "Spicy Pork Belly",
];

/**
 * Full-width scrolling text strip. The track renders the item list twice and
 * the CSS animation slides it by exactly one copy, so the loop is seamless.
 * Decorative: hidden from assistive tech, parked still under reduced motion.
 */
export function Marquee({
  items = DEFAULT_ITEMS,
  className = "bg-brand-ink text-brand-cream",
}: {
  items?: string[];
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden border-y-2 border-brand-ink py-3 ${className}`}
    >
      <div className="marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((item) => (
              <span
                key={item}
                className="flex items-center font-display text-lg font-bold uppercase tracking-wide whitespace-nowrap"
              >
                <span className="px-5">{item}</span>
                <span className="text-brand-orange">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
