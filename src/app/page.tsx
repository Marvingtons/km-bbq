import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Challenge } from "@/components/Challenge";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { RestaurantSchema } from "@/components/RestaurantSchema";
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
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <Hero />
        <About />
        <Gallery />
        <Challenge />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
