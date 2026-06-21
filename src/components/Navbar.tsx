"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Home", href: "#home", id: "home" },
  { label: "Menu", href: "#menu", id: "menu" },
  { label: "About", href: "#about", id: "about" },
  { label: "Gallery", href: "#gallery", id: "gallery" },
  { label: "Contact", href: "#contact", id: "contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section is in view so the matching link stays underlined.
  useEffect(() => {
    const sections = NAV_LINKS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A band around the vertical centre keeps the active link in sync with
      // the section the viewer is actually reading.
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll while the mobile menu is open, and close on Escape.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    if (menuOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const onLight = scrolled || menuOpen;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-brand-cream/90 backdrop-blur-md border-b border-black/[0.06] shadow-[0_1px_24px_-12px_rgba(26,26,26,0.35)]"
          : "bg-transparent"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-7 py-5 lg:px-12"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="#home"
          aria-label="KM.BBQ — go to top"
          className="flex items-center transition-opacity duration-300 hover:opacity-80"
        >
          <Logo
            size={scrolled ? 108 : 120}
            className="transition-all duration-500 ease-out"
          />
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-10 lg:flex" role="list">
          {NAV_LINKS.map(({ label, href, id }) => {
            const isActive = active === id;
            return (
              <li key={label}>
                <a
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className="group relative inline-block py-1 text-[11.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-300"
                  style={{
                    color: onLight
                      ? isActive
                        ? "#1A36AF"
                        : "#2a2a2a"
                      : isActive
                        ? "#ffffff"
                        : "rgba(255,255,255,0.82)",
                  }}
                >
                  {label}
                  {/* Underline grows in from the left on hover / when active. */}
                  <span
                    className={`pointer-events-none absolute -bottom-0.5 left-0 h-px origin-left transition-transform duration-[250ms] ease-out group-hover:scale-x-100 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                    style={{
                      width: "100%",
                      backgroundColor: onLight ? "#1A36AF" : "#F18B23",
                    }}
                  />
                </a>
              </li>
            );
          })}
        </ul>

        {/* Hamburger */}
        <button
          className="flex flex-col items-end gap-1.5 p-1 lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <motion.span
            className="block h-0.5 w-6 rounded-full"
            animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            style={{ backgroundColor: onLight ? "#1a1a1a" : "#ffffff" }}
          />
          <motion.span
            className="block h-0.5 w-4 rounded-full"
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            style={{ backgroundColor: onLight ? "#1a1a1a" : "#ffffff" }}
          />
          <motion.span
            className="block h-0.5 w-6 rounded-full"
            animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            style={{ backgroundColor: onLight ? "#1a1a1a" : "#ffffff" }}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-brand-cream px-9 pt-28 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <ul className="flex flex-col gap-9" role="list">
              {NAV_LINKS.map(({ label, href, id }, i) => {
                const isActive = active === id;
                return (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.4, ease: "easeOut" }}
                  >
                    <a
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className="group relative inline-block text-sm font-medium uppercase tracking-[0.18em] transition-colors duration-300"
                      style={{ color: isActive ? "#1A36AF" : "#2a2a2a" }}
                    >
                      {label}
                      <span
                        className={`pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left bg-brand-blue transition-transform duration-[250ms] ease-out group-hover:scale-x-100 ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </a>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
