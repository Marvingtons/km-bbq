import Image from "next/image";
import { Reveal } from "./Reveal";

const PHOTOS = [
  {
    src: "/images/interior.png",
    alt: "Dining room with charcoal grill tables under a hand-painted BBQ mural",
  },
  {
    src: "/images/live-grill.png",
    alt: "Steak and shrimp smoking over live charcoal at the table",
  },
  {
    src: "/images/samgyeopsal-grilling.png",
    alt: "Pork belly slices crisping on the grill",
  },
  {
    src: "/images/banchan-spread.png",
    alt: "Bowls of kimchi, sprouts, and banchan sides",
  },
  {
    src: "/images/mural-left.png",
    alt: "Hand-painted mural of a tiger in sunglasses, a folk drummer, and Korean dishes",
  },
  {
    src: "/images/marbled-wagyu.png",
    alt: "Rolls of marbled wagyu on a black plate",
  },
  {
    src: "/images/outside.png",
    alt: "KM.BBQ storefront with its blue and red sign",
  },
  {
    src: "/images/drinks.png",
    alt: "Cold drinks on the table",
  },
];

export function GalleryRail() {
  return (
    <section id="gallery" className="scroll-mt-20 overflow-hidden bg-brand-cream">
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:pt-24">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-brand-red-deep">
                Gallery
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-brand-ink sm:text-5xl">
                Inside the <span className="text-brand-red">smoke</span>
              </h2>
            </div>
            <p
              aria-hidden="true"
              className="font-display text-sm font-bold uppercase tracking-[0.2em] text-brand-ink/50"
            >
              Scroll →
            </p>
          </div>
        </Reveal>
      </div>

      {/* Free-scrolling rail; edges bleed off-viewport on purpose. */}
      <div className="mt-10 pb-16 lg:pb-24">
        <ul
          role="list"
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-4 sm:px-8 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PHOTOS.map((photo, i) => (
            <li
              key={photo.src}
              className={`relative aspect-square w-72 shrink-0 snap-start overflow-hidden rounded-2xl border-2 border-brand-ink sm:w-80 ${
                i % 2 ? "rotate-1" : "-rotate-1"
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="320px"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
