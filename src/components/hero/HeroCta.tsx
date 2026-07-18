"use client";

import Link from "next/link";
import { CTA_LABEL, CTA_HREF } from "./copy";

/**
 * The hero CTA.
 *
 * DECISION: this converts the old tracked-hairline "VIEW MENU" to the system
 * pill rather than keeping it as a sanctioned exception. Two reasons, both
 * specific to the new clip: the hairline treatment is a 1px rule and 0.7rem
 * letter-spaced caps, which the bright, high-frequency grill footage swallows
 * at almost every frame; and on a phone it gives no real tap target, which
 * matters when this is the primary action above the fold.
 *
 * It is the CREAM fill rather than the ember fill. The video is warm orange
 * throughout, so an ember pill sits inside the video's own hue range and stops
 * reading as a control; cream against that warmth is the highest-contrast,
 * most button-like option, and cream is already a system surface.
 */
export function HeroCta({ className = "" }: { className?: string }) {
  return (
    <Link
      href={CTA_HREF}
      className={`group inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-7 py-3.5 font-sans text-sm font-semibold text-foreground shadow-warm-lg transition-colors duration-300 hover:bg-ember hover:text-white focus-visible:bg-ember focus-visible:text-white ${className}`}
    >
      {CTA_LABEL}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12h16M14 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
