"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PillLink } from "./PillLink";
import { SectionSeam } from "./SectionSeam";
import { MOTION, MOTION_OK, NAV_H, HERO_SCRUB } from "@/lib/motion";
import { useScrollRefresh } from "@/lib/useScrollRefresh";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   ABOUT — two beats: the story, then the cuts.

   The mural band that used to sit between them is gone (see the note further
   down). What is left is the section actually doing a job: what this place is,
   beside a photograph of it, and then what to order.
   =========================================================================== */

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

    // The pin and its two breakpoints are gone; every beat in here is a plain
    // scroll-triggered entrance or a scrubbed parallax. Only ONE of them cares
    // about width, and `wide` matches SeamMotion's own condition exactly,
    // because it is a question about the same transition. Reduced motion never
    // enters — the timelines are not built at all, and the CSS default state is
    // the finished layout.
    mm.add({ motion: MOTION_OK, wide: "(min-width: 768px)" }, (context) => {
      const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
      if (!motion) return;

      const textCol = q(".about-text");
      const grillHead = q(".grill-head");
      const grillDishes = q(".grill-dish");

      // THE STORY, and the one entrance on the site that is NOT triggered off
      // its own position.
      //
      // Where the window runs, the copy is revealed by the panel shrinking off
      // it, so "the copy has arrived" and "the panel has passed" are the same
      // event and must not be able to disagree. Triggered the ordinary way
      // (`top 88%`) they did: the copy's position is a function of the viewport
      // HEIGHT and the panel's edge is a function of the viewport WIDTH, so the
      // two drift apart with the aspect ratio. Measured glyph-by-glyph, the
      // panel's left edge was cutting through the heading from 25% to 50% of
      // the transition at 768x800 and 1024x768, and from 30% to 40% at
      // 1440x900 — the pink accent word sliced in half by the edge of a video.
      //
      // So it fires off the hero's own scroll instead, on the same 100vh the
      // clip is scrubbed across. 58% is past the last measured contact (55%) at
      // every viewport, and the 0.6s rise lands inside Phase B (30-80%), so the
      // copy still rises into place behind a shrinking panel exactly as the
      // brief describes — it just cannot be underneath it while it does.
      // A function start re-resolves on every refresh, so this survives resize.
      //
      // Below 768 there is no clip and nothing to clear: the copy takes the
      // ordinary entrance off its own position, like every other section.
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
              // AND IT REVERSES, which the site's other entrances do not.
              // The clip is fully reversible mid-gesture by design, so a
              // one-shot entrance here would let the two disagree: scroll down
              // past 58%, scroll back up, and the copy stays lit while the
              // window re-opens to full-bleed straight over the top of it —
              // the same edge-through-the-heading this trigger exists to
              // prevent, just on the way back. Reversing also reads correctly:
              // the hero is coming back, so the story it revealed goes away.
              toggleActions: "play none none reverse",
            }
          : { trigger: textCol[0], start: "top 88%" },
      });

      // THE FEATURED CUTS, on the shared entrance, feature card first.
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
      // `-mt-[100vh]` pulls this section up under the hero's sticky stage so
      // that ITS FIRST SCREEN is what the hero's window reveals as it clips
      // down. The hero is 200vh with a 100vh sticky stage; this cancels the
      // extra viewport, so net page height is unchanged and About's top lands
      // exactly on the pixel where the stage releases.
      //
      // What is behind the window is now this section's CREAM GROUND with the
      // story composed on it — not the mural. That is the only thing this pass
      // changed about the transition: the layer stack behind the panel. The
      // clip's phases, timing and easing in SeamMotion are untouched.
      //
      // `motion-safe:md:` on BOTH the pull and the hero's extra viewport, in
      // step with SeamMotion's `{ motion, wide }`: where no clip runs there is
      // no window to sit behind, and a section pulled under an opaque hero that
      // then slides off is a section nobody reads. See Hero.tsx.
      //
      // z-base under the hero's z-nav is what puts About behind the window.
      className="grain relative z-base overflow-hidden bg-char motion-safe:md:-mt-[60vh]"
      style={{ ["--nav-h" as string]: `${NAV_H}px` } as React.CSSProperties}
    >
      {/* THE SEAM. Hero -> About is a ground change — footage to cream — so it
          takes the site's one transition device. Markup, not motion: it is
          present for reduced motion and for no-JS, where it is the whole
          transition. */}
      <SectionSeam />

      {/* =====================================================================
          BEAT 2 — THE STORY, ON CREAM.

          This is what the window opens onto, and it is a whole composed
          section from the first frame it is visible: eyebrow, heading, rule,
          copy and the action in the reading column, the video panel docked in
          the media column beside it, cream and whitespace around both.

          `h-screen` at md+ with motion, not `min-h-screen`, and that is
          load-bearing rather than tidy: SeamMotion's `dock()` measures
          `.col-media` ABOUT-RELATIVE and returns null if the cell does not fit
          inside About's first viewport, which would leave the hero unable to
          clip at all. An exact viewport keeps the cell centred inside it at
          every width by construction.
          ===================================================================== */}
      <div className="about-stage relative z-base py-section md:py-section-lg motion-safe:md:h-screen motion-safe:md:py-0">
        <div className="grid-page motion-safe:md:h-full motion-safe:md:items-center">
          {/* The reading column, at column 1 like every other heading on the
              site. It used to move to columns 5-8 under motion, because that
              was the measured width of the gap the mural opened to and the
              copy was revealed inside it. There is no gap any more; the story
              is not a thing revealed in a hole in the art, it is the section. */}
          <div className="about-text col-text">
            <p className="eyebrow mb-4">Our story</p>
            {/* The italic accent word, in the logo pink. This is pink's first
                and most important job: it puts the mark's colour at the most
                typographically premium point of every section, at small scale,
                where it can never compete with ember. */}
            <h2 id="about-heading" className="h2-scale">
              It started with a <em className="italic text-pink">grill</em>
            </h2>
            {/* The section's one rule. Static: it used to draw in on the pinned
                timeline, and with the pin gone there is nothing to draw it
                against. A hairline that animates for its own sake is a tell. */}
            <span
              aria-hidden="true"
              className="about-rule mt-5 block h-px w-16 bg-ember"
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
            {/* The action starts on the same line as the heading above it. */}
            <PillLink href="/menu" arrow className="mt-10">
              See the menu
            </PillLink>
          </div>

          {/* ABOUT'S MEDIA COLUMN. Columns 9-12 out to the right edge — the one
              span `.col-text` never occupies, which is what makes "the panel is
              clear of the copy" a fact about the grid rather than a fact about
              the timing. The clearance is a full empty column plus two gaps, at
              every width, by construction.

              Declared in every state and FILLED only where no panel will ever
              arrive: below 768px, and under reduced motion, where it holds the
              hero's own poster statically docked — the transition's end state
              with nothing animated. At md+ with motion it is deliberately
              EMPTY, because it is the rect SeamMotion measures and clips the
              hero's window down into.

              Second in DOM order on purpose: below 768px the cell stacks UNDER
              the copy rather than above it, so the section still opens on its
              heading at 375px.

              quality/sizes are HeroVideo's exactly, so this resolves to the
              same optimized URL the hero already fetched with `priority` — a
              cache hit, no extra bytes. No `priority` here: a second preload
              would put the LCP candidate in doubt. */}
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

      {/* The Grill Awaits — house favorites. Plain flow now. It used to share
          the pinned stage with the story at lg, building into the gap as the
          mural halves kept opening; with the pin gone it is simply the section
          that follows the band. */}
      <div className="grill-layer relative z-base py-section md:py-section-lg">
        <div className="grid-page">
          <div className="col-full">
          <div className="grill-head">
            <p className="eyebrow mb-4">House favorites</p>
            <h2 id="menu-heading" className="h2-scale">
              What to <em className="italic text-pink">grill</em> first
            </h2>
            {/* transform-gpu: this light gray text picks up blue subpixel-AA
                fringing on some words when rasterized in the main layer —
                looks like link styling. Its own compositing layer rasterizes
                with uniform grayscale AA. */}
            <p className="copy measure mt-3 transform-gpu">
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
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4 lg:gap-7">
            {FEATURED_DISHES.map((dish, i) => {
              const isFeature = i === 0;
              const span = isFeature ? "sm:col-span-2 lg:row-span-2" : "";
              return (
                <div
                  key={dish.name}
                  className={`grill-dish group h-full will-change-transform ${span}`}
                >
                  {/* A card that holds a photograph takes the PHOTO radius, so
                      the frame and the image it frames are one object. */}
                  <div className="flex h-full flex-col overflow-hidden rounded-card bg-char-2 p-5 text-left shadow-card transition-shadow duration-[var(--dur-base)] ease-house hover:shadow-pop">
                    {/* Feature photo stretches to fill the two-row card; the
                        others crop slightly wider so the two grid rows stay
                        level. */}
                    {/* photo: the one photography treatment — warm grade,
                        shadows lifted toward cream, shared corner radius, and
                        the page's grain — so photographs and painted mural read
                        as one family. It carries its own radius and clipping. */}
                    <div
                      className={`photo relative w-full bg-char-2 ${
                        isFeature
                          ? "aspect-[16/9] lg:aspect-auto lg:min-h-0 lg:flex-1"
                          : "aspect-[16/9] lg:aspect-[2/1]"
                      }`}
                    >
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        className="object-cover transition-transform duration-[var(--dur-slow)] ease-house group-hover:scale-[1.04]"
                        sizes={
                          isFeature
                            ? "(max-width: 1023px) 100vw, 50vw"
                            : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                        }
                      />
                      {dish.tag && (
                        <span className="absolute left-2 top-2 z-nav bg-ember px-2 py-1 font-sans text-xs font-medium uppercase tracking-widest text-bone">
                          {dish.tag}
                        </span>
                      )}
                    </div>
                    {/* One card-title size, on the scale's `lead` step. */}
                    <h3 className="mt-3 font-display text-md font-normal text-bone">
                      {dish.name}{" "}
                      <span className="font-sans text-xs font-normal text-bone/40">
                        {dish.korean}
                      </span>
                    </h3>
                    {/* Every card keeps its description now. The rule that hid
                        them on short screens existed because the whole layer
                        had to fit ONE pinned viewport; it flows, so it doesn't. */}
                    <p className="copy mt-1">{dish.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Below the ENTIRE grid, at twice the grid's own gutter, so it reads
              as the section's action rather than an appendage of the feature
              card it happens to sit under.

              Left, not centred: it aligns to the same column edge as the
              heading it belongs to. */}
          <div className="grill-cta mt-10 flex lg:mt-12">
            <PillLink href="/menu">See the full menu</PillLink>
          </div>
          </div>
        </div>
      </div>

    </section>
  );
}
