"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { useActiveSection } from "@/lib/useActiveSection";
import { getLenis } from "@/lib/lenis";
import { PHONE, HOURS, DIRECTIONS_URL } from "@/lib/restaurant";

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

// Everything focusable inside the overlay, in DOM order — the focus trap walks
// this list rather than a hand-maintained set of refs.
const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  const close = useCallback(() => setMenuOpen(false), []);

  // Close on route change, so tapping a link navigates and leaves the overlay.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Overlay behaviour while open: lock scroll, trap focus, Escape closes, and
  // focus returns to the trigger on close.
  useEffect(() => {
    if (!menuOpen) return;

    // Lenis animates window scroll every frame, so overflow:hidden alone does
    // not hold it — it has to be stopped explicitly. Under reduced motion
    // there is no Lenis instance, and the overflow lock is what does the work.
    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // The close control IS the trigger (the X replaces the hamburger in place),
    // and it lives in the header rather than the overlay — so the trap has to
    // span both, with the trigger first. Focus lands on it when the menu opens,
    // which is also where a keyboard user most wants to be.
    const focusables = () => {
      const nodes =
        overlayRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [];
      const trigger = triggerRef.current;
      return trigger ? [trigger, ...Array.from(nodes)] : Array.from(nodes);
    };

    triggerRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const firstEl = list[0];
      const lastEl = list[list.length - 1];
      // Wrap at both ends so Tab can never reach the page behind the overlay.
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      triggerRef.current?.focus();
    };
  }, [menuOpen, close]);

  // On routes other than the home page there is no video behind the bar, so it
  // always reads as the solid cream treatment rather than transparent-over-hero.
  const solid = scrolled || !isHome;
  // While the overlay is up it supplies the cream field itself, so the bar
  // drops both of its own layers — but the logo and trigger still need the
  // dark-on-cream treatment.
  const onLight = solid || menuOpen;

  // Link colour by state. Over the hero the links are white on video; once the
  // cream bar has faded in they are foreground on cream.
  const linkColor = (isActive: boolean) =>
    solid
      ? isActive
        ? "text-ember-deep"
        : "text-foreground hover:text-ember-deep"
      : isActive
        ? "text-white"
        : "text-white/85 hover:text-white";

  return (
    <>
      {/* The overlay is a sibling of <header>, so it would paint over the logo
          and trigger no matter what z-index those children carry — the header
          raises above it while the menu is open instead. */}
      <header
        className={`fixed inset-x-0 top-0 ${menuOpen ? "z-[60]" : "z-50"}`}
      >
        {/* Two stacked layers, cross-faded by opacity rather than animating
            background-color: only opacity and transform are animated, which
            keeps the bar off the paint path while the hero video plays.

            Layer 1 — scrim strip. The new hero video is bright and warm, so
            white links and the logo need a little help at the top of frame.
            This is a short gradient confined to the nav zone, not a wash over
            the whole video. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-transparent transition-opacity duration-500 ${
            onLight ? "opacity-0" : "opacity-100"
          } motion-reduce:transition-none`}
        />
        {/* Layer 2 — the solid cream bar. Hidden while the overlay is open,
            since the overlay is already a full cream field. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 border-b border-black/[0.06] bg-cream/90 shadow-warm backdrop-blur-md transition-opacity duration-500 ${
            solid && !menuOpen ? "opacity-100" : "opacity-0"
          } motion-reduce:transition-none`}
        />

        <nav
          className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            aria-label="KM.BBQ, back to top"
            className="flex items-center transition-opacity duration-300 hover:opacity-80"
          >
            <Logo
              size={onLight ? 104 : 116}
              className="transition-all duration-500 ease-out"
            />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-9 lg:flex" role="list">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.id;
              return (
                <li key={link.label}>
                  <Link
                    href={hrefFor(link)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative inline-block py-1 text-[11.5px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 ${linkColor(
                      isActive
                    )}`}
                  >
                    {link.label}
                    {/* The one active/hover indicator: an ember hairline that
                        grows from the left. Same treatment in both scroll
                        states and in the mobile overlay. */}
                    <span
                      className={`pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ember transition-transform duration-[250ms] ease-out group-hover:scale-x-100 motion-reduce:transition-none ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}

            {/* CTA. The phone number rather than a "Find us" link: Contact is
                already in the bar above, so a second route link would be
                redundant, while calling is the one action the bar cannot
                otherwise offer. Outline pill in both states, ember on cream and
                white over the video. */}
            <li>
              <a
                href={PHONE.href}
                className={`inline-flex min-h-11 items-center rounded-full border px-5 py-2 text-[11.5px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                  solid
                    ? "border-ember-deep text-ember-deep hover:bg-ember-deep hover:text-white"
                    : "border-white/70 text-white hover:bg-white hover:text-foreground"
                }`}
              >
                {PHONE.display}
              </a>
            </li>
          </ul>

          {/* Mobile trigger. 48px target, and it stays in place when the
              overlay opens so the X replaces it exactly. */}
          <button
            ref={triggerRef}
            type="button"
            className="relative z-[60] -mr-2 flex h-12 w-12 items-center justify-center lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className="relative block h-4 w-6" aria-hidden="true">
              {[
                { top: "top-0", open: "translate-y-[7px] rotate-45" },
                { top: "top-[7px]", open: "opacity-0" },
                { top: "top-[14px]", open: "-translate-y-[7px] -rotate-45" },
              ].map((bar, i) => (
                <span
                  key={i}
                  className={`absolute left-0 h-0.5 w-6 rounded-full transition-all duration-300 ease-out motion-reduce:transition-none ${
                    bar.top
                  } ${menuOpen ? `bg-foreground ${bar.open}` : onLight ? "bg-foreground" : "bg-white"}`}
                />
              ))}
            </span>
          </button>
        </nav>
      </header>

      {/* Full-screen mobile takeover. Rendered as a sibling of <header>, NOT a
          child: the header carries backdrop-blur when solid, and an ancestor's
          backdrop-filter makes `position: fixed` descendants resolve against
          that ancestor instead of the viewport — which collapsed this overlay
          to the header's height. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            ref={overlayRef}
            className="fixed inset-0 z-[55] flex flex-col overflow-y-auto bg-cream px-6 pb-8 pt-24 lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.28, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            {/* 1 — the links, as large display type. This is where the serif
                gets to be big. */}
            <ul className="flex flex-col" role="list">
              {NAV_LINKS.map((link, i) => {
                const isActive = active === link.id;
                return (
                  <motion.li
                    key={link.label}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { delay: 0.06 + i * 0.055, duration: 0.38, ease: "easeOut" }
                    }
                  >
                    <Link
                      href={hrefFor(link)}
                      onClick={close}
                      aria-current={isActive ? "page" : undefined}
                      className="group relative inline-flex min-h-12 items-center py-1.5 font-serif text-[2.5rem] font-light leading-tight text-foreground transition-colors duration-300 sm:text-5xl"
                    >
                      {link.label}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="ml-3 inline-block h-1.5 w-1.5 rounded-full bg-ember align-middle"
                        />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            {/* 2 — the two things a phone visitor actually needs. */}
            <motion.div
              className="mt-8 flex flex-col gap-3"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { delay: 0.06 + NAV_LINKS.length * 0.055, duration: 0.38, ease: "easeOut" }
              }
            >
              <a
                href={PHONE.href}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-ember-deep px-6 py-3 font-sans text-sm font-semibold text-white transition-colors duration-300 hover:bg-foreground"
              >
                Call {PHONE.display}
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-ember-deep px-6 py-3 font-sans text-sm font-semibold text-ember-deep transition-colors duration-300 hover:bg-ember-deep hover:text-white"
              >
                Get directions
              </a>
            </motion.div>

            {/* 3 — small footer strip: hours summary + the shared socials. */}
            <motion.div
              className="mt-auto pt-10"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { delay: 0.2 + NAV_LINKS.length * 0.055, duration: 0.4 }
              }
            >
              <dl className="font-sans text-sm text-body">
                {HOURS.map(({ short, time }) => (
                  <div key={short} className="flex justify-between border-t border-paper-line py-2">
                    <dt>{short}</dt>
                    <dd className="font-medium text-foreground">{time}</dd>
                  </div>
                ))}
              </dl>
              <SocialLinks tone="light" className="mt-5" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
