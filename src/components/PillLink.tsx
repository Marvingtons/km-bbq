import Link from "next/link";

// The one call-to-action button. An EMBER outline pill that wipes to a filled
// ember on hover/focus. The label is ink in both states: ember is the site's
// interaction colour, but ember text on cream is 2.3:1, so the border carries
// the colour and the type carries the contrast (ink on cream 15.9:1, ink on
// ember 7:1). This is the same shape and the same two colours as the navbar's
// phone CTA, so every button on the site is one object.
//
// (The hero's CTA is its own cream-filled variant, since ember sits inside the
// video's hue range and stops reading as a control over it; the red game dome
// is a prop, not a button.)
const PILL =
  "relative isolate inline-flex items-center gap-2 overflow-hidden rounded-pill border border-ember px-8 py-3 font-sans text-sm font-medium text-bone transition-colors duration-[var(--dur-base)] ease-house before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-ember before:transition-transform before:duration-[var(--dur-base)] before:ease-house hover:before:scale-x-100 focus-visible:before:scale-x-100";

export function PillLink({
  href,
  children,
  arrow = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link href={href} className={`${PILL} ${className}`}>
      {children}
      {arrow && <span aria-hidden="true">→</span>}
    </Link>
  );
}
