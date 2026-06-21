const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#about" },
  { label: "Gallery", href: "#gallery" },
  { label: "Catering", href: "#catering" },
  { label: "Contact", href: "#contact" },
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
    <footer className="bg-foreground px-6 py-16 text-white/60" role="contentinfo">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Brand */}
          <div>
            <img
              src="/logos/km-bbq-logo.svg"
              alt="KM.BBQ logo"
              width={140}
              height={34}
              className="opacity-90"
            />
            <p className="mt-5 font-sans text-sm font-light leading-relaxed text-white/50">
              Premium Korean BBQ.
              <br />
              Oceanside, CA
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <p className="mb-5 font-sans text-xs font-medium tracking-widest uppercase text-white/30">
              Navigate
            </p>
            <ul className="space-y-3" role="list">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="font-sans text-sm transition-colors hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials + contact */}
          <div>
            <p className="mb-5 font-sans text-xs font-medium tracking-widest uppercase text-white/30">
              Connect
            </p>
            <div className="flex gap-5">
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="text-white/50 transition-colors hover:text-brand-orange"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {icon}
                </a>
              ))}
            </div>
            <div className="mt-6 space-y-1 font-sans text-sm">
              <a
                href="tel:+17604331888"
                className="block hover:text-white transition-colors"
              >
                (760) 433-1888
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="font-sans text-xs text-white/30">
            &copy; {year} KM.BBQ. All rights reserved.
          </p>
          <div className="flex gap-6 font-sans text-xs text-white/30">
            {/* TODO: add real policy pages */}
            <a href="#" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/60 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
