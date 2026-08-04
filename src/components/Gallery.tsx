"use client";

import { useRef } from "react";
import Image from "next/image";
import { PillLink } from "./PillLink";

/* ===========================================================================
   GALLERY — a scroll-snap strip. No pin, no scrub, no GSAP.

   WHAT THIS REPLACED. The section pinned for `travel * 0.55` — roughly 2.5
   viewport-heights at 1440 — while a GSAP timeline translated the row
   sideways. That is 2.5 screens of scrolling during which the page moves zero
   pixels, and it was the largest single item in the site's dead-scroll budget
   (Law 6). Releasing the pin is also what closes the blank screen that used to
   sit between this section and the next: that gap was `pinSpacing` reserving
   room for travel nobody could see.

   AND THE CAPTIONS ARE ALL VISIBLE AT ONCE. They used to be overlaid on each
   tile at opacity 0 and crossfaded in only for whichever tile was nearest
   screen-centre, which meant that at any given moment you could not read the
   label of anything you were looking at except one. They sit under their own
   photograph now, in normal flow, permanently legible.

   The strip is a native overflow-x container with scroll-snap: it drags with a
   trackpad, a wheel, a touch and the keyboard for free, it needs no library,
   and it works identically under reduced motion — so there is no second code
   path to keep in step.
   =========================================================================== */

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

/* THE AUDIT, RE-RUN against the two-value warm direction. Three tiles become
   five, because two of the three cuts were made for failing a palette that was
   itself wrong.

   The original audit cut `interior` for being "an empty dining room in
   daylight" and `table` for being "an empty table and a cold grill". Both
   readings are about brightness, and both were correct ONLY against a near-
   black ground. On sand they are two of the best photographs on disk — and
   `interior` is the frame the entire palette was sampled from. See DIRECTION.md.

     live-grill            -> the HERO, and it is the frame that clips into
                              About, so it appears once and travels.
     samgyeopsal-grilling  KEEP.     Pork belly over live coals.
     marbled-wagyu         KEEP.     Raw marbling under tongs, portrait.
     banchan-spread        KEEP.     Overhead, lit, and on the menu.
     interior              RESTORED. The room itself: the terracotta floor, the
                           black ceiling, the chrome ducts, and the whole 12ft
                           mural. It is the most informative image the
                           restaurant has and it was sitting unreferenced.
     table                 RESTORED. The best photograph of the CHROME on disk —
                           two polished downdraft hoods filling the frame over a
                           grill well. Chrome is a tokenized material in this
                           direction, and this is the only frame that shows what
                           it actually looks like.
     drinks                STAYS CUT, for a better reason than "bare white",
                           which is no longer disqualifying. It is three
                           bottles of two other companies' packaging — Jinro
                           and Corona trade dress, front and centre, sharp — in
                           our own gallery. That is the same mistake as the
                           Google Maps embed labelling the neighbours.
     outside               MOVED to Contact as wayfinding.

   Five is still short of what the room deserves. The reshoot is NEEDS-ASSETS
   #3 and the strip takes more without a code change. */
const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    src: "/images/samgyeopsal-grilling.png",
    alt: "Pork belly grilling over live coals at KM.BBQ",
    caption: "Samgyeopsal on the grill",
  },
  {
    id: 2,
    src: "/images/marbled-wagyu.png",
    alt: "Marbled wagyu held over the grill with tongs",
    caption: "Marbled wagyu",
  },
  {
    id: 3,
    src: "/images/banchan-spread.png",
    alt: "A spread of banchan side dishes",
    caption: "Banchan, included",
  },
  {
    id: 4,
    src: "/images/interior.png",
    alt: "The KM.BBQ dining room: tables with built-in grills under chrome extraction ducts, with the painted mural along the back wall",
    caption: "The room",
  },
  {
    id: 5,
    src: "/images/table.png",
    alt: "Chrome extraction hoods over a table with a built-in charcoal grill",
    caption: "Every table has a grill",
  },
];

export function Gallery() {
  const stripRef = useRef<HTMLDivElement>(null);

  // One tile-and-a-gap at the common case, so a click lands the next frame on
  // a snap point rather than halfway across one.
  const nudge = (dir: 1 | -1) =>
    stripRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      // NOT `overflow-hidden`. The strip is its own scroll container now, so
      // clipping here would only hide the fact that it can scroll.
      className="grain relative bg-sand py-section md:py-section-lg"
    >
      <div className="grid-page relative z-base">
        <div className="col-text">
          <p className="eyebrow">Gallery</p>
          <h2 id="gallery-heading" className="h2-scale mt-4">
            A look inside
          </h2>
          <p className="copy measure mt-4">
            The room, the grills, and what comes off them.
          </p>
          <PillLink
            href="https://www.instagram.com/kmkoreanbbq/"
            external
            tone="outline"
            arrow
            className="mt-6"
          >
            More on Instagram
          </PillLink>
        </div>

        {/* THE CHEVRONS. Desktop only, right-aligned above the strip, and
            purely an affordance — the strip already scrolls by wheel, trackpad,
            touch and keyboard without them. `aria-hidden` plus `tabIndex={-1}`
            because the strip itself is the focusable, labelled control and a
            keyboard user scrolls it with the arrow keys; exposing two more stops
            that do the same thing is noise in a screen reader. */}
        <div
          aria-hidden="true"
          className="col-full mt-8 hidden justify-end gap-2 md:flex"
        >
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              tabIndex={-1}
              onClick={() => nudge(dir)}
              className="flex size-10 items-center justify-center rounded-pill border border-steel/55 text-ink transition-colors duration-[var(--dur-base)] ease-house hover:border-flame hover:bg-flame hover:text-sand"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={dir === 1 ? "m9 18 6-6-6-6" : "m15 18-6-6 6-6"} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* FULL-BLEED, and outside `.grid-page` on purpose. The strip spans the
          viewport and reproduces the container gutter as its own padding-inline,
          so the first tile lines up with column 1 while the last one can still
          scroll clear of the right edge.

          `tabIndex` and a label so a keyboard user can reach and scroll it; the
          scrollbar is hidden because the snap points and the bleed already say
          it moves. */}
      <div
        ref={stripRef}
        className="gallery-strip relative z-base mt-6 md:mt-4"
        tabIndex={0}
        role="group"
        aria-label="Photographs, scroll sideways"
      >
        {GALLERY_ITEMS.map((item, i) => (
          <figure key={item.id} className="gallery-item">
            <div className="photo">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 768px) 78vw, 720px"
                className="object-cover"
                // The first tile is on screen when the section arrives; the
                // rest stay lazy.
                priority={i === 0}
                decoding="async"
              />
            </div>
            {/* Under the photograph, in flow, always readable. */}
            <figcaption className="eyebrow mt-3">{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
