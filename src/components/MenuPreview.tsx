"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollReveal } from "./ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

interface Dish {
  name: string;
  korean: string;
  description: string;
  image: string;
  tag?: string;
}

const FEATURED_DISHES: Dish[] = [
  {
    name: "Galbi",
    korean: "갈비",
    description:
      "Short ribs marinated in a soy-pear blend, grilled over live charcoal until caramelized.",
    image: "/images/galbi.png",
    tag: "Signature",
  },
  {
    name: "Samgyeopsal",
    korean: "삼겹살",
    description:
      "Thick-cut pork belly, crisp-edged and paired with fresh perilla, garlic, and doenjang.",
    image: "/images/samgyeopsal.png",
  },
  {
    name: "Chadolbaegi",
    korean: "차돌박이",
    description:
      "Paper-thin brisket slices that cook in seconds — dipped in sesame oil and salt.",
    image: "/images/chadolbaegi.png",
    tag: "Chef's Pick",
  },
  {
    name: "Japchae",
    korean: "잡채",
    description:
      "Glass noodles stir-fried with vegetables and beef in a sweet soy sesame sauce.",
    image: "/images/japchae.png",
  },
  {
    name: "Bulgogi",
    korean: "불고기",
    description:
      "Tender ribeye in a sesame-ginger marinade — the classic that never disappoints.",
    image: "/images/bulgogi.png",
  },
  {
    name: "Kimchi",
    korean: "김치",
    description:
      "House-fermented napa cabbage with gochugaru, garlic, and ginger — bold, smoky, addictive.",
    image: "/images/kimchi.png",
    tag: "Spicy",
  },
];

function DishCard({ dish, index }: { dish: Dish; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    if (!card || !image) return;

    // Stagger the starting offset per column so each box travels in from a
    // different direction toward its resting position.
    const column = index % 3;
    const startX = column === 0 ? -120 : column === 2 ? 120 : 0;
    const startY = column === 1 ? 130 : 90;
    const startRotate = column === 0 ? -6 : column === 2 ? 6 : 0;

    const ctx = gsap.context(() => {
      // The card movement is scrubbed: its position is driven *directly* by
      // the scroll bar between the two trigger points below.
      gsap.fromTo(
        card,
        {
          opacity: 0,
          x: startX,
          y: startY,
          scale: 0.85,
          rotateZ: startRotate,
          transformPerspective: 800,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotateZ: 0,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            // Starts as the card edges into view, finishes once it has
            // settled comfortably above the viewport center.
            start: "top 95%",
            end: "top 45%",
            scrub: 0.6,
          },
        }
      );

      // A subtle parallax drift on the photo, also scrubbed to the scroll,
      // so the image keeps moving as the card travels past.
      gsap.fromTo(
        image,
        { yPercent: -8, scale: 1.12 },
        {
          yPercent: 8,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, card);

    return () => ctx.revert();
  }, [index]);

  return (
    <div ref={cardRef} className="group h-full will-change-transform">
      <div className="relative flex h-full flex-col border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
        {dish.tag && (
          <span className="mb-3 inline-block font-sans text-xs font-medium tracking-widest uppercase text-brand-orange">
            {dish.tag}
          </span>
        )}
        <div className="relative mb-4 aspect-[3/2] w-full overflow-hidden bg-neutral-100">
          <div ref={imageRef} className="absolute inset-0 will-change-transform">
            <Image
              src={dish.image}
              alt={dish.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
        <h3 className="font-serif text-xl font-light text-foreground">
          {dish.name}
        </h3>
        <p className="font-sans text-sm font-light text-foreground/40">
          {dish.korean}
        </p>
        <p className="mt-2 font-sans text-sm font-light leading-relaxed text-foreground/60">
          {dish.description}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-end">
          <span className="font-sans text-xs text-foreground/40 transition-colors group-hover:text-brand-orange">
            {/* TODO: wire up to menu page */}+
          </span>
        </div>
      </div>
    </div>
  );
}

export function MenuPreview() {
  return (
    <section
      id="menu"
      className="bg-white py-28 px-6"
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <ScrollReveal>
            <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
              {/* TODO: section label */}
              Featured Cuts
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="menu-heading"
              className="font-serif text-5xl font-light text-foreground md:text-6xl"
            >
              {/* TODO: heading */}
              The Grill Awaits
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl font-sans text-base font-light text-foreground/60">
              {/* TODO: subline */}A curated selection of our most-loved cuts.
              Each one sourced, marinated, and served with intention.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_DISHES.map((dish, i) => (
            <DishCard key={dish.name} dish={dish} index={i} />
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-14 text-center">
            <a
              href="#"
              className="inline-flex rounded-full border border-brand-blue px-8 py-3 font-sans text-sm font-medium text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
            >
              {/* TODO: link to /menu page */}
              View Full Menu
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
