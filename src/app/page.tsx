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
 * TITLE AND DESCRIPTION LEAD WITH THE LOCATION KEYWORD, THEN THE OFFER.
 *
 * "Korean BBQ in Oceanside, CA" is first in both. It is the phrase a local
 * searcher types, and the earliest words in a title carry the most weight on a
 * results page. The format and the price follow immediately: "self-serve" and
 * "all-you-can-eat" are how someone describes this when they do not know the
 * restaurant's name ("KBBQ buffet", "self serve korean bbq"), and the two
 * prices are the offer.
 *
 * The description is 137 characters, inside the ~160 Google renders. The Open
 * Graph and Twitter titles and descriptions are these same strings — `pageMeta`
 * passes one value to each, so they cannot drift.
 */
export const metadata: Metadata = pageMeta({
  // KEYWORD-FIRST, then brand, then offer. A PIPE, NOT AN EM DASH: the sweep's
  // final rule leaves `—` only as the menu item name separator, and a <title>
  // is copy a searcher reads. A pipe is the conventional title delimiter and is
  // what /menu already leads with, so the two titles use one separator.
  title: "Korean BBQ in Oceanside, CA | KM.BBQ All-You-Can-Eat",
  description:
    // "weekday lunch", not "lunch". A snippet is read out of context and acted
    // on: an unqualified $21.99 in a Saturday search result is a promise the
    // door cannot keep. 137 characters, inside the ~160 Google renders. The OG
    // and Twitter descriptions are this same string.
    "Korean BBQ in Oceanside, CA. Self-serve all-you-can-eat: $21.99 weekday lunch, $30.99 dinner. Grill it at your table. Walk in or reserve.",
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
        {/* THE END OF THE PAGE RUNS GAME -> QUESTIONS -> DOOR.

            Contact used to sit before the game, carrying two cards of hours,
            prices and actions — the reasoning was that the conversion should
            not sit behind a stopwatch that tells you it does not count. That
            held while Contact was the only place those facts lived. It is not
            any more: the footer, the FAQ and the sticky bar each carry them,
            so the section shed the cards and became the storefront photograph.

            What is left is a better closing order. The game is the last thing
            with a reason to hold you. The questions are what you ask once you
            have decided. And the photograph is the last thing you see before
            the footer, which is what you want in your head walking up to a
            strip mall looking for the sign. */}

        {/* THERE ARE NO DIVIDERS ON THIS PAGE, AND THE GROUND IS WHY.

            Three `<SectionDivider />`s used to sit in this run — 96px of clear
            cream, a centred hairline and the grill's slot ring in a break in
            it. They were solving a real problem: the end of the page was three
            flat cream blocks in a row with no scroll device between them, and
            the last of the three has a `sr-only` heading, so a reader leaving
            the FAQ met a photograph with nothing to say the page had moved on.

            The grounds alternate now, so that problem no longer exists
            anywhere. Every boundary on the page is a ground change and the
            change IS the boundary:

              1  Hero            DARK   (photographic; the band it already was)
              2  Pick Your Fire  cream  (the grill morph is built for cream)
              3  Favorites       DARK   (food on charcoal)
              4  About           cream  (the parchment artwork belongs on light)
              5  Gallery         DARK
              6  Challenge       cream  (so the dark PANEL is an object again)
              7  FAQ             DARK
              8  Contact         cream  (calm before the footer)
              9  Footer          DARK   (the last band of the rhythm)

            No two adjacent sections share a ground, and that list is the whole
            home page — there is no tenth section anywhere in this tree. The
            mechanism is one class, `.section-dark`; see globals.css and
            DIRECTION.md amendment A4.

            The game is the reason 6 is cream rather than dark. Its panel is
            char, and on a char band a dark card on a dark ground is a card you
            cannot see. On cream, sandwiched by bands above and below, the same
            panel reads as a deliberate inversion — which is what it is. */}
        <Challenge />
        <Faq />
        <Contact />
        {/* Scroll-driven transitions across every section boundary. */}
        <SeamMotion />
      </main>
      <Footer />
      <StickyInfoBar />
    </>
  );
}
