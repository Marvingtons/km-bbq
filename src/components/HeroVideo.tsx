"use client";

import { useEffect, useRef } from "react";

/**
 * The hero's grill clip. Autoplays muted like the old full-bleed hero, but
 * honors prefers-reduced-motion by pausing on the poster frame instead of
 * looping (the file is already trimmed to a 5s loop).
 */
export function HeroVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      if (query.matches) {
        video.pause();
      } else {
        // play() rejects if the browser blocks autoplay; the poster stays up.
        video.play().catch(() => {});
      }
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src="/videos/hero-grill.mp4"
      poster="/images/hero-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  );
}
