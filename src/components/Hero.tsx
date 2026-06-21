"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/videos/hero-grill.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70"
        aria-hidden="true"
      />

      {/* A slim bottom edge softens the video into the page; the bulk of the
          dissolve now lives on the mural below (see About). */}
      <div
        className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white"
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
          className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          All-you-can-eat, self-serve Korean BBQ grilled over live charcoal —
          pick what you want, grill it your way, and eat all you like.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
        >
          <a
            href="#menu"
            className="rounded-full border border-white/40 px-8 py-3 text-sm font-medium tracking-wide text-white backdrop-blur-sm transition-all hover:bg-white hover:text-foreground"
          >
            View Menu
          </a>
          <a
            href="#contact"
            className="rounded-full bg-brand-orange px-8 py-3 text-sm font-medium tracking-wide text-white transition-opacity hover:opacity-85"
          >
            Order Now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
