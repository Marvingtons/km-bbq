import Image from "next/image";
import { SocialLinks } from "./SocialLinks";
import { PHONE } from "@/lib/restaurant";

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

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden bg-charcoal px-6 py-20 text-white/60"
      role="contentinfo"
    >
      {/* Top accent line — the one designed seam (Contact -> Footer). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent"
      />

      {/* Ambient warm glow for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-ember/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <Image
              src="/logos/km-bbq-logo.svg"
              alt="KM.BBQ logo"
              width={150}
              height={36}
              className="opacity-90"
            />
            <p className="mt-5 max-w-xs font-sans text-sm font-light leading-relaxed text-white/50">
              Premium Korean BBQ · Oceanside, CA
            </p>
            <a
              href={PHONE.href}
              className="group mt-5 inline-flex items-center gap-2 font-sans text-lg font-semibold text-white/90 transition-colors hover:text-ember"
            >
              <span
                aria-hidden="true"
                className="text-ember transition-transform duration-300 group-hover:scale-110"
              >
                ☎
              </span>
              {PHONE.display}
            </a>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation" className="md:col-span-4">
            <h2 className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-white/60">
              Explore
            </h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group inline-flex items-center font-sans text-sm text-white/70 transition-colors hover:text-white"
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
            <h2 className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-white/60">
              Follow Us
            </h2>
            <SocialLinks tone="dark" className="mt-5" />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 sm:flex-row">
          <p className="font-sans text-xs text-white/30">
            &copy; {year} KM.BBQ. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-sans text-xs text-white/30">
            <a href="/privacy" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white/60 transition-colors">
              Terms of Service
            </a>
            <span aria-hidden="true" className="text-white/15">|</span>
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
