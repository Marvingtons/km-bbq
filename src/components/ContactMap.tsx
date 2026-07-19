import { ADDRESS_PARTS, BUSINESS, DIRECTIONS_URL } from "@/lib/restaurant";

// A real, interactive Google Map again, replacing the baked static render.
//
// Two source URLs, picked at build time:
//
//   WITH a key  -> the official Maps Embed API. This is the supported product,
//                  it is what Google documents, and it will not change under us.
//   WITHOUT one -> the keyless `output=embed` URL. Same interactive map, no
//                  account required, which is what ships until a key is set.
//
// NOTE on the ember pin: neither embed can restyle the map or recolour the
// marker. Custom styling and a custom marker need the Maps JavaScript API, a
// different (heavier) integration that also has to be initialised client-side.
// That is worth doing only if the styled look is wanted badly enough to carry
// the extra script; the standard embed inside the system card radius is what
// this ships, per the fallback in the brief.
//
// NEXT_PUBLIC_* is inlined by the bundler at build time, so this is a static
// string in the output and adds no runtime environment dependency (which
// matters on the Workers runtime, where there is no Node process env).
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Business name first, and WITHOUT the suite number. Geocoding the raw
// "#108-109" made the map label the pin "#108 #109" instead of the restaurant;
// leading with the name gets the business itself, which is what a visitor is
// looking for on the map. The suite is still shown in the address text beside
// the map, where it is the part that actually helps you find the door.
const QUERY = `${BUSINESS.name}, ${ADDRESS_PARTS.street.replace(/\s*#.*$/, "")}, ${ADDRESS_PARTS.city}, ${ADDRESS_PARTS.state} ${ADDRESS_PARTS.zip}`;

const SRC = KEY
  ? `https://www.google.com/maps/embed/v1/place?key=${KEY}&q=${encodeURIComponent(QUERY)}&zoom=16`
  : `https://www.google.com/maps?q=${encodeURIComponent(QUERY)}&z=16&output=embed`;

export function ContactMap() {
  return (
    <div className="relative h-full w-full bg-paper">
      <iframe
        // The map sits below the fold, so it must not compete for bandwidth or
        // main thread with the hero. Lazy keeps it out of the LCP path entirely.
        loading="lazy"
        src={SRC}
        title="Map showing KM.BBQ on South El Camino Real in Oceanside"
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />

      {/* Directions stay a real link rather than relying on the embed's own
          controls: it is the one thing a visitor actually came here to do, and
          it works the same whether or not the iframe has loaded.
          min-h-11 keeps it a comfortable thumb target on a phone. */}
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
