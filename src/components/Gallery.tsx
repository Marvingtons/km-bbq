"use client";

import Image from "next/image";

import { ScrollReveal } from "./ScrollReveal";

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  span?: "wide" | "tall" | "normal";
}

const GALLERY_ITEMS: GalleryItem[] = [
  { id: 1, src: "/images/live-grill.png", alt: "Live charcoal grill at KM BBQ", span: "wide" },
  { id: 2, src: "/images/banchan-spread.png", alt: "Banchan side dishes" },
  { id: 3, src: "/images/marbled-wagyu.png", alt: "Marbled wagyu on the grill", span: "tall" },
  { id: 4, src: "/images/interior.png", alt: "KM BBQ interior" },
  { id: 5, src: "/images/samgyeopsal-grilling.png", alt: "Samgyeopsal sizzling on the grill" },
  { id: 6, src: "/images/table.png", alt: "Table setting", span: "wide" },
  { id: 7, src: "/images/drinks.png", alt: "Drinks" },
  { id: 8, src: "/images/outside.png", alt: "Outside of KM BBQ" },
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
      <Image
        src={item.src}
        alt={item.alt}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
      />
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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {GALLERY_ITEMS.map((item, i) => (
            <GalleryCell key={item.id} item={item} index={i} />
          ))}
        </div>

        <ScrollReveal delay={0.1}>
          <div className="mt-10 text-center">
            <a
              href="https://www.instagram.com/kmkoreanbbq/"
              target="_blank"
              rel="noopener noreferrer"
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
