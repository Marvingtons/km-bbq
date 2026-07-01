"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

export function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const q = gsap.utils.selector(sectionRef);

    // Desktop / tablet with motion allowed: pin + draw-line + split.
    // prefers-reduced-motion and small screens fall through to the default
    // CSS state (full seamless mural, text visible, no pin).
    mm.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const fireLines = q(".mural-line-fire");
        const leftHalf = q(".mural-half-left");
        const rightHalf = q(".mural-half-right");
        const textCol = q(".about-text");

        // Animated start state: steel line already showing (its default), fire
        // not yet ignited, mural closed, text hidden.
        gsap.set(fireLines, { scaleY: 0, transformOrigin: "top center" });
        gsap.set(leftHalf, { xPercent: 0 });
        gsap.set(rightHalf, { xPercent: 0 });
        gsap.set(textCol, { opacity: 0, scale: 0.92 });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=150%",
            pin: true,
            pinSpacing: true,
            // Switch to position:fixed one tick early so the browser doesn't
            // show a one-frame compositing jump (the mural appearing to nudge
            // sideways) at the instant the pin engages.
            anticipatePin: 1,
            // Numeric scrub adds a ~0.8s catch-up so the timeline eases toward
            // the scroll position instead of snapping to it frame-for-frame.
            // This is what makes the mural open/ignite feel smooth rather than
            // stepping in hard chunks with each wheel/trackpad notch.
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });

        // PHASE 1 (progress 0 -> 0.42): fire ignites down the existing steel
        // line, top -> bottom, mural still closed.
        tl.fromTo(fireLines, { scaleY: 0 }, { scaleY: 1, duration: 0.42 }, 0);

        // PHASE 2 (0.42 -> 1.0): halves slide to 36% open; each carries its
        // line segment along its inner edge. xPercent is relative to the half's
        // own width (50% of the stage), so -36% / +36% opens a centered gap of
        // ~36% of the stage while leaving mural bands framing each side.
        tl.to(leftHalf, { xPercent: -36, duration: 0.58 }, 0.42);
        tl.to(rightHalf, { xPercent: 36, duration: 0.58 }, 0.42);

        // Text: start ~10% into phase 2, fully visible by ~70% of it.
        tl.to(textCol, { opacity: 1, scale: 1, duration: 0.35 }, 0.48);

        // Recompute pin spacing once the half images have laid out.
        ScrollTrigger.refresh();
      }
    );

    // Mobile (no pin/split): the full mural renders as a static banner above
    // the copy. Give the stacked text a gentle, non-pinned fade/slide-up as it
    // scrolls into view. prefers-reduced-motion phones get the plain static
    // layout (this block never runs for them).
    mm.add(
      "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      () => {
        const textCol = q(".about-text");
        gsap.from(textCol, {
          opacity: 0,
          y: 24,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: textCol[0],
            start: "top 88%",
          },
        });
      }
    );

    // Re-measure pin start/end once async content settles. The mural <img>s
    // already call refresh on load, but fonts and the final window load can
    // also shift layout; measuring against stale sizes is what makes the pin
    // jump on the first scroll instead of scrubbing from the right spot.
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
      id="about"
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-white"
      style={{ ["--nav-h" as string]: "68px" } as React.CSSProperties}
    >
      {/* Mural stage (>= md only — hidden on mobile, where it's omitted
          entirely). The halves are `object-contain` everywhere so the whole
          illustration is always shown — nothing is cropped. The art sits on a
          white field that blends into this section's white background, so the
          contain letterboxing is invisible and the two halves meet flush at the
          center seam. On desktop the stage is full height (vertically centered
          art); on reduced motion it keeps the mural's natural ~2535:1240
          combined ratio inside the content column. */}
      <div className="hidden md:block relative z-20 px-6 md:px-0 motion-safe:md:min-h-screen">
        <div className="relative mx-auto aspect-[2535/1240] w-full max-w-7xl overflow-hidden md:mx-0 md:aspect-auto md:h-screen md:max-w-none">
          {/* Left half */}
          <div className="mural-half-left absolute left-0 top-0 h-full w-1/2 will-change-transform">
            <img
              src="/images/mural-left.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              onLoad={refresh}
              className="block h-full w-full select-none object-contain object-right"
            />
            {/* seam line glued to this half's inner (right) edge: steel always
                visible, fire overlay ignites on scroll */}
            <div className="mural-line-steel" style={{ ...steelLineStyle, right: -1.5 }} />
            <div className="mural-line-fire" style={{ ...fireLineStyle, right: -2 }} />
          </div>

          {/* Right half */}
          <div className="mural-half-right absolute right-0 top-0 h-full w-1/2 will-change-transform">
            <img
              src="/images/mural-right.png"
              alt=""
              aria-hidden="true"
              draggable={false}
              onLoad={refresh}
              className="block h-full w-full select-none object-contain object-left"
            />
            {/* seam line glued to this half's inner (left) edge: steel always
                visible, fire overlay ignites on scroll */}
            <div className="mural-line-steel" style={{ ...steelLineStyle, left: -1.5 }} />
            <div className="mural-line-fire" style={{ ...fireLineStyle, left: -2 }} />
          </div>

          {/* Top edge fades the mural up out of the page — this carries the bulk
              of the hero→mural dissolve so it reads as fading INTO the mural
              rather than out of the video above. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-30 h-40 bg-gradient-to-b from-white to-transparent"
          />
        </div>
      </div>

      {/* Text — revealed in the gap on desktop with motion; flows below the
          mural on mobile and for prefers-reduced-motion (where the mural stays
          whole), so the copy is always visible. */}
      <div className="relative z-10 px-6 pb-20 pt-8 md:pt-0 motion-safe:md:absolute motion-safe:md:inset-0 motion-safe:md:flex motion-safe:md:items-center motion-safe:md:justify-center motion-safe:md:px-6 motion-safe:md:pb-0">
        <div
          className="about-text mx-auto w-full text-center"
          style={{
            maxWidth: "min(90%, 34rem)",
            background: "transparent",
            padding: "2.5rem 1.5rem",
          }}
        >
          <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-brand-orange">
            Our Story
          </p>
          <h2
            id="about-heading"
            className="font-serif text-4xl font-light leading-snug text-foreground md:text-5xl"
          >
            A Tradition{" "}
            <em className="italic text-brand-blue">Born in Fire</em>
          </h2>
          <div className="mt-8 space-y-5 font-sans text-sm font-light leading-relaxed text-foreground/80">
            <p>
              KM.BBQ was born from a simple obsession: the perfect bite. We bring
              the warmth of Korean family grilling to every table — live charcoal,
              hand-trimmed cuts, and banchan made fresh daily.
            </p>
            <p>
              We source our meats from trusted partners, choosing quality over
              convenience. Every cut is marinated in-house using recipes passed
              down through generations, balanced with our own modern touches.
            </p>
            <p>
              This is not fast food. This is slow fire, shared plates, and the
              kind of meal you remember.
            </p>
          </div>
          <Link
            href="/menu"
            className="mt-10 inline-flex items-center gap-2 font-sans text-sm font-medium text-brand-orange transition-all hover:gap-3"
          >
            Explore our menu
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
