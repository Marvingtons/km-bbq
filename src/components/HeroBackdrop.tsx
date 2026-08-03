"use client";

import { useEffect, useRef, useState } from "react";

/* ===========================================================================
   NEEDS ASSET: hero loop.

   10-15s seamless silent loop of meat on a live grill — close, dim, smoke
   moving, tongs turning a cut. Tripod at table height, lit by the room and the
   grill. 1920x1080 MP4 + WebM, plus a WebP first frame. See NEEDS-ASSETS.md #1.

   The previous clip (kmbbq-hero.mp4 on R2) is a macro of a CLEAN, EMPTY grill
   plate: cold, metallic, no food, and the identical frame the About panel used.
   Phase 3 bans it from both slots, so this component ships the fallback and
   nothing else.

   Set VIDEO_SRC and POSTER when the footage lands and the element below wakes
   up on its own — no other file needs to change.
   =========================================================================== */
const VIDEO_SRC: string | null = null;
const POSTER: string | null = null;

/**
 * The hero's ground.
 *
 * FALLBACK, and it is the state that ships today: the page's own `--char` with
 * a low ember glow rising off the bottom edge, so the frame reads as a dark
 * room with a fire in it rather than as a flat black rectangle or a failed
 * load. No photograph, no stock, no substitute.
 *
 * There is no scrim, halo or veil anywhere in this component. On a `--char`
 * ground `--bone` measures ~13:1 unaided, which is what the whole dark
 * direction buys: the legibility scaffolding the cream hero needed — glyph
 * halos, blurred plates, a radial copy pool — is all deleted.
 */
export function HeroBackdrop({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  // Hold on frame one while the preloader is up, so the loop starts when the
  // visitor can actually see it.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const start = () => {
      el.play().catch(() => {
        /* autoplay blocked — the fallback ground stays up, which is fine */
      });
    };
    if (document.documentElement.classList.contains("preloading")) {
      const obs = new MutationObserver(() => {
        if (!document.documentElement.classList.contains("preloading")) {
          obs.disconnect();
          start();
        }
      });
      obs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => obs.disconnect();
    }
    start();
  }, []);

  return (
    <div className={`bg-char ${className}`}>
      {/* The ember glow. Bottom-anchored and wide, so it reads as heat off a
          grill line rather than as a vignette. Sits under everything. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 118%, rgb(242 123 33 / 0.32) 0%, rgb(230 59 46 / 0.14) 38%, transparent 72%)",
        }}
      />

      {VIDEO_SRC && (
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[var(--dur-slow)] ease-house ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          src={VIDEO_SRC}
          poster={POSTER ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onCanPlay={() => setReady(true)}
        />
      )}
    </div>
  );
}
