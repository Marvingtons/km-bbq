"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { MuralMark } from "./MuralMark";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion";
import { useScrollRefresh } from "@/lib/useScrollRefresh";

gsap.registerPlugin(ScrollTrigger);

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  caption: string;
  // width / height ratio — drives the varied "filmstrip" tile shapes. Tiles all
  // share one height; the ratio sets each tile's width (wide / square / tall).
  ratio: number;
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, src: "/images/live-grill.png", alt: "Built-in grill at a table at KM BBQ", caption: "Table Grill", ratio: 1.5 },
  { id: 2, src: "/images/banchan-spread.png", alt: "Banchan side dishes", caption: "Banchan", ratio: 1.0 },
  { id: 3, src: "/images/marbled-wagyu.png", alt: "Marbled wagyu on the grill", caption: "Marbled Wagyu", ratio: 0.72 },
  { id: 4, src: "/images/interior.png", alt: "KM BBQ interior", caption: "Interior", ratio: 1.5 },
  { id: 5, src: "/images/samgyeopsal-grilling.png", alt: "Samgyeopsal sizzling on the grill", caption: "Samgyeopsal", ratio: 0.95 },
  { id: 6, src: "/images/table.png", alt: "Table setting", caption: "Table Setting", ratio: 1.5 },
  { id: 7, src: "/images/drinks.png", alt: "Drinks", caption: "Drinks", ratio: 0.7 },
  { id: 8, src: "/images/outside.png", alt: "Outside of KM BBQ", caption: "Outside", ratio: 1.05 },
];

// How much vertical scroll maps to the horizontal travel. <1 compresses the
// pin so the full row passes in roughly half the wheel effort of a 1:1 map —
// the 1.15 pace read as premium but took ~4 viewport-heights of scrolling to
// traverse, which testers found sluggish.
const PACE = 0.55;

// The first two tiles are what the viewer is looking at when the gallery
// arrives, so they load eagerly at high priority; everything past them stays
// lazy. Keeping this as a constant rather than a magic index so the count and
// the reason travel together.
const EAGER_TILES = 2;

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  // Debounce handle + the last measured track width, for the load-settle
  // refresh below.
  const refreshTimer = useRef<number | null>(null);
  const lastWidth = useRef(0);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(sectionRef);

    // Desktop with motion allowed: pin the section and translate the photo row
    // horizontally on scroll. Mobile (< md) and prefers-reduced-motion fall
    // through to the CSS layout below (a native swipeable carousel) — the
    // motion-safe:md classes that build the pinned layout are inactive there,
    // and the GSAP timeline below never runs, so touch scroll stays untouched.
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const track = q(".gallery-track")[0] as HTMLElement;
        const wrapper = track.parentElement as HTMLElement;
        const tiles = q(".gallery-tile") as HTMLElement[];
        const caps = tiles.map(
          (t) => t.querySelector(".gallery-caption") as HTMLElement | null
        );

        // Total sideways distance: full row width minus the visible window to
        // its right of the heading. Read live (invalidateOnRefresh) so it stays
        // correct after images load / the window resizes.
        const getTravel = () =>
          Math.max(0, track.scrollWidth - wrapper.clientWidth);

        // --- Caption crossfade WITHOUT per-frame layout reads ----------------
        // Fade in the caption of whichever tile is nearest screen-center, the
        // rest out. The obvious version calls getBoundingClientRect() on all 8
        // tiles every scrub frame, which is a forced synchronous layout and
        // spikes frame times on slower machines. Instead each tile's
        // screen-center is measured ONCE (on refresh/resize) along with the
        // track's x at that moment; per frame the live center is derived from
        // the track's transform delta, read from GSAP's cache. No layout.
        let metrics: { center: number; half: number }[] = [];
        let baseX = 0;
        let viewCenter = window.innerWidth / 2;

        const updateCaptions = () => {
          const dx = ((gsap.getProperty(track, "x") as number) || 0) - baseX;
          for (let i = 0; i < tiles.length; i++) {
            const m = metrics[i];
            const cap = caps[i];
            if (!m || !cap) continue;
            const dist = Math.abs(m.center + dx - viewCenter);
            // Full opacity within ~30% of half-width of center, faded by ~120%.
            const o = gsap.utils.clamp(
              0,
              1,
              1 - (dist - m.half * 0.3) / (m.half * 1.2)
            );
            gsap.set(cap, { opacity: o });
          }
        };

        const measure = () => {
          baseX = (gsap.getProperty(track, "x") as number) || 0;
          viewCenter = window.innerWidth / 2;
          metrics = tiles.map((t) => {
            const r = t.getBoundingClientRect();
            return { center: r.left + r.width / 2, half: r.width / 2 };
          });
          updateCaptions();
        };

        gsap.set(track, { x: 0 });

        gsap.to(track, {
          x: () => -getTravel(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => "+=" + getTravel() * PACE,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            // Numeric scrub (not `true`) eases the row toward the scroll
            // position so the travel never snaps notch-to-notch.
            scrub: MOTION.scrub,
            invalidateOnRefresh: true,
            // Re-measure on refresh (layout may have changed); per frame only
            // the cheap transform-delta read runs.
            onRefresh: measure,
            onUpdate: updateCaptions,
          },
        });

        // Row width depends on the (async) image layout — measure once it lands.
        ScrollTrigger.refresh();
      }
    );

    return () => {
      mm.revert();
    };
  }, []);

  useScrollRefresh();

  // Refresh once after image loads SETTLE, and only if they actually changed
  // the row's width.
  //
  // The previous version counted to 8 and refreshed on the last load. Because
  // tiles past the first two are lazy, that last load happens while the pinned
  // track is being scrolled horizontally — so a full ScrollTrigger.refresh()
  // (recomputing every trigger and all pin spacing on the page) landed in the
  // middle of the scroll. That was the ~70ms long task behind the first-view
  // stutter; on later passes the images are cached, nothing loads mid-scroll,
  // and the stutter is gone, which is exactly the reported symptom.
  //
  // Now: each load pushes a 150ms debounce, the work is deferred to idle, and
  // it bails entirely when scrollWidth is unchanged (the common case, since
  // every tile's box is fixed by its aspect-ratio before the image arrives).
  const onTileLoad = () => {
    const track = sectionRef.current?.querySelector<HTMLElement>(".gallery-track");
    if (!track) return;
    if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => {
      refreshTimer.current = null;
      const w = track.scrollWidth;
      if (w === lastWidth.current) return; // layout never moved: nothing to do
      lastWidth.current = w;
      const run = () => ScrollTrigger.refresh();
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(run, { timeout: 500 });
      } else {
        run();
      }
    }, 150);
  };

  useEffect(
    () => () => {
      if (refreshTimer.current !== null) window.clearTimeout(refreshTimer.current);
    },
    []
  );

  // overflow-hidden keeps the horizontal motion inside the section — the page
  // itself never scrolls sideways at any width.
  //
  // GROUND: cream. This section used to sit on the warmer paper tone and
  // seam-morph into it, which made it a third ground; the page now has exactly
  // two (cream and plum-ink) and this boundary is carried by rhythm instead of
  // by a change of panel. The gallery-bg-warm ink wash went with it — a texture
  // that exists in exactly one section is a stray voice, and the site-wide
  // paper grain is the texture now.
  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-heading"
      className="grain relative overflow-hidden bg-cream py-section md:py-section-lg motion-safe:md:py-0"
    >
      {/* The grid runs the section: heading in columns 1-4, photo row from
          column 5 out to the right edge of the viewport. That right-edge break
          is the ONE way media is allowed to leave the track, and it is the same
          break here as anywhere else on the site. */}
      <div className="grid-page relative z-10 gap-y-10 motion-safe:md:h-screen motion-safe:md:items-center motion-safe:md:gap-y-0">
        {/* Heading — the fixed anchor. Sits on the left while the photos stream
            past on desktop; flows on top on mobile. Left-aligned at both. */}
        <div className="col-span-full motion-safe:md:col-span-4 motion-safe:md:pr-8">
          <p className="eyebrow mb-4">Gallery</p>
          <h2 id="gallery-heading" className="h2-scale">
            A look <em className="italic text-pink">inside</em>
          </h2>
          <p className="copy measure mt-4">
            The room, the grills, and what comes off them.
          </p>
          <a
            href="https://www.instagram.com/kmkoreanbbq/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center font-sans text-copy font-medium text-ember-deep underline-offset-4 hover:underline"
          >
            Follow us on Instagram →
          </a>
          {/* This section's one voice from the mural: the table grill, which is
              what the photographs in the row are of. Full colour, like the
              mural — never graded, tinted or faded. */}
          <MuralMark mark="grill" size={92} className="mt-6" />
        </div>

        {/* Photo row. On desktop the GSAP timeline translates this track; on
            mobile / reduced motion the wrapper is a native snap carousel. */}
        <div className="bleed-right col-span-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory motion-safe:md:col-span-8 motion-safe:md:overflow-hidden [&::-webkit-scrollbar]:hidden">
          {/* No permanent will-change here: it promotes the whole 8-tile row to
              its own layer for the life of the page, which costs more memory
              than it saves. GSAP promotes during the tween itself. */}
          <div className="gallery-track flex items-center gap-5 pr-6 motion-safe:md:gap-8 motion-safe:md:pr-[12vw]">
            {GALLERY_ITEMS.map((item, i) => (
              <figure
                key={item.id}
                // photo-grade carries the shared photography treatment and the
                // one photo corner radius, so it also owns the clipping.
                className="gallery-tile photo-grade group relative h-[52vh] shrink-0 snap-start bg-cream-deep shadow-warm motion-safe:md:h-[60vh]"
                // Fixed height + aspect-ratio means every tile's box exists at
                // its final size before its image arrives, so a load can never
                // shift the row. This is what keeps CLS at 0 here.
                style={{ aspectRatio: String(item.ratio) }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 70vw, 40vw"
                  className="object-cover"
                  // The first two are decoded before the viewer reaches them;
                  // the rest stay lazy so the page does not pull 8 photos up
                  // front. decoding is explicit rather than relying on the
                  // default.
                  priority={i < EAGER_TILES}
                  decoding="async"
                  onLoad={onTileLoad}
                />
                {/* Caption: dark bottom gradient + small letter-spaced label.
                    Visible per-tile on mobile; on desktop it starts hidden and
                    the timeline fades in only the centered tile's caption. */}
                {/* z-[4]: above the photo-grade's lift (z-2) and grain (z-3)
                    overlays, so the label is never washed by either. */}
                <figcaption className="gallery-caption pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-12 opacity-100 motion-safe:md:opacity-0">
                  <span className="eyebrow text-white">{item.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Mobile-only scroll indicator. The desktop gallery is a pinned,
            scroll-driven track that needs no hint; on phones the photo row is a
            native horizontal swipe carousel, so cue the sideways gesture. */}
        <div className="col-span-full flex items-center gap-2 md:hidden">
          <span className="eyebrow text-foreground/60">Swipe to explore</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="gallery-swipe-hint h-4 w-4 text-ember"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
