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
  /** width / height. Tiles share one height; this sets each tile's width. */
  ratio: number;
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
    ratio: 1.5,
  },
  {
    id: 2,
    src: "/images/marbled-wagyu.png",
    alt: "Marbled wagyu held over the grill with tongs",
    caption: "Marbled wagyu",
    ratio: 0.72,
  },
  {
    id: 3,
    src: "/images/banchan-spread.png",
    alt: "A spread of banchan side dishes",
    caption: "Banchan, included",
    ratio: 1.0,
  },
  {
    id: 4,
    src: "/images/interior.png",
    alt: "The KM.BBQ dining room: tables with built-in grills under chrome extraction ducts, with the painted mural along the back wall",
    caption: "The room",
    ratio: 1.0,
  },
  {
    id: 5,
    src: "/images/table.png",
    alt: "Chrome extraction hoods over a table with a built-in charcoal grill",
    caption: "Every table has a grill",
    ratio: 1.0,
  },
];

export function Gallery() {
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="grain relative overflow-hidden bg-sand py-section md:py-section-lg"
    >
      <div className="grid-page relative z-base gap-y-10">
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

        {/* The strip runs from column 1 out to the right viewport edge — the
            one sanctioned way media leaves the track. `tabIndex` and a label so
            a keyboard user can reach and scroll it; the scrollbar is hidden
            because the snap points and the bleed already say it moves. */}
        <div
          className="bleed-right col-full snap-x snap-mandatory overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          role="group"
          aria-label="Photographs, scroll sideways"
        >
          <div className="flex items-start gap-5 pr-6 md:gap-7">
            {GALLERY_ITEMS.map((item, i) => (
              <figure key={item.id} className="shrink-0 snap-start">
                <div
                  className="photo h-[48vh] md:h-[56vh]"
                  style={{ aspectRatio: String(item.ratio) }}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 70vw, 40vw"
                    className="object-cover"
                    // The first tile is on screen when the section arrives;
                    // the rest stay lazy.
                    priority={i === 0}
                    decoding="async"
                  />
                </div>
                {/* Under the photograph, in flow, always readable. */}
                <figcaption className="eyebrow mt-3">{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
