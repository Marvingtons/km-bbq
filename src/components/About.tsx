"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Thin brushed-steel vertical line. Two identical segments overlap at the
// seam at rest (looking like one line); each rides its half's inner edge
// outward during the split because it is a child of that half.
const lineStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: 3,
  borderRadius: 2,
  background:
    "linear-gradient(180deg, #4a4a4e 0%, #6f6f74 30%, #9a9aa0 50%, #6f6f74 70%, #4a4a4e 100%)",
  boxShadow: "0 0 5px rgba(140,140,150,.55), 0 0 10px rgba(140,140,150,.3)",
  transformOrigin: "top center",
  transform: "scaleY(0)", // hidden by default (fallback shows a clean mural)
  zIndex: 10,
  pointerEvents: "none",
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
        const lines = q(".mural-line");
        const leftHalf = q(".mural-half-left");
        const rightHalf = q(".mural-half-right");
        const textCol = q(".about-text");

        // Animated start state: line undrawn, mural closed, text hidden.
        gsap.set(lines, { scaleY: 0 });
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
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        // PHASE 1 (progress 0 -> 0.42): draw the line top -> bottom, mural closed.
        tl.fromTo(lines, { scaleY: 0 }, { scaleY: 1, duration: 0.42 }, 0);

        // PHASE 2 (0.42 -> 1.0): halves slide to 40% open; each carries its
        // line segment along its inner edge. xPercent is relative to the half's
        // own width (50% of the stage), so -40% / +40% opens a centered gap of
        // ~40% of the stage while leaving ~30% mural bands framing each side.
        tl.to(leftHalf, { xPercent: -40, duration: 0.58 }, 0.42);
        tl.to(rightHalf, { xPercent: 40, duration: 0.58 }, 0.42);

        // Text: start ~10% into phase 2, fully visible by ~70% of it.
        tl.to(textCol, { opacity: 1, scale: 1, duration: 0.35 }, 0.48);

        // Recompute pin spacing once the half images have laid out.
        ScrollTrigger.refresh();
      }
    );

    return () => mm.revert();
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
      {/* Mural stage. The halves are `object-contain` everywhere so the whole
          illustration is always shown — nothing is cropped. The art sits on a
          white field that blends into this section's white background, so the
          contain letterboxing is invisible and the two halves meet flush at the
          center seam. On desktop the stage is full height (vertically centered
          art); on mobile / reduced motion it keeps the mural's natural ~2535:1240
          combined ratio inside the content column. */}
      <div className="relative z-20 px-6 md:px-0 motion-safe:md:min-h-screen">
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
            {/* line glued to this half's inner (right) edge, straddling the seam */}
            <div className="mural-line" style={{ ...lineStyle, right: -1.5 }} />
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
            {/* line glued to this half's inner (left) edge, straddling the seam */}
            <div className="mural-line" style={{ ...lineStyle, left: -1.5 }} />
          </div>
        </div>
      </div>

      {/* Text — revealed in the gap on desktop with motion; flows below the
          mural on mobile and for prefers-reduced-motion (where the mural stays
          whole), so the copy is always visible. */}
      <div className="relative z-10 px-6 pb-20 motion-safe:md:absolute motion-safe:md:inset-0 motion-safe:md:flex motion-safe:md:items-center motion-safe:md:justify-center motion-safe:md:px-6 motion-safe:md:pb-0">
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
            className="font-serif text-5xl font-light leading-snug text-foreground md:text-6xl"
          >
            A Tradition{" "}
            <em className="italic text-brand-blue">Born in Fire</em>
          </h2>
          <div className="mt-8 space-y-5 font-sans text-base font-light leading-relaxed text-foreground/80">
            <p>
              KM.BBQ was born from a simple obsession: the perfect bite. Founded
              in [Year] by [Founder Name], our restaurant brings the warmth of
              Korean family grilling to every table — live charcoal, hand-trimmed
              cuts, and banchan made fresh daily.
            </p>
            <p>
              We source our meats from [local farms / partners], choosing quality
              over convenience. Every cut is marinated in-house using recipes
              passed down through generations, balanced with our own modern
              touches.
            </p>
            <p>
              This is not fast food. This is slow fire, shared plates, and the
              kind of meal you remember.
            </p>
          </div>
          <a
            href="#menu"
            className="mt-10 inline-flex items-center gap-2 font-sans text-sm font-medium text-brand-orange transition-all hover:gap-3"
          >
            Explore our menu
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
