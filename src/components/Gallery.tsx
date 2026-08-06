"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PillLink } from "./PillLink";

gsap.registerPlugin(ScrollTrigger);

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
   six: two of the three cuts were made for failing a palette that was itself
   wrong, and the sixth came back when About stopped needing it.

   The original audit cut `interior` for being "an empty dining room in
   daylight" and `table` for being "an empty table and a cold grill". Both
   readings are about brightness, and both were correct ONLY against a near-
   black ground. On sand they are two of the best photographs on disk — and
   `interior` is the frame the entire palette was sampled from. See DIRECTION.md.

     live-grill            RESTORED, and the reason it was out is gone twice
                           over. It was "the HERO, and the frame that clips
                           into About, so it appears once and travels" — but
                           the hero is the R2 clip over hero-poster.webp now,
                           and About's media is that same clip continuing into
                           the match cut. This photograph was doing neither
                           job; it was a third image interrupting a chain of
                           one. It is a good frame — a live grill mid-service
                           with the room behind it — so it goes where good
                           frames go.
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

   Six is still short of what the room deserves. The reshoot is NEEDS-ASSETS
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
    src: "/images/live-grill.png",
    alt: "A table grill mid-service at KM.BBQ, with beef, shrimp and mushrooms over the grate",
    caption: "Mid-service",
  },
  {
    id: 5,
    src: "/images/interior.png",
    alt: "The KM.BBQ dining room: tables with built-in grills under chrome extraction ducts, with the painted mural along the back wall",
    caption: "The room",
  },
  {
    id: 6,
    src: "/images/table.png",
    alt: "Chrome extraction hoods over a table with a built-in charcoal grill",
    caption: "Every table has a grill",
  },
];

/**
 * The pin's scroll cost, in viewport heights.
 *
 * The site's dead-scroll budget (Law 6) wants held scroll under one viewport,
 * and the hero already spends 0.6 of one. This cap is a deliberate, recorded
 * overrun — see DIRECTION.md amendment A3. It is a CAP, not a target: if the
 * track is longer than this the scrub simply moves faster. The pin never
 * grows to fit the content.
 */
const MAX_PIN_VH = 1.75;

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // One tile-and-a-gap at the common case, so a click lands the next frame on
  // a snap point rather than halfway across one. Strip mode only.
  const nudge = (dir: 1 | -1) =>
    stripRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    /**
     * PUBLISH THE SCROLLBAR WIDTH.
     *
     * In pinned mode the track is `width: max-content`, so its padding cannot
     * be a percentage of anything useful and has to be viewport-relative. But
     * `scrollbar-gutter: stable` reserves 10px page-wide, which makes 100vw
     * permanently wider than the content box — and a padding computed from a
     * raw 100vw starts the feature card 5px right of every other section's
     * column 1. The CSS subtracts --sbw to cancel exactly that.
     *
     * Measured against document.body, NOT documentElement. Under an overlay
     * scrollbar (headless Chromium, macOS, most touch devices)
     * documentElement.clientWidth equals innerWidth and reports a gutter of
     * zero — but `scrollbar-gutter: stable` has still shrunk the body, so the
     * page's real content box is narrower and every other section is centred
     * in it. The body is the box `.grid-page` is actually centred inside, so
     * the body is the honest basis.
     */
    const contentWidth = () => document.body.clientWidth;
    const setSbw = () =>
      document.documentElement.style.setProperty(
        "--sbw",
        `${window.innerWidth - contentWidth()}px`
      );
    setSbw();
    window.addEventListener("resize", setSbw);

    /**
     * A single gsap.context scoped to the section. Everything created inside
     * — the matchMedia bracket, its tween, its ScrollTrigger and its
     * pin-spacer — is reverted together on unmount.
     *
     * This is what stops hot reload and route changes from stacking duplicate
     * pin-spacers, which is the classic way a pinned gallery ends up with a
     * screen of blank scroll and a section that looks broken.
     */
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // THE SAME BRACKET AS THE CSS. If these two ever disagree you get a
      // transformed track inside a live overflow scroller.
      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          // Recomputed, never captured: `invalidateOnRefresh` re-runs the
          // function values below on every refresh, so a resize or a late
          // image gets the real number rather than the one measured at build.
          // Same basis as --sbw above: the body's content box, which is what
          // the track is actually laid out inside.
          const getDist = () => Math.max(0, track.scrollWidth - contentWidth());

          gsap.set(track, { x: 0 });

          gsap.to(track, {
            x: () => -getDist(),
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              // Capped at MAX_PIN_VH. Past that the scrub moves faster; the
              // pin does not get longer.
              end: () =>
                `+=${Math.min(getDist(), window.innerHeight * MAX_PIN_VH)}`,
              pin: true,
              // Default pinType. Lenis smooths the WINDOW scroll position
              // rather than transforming a wrapper, so ScrollTrigger's normal
              // fixed-position pinning is correct here — forcing
              // pinType: "transform" is what makes a pin jitter under Lenis.
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          // Belt and braces on top of the section's own measurement: tiles
          // past the first are lazy, so the last decode can land after the
          // trigger was measured. The CSS gives every tile a fixed height and
          // width so the box is known before the image is, and this catches
          // anything that still settles late.
          const refresh = () => ScrollTrigger.refresh();
          window.addEventListener("load", refresh);
          void document.fonts?.ready.then(refresh);

          return () => window.removeEventListener("load", refresh);
        }
      );
    }, section);

    return () => {
      window.removeEventListener("resize", setSbw);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-heading"
      // NOT `overflow-hidden`. The strip is its own scroll container in strip
      // mode and the track overflows the viewport by design in pinned mode —
      // clipping here would break both.
      //
      // A DARK BAND, and the pin is untouched by it. `.section-dark` sets a
      // ground, block padding and four inherited tokens; `.gallery-pinned`
      // still zeroes that padding in pinned mode from its own unlayered block
      // in globals.css, which outranks the band's layered rule. The photographs
      // now sit on charcoal and the captions take the band's muted tone,
      // because `.eyebrow` resolves --color-ash from this section.
      //
      // The `pt-section` pair is gone with the `<SectionDivider />` that used
      // to follow this section and own the rest between it and the game.
      className="gallery-pinned section-dark grain relative"
    >
      <header className="grid-page relative z-base">
        <div className="col-text">
          {/* NOTHING ANIMATES THE HEADING. No reveal, no tween, no initial
              opacity — not in CSS, not inline, not from JS. It is the same
              static markup pattern as About and Contact, and it renders with
              JavaScript disabled entirely. That is deliberate: this block is
              the section's only unconditional content, so it must never depend
              on a trigger firing. */}
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
          className="gallery-chevrons col-full mt-8 hidden justify-end gap-2 md:flex"
        >
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              tabIndex={-1}
              onClick={() => nudge(dir)}
              /* `.pill-outline` is the same hook `PillLink`'s outline tone
                 carries, and it is here because this IS that object — a chrome
                 hairline that fills to flame on hover — drawn round instead of
                 as a stadium. On a dark band the class lifts the stroke to
                 sand/40 so the control's own boundary clears 3:1; steel/55
                 measures 2.2:1 on char. See globals.css. */
              className="pill-outline flex size-10 items-center justify-center rounded-pill border border-steel/55 text-ink transition-colors duration-[var(--dur-base)] ease-house hover:border-flame hover:bg-flame hover:text-sand"
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
      </header>

      {/* FULL-BLEED, and outside `.grid-page` on purpose.

          STRIP MODE: this element is the scroller and carries the padding that
          lines tile 1 up with column 1.
          PINNED MODE: it stops scrolling, the padding moves to the track, and
          GSAP translates the track through it.

          `tabIndex` and a label so a keyboard user can reach and scroll it in
          strip mode; the scrollbar is hidden because the snap points and the
          bleed already say it moves. */}
      <div
        ref={stripRef}
        className="gallery-strip relative z-base mt-6 md:mt-4"
        tabIndex={0}
        role="group"
        aria-label="Photographs, scroll sideways"
      >
        <div ref={trackRef} className="gallery-track">
          {GALLERY_ITEMS.map((item, i) => (
            <figure key={item.id} className="gallery-item">
              <div className="photo">
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 1024px) 78vw, 720px"
                  className="object-cover"
                  /* THE FIRST THREE TILES ARE NOT LAZY, and that is the fix for
                     "captions with no photographs".

                     The strip is one horizontal band: when the section arrives,
                     tiles 1-3 are already inside the viewport at 1440 and tile
                     4 is just past the right edge. They were all `loading=
                     "lazy"` except the first, so the fetch for the two visible
                     ones only STARTED as the section came into view — and these
                     are 2.0-2.6MB source PNGs going through /_next/image, so
                     what landed first was the caption under an empty frame.
                     The reveal system was never involved: the gallery has no
                     `data-reveal` on it at all, and nothing here has ever set
                     an opacity.

                     Three, not six. Tiles 4-6 are off the right edge at every
                     width and only ever arrive under the scrub or a swipe, so
                     they are genuinely lazy and eager-loading them would put
                     three more full-size decodes in front of the hero's LCP for
                     no one's benefit.

                     `priority` stays on the first tile alone — it is the only
                     one that can be the largest contentful paint. The other two
                     are eager but unprioritised, which is the difference
                     between "fetch this now" and "fetch this ahead of the
                     hero". */
                  priority={i === 0}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
              {/* Under the photograph, in flow, always readable — in BOTH
                  modes. There is no caption fade choreography: the previous
                  pinned gallery crossfaded captions by distance from screen
                  centre, which meant that at any moment you could not read the
                  label of anything except one tile. */}
              <figcaption className="eyebrow mt-3">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
