"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PillLink } from "./PillLink";
import { ScrollReveal } from "./ScrollReveal";
import { MOTION, NAV_H } from "@/lib/motion";
import { useScrollRefresh } from "@/lib/useScrollRefresh";

gsap.registerPlugin(ScrollTrigger);

// Shared geometry for the seam lines. Two identical segments overlap at the
// seam at rest (looking like one line); each rides its half's inner edge
// outward during the split because it is a child of that half.
const lineBase: React.CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: 0,
  borderRadius: 2,
  transformOrigin: "top center",
  pointerEvents: "none",
};

// Brushed-steel line — always present in the mural (the pre-existing seam).
const steelLineStyle: React.CSSProperties = {
  ...lineBase,
  width: 3,
  background:
    "linear-gradient(180deg, #4a4a4e 0%, #6f6f74 30%, #9a9aa0 50%, #6f6f74 70%, #4a4a4e 100%)",
  boxShadow: "0 0 5px rgba(140,140,150,.55), 0 0 10px rgba(140,140,150,.3)",
  zIndex: 10,
};

// Fire overlay — sits exactly on top of the steel line and "ignites" it from
// top to bottom on scroll. Hidden by default (scaleY 0); the fallback / reduced
// motion state simply shows the cool steel line beneath.
const fireLineStyle: React.CSSProperties = {
  ...lineBase,
  // Ignite from the top of the bar downward when this screen comes into view.
  transformOrigin: "top center",
  width: 4,
  background:
    "linear-gradient(180deg, #fff7cc 0%, #ffd24a 16%, #ff9c1f 42%, #ff5a1f 68%, #d11e0c 100%)",
  boxShadow:
    "0 0 6px rgba(255,170,50,.95), 0 0 16px rgba(255,90,20,.7), 0 0 30px rgba(255,60,10,.45)",
  transform: "scaleY(0)",
  // Hint the compositor: this line is animated (scaleY) on scrub, so keep it
  // on its own GPU layer to avoid layout-driven jank during the ignite.
  willChange: "transform",
  zIndex: 11,
};

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
      "Short ribs marinated in a soy-pear blend, grilled at your table until caramelized.",
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
      "Paper-thin brisket that cooks in seconds. Dip it in sesame oil and salt.",
    image: "/images/chadolbaegi.png",
    tag: "Chef's Pick",
  },
  {
    name: "Bulgogi",
    korean: "불고기",
    description:
      "Tender ribeye in a sesame-ginger marinade. A classic for a reason.",
    image: "/images/bulgogi.png",
  },
  {
    name: "Kimchi",
    korean: "김치",
    description:
      "House-fermented napa cabbage. Tangy, a little spicy, and hard to put down.",
    image: "/images/kimchi.png",
  },
];

export function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(sectionRef);

    // One conditions-based block because the breakpoints differ per concern:
    // the mural pin + story reveal runs from md up, but the grill grid only
    // joins the pinned overlay at lg — its feature-card layout is too tall
    // for a single pinned tablet viewport, so tablets flow it statically
    // below the stage instead. prefers-reduced-motion falls through to the
    // default CSS state (full seamless mural, all copy visible, no pin).
    mm.add(
      {
        md: "(min-width: 768px)",
        lg: "(min-width: 1024px)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { md, lg, motion } = context.conditions as {
          md: boolean;
          lg: boolean;
          motion: boolean;
        };
        if (!motion) return;

        const grillHead = q(".grill-head");
        const grillDishes = q(".grill-dish");

        if (md) {
          const fireLines = q(".mural-line-fire");
          const leftHalf = q(".mural-half-left");
          const rightHalf = q(".mural-half-right");
          const textCol = q(".about-text");
          const grillLayer = q(".grill-layer");
          const grillCta = q(".grill-cta");

          // Animated start state: steel line already showing (its default),
          // fire not yet ignited, mural closed, story hidden. autoAlpha
          // (opacity + visibility) so a hidden layer never intercepts clicks
          // meant for the visible one — on lg the two layers overlap
          // absolutely in the stage.
          gsap.set(fireLines, { scaleY: 0, transformOrigin: "top center" });
          gsap.set(leftHalf, { xPercent: 0 });
          gsap.set(rightHalf, { xPercent: 0 });
          gsap.set(textCol, { autoAlpha: 0, scale: 0.92 });
          if (lg) gsap.set(grillLayer, { autoAlpha: 0 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              // Longer pin than the single-open version: the timeline now
              // plays ignite -> open to the story -> open fully while the
              // featured cuts build in, so each phase keeps roughly the same
              // scroll distance per move as before.
              end: "+=260%",
              pin: true,
              pinSpacing: true,
              // Switch to position:fixed one tick early so the browser
              // doesn't show a one-frame compositing jump (the mural
              // appearing to nudge sideways) at the instant the pin engages.
              anticipatePin: 1,
              // Numeric scrub adds a ~0.8s catch-up so the timeline eases
              // toward the scroll position instead of snapping to it
              // frame-for-frame. This is what makes the mural open/ignite
              // feel smooth rather than stepping in hard chunks with each
              // wheel/trackpad notch.
              scrub: MOTION.scrub,
              invalidateOnRefresh: true,
            },
          });

          // PHASE 1 (progress 0 -> 0.13): fire ignites down the existing
          // steel line, top -> bottom, mural still closed.
          tl.fromTo(fireLines, { scaleY: 0 }, { scaleY: 1, duration: 0.13 }, 0);

          // PHASE 2 (0.13 -> 0.40): halves slide to 36% open; each carries
          // its line segment along its inner edge. xPercent is relative to
          // the half's own width (50% of the stage), so -36% / +36% opens a
          // centered gap of ~36% of the stage while leaving mural bands
          // framing each side. The story fades in and gets a beat of
          // stillness (0.40 -> 0.52) to read.
          tl.to(leftHalf, { xPercent: -36, duration: 0.27 }, 0.13);
          tl.to(rightHalf, { xPercent: 36, duration: 0.27 }, 0.13);
          tl.to(textCol, { autoAlpha: 1, scale: 1, duration: 0.16 }, 0.18);

          // PHASE 3 (0.52 -> 1.0): the mural keeps opening out — each half
          // moves slightly past its full width so the art and its glowing
          // seam line have fully left the viewport by the end of the pin.
          // No close, one continuous motion.
          // ±110 rather than ±100: the seam lines overhang each half's inner
          // edge by ~2px and glow up to ~30px, so at exactly ±100 an orange
          // sliver would stay pinned to the viewport edges. The extra 10% of
          // travel (≥ ~38px at md and up) carries the line and its glow fully
          // off-screen, and only right at the end of the pin.
          tl.to(leftHalf, { xPercent: -110, duration: 0.48 }, 0.52);
          tl.to(rightHalf, { xPercent: 110, duration: 0.48 }, 0.52);
          tl.to(textCol, { autoAlpha: 0, scale: 0.95, duration: 0.1 }, 0.52);

          if (lg) {
            // The story hands the stage to the featured cuts: the Grill
            // Awaits layer builds in the widening gap — heading first, then
            // the feature card leads the photo stagger, CTA last.
            tl.to(grillLayer, { autoAlpha: 1, duration: 0.04 }, 0.6);
            tl.fromTo(
              grillHead,
              { y: 40, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.16 },
              0.6
            );
            tl.fromTo(
              grillDishes,
              { y: 70, autoAlpha: 0, scale: 0.92 },
              { y: 0, autoAlpha: 1, scale: 1, duration: 0.16, stagger: 0.035 },
              0.66
            );
            tl.fromTo(
              grillCta,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.12 },
              0.86
            );
          }

          // Recompute pin spacing once the half images have laid out.
          ScrollTrigger.refresh();
        } else {
          // Mobile (no pin/split): the full mural is omitted and the story
          // gets a gentle, non-pinned fade/slide-up as it scrolls into view.
          const textCol = q(".about-text");
          gsap.from(textCol, {
            opacity: 0,
            y: MOTION.rise,
            duration: MOTION.duration,
            ease: MOTION.gsapEase,
            scrollTrigger: {
              trigger: textCol[0],
              start: "top 88%",
            },
          });
        }

        if (!lg) {
          // Below lg the grill grid flows statically (below the pinned stage
          // on tablets, below the story on phones) — give it the same gentle
          // entrance the story gets, feature card first.
          gsap.from(grillHead, {
            opacity: 0,
            y: MOTION.rise,
            duration: MOTION.duration,
            ease: MOTION.gsapEase,
            scrollTrigger: {
              trigger: grillHead[0],
              start: "top 88%",
            },
          });

          gsap.from(grillDishes, {
            opacity: 0,
            y: MOTION.rise,
            duration: MOTION.duration,
            stagger: MOTION.stagger,
            ease: MOTION.gsapEase,
            scrollTrigger: {
              trigger: grillDishes[0],
              start: "top 90%",
            },
          });
        }
      }
    );

    return () => {
      mm.revert();
    };
  }, []);

  useScrollRefresh();

  const refresh = () => ScrollTrigger.refresh();

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-cream"
      style={{ ["--nav-h" as string]: `${NAV_H}px` } as React.CSSProperties}
    >
      {/* Mural stage (>= md only — hidden on mobile, where a simplified band
          renders instead, see below). The halves are `object-contain` so the
          whole illustration is always shown — nothing is cropped. The mural art
          is transparent (white field baked out to WebP), so it sits directly on
          this section's cream surface with no field to blend and the two halves
          meet flush at the center seam. On desktop the stage is full height
          (vertically centered art); on reduced motion it keeps the mural's
          natural ~2535:1240 combined ratio inside the content column. */}
      {/* pointer-events-none: this stage overlays the story/grill layers
          (z-20 over z-10) and is purely decorative — without it, it swallows
          every click meant for the buttons revealed in the gap beneath. */}
      <div className="pointer-events-none hidden md:block relative z-20 px-6 md:px-0 motion-safe:md:min-h-screen">
        <div className="relative mx-auto aspect-[2535/1240] w-full max-w-7xl overflow-hidden md:mx-0 md:aspect-auto md:h-screen md:max-w-none">
          {/* Left half */}
          <div className="mural-half-left absolute left-0 top-0 h-full w-1/2 will-change-transform">
            <Image
              src="/images/mural-left.webp"
              alt=""
              aria-hidden="true"
              fill
              sizes="50vw"
              draggable={false}
              onLoad={refresh}
              className="select-none object-contain object-right"
            />
            {/* seam line glued to this half's inner (right) edge: steel always
                visible, fire overlay ignites on scroll */}
            <div className="mural-line-steel" style={{ ...steelLineStyle, right: -1.5 }} />
            <div className="mural-line-fire" style={{ ...fireLineStyle, right: -2 }} />
          </div>

          {/* Right half */}
          <div className="mural-half-right absolute right-0 top-0 h-full w-1/2 will-change-transform">
            <Image
              src="/images/mural-right.webp"
              alt=""
              aria-hidden="true"
              fill
              sizes="50vw"
              draggable={false}
              onLoad={refresh}
              className="select-none object-contain object-left"
            />
            {/* seam line glued to this half's inner (left) edge: steel always
                visible, fire overlay ignites on scroll */}
            <div className="mural-line-steel" style={{ ...steelLineStyle, left: -1.5 }} />
            <div className="mural-line-fire" style={{ ...fireLineStyle, left: -2 }} />
          </div>

        </div>
      </div>

      {/* Mobile mural band — the brand signature can't be absent on phones,
          where there's no room for the full-height desktop stage. A compact
          horizontal band of the same transparent mural art (both halves meeting
          at center, on cream) sits above the story and enters with the shared
          reveal. Hidden at md+, where the pinned stage takes over. */}
      <ScrollReveal className="md:hidden px-6 pt-10">
        <div className="relative mx-auto flex aspect-[2/1] w-full max-w-md">
          <div className="relative h-full w-1/2">
            <Image
              src="/images/mural-left.webp"
              alt=""
              aria-hidden="true"
              fill
              sizes="50vw"
              className="select-none object-contain object-right"
            />
          </div>
          <div className="relative h-full w-1/2">
            <Image
              src="/images/mural-right.webp"
              alt=""
              aria-hidden="true"
              fill
              sizes="50vw"
              className="select-none object-contain object-left"
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Text — revealed in the gap on desktop with motion; flows below the
          mural band on mobile and for prefers-reduced-motion (where the mural
          stays whole), so the copy is always visible. */}
      <div className="relative z-10 px-6 pb-20 pt-6 md:pt-0 motion-safe:md:absolute motion-safe:md:inset-x-0 motion-safe:md:top-0 motion-safe:md:h-screen motion-safe:md:flex motion-safe:md:items-center motion-safe:md:justify-center motion-safe:md:px-6 motion-safe:md:pb-0">
        <div
          className="about-text mx-auto w-full text-center"
          style={{
            maxWidth: "min(90%, 34rem)",
            background: "transparent",
            padding: "2.5rem 1.5rem",
          }}
        >
          <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
            Our story
          </p>
          <h2
            id="about-heading"
            className="font-serif text-4xl font-light leading-snug text-foreground md:text-5xl"
          >
            It started with a{" "}
            <em className="italic text-ember">grill</em>
          </h2>
          <div className="mt-8 space-y-5 font-sans text-sm font-light leading-relaxed text-foreground/80">
            <p>
              KM.BBQ started with one idea: really good Korean BBQ that you cook
              yourself. Every table gets its own grill, gas or charcoal.
            </p>
            <p>
              We pick our meat carefully and marinate it in house, using recipes
              we have leaned on for years. You grill it fresh, right where you
              sit, cooked exactly how you like it.
            </p>
            <p>
              Pull up a chair and take your time. Order more whenever you want.
              Good food, a hot grill, and no reason to rush.
            </p>
          </div>
          <PillLink href="/menu" arrow className="mt-10">
            See the menu
          </PillLink>
        </div>
      </div>

      {/* The Grill Awaits — house favorites. At lg with motion this layer
          shares the pinned stage with the story text: the story fades out and
          this builds in while the mural halves keep opening until they leave
          the viewport. Below lg (and for reduced motion) it flows statically
          after the stage — the feature-card grid is too tall to share a
          single pinned tablet viewport. */}
      <div className="grill-layer relative z-10 px-6 pb-24 motion-safe:lg:absolute motion-safe:lg:inset-x-0 motion-safe:lg:top-0 motion-safe:lg:h-screen motion-safe:lg:flex motion-safe:lg:items-center motion-safe:lg:justify-center motion-safe:lg:pb-0 motion-safe:lg:pt-[var(--nav-h)]">
        <div className="mx-auto w-full max-w-4xl text-center lg:max-w-7xl">
          <div className="grill-head">
            <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
              House favorites
            </p>
            <h2
              id="menu-heading"
              className="font-serif text-4xl font-light text-foreground md:text-5xl"
            >
              What to grill first
            </h2>
            {/* transform-gpu: this light gray text picks up blue subpixel-AA
                fringing on some words when rasterized in the main layer —
                looks like link styling. Its own compositing layer rasterizes
                with uniform grayscale AA. */}
            <p className="mx-auto mt-3 max-w-xl transform-gpu font-sans text-base font-light text-foreground/60">
              A few of the ones people order again and again. The full lineup is
              on the menu.
            </p>
          </div>
          {/* Feature grid: Galbi anchors the left half at full height; the
              other four form an equal 2x2 on the right — auto-placement fills
              them left-to-right, top-to-bottom, and the row-span keeps the
              feature flush with the second row's bottom edge. Tablets collapse
              to two columns with Galbi full-width on top; phones stack
              single-file, Galbi first. */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
            {FEATURED_DISHES.map((dish, i) => {
              const isFeature = i === 0;
              const span = isFeature ? "sm:col-span-2 lg:row-span-2" : "";
              return (
                <div
                  key={dish.name}
                  className={`grill-dish group h-full will-change-transform ${span}`}
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-xl bg-white p-5 text-left shadow-warm transition-shadow duration-300 hover:shadow-warm-lg">
                    {/* Feature photo stretches to fill the two-row card; the
                        others crop slightly wider at lg so both grid rows plus
                        the header and CTA share one pinned viewport. */}
                    <div
                      className={`relative w-full overflow-hidden rounded-lg bg-paper ${
                        isFeature
                          ? "aspect-[16/9] lg:aspect-auto lg:min-h-0 lg:flex-1"
                          : "aspect-[16/9] lg:aspect-[2/1]"
                      }`}
                    >
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        sizes={
                          isFeature
                            ? "(max-width: 1023px) 100vw, 50vw"
                            : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                        }
                      />
                      {dish.tag && (
                        <span className="absolute left-2 top-2 z-10 bg-ember-deep px-2 py-1 font-sans text-[11px] font-medium uppercase tracking-widest text-white">
                          {dish.tag}
                        </span>
                      )}
                    </div>
                    <h3
                      className={`mt-3 font-serif font-light text-foreground ${
                        isFeature ? "text-lg lg:text-2xl" : "text-lg"
                      }`}
                    >
                      {dish.name}{" "}
                      <span className="font-sans text-sm font-light text-foreground/40">
                        {dish.korean}
                      </span>
                    </h3>
                    {/* The pinned stage is exactly one viewport tall, so on
                        short desktop screens the description is the line that
                        gets cut — drop it there rather than clipping the CTA
                        below the fold. The feature card keeps its description:
                        its flexible photo absorbs the height instead. */}
                    <p
                      className={`mt-1 font-sans text-sm font-light leading-snug text-foreground/60 ${
                        isFeature
                          ? ""
                          : "motion-safe:lg:[@media(max-height:840px)]:hidden"
                      }`}
                    >
                      {dish.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grill-cta mt-6">
            <PillLink href="/menu">See the full menu</PillLink>
          </div>
        </div>
      </div>
    </section>
  );
}
