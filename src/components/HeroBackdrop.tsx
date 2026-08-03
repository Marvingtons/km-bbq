"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

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

/**
 * INTERIM STILL, not a substitute. `live-grill.png` is the client's own
 * photograph of their own grill with their own food on it — meat and shrimp
 * over the coals, smoke up, the room behind. It is the single strongest asset
 * on disk and the closest thing to the shot brief above.
 *
 * It is not stock and it depicts nothing that is off the menu, so it satisfies
 * Laws 1 and 2 while the loop is outstanding. It also does the transition a
 * favour: this is the frame that clips down into About's media column, so the
 * dock lands on a photograph of the room rather than on an empty rectangle.
 *
 * Deliberately NOT in the gallery. One image, one appearance — the hero-to-
 * About move is the same object travelling, not the same photo shown twice.
 */
const STILL = "/images/live-grill.png";

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
      {/* The still, carrying the site's one photo grade. `priority` because
          this is the LCP element. */}
      <Image
        src={STILL}
        alt=""
        aria-hidden="true"
        fill
        priority
        quality={72}
        sizes="100vw"
        draggable={false}
        // The house grade, one notch darker. 0.62 was double-dimming: the
        // scrim below already carries the type, so the filter only has to keep
        // the picture from competing with it.
        // object-position pulls the grill toward the right of the frame on
        // purpose. The headline sits bottom-LEFT, and the hero window clips
        // down into About's columns 9-12 — the right third — so biasing the
        // subject right keeps it out from behind the type AND puts food rather
        // than empty chairs in the docked panel. It is a crop working around a
        // still that was never shot for this transition; the loop in
        // NEEDS-ASSETS #1 makes it moot.
        className="select-none object-cover object-[62%_58%] [filter:saturate(1.08)_contrast(1.06)_brightness(0.8)]"
      />

      {/* THE ONE THING LAYERED OVER THE PICTURE, and it is a ground, not a
          veil: char rising from the bottom so the type below has something to
          sit on, plus the ember glow reading as heat off the grill line. The
          top two thirds of the frame are untouched. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--color-char) 2%, rgb(18 17 16 / 0.86) 30%, rgb(18 17 16 / 0.45) 58%, rgb(18 17 16 / 0.12) 82%, transparent 100%)",
        }}
      />
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
