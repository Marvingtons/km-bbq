"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

// How much vertical scroll maps to the horizontal travel. >1 stretches the pin
// so the photos drift sideways slowly — the weighty / premium feel asked for.
const PACE = 1.15;

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);

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

        // Total sideways distance: full row width minus the visible window to
        // its right of the heading. Read live (invalidateOnRefresh) so it stays
        // correct after images load / the window resizes.
        const getTravel = () =>
          Math.max(0, track.scrollWidth - wrapper.clientWidth);

        // Fade the caption of whichever tile is nearest screen-center in, the
        // rest out — animating opacity only. Driven from the scrub onUpdate so
        // it tracks the smoothed scroll position.
        const updateCaptions = () => {
          const center = window.innerWidth / 2;
          tiles.forEach((tile) => {
            const rect = tile.getBoundingClientRect();
            const tileCenter = rect.left + rect.width / 2;
            const dist = Math.abs(tileCenter - center);
            // Full opacity within ~15% of the tile's half-width of center,
            // faded out by ~75% — a smooth crossfade as tiles pass through.
            const o = gsap.utils.clamp(
              0,
              1,
              1 - (dist - rect.width * 0.15) / (rect.width * 0.6)
            );
            const cap = tile.querySelector(".gallery-caption") as HTMLElement;
            if (cap) gsap.set(cap, { opacity: o });
          });
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
            onRefresh: updateCaptions,
            onUpdate: updateCaptions,
          },
        });

        // Row width depends on the (async) image layout — measure once it lands.
        ScrollTrigger.refresh();
      }
    );

    // Re-measure pin distance once async content settles (images already call
    // refresh on load, but fonts / final window load can shift layout too).
    const refreshST = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshST);
    document.fonts?.ready.then(refreshST);

    return () => {
      window.removeEventListener("load", refreshST);
      mm.revert();
    };
  }, []);

  const refresh = () => ScrollTrigger.refresh();

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-labelledby="gallery-heading"
      // overflow-hidden keeps the horizontal motion inside the section — the
      // page itself never scrolls sideways at any width. The warm cream base
      // (#FAF4EC) sits under the faded ink-wash background so it reads on a
      // consistent tone.
      className="relative overflow-hidden py-20 motion-safe:md:py-0"
      style={{ backgroundColor: "#FAF4EC" }}
    >
      {/* Ink-wash atmosphere — lowest layer (z-0), behind the photos and
          heading. Faded to 60% so it reads as backdrop while the food photos
          (which sit at z-10) stay the clear focus. The art is a wide panoramic,
          so on desktop (md+) we use `cover` to fill the full-screen pinned
          section edge-to-edge with no letterboxing; on narrow/mobile screens
          `contain` keeps the whole wide composition visible. Either way any
          space the art doesn't reach is the section's matching cream base
          (#FAF4EC), so there's no visible seam. The section's overflow-hidden
          means it never adds a sideways scrollbar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-contain bg-center bg-no-repeat opacity-60 md:bg-cover"
        style={{ backgroundImage: "url(/images/gallery-bg.png)" }}
      />

      <div className="relative z-10 flex flex-col gap-10 motion-safe:md:h-screen motion-safe:md:flex-row motion-safe:md:items-center motion-safe:md:gap-0">
        {/* Heading — the fixed anchor. Sits centered on the left while the
            photos stream past on desktop; flows on top on mobile. */}
        <div className="shrink-0 px-6 text-center motion-safe:md:w-[32%] motion-safe:md:px-12 motion-safe:md:text-left">
          <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-brand-orange">
            Gallery
          </p>
          <h2
            id="gallery-heading"
            className="font-serif text-5xl font-light text-foreground md:text-6xl"
          >
            Seen Through Fire
          </h2>
          <a
            href="https://www.instagram.com/kmkoreanbbq/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block font-sans text-sm font-medium text-brand-pink underline-offset-4 hover:underline"
          >
            Follow us on Instagram →
          </a>
        </div>

        {/* Photo row. On desktop the GSAP timeline translates this track; on
            mobile / reduced motion the wrapper is a native snap carousel. */}
        <div className="overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory motion-safe:md:flex-1 motion-safe:md:overflow-hidden motion-safe:md:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="gallery-track flex items-center gap-5 pr-6 will-change-transform motion-safe:md:gap-8 motion-safe:md:pr-[12vw]">
            {GALLERY_ITEMS.map((item) => (
              <figure
                key={item.id}
                className="gallery-tile group relative h-[52vh] shrink-0 snap-start overflow-hidden rounded-xl bg-neutral-200 shadow-[0_18px_56px_-12px_rgba(0,0,0,0.62)] motion-safe:md:h-[60vh]"
                style={{ aspectRatio: String(item.ratio) }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 70vw, 40vw"
                  className="object-cover"
                  onLoad={refresh}
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
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-foreground/60">
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
            className="gallery-swipe-hint h-4 w-4 text-brand-orange"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>
      </div>
    </section>
  );
}
