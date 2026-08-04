import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { PickYourFire } from "@/components/PickYourFire";
import { Gallery } from "@/components/Gallery";
import { Challenge } from "@/components/Challenge";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { StickyInfoBar } from "@/components/StickyInfoBar";
import { RestaurantSchema } from "@/components/RestaurantSchema";
import { SeamMotion } from "@/components/SeamMotion";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "KM.BBQ | All-You-Can-Eat Korean BBQ in Oceanside",
  description:
    "All-you-can-eat, self-serve Korean BBQ grilled at your table in Oceanside, CA. Pick what you like, grill it your way, and eat all you want. Walk-ins welcome.",
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
        <About />
        {/* The one thing a photograph cannot show: the grill is built into the
            table, and it can be gas or charcoal. It sits here because About
            already says exactly that in a single clause — this is that clause
            given a diagram and a reason to care. */}
        <PickYourFire />
        <Gallery />
        {/* Visit before the game. The address and the hours are the conversion
            for a walk-in-only restaurant, and they used to sit BEHIND a
            stopwatch that tells you it does not count. The game is dessert. */}
        <Contact />
        <Challenge />
        {/* Scroll-driven transitions across every section boundary. */}
        <SeamMotion />
      </main>
      <Footer />
      <StickyInfoBar />
    </>
  );
}
