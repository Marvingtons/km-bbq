import { SOCIALS, type SocialKey } from "@/data/info";

// INTERACTIVE, so they take the control radius: every one of these is a link
// to a profile, not an ornament. Round rather than pill only because the target
// is square — same token, same rule.
//
// One social-links component, used by both the footer (on sand-2) and the
// contact section (on cream). Same chip shape, size, and lift+flame-glow hover
// everywhere — only the resting surface colors switch by `tone` so the chip
// reads on either background. Instagram, TikTok, and Yelp appear in both.

const ICONS: Record<SocialKey, React.ReactNode> = {
  instagram: (
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
  tiktok: (
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
  yelp: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m 7.69 15.14 -3.67 0.85 c -0.38 0.09 -0.76 0.18 -1.15 0.15 -0.26 -0.02 -0.51 -0.04 -0.76 -0.21 a 1.18 1.18 0 0 1 -0.33 -0.36 c -0.35 -0.55 -0.37 -1.37 -0.37 -2 a 6.29 6.29 0 0 1 0.33 -2.06 1.86 1.86 0 0 1 0.11 -0.25 2.34 2.34 0 0 1 0.13 -0.22 2.46 2.46 0 0 1 0.16 -0.2 1.17 1.17 0 0 1 0.4 -0.28 1.08 1.08 0 0 1 0.46 -0.08 c 0.24 0 0.51 0.05 0.91 0.17 0.06 0.02 0.12 0.04 0.19 0.06 0.33 0.1 0.7 0.24 1.15 0.4 0.69 0.24 1.37 0.49 2.05 0.74 l 1.21 0.44 c 0.22 0.08 0.44 0.18 0.64 0.3 0.17 0.1 0.33 0.23 0.45 0.39 a 1.22 1.22 0 0 1 0.19 0.43 1.22 1.22 0 0 1 -0.87 1.45 c -0.05 0.02 -0.09 0.02 -0.11 0.03 l -1.1 0.26 0 0 z M 18.82 7.57 a 1.85 1.85 0 0 0 -0.2 -0.18 2.41 2.41 0 0 0 -0.21 -0.14 2.36 2.36 0 0 0 -0.23 -0.11 1.17 1.17 0 0 0 -0.48 -0.08 1.09 1.09 0 0 0 -0.45 0.13 c -0.21 0.1 -0.44 0.27 -0.74 0.56 -0.04 0.04 -0.09 0.09 -0.14 0.13 -0.25 0.24 -0.53 0.53 -0.86 0.86 a 114.64 114.64 0 0 0 -1.52 1.56 l -0.9 0.93 a 4.19 4.19 0 0 0 -0.45 0.55 1.54 1.54 0 0 0 -0.24 0.55 1.22 1.22 0 0 0 0.01 0.45 l 0 0.02 a 1.22 1.22 0 0 0 1.42 0.92 1.16 1.16 0 0 0 0.11 -0.02 l 4.78 -1.1 c 0.38 -0.09 0.76 -0.17 1.1 -0.36 0.23 -0.13 0.44 -0.26 0.59 -0.53 a 1.18 1.18 0 0 0 0.14 -0.47 c 0.07 -0.65 -0.27 -1.39 -0.54 -1.96 a 6.28 6.28 0 0 0 -1.2 -1.71 z M 8.97 0.08 a 8.67 8.67 0 0 0 -0.83 0.16 c -0.28 0.07 -0.55 0.14 -0.81 0.22 -0.87 0.28 -2.09 0.81 -2.29 1.81 -0.12 0.57 0.16 1.14 0.37 1.66 0.26 0.63 0.61 1.19 0.94 1.78 0.85 1.55 1.72 3.1 2.59 4.65 0.26 0.46 0.54 1.05 1.04 1.29 a 1.06 1.06 0 0 0 0.1 0.04 c 0.22 0.09 0.47 0.1 0.7 0.05 a 4.3 4.3 0 0 0 0.04 -0.01 1.21 1.21 0 0 0 0.57 -0.34 1.1 1.1 0 0 0 0.08 -0.08 c 0.35 -0.43 0.35 -1.08 0.38 -1.61 0.1 -1.77 0.21 -3.54 0.3 -5.31 0.03 -0.67 0.11 -1.33 0.07 -2.01 -0.03 -0.56 -0.04 -1.2 -0.39 -1.66 -0.62 -0.81 -1.95 -0.74 -2.85 -0.62 z m 2.08 15.95 a 1.11 1.11 0 0 0 -1.23 -0.41 1.14 1.14 0 0 0 -0.15 0.06 1.48 1.48 0 0 0 -0.22 0.14 c -0.2 0.15 -0.37 0.34 -0.52 0.53 -0.04 0.05 -0.07 0.11 -0.12 0.16 l -0.77 1.06 a 113.92 113.92 0 0 0 -1.29 1.79 c -0.28 0.39 -0.52 0.72 -0.71 1.01 -0.04 0.05 -0.07 0.12 -0.11 0.16 -0.23 0.35 -0.36 0.61 -0.42 0.84 a 1.09 1.09 0 0 0 -0.05 0.47 c 0.02 0.17 0.08 0.32 0.16 0.47 0.05 0.07 0.1 0.14 0.15 0.21 a 2.33 2.33 0 0 0 0.18 0.18 1.84 1.84 0 0 0 0.21 0.17 c 0.53 0.37 1.11 0.63 1.72 0.84 a 6.1 6.1 0 0 0 1.57 0.3 c 0.09 0 0.18 0 0.27 -0.01 a 2.39 2.39 0 0 0 0.25 -0.04 2.39 2.39 0 0 0 0.24 -0.07 1.19 1.19 0 0 0 0.42 -0.27 c 0.11 -0.11 0.2 -0.25 0.25 -0.4 0.09 -0.22 0.15 -0.5 0.19 -0.92 0 -0.06 0.01 -0.13 0.02 -0.2 0.03 -0.35 0.04 -0.75 0.07 -1.23 0.04 -0.74 0.07 -1.47 0.09 -2.2 0 0 0.05 -1.31 0.05 -1.31 0.01 -0.3 0 -0.63 -0.08 -0.93 a 1.4 1.4 0 0 0 -0.18 -0.41 z m 8.68 2.04 c -0.16 -0.18 -0.39 -0.35 -0.75 -0.57 -0.05 -0.03 -0.11 -0.07 -0.17 -0.1 -0.3 -0.18 -0.66 -0.37 -1.08 -0.6 a 120.76 120.76 0 0 0 -1.94 -1.04 l -1.15 -0.61 c -0.06 -0.02 -0.12 -0.06 -0.18 -0.09 -0.22 -0.11 -0.46 -0.2 -0.7 -0.25 a 1.49 1.49 0 0 0 -0.25 -0.03 1.15 1.15 0 0 0 -0.16 0.01 1.11 1.11 0 0 0 -0.92 0.91 1.42 1.42 0 0 0 0.02 0.44 c 0.06 0.31 0.19 0.61 0.33 0.88 l 0.61 1.15 c 0.34 0.65 0.69 1.3 1.04 1.94 0.23 0.42 0.42 0.78 0.6 1.08 0.03 0.06 0.07 0.12 0.1 0.17 0.22 0.36 0.39 0.58 0.57 0.75 0.11 0.11 0.25 0.2 0.4 0.25 0.16 0.05 0.33 0.07 0.49 0.05 a 2.37 2.37 0 0 0 0.25 -0.04 c 0.08 -0.02 0.16 -0.05 0.24 -0.08 a 1.86 1.86 0 0 0 0.25 -0.11 6.1 6.1 0 0 0 1.28 -0.96 c 0.46 -0.45 0.87 -0.95 1.18 -1.51 0.04 -0.08 0.08 -0.16 0.11 -0.25 a 2.49 2.49 0 0 0 0.08 -0.24 c 0.02 -0.08 0.03 -0.17 0.04 -0.25 a 1.19 1.19 0 0 0 -0.06 -0.49 1.09 1.09 0 0 0 -0.25 -0.4 z" />
    </svg>
  ),
};

/**
 * Two tones, one per ground, and they resolve to the SAME hover: the accent as
 * a fill with a sand glyph on top.
 *
 * That is not a stylistic choice. These are 1.5px-stroke glyphs, and the accent
 * as a *glyph colour* only clears AA on the warm ground (5.01:1 on sand) — on
 * the footer's char it is 3.15:1 and on a sky band 3.52:1. Rather than carry
 * one hover for light and a different one for dark, both tones hover to a flame
 * fill, where the contrast lives between the fill and the sand glyph and is
 * identical on either ground.
 */
const TONE = {
  // On the black structure — the footer.
  dark: "border-sand/15 bg-sand/[0.06] text-sand/70 hover:border-flame hover:bg-flame hover:text-sand",
  // On the warm ground.
  light:
    "border-sand-3 bg-sand-2 text-ash hover:border-flame hover:bg-flame hover:text-sand",
} as const;

export function SocialLinks({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={`flex gap-3 ${className}`}>
      {SOCIALS.map(({ key, label, href }) => (
        <a
          key={key}
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-11 w-11 items-center justify-center rounded-pill border transition-all duration-[var(--dur-base)] ease-house hover:-translate-y-1 hover:shadow-card ${TONE[tone]}`}
        >
          {ICONS[key]}
        </a>
      ))}
    </div>
  );
}
