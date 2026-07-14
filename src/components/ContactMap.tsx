"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const ADDRESS = "2216 S El Camino Real #108-109, Oceanside, CA 92054";

// Best-known coordinates for the storefront — used to centre the map before
// the geocoder answers (and as the fallback if geocoding is unavailable).
const FALLBACK_CENTER = { lat: 33.1809, lng: -117.3376 };

// A key unlocks the branded, interactive JavaScript map (warm style, POI off,
// ember pin). Without one we show a real warm-toned static map image (baked
// from OpenStreetMap, see /public/images/contact-map.jpg) — never an empty
// grid. Production currently has NO key set, so the static path is what ships.
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Opens turn-by-turn directions in Google Maps — no API key required.
const DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=" +
  encodeURIComponent(ADDRESS);

// Warm cream/charcoal map palette for the interactive path — the single ember
// accent lives on the pin, never in the map itself. No default Google blue.
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

// Ember teardrop pin with a cream eye — drawn from tokens so it stays on-brand.
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
    const existing = document.querySelector<HTMLScriptElement>("script[data-gmaps]");
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

// Inline ember pin for the static map, sized for the overlay.
function EmberPin() {
  return (
    <svg
      width="34"
      height="46"
      viewBox="0 0 36 48"
      className="drop-shadow-[0_6px_10px_rgba(74,44,22,0.4)]"
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

function DirectionsButton() {
  return (
    <a
      href={DIRECTIONS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-cream/95 px-4 py-2 font-sans text-xs font-semibold text-ember-deep shadow-card ring-1 ring-ink/10 transition-colors duration-300 hover:bg-ember-deep hover:text-white focus-visible:bg-ember-deep focus-visible:text-white"
    >
      Get Directions
      <span aria-hidden="true">→</span>
    </a>
  );
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

  const showStatic = !API_KEY || failed;

  return (
    <div className="relative h-full w-full bg-cream-deep">
      {showStatic ? (
        <>
          {/* Real, warm-toned static map (OpenStreetMap, baked at build). */}
          <Image
            src="/images/contact-map.jpg"
            alt="Map showing KM.BBQ on South El Camino Real in Oceanside"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          {/* Soft warm scrim: unifies the tone and hides the map's cropped edge. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/15 via-transparent to-cream/20"
          />
          {/* Ember pin — its tip sits on the storefront at map centre. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
          >
            <EmberPin />
          </div>
          {/* Required OpenStreetMap attribution. */}
          <span className="pointer-events-none absolute bottom-1.5 left-2.5 font-sans text-[10px] text-ink/55">
            © OpenStreetMap
          </span>
        </>
      ) : (
        <div ref={ref} className="h-full w-full" aria-label="Map to KM BBQ Oceanside" />
      )}
      <DirectionsButton />
    </div>
  );
}
