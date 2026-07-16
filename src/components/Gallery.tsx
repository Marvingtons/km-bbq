"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollReveal } from "./ScrollReveal";
import { SeamThread } from "./SeamThread";
import { EASE, DUR, STAGGER, RISE, MOTION_OK } from "@/lib/motion";

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
  { id: 1, src: "/images/live-grill.png", alt: "Live charcoal grill at KM BBQ", caption: "Live Grill", ratio: 1.5 },
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

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  // One refresh after ALL tile images settle, instead of one per <img> load
  // (8 rapid ScrollTrigger.refresh() calls used to thrash layout on load).
  const loadedRef = useRef(0);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(sectionRef);

    // Desktop with motion allowed: pin the section and translate the photo row
    // horizontally on scroll. Mobile (< md) and prefers-reduced-motion fall
    // through to the CSS layout below (a native swipeable carousel) — the
    // motion-safe:md classes that build the pinned layout are inactive there,
    // and the GSAP timeline below never runs, so touch scroll stays untouched.
    mm.add(
      `(min-width: 768px) and ${MOTION_OK}`,
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

        // --- Caption crossfade WITHOUT per-frame layout reads -----------------
        // Previously updateCaptions() called getBoundingClientRect() on all 8
        // tiles every scrub frame — a forced synchronous layout that spiked
        // frame times on slower machines. Instead we measure each tile's
        // screen-center ONCE (on refresh/resize), remember the track's x at
        // that moment, then per frame derive the live center from the track's
        // transform delta — read cheaply from GSAP's cache, no layout.
        let metrics: { center: number; half: number }[] = [];
        let baseX = 0;
        let viewCenter = window.innerWidth / 2;

        const measure = () => {
          baseX = (gsap.getProperty(track, "x") as number) || 0;
          viewCenter = window.innerWidth / 2;
          metrics = tiles.map((t) => {
            const r = t.getBoundingClientRect();
            return { center: r.left + r.width / 2, half: r.width / 2 };
          });
          updateCaptions();
        };

        const updateCaptions = () => {
          const dx = ((gsap.getProperty(track, "x") as number) || 0) - baseX;
          for (let i = 0; i < tiles.length; i++) {
            const m = metrics[i];
            const cap = caps[i];
            if (!m || !cap) continue;
            const dist = Math.abs(m.center + dx - viewCenter);
            // Full opacity within ~15% of half-width of center, faded by ~75%.
            const o = gsap.utils.clamp(
              0,
              1,
              1 - (dist - m.half * 0.3) / (m.half * 1.2)
            );
            gsap.set(cap, { opacity: o });
          }
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
            scrub: 1,
            invalidateOnRefresh: true,
            onRefresh: measure,
            onUpdate: updateCaptions,
          },
        });

        // One-time staggered fade-up of the tiles as the section first scrolls
        // into view — autoAlpha + y only, on the shared motion vocabulary. This
        // targets the tiles while the pin animates `x` on the parent track, so
        // the two never fight over a property.
        gsap.from(tiles, {
          autoAlpha: 0,
          y: RISE,
          stagger: STAGGER.base,
          duration: DUR.fast,
          ease: EASE.out,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            once: true,
          },
        });

        // Row width depends on the (async) image layout — measure once it lands.
        ScrollTrigger.refresh();
      }
    );

    // Re-measure pin distance once async content settles (fonts / final window
    // load can shift layout; the tile images are handled by the load counter).
    const refreshST = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshST);
    document.fonts?.ready.then(refreshST);

    return () => {
      window.removeEventListener("load", refreshST);
      mm.revert();
    };
  }, []);

  // Count image loads; refresh exactly once when the last tile lands.
  const onTileLoad = () => {
    loadedRef.current += 1;
    if (loadedRef.current >= GALLERY_ITEMS.length) ScrollTrigger.refresh();
  };

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-heading"
      // overflow-hidden keeps the horizontal motion inside the section — the
      // page itself never scrolls sideways at any width. The unified cream base
      // sits under the faded ink-wash so it reads on a consistent tone.
      className="relative overflow-hidden bg-cream py-20 motion-safe:md:py-0"
      data-seam-morph
      data-from="#f2ebdd"
      data-to="#faf6ef"
    >
      <SeamThread />
      {/* Ink-wash atmosphere — a faint, warm supporting texture behind the
          photos. The warmth + white-drop is BAKED into the asset
          (gallery-bg-warm.jpg), so this layer carries no filter or mix-blend and
          is safe to parallax. It's oversized (top -8%, h 116%) so the boundary
          parallax never reveals a gap. Depth layer: moves at ~0.85x scroll. */}
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
        <ScrollReveal className="shrink-0 px-6 text-center motion-safe:md:w-[32%] motion-safe:md:px-12 motion-safe:md:text-left">
          <p className="mb-4 transform-gpu font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
            Gallery
          </p>
          <h2
            id="gallery-heading"
            className="transform-gpu font-serif text-5xl font-light text-foreground md:text-6xl"
          >
            A look inside
          </h2>
          <a
            href="https://www.instagram.com/kmkoreanbbq/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block transform-gpu font-sans text-sm font-medium text-ember-deep underline-offset-4 hover:underline"
          >
            Follow us on Instagram →
          </a>
        </ScrollReveal>

        {/* Photo row. On desktop the GSAP timeline translates this track; on
            mobile / reduced motion the wrapper is a native snap carousel. */}
        <div className="overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory motion-safe:md:flex-1 motion-safe:md:overflow-hidden motion-safe:md:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="gallery-track flex items-center gap-5 pr-6 motion-safe:md:gap-8 motion-safe:md:pr-[12vw]">
            {GALLERY_ITEMS.map((item) => (
              <figure
                key={item.id}
                className="gallery-tile group relative h-[52vh] shrink-0 snap-start overflow-hidden rounded-card bg-cream-deep shadow-card motion-safe:md:h-[60vh]"
                style={{ aspectRatio: String(item.ratio) }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 70vw, 40vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  onLoad={onTileLoad}
                />
                {/* Warm ember wash on hover — a soft glow from the bottom. Plain
                    (non-blend) compositing so it never turns the moving tile
                    into a blend layer; opacity-only transition. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ember/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                {/* Caption: dark bottom gradient + small letter-spaced label.
                    Visible per-tile on mobile; on desktop it starts hidden and
                    the timeline fades in only the centered tile's caption. */}
                <figcaption className="gallery-caption pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-12 opacity-100 motion-safe:md:opacity-0">
                  <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-white">
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
          <span className="transform-gpu font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-warm">
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
