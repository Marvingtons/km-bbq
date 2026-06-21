"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

export function Catering() {
  const sectionRef = useRef<HTMLElement>(null);

  // Ignition is driven by how far the section has scrolled through the viewport.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  // 0 = cold/unlit, 1 = fully ignited.
  const ignite = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Border heats from cool white to a fiery orange.
  const borderColor = useTransform(
    ignite,
    [0, 0.4, 1],
    ["rgba(255,255,255,0.1)", "rgba(255,140,0,0.6)", "rgba(255,61,0,0.95)"]
  );

  // A fire-colored radial fill blooms inside each circle.
  const fireBackground = useTransform(
    ignite,
    [0, 0.5, 1],
    [
      "radial-gradient(circle at 50% 65%, rgba(255,208,0,0) 0%, rgba(255,61,0,0) 60%, rgba(255,61,0,0) 100%)",
      "radial-gradient(circle at 50% 65%, rgba(255,208,0,0.35) 0%, rgba(255,140,0,0.25) 45%, rgba(255,61,0,0) 75%)",
      "radial-gradient(circle at 50% 65%, rgba(255,230,120,0.85) 0%, rgba(255,140,0,0.6) 40%, rgba(255,61,0,0.2) 80%)",
    ]
  );

  // Outer glow that grows as the circles catch fire.
  const fireGlow = useTransform(
    ignite,
    [0, 0.4, 1],
    [
      "0 0 0px 0px rgba(255,61,0,0)",
      "0 0 40px 4px rgba(255,140,0,0.25)",
      "0 0 90px 12px rgba(255,80,0,0.55)",
    ]
  );

  const fireOpacity = useTransform(ignite, [0, 0.3, 1], [0, 0.4, 1]);

  return (
    <section
      ref={sectionRef}
      id="catering"
      className="relative overflow-hidden bg-brand-blue py-28 px-6"
      aria-labelledby="catering-heading"
    >
      {/* Decorative circles that ignite with fire as you scroll */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96"
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: fireBackground, opacity: fireOpacity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border"
          style={{ borderColor, boxShadow: fireGlow }}
        />
      </div>
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64"
        aria-hidden="true"
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: fireBackground, opacity: fireOpacity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border"
          style={{ borderColor, boxShadow: fireGlow }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl text-center text-white">
        <ScrollReveal>
          <p className="mb-4 font-sans text-xs font-medium tracking-[0.3em] uppercase text-brand-orange">
            Catering &amp; Events
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2
            id="catering-heading"
            className="font-serif text-5xl font-light leading-snug md:text-6xl"
          >
            {/* TODO: heading copy */}
            Bring the Grill{" "}
            <em className="italic text-brand-pink">to Your Event</em>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-white/70">
            {/* TODO: catering description copy */}
            From intimate dinners to large-scale corporate events, we bring
            live-fire Korean BBQ anywhere. Custom menus, full service, and an
            experience your guests will talk about long after the last ember
            cools.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <ul className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8 font-sans text-sm text-white/60">
            {/* TODO: Replace with actual service highlights */}
            {[
              "Private Dining",
              "Corporate Events",
              "Weddings",
              "Pop-Ups",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-brand-orange" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#contact"
              className="rounded-full bg-brand-orange px-8 py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-85"
            >
              Inquire About Catering
            </a>
            <a
              href="#"
              className="rounded-full border border-white/30 px-8 py-3 font-sans text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {/* TODO: link to catering PDF or page */}
              Download Our Package
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
