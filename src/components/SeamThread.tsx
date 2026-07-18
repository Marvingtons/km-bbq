/**
 * SeamThread — the recurring connective motif. A thin ember hairline sits at the
 * very top of a section (i.e. on the seam with the section above it) and draws
 * itself downward as that seam scrolls up through the boundary zone
 * (stroke-dashoffset scrubbed by SeamMotion). Same weight, colour, and length at
 * every seam, so each boundary is stitched with one quiet signature.
 *
 * Defaults to fully drawn (dashoffset 0) so no-JS and reduced-motion show a
 * static hairline rather than nothing.
 */
export function SeamThread() {
  return (
    <span
      aria-hidden="true"
      className="seam-thread pointer-events-none absolute left-1/2 top-0 z-[15] -translate-x-1/2"
    >
      <svg
        width="2"
        height="72"
        viewBox="0 0 2 72"
        className="block overflow-visible"
      >
        <line
          className="seam-thread-line"
          x1="1"
          y1="0"
          x2="1"
          y2="72"
          stroke="var(--color-ember)"
          strokeWidth="1.5"
          strokeOpacity="0.45"
          strokeLinecap="round"
          strokeDasharray="72"
          strokeDashoffset="0"
        />
      </svg>
    </span>
  );
}
