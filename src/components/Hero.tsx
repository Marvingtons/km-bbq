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
      {/* Background video — a slow charcoal-ember loop. Holds its first frame
          while the preloader is up and starts from the top as the overlay
          fades; the poster paints that frame immediately while the clip
          streams in. object-[center_58%] keeps the glowing coals — the
          intended subject — settled in frame rather than clipped. */}
      <HeroVideo className="absolute inset-0 h-full w-full object-cover object-[center_58%]" />

      {/* Scrim, layer 1 — vertical gradient. Dark at the top for the fixed
          navbar, a touch lighter where the coals glow through the middle,
          dark again at the base for the scroll cue and text contrast. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-charcoal/85 via-charcoal/45 to-charcoal/90"
        aria-hidden="true"
      />

      {/* Scrim, layer 2 — a soft dark pool behind the headline block plus a
          cinematic vignette on the edges. Both are built from the charcoal
          token so the mood stays on-palette; the pool is what carries the
          AA text contrast over the brightest part of the ember footage. */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(105% 75% at 50% 46%, rgba(26,21,18,0.62) 0%, rgba(26,21,18,0.30) 52%, rgba(26,21,18,0) 82%), " +
            "radial-gradient(135% 125% at 50% 50%, rgba(26,21,18,0) 55%, rgba(26,21,18,0.78) 100%)",
        }}
      />

      {/* Film grain — a static, self-contained noise tile at low opacity for
          depth and to break up gradient banding. mix-blend-soft-light keeps it
          from muddying the blacks. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-soft-light"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "170px 170px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white">
        <motion.p
          className="mb-4 font-sans text-sm font-medium tracking-[0.35em] uppercase text-ember"
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
          All you can{" "}
          <em className="italic text-ember">grill.</em>
        </motion.h1>

        <motion.p
          className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-white/90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          Self-serve Korean BBQ over live charcoal. Pick your cuts, cook them
          right at your table, and eat all you want.
        </motion.p>

        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
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
