"use client";

import { ScrollReveal } from "./ScrollReveal";

interface GalleryItem {
  id: number;
  alt: string;
  span?: "wide" | "tall" | "normal";
}

// TODO: Replace placeholder items with real images
const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, alt: "TODO: Live grill close-up", span: "wide" },
  { id: 2, alt: "TODO: Banchan spread" },
  { id: 3, alt: "TODO: Marbled wagyu on grill", span: "tall" },
  { id: 4, alt: "TODO: Restaurant interior" },
  { id: 5, alt: "TODO: Samgyeopsal sizzling" },
  { id: 6, alt: "TODO: Table setting", span: "wide" },
  { id: 7, alt: "TODO: Drink / cocktail" },
  { id: 8, alt: "TODO: Team / kitchen" },
];

function GalleryCell({ item, index }: { item: GalleryItem; index: number }) {
  const spanClass =
    item.span === "wide"
      ? "col-span-2"
      : item.span === "tall"
        ? "row-span-2"
        : "";

  return (
    <ScrollReveal
      delay={index * 0.05}
      className={`group relative overflow-hidden bg-neutral-200 ${spanClass} ${
        item.span === "tall" ? "min-h-[400px]" : "aspect-square"
      }`}
    >
      {/* TODO: Replace with Next.js <Image fill> */}
      <div className="flex h-full w-full items-center justify-center">
        <p className="font-sans text-xs text-neutral-400 text-center px-4">
          {item.alt}
        </p>
      </div>
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
    </ScrollReveal>
  );
}

export function Gallery() {
  return (
    <section
      id="gallery"
      className="py-28 px-6"
      aria-labelledby="gallery-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
              Gallery
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="gallery-heading"
              className="font-serif text-5xl font-light text-foreground md:text-6xl"
            >
              {/* TODO: heading */}
              Seen Through Fire
            </h2>
          </ScrollReveal>
        </div>

        {/* Masonry-style grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {GALLERY_ITEMS.map((item, i) => (
            <GalleryCell key={item.id} item={item} index={i} />
          ))}
        </div>

        <ScrollReveal delay={0.1}>
          <div className="mt-10 text-center">
            {/* TODO: link to Instagram or a /gallery page */}
            <a
              href="#"
              className="font-sans text-sm font-medium text-brand-pink hover:underline underline-offset-4"
            >
              Follow us on Instagram →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
