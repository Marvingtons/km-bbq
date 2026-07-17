import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats. next/image already resizes the source photos to the
    // requested dimensions; AVIF/WebP then cut the delivered bytes well below
    // the large source PNGs (which never reach the browser at full size).
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
