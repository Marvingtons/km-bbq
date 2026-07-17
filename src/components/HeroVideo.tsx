"use client";

import { useEffect, useRef, useState } from "react";

// The poster is the R2 clip's own first frame, so the still shown before/while
// the video loads matches the frame the loop starts on — no jump on reveal.
const POSTER = "/images/hero-poster.jpg";

/**
 * The hero's grill clip, served from R2. Autoplays muted, but honors
 * prefers-reduced-motion by pausing on the poster frame instead of looping
 * (the file is already trimmed to a ~10s loop).
 *
 * While the intro preloader is up (html.preloading), the video holds on its
 * first frame and starts from the top as the overlay begins to fade, so the
 * reveal always shows the beginning of the loop.
 *
 * If the remote clip ever fails to load, we fall back to the poster as a plain
 * image so the hero is never a blank or broken box.
 */
export function HeroVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const root = document.documentElement;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    const apply = () => {
      if (query.matches || root.classList.contains("preloading")) {
        video.pause();
      } else {
        // play() rejects if the browser blocks autoplay; the poster stays up.
        video.play().catch(() => {});
      }
    };

    // The Preloader only mounts (and adds html.preloading) in a post-hydration
    // re-render, which can land after this effect — so watch the class in both
    // directions instead of sampling it once. Rewind on each transition: hold
    // frame one under the overlay, restart from it as the overlay fades.
    let wasPreloading = root.classList.contains("preloading");
    const observer = new MutationObserver(() => {
      const preloading = root.classList.contains("preloading");
      if (preloading === wasPreloading) return;
      wasPreloading = preloading;
      video.currentTime = 0;
      apply();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    if (wasPreloading) video.currentTime = 0;
    apply();
    query.addEventListener("change", apply);
    return () => {
      observer.disconnect();
      query.removeEventListener("change", apply);
    };
  }, []);

  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={POSTER} alt="" aria-hidden="true" className={className} />;
  }

  return (
    <video
      ref={ref}
      className={className}
      src="https://pub-364f647b29874b09922e1889f267c323.r2.dev/kmbbq-hero.mp4"
      poster={POSTER}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      onError={() => setFailed(true)}
    />
  );
}
