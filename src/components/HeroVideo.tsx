"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's grill clip. Autoplays muted like the old full-bleed hero, but
 * honors prefers-reduced-motion by pausing on the poster frame instead of
 * looping (the file is already trimmed to a 10s loop).
 *
 * While the intro preloader is up (html.preloading), the video holds on its
 * first frame and starts from the top as the overlay begins to fade, so the
 * reveal always shows the beginning of the loop.
 */
export function HeroVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

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

  return (
    <video
      ref={ref}
      className={className}
      src="/videos/hero-video3.mp4"
      poster="/images/hero-poster3.jpg"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}
