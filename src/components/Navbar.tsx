"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import { useActiveSection } from "@/lib/useActiveSection";

// `hash` links point at sections on the home page; `route` links point at a
// dedicated route. From the home page a section link is a same-page hash; from
// any other route it is prefixed with "/" so it returns home and then scrolls.
const NAV_LINKS = [
  { label: "Home", id: "home", hash: "#home" },
  { label: "Menu", id: "menu", route: "/menu" },
  { label: "About", id: "about", hash: "#about" },
  { label: "Gallery", id: "gallery", hash: "#gallery" },
  { label: "Contact", id: "contact", hash: "#contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  // Track which section is in view so the matching link stays underlined. Only
  // relevant on the home page, where the sections live — and only for hash
  // links (MENU is a route, so no homepage section may activate it). Shared
  // observer logic with the menu jump nav via useActiveSection.
  const [active] = useActiveSection(
    NAV_LINKS.filter((link) => link.hash).map((link) => link.id),
    {
      enabled: isHome,
      initial: isHome ? "home" : "menu",
      rootMargin: "-45% 0px -45% 0px",
    }
  );

  const hrefFor = (link: (typeof NAV_LINKS)[number]) =>
    link.route ?? (isHome ? link.hash! : `/${link.hash}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  // On routes other than the home page there is no dark hero behind the bar,
  // so it always reads as the solid light treatment (legible over the cream
  // page) rather than the transparent-over-video state.
  const solid = scrolled || !isHome;
  const onLight = solid || menuOpen;

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-cream/90 backdrop-blur-md border-b border-black/[0.06] shadow-[0_1px_24px_-12px_rgba(26,26,26,0.35)]"
          : "bg-transparent"
      }`}
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-7 py-5 lg:px-12"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="KM.BBQ — go to top"
          className="flex items-center transition-opacity duration-300 hover:opacity-80"
        >
          <Logo
            size={solid ? 108 : 120}
            className="transition-all duration-500 ease-out"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-10 lg:flex" role="list">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.label}>
                <Link
                  href={hrefFor(link)}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative inline-block py-1 text-[11.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${
                    onLight
                      ? isActive
                        ? "text-ember-deep"
                        : "text-foreground"
                      : isActive
                        ? "text-white"
                        : "text-white/80"
                  }`}
                >
                  {link.label}
                  {/* Underline grows in from the left on hover / when active.
                      Ember is the one accent, on both the transparent-over-hero
                      and solid-cream states. */}
                  <span
                    className={`pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ember transition-transform duration-[250ms] ease-out group-hover:scale-x-100 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
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
            className={`block h-0.5 w-6 rounded-full ${onLight ? "bg-foreground" : "bg-white"}`}
            animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
          />
          <motion.span
            className={`block h-0.5 w-4 rounded-full ${onLight ? "bg-foreground" : "bg-white"}`}
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
          />
          <motion.span
            className={`block h-0.5 w-6 rounded-full ${onLight ? "bg-foreground" : "bg-white"}`}
            animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
          />
        </button>
      </nav>
    </header>

    {/* Mobile menu — rendered as a sibling of <header>, NOT a child. The header
        carries `backdrop-blur-md` when solid, and an ancestor's backdrop-filter
        makes `position: fixed` descendants resolve against that ancestor instead
        of the viewport — which collapsed this overlay to the header's height and
        let the page (e.g. gallery photos) show through below it. As a sibling it
        fills the viewport. It sits at z-40, just under the header (z-50), so the
        close button stays visible and tappable on top. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-cream px-9 pt-28 lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <ul className="flex flex-col gap-9" role="list">
              {NAV_LINKS.map((link, i) => {
                const isActive = active === link.id;
                return (
                  <motion.li
                    key={link.label}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { delay: 0.08 + i * 0.06, duration: 0.4, ease: "easeOut" }
                    }
                  >
                    <Link
                      href={hrefFor(link)}
                      onClick={() => setMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative inline-block text-sm font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                        isActive ? "text-ember-deep" : "text-foreground"
                      }`}
                    >
                      {link.label}
                      <span
                        className={`pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left bg-ember transition-transform duration-[250ms] ease-out group-hover:scale-x-100 ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
