import type { Metadata } from "next";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StickyInfoBar } from "@/components/StickyInfoBar";
import { MenuJumpNav } from "@/components/MenuJumpNav";
import { SeamMotion } from "@/components/SeamMotion";
import { BreadcrumbSchema } from "@/components/RestaurantSchema";
import { PriceBand } from "@/components/PriceBand";
import { Dot } from "@/components/Dot";
import { HOURS, ADDRESS, PHONE, CLOCK_PROMO } from "@/data/info";
import {
  MENU,
  INCLUDED,
  JUMP_TARGETS,
  displayName,
  type MenuItem,
  type MenuCategory,
} from "@/data/menu";
import { pageMeta } from "@/lib/seo";
import { publicFileExists } from "@/lib/imageManifest.generated";

export const metadata: Metadata = pageMeta({
  title: "Full Menu | KM.BBQ Korean BBQ in Oceanside",
  description:
    "The full KM.BBQ spread: beef, pork, chicken, seafood, banchan, short ribs and steak. All-you-can-eat, self-serve, and grilled at your table in Oceanside, CA.",
  path: "/menu",
  titleAbsolute: true,
});

const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

// Every item carries its expected image path, but a photo may not have been
// shot yet. The answer comes from a manifest generated at build time, because
// the Cloudflare Workers runtime has no filesystem.
const imageExists = publicFileExists;

function ItemMedia({ item }: { item: MenuItem }) {
  if (item.image && imageExists(item.image)) {
    return (
      <div className="photo relative mb-4 aspect-[16/9] w-full">
        <Image
          src={item.image}
          alt={displayName(item)}
          fill
          className="object-cover"
          sizes={IMAGE_SIZES}
        />
      </div>
    );
  }

  /* NEEDS ASSET: this dish has no photograph on disk. See NEEDS-ASSETS.md #5.
     A lettered plate rather than a broken frame, and deliberately plain — it
     should read as "not shot yet", not as a design flourish. */
  return (
    <div
      aria-hidden="true"
      className="mb-4 flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-card border border-char-3 bg-char"
    >
      <span className="select-none font-display text-2xl font-black text-char-3 [font-stretch:87.5%]">
        {item.name.charAt(0)}
      </span>
    </div>
  );
}

function ItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="group flex h-full flex-col rounded-card border border-char-3 bg-char-2 p-5 transition-colors duration-[var(--dur-base)] ease-house hover:border-flame/40">
      <ItemMedia item={item} />
      <h3 className="card-title">
        {item.name}
        {item.english && (
          <span className="text-smoke"> — {item.english}</span>
        )}
      </h3>
      {item.hangul && (
        <p className="mt-1 font-sans text-xs text-smoke">{item.hangul}</p>
      )}
      <p className="copy mt-2">{item.desc}</p>
    </div>
  );
}

function CategorySection({ category }: { category: MenuCategory }) {
  return (
    <section id={category.id} className="mt-16 scroll-mt-32 first:mt-0">
      <div className="mb-7 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-char-3 pb-4">
        <h2 className="h2-scale">{category.name}</h2>
        {category.hangul && (
          <span className="font-sans text-sm text-smoke">{category.hangul}</span>
        )}
        {category.tag && <span className="eyebrow ml-auto text-ember">{category.tag}</span>}
      </div>
      {category.blurb && <p className="copy measure -mt-3 mb-7">{category.blurb}</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default function MenuPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", path: "/" },
          { name: "Menu", path: "/menu" },
        ]}
      />
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="grain isolate bg-char focus:outline-none"
      >
        <section className="pt-32 pb-12 sm:pt-36 lg:pt-40">
          <div className="grid-page">
            <div className="col-text">
              <p className="eyebrow text-ember">
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
              <p className="font-sans text-xs text-smoke">
                Walk-in only <Dot char="·" /> No reservations needed
              </p>
              <p className="font-sans text-xs text-smoke">
                Stop our clock at exactly{" "}
                <span className="font-semibold text-flame">
                  {CLOCK_PROMO.target} seconds
                </span>{" "}
                and your next barbecue is free.
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
                      i < INCLUDED.length - 1 ? "mr-5 border-r border-char-3" : ""
                    }`}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <MenuJumpNav targets={JUMP_TARGETS} />

        <div className="grid-page pt-12 pb-20">
          <div className="col-full">
            <p className="copy measure mb-10">
              Everything is included in the all-you-can-eat price. No per-item
              charges.
            </p>

            {MENU.map((category) => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        </div>

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
                <h3 className="eyebrow">Walk-In</h3>
                <p className="copy mt-4">
                  No reservations
                  <br />
                  <a
                    href={PHONE.href}
                    className="inline-flex min-h-11 items-center font-semibold text-ember transition-colors duration-[var(--dur-base)] ease-house hover:text-flame"
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
