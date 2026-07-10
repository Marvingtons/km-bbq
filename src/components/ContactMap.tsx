"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

const ADDRESS = "2216 S El Camino Real #108-109, Oceanside, CA 92054";

// Best-known coordinates for the storefront — used to centre the map before
// the geocoder answers (and as the fallback if geocoding is unavailable).
const FALLBACK_CENTER = { lat: 33.1809, lng: -117.3376 };

// A key unlocks the branded JavaScript map (custom style + ember pin). Without
// one we degrade to the standard embed, warmed with a filter so it still reads
// on-brand rather than stark Google-blue.
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const EMBED_SRC =
  "https://www.google.com/maps?q=" +
  encodeURIComponent(ADDRESS) +
  "&output=embed";

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

  // No key (or the script failed): warm-filtered embed so the map still reads
  // cream/charcoal rather than default blue.
  if (!API_KEY || failed) {
    return (
      <iframe
        title="Map to KM BBQ Oceanside"
        src={EMBED_SRC}
        className="h-full w-full border-0"
        style={{
          filter:
            "sepia(0.32) saturate(0.7) hue-rotate(-8deg) contrast(0.94) brightness(1.03)",
        }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    );
  }

  return <div ref={ref} className="h-full w-full" aria-label="Map to KM BBQ Oceanside" />;
}
