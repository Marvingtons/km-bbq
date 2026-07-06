"use client";

import { motion } from "framer-motion";
import { HeroVideo } from "./HeroVideo";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background video — holds its first frame while the preloader is up
          and starts the loop from the top as the overlay fades. The poster
          paints the first frame immediately while the clip streams in. */}
      <HeroVideo className="absolute inset-0 h-full w-full object-cover" />

      {/* Dark gradient overlay — the mid-band is the scrim under the subtext,
          so keep it strong enough for AA contrast over bright grill footage. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/55 to-black/70"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
        <motion.p
          className="mb-4 font-sans text-sm font-medium tracking-[0.35em] uppercase text-brand-orange"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          All-You-Can-Eat Korean BBQ
        </motion.p>

        <motion.h1
          className="font-serif text-5xl font-light leading-tight tracking-tight sm:text-6xl md:text-7xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          {/* TODO: Replace headline */}
          Fire, Flavor,{" "}
          <em className="italic text-brand-orange">Tradition.</em>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-white/90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          All-you-can-eat, self-serve Korean BBQ grilled over live charcoal —
          pick what you want, grill it your way, and eat all you like.
        </motion.p>

        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
        >
          <motion.a
            href="/menu"
            className="group relative inline-flex flex-col items-center gap-3 font-sans text-[0.7rem] font-light tracking-[0.45em] uppercase text-white/90 transition-colors duration-700 hover:text-brand-orange"
            whileTap={{ scale: 0.99 }}
          >
            {/* Hairline above — a quiet frame, the way fine menus are set */}
            <span
              aria-hidden="true"
              className="block h-px w-10 bg-white/40 transition-all duration-700 ease-out group-hover:w-16 group-hover:bg-brand-orange"
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
              className="block h-px w-10 bg-white/40 transition-all duration-700 ease-out group-hover:w-16 group-hover:bg-brand-orange"
            />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
