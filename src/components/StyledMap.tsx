"use client";

import { useEffect, useRef, useState } from "react";
import { MAP_STYLE, MAP_PIN_PATH } from "@/lib/mapStyle";
import { BUSINESS, GEO } from "@/lib/restaurant";

/**
 * The custom-styled map.
 *
 * The two embed products (Maps Embed API and the keyless `output=embed` URL)
 * cannot be restyled and cannot take a custom marker — that is a property of
 * the iframe, not of how it is called. Restyling requires the Maps JavaScript
 * API, so that is what this is: same map, same place, drawn in the site's
 * palette with an ember pin.
 *
 * It is NOT a CSS filter over the iframe. A filter would drag the labels, the
 * pin and the Google attribution along with the land, which is both ugly and a
 * terms violation.
 *
 * COST CONTROL, in order:
 *   1. It renders only when a Maps JavaScript API key is configured. Without
 *      one, ContactMap falls back to the keyless embed and this file is never
 *      imported into the page.
 *   2. The loader script is injected only when the map scrolls into view, so a
 *      visitor who never reaches Contact never pays for it and it stays out of
 *      the LCP path entirely.
 *
 * `styles` is the classic styling array, which requires that no cloud-based
 * Map ID is set — passing both makes Google ignore `styles` silently.
 */

// Minimal shape of the bits of the Maps API this file touches, so the file
// type-checks without pulling in @types/google.maps.
type MapsApi = {
  Map: new (el: HTMLElement, opts: Record<string, unknown>) => object;
  Marker: new (opts: Record<string, unknown>) => object;
  Point: new (x: number, y: number) => object;
  ControlPosition: { RIGHT_BOTTOM: number };
};
declare global {
  interface Window {
    google?: { maps?: MapsApi };
    __kmMapsLoading?: Promise<void>;
  }
}

/** Loads the Maps JS API once per document, on demand. */
function loadMaps(key: string): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (window.__kmMapsLoading) return window.__kmMapsLoading;

  window.__kmMapsLoading = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return window.__kmMapsLoading;
}

export function StyledMap({ apiKey }: { apiKey: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    const init = async () => {
      try {
        await loadMaps(apiKey);
        if (cancelled) return;
        const maps = window.google?.maps;
        if (!maps) return setFailed(true);

        const map = new maps.Map(host, {
          center: { lat: GEO.lat, lng: GEO.lng },
          zoom: 16,
          // `styles` is only honoured when no mapId is set.
          styles: MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          zoomControlOptions: { position: maps.ControlPosition.RIGHT_BOTTOM },
          keyboardShortcuts: false,
          clickableIcons: false,
        });

        new maps.Marker({
          map,
          position: { lat: GEO.lat, lng: GEO.lng },
          title: BUSINESS.name,
          icon: {
            path: MAP_PIN_PATH,
            fillColor: "#F18B23", // --color-ember
            fillOpacity: 1,
            strokeColor: "#1A1A1A", // --color-ink
            strokeWeight: 1.5,
            scale: 1.1,
            // The pin's point, not its box: the path is 24x32 with the tip at
            // the bottom centre.
            anchor: new maps.Point(12, 32),
          },
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    // Below the fold: don't fetch the API until the map is nearly in view.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void init();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(host);

    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [apiKey]);

  // If the API never arrives (blocked, quota, bad key) the visitor still gets a
  // usable answer: the address is in the card above and the directions pill is
  // a real link that sits on top of this box either way.
  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-cream-deep px-6 text-center font-sans text-copy font-light text-body">
        Map unavailable right now. The directions link still works.
      </div>
    );
  }

  return <div ref={hostRef} className="h-full w-full bg-cream-deep" />;
}
