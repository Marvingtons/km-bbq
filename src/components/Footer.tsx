import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { Dot } from "./Dot";
import { PHONE, ADDRESS, HOURS, DIRECTIONS_URL } from "@/data/info";

// Absolute hrefs so the footer works from any route: section links return to the
// home page (and scroll to the section), and "Menu" goes to the full menu page.
const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/#about" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

// The shared eyebrow metrics, with the colour overridden for this ground.
// ember (the eyebrow colour on cream) lands at 3.4:1 on char-2 and fails
// AA at 12px; ember passes at 7.4:1 but ember's job is interaction, and a
// column label is not an affordance. So the footer keeps white/60 — 7.1:1,
// measured — and matches every other eyebrow in size, weight and tracking.
const label = "eyebrow text-sand/60";

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
      // char-2 rather than char: the footer is a raised surface, so it lifts
      // off the page ground by one step instead of being divided from it by a
      // rule. The whole site is dark now, so the four-colour mark sits here the
      // same way it sits everywhere else.
      className="relative overflow-hidden border-t border-steel/25 bg-char-2 pb-10 pt-14 text-sand/70"
      role="contentinfo"
    >
      {/* Ambient warm glow for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-flame/10 blur-[120px]"
      />

      <div className="grid-page relative">
        <div className="col-full">
          {/* The four columns are a layout inside the footer, not four spans of
              the page's 12-column track — so they nest their own grid rather
              than reaching for raw col-span-* against `.grid-page`. That is
              what `.col-full` is for. */}
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.8fr]">
          {/* Brand. The socials used to be pushed to the column's foot with
              md:mt-auto, which only worked while this was the tallest column;
              once Explore went back to a single column it stretched a 100px
              hole between the tagline and the icons. They sit directly under
              the tagline now and the column simply ends where it ends. */}
          <div className="flex flex-col">
            <div className={topRow}>
              <Logo size={148} className="opacity-90" />
            </div>
            <p className="copy mt-5 max-w-xs text-sand/60">
              All-you-can-eat Korean BBQ in Oceanside, California. You pick the
              cuts and grill them yourself right at your table.
            </p>
            <SocialLinks tone="dark" className="mt-6" />
          </div>

          {/* Visit — NAP block + actions */}
          <div>
            <div className={topRow}>
              <h2 className={label}>Visit</h2>
            </div>
            <address className="copy mt-5 not-italic text-sand/70">
              KM<Dot />BBQ
              <br />
              {ADDRESS.street}
              <br />
              {ADDRESS.region}
            </address>
            <div className="mt-5 flex flex-col gap-3">
              <a
                href={PHONE.href}
                className="group inline-flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-sand/90 transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
              >
                <span className="text-sand transition-transform duration-[var(--dur-base)] ease-house group-hover:scale-110">
                  <PhoneIcon />
                </span>
                {PHONE.display}
              </a>
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 w-fit items-center gap-1.5 font-sans text-sm font-medium text-sand transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
              >
                Get directions
                <span
                  aria-hidden="true"
                  className="transition-transform duration-[var(--dur-base)] ease-house group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          </div>

          {/* Hours */}
          <div>
            <div className={topRow}>
              <h2 className={label}>Hours</h2>
            </div>
            <dl className="mt-5 space-y-2 font-sans text-sm">
              {HOURS.map(({ days, time }) => (
                <div key={days} className="flex flex-col">
                  <dt className="font-medium text-sand/80">{days}</dt>
                  <dd className="font-normal text-sand/60">{time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-sans text-xs font-normal text-sand/50">
              Walk-in only. No reservations needed.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Footer navigation">
            <div className={topRow}>
              <h2 className={label}>Explore</h2>
            </div>
            {/* One column. Five items across two columns leaves Contact
                orphaned on a row by itself and the 44px tap targets blow the
                row heights out — the ragged result cost more than the 60px of
                column height it was trying to save. */}
            <ul className="mt-5 space-y-1" role="list">
              {NAV_LINKS.map(({ label: navLabel, href }) => (
                <li key={navLabel}>
                  <a
                    href={href}
                    className="group inline-flex min-h-11 items-center font-sans text-sm text-sand/70 transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
                  >
                    <span
                      aria-hidden="true"
                      className="mr-0 h-px w-0 bg-flame transition-all duration-[var(--dur-base)] ease-house group-hover:mr-2 group-hover:w-4"
                    />
                    {navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          </div>

        {/* The legal row sits under the four columns and lines up with the
            brand column's left edge. */}
        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-steel/25 pt-6 text-sand/55 sm:flex-row sm:items-center">
          <p className="font-sans text-xs">
            &copy; {year} KM<Dot />BBQ. All rights reserved.
          </p>
          {/* flex-wrap so the legal links wrap as whole phrases at 375 instead
              of breaking mid-label. */}
          <div className="flex flex-wrap items-center gap-x-5 font-sans text-xs">
            <a
              href="/privacy"
              className="inline-flex min-h-11 items-center transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="inline-flex min-h-11 items-center transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
            >
              Terms of Service
            </a>
            {/* Decorative divider, only when the row sits on one line. It sets no
                colour of its own — the pink that used to live here went with
                --color-neon-pink. */}
            <span aria-hidden="true" className="hidden sm:inline">
              |
            </span>
            <a
              href="https://norvix.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center transition-colors duration-[var(--dur-base)] ease-house hover:text-sand"
            >
              Site by Norvix
            </a>
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
