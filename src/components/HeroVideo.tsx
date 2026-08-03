"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** Frame 0 of the R2 clip, so the still and the loop's first frame are the
 *  same picture — the video can fade up with nothing to see moving. */
const POSTER = "/images/hero-poster.webp";
const VIDEO_SRC =
  "https://pub-364f647b29874b09922e1889f267c323.r2.dev/kmbbq-hero.mp4";

/**
 * The hero's media stack, bottom to top:
 *
 *   1. CREAM. A painted ground, not a transparent gap. Everything above it can
 *      fail — slow network, blocked autoplay, decode error, JS off — and what
 *      shows is the site's own surface. Never a black box, never a white one.
 *   2. POSTER. The LCP element, deliberately. It is in the SSR'd HTML with
 *      `priority`, so it is discoverable in the preload scanner's first pass
 *      and paints without waiting for React.
 *   3. VIDEO. Mounted only by the effect below, only when it is worth it, and
 *      faded up once it actually has frames so it never pops in over the still.
 *
 * The video is never the LCP candidate: it mounts after hydration, and a
 * <video> is not a contentful paint candidate in the first place.
 */

/**
 * Whether this visit gets a video at all. Three ways to answer no:
 *
 * - REDUCED MOTION. A looping background is exactly the thing the setting is
 *   about. Not "paused video" — no element, so nothing can start it.
 * - UNDER 768px. A decorative loop is not worth a phone's data plan on a
 *   restaurant site. The poster is the clip's own first frame, so the small
 *   screen loses motion, not content.
 * - SAVE-DATA. Same reasoning, asked for explicitly by the visitor.
 *
 * Evaluated in an effect rather than during render because the server cannot
 * know any of it; SSR emits the cream + poster, which is the correct no-JS
 * result anyway.
 */
const VIDEO_OK = "(min-width: 768px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

export function HeroVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [wanted, setWanted] = useState(false);
  const [playing, setPlaying] = useState(false);

  // --- decide whether to mount the element -------------------------------
  useEffect(() => {
    const wide = window.matchMedia(VIDEO_OK);
    const reduce = window.matchMedia(REDUCED);
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;

    // Re-decide on threshold crossings: a rotate or a resize past 768px, or the
    // OS motion setting being changed with the page open, both flip this.
    const decide = () => setWanted(wide.matches && !reduce.matches && !saveData);
    decide();
    wide.addEventListener("change", decide);
    reduce.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      reduce.removeEventListener("change", decide);
    };
  }, []);

  // --- hold on frame 0 under the preloader, start clean on the wipe ------
  useEffect(() => {
    const video = ref.current;
    if (!video || !wanted) return;

    const root = document.documentElement;
    const apply = () => {
      if (root.classList.contains("preloading")) video.pause();
      // play() rejects when the browser blocks autoplay; the poster stays up,
      // which is a perfectly good outcome.
      else video.play().catch(() => {});
    };

    // The Preloader adds html.preloading before paint but can remove it at any
    // point after, so watch the class rather than sampling it once. Rewind on
    // each transition so the reveal always lands on the top of the loop.
    let was = root.classList.contains("preloading");
    const observer = new MutationObserver(() => {
      const now = root.classList.contains("preloading");
      if (now === was) return;
      was = now;
      video.currentTime = 0;
      apply();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    if (was) video.currentTime = 0;
    apply();

    // OFF-SCREEN = PAUSED. The hero's window clips down to a small panel and
    // then scrolls away entirely, but a <video> that has left the viewport goes
    // on decoding every frame — burning CPU and battery to render something
    // nobody can see, while the visitor is reading About.
    //
    // threshold 0 fires on the boundary itself, so this releases the decoder
    // the moment the last pixel leaves and resumes before the first one
    // returns. It defers to the preloader check above: while html.preloading is
    // up the clip is meant to be held on frame 0, and coming back into view
    // must not override that.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) video.pause();
        else apply();
      },
      { threshold: 0 }
    );
    io.observe(video);

    return () => {
      observer.disconnect();
      io.disconnect();
    };
  }, [wanted]);

  return (
    <div className={`${className} bg-char`}>
      {/* THE POSTER — and the LCP element. `fill` + `sizes="100vw"` because the
          hero is full-bleed; `priority` emits the preload link.

          quality={60} because this is the largest paint on the page and it is a
          full-bleed background behind big type, not something anyone inspects.
          (It used to be justified by a cream scrim eating the detail. That scrim
          is gone — nothing is layered over the footage now — so the reason is
          simply LCP weight.) */}
      <Image
        src={POSTER}
        alt=""
        aria-hidden="true"
        fill
        priority
        quality={60}
        sizes="100vw"
        draggable={false}
        className="select-none object-cover"
      />

      {wanted && (
        <video
          ref={ref}
          // Fades up on `canplay`. Before that the element is transparent and
          // the poster shows through it — which is why there is no `poster`
          // attribute here: it would be a second fetch of a picture that is
          // already painted underneath.
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-house ${
            playing ? "opacity-100" : "opacity-0"
          }`}
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onCanPlay={() => setPlaying(true)}
          // Any failure just leaves the poster up, permanently.
          onError={() => setWanted(false)}
        />
      )}
    </div>
  );
}
