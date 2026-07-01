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

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/kmkoreanbbq/",
    icon: (
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
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@kmkoreanbbq",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.79 1.54V6.78a4.85 4.85 0 0 1-1.02-.09z" />
      </svg>
    ),
  },
  {
    label: "Yelp",
    href: "#",
    // TODO: Replace with real Yelp URL
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      </svg>
    ),
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden bg-foreground px-6 py-20 text-white/60"
      role="contentinfo"
    >
      {/* Top accent line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/60 to-transparent"
      />

      {/* Ambient warm glow for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-orange/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <img
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
              href="tel:+17604331888"
              className="group mt-5 inline-flex items-center gap-2 font-serif text-2xl text-white/90 transition-colors hover:text-brand-orange"
            >
              <span
                aria-hidden="true"
                className="text-brand-orange transition-transform duration-300 group-hover:scale-110"
              >
                ☎
              </span>
              (760) 433-1888
            </a>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation" className="md:col-span-4">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
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
                      className="mr-0 h-px w-0 bg-brand-orange transition-all duration-300 group-hover:mr-2 group-hover:w-4"
                    />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div className="md:col-span-3">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Follow Us
            </h2>
            <div className="mt-5 flex gap-3">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/60 hover:bg-brand-orange/10 hover:text-brand-orange hover:shadow-[0_8px_24px_-8px] hover:shadow-brand-orange/40"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 sm:flex-row">
          <p className="font-sans text-xs text-white/30">
            &copy; {year} KM.BBQ. All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-sans text-xs text-white/30">
            {/* TODO: add real policy pages */}
            <a href="#" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Terms of Service
            </a>
            <span aria-hidden="true" className="text-white/15">|</span>
            <a
              href="https://norvix.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-brand-orange"
            >
              Crafted by Norvix
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
