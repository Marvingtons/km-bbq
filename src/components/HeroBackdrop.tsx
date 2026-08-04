"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ===========================================================================
   THE HERO LOOP. Served straight from R2 — it is already on a CDN and does not
   belong in the repo.

   WHAT THE CLIP ACTUALLY IS, because the record was wrong about it. NEEDS-
   ASSETS #1 described this file as "a macro of a CLEAN, EMPTY grill plate:
   cold, metallic, no food", and Phase 3 banned it from both the hero and the
   About panel on that basis. Watching it frame by frame: the plate is empty for
   roughly the first second, then a hand oils it, tongs lay down a marbled
   steak, and the remaining eight seconds are that steak searing with the fat
   rendering and juice beading on the ridges. It is close to the shot brief it
   was said to fail.

   1920x1080, H.264, 30fps, 10.17s, 2.3MB. It carries an AAC track we never
   play; stripping it would mean re-encoding and re-uploading, which is a
   deliberate non-goal here.
   =========================================================================== */
const VIDEO_SRC =
  "https://pub-364f647b29874b09922e1889f267c323.r2.dev/kmbbq-hero.mp4";

/**
 * PLAYBACK STARTS AT 2.6s, NOT 0, and loops back to 2.6 rather than to 0.
 *
 * The first ~1.8s is the bare plate and the oiling hand — the only part of the
 * clip that matches the "cold, empty grill" objection. Starting past it buys
 * two things at once:
 *
 *   1. The poster is a frame of the SAME moment (2.6s), so the first painted
 *      video frame matches the poster it replaces. No content jump on start.
 *   2. Anyone who never sees playback at all — reduced motion, a failed R2
 *      fetch, autoplay blocked — is left looking at a marbled steak under
 *      tongs rather than an empty grill.
 *
 * One constant. Set it to 0 to play the clip whole, including the oiling.
 */
const START = 2.6;

/**
 * The poster, cut from the clip at exactly START and shipped as WebP.
 *
 * It is a real <Image> underneath the video rather than the <video poster>
 * attribute, so Next optimises it and `priority` puts it in the preload
 * scanner. The poster is the hero's LCP element, and at 58KB against
 * live-grill.png's 2.36MB that is a large improvement on the interim still.
 *
 * EXPORTED AT 1920x1080 — the video's native size — AND THAT IS AN LCP FIX,
 * not a coincidence. Chrome scores an image LCP candidate at
 * min(displayedArea, intrinsicArea) but scores a video at its displayed area.
 * At 1600x900 the poster's intrinsic area (1.44M px) came out BELOW the
 * stage's displayed area (~1.49M px), so when the clip faded in it counted as
 * a strictly larger candidate and took the LCP slot — measured at 3.4-3.7s
 * against the poster's 640ms. Matching the intrinsic size to the video's makes
 * the two candidates equal, and an equal-sized later candidate does not
 * displace the incumbent.
 */
const POSTER = "/images/hero-poster.webp";

/**
 * The hero's ground.
 *
 * Layering, bottom to top: --char, the poster, the video, then the scrim and
 * the heat glow. The poster never unmounts, so every failure path — R2 down,
 * codec unsupported, autoplay refused, reduced motion — lands on a real
 * photograph rather than a blank or broken box. The video simply never fades
 * in over it.
 */
export function HeroBackdrop({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  // Reduced motion and save-data are read on the client, so the server always
  // renders the poster-only markup and no <video> is requested until we know.
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    type Conn = { saveData?: boolean };
    const saveData = Boolean(
      (navigator as Navigator & { connection?: Conn }).connection?.saveData
    );
    const decide = () => setAllowed(!reduce.matches && !saveData);

    // MOUNT THE VIDEO AFTER `load`, NOT ON HYDRATION. 2.3MB of clip requested
    // during the initial paint competes with the poster for bandwidth on a
    // slow connection, and the poster is the LCP element. Waiting costs
    // nothing visible — the poster is already the frame the clip starts on.
    let idle = 0;
    const arm = () => {
      idle = window.setTimeout(decide, 0);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });

    reduce.addEventListener("change", decide);
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("load", arm);
      reduce.removeEventListener("change", decide);
    };
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !allowed) return;

    // Autoplay can be refused (a data-saver mode, a battery policy, an engine
    // that wants a gesture). Nothing to recover: the poster is already the
    // thing on screen, and `ready` stays false so the video never fades up.
    const start = () => {
      if (el.currentTime < START) el.currentTime = START;
      el.play().catch(() => {});
    };

    // Hold on the poster while the preloader is up, so the loop begins when
    // the visitor can actually see it.
    let cleanup: (() => void) | undefined;
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
      cleanup = () => obs.disconnect();
    } else {
      start();
    }

    // Do not decode frames nobody is looking at. Also asserted by
    // tools/verify-window.mjs, which scrolls the hero off and checks .paused.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cleanup?.();
    };
  }, [allowed]);

  return (
    <div className={`bg-char ${className}`}>
      {/* The poster. `priority` because this is the LCP element, and it stays
          mounted underneath the video for the whole life of the page. */}
      <Image
        src={POSTER}
        alt=""
        aria-hidden="true"
        fill
        priority
        quality={72}
        /* NOT "100vw", and this is the LCP fix.
           `object-cover` on a 16:9 source in a taller-than-16:9 stage scales
           the poster by HEIGHT, so it is drawn ~30% wider than the viewport —
           at 1440x1044 the drawn width is ~1856px. Told "100vw" the browser
           picked the 1200px variant, drew it upscaled, and Chrome scored the
           candidate at 1,241,379 instead of the full visible 1,287,000. The
           video's own candidate is 1,287,000, so it counted as strictly larger
           and TOOK the LCP slot at ~3.6s.
           Asking for the real drawn width makes the two candidates equal, and
           an equal-sized later candidate does not displace the incumbent. */
        sizes="(max-width: 768px) 140vw, 1920px"
        draggable={false}
        className="select-none object-cover object-center [filter:saturate(1.08)_contrast(1.06)_brightness(0.8)]"
      />

      {allowed && (
        <video
          ref={videoRef}
          // width/height give the element its intrinsic 16:9 ratio. The box is
          // inset-0 inside a fixed-height stage so it contributes no layout of
          // its own, but stating the ratio keeps it from being a source of one.
          width={1920}
          height={1080}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[var(--dur-slow)] ease-house [filter:saturate(1.08)_contrast(1.06)_brightness(0.8)] ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          src={VIDEO_SRC}
          poster={POSTER}
          muted
          autoPlay
          playsInline
          // NOT `loop`. Looping would seek back to 0 and replay the empty
          // plate; `onEnded` returns to START instead. `ended` does not fire
          // when the loop attribute is present, which is why it is absent.
          preload="metadata"
          aria-hidden="true"
          onCanPlay={() => setReady(true)}
          onEnded={() => {
            const el = videoRef.current;
            if (!el) return;
            el.currentTime = START;
            el.play().catch(() => {});
          }}
          onError={() => setReady(false)}
        />
      )}

      {/* THE ONE THING LAYERED OVER THE PICTURE, and it is a ground, not a
          veil: char rising from the bottom so the type below has something to
          sit on, plus the heat glow off the grill line. The top two thirds of
          the frame are untouched. */}
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
            /* Heat off the grill line, in the one accent at two densities. */
            "radial-gradient(120% 70% at 50% 118%, rgb(183 52 52 / 0.34) 0%, rgb(183 52 52 / 0.15) 38%, transparent 72%)",
        }}
      />
    </div>
  );
}
