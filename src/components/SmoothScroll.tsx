"use client";

import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setLenis } from "@/lib/lenis";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Under reduced motion, leave native scrolling untouched — no smooth-scroll
    // hijack. The pinned sections already gate themselves off, so this is safe.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    setLenis(lenis);

    // Keep ScrollTrigger in sync with Lenis so scrub-driven timelines
    // track the smoothed scroll position instead of native scroll.
    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => {
      // gsap ticker time is in seconds; Lenis expects milliseconds.
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
