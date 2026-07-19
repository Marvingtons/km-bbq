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

// NOTE: the full-height seam line (a brushed-steel bar with a fire overlay
// that ignited top-to-bottom, then rode each half's inner edge outward) has
// been removed. It read as a hard mechanical wipe — the mural looked sliced
// rather than opened. The reveal is now dimensional: the halves start slightly
// overscaled and pushed toward centre, then drift apart and settle with a
// parallax offset against the story column. The only rule left in this section
// is a short ember hairline under the story heading.

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
          const leftHalf = q(".mural-half-left");
          const rightHalf = q(".mural-half-right");
          const muralInner = q(".mural-parallax");
          const textCol = q(".about-text");
          const textRule = q(".about-rule");
          const grillLayer = q(".grill-layer");
          const grillCta = q(".grill-cta");

          // Animated start state: the mural sits slightly overscaled and pushed
          // toward centre, as though the world is still closed in on itself.
          // It opens from there rather than being cut down the middle.
          // autoAlpha (opacity + visibility) so a hidden layer never intercepts
          // clicks meant for the visible one — on lg the two layers overlap
          // absolutely in the stage.
          gsap.set([leftHalf, rightHalf], { scale: 1.04 });
          gsap.set(leftHalf, { xPercent: 3 });
          gsap.set(rightHalf, { xPercent: -3 });
          gsap.set(textCol, { autoAlpha: 0, y: MOTION.rise });
          gsap.set(textRule, { scaleX: 0, transformOrigin: "left center" });
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

          // PHASE 1 (progress 0 -> 0.40): the world eases open. The halves
          // drift apart to 36% open while their overscale settles back to 1,
          // so the movement reads as depth resolving rather than two panels
          // being pulled aside. xPercent is relative to the half's own width
          // (50% of the stage), so -36% / +36% opens a centred gap of ~36% of
          // the stage while leaving mural bands framing each side.
          // `power2.out` on the position, linear on the scale: the drift
          // decelerates into place (the "settle") while the scale keeps
          // resolving underneath it.
          tl.to(leftHalf, { xPercent: -36, duration: 0.4, ease: "power2.out" }, 0);
          tl.to(rightHalf, { xPercent: 36, duration: 0.4, ease: "power2.out" }, 0);
          tl.to([leftHalf, rightHalf], { scale: 1, duration: 0.4 }, 0);

          // DEPTH. The halves also drift vertically across the whole pin at
          // roughly 0.9x the copy's rate, so the mural sits behind the story
          // rather than on the same plane. Body copy never moves.
          tl.fromTo(
            muralInner,
            { yPercent: -1.6 },
            { yPercent: 1.6, duration: 1 },
            0
          );

          // PHASE 2 (0.16 -> 0.36): the story arrives AFTER the halves have
          // begun settling, on the shared rise/duration, then gets a beat of
          // stillness (to 0.52) to read. Its ember rule draws in underneath
          // the heading once the copy is up — the only rule in the section now.
          tl.to(
            textCol,
            { autoAlpha: 1, y: 0, duration: 0.2, ease: MOTION.gsapEase },
            0.16
          );
          tl.to(textRule, { scaleX: 1, duration: 0.14 }, 0.3);

          // PHASE 3 (0.52 -> 1.0): the mural keeps opening out — each half
          // moves past its own width so the art has fully left the viewport by
          // the end of the pin. No close, one continuous motion.
          // ±104 rather than ±100 leaves a little margin against the vertical
          // parallax drift, so neither half can leave a sliver at the edge.
          // (This used to be ±110 to clear the seam line's 30px glow; with the
          // line gone, the art itself is all that has to clear.)
          tl.to(leftHalf, { xPercent: -104, duration: 0.48 }, 0.52);
          tl.to(rightHalf, { xPercent: 104, duration: 0.48 }, 0.52);
          tl.to(textCol, { autoAlpha: 0, y: -MOTION.rise / 2, duration: 0.1 }, 0.52);

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
            // Starts at 0.90, not 0.86: the cards are still settling out of
            // their y:70 entrance until ~0.90 once the scrub's catch-up is
            // accounted for, and the pill sits directly beneath them. Fading
            // it in after they land means it is never visible at less than its
            // full clearance from the card above it.
            tl.fromTo(
              grillCta,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.1 },
              0.9
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
          {/* Depth layer: carries BOTH halves on a slow vertical drift (~0.9x
              the story column's rate) across the pin, so the mural reads as
              sitting behind the copy rather than on the same plane. Separate
              from the halves themselves so their own open/settle transform is
              never fighting the parallax on the same element. */}
          <div className="mural-parallax absolute inset-0 will-change-transform">
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
          </div>
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
          {/* The section's one rule, replacing the full-height seam that used
              to split the mural. It draws in from the left after the copy has
              risen. Defaults to fully drawn, so the no-JS and reduced-motion
              states show a static hairline rather than nothing. */}
          <span
            aria-hidden="true"
            className="about-rule mx-auto mt-5 block h-px w-16 bg-ember"
          />
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
          {/* Tighter head-to-grid gap at lg than elsewhere: the whole layer has
              to fit one pinned viewport, and that reclaimed space is what pays
              for the CTA's clearance below the grid. */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-4 lg:grid-cols-4 lg:gap-7">
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
                        its flexible photo absorbs the height instead.

                        Threshold raised 840 -> 895. Measured, the full-height
                        layout needs ~894px of viewport; between 841 and 893 it
                        was overflowing and pushing the CTA past the fold (at
                        850 it hung 19px over). 900 still gets the full layout
                        with its descriptions. */}
                    <p
                      className={`mt-1 font-sans text-sm font-light leading-snug text-foreground/60 ${
                        isFeature
                          ? ""
                          : "motion-safe:lg:[@media(max-height:895px)]:hidden"
                      }`}
                    >
                      {dish.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Centred below the ENTIRE grid, at twice the grid's own gutter, so
              it reads as the section's action rather than an appendage of the
              feature card it happens to sit under. The old mt-6 (24px) put it
              inside both that card's shadow (~30px reach) and the travel of
              the seam handoff above. */}
          <div className="grill-cta mt-10 flex justify-center lg:mt-12">
            <PillLink href="/menu">See the full menu</PillLink>
          </div>
        </div>
      </div>

      {/* Seam: About -> Gallery. A couple of mural accents drift down past the
          boundary and fade, so the illustrated world trails off into the
          photography instead of stopping at a border. In the original this sat
          at the mural/favorites seam, which no longer exists as a boundary. */}
      <div
        // z-[9], below the content layer (z-10): these are decorative accents
        // drifting toward the Gallery seam, and at z-[13] they painted across
        // the "See the full menu" pill during the pin.
        // opacity-0 by default: SeamMotion fades these in only as the About ->
        // Gallery boundary arrives (its tween is immediateRender:false). z-[9]
        // keeps them below the content layer as well.
        className="mural-trail pointer-events-none absolute inset-x-0 bottom-6 z-[9] flex items-center justify-center gap-16 motion-reduce:hidden [&>*]:opacity-0"
        aria-hidden="true"
      >
        <span
          className="block h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--color-ember)", opacity: 0.7 }}
        />
        <svg width="34" height="14" viewBox="0 0 34 14" fill="none">
          <path
            d="M1 9c5-6 10 4 16-1s10-6 16 2"
            stroke="var(--color-body)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </svg>
        <span
          className="block h-2 w-2 rounded-full"
          style={{ background: "var(--color-ember)", opacity: 0.6 }}
        />
      </div>
    </section>
  );
}
