import { ADDRESS_PARTS, BUSINESS, DIRECTIONS_URL } from "@/lib/restaurant";
import { StyledMap } from "./StyledMap";

// A real, interactive Google Map again, replacing the baked static render.
//
// Two source URLs, picked at build time:
//
//   WITH a key  -> the official Maps Embed API. This is the supported product,
//                  it is what Google documents, and it will not change under us.
//   WITHOUT one -> the keyless `output=embed` URL. Same interactive map, no
//                  account required, which is what ships until a key is set.
//
// STYLING: neither embed can restyle the map or recolour the marker — that is
// a property of the iframe. So when a key IS configured the map is rendered
// through the Maps JavaScript API instead (see StyledMap), which is the only
// integration that takes a `styles` array and a custom pin. Cream land, warm
// grey roads, muted green parks, low-saturation water, ember pin.
//
// Without a key the keyless embed is still what ships, unstyled, because the
// alternative is no map at all. This is the one piece of the palette the site
// cannot own on its own: Google's default blue/green is a full-width block of
// colour from nobody's palette, and removing it needs an API key.
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
    <div className="relative h-full w-full bg-cream-deep">
      {KEY ? (
        <StyledMap apiKey={KEY} />
      ) : (
        <iframe
          // The map sits below the fold, so it must not compete for bandwidth
          // or main thread with the hero. Lazy keeps it out of the LCP path.
          loading="lazy"
          src={SRC}
          title="Map showing KM.BBQ on South El Camino Real in Oceanside"
          className="h-full w-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      )}
    </div>
  );
}

/**
 * The directions link, BELOW the map rather than floating on it.
 *
 * It used to sit bottom-right inside the map bounds, on top of Google's own
 * zoom controls and the "Map data / Terms" line. Every other corner is spoken
 * for too: the embed puts a "View larger map" chip top-left, a fullscreen
 * control top-right and the Google logo bottom-left, and which of those appear
 * changes with width and with hover — so there is no corner an overlaid pill
 * can hold at every size. Below the map it collides with nothing, in either the
 * embed or the styled configuration, and on a phone it lands where the thumb
 * already is.
 *
 * It stays a real link rather than relying on the map's own controls: it is the
 * one thing a visitor actually came here to do, and it works the same whether
 * or not the map has loaded.
 */
export function DirectionsLink() {
  return (
    <a
      href={DIRECTIONS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-control border border-ember bg-cream px-5 py-2 font-sans text-eyebrow font-semibold text-ink shadow-warm transition-colors duration-[var(--dur-base)] ease-house hover:bg-ember focus-visible:bg-ember"
    >
      Get directions
      <span aria-hidden="true">→</span>
    </a>
  );
}
