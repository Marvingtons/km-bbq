"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HeroVideo } from "./HeroVideo";

export function Hero() {
  // Gate the mount fade-ups: under reduced motion each element renders at its
  // final state (initial=false) instead of sliding in.
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-charcoal"
      aria-label="Hero"
    >
      {/* Background video — holds its first frame while the preloader is up
          and starts the loop from the top as the overlay fades. The poster
          paints the first frame immediately while the clip streams in; the
          section's charcoal base covers any moment before the poster paints so
          there's never a cream flash. */}
      <HeroVideo className="absolute inset-0 h-full w-full object-cover" />

      {/* Legibility scrim, tuned to the new (warm, bright) R2 clip. The text
          band spikes near-white on the hero-moment frames, so a warm-dark
          radial sits behind the centered copy (enough for AA on the white
          headline + subtext) while a light floor knocks down the peaks — both
          fade out toward the edges so the warm grill footage still reads. */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 72% 56% at 50% 50%, rgba(20,14,10,0.58) 0%, rgba(20,14,10,0.34) 47%, rgba(20,14,10,0.06) 80%, transparent 100%), linear-gradient(rgba(20,14,10,0.4) 0%, rgba(20,14,10,0.14) 17%, rgba(20,14,10,0.12) 66%, rgba(20,14,10,0.34) 100%)",
        }}
      />

      {/* Content */}
      {/* TODO(step6): the dark hero is held out of scope. When it's addressed,
          conform its deviations to the unified system: the eyebrow (text-sm /
          0.35em vs the site's text-xs / 0.3em ember-deep), the hairline "View
          Menu" CTA (either adopt the ember pill or sanction it as the one
          exception), and its 700ms hover timings (the site standard is 300ms). */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
        <motion.p
          className="mb-4 font-sans text-sm font-medium tracking-[0.35em] uppercase text-ember"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          All-You-Can-Eat Korean BBQ
        </motion.p>

        <motion.h1
          className="font-serif text-5xl font-light leading-tight tracking-tight sm:text-6xl md:text-7xl"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          {/* TODO(step6): Replace headline */}
          Fire, Flavor,{" "}
          <em className="italic text-ember">Tradition.</em>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-white/90"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          All-you-can-eat, self-serve Korean BBQ grilled over live charcoal —
          pick what you want, grill it your way, and eat all you like.
        </motion.p>

        <motion.div
          className="mt-10 flex justify-center"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
        >
          <motion.a
            href="/menu"
            className="group relative inline-flex flex-col items-center gap-3 font-sans text-[0.7rem] font-light tracking-[0.45em] uppercase text-white/90 transition-colors duration-700 hover:text-ember"
            whileTap={{ scale: 0.99 }}
          >
            {/* Hairline above — a quiet frame, the way fine menus are set */}
            <span
              aria-hidden="true"
              className="block h-px w-10 bg-white/40 transition-all duration-700 ease-out group-hover:w-16 group-hover:bg-ember"
            />

            <span className="relative inline-flex items-center gap-3 pl-[0.45em]">
              View Menu
              {/* A slender arrow that drifts forward on hover */}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3 w-3 translate-x-0 transition-transform duration-700 ease-out group-hover:translate-x-1.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12h16M14 6l6 6-6 6" />
              </svg>
            </span>

            {/* Hairline below — extends outward on hover */}
            <span
              aria-hidden="true"
              className="block h-px w-10 bg-white/40 transition-all duration-700 ease-out group-hover:w-16 group-hover:bg-ember"
            />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
