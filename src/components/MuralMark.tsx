import Image from "next/image";

/**
 * A single motif cut from the mural, used as a quiet section anchor.
 *
 * The mural used to exist as a full-bleed band in About and nowhere else, which
 * is exactly why About read as a different site. One small mark per section
 * makes the About band read as the full choir and gives every other section a
 * single voice from it.
 *
 * THE MARKS STAY FULL COLOUR — no grade, no tint, no desaturation, no opacity
 * knock-down. Same rule as the mural itself. They are decoration, so they are
 * aria-hidden and never carry meaning the copy does not already carry.
 *
 * CREAM GROUNDS ONLY. The mural's white was keyed out of the whole painting,
 * including the white INSIDE it (the tiger's teeth, the grill's grate lines).
 * On cream those gaps are the page showing through, exactly as the mural itself
 * reads in the About band; on plum-ink they turn into dark punctures. So the
 * hero and the footer carry no mark. See tools/extract-mural-marks.mjs.
 *
 * Assets come from that tool (rectangular cuts of the source artwork,
 * alpha-trimmed). Intrinsic sizes are recorded here so next/image can reserve
 * the box and the mark can never shift layout; the tool prints this block ready
 * to paste whenever a crop changes.
 */
const MARKS = {
  tiger: { src: "/images/marks/tiger.png", w: 240, h: 216 },
  pine: { src: "/images/marks/pine.png", w: 161, h: 240 },
  mask: { src: "/images/marks/mask.png", w: 119, h: 190 },
  flame: { src: "/images/marks/flame.png", w: 215, h: 228 },
  grill: { src: "/images/marks/grill.png", w: 206, h: 152 },
} as const;

export type MarkName = keyof typeof MARKS;

export function MuralMark({
  mark,
  /** Longest edge, in CSS px. Small — an anchor, not decoration. */
  size = 72,
  className = "",
}: {
  mark: MarkName;
  size?: number;
  className?: string;
}) {
  const { src, w, h } = MARKS[mark];
  const scale = size / Math.max(w, h);
  const width = Math.round(w * scale);
  const height = Math.round(h * scale);

  return (
    <Image
      src={src}
      alt=""
      aria-hidden="true"
      width={width}
      height={height}
      // No `sizes`: on a fixed-width image it switches next/image to the full
      // deviceSizes srcset, and the browser was picking w=3840 for a 92px mark.
      // Without it the srcset is just 1x/2x of the real width.
      draggable={false}
      // A slight off-scroll drift so the mark sits behind the copy rather than
      // on the same plane. SeamMotion builds this inside a prefers-reduced-
      // motion: no-preference matchMedia, so it simply never exists for anyone
      // on reduced motion — and it is a transform, so it cannot shift layout.
      data-seam-parallax
      data-parallax="4"
      className={`pointer-events-none select-none ${className}`}
    />
  );
}
