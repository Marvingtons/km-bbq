import Link from "next/link";

// The one call-to-action button. An ember-deep outline pill that wipes to a
// filled ember-deep on hover/focus (white text). ember-deep — not ember — so
// the resting label clears AA on cream and the filled state clears AA in white.
// Was duplicated as a ~60-class string in two places in About; this is the
// single source. (The Hero's hairline CTA is the one sanctioned exception,
// tracked as TODO(step6); the red game dome is a prop, not a button.)
const PILL =
  "relative isolate inline-flex items-center gap-2 overflow-hidden rounded-full border border-ember-deep px-8 py-3 font-sans text-sm font-medium text-ember-deep transition-colors duration-300 ease-out before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-ember-deep before:transition-transform before:duration-300 before:ease-out hover:text-white hover:before:scale-x-100 focus-visible:text-white focus-visible:before:scale-x-100";

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
