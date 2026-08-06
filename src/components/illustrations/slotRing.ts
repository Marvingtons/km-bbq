/**
 * THE GRILL'S SLOT RING — the geometry, on its own, so there is one drawing.
 *
 * It is the PREMIUM category mark, and the base of SIGNATURE. It had a second
 * consumer: `<SectionDivider />` set the same mark in the break of its
 * hairline, and this module existed so that two components in two bundles were
 * not drawing the same eight ticks by hand — which is how two versions of a
 * mark start to disagree about the tick count, the inner radius or the
 * rounding.
 *
 * THE DIVIDER IS GONE (the page separates sections by alternating grounds now;
 * see DIRECTION.md amendment A4) and this stayed, deliberately. It is one
 * consumer today, but the numbers are the drawing rather than an abstraction
 * over it, and putting them back inline in CategoryMark would only mean
 * extracting them again the next time the mark is set anywhere else.
 *
 * A .ts module rather than a shared component: CategoryMark needs the ticks as
 * static markup it draws on with a dash offset, and the retired divider needed
 * them as individual elements it could stagger. Same geometry, two renderings —
 * which is exactly why the geometry is not a component.
 *
 * 24-unit viewBox, matching every other mark in the ink system.
 */

/** Ring radius, in viewBox units. */
export const SLOT_RING_R = 9.6;

/** Where each tick starts and ends — inner radius to outer, on the 8 spokes. */
const R_INNER = 6.2;
const R_OUTER = 8.6;

export const SLOT_RING_TICKS = Array.from({ length: 8 }, (_, i) => {
  // -90° so tick 0 is at twelve o'clock, and the stagger below reads as a
  // sweep around the dial rather than starting somewhere arbitrary.
  const a = (i * Math.PI * 2) / 8 - Math.PI / 2;
  return {
    key: i,
    x1: +(12 + Math.cos(a) * R_INNER).toFixed(2),
    y1: +(12 + Math.sin(a) * R_INNER).toFixed(2),
    x2: +(12 + Math.cos(a) * R_OUTER).toFixed(2),
    y2: +(12 + Math.sin(a) * R_OUTER).toFixed(2),
  };
});
