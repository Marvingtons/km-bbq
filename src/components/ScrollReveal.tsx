"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type UseInViewOptions,
} from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
  /** Duration of the reveal, in seconds. */
  duration?: number;
  /** rootMargin for the in-view check — e.g. "0px 0px -15% 0px" fires the
      reveal as soon as the element's top clears the bottom 15% of the
      viewport, so fast scrollers still see the content animate in. */
  margin?: UseInViewOptions["margin"];
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
  duration = 0.7,
  margin = "-60px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin });
  // framer-motion does not consult prefers-reduced-motion on its own. Without
  // this, every reveal still slid and faded for users who asked for no motion —
  // out of step with About/Gallery, whose GSAP work is gated on a matchMedia.
  const reduce = useReducedMotion();

  const offsets = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
    none: { y: 0, x: 0 },
  };

  // Reduced motion: no travel, no fade-in delay — the content is simply there.
  const { x, y } = reduce ? { x: 0, y: 0 } : offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y, x }}
      animate={
        reduce
          ? { opacity: 1, y: 0, x: 0 }
          : inView
            ? { opacity: 1, y: 0, x: 0 }
            : { opacity: 0, y, x }
      }
      transition={
        reduce
          ? { duration: 0 }
          : { duration, ease: [0.25, 0.46, 0.45, 0.94], delay }
      }
    >
      {children}
    </motion.div>
  );
}
