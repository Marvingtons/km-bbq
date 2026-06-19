"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Catering", href: "#catering" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-brand-cream/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a href="#home" aria-label="KM.BBQ — go to top">
          <Logo
            size={scrolled ? 120 : 140}
            className="transition-all duration-300"
          />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 lg:flex" role="list">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-brand-orange ${
                  scrolled ? "text-foreground" : "text-white/90"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-4">
          <a
            href="#contact"
            className="hidden rounded-full bg-brand-orange px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85 lg:inline-flex"
          >
            Order Now
          </a>

          {/* Hamburger */}
          <button
            className="flex flex-col items-end gap-1.5 p-1 lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <motion.span
              className="block h-0.5 bg-current w-6"
              animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              style={{ color: scrolled || menuOpen ? "#1a1a1a" : "white" }}
            />
            <motion.span
              className="block h-0.5 bg-current w-4"
              animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
              style={{ color: scrolled || menuOpen ? "#1a1a1a" : "white" }}
            />
            <motion.span
              className="block h-0.5 bg-current w-6"
              animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              style={{ color: scrolled || menuOpen ? "#1a1a1a" : "white" }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col bg-brand-cream pt-24 px-8 lg:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ul className="flex flex-col gap-6" role="list">
              {NAV_LINKS.map(({ label, href }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="font-serif text-3xl font-light text-foreground transition-colors hover:text-brand-orange"
                  >
                    {label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-brand-orange py-3 text-sm font-medium text-white"
            >
              Order Now
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
