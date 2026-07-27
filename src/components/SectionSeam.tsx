/**
 * The one transition device: an ember hairline, drawn wherever the page's
 * ground changes.
 *
 * It is the preloader's exit line reused — that sequence ends on an ember
 * hairline sweeping the cream field away, so using the same rule at every
 * ground change makes the loading sequence and the page one visual language
 * rather than two unrelated ideas.
 *
 * Only at a GROUND change (cream <-> plum-ink). Two sections that share a
 * ground are joined by rhythm, not by a rule; a hairline between them would be
 * a border, and the site does not use borders between sections.
 *
 * Absolutely positioned: the caller places it (`top-0` on the arriving section
 * is the normal case) and the section must be `relative`.
 */
export function SectionSeam({ className = "top-0" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-30 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent ${className}`}
    />
  );
}
