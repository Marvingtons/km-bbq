import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PillLink } from "@/components/PillLink";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="grain flex min-h-screen flex-col justify-center bg-cream py-32 focus:outline-none"
      >
        <div className="grid-page">
          <div className="col-text">
            <p className="eyebrow mb-4">Page not found</p>
            <h1 className="h2-scale">This table isn&rsquo;t set.</h1>
            <p className="copy measure mt-5">
              The page you were after moved or never existed. Let&rsquo;s get
              you back to the good stuff.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <PillLink href="/">Back home</PillLink>
              <PillLink href="/menu" arrow>
                See the menu
              </PillLink>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
