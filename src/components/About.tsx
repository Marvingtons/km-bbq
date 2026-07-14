"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EASE, DUR, STAGGER, RISE, MOTION_OK } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   ABOUT — the hand-drawn brand MURAL, brought to life
   ---------------------------------------------------------------------------
   The full-color mural is KM.BBQ's signature. Two illustrated clusters
   (mural-left / mural-right) frame the story copy; a faint doodle-scatter
   sits behind. Three depth planes drift at DIFFERENT scroll speeds so the
   flat art reads as a living scene:

     • scatter  (deepest)  → drifts SLOW      (.mural-scatter, parallax y ±30)
     • copy     (middle)   → drifts a touch   (.mural-copy-parallax, y ±14)
     • clusters (front)    → drift FAST        (.mural-cluster-*, y ±80/100, +x)

   The illustration PNGs are pre-multiplied against the page cream (baked at
   build, *-cream.png) so their field already matches the page and they composite
   normally — NO mix-blend on these moving layers (blend + transform per frame
   was the mural's perf cost). Each cluster settles + fades in on scroll
   (staggered), then breathes with a gentle idle bob that pauses off-screen.

   Motion contract (holds 60fps): scrubbed parallax and idle motion only ever
   touch `transform`/`opacity`, on SEPARATE nested layers (outer = parallax y,
   inner = entrance, img = idle bob) so nothing fights for the same property, and
   no layer carries a permanent will-change. Reduced motion / no-JS render the
   finished, static mural with the copy fully legible — the whole GSAP block
   lives inside a `no-preference` matchMedia.
   =========================================================================== */

// Faint background doodle-scatter — the mural's own folk-doodle vocabulary
// (dots + brush ticks) as the deepest, slowest parallax plane. Fixed values so
// the SSR and client renders match; each mark wanders on its own idle drift.
const SCATTER = [
  { l: 20, t: 24, s: 9, c: "ember", o: 0.5, dx: 14, dy: -10, dur: 12, dl: 0 },
  { l: 72, t: 20, s: 6, c: "warm", o: 0.4, dx: -12, dy: 9, dur: 13, dl: 1.4 },
  { l: 15, t: 62, s: 7, c: "ember", o: 0.42, dx: 9, dy: 12, dur: 14, dl: 0.7 },
  { l: 80, t: 66, s: 5, c: "warm", o: 0.4, dx: -10, dy: -8, dur: 12.5, dl: 2.1 },
  { l: 34, t: 82, s: 6, c: "ember", o: 0.38, dx: 11, dy: 9, dur: 15, dl: 1.1 },
  { l: 63, t: 80, s: 5, c: "ember", o: 0.4, dx: -8, dy: 11, dur: 13.5, dl: 0.4 },
] as const;

// A couple of thin brush ticks, same deep plane — a nod to the mural's ink
// strokes without competing with the copy.
const TICKS = [
  { l: 26, t: 40, w: 34, rot: -22, o: 0.28 },
  { l: 70, t: 52, w: 28, rot: 16, o: 0.26 },
] as const;

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
  },
];

export function About() {
  return (
    <>
      <MuralStory />
      <HouseFavorites />
    </>
  );
}

/* ---------------------------------------------------------------------------
   MURAL STORY — the warm, full-color brand band
   --------------------------------------------------------------------------- */
function MuralStory() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(el);

    mm.add(MOTION_OK, () => {
      const enter = q(".mural-enter");
      const marks = q(".mural-mark");
      const copyIn = q(".mural-copy-in");

      // Animated start state — clusters pushed down + shrunk, marks + copy
      // hidden. Applied in useLayoutEffect (pre-paint) so there's no flash.
      gsap.set(enter, { autoAlpha: 0, yPercent: 6, scale: 0.965 });
      gsap.set(marks, { autoAlpha: 0 });
      gsap.set(copyIn, { autoAlpha: 0, y: 22 });

      // Staggered settle-in on scroll-into-view: copy first, the faint scatter
      // blooms in, then the two clusters arrive one after the other.
      const tlIn = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 72%", once: true },
      });
      tlIn
        .to(copyIn, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.out })
        .to(marks, { autoAlpha: 1, duration: DUR.base, stagger: STAGGER.tight }, 0.1)
        .to(
          enter,
          {
            autoAlpha: 1,
            yPercent: 0,
            scale: 1,
            duration: DUR.slow,
            ease: EASE.out,
            stagger: STAGGER.loose,
          },
          0.08
        );

      // Scrubbed parallax — one plane per depth, different travel = different
      // speed. `ease: none` + scrub ties travel to scroll position. These write
      // transform on the OUTER wrappers only; entrance/idle live on inner layers.
      const scrub = (
        targets: Element[],
        from: gsap.TweenVars,
        to: gsap.TweenVars
      ) =>
        gsap.fromTo(targets, from, {
          ...to,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

      scrub(q(".mural-scatter"), { y: -30 }, { y: 30 });
      scrub(q(".mural-copy-parallax"), { y: -14 }, { y: 14 });
      scrub(q(".mural-cluster-left"), { y: -74, x: -8 }, { y: 74, x: 8 });
      scrub(q(".mural-cluster-right"), { y: -98, x: 8 }, { y: 98, x: -8 });
    });

    // Pause the idle bob/drift whenever the mural leaves the viewport, so it
    // never animates (or holds a layer) off-screen. CSS reads .mural-paused.
    const io = new IntersectionObserver(
      ([entry]) => el.classList.toggle("mural-paused", !entry.isIntersecting),
      { rootMargin: "0px" }
    );
    io.observe(el);

    // Re-measure once fonts/images settle so parallax ranges line up.
    const refreshST = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshST);
    document.fonts?.ready.then(refreshST);

    return () => {
      window.removeEventListener("load", refreshST);
      io.disconnect();
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      className="relative isolate overflow-hidden bg-cream scroll-mt-20"
    >
      <div className="relative flex min-h-[42rem] items-center justify-center px-6 py-section md:min-h-[46rem]">
        {/* ---- SCATTER (z-0, deepest / slowest) ------------------------- */}
        <div
          className="mural-scatter pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        >
          {SCATTER.map((m, i) => (
            <span
              key={`d${i}`}
              className="mural-mark mural-drift absolute block rounded-full"
              style={
                {
                  left: `${m.l}%`,
                  top: `${m.t}%`,
                  width: m.s,
                  height: m.s,
                  opacity: m.o,
                  background:
                    m.c === "ember"
                      ? "var(--color-ember)"
                      : "var(--color-warm-muted)",
                  "--dx": `${m.dx}px`,
                  "--dy": `${m.dy}px`,
                  "--drift-dur": `${m.dur}s`,
                  "--drift-delay": `${m.dl}s`,
                } as React.CSSProperties
              }
            />
          ))}
          {TICKS.map((t, i) => (
            <span
              key={`t${i}`}
              className="mural-mark mural-drift absolute block h-[3px] rounded-full"
              style={
                {
                  left: `${t.l}%`,
                  top: `${t.t}%`,
                  width: t.w,
                  opacity: t.o,
                  background: "var(--color-ember)",
                  transform: `rotate(${t.rot}deg)`,
                  "--dx": "8px",
                  "--dy": "-6px",
                  "--drift-dur": "16s",
                  "--drift-delay": `${i * 1.3}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* ---- CLUSTERS (z-10, front / fastest) ------------------------- */}
        {/* Left cluster — tiger, drummer, hanok, stews. The PNG is pre-baked
            against page cream, so it composites normally (no blend on this
            moving layer). Outer wrapper = parallax; inner = entrance; img = bob. */}
        <div className="mural-cluster-left pointer-events-none absolute inset-y-0 -left-[5%] z-10 w-[56%] max-w-[540px] sm:w-[46%] md:w-[39%]">
          <div className="mural-enter absolute inset-0 flex items-center">
            <Image
              src="/images/mural-left-cream.png"
              alt=""
              aria-hidden="true"
              width={886}
              height={886}
              className="mural-bob h-auto w-full object-contain"
              style={{ "--bob": "-10px", "--bob-dur": "7s" } as React.CSSProperties}
              sizes="(max-width: 768px) 56vw, 39vw"
            />
          </div>
        </div>

        {/* Right cluster — grill, mask, the fire mascot, soju, pine. */}
        <div className="mural-cluster-right pointer-events-none absolute inset-y-0 -right-[5%] z-10 w-[56%] max-w-[540px] sm:w-[46%] md:w-[39%]">
          <div className="mural-enter absolute inset-0 flex items-center">
            <Image
              src="/images/mural-right-cream.png"
              alt=""
              aria-hidden="true"
              width={886}
              height={886}
              className="mural-bob h-auto w-full object-contain"
              style={
                { "--bob": "-13px", "--bob-dur": "8.5s", "--bob-delay": "0.6s" } as React.CSSProperties
              }
              sizes="(max-width: 768px) 56vw, 39vw"
            />
          </div>
        </div>

        {/* ---- EDGE FADES — melt the mural band's top & bottom into the page
            cream so it reads as art emerging from the page, not a rectangle. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[12] h-20 bg-gradient-to-b from-cream to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[12] h-20 bg-gradient-to-t from-cream to-transparent"
        />

        {/* ---- COPY (z-20, middle) — a soft cream field carves a clean, empty
            reading column out of the busy mural (the composition wants an empty
            centre); the art stays rich, full-colour, and untouched at the edges
            and frames the story. Sized generously with a firm cream plateau so
            the copy always lands on clean cream — even at 375px, where the
            clusters otherwise crowded the text — rather than dimming the mural.
            The top/bottom edge fades above keep the field from reading as a
            hard rectangle. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-[15] h-[38rem] w-[46rem] max-w-[97vw] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(68% 60% at 50% 50%, var(--color-cream) 0%, var(--color-cream) 66%, color-mix(in srgb, var(--color-cream) 82%, transparent) 82%, transparent 100%)",
          }}
        />
        <div className="mural-copy-parallax relative z-20 mx-auto w-full max-w-[34rem] px-2 text-center">
          <div className="mural-copy-in">
            <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.32em] text-ember-deep">
              Our Story
            </p>
            <h2
              id="about-heading"
              className="font-serif text-4xl font-light leading-[1.12] text-ink sm:text-5xl md:text-[3.4rem]"
            >
              A Tradition{" "}
              <em className="italic text-ember">Born in Fire</em>
            </h2>
            <div className="mt-7 space-y-5 font-sans text-sm font-light leading-relaxed text-warm sm:text-base">
              <p>
                KM.BBQ was born from a simple obsession: the perfect bite. We
                bring the warmth of Korean family grilling to every table — live
                charcoal, hand-trimmed cuts, and banchan made fresh daily.
              </p>
              <p>
                We source our meats from trusted partners, choosing quality over
                convenience. Every cut is marinated in-house using recipes
                passed down through generations, balanced with our own modern
                touches.
              </p>
              <p>
                Pull up a chair, fire up the grill, and take your time. Shared
                plates, second helpings, and the kind of meal you linger over.
              </p>
            </div>

            <Link
              href="/menu"
              className="relative isolate mt-9 inline-flex items-center gap-2 overflow-hidden rounded-full border border-ember-deep px-8 py-3 font-sans text-sm font-medium text-ember-deep transition-colors duration-300 ease-out before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-ember-deep before:transition-transform before:duration-300 before:ease-out hover:text-white hover:before:scale-x-100 focus-visible:text-white focus-visible:before:scale-x-100"
            >
              Explore our menu
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   HOUSE FAVORITES — warm cream cards, staggered reveal
   --------------------------------------------------------------------------- */
function HouseFavorites() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(el);

    mm.add(MOTION_OK, () => {
      const head = q(".grill-head");
      const dishes = q(".grill-dish");

      gsap.from(head, {
        opacity: 0,
        y: RISE,
        duration: DUR.base,
        ease: EASE.out,
        scrollTrigger: { trigger: head[0], start: "top 88%" },
      });
      gsap.from(dishes, {
        opacity: 0,
        y: RISE,
        duration: DUR.base,
        stagger: STAGGER.base,
        ease: EASE.out,
        scrollTrigger: { trigger: dishes[0], start: "top 90%" },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="favorites-heading"
      className="relative bg-cream-deep px-6 py-section"
    >
      <div className="mx-auto w-full max-w-4xl text-center lg:max-w-7xl">
        <div className="grill-head">
          <p className="mb-4 transform-gpu font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
            House Favorites
          </p>
          <h2
            id="favorites-heading"
            className="transform-gpu font-serif text-4xl font-light text-ink md:text-5xl"
          >
            The Grill Awaits
          </h2>
          <p className="mx-auto mt-3 max-w-xl transform-gpu font-sans text-base font-light text-warm">
            A taste of what&rsquo;s waiting at your table &mdash; signature
            cuts, classics, and the banchan that brings it all together.
          </p>
        </div>

        {/* Galbi anchors the left column at full height; the other four form an
            equal 2x2 on the right. Tablets: two columns, Galbi full-width on
            top. Phones: single file, Galbi first. */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {FEATURED_DISHES.map((dish, i) => {
            const isFeature = i === 0;
            const span = isFeature ? "sm:col-span-2 lg:row-span-2" : "";
            return (
              <div
                key={dish.name}
                className={`grill-dish group h-full ${span}`}
              >
                <div className="flex h-full flex-col rounded-card bg-cream p-5 text-left shadow-card transition-[transform,box-shadow] duration-300 transform-gpu hover:-translate-y-1">
                  <div
                    className={`relative w-full overflow-hidden rounded-card bg-cream-deep ${
                      isFeature
                        ? "aspect-[16/9] lg:aspect-auto lg:min-h-0 lg:flex-1"
                        : "aspect-[16/9] lg:aspect-[2/1]"
                    }`}
                  >
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                      sizes={
                        isFeature
                          ? "(max-width: 1023px) 100vw, 50vw"
                          : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                      }
                    />
                    {dish.tag && (
                      <span className="absolute left-2.5 top-2.5 z-10 inline-flex items-center rounded-full bg-ember-deep px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                        {dish.tag}
                      </span>
                    )}
                  </div>
                  <h3
                    className={`mt-3 font-serif font-light text-ink ${
                      isFeature ? "text-lg lg:text-2xl" : "text-lg"
                    }`}
                  >
                    {dish.name}{" "}
                    <span className="font-sans text-sm font-light text-warm-muted">
                      {dish.korean}
                    </span>
                  </h3>
                  <p className="mt-1 font-sans text-sm font-light leading-snug text-warm">
                    {dish.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Link
            href="/menu"
            className="relative isolate inline-flex overflow-hidden rounded-full border border-ember-deep px-8 py-3 font-sans text-sm font-medium text-ember-deep transition-colors duration-300 ease-out before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:bg-ember-deep before:transition-transform before:duration-300 before:ease-out hover:text-white hover:before:scale-x-100 focus-visible:text-white focus-visible:before:scale-x-100"
          >
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
}
