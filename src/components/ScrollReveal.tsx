"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type UseInViewOptions } from "framer-motion";
import { MOTION } from "@/lib/motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
  /** Duration of the reveal, in seconds. Defaults to the shared entrance. */
  duration?: number;
  /** rootMargin for the in-view check. Defaults to firing as the element's top
      clears the bottom fifth of the viewport, so fast scrollers still see it. */
  margin?: UseInViewOptions["margin"];
}

// The one reveal in the site. A fade + short rise built entirely on the shared
// MOTION constants (duration, rise, ease), so every entrance animates alike.
// Honors prefers-reduced-motion by rendering the content statically — no fade,
// no offset — which is what makes the reduced-motion site fully readable.
export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
  duration = MOTION.duration,
  margin = "0px 0px -20% 0px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin });
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  const offsets = {
    up: { y: MOTION.rise, x: 0 },
    down: { y: -MOTION.rise, x: 0 },
    left: { y: 0, x: MOTION.rise },
    right: { y: 0, x: -MOTION.rise },
    none: { y: 0, x: 0 },
  };
  const { x, y } = offsets[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, x }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y, x }}
      transition={{ duration, ease: MOTION.ease, delay }}
    >
      {children}
    </motion.div>
  );
}
