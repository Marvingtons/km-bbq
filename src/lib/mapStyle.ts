/**
 * The map, in the site's palette.
 *
 * Google's default style is a full-width block of blue, green and white from
 * nobody's palette, sitting inside a cream page — the single largest patch of
 * off-brand colour on the site. This is the Maps styling array that replaces
 * it: cream land, warm grey roads, muted green parks, low-saturation water.
 *
 * Values are the site's own tokens, written as literals because the Maps API
 * takes colours as strings and never sees the stylesheet. They are the token
 * values (or a documented tint of one), not new colours:
 *
 *   cream          #FAF4EC   land
 *   char-2     #F3EBDD   road fill
 *   char-3     #E4D9C4   road casing, administrative lines
 *   body           #5A5550   labels
 *   pine @ 12%     #E2E6DA   parks, on cream
 *   a cool cream   #E3E7E6   water (the one place a cool tone is correct:
 *                            water that reads as land is unreadable as a map)
 *
 * Applies only when a Maps JavaScript API key is configured. See ContactMap.
 */
export const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#FAF4EC" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5A5550" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FAF4EC" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },

  // Administrative boundaries: present, but only as a hairline.
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#E4D9C4" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },

  // Points of interest: off. The one pin that matters is ours.
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#F1EADC" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#E2E6DA" }],
  },

  // Roads: warm grey, cased a shade darker so the network still reads.
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#F3EBDD" }] },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#E4D9C4" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#EFE4D2" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#EADCC5" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#DCCBAE" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#7A736B" }],
  },

  // Transit off — it is noise at this zoom and none of it is the point.
  { featureType: "transit", stylers: [{ visibility: "off" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#E3E7E6" }] },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9AA3A2" }],
  },
] as const;

/** The pin, drawn in ember with an ink outline. */
export const MAP_PIN_PATH =
  "M12 0C5.7 0 0.6 5.1 0.6 11.4 0.6 20 12 32 12 32s11.4-12 11.4-20.6C23.4 5.1 18.3 0 12 0z";
