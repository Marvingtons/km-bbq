"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { SLOT_RING_R, SLOT_RING_TICKS } from "./slotRing";

/* ===========================================================================
   THE CATEGORY MARKS — one ink system, ten glyphs.

   Same rules as the DualGrill artwork: 24-unit viewBox, `stroke: var(--color-char)`,
   stroke-width 2, round caps and joins, `fill: none`. No gradients, no filled
   shapes, no second stroke weight. They are line drawings in the same hand as
   the grill, at a tenth the size, and the constraint is what makes them read as
   a family rather than as ten icons that happen to share a colour.

   THEY DRAW THEMSELVES ON, ONCE. `pathLength={1}` is the whole trick: it tells
   the renderer to treat every path as one unit long whatever its real geometry,
   so a dasharray of 1 and an offset of 1 is "fully retracted" for a straight
   line, an arc and a closed capsule alike. No measurement, no getTotalLength,
   no per-glyph tuning — and a mark added later inherits the behaviour for free.

   THE RETRACTED STATE IS SET IN JS, NEVER IN CSS. If the bundle fails or the
   observer never fires, the marks render fully drawn, because that is what the
   markup says. A CSS `stroke-dashoffset: 1` would have turned a JS failure into
   ten invisible headers.
   =========================================================================== */

export type MarkId =
  | "beef"
  | "pork"
  | "chicken"
  | "seafood"
  | "rice-and-more"
  | "vegetables"
  | "banchan"
  | "dessert"
  | "premium"
  | "signature";

/**
 * The meat capsule, shared by the three muscle categories and differentiated
 * ONLY by how many marbling curves run through it — one for beef, two for
 * pork, three for chicken. Three glyphs from one drawing, which is cheaper to
 * read than three unrelated silhouettes and says the true thing: these are the
 * same kind of item.
 */
function meatSlice(curves: 1 | 2 | 3) {
  const ys = curves === 1 ? [12] : curves === 2 ? [10, 14] : [9, 12, 15];
  return (
    <>
      <rect x="3" y="6" width="18" height="12" rx="6" pathLength={1} />
      {ys.map((y) => (
        <path key={y} d={`M7 ${y}c2-1.6 4 1.6 6 0s4-1.6 4-1.6`} pathLength={1} />
      ))}
    </>
  );
}

const MARKS: Record<MarkId, React.ReactNode> = {
  beef: meatSlice(1),
  pork: meatSlice(2),
  chicken: meatSlice(3),

  // Shrimp: one arc for the body, one for the tail, two antennae.
  seafood: (
    <>
      <path d="M18 7c-5 0-9 3-9 7 0 2.2 1.8 4 4 4 3.9 0 7-3.4 7-7.6" pathLength={1} />
      <path d="M9 14c-2.4.6-4 1.9-4 3.4" pathLength={1} />
      <path d="M18 7c1.2-1.4 2.6-2.2 3.6-2.2" pathLength={1} />
      <path d="M17.4 7.6c.4-1.8.2-3.2-.4-4.1" pathLength={1} />
    </>
  ),

  // Steaming bowl: a half-circle and one rising wisp.
  "rice-and-more": (
    <>
      <path d="M3.5 12h17a8.5 8.5 0 0 1-17 0z" pathLength={1} />
      <path d="M2 20h20" pathLength={1} />
      <path d="M12 8.5c-1.6-1.3-1.6-2.7 0-4s1.6-2.7 0-4" pathLength={1} />
    </>
  ),

  // Two leaf strokes, one stem each.
  vegetables: (
    <>
      <path d="M12 21c0-5.5 3-9.5 8-11-.6 5.9-3.4 9.3-8 11z" pathLength={1} />
      <path d="M12 21c0-4.4-2.2-7.6-6-8.8.5 4.7 2.6 7.4 6 8.8z" pathLength={1} />
      <path d="M12 21v-3" pathLength={1} />
    </>
  ),

  // The side-dish trio.
  banchan: (
    <>
      <circle cx="8" cy="9" r="3.6" pathLength={1} />
      <circle cx="16.5" cy="8" r="2.8" pathLength={1} />
      <circle cx="13" cy="16.5" r="3.2" pathLength={1} />
    </>
  ),

  // Soft serve: two stacked arcs over a cone line.
  dessert: (
    <>
      <path d="M7.5 11a4.5 4.5 0 0 1 9 0" pathLength={1} />
      <path d="M9 7a3 3 0 0 1 6 0" pathLength={1} />
      <path d="M6.5 12h11L12 21z" pathLength={1} />
    </>
  ),

  // The grill's own slot ring, in miniature: circle plus eight radial ticks.
  premium: <SlotRing />,

  // The same ring with a burst at the centre — the dinner card's top tier.
  signature: (
    <>
      <SlotRing />
      <path d="M12 9.4v5.2M9.4 12h5.2M10.2 10.2l3.6 3.6M13.8 10.2l-3.6 3.6" pathLength={1} />
    </>
  ),
};

/** Circle plus eight ticks, from slotRing.ts. The geometry lives there rather
 *  than here because it used to have a second consumer — see that file. */
function SlotRing() {
  return (
    <>
      <circle cx="12" cy="12" r={SLOT_RING_R} pathLength={1} />
      {SLOT_RING_TICKS.map((t) => (
        <line
          key={t.key}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          pathLength={1}
        />
      ))}
    </>
  );
}

export function CategoryMark({ id }: { id: MarkId }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg || prefersReducedMotion()) return;

    const shapes = Array.from(
      svg.querySelectorAll<SVGGeometryElement>("path, circle, rect, line")
    );
    // Retract. From here the mark is invisible, so everything below has to be
    // guaranteed to run — which is why the observer is created immediately and
    // synchronously after, with no awaits between.
    for (const s of shapes) {
      s.style.strokeDasharray = "1";
      s.style.strokeDashoffset = "1";
    }

    const draw = () => {
      shapes.forEach((s, i) => {
        s.style.transition =
          `stroke-dashoffset 0.5s var(--ease-house) ${i * 0.06}s`;
        s.style.strokeDashoffset = "0";
      });
    };

    // ONCE. The mark is a header ornament, not a scroll toy — redrawing it
    // every time the reader passes back over the category would turn a quiet
    // page into a flickering one.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        draw();
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(svg);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className="ink-mark"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-char)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {MARKS[id]}
    </svg>
  );
}
