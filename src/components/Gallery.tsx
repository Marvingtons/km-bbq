"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollReveal } from "./ScrollReveal";

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

        // One-time staggered fade-up of the tiles as the section first
        // scrolls into view. It animates each tile's autoAlpha + y —
        // DIFFERENT properties and targets than the pin (which animates `x`
        // on the parent track) — so the two timelines compose without
        // fighting. `once` means it never re-hides tiles on scroll-back, and
        // living inside this matchMedia means the mobile / reduced-motion
        // branch never runs it (tiles render fully visible there).
        gsap.from(tiles, {
          autoAlpha: 0,
          y: 24,
          stagger: 0.08,
          duration: 0.5,
          ease: "power2.out",
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
      // page itself never scrolls sideways at any width. The unified cream base
      // sits under the faded ink-wash so it reads on a consistent tone.
      className="relative overflow-hidden bg-cream py-20 motion-safe:md:py-0"
    >
      {/* Ink-wash atmosphere — a SUPPORTING TEXTURE, not a wall. `multiply`
          drops the art's white field so only the ink mountains, the grey
          cloud/smoke, the ember sun and the gold line remain, and opacity is
          dialed right down so it reads as a faint atmosphere behind the photos
          rather than competing with them. A warm `sepia`+`hue-rotate` filter
          pulls the cool grey ink toward the mural's warm brown so it belongs to
          the same hand-drawn world instead of reading as a third art style.
          The art is a wide panoramic: `cover` fills the full-screen pinned
          section on desktop, `contain` keeps the whole composition on mobile.
          The section's overflow-hidden means it never adds a sideways
          scrollbar. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-contain bg-center bg-no-repeat opacity-[0.16] mix-blend-multiply md:bg-cover"
        style={{
          backgroundImage: "url(/images/gallery-bg.png)",
          filter: "sepia(0.4) saturate(1.15) hue-rotate(-12deg)",
        }}
      />

      <div className="relative z-10 flex flex-col gap-10 motion-safe:md:h-screen motion-safe:md:flex-row motion-safe:md:items-center motion-safe:md:gap-0">
        {/* Heading — the fixed anchor. Sits centered on the left while the
            photos stream past on desktop; flows on top on mobile. */}
        <ScrollReveal className="shrink-0 px-6 text-center motion-safe:md:w-[32%] motion-safe:md:px-12 motion-safe:md:text-left">
          <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
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
            className="mt-8 inline-block font-sans text-sm font-medium text-ember-deep underline-offset-4 hover:underline"
          >
            Follow us on Instagram →
          </a>
        </ScrollReveal>

        {/* Photo row. On desktop the GSAP timeline translates this track; on
            mobile / reduced motion the wrapper is a native snap carousel. */}
        <div className="overflow-x-auto px-6 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory motion-safe:md:flex-1 motion-safe:md:overflow-hidden motion-safe:md:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="gallery-track flex items-center gap-5 pr-6 will-change-transform motion-safe:md:gap-8 motion-safe:md:pr-[12vw]">
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
                  onLoad={refresh}
                />
                {/* Warm ember wash on hover — a subtle glow via `multiply`
                    (not a heavy tint). Sits above the image but below the
                    caption so the label stays legible. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-ember opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-15"
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
          <span className="font-sans text-[11px] font-medium uppercase tracking-[0.25em] text-warm">
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
