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
        className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 py-32 text-center focus:outline-none"
      >
        <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
          Page not found
        </p>
        <h1 className="font-serif text-4xl font-light text-foreground md:text-5xl">
          This table isn&rsquo;t set.
        </h1>
        <p className="mx-auto mt-5 max-w-md font-sans text-base font-light leading-relaxed text-foreground/60">
          The page you were after moved or never existed. Let&rsquo;s get you
          back to the good stuff.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <PillLink href="/">Back home</PillLink>
          <PillLink href="/menu" arrow>
            See the menu
          </PillLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
