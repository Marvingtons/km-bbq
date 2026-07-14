"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

const ADDRESS = "2216 S El Camino Real #108-109, Oceanside, CA 92054";

// Best-known coordinates for the storefront — used to centre the map before
// the geocoder answers (and as the fallback if geocoding is unavailable).
const FALLBACK_CENTER = { lat: 33.1809, lng: -117.3376 };

// A key unlocks the branded JavaScript map (custom style + ember pin). Without
// one we degrade to a warm, on-brand static location panel (below) rather than
// the stock Google embed, which brought a cool palette and POI clutter.
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Opens turn-by-turn directions in Google Maps — no API key required.
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(ADDRESS);

// Warm cream/charcoal map palette — the single ember accent lives on the pin,
// never in the map itself. Land is cream, water/parks muted taupe, labels warm
// charcoal with a cream halo. No default Google blue anywhere.
const MAP_STYLE: any[] = [
  { elementType: "geometry", stylers: [{ color: "#f2ebdd" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5c5148" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#faf6ef" }, { weight: 2 }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#d8cdba" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8a7d6f" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5dcc7" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#8a7d6f" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#faf6ef" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e6dcc8" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#5c5148" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#f6efe0" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#eaddc4" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#dcbf93" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d7ccb6" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#8a7d6f" }] },
];

// Ember teardrop pin with a cream eye — drawn from tokens (#e0662b / #a8481c /
// #faf6ef) so it stays on-brand at any zoom.
const EMBER_PIN =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48">
       <path d="M18 0C8.06 0 0 8.06 0 18c0 12.5 18 30 18 30s18-17.5 18-30C36 8.06 27.94 0 18 0z" fill="#e0662b" stroke="#a8481c" stroke-width="1.5"/>
       <circle cx="18" cy="18" r="6.5" fill="#faf6ef"/>
     </svg>`,
  );

// Load the Maps JS API once per page, sharing a single promise across mounts.
let mapsPromise: Promise<void> | null = null;
function loadMaps(key: string) {
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-gmaps]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("maps")));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async`;
    script.async = true;
    script.dataset.gmaps = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("maps"));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

export function ContactMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!API_KEY || !ref.current) return;
    let cancelled = false;

    loadMaps(API_KEY)
      .then(() => {
        if (cancelled || !ref.current) return;
        const google = (window as any).google;
        if (!google?.maps) throw new Error("maps");

        const map = new google.maps.Map(ref.current, {
          center: FALLBACK_CENTER,
          zoom: 15,
          styles: MAP_STYLE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "cooperative",
          backgroundColor: "#f2ebdd",
        });

        const drop = (position: { lat: number; lng: number }) => {
          map.setCenter(position);
          new google.maps.Marker({
            map,
            position,
            title: "KM.BBQ",
            icon: {
              url: EMBER_PIN,
              scaledSize: new google.maps.Size(36, 48),
              anchor: new google.maps.Point(18, 46),
            },
          });
        };

        // Geocode for pin accuracy; fall back to the known coordinates.
        new google.maps.Geocoder().geocode(
          { address: ADDRESS },
          (results: any, status: string) => {
            if (cancelled) return;
            if (status === "OK" && results?.[0]) {
              const loc = results[0].geometry.location;
              drop({ lat: loc.lat(), lng: loc.lng() });
            } else {
              drop(FALLBACK_CENTER);
            }
          },
        );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // No key (or the script failed): a warm, self-contained location panel —
  // abstract cream/taupe street lines, the ember pin, and a directions button.
  // Fully on-brand and free of the stock embed's cool palette and POI clutter.
  if (!API_KEY || failed) {
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-cream-deep px-6 text-center">
        {/* Abstract street grid — decorative; evokes a map without real
            geography, drawn from warm tokens so nothing reads cool. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 400 225"
          fill="none"
        >
          <g stroke="var(--color-warm-muted)" strokeOpacity="0.16" strokeWidth="6">
            <path d="M-20 72 H420" />
            <path d="M-20 158 H420" />
            <path d="M92 -20 V245" />
            <path d="M298 -20 V245" />
          </g>
          <g stroke="var(--color-warm-muted)" strokeOpacity="0.09" strokeWidth="2">
            <path d="M-20 116 H420" />
            <path d="M46 -20 V245" />
            <path d="M200 -20 V245" />
            <path d="M-20 30 L200 245" />
            <path d="M260 -20 L440 130" />
          </g>
        </svg>

        <div className="relative z-10 flex transform-gpu flex-col items-center">
          <svg
            width="34"
            height="46"
            viewBox="0 0 36 48"
            className="drop-shadow-[0_6px_10px_rgba(74,44,22,0.28)]"
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
          <p className="mt-3 font-sans text-base font-bold tracking-tight text-ink">
            KM<span className="text-ember">.</span>BBQ
          </p>
          <address className="mt-1 font-sans text-sm font-light not-italic leading-relaxed text-warm">
            2216 S El Camino Real #108–109
            <br />
            Oceanside, CA 92054
          </address>
          <a
            href={DIRECTIONS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-ember-deep px-5 py-2 font-sans text-xs font-medium text-ember-deep transition-colors duration-300 hover:bg-ember-deep hover:text-white focus-visible:bg-ember-deep focus-visible:text-white"
          >
            Get Directions
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    );
  }

  return <div ref={ref} className="h-full w-full" aria-label="Map to KM BBQ Oceanside" />;
}
