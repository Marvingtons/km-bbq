import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Challenge } from "@/components/Challenge";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { SeamMotion } from "@/components/SeamMotion";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <Hero />
        <About />
        <Gallery />
        <Challenge />
        <Contact />
        {/* Scroll-driven transitions across every section boundary. */}
        <SeamMotion />
      </main>
      <Footer />
    </>
  );
}
