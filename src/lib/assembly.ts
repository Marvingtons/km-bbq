import { gsap } from "gsap";

/* ===========================================================================
   THE GRILL ASSEMBLES ITSELF — the choreography, in one place.

   It is built in real hardware order, because that is what makes it read as a
   thing being put together rather than a set of shapes fading in: the pan is
   already there, the burner plate slides in and its dial sweeps on, the bowl
   appears and the coals pour into it, the grate comes down ON TOP of the
   coals, the seam draws, and only then does anything light.

   SHARED BECAUSE IT PLAYS TWICE, at two lengths and on two clocks: scrubbed
   against a pinned section above 1024, and as a 1.2s eased one-shot below it.
   The orderings and the random spins are the part that must not diverge — a
   coal that tumbles with a different rotation in the two paths is the same
   artwork behaving like two.

   EVERY PHASE IS EXPRESSED IN THE ASSEMBLY'S OWN 0-1 SPACE and mapped into
   whatever window the caller gives it, so the same table describes a slice of
   a master timeline and a standalone one without being written twice.
   =========================================================================== */

export type Span = readonly [number, number];
export const span = ([a, b]: Span) => b - a;

/** Map a phase of `A` into the window a caller gives the assembly. */
export const inWindow = (win: Span, [a, b]: Span): Span => [
  win[0] + a * span(win),
  win[0] + b * span(win),
];

/**
 * PHASE BOUNDARIES, as fractions of the assembly's own run. Named because they
 * are referenced by the timeline, by the ember hand-off maths and by
 * tools/verify-assembly.mjs, and a magic number written three times is a bug
 * waiting to happen.
 *
 * Mapped into the master's [0.20, 0.68] these land on the absolute positions
 * the pin is scored to: gas 0.20, slots to 0.32, coals to 0.42, grate 0.42-0.54
 * (still the longest single window — it is the featured beat), divider to 0.60,
 * embers to 0.68, and the remaining third of the pin is at rest. Consecutive
 * phases overlap slightly on purpose; a scrub with a seam between beats has a
 * frame where nothing is moving.
 *
 * THE WHOLE BUILD WAS COMPRESSED INTO THE FRONT OF THE PIN, and the reason is
 * what the reader was doing during it. The assembly used to run from 0.26 to
 * 0.96 of a 1.3-viewport pin, so the last beats landed on the reader's final
 * scroll pixel: they sat next to two finished paragraphs about gas and charcoal
 * watching a half-built grill, and the section's payoff arrived as it released.
 * Now the build is a flick of the wheel and the rest of the pin is the composed
 * view it was always for.
 */
export const A = {
  gasSurface: [0.0, 0.1],
  slots: [0.07, 0.25],
  bowl: [0.22, 0.28],
  coals: [0.25, 0.458],
  grate: [0.458, 0.708],
  mesh: [0.51, 0.708],
  divider: [0.708, 0.833],
  embers: [0.833, 1.0],
} as const;

export type GrillParts = ReturnType<typeof collectGrill>;

/**
 * Every group the assembly moves, plus the orderings it moves them in.
 *
 * THE ORDERINGS AND THE RANDOMNESS ARE COMPUTED ONCE, here, and must not
 * change between refreshes: a coal that tumbles in with a different rotation
 * every time ScrollTrigger recalculates would twitch on resize, and a
 * re-shuffled pour would re-order mid-scroll.
 */
export function collectGrill(svg: SVGSVGElement) {
  const q = <T extends Element>(sel: string) =>
    Array.from(svg.querySelectorAll<T>(sel));

  const gasSurface = svg.querySelector("#gas-surface");
  const bowl = svg.querySelector("#charcoal-ground");
  const grate = svg.querySelector("#grate");
  const divider = svg.querySelector<SVGLineElement>(".divider");
  const slots = q<SVGGraphicsElement>("#gas-surface .dial");
  const embers = q<SVGGraphicsElement>("#coals .ember, #coals .ember-deep");
  const coals = q<SVGGraphicsElement>("#coals > *").filter(
    (el) => !embers.includes(el)
  );
  const mesh = q<SVGGeometryElement>("#grate > *");

  /* Clockwise sweep for the dial. Measured from each mark's own bounding-box
     centre against the viewBox centre — NOT DOM order, which follows the order
     the artwork was drawn in and wanders.

     Bearing is 0 at twelve o'clock and increases clockwise. The dial only
     occupies the LEFT semicircle, so its marks run from roughly 180 (six
     o'clock) to 360 (twelve), and ascending bearing is therefore a clean
     bottom-round-to-top clockwise sweep. */
  const CX = 75;
  const CY = 75;
  const bearing = (el: SVGGraphicsElement) => {
    const b = el.getBBox();
    const dx = b.x + b.width / 2 - CX;
    const dy = b.y + b.height / 2 - CY;
    return (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2);
  };
  const slotsCW = [...slots].sort((a, b) => bearing(a) - bearing(b));

  // A loose pour, not a ring filling in order.
  const coalsShuffled = gsap.utils.shuffle([...coals]);
  const coalSpin = coals.map(() => gsap.utils.random(-14, 14, 1));
  const spinOf = new Map(coals.map((el, i) => [el, coalSpin[i]]));

  /* Horizontals first, then verticals, so the grid weaves rather than
     appearing. Orientation is MEASURED, not assumed from tag name — the grate
     is a mix of <line>, <rect>, <polygon> and <polyline>. */
  const meshOrdered = [...mesh].sort((a, b) => {
    const ab = a.getBBox();
    const bb = b.getBBox();
    return (ab.width >= ab.height ? 0 : 1) - (bb.width >= bb.height ? 0 : 1);
  });

  const lengthOf = new Map<SVGGeometryElement, number>();
  for (const el of mesh) lengthOf.set(el, el.getTotalLength());
  if (divider) lengthOf.set(divider, divider.getTotalLength());

  return {
    gasSurface, bowl, grate, divider,
    slots, slotsCW, coals, coalsShuffled, spinOf,
    mesh, meshOrdered, lengthOf,
  };
}

/**
 * INITIAL STATES ARE SET HERE, NEVER IN CSS.
 *
 * That is the whole safety story for this illustration: if the bundle fails,
 * ScrollTrigger never initialises, or the browser is too old, nothing has
 * hidden anything and the grill renders fully assembled. A CSS `opacity: 0`
 * would have made a JS failure into a blank square.
 *
 * `#chassis` is deliberately absent — the pan is already there. It is what the
 * match cut reveals, so it never animates and is never hidden.
 */
export function setAssemblyInitial(p: GrillParts) {
  gsap.set(p.gasSurface, { autoAlpha: 0, x: -28 });
  // `transform-box: fill-box` on the marks, so `50% 50%` is the mark's own
  // centre rather than the whole 150-unit viewBox's.
  gsap.set(p.slots, {
    autoAlpha: 0,
    scale: 0.6,
    transformBox: "fill-box",
    transformOrigin: "50% 50%",
  });
  gsap.set(p.bowl, { autoAlpha: 0 });
  for (const el of p.coals) {
    gsap.set(el, {
      autoAlpha: 0,
      y: -20,
      rotation: p.spinOf.get(el),
      transformBox: "fill-box",
      transformOrigin: "50% 50%",
    });
  }
  gsap.set(p.grate, {
    autoAlpha: 0,
    y: -16,
    scale: 1.05,
    transformBox: "fill-box",
    transformOrigin: "50% 50%",
  });
  for (const el of p.mesh) {
    const len = p.lengthOf.get(el) ?? 0;
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  }
  if (p.divider) {
    const len = p.lengthOf.get(p.divider) ?? 0;
    gsap.set(p.divider, { strokeDasharray: len, strokeDashoffset: len });
  }
}

/**
 * The assembly, added to `tl` inside `win`.
 *
 * EVERY TWEEN IS A `fromTo` WITH AN EXPLICIT FROM-STATE. `invalidateOnRefresh`
 * re-reads the start value of a `.to()` off the live element, so a refresh
 * landing mid-scroll — a font settling, an image loading, a resize — would
 * record "half-arrived" as the start and scrolling back up would never fully
 * disassemble. A `fromTo` declares its start and survives invalidation.
 * `immediateRender: false` leaves `setAssemblyInitial`'s values alone until the
 * playhead actually reaches each tween.
 *
 * `ease: "none"` when scrubbed — the scroll position IS the easing, and any
 * other curve makes the scrub feel like it is lagging the wheel. Shape comes
 * from phase placement and duration only. The one-shot below 1024 passes real
 * curves instead, because nothing is tracking the wheel there and the motion
 * has to carry its own weight.
 */
export function buildAssembly(
  tl: gsap.core.Timeline,
  p: GrillParts,
  win: Span,
  ease: string,
  grateEase: string
) {
  const w = (phase: Span) => inWindow(win, phase);
  const from = { immediateRender: false, ease };

  // 1. The burner plate slides in from the left, then the dial sweeps on.
  const gas = w(A.gasSurface);
  tl.fromTo(
    p.gasSurface,
    { autoAlpha: 0, x: -28 },
    { ...from, autoAlpha: 1, x: 0, duration: span(gas) },
    gas[0]
  );

  const sl = w(A.slots);
  tl.fromTo(
    p.slotsCW,
    { autoAlpha: 0, scale: 0.6 },
    {
      ...from,
      autoAlpha: 1,
      scale: 1,
      duration: span(sl) * 0.35,
      stagger: { amount: span(sl) * 0.65 },
    },
    sl[0]
  );

  // 2. The bowl appears, then the coals tumble in loose order.
  const bw = w(A.bowl);
  tl.fromTo(
    p.bowl,
    { autoAlpha: 0 },
    { ...from, autoAlpha: 1, duration: span(bw) },
    bw[0]
  );

  const co = w(A.coals);
  tl.fromTo(
    p.coalsShuffled,
    { autoAlpha: 0, y: -20, rotation: (i, el) => p.spinOf.get(el) ?? 0 },
    {
      ...from,
      autoAlpha: 1,
      y: 0,
      rotation: 0,
      duration: span(co) * 0.3,
      stagger: { amount: span(co) * 0.7 },
    },
    co[0]
  );

  // 3. THE FEATURED BEAT, and the longest window. The grate descends onto the
  //    coals; because #grate renders after #coals it visibly lands OVER them,
  //    which is the whole reason the artwork was regrouped.
  const gr = w(A.grate);
  tl.fromTo(
    p.grate,
    { autoAlpha: 0, y: -16, scale: 1.05 },
    { ...from, autoAlpha: 1, y: 0, scale: 1, duration: span(gr), ease: grateEase },
    gr[0]
  );

  const me = w(A.mesh);
  tl.fromTo(
    p.meshOrdered,
    { strokeDashoffset: (i, el) => p.lengthOf.get(el as SVGGeometryElement) ?? 0 },
    {
      ...from,
      strokeDashoffset: 0,
      duration: span(me) * 0.55,
      stagger: { amount: span(me) * 0.25 },
    },
    me[0]
  );

  // 4. The seam draws.
  if (p.divider) {
    const dv = w(A.divider);
    tl.fromTo(
      p.divider,
      { strokeDashoffset: p.lengthOf.get(p.divider) ?? 0 },
      { ...from, strokeDashoffset: 0, duration: span(dv) },
      dv[0]
    );
  }

  return tl;
}
