"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PillLink } from "./PillLink";
import { FEATURED, displayName } from "@/data/menu";
import { useReveal } from "@/lib/reveal";

/* ===========================================================================
   WHAT TO GRILL FIRST — the menu preview.

   It was the third beat of a combined About section and is its own section
   now, because the page order changed under it: the grill sequence opens the
   page, this answers "so what do I order", and Our Story comes after both. It
   was never anything but a self-contained block; the only thing the split cost
   was a wrapper div.

   THE CARDS ARE NOT A SECOND COPY OF THE MENU. `FEATURED` in src/data/menu.ts
   resolves five ids into the real records at module load and throws on a bad
   one, so a card here cannot show a name, a photo or a description that /menu
   does not — and every card links to the anchor of the category the dish
   actually lives in. Galbi says Premium because Galbi IS in Premium.
   =========================================================================== */

export function Favorites() {
  const sectionRef = useRef<HTMLElement>(null);

  // Two groups: the header cadence, then the cards. Both through the shared
  // system — this used to be two hand-written gsap.from blocks with their own
  // triggers and their own stagger.
  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="menu-heading"
      /* A DARK BAND. `.section-dark` carries the ground, the block padding and
         the token remap; nothing below this line changed to get here. The five
         cards say `border-sand-3 bg-sand-2` exactly as they did on cream and
         resolve to char-2 on a sand-25% hairline, which is what puts food
         photography on charcoal without a second copy of the card.

         No `py-*` here any more: the band owns its own padding, and a utility
         would beat it. */
      className="favorites section-dark grain relative z-base"
    >
      <div className="grid-page">
        <div className="col-full">
          <div className="favorites-head" data-reveal-group>
            <p className="eyebrow" data-reveal>
              House favorites
            </p>
            <h2 id="menu-heading" className="h2-scale mt-4" data-reveal>
              What to grill first
            </h2>
            <span
              aria-hidden="true"
              className="mt-5 block h-0.5 w-16 bg-steel"
              data-reveal="rule"
            />
            {/* "grab", not "order", and "at the bar", not "on the menu" — the
                same self-serve correction the hero and Our Story take. */}
            <p className="copy measure mt-6" data-reveal>
              Five of the ones people grab again and again. Everything at the
              bar is the same price.
            </p>
          </div>

          {/* Galbi anchors the left half at full height; the other four form
              an equal 2x2 on the right. Tablets collapse to two columns with
              Galbi full-width on top; phones stack single-file, Galbi first. */}
          {/* 0.1s between cards rather than the site's 0.08 — these are the
              largest objects on the page and the feature card is twice the
              others, so the extra 20ms lets each one land before the next
              starts. DOM order is feature-first, which is also the reveal
              order. */}
          <div
            className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7"
            data-reveal-group
            data-reveal-stagger="0.1"
          >
            {FEATURED.map(({ item, category, href }, i) => {
              const isFeature = i === 0;
              // Spans of the CARD grid directly above, not of the page's
              // 12-column track. The rule that bans raw col-span-* is about
              // `.grid-page`; a component's own grid is allowed its own spans.
              const span = isFeature ? "sm:col-span-2 lg:row-span-2" : "";
              return (
                <Link
                  key={item.id}
                  href={href}
                  data-reveal="image"
                  className={`grill-dish group flex h-full flex-col overflow-hidden rounded-card border border-sand-3 bg-sand-2 p-5 text-left transition-colors duration-[var(--dur-base)] ease-house hover:border-flame/50 ${span}`}
                >
                  <div
                    className={`photo relative w-full ${
                      isFeature
                        ? "aspect-[16/9] lg:aspect-auto lg:min-h-0 lg:flex-1"
                        : "aspect-[16/9] lg:aspect-[2/1]"
                    }`}
                  >
                    <Image
                      src={item.image!}
                      alt={displayName(item).replace(/^(.+) — \1$/, "$1").replace(" — ", ", ")}
                      fill
                      className="object-cover transition-transform duration-[var(--dur-slow)] ease-house group-hover:scale-[1.04]"
                      sizes={
                        isFeature
                          ? "(max-width: 639px) calc(100vw - 80px), (max-width: 1023px) calc(100vw - 48px), 560px"
                          : "(max-width: 639px) calc(100vw - 80px), (max-width: 1023px) 45vw, 248px"
                      }
                    />
                  </div>
                  {/* The category, and it is a real anchor on /menu — not a
                      badge naming a section that does not exist. */}
                  <p className="eyebrow mt-4">{category.name}</p>
                  {/* THE SAME STRING /menu RENDERS, and it is built by the same
                      function (`displayName`) rather than re-assembled here —
                      "Bulgogi — Marinated Ribeye" survived on this card for a
                      while after /menu had stopped saying it, because the two
                      were two pieces of JSX reading two fields.

                      The printed item number rides along, because it is what a
                      reader carries to the table: they see it here, they say it
                      to the server. */}
                  <h3 className="card-title mt-1">
                    {item.korean &&
                    item.korean.toLowerCase() !== item.name.toLowerCase() ? (
                      <>
                        {item.korean}{" "}
                        <span className="mt-0.5 block text-[0.82em] text-ash">
                          {item.name} · {item.num}
                        </span>
                      </>
                    ) : (
                      <>
                        {item.name}
                        <span className="text-ash"> · {item.num}</span>
                      </>
                    )}
                  </h3>
                  {item.hangul && (
                    <p className="mt-1 font-sans text-xs text-ash">
                      {item.hangul}
                    </p>
                  )}
                  {item.desc && <p className="copy mt-2">{item.desc}</p>}
                </Link>
              );
            })}
          </div>

          {/* `display: contents` is not an option for the reveal target — a
              contents box has no layout, so there is nothing to transform. A
              real wrapper it is. */}
          <div className="grill-cta mt-10 lg:mt-12" data-reveal-group>
            <div className="flex" data-reveal>
              <PillLink href="/menu" tone="outline" arrow>
                See the menu
              </PillLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
