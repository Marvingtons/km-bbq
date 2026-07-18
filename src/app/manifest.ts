import type { MetadataRoute } from "next";

// theme_color / background_color use the site's cream surface (--color-cream,
// #FAF4EC), not a leftover dark value, so the browser chrome and the PWA splash
// match the page. Ember is the accent and belongs in the mark, not the chrome.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KM.BBQ Korean BBQ, Oceanside",
    short_name: "KM.BBQ",
    description:
      "All-you-can-eat, self-serve Korean BBQ grilled at your table in Oceanside, CA.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF4EC",
    theme_color: "#FAF4EC",
    // The "any" icons are the full badge on transparency. The maskable one is
    // a separate file, inset to the 20% safe zone over cream: Android crops
    // maskable icons to an arbitrary shape, and the full-bleed disc would lose
    // its rim. Pointing both purposes at one file, as this did before, gets the
    // mark shaved on every device that actually applies a mask.
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
