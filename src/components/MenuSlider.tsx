"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";

interface Slide {
  name: string;
  korean: string;
  image: string;
}

// Menu pictures shown in the horizontal slider.
const SLIDES: Slide[] = [
  { name: "Galbi", korean: "갈비", image: "/images/galbi.png" },
  { name: "Samgyeopsal", korean: "삼겹살", image: "/images/samgyeopsal.png" },
  { name: "Chadolbaegi", korean: "차돌박이", image: "/images/chadolbaegi.png" },
  { name: "Bulgogi", korean: "불고기", image: "/images/bulgogi.png" },
  { name: "Japchae", korean: "잡채", image: "/images/japchae.png" },
  { name: "Kimchi", korean: "김치", image: "/images/kimchi.png" },
];

export function MenuSlider() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  // Keep the arrow buttons in sync with the scroll position.
  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= maxScroll - 1);
  }, []);

  const scrollByCards = useCallback((direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // Scroll by roughly one card width (first child + gap).
    const first = el.firstElementChild as HTMLElement | null;
    const gap = 24;
    const amount = first ? first.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: amount * direction, behavior: "smooth" });
  }, []);

  useLayoutEffect(() => {
    updateEdges();

    const mm = gsap.matchMedia(sectionRef);
    mm.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.from(".km-slider-head", {
          y: 26,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        });

        gsap.from(".km-slide", {
          opacity: 0,
          x: 60,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: trackRef.current, start: "top 85%" },
        });
      }
    );

    return () => mm.revert();
  }, [updateEdges]);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-28 overflow-hidden"
      aria-labelledby="menu-slider-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="km-slider-head mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
              On the Grill
            </p>
            <h2
              id="menu-slider-heading"
              className="km-slider-head font-serif text-5xl font-light text-foreground md:text-6xl"
            >
              Slide Through the Menu
            </h2>
          </div>

          {/* Prev / Next controls */}
          <div className="km-slider-head flex gap-3">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={atStart}
              aria-label="Previous dishes"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 text-foreground transition-colors hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={atEnd}
              aria-label="Next dishes"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-300 text-foreground transition-colors hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scroller — snaps, hides scrollbar, swipeable on touch.
          Left padding aligns the first card with the heading; right padding
          lets the last card scroll fully into view. */}
      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="km-no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-6 px-6 pb-4 [scrollbar-width:none] md:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {SLIDES.map((slide) => (
          <figure
            key={slide.name}
            className="km-slide group relative aspect-[4/5] w-[78vw] shrink-0 snap-start overflow-hidden bg-neutral-100 sm:w-[55vw] md:w-[360px] lg:w-[400px]"
          >
            <Image
              src={slide.image}
              alt={slide.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 78vw, (max-width: 768px) 55vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <figcaption className="absolute bottom-0 left-0 p-6">
              <h3 className="font-serif text-2xl font-light text-white">
                {slide.name}
              </h3>
              <p className="font-sans text-sm font-light text-white/70">
                {slide.korean}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
