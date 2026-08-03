"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Logo } from "./Logo";
import { PillLink } from "./PillLink";
import { SocialLinks } from "./SocialLinks";
import { useActiveSection } from "@/lib/useActiveSection";
import { getLenis } from "@/lib/lenis";
import { PHONE, HOURS, DIRECTIONS_URL } from "@/data/info";

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
  //
  // Adjusted DURING RENDER rather than in an effect. `setMenuOpen(false)` in a
  // useEffect keyed on the pathname is the pattern React now flags
  // (react-hooks/set-state-in-effect): it commits the new route with the
  // overlay still open, then immediately re-renders to close it, so there is a
  // real frame where the old menu sits on top of the new page — and on the
  // server/client boundary that is a hydration mismatch waiting to happen.
  // Comparing the rendered path to the current one and resetting inline lets
  // React discard the in-progress render before it ever commits, which is the
  // documented replacement for this exact case.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setMenuOpen(false);
  }

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
    // Copied out of the ref so the cleanup below restores focus to the node
    // this effect actually opened with, not to whatever the ref points at by
    // the time the menu closes.
    const trigger = triggerRef.current;

    const focusables = () => {
      const nodes =
        overlayRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [];
      return trigger ? [trigger, ...Array.from(nodes)] : Array.from(nodes);
    };

    trigger?.focus();

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
      trigger?.focus();
    };
  }, [menuOpen, close]);

  // THE BAR IS ALWAYS ON A LIGHT GROUND NOW.
  //
  // This used to carry two full treatments: white links over the hero's video,
  // and ink links once the cream bar had faded in on scroll. The hero is cream
  // from the first pixel, so the white treatment had nothing left to sit on —
  // white links on cream are invisible, which is a hard failure at scroll 0
  // rather than a style regression.
  //
  // What survives is the SURFACE cross-fade: the bar itself is transparent over
  // the top of the hero and fades its cream panel in once you scroll, so the
  // mural band still reads edge to edge at rest. Only the type is unconditional.
  const barVisible = scrolled || !isHome;

  // EMBER-DEEP NEEDS THE CREAM PANEL UNDER IT. While the bar is transparent it
  // is the hero's backdrop the type sits on, and ember was a warm
  // mid-brown against footage that is full of warm mid-brown: measured 1.83:1
  // at its worst frame, against 6.1:1 for ink in the same place. So over the
  // video every link is ink, and the active one is identified by its pink
  // underline — which is the real active signal anyway. The moment the cream
  // panel fades in, ember has a surface to hold on and comes back.
  const linkColor = (isActive: boolean) => {
    if (!barVisible) return "text-sand";
    // ACTIVE IS NOT AN ACCENT COLOUR ANY MORE. It used to be ember type, but
    // the nav sits on the black structure and the accent measures 3.15:1 as
    // text on char — it cannot carry a label there. State is carried by weight
    // of colour (full sand vs 70%) and by the flame underline below, which is a
    // FILL and so has no such limit.
    return isActive ? "text-sand" : "text-sand/70 hover:text-sand";
  };

  return (
    <>
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
            className="fixed inset-0 z-overlay flex flex-col overflow-y-auto bg-char pb-8 pt-24 lg:hidden"
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
            <ul className="track flex flex-col" role="list">
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
                      className="group relative inline-flex min-h-12 items-center py-1.5 font-display text-xl font-normal leading-tight text-sand transition-colors duration-[var(--dur-base)] ease-house"
                    >
                      {link.label}
                      {/* Same job as the desktop underline — position, not
                          affordance — and it is literally a dot glyph, so it
                          is pink. */}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="ml-3 inline-block h-1.5 w-1.5 rounded-pill bg-flame align-middle"
                        />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            {/* 2 — the two things a phone visitor actually needs. */}
            <motion.div
              className="track mt-8 flex flex-col gap-3"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { delay: 0.06 + NAV_LINKS.length * 0.055, duration: 0.38, ease: "easeOut" }
              }
            >
              <PillLink href={PHONE.href} external className="w-full">
                Call {PHONE.display}
              </PillLink>
              <PillLink href={DIRECTIONS_URL} external tone="outline" className="w-full">
                Get directions
              </PillLink>
            </motion.div>

            {/* 3 — small footer strip: hours summary + the shared socials. */}
            <motion.div
              className="track mt-auto pt-10"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { delay: 0.2 + NAV_LINKS.length * 0.055, duration: 0.4 }
              }
            >
              <dl className="font-sans text-sm text-steel">
                {HOURS.map(({ short, time }) => (
                  <div key={short} className="flex justify-between border-t border-steel/25 py-2">
                    <dt>{short}</dt>
                    <dd className="font-medium text-sand">{time}</dd>
                  </div>
                ))}
              </dl>
              <SocialLinks tone="light" className="mt-5" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDERED AFTER THE OVERLAY, deliberately. Both sit on the overlay
          tier while the menu is open, so DOM order is what keeps the close
          control hit-testable — and it means the four-value z scale needs no
          fifth entry to express "above the takeover". Tab order is unaffected:
          the focus trap walks [trigger, ...overlay] explicitly. */}
      <header
        className={`fixed inset-x-0 top-0 ${menuOpen ? "z-overlay" : "z-nav"}`}
      >
        {/* ONE layer now. There used to be a dark scrim strip underneath this
            one, so that white nav type could hold over the bright top of the
            hero video; with a cream hero there is nothing to scrim and nothing
            white to protect, so it is gone.

            The cream panel still cross-fades on scroll rather than being
            painted from the start — at rest the bar is transparent and the
            mural band runs under it edge to edge. Opacity only, so the bar
            stays off the paint path. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 border-b border-steel/25 bg-char/90 shadow-card backdrop-blur-md transition-opacity duration-[var(--dur-slow)] ease-house ${
            barVisible && !menuOpen ? "opacity-100" : "opacity-0"
          } motion-reduce:transition-none`}
        />

        {/* THE BAR RUNS EDGE TO EDGE. `.track-edge` rather than `.track`: same
            outer margin token, same two breakpoints, but measured from the
            viewport instead of from the centred 1280 content track. So the mark
            sits at the left page margin and the links + call button group at the
            right one, at every width.

            `justify-between` is what does the grouping, and it needs no change
            for either state: at lg+ the row is [mark][links + CTA], below lg it
            is [mark][trigger]. Both end up hard left and hard right. */}
        <nav
          className="track-edge relative flex items-center justify-between py-4"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            aria-label="KM.BBQ, back to top"
            className="flex min-h-11 items-center transition-opacity duration-[var(--dur-base)] ease-house hover:opacity-80"
          >
            <Logo
              // One size now. The mark used to grow to 116 over the video and
              // shrink to 104 once the cream bar arrived; on a cream hero there
              // is no second state to distinguish.
              size={104}
              className="transition-all duration-[var(--dur-slow)] ease-house"
            />
          </Link>

          {/* Desktop links. Rhythm note: the bar has room to spare at 1280 (logo +
              links + pill measure ~780px inside an 1184px track), so the links
              get real air rather than the tight gap-9 they had. The pill takes
              an extra margin on top of the gap so the CTA reads as its own
              element instead of a sixth nav item. */}
          <ul className="hidden items-center gap-10 lg:flex xl:gap-12" role="list">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.id;
              return (
                <li key={link.label}>
                  <Link
                    href={hrefFor(link)}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative inline-block py-1 text-xs font-medium uppercase tracking-[0.16em] transition-colors duration-[var(--dur-base)] ease-house ${linkColor(
                      isActive
                    )}`}
                  >
                    {link.label}
                    {/* The one indicator, in two colours doing two jobs.
                        ACTIVE is pink: it reports identity and position, which
                        is the one nav element that is not an affordance, so it
                        is the correct exception. HOVER is ember, like every
                        other interaction on the site. The two never overlap —
                        the hover rule is only ever drawn on an inactive link,
                        so pink never becomes a hover state. */}
                    <span
                      className={`pointer-events-none absolute -bottom-0.5 left-0 h-px w-full origin-left transition-transform duration-[var(--dur-quick)] ease-house group-hover:scale-x-100 motion-reduce:transition-none ${
                        isActive ? "scale-x-100 bg-flame" : "scale-x-0 bg-steel"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}

            {/* CTA. The phone number rather than a "Find us" link: Contact is
                already in the bar above, so a second route link would be
                redundant, while calling is the one action the bar cannot
                otherwise offer.

                Ember border, ink label. It used to be an ember-DEEP outline
                with an ember label, which reads as gold/tan and matches
                nothing else on the page — and it is on every screen, so it did
                disproportionate damage. Ember is the interaction colour, so the
                border is ember; the label is ink because ember on cream is
                2.3:1 and this is an 11.5px letter-spaced cap. Ink on cream is
                15.9:1 at rest and ink on ember is 7:1 filled. */}
            <li className="ms-3 xl:ms-5">
              <PillLink href={PHONE.href} external className="px-5 py-2">
                {PHONE.display}
              </PillLink>
            </li>
          </ul>

          {/* Mobile trigger. 48px target, and it stays in place when the
              overlay opens so the X replaces it exactly. */}
          <button
            ref={triggerRef}
            type="button"
            className="relative -mr-2 flex h-12 w-12 items-center justify-center lg:hidden"
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
                  className={`absolute left-0 h-0.5 w-6 rounded-pill transition-all duration-[var(--dur-base)] ease-house motion-reduce:transition-none ${
                    bar.top
                  } ${menuOpen ? `bg-sand ${bar.open}` : "bg-sand"}`}
                />
              ))}
            </span>
          </button>
        </nav>
      </header>
    </>
  );
}
