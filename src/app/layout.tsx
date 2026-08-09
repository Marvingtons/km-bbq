import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { SITE_URL, BUSINESS, ADDRESS_PARTS } from "@/data/info";

// The display face. Variable Archivo with the width axis loaded, so the type
// recipes in globals.css can sit at wght 900 / wdth 87.5% — a heavy condensed
// price-board grotesk. See REDESIGN-CONFLICTS.md #3 for why not Anton or
// Archivo Black (both ship a single 400 face) and why "Archivo Expanded" is not
// a family you can import.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KM.BBQ | All-You-Can-Eat Korean BBQ in Oceanside",
    template: "%s | KM.BBQ",
  },
  description:
    "All-you-can-eat, self-serve Korean BBQ grilled at your table in Oceanside, CA. Pick what you like, grill it your way, and eat all you want.",
  applicationName: BUSINESS.name,
  keywords: [
    "Korean BBQ Oceanside",
    "all you can eat Korean BBQ",
    "KBBQ Oceanside",
    "AYCE Korean BBQ",
    "table grill Korean barbecue",
    "KM BBQ",
  ],
  robots: { index: true, follow: true },
  // One source for the tab icon: /icon-192.png, left to the browser to
  // downscale. This replaces the per-size masters (favicon-16/32.png) that
  // tools/build-icons.mjs used to emit — those files are gone, so declaring
  // them here would 404.
  //
  // `apple` is listed explicitly even though src/app/apple-icon.png would
  // normally be found by the file convention: declaring `icons` at all replaces
  // that detection, and without this line the apple-touch-icon <link> silently
  // stops being emitted.
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: { canonical: SITE_URL },
  // Legacy geo meta. Google does not use these, but Bing and some
  // local-directory scrapers still read them, and they are cheap and true.
  // Built from ADDRESS_PARTS so they cannot drift from the PostalAddress in the
  // JSON-LD (src/lib/schema.ts). "US-CA" is the ISO-3166-2 region code.
  other: {
    "geo.placename": ADDRESS_PARTS.city,
    "geo.region": `${ADDRESS_PARTS.country}-${ADDRESS_PARTS.state}`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BUSINESS.name,
    url: SITE_URL,
    title: "KM.BBQ | All-You-Can-Eat Korean BBQ in Oceanside",
    description:
      "Self-serve Korean BBQ grilled at your table in Oceanside, CA. One price, everything included.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "KM.BBQ, all-you-can-eat Korean BBQ in Oceanside, California",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KM.BBQ | All-You-Can-Eat Korean BBQ in Oceanside",
    description:
      "Self-serve Korean BBQ grilled at your table in Oceanside, CA. One price, everything included.",
    images: ["/og.png"],
  },
};

// theme-color matches the page ground (--color-sand). Literal because the
// browser chrome cannot read a CSS custom property.
export const viewport: Viewport = {
  themeColor: "#121110",
};

/**
 * Runs synchronously while the browser parses <head>, BEFORE first paint.
 *
 * The overlay ships visible in the server HTML (`data-preloader="run"` is the
 * SSR default), so a first-time visitor can never see a frame of the hero
 * before the cream field. This script handles the reverse flash: a returning
 * visitor, or anyone on reduced motion, gets `skip` set here — before paint —
 * so they never see the overlay either.
 *
 * Doing this in an effect (or even useLayoutEffect) is too late: both run after
 * hydration, and on a slow connection the browser paints the server HTML long
 * before React loads. See node_modules/next/dist/docs/01-app/02-guides/
 * preventing-flash-before-hydration.md.
 *
 * `preloading` is set here too, not in the effect, so the scroll lock and the
 * hero video's hold-on-frame-one are active from the very first paint.
 */
const PRELOADER_INIT = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem("km-preloader-shown")==="1"||window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-preloader","skip")}else{d.classList.add("preloading")}}catch(e){document.documentElement.setAttribute("data-preloader","skip")}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The SSR default is "run" so the overlay is painted from the first
      // frame; the inline script below flips it to "skip" when appropriate.
      data-preloader="run"
      // The inline script mutates <html> before React hydrates, so the DOM and
      // the server payload legitimately disagree here.
      suppressHydrationWarning
      className={`${archivo.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRELOADER_INIT }} />
        {/* Without JS the script never runs and the overlay would sit there
            forever, so hide it outright. */}
        <noscript>
          <style>{`.preloader-overlay{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full bg-sand text-ink">
        {/* Keyboard skip link — hidden until focused, then a visible flame pill
            at the top-left. Jumps past the nav to the page's main content. */}
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-preloader focus-visible:rounded-pill focus-visible:bg-flame focus-visible:px-5 focus-visible:py-2 focus-visible:font-sans focus-visible:text-sm focus-visible:font-semibold focus-visible:text-ink focus-visible:shadow-pop"
        >
          Skip to content
        </a>
        <Preloader />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
