import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PickYourFire } from "@/components/PickYourFire";
import { Favorites } from "@/components/Favorites";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Challenge } from "@/components/Challenge";
import { Contact } from "@/components/Contact";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { StickyInfoBar } from "@/components/StickyInfoBar";
import { RestaurantSchema } from "@/components/RestaurantSchema";
import { SeamMotion } from "@/components/SeamMotion";
import { pageMeta } from "@/lib/seo";

/**
 * TITLE AND DESCRIPTION LEAD WITH THE OFFER.
 *
 * The description was a sentence about self-serve grilling — true, and the
 * last thing a searcher scanning a results page is deciding on. Price and
 * category first, then the differentiator, then the action. 143 characters,
 * inside the ~160 Google renders.
 */
export const metadata: Metadata = pageMeta({
  title: "KM.BBQ — All You Can Eat Korean BBQ in Oceanside, CA",
  description:
    "All-you-can-eat Korean BBQ in Oceanside. $21.99 lunch, $30.99 dinner. Gas or charcoal grills at every table. Walk in or reserve.",
  path: "/",
  titleAbsolute: true,
});

export default function Home() {
  return (
    <>
      <RestaurantSchema />
      <Navbar />
      {/* pb on mobile only: the sticky bar is a full-width fixed strip at the
          bottom of the viewport under `md`, so the last thing on the page needs
          room to clear it. Bar height (~76px incl. safe-area) + 24px. From `md`
          the bar is a floating cluster bottom-right with nothing beneath it, so
          the reserve is dropped rather than left as dead space. */}
      <main
        id="main-content"
        tabIndex={-1}
        className="relative isolate pb-[100px] focus:outline-none md:pb-0"
      >
        <Hero />
        {/* STRAIGHT TO THE GRILL. The hero's own clip narrows, passes through a
            rounded panel and opens into the circle that IS the grill — so what
            the page shows you first, after the price, is the thing you came to
            do. There is no "about panel" beat to sit through on the way. */}
        <PickYourFire />
        {/* Then what to order. */}
        <Favorites />
        {/* And only then who we are. Our Story used to open the page beside the
            morph and lost every time; it reads here, where the reader has had
            the mechanism and the food and is willing to be told. It keeps
            `id="about"`, so the nav's ABOUT link means this copy. */}
        <About />
        <Gallery />
        {/* Visit before the game. The address and the hours are the conversion
            for a walk-in-only restaurant, and they used to sit BEHIND a
            stopwatch that tells you it does not count. The game is dessert. */}
        <Contact />
        {/* The questions land between the address and the game: a reader who
            has just read the hours is one question from deciding, and the game
            is the beat after the decision. Its answers are also the page's
            FAQPage schema — see data/faq.ts, which both read. */}
        <Faq />
        <Challenge />
        {/* Scroll-driven transitions across every section boundary. */}
        <SeamMotion />
      </main>
      <Footer />
      <StickyInfoBar />
    </>
  );
}
