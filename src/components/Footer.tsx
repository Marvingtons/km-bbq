import { SocialChips } from "./SocialLinks";

// Absolute hrefs so the footer works from any route — section links return to
// the home page (and scroll to the section), and "Menu" goes to the full menu
// page. From the home page the section hrefs simply update the hash and scroll.
const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

// Clean inline phone glyph (Feather-style) — replaces the old ☎ emoji so the
// icon matches the SVG social set and inherits currentColor.
const PhoneIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative -mt-6 overflow-hidden bg-charcoal px-6 pt-16 pb-10 text-white/60"
      role="contentinfo"
    >
      {/* Deliberate seam: a single crisp ember hairline marks the cream→charcoal
          transition, with a slow ember glint that shimmers along it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
      >
        <div className="h-full w-full bg-gradient-to-r from-transparent via-ember/55 to-transparent" />
        <div className="footer-shimmer absolute inset-y-0 left-0 w-[32%] bg-gradient-to-r from-transparent via-ember to-transparent" />
      </div>

      {/* Ambient warm glow — centered behind the content as intentional cozy
          depth, well clear of the top edge so it never reads as a seam bleed. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/8 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            {/* Warm sans wordmark — bold and confident to match the casual BBQ
                direction; the ember period stays as the single accent. */}
            <p className="font-sans text-3xl font-extrabold tracking-tight text-white">
              KM<span className="text-ember">.</span>BBQ
            </p>
            <p className="mt-4 max-w-xs font-sans text-sm font-light leading-relaxed text-white/55">
              All-you-can-eat charcoal BBQ in Oceanside, CA
            </p>
            <a
              href="tel:+17604331888"
              className="group mt-5 inline-flex items-center gap-2.5 font-sans text-xl font-semibold text-white/90 transition-colors hover:text-ember"
            >
              <span
                aria-hidden="true"
                className="text-ember transition-transform duration-300 group-hover:scale-110"
              >
                <PhoneIcon />
              </span>
              (760) 433-1888
            </a>
          </div>

          {/* Navigation — one clean column (the old 2-column grid left an
              orphaned last row). */}
          <nav aria-label="Footer navigation" className="md:col-span-4">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Explore
            </h2>
            <ul className="mt-5 flex flex-col gap-3" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group inline-flex items-center font-sans text-sm text-white/70 transition-colors hover:text-ember"
                  >
                    <span
                      aria-hidden="true"
                      className="mr-0 h-px w-0 bg-ember transition-all duration-300 group-hover:mr-2 group-hover:w-4"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Follow Us
            </h2>
            <SocialChips tone="dark" className="mt-5" />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row">
          <p className="font-sans text-xs text-white/65">
            &copy; {year} KM.BBQ. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-sans text-xs text-white/65">
            <a href="/privacy" className="transition-colors hover:text-ember">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-ember">
              Terms of Service
            </a>
            <span aria-hidden="true" className="text-white/20">|</span>
            <a
              href="https://norvix.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ember"
            >
              Site by Norvix
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
