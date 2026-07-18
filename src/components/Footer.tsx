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

// Every column opens with a fixed-height row so the eyebrow labels and the logo
// share one top baseline and all following content starts on the same line.
const topRow = "flex h-9 items-center";

// Line-art phone glyph drawn to match the social icon set (18px, 1.5 stroke,
// round caps) so the contact row reads as one icon family. Replaces the ☎ emoji.
function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

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
          {/* Brand — socials sit at the column's foot so it doesn't trail off
              into empty space below the tagline. */}
          <div className="flex flex-col md:col-span-4">
            <div className={topRow}>
              <Image
                src="/logos/km-bbq-logo.svg"
                alt="KM.BBQ logo"
                width={150}
                height={36}
                className="opacity-90"
              />
            </div>
            <p className="mt-5 max-w-xs font-sans text-sm font-light leading-relaxed text-white/60">
              All-you-can-eat Korean BBQ, grilled over live charcoal in
              Oceanside, California.
            </p>
            <SocialLinks tone="dark" className="mt-6 md:mt-auto md:pt-6" />
          </div>

          {/* Visit — NAP block + actions */}
          <div className="md:col-span-3">
            <div className={topRow}>
              <h2 className={label}>Visit</h2>
            </div>
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
                <span className="text-ember transition-transform duration-300 group-hover:scale-110">
                  <PhoneIcon />
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
            <div className={topRow}>
              <h2 className={label}>Hours</h2>
            </div>
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
            <div className={topRow}>
              <h2 className={label}>Explore</h2>
            </div>
            {/* Two columns so a 5-item nav doesn't run 60px past every other
                column and leave the row visually lopsided. */}
            <ul
              className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-1 lg:grid-cols-2"
              role="list"
            >
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

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 text-white/55 sm:flex-row">
          <p className="font-sans text-xs">
            &copy; {year} KM.BBQ. All rights reserved.
          </p>
          {/* flex-wrap + centred so the legal links wrap as whole phrases at
              375 instead of breaking mid-label. */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-sans text-xs">
            <a href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </a>
            {/* Decorative divider only when the row sits on one line. */}
            <span aria-hidden="true" className="hidden text-white/25 sm:inline">
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
