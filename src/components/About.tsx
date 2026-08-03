"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PillLink } from "./PillLink";
import { SectionSeam } from "./SectionSeam";
import { FEATURED, displayName } from "@/data/menu";
import { MOTION, MOTION_OK, NAV_H, HERO_SCRUB } from "@/lib/motion";
import { useScrollRefresh } from "@/lib/useScrollRefresh";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   ABOUT — two beats: the story, then the cuts.

   The mural band that used to sit between them is gone (note further down).
   What is left is the section doing a job: what this place is, beside a
   photograph of it, and then what to order.

   THE CARDS ARE NOT A SECOND COPY OF THE MENU. `FEATURED` in src/data/menu.ts
   resolves five ids into the real records at module load and throws on a bad
   one, so a card here cannot show a name, a photo or a description that /menu
   does not — and every card links to the anchor of the category the dish
   actually lives in. Galbi says Premium because Galbi IS in Premium.

   That replaces the "Signature" badge, which named a section that had never
   existed on /menu.
   =========================================================================== */

export function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(sectionRef);

    mm.add({ motion: MOTION_OK, wide: "(min-width: 768px)" }, (context) => {
      const { motion, wide } = context.conditions as {
        motion: boolean;
        wide: boolean;
      };
      if (!motion) return;

      const textCol = q(".about-text");
      const grillHead = q(".grill-head");
      const grillDishes = q(".grill-dish");

      // THE STORY, and the one entrance not triggered off its own position.
      //
      // Where the window runs, the copy is revealed by the panel shrinking off
      // it, so "the copy has arrived" and "the panel has passed" are the same
      // event and must not disagree. Triggered the ordinary way they did: the
      // copy's position is a function of viewport HEIGHT and the panel's edge
      // of viewport WIDTH, so the two drift apart with the aspect ratio and the
      // panel's edge cut through the heading.
      //
      // So it fires off the hero's own scroll, scaled to HERO_SCRUB — 58% of
      // the transition's travel, wherever that travel is set.
      gsap.from(textCol, {
        opacity: 0,
        y: MOTION.rise,
        duration: MOTION.dur.reveal,
        ease: MOTION.gsapEase,
        scrollTrigger: wide
          ? {
              trigger: "#home",
              start: () => window.innerHeight * HERO_SCRUB * 0.58,
              invalidateOnRefresh: true,
              toggleActions: "play none none reverse",
            }
          : { trigger: textCol[0], start: "top 88%" },
      });

      gsap.from(grillHead, {
        opacity: 0,
        y: MOTION.rise,
        duration: MOTION.dur.reveal,
        ease: MOTION.gsapEase,
        scrollTrigger: { trigger: grillHead[0], start: "top 88%" },
      });

      gsap.from(grillDishes, {
        opacity: 0,
        y: MOTION.rise,
        duration: MOTION.dur.reveal,
        stagger: MOTION.stagger,
        ease: MOTION.gsapEase,
        scrollTrigger: { trigger: grillDishes[0], start: "top 90%" },
      });
    });

    return () => {
      mm.revert();
    };
  }, []);

  useScrollRefresh();

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      // -mt-[60vh] cancels the hero's extra 60vh, so this section's first
      // screen is what the hero's window reveals as it clips down and the net
      // document height is unchanged. One number, written here, in Hero's
      // h-[160vh], and as HERO_SCRUB. Change one, change all three.
      className="grain relative z-base overflow-hidden bg-char motion-safe:md:-mt-[60vh]"
      style={{ ["--nav-h" as string]: `${NAV_H}px` } as React.CSSProperties}
    >
      <SectionSeam />

      {/* ------------------------------------------------------------------
          BEAT 1 — THE STORY, and the panel the hero docks into.

          `h-screen` at md+ with motion rather than `min-h-screen`: SeamMotion
          measures `.col-media` About-relative and bails if the cell does not
          fit inside About's first viewport, which would leave the hero unable
          to clip at all. An exact viewport keeps the cell centred by
          construction at every width.
          ------------------------------------------------------------------ */}
      <div className="about-stage relative z-base py-section md:py-section-lg motion-safe:md:h-screen motion-safe:md:py-0">
        <div className="grid-page motion-safe:md:h-full motion-safe:md:items-center">
          <div className="about-text col-text">
            <p className="eyebrow text-ember">Our story</p>
            <h2 id="about-heading" className="h2-scale mt-4">
              It started with a grill
            </h2>
            <span
              aria-hidden="true"
              className="mt-5 block h-0.5 w-16 bg-flame"
            />
            <div className="copy measure mt-8 space-y-5">
              <p>
                KM.BBQ started with one idea: really good Korean BBQ that you
                cook yourself. Every table gets its own grill, gas or charcoal.
              </p>
              <p>
                We pick our meat carefully and marinate it in house, using
                recipes we have leaned on for years. You grill it fresh, right
                where you sit, cooked exactly how you like it.
              </p>
              <p>
                Pull up a chair and take your time. Order more whenever you
                want. Good food, a hot grill, and no reason to rush.
              </p>
            </div>
            <PillLink href="/menu" arrow className="mt-10">
              See the menu
            </PillLink>
          </div>

          {/* THE MEDIA COLUMN — columns 9-12 out to the right viewport edge,
              the one span `.col-text` never occupies, so the clearance between
              copy and panel is a fact about the grid rather than about timing.

              Filled only where no panel will ever arrive: below 768px and under
              reduced motion, where it holds the hero's own still statically
              docked — the transition's end state with nothing animated. At md+
              with motion it is deliberately EMPTY, because it is the rect
              SeamMotion clips the hero's window down into.

              Second in DOM order on purpose: below 768px it stacks UNDER the
              copy, so the section still opens on its heading at 375. */}
          <figure className="col-media bleed-right" aria-hidden="true">
            <Image
              src="/images/live-grill.png"
              alt=""
              fill
              quality={72}
              sizes="100vw"
              draggable={false}
              className="select-none object-cover motion-safe:md:hidden"
            />
          </figure>
        </div>
      </div>

      {/* THE MURAL BAND IS GONE, and it is not coming back as a smaller one.

          Two sheets of hand-drawn motifs — a cartoon tiger, a folk dancer, a
          janggu, a hanok, bonsai — scattered on a baked-out WHITE field. Three
          problems, any one of which is disqualifying:

            1. It depicts food we do not serve. Sundubu jjigae, bibimbap and a
               bowl of plain rice are none of them on the menu. Law 1: an asset
               that shows off-menu food is cut, not captioned around.
            2. Its ground is white, which the palette bans outright. On cream it
               merely read light; on --char it would be a glowing rectangle.
            3. It carried ~0.75 of a viewport and zero information, aria-hidden
               with no alt text, in the middle of the one section that is
               supposed to say what this restaurant is.

          --color-pine and --color-plum were sampled from it and went with it.
          If an illustrated motif is wanted later it is a new asset request, not
          a revival of this one. */}

      {/* ------------------------------------------------------------------
          BEAT 2 — HOUSE FAVOURITES.
          ------------------------------------------------------------------ */}
      <div className="grill-layer relative z-base py-section md:py-section-lg">
        <div className="grid-page">
          <div className="col-full">
            <div className="grill-head">
              <p className="eyebrow text-ember">House favorites</p>
              <h2 id="menu-heading" className="h2-scale mt-4">
                What to grill first
              </h2>
              <p className="copy measure mt-4">
                Five of the ones people order again and again. Everything on the
                menu is the same one price.
              </p>
            </div>

            {/* Galbi anchors the left half at full height; the other four form
                an equal 2x2 on the right. Tablets collapse to two columns with
                Galbi full-width on top; phones stack single-file, Galbi first. */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
              {FEATURED.map(({ item, category, href }, i) => {
                const isFeature = i === 0;
                const span = isFeature ? "sm:col-span-2 lg:row-span-2" : "";
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`grill-dish group flex h-full flex-col overflow-hidden rounded-card border border-char-3 bg-char-2 p-5 text-left transition-colors duration-[var(--dur-base)] ease-house hover:border-flame/50 ${span}`}
                  >
                    <div
                      className={`photo relative w-full ${
                        isFeature
                          ? "aspect-[16/9] lg:aspect-auto lg:min-h-0 lg:flex-1"
                          : "aspect-[16/9] lg:aspect-[2/1]"
                      }`}
                    >
                      <Image
                        src={item.image!}
                        alt={displayName(item)}
                        fill
                        className="object-cover transition-transform duration-[var(--dur-slow)] ease-house group-hover:scale-[1.04]"
                        sizes={
                          isFeature
                            ? "(max-width: 1023px) 100vw, 50vw"
                            : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                        }
                      />
                    </div>
                    {/* The category, and it is a real anchor on /menu — not a
                        badge naming a section that does not exist. */}
                    <p className="eyebrow mt-4 text-ember">{category.name}</p>
                    <h3 className="card-title mt-1">
                      {item.name}
                      {item.english && (
                        <span className="text-smoke"> — {item.english}</span>
                      )}
                    </h3>
                    {item.hangul && (
                      <p className="mt-1 font-sans text-xs text-smoke">
                        {item.hangul}
                      </p>
                    )}
                    <p className="copy mt-2">{item.desc}</p>
                  </Link>
                );
              })}
            </div>

            <div className="grill-cta mt-10 flex lg:mt-12">
              <PillLink href="/menu" tone="outline" arrow>
                See the menu
              </PillLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
