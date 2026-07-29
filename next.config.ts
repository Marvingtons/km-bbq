import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required by @opennextjs/cloudflare: it bundles the Worker out of
  // .next/standalone. Turbopack emits this on its own, the webpack builder does
  // not, and we build with webpack (see the `build` script in package.json).
  output: "standalone",

  images: {
    // Serve modern formats. next/image already resizes the source photos to the
    // requested dimensions; AVIF/WebP then cut the delivered bytes well below
    // the large source PNGs (which never reach the browser at full size).
    //
    // On Cloudflare the resizing is done by the Images binding declared in
    // wrangler.jsonc, not by sharp (which cannot run on Workers). The binding
    // honours these formats, so the delivered bytes are the same either way.
    // See DEPLOY.md ("Images") before switching this to `unoptimized`.
    formats: ["image/avif", "image/webp"],

    // Next 16 changed this default from "any quality" to exactly [75], and a
    // `quality` prop outside the list is silently coerced to the nearest
    // allowed value rather than warning. 60 is here for one image: the hero
    // poster, which is the page's LCP element and spends its entire life under
    // a 55% cream scrim, so compression artefacts at that level are not
    // visible. Everything else stays on 75.
    qualities: [60, 75],
  },
};

export default nextConfig;
