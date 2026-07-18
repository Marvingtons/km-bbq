import Image from "next/image";
import { DIRECTIONS_URL } from "@/lib/restaurant";

// A warm static map instead of a Google embed. The iframe embed this replaces
// worked, but it pulled ~1MB of third-party JS and set cookies on every visit —
// a bad trade on a page whose majority visitor is on a phone. The map here is a
// baked OpenStreetMap render (/public/images/contact-map.jpg, toned to the cream
// palette), and the thing a visitor actually wants — turn-by-turn directions —
// is a real link that needs no API key.

// The pin's tip lands on the storefront at the image's centre point.
function EmberPin() {
  return (
    <svg
      width="34"
      height="46"
      viewBox="0 0 36 48"
      className="drop-shadow-[0_6px_10px_rgb(120_60_20/0.4)]"
      aria-hidden="true"
    >
      <path
        d="M18 0C8.06 0 0 8.06 0 18c0 12.5 18 30 18 30s18-17.5 18-30C36 8.06 27.94 0 18 0z"
        fill="var(--color-ember)"
        stroke="var(--color-ember-deep)"
        strokeWidth="1.5"
      />
      <circle cx="18" cy="18" r="6.5" fill="var(--color-cream)" />
    </svg>
  );
}

export function ContactMap() {
  return (
    <div className="relative h-full w-full bg-paper">
      <Image
        src="/images/contact-map.jpg"
        alt="Map showing KM.BBQ on South El Camino Real in Oceanside"
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover"
      />
      {/* Soft warm scrim: ties the render to the cream page and softens the
          cropped edge so it reads as part of the surface, not a pasted tile. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/15 via-transparent to-cream/20"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
      >
        <EmberPin />
      </div>
      {/* Required OpenStreetMap attribution. */}
      <span className="pointer-events-none absolute bottom-1.5 left-2.5 font-sans text-[10px] text-foreground/55">
        © OpenStreetMap
      </span>

      {/* 44px min height keeps this a comfortable thumb target on a phone. */}
      <a
        href={DIRECTIONS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-10 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-cream/95 px-4 py-2 font-sans text-xs font-semibold text-ember-deep shadow-warm ring-1 ring-black/10 transition-colors duration-300 hover:bg-ember-deep hover:text-white focus-visible:bg-ember-deep focus-visible:text-white"
      >
        Get directions
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
