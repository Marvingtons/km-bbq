import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StickyInfoBar } from "@/components/StickyInfoBar";
import { SeamMotion } from "@/components/SeamMotion";
import { MenuSchema } from "@/components/RestaurantSchema";
import { PriceBand } from "@/components/PriceBand";
import { Dot } from "@/components/Dot";
import { MenuBoard } from "./MenuBoard";
import {
  HOURS,
  ADDRESS,
  PHONE,
  CLOCK_PROMO,
  RESERVATION_URL,
  WALK_IN_LINE,
} from "@/data/info";
import { INCLUDED } from "@/data/menu";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  // A COMMA, not an em dash and not a second pipe: the pipe already separates
  // the page from the brand, so what follows the brand is an appositive.
  title: "Menu | KM.BBQ, AYCE Korean BBQ Oceanside",
  // "self-serve" appears ONCE, in the category phrase. The counts and the
  // prices are what this page is for; the format is context.
  description:
    "The full self-serve all-you-can-eat menu: 33 core items, 10 Premium cuts, and 3 dinner-only Signature cuts. $21.99 lunch, $30.99 dinner.",
  path: "/menu",
  titleAbsolute: true,
});

/* THERE IS NO ItemCard IN THIS FILE ANY MORE, and no <Image>.
   The item display moved to ./MenuBoard.tsx, which is a client component
   because the lunch/dinner toggle is stateful and its default is the visitor's
   own clock. The per-item photographs are gone entirely — see the header note
   in MenuBoard.tsx for why that is a provenance fix rather than a restyle. */

export default function MenuPage() {
  return (
    <>
      {/* The whole menu as structured data, generated from data/menu.ts — the
          same 46 records the page prints. */}
      <MenuSchema
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Menu", path: "/menu" },
        ]}
      />
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="grain isolate bg-sand focus:outline-none"
      >
        <section className="pt-32 pb-12 sm:pt-36 lg:pt-40">
          <div className="grid-page">
            <div className="col-text">
              <p className="eyebrow">
                All-You-Can-Eat <Dot char="·" /> Self-Serve <Dot char="·" />{" "}
                Grill Your Own
              </p>
              <h1 className="h2-scale mt-4">The Full Spread</h1>
              <p className="copy measure mt-5">
                Pick whatever you like, grill it your way at your table, and eat
                all you want. One price, everything included.
              </p>
            </div>

            {/* The one price band, shared with the homepage. */}
            <div className="col-full mt-9">
              <PriceBand />
            </div>

            <div className="col-text mt-6 space-y-2">
              <p className="font-sans text-xs text-ash">
                {WALK_IN_LINE}{" "}
                <a
                  href={RESERVATION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-flame underline-offset-4 hover:underline"
                >
                  Reserve a table →
                </a>
              </p>
              <p className="font-sans text-xs text-ash">
                Stop our clock at exactly{" "}
                <span className="font-semibold text-flame">
                  {CLOCK_PROMO.target} seconds
                </span>{" "}
                and your all-you-can-eat is free. Yours, not the table&apos;s.
              </p>
            </div>
          </div>
        </section>

        {/* Included strip — hairline dividers, no box */}
        <section className="pb-4">
          <div className="grid-page">
            <div className="col-full">
              <p className="eyebrow mb-4">Included with every meal</p>
              <ul className="flex flex-wrap items-center" role="list">
                {INCLUDED.map((label, i) => (
                  <li
                    key={label}
                    className={`copy py-1 pr-5 ${
                      i < INCLUDED.length - 1 ? "mr-5 border-r border-sand-3" : ""
                    }`}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <MenuBoard />

        <section className="relative py-section md:py-section-lg">
          <div className="grid-page">
            <div className="col-text">
              <h2 className="h2-scale">Come Hungry</h2>
            </div>
            <div className="col-full mt-12 grid gap-10 sm:grid-cols-3">
              <div>
                <h3 className="eyebrow">Hours</h3>
                <p className="copy mt-4">
                  {HOURS.map(({ short, time }, i) => (
                    <span key={short}>
                      {short} {time}
                      {i < HOURS.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
              <div>
                <h3 className="eyebrow">Location</h3>
                <p className="copy mt-4">
                  {ADDRESS.street}
                  <br />
                  {ADDRESS.region}
                </p>
              </div>
              <div>
                <h3 className="eyebrow">Walk in or book</h3>
                <p className="copy mt-4">
                  {WALK_IN_LINE}
                  <br />
                  <a
                    href={PHONE.href}
                    className="inline-flex min-h-11 items-center font-semibold text-flame transition-colors duration-[var(--dur-base)] ease-house hover:text-flame"
                  >
                    {PHONE.display}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Calm mode: background continuity only. The dense list gets no
            parallax and no overlap handoffs. */}
        <SeamMotion calm />
      </main>
      <Footer />
      <StickyInfoBar />
    </>
  );
}
