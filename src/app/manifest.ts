import type { MetadataRoute } from "next";

// theme_color / background_color use the site's cream surface, not a leftover
// dark value, so the browser chrome matches the page.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KM.BBQ Korean BBQ",
    short_name: "KM.BBQ",
    description:
      "All-you-can-eat, self-serve Korean BBQ grilled at your table in Oceanside, CA.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF4EC",
    theme_color: "#FAF4EC",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
