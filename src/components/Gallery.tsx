"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
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
  // itself never scrolls sideways at any width. Plain cream surface: the
  // ink-wash / gold-squiggle backdrop (a residual third visual language whose
  // gold line also ran into the next section's seam) has been removed so the
  // section reads as one cream field with the rest of the site.
  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative overflow-hidden bg-paper py-20 motion-safe:md:py-0"
      // Background continuity: arrives carrying About's cream and settles onto
      // its own paper tone across the first ~30vh, so the boundary is a change
      // of light rather than a change of panel.
      data-seam-morph
      data-from="#FAF4EC"
      data-to="#F3EBDD"
    >

      {/* Ink-wash atmosphere — a faint, warm supporting texture behind the
          photos. The warmth and the white-drop are BAKED into the asset
          (gallery-bg-warm.jpg), so this layer carries no filter and no
          mix-blend and is therefore safe to parallax. Oversized (top -8%,
          h 116%) so the drift never reveals a gap at either edge. */}
      <div
        aria-hidden="true"
        data-seam-parallax
        data-parallax="5"
        className="pointer-events-none absolute inset-x-0 top-[-8%] z-0 h-[116%] bg-contain bg-center bg-no-repeat opacity-[0.16] md:bg-cover"
        style={{ backgroundImage: "url(/images/gallery-bg-warm.jpg)" }}
      />

      <div className="relative z-10 flex flex-col gap-10 motion-safe:md:h-screen motion-safe:md:flex-row motion-safe:md:items-center motion-safe:md:gap-0">
        {/* Heading — the fixed anchor. Sits centered on the left while the
            photos stream past on desktop; flows on top on mobile. */}
        <div className="shrink-0 px-6 text-center motion-safe:md:w-[32%] motion-safe:md:px-12 motion-safe:md:text-left">
          <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
            Gallery
          </p>
          <h2
            id="gallery-heading"
            className="font-serif text-4xl font-light text-foreground md:text-5xl"
          >
            A look inside
          </h2>
          <a
            href="https://www.instagram.com/kmkoreanbbq/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-11 items-center font-sans text-sm font-medium text-ember-deep underline-offset-4 hover:underline"
          >
            Follow us on Instagram →
          </a>
        </div>

        {/* Photo row. On desktop the GSAP timeline translates this track; on
            mobile / reduced motion the wrapper is a native snap carousel. */}
        <div className="overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory motion-safe:md:flex-1 motion-safe:md:overflow-hidden motion-safe:md:px-0 [&::-webkit-scrollbar]:hidden">
          {/* No permanent will-change here: it promotes the whole 8-tile row to
              its own layer for the life of the page, which costs more memory
              than it saves. GSAP promotes during the tween itself. */}
          <div className="gallery-track flex items-center gap-5 pr-6 motion-safe:md:gap-8 motion-safe:md:pr-[12vw]">
            {GALLERY_ITEMS.map((item, i) => (
              <figure
                key={item.id}
                className="gallery-tile group relative h-[52vh] shrink-0 snap-start overflow-hidden rounded-xl bg-paper shadow-warm motion-safe:md:h-[60vh]"
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
                <figcaption className="gallery-caption pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-12 opacity-100 motion-safe:md:opacity-0">
                  <span className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-white">
                    {item.caption}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Mobile-only scroll indicator. The desktop gallery is a pinned,
            scroll-driven track that needs no hint; on phones the photo row is a
            native horizontal swipe carousel, so cue the sideways gesture. */}
        <div className="flex items-center justify-center gap-2 px-6 md:hidden">
          <span className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-foreground/60">
            Swipe to explore
          </span>
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
