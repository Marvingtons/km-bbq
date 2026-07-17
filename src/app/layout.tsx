import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";
import { SITE_URL, BUSINESS } from "@/lib/restaurant";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "KM.BBQ | All-You-Can-Eat Korean BBQ in Oceanside",
    template: "%s | KM.BBQ",
  },
  description:
    "All-you-can-eat, self-serve Korean BBQ grilled over live charcoal in Oceanside, CA. Pick what you like, grill it your way, and eat all you want.",
  applicationName: BUSINESS.name,
  keywords: [
    "Korean BBQ Oceanside",
    "all you can eat Korean BBQ",
    "KBBQ Oceanside",
    "AYCE Korean BBQ",
    "charcoal grill Korean barbecue",
    "KM BBQ",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: BUSINESS.name,
    url: SITE_URL,
    title: "KM.BBQ | All-You-Can-Eat Korean BBQ in Oceanside",
    description:
      "Self-serve Korean BBQ grilled over live charcoal in Oceanside, CA. One price, everything included.",
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
      "Self-serve Korean BBQ grilled over live charcoal in Oceanside, CA. One price, everything included.",
    images: ["/og.png"],
  },
};

// theme-color matches the site's cream surface (browser chrome / address bar),
// not a leftover dark value.
export const viewport: Viewport = {
  themeColor: "#FAF4EC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-foreground">
        {/* Keyboard skip link — hidden until focused, then a visible ember pill
            at the top-left. Jumps past the nav to the page's main content. */}
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[300] focus-visible:rounded-full focus-visible:bg-ember-deep focus-visible:px-5 focus-visible:py-2 focus-visible:font-sans focus-visible:text-sm focus-visible:font-medium focus-visible:text-white focus-visible:shadow-warm-lg"
        >
          Skip to content
        </a>
        <Preloader />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
