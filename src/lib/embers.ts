import { gsap } from "gsap";

/* ===========================================================================
   THE IGNITION SET.

   The embers are the ONLY thing in the grill illustration that is ever hidden.
   Everything else — the burner plate, the dial, the coals, the grate, the
   divider — renders complete from the first frame and stays that way; the
   section's payoff is the cut, not a build.

   Shared because the fire is lit in two places: scrubbed against the match cut
   above 1024, and as a plain entrance below it.
   =========================================================================== */

/**
 * Is this colour in the red-to-amber wedge? Dominant red channel, real
 * saturation, and a hue between red and yellow. The warm ground is ~0.1
 * saturation and the coal mid-tones are neutral greys, so neither qualifies.
 */
function isHot(colour: string) {
  const m = /rgba?\(([^)]+)\)/.exec(colour);
  if (!m) return false;
  const [r, g, b] = m[1].split(",").map(Number);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (mx < 90 || (mx - mn) / mx < 0.45 || r !== mx) return false;
  const hue = ((g - b) / (mx - mn)) * 60; // 0 = red, 60 = yellow
  return hue >= -10 && hue <= 55;
}

/**
 * Everything the artwork lights up with, FOUND BY COLOUR RATHER THAN BY NAME.
 *
 * "The embers" cannot be a list of class names someone remembered to keep
 * current: a hot shape added to the SVG later would inherit no initial state
 * and glow from the top of the page, under a grill nobody has lit. Asking the
 * stylesheet which shapes are red closes that permanently.
 *
 * Today it resolves to exactly four — two `.ember` at --dg-ember and two
 * `.ember-deep` at --color-flame, all inside #coals. There is no pilot flame on
 * the gas side; the dial marks are --color-char and the ribs are steel.
 *
 * Unioned with the named selector rather than replacing it: if the stylesheet
 * has not applied when this runs, the colour scan finds nothing and the names
 * are still right.
 */
export function findEmbers(svg: SVGSVGElement): SVGGraphicsElement[] {
  const byColour = Array.from(
    svg.querySelectorAll<SVGGraphicsElement>("*")
  ).filter((el) => {
    const cs = getComputedStyle(el);
    return isHot(cs.fill) || (cs.stroke !== "none" && isHot(cs.stroke));
  });
  const byName = Array.from(
    svg.querySelectorAll<SVGGraphicsElement>(
      "#coals .ember, #coals .ember-deep"
    )
  );
  return Array.from(new Set([...byColour, ...byName]));
}

/**
 * The idle pulse, built paused.
 *
 * It tweens opacity ONLY, and only between 0.65 and 1, so at a hand-off
 * boundary it can never drive the embers below the value a scrub is holding
 * them at. Visibility and the ignition ramp stay the caller's.
 */
export function buildEmberLoop(embers: Element[]) {
  return gsap.fromTo(
    embers,
    { opacity: 0.65 },
    {
      opacity: 1,
      duration: 0.9,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: { each: 0.45, from: "random" },
      paused: true,
      // WITHOUT THIS THE LOOP WINS BEFORE IT EVER PLAYS. `fromTo`
      // immediate-renders its from-value at creation time — `paused` stops it
      // advancing, not from painting — so building it stamped opacity 0.65 onto
      // the embers and held it there: they glowed at the top of the page and
      // after scrubbing back to zero.
      immediateRender: false,
    }
  );
}
