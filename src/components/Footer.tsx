import Image from "next/image";
import { SocialLinks } from "./SocialLinks";
import { PHONE, ADDRESS, HOURS, DIRECTIONS_URL } from "@/lib/restaurant";

// Absolute hrefs so the footer works from any route: section links return to the
// home page (and scroll to the section), and "Menu" goes to the full menu page.
const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

const label = "font-sans text-xs font-medium uppercase tracking-[0.3em] text-white/60";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden bg-charcoal px-6 py-20 text-white/70"
      role="contentinfo"
    >
      {/* Top accent line: the one designed seam (Contact -> Footer). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent"
      />
      {/* Ambient warm glow for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-4">
            <Image
              src="/logos/km-bbq-logo.svg"
              alt="KM.BBQ logo"
              width={150}
              height={36}
              className="opacity-90"
            />
            <p className="mt-5 max-w-xs font-sans text-sm font-light leading-relaxed text-white/60">
              All-you-can-eat Korean BBQ, grilled over live charcoal in
              Oceanside, California.
            </p>
            <SocialLinks tone="dark" className="mt-6" />
          </div>

          {/* Visit — NAP block + actions */}
          <div className="md:col-span-3">
            <h2 className={label}>Visit</h2>
            <address className="mt-5 not-italic font-sans text-sm font-light leading-relaxed text-white/70">
              KM.BBQ
              <br />
              {ADDRESS.street}
              <br />
              {ADDRESS.region}
            </address>
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={PHONE.href}
                className="group inline-flex items-center gap-2 font-sans text-base font-semibold text-white/90 transition-colors hover:text-ember"
              >
                <span
                  aria-hidden="true"
                  className="text-ember transition-transform duration-300 group-hover:scale-110"
                >
                  ☎
                </span>
                {PHONE.display}
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex w-fit items-center gap-1.5 font-sans text-sm font-medium text-ember transition-colors hover:text-white"
              >
                Get directions
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="md:col-span-3">
            <h2 className={label}>Hours</h2>
            <dl className="mt-5 space-y-2 font-sans text-sm">
              {HOURS.map(({ days, time }) => (
                <div key={days} className="flex flex-col">
                  <dt className="font-medium text-white/80">{days}</dt>
                  <dd className="font-light text-white/60">{time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-sans text-xs font-light text-white/50">
              Walk-in only. No reservations needed.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation" className="md:col-span-2">
            <h2 className={label}>Explore</h2>
            <ul className="mt-5 space-y-3" role="list">
              {NAV_LINKS.map(({ label: navLabel, href }) => (
                <li key={navLabel}>
                  <a
                    href={href}
                    className="group inline-flex items-center font-sans text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <span
                      aria-hidden="true"
                      className="mr-0 h-px w-0 bg-ember transition-all duration-300 group-hover:mr-2 group-hover:w-4"
                    />
                    {navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 text-white/55 sm:flex-row">
          <p className="font-sans text-xs">
            &copy; {year} KM.BBQ. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-sans text-xs">
            <a href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </a>
            <span aria-hidden="true" className="text-white/25">
              |
            </span>
            <a
              href="https://norvix.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ember"
            >
              Crafted by Norvix
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
