/**
 * The one transition device: a CHROME hairline, drawn wherever the page's
 * ground changes.
 *
 * It used to be an ember hairline, echoing the preloader's exit line. The seam
 * now takes `steel` instead, and the change is not cosmetic — it is the whole
 * point of the two-value direction. This room's warm surfaces and its black
 * ceiling are physically joined by the chrome downdraft ducts, ten-plus of
 * them, running from the deck to every table. A ground change on the page is
 * the same event as that junction in the room, so it is drawn in the same
 * material.
 *
 * It is also the reason the accent is not used here. The accent has one job,
 * interaction, and a seam is not interactable. Chrome is structural, which is
 * exactly what a seam is.
 *
 * Only at a GROUND change. Two sections that share a ground are joined by
 * rhythm, not by a rule; a hairline between them would be a border, and the
 * site does not use borders between sections.
 *
 * The ground changes on the site, after the direction pass:
 *
 *   Hero -> About       photography -> sand   (the material changes)
 *   Contact -> Footer   sand -> char          (the ceiling arrives)
 *   ...and back to sand wherever a black band ends.
 *
 * The hero one is worth stating explicitly because the rule above reads as if
 * it were about hue. It is not — it is about the page changing what it is made
 * of. A photograph handing over to a flat ground is the largest such change on
 * the site, so it gets the rule even though both sides are warm.
 *
 * Absolutely positioned: the caller places it (`top-0` on the arriving section
 * is the normal case) and the section must be `relative`.
 */
export function SectionSeam({ className = "top-0" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 z-nav h-px bg-gradient-to-r from-transparent via-steel/70 to-transparent ${className}`}
    />
  );
}
