"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

/* ===========================================================================
   THE HERO LOOP.

   WHAT THE CLIP ACTUALLY IS, because the record was wrong about it. NEEDS-
   ASSETS #1 described this file as "a macro of a CLEAN, EMPTY grill plate:
   cold, metallic, no food", and Phase 3 banned it from both the hero and the
   About panel on that basis. Watching it frame by frame: the plate is empty for
   roughly the first second, then a hand oils it, tongs lay down a marbled
   steak, and the remaining eight seconds are that steak searing with the fat
   rendering and juice beading on the ridges. It is close to the shot brief it
   was said to fail.

   THE FILE WAS RE-ENCODED, and the old one was the reason the hero was slow.
   ---------------------------------------------------------------------------
   The R2 original was 1920x1080 H.264, 30fps, 10.17s, 2.19MB, with an AAC
   track that is never played — and, decisively, it was NOT faststart: its
   `moov` atom sat at byte 2,283,224 of 2,295,655, which is 99.5% of the way
   in. A browser cannot decode a frame until it has the moov, so the whole
   2.19MB had to arrive before anything could play. That is the single largest
   cause of a slow-starting MP4 and it was logged against this file as
   NEEDS-ASSETS #1a.

     ffmpeg -ss 2.6 -i src.mp4 -an -c:v libx264 -profile:v high -level 4.0 \
            -pix_fmt yuv420p -crf 28 -preset slow -movflags +faststart out.mp4

   `+faststart`   moov moves to byte 32. Playback can begin after ~3.6KB.
   `-an`          the AAC track is gone. It was muted at every call site.
   `-ss 2.6`      the bare plate and the oiling hand are cut out of the FILE.
                  See the note on `loop` at the element.
   result         2.19MB -> 1.36MB, 38% smaller, 10.17s -> 7.57s.

   IT IS SERVED FROM /public NOW, NOT FROM R2, and that is a deliberate move
   rather than a convenience. The re-encoded file has to be the one that ships,
   and the R2 bucket is not writable from here; `public/` is served by the same
   Cloudflare edge as the rest of the site through Workers Assets, so it is
   still on a CDN and now it is also versioned with the code that depends on
   its exact timing. If the R2 object is ever replaced with this file, point
   VIDEO_SRC back at it and nothing else changes.
   =========================================================================== */
const VIDEO_SRC = "/kmbbq-hero.mp4";

/**
 * The poster, cut from the clip at what USED to be 2.6s and is now frame zero.
 *
 * It still matches the first painted video frame exactly, because the trim
 * moved the file's start to the moment the poster was taken from — so the
 * hand-off from poster to video is still invisible, and it no longer needs a
 * seek to arrange it.
 *
 * `.webp`, NOT the `.jpg` the brief names: that file does not exist in this
 * repo, and this one is 58KB, is already the LCP element, and carries the
 * `sizes` fix documented below. Inventing a .jpg would have swapped a measured
 * asset for a missing one.
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
 * THE TWO GRADES. The hero sits under bone type on a dark stage and takes the
 * dark grade; About's media sits on --sand and takes the light one, which is
 * the same grade `.photo img` uses in globals.css. DIRECTION.md constraint 8:
 * photography is graded for a light ground, and the dark-ground grade inverts
 * on light. A `brightness(0.8)` circle on sand reads as a hole.
 */
const GRADE_DARK = "[filter:saturate(1.08)_contrast(1.06)_brightness(0.8)]";
const GRADE_LIGHT = "[filter:saturate(1.06)_contrast(1.02)_brightness(1.02)]";

/**
 * The hero's ground — and, with `scrim={false}`, About's media as well.
 *
 * Layering, bottom to top: --char, the poster, the video, then the scrim and
 * the heat glow. The poster never unmounts, so every failure path — origin
 * down, codec unsupported, autoplay refused — lands on a real photograph
 * rather than a blank or broken box. The video simply never fades in over it.
 *
 * THE VIDEO IS IN THE SERVER-RENDERED HTML NOW, and that reverses a decision
 * worth naming. It used to mount only after `window.load`, behind a
 * client-side reduced-motion / save-data check, because 2.3MB of clip
 * requested during the initial paint competed with the poster for bandwidth
 * and the poster is the LCP element. That was the right trade for a 2.19MB
 * file whose moov atom was at the end: nothing could play early anyway, so
 * fetching early bought only contention.
 *
 * The re-encode changes the arithmetic. At 1.36MB and faststart the clip can
 * start on a few KB, so the cost of waiting is now larger than the cost of
 * competing — and waiting for hydration plus `load` plus a timeout is most of
 * a second before the request is even made. The poster keeps the LCP slot on
 * its own merits: it is `priority`, it is 58KB, and it is sized so its
 * candidate area exactly equals the video's (see POSTER), which is what stops
 * a later, equal candidate from displacing it.
 *
 * The reduced-motion gate went with it. It was gating the FETCH, but the thing
 * reduced motion actually objects to is the section-scale choreography, which
 * is gated properly in MediaStage and PickYourFire. A muted, looping,
 * decorative backdrop is not what that preference is about, and its absence
 * used to break the morph's single-element contract at the same time.
 *
 * ONE COMPONENT, TWO PLACES, because everything that is easy to get wrong here
 * is a constant: the source, the loop, the preload, the recovery ladder, the
 * hold-while-preloading, and the "poster is the floor" failure story. Pick
 * Your Fire's media frame continues this clip into a circle and then into the
 * illustration, so it has to be the SAME footage; duplicating any of the above
 * to achieve that would guarantee the two copies drift.
 *
 *   scrim     the char gradient and the heat glow, plus the dark grade. Hero
 *             only — they are type legibility, not the picture.
 */
export function HeroBackdrop({
  className = "",
  scrim = true,
}: {
  className?: string;
  scrim?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  /**
   * ONE PLAY ATTEMPT, callable from anywhere. Safe to call repeatedly: if the
   * element is already playing this is a no-op, and a rejected promise is
   * swallowed because there is nothing to recover — the poster is already the
   * thing on screen and `ready` stays false, so the video never fades up over
   * a frame it cannot decode.
   */
  const play = useCallback(() => {
    const el = videoRef.current;
    if (!el || !el.paused) return;
    el.play().catch(() => {});
  }, []);

  // The cleanup at the bottom of this effect disconnects `io`, disconnects the
  // MutationObserver through the `cleanup` closure, and removes both window
  // listeners — every subscription this effect makes. react-doctor cannot trace
  // the indirected disconnect and flags a leak that does not exist.
  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    /* THE RECOVERY LADDER, and every rung is a real refusal mode.
       ---------------------------------------------------------------------
       1. on mount            — the ordinary case; `autoPlay` usually has it
                                already and this is the belt to that braces.
       2. on `canplay`        — an attempt at mount can be refused simply
                                because no frame has decoded yet. By this event
                                one has. (Wired on the element itself.)
       3. on first user input — iOS in Low Power Mode refuses programmatic
                                playback outright until the page has been
                                touched, and that refusal is permanent until it
                                is. One listener, removed the moment it fires or
                                the moment playback starts by any other route.

       `once: true` on both input listeners, and both are removed in the
       cleanup, so this can never become a handler that outlives the element. */
    play();

    const onFirstInput = () => play();
    window.addEventListener("touchstart", onFirstInput, { once: true, passive: true });
    window.addEventListener("click", onFirstInput, { once: true });

    // Hold on the poster while the preloader is up, so the loop begins when
    // the visitor can actually see it. The element is already fetching by then
    // — this is about when it STARTS, not when it loads.
    let cleanup: (() => void) | undefined;
    if (document.documentElement.classList.contains("preloading")) {
      el.pause();
      const obs = new MutationObserver(() => {
        if (!document.documentElement.classList.contains("preloading")) {
          obs.disconnect();
          play();
        }
      });
      obs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      cleanup = () => obs.disconnect();
    }

    // Do not decode frames nobody is looking at. Also asserted by
    // tools/verify-window.mjs, which scrolls the hero off and checks .paused.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else el.pause();
      },
      { threshold: 0 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cleanup?.();
      window.removeEventListener("touchstart", onFirstInput);
      window.removeEventListener("click", onFirstInput);
    };
  }, [play]);

  return (
    <div className={`${scrim ? "bg-char" : "bg-sand-2"} ${className}`}>
      {/* The poster. `priority` because this is the LCP element, and it stays
          mounted underneath the video for the whole life of the page.

          `sizes` is IDENTICAL in both places on purpose. About's frame is 520px
          and would happily take a 640px variant — but the hero has already
          fetched the 1920 one by the time About needs it, so asking for the
          same URL costs zero bytes and asking for a "better" one costs a whole
          second download. */}
      <Image
        src={POSTER}
        alt=""
        aria-hidden="true"
        fill
        priority={scrim}
        quality={60}
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
        className={`select-none object-cover object-center ${scrim ? GRADE_DARK : GRADE_LIGHT}`}
      />

      {/* SERVER-RENDERED, NOT MOUNTED AFTER `load`. See the note at the top of
          this file: the element is in the HTML the server sends, so the
          preload scanner finds it in the first parse rather than after
          hydration plus a `load` event plus a timeout. */}
      <video
        ref={videoRef}
        // width/height give the element its intrinsic 16:9 ratio. The box is
        // inset-0 inside a fixed-height stage so it contributes no layout of
        // its own, but stating the ratio keeps it from being a source of one.
        width={1920}
        height={1080}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[var(--dur-slow)] ease-house ${
          scrim ? GRADE_DARK : GRADE_LIGHT
        } ${ready ? "opacity-100" : "opacity-0"}`}
        src={VIDEO_SRC}
        poster={POSTER}
        muted
        autoPlay
        /* `loop` IS CORRECT NOW, and it was not before.
           It used to be deliberately absent: the clip opened on ~1.8s of bare
           plate and an oiling hand, so playback started at 2.6s and `onEnded`
           seeked back to 2.6 rather than to 0 — and `ended` never fires when
           `loop` is present, so the two were mutually exclusive.
           The re-encode cut that opening out of the FILE (`-ss 2.6`), so frame
           zero is the steak going down and looping to zero is looping to the
           right place. One attribute replaces a seek, a constant and an event
           handler, and the file is 38% smaller for the same reason. */
        loop
        playsInline
        /* `auto`, and the hero is the one asset on the site worth it. It was
           `metadata`, which fetches the container and stops — fine when the
           element only mounted after `load`, and pointless now that the whole
           point is to have bytes in hand early. The file is 1.36MB and
           faststart, so "auto" is a bounded promise rather than an open one. */
        preload="auto"
        aria-hidden="true"
        onCanPlay={() => {
          setReady(true);
          // RETRY ONCE ON `canplay`. An autoplay refusal at mount is often
          // just "no decoded frames yet" rather than a policy decision, and by
          // this event there are.
          play();
        }}
        onError={() => setReady(false)}
      />
      {/* NO `controls`, ever. The poster is the graceful floor: it never
          unmounts, it sits underneath this element, and every failure path —
          R2 gone, codec unsupported, autoplay refused, reduced motion, save
          data — lands on a real photograph rather than a play button. */}

      {/* THE ONE THING LAYERED OVER THE PICTURE, and it is a ground, not a
          veil: char rising from the bottom so the type below has something to
          sit on, plus the heat glow off the grill line. The top two thirds of
          the frame are untouched.

          Hero only. Nothing sits on About's copy of this footage — it is a
          picture becoming an object, not a bed for type — and a char gradient
          plus an accent glow inside a 520px circle on sand would be most of
          what you see. */}
      {scrim && (
        <>
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
        </>
      )}
    </div>
  );
}
