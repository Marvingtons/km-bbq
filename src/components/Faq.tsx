"use client";

import { useRef } from "react";
import { FAQS } from "@/data/faq";
import { RESERVATION_URL } from "@/data/info";
import { useReveal } from "@/lib/reveal";

/* ===========================================================================
   THE QUESTIONS, ON THE PAGE.

   It sits between Contact and the game: a visitor who has read the hours and
   the address is one question away from deciding, and this is where those
   questions land. Everything it renders comes from src/data/faq.ts, which the
   JSON-LD `FAQPage` node also reads — the marked-up answer and the visible
   answer are the same string by construction, which is what the FAQ rich-result
   guidelines require rather than merely recommend.

   PLAIN <dl>, NOT AN ACCORDION. An accordion would hide seven of eight answers
   behind a click, and the whole point of this block — for a reader and for a
   crawler — is that the answers are visible. It is also one fewer piece of
   state on a page that already carries a pinned scrub and a service toggle.

   Two columns above 768 because eight short answers in one column is a long
   scroll for information nobody came here to read end to end.
   =========================================================================== */

export function Faq() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      ref={ref}
      id="faq"
      aria-labelledby="faq-heading"
      className="grain relative bg-sand pb-section md:pb-section-lg"
    >
      <div className="grid-page">
        <div className="col-text mb-10" data-reveal-group>
          <p className="eyebrow" data-reveal>
            Before you come
          </p>
          <h2 id="faq-heading" className="h2-scale mt-4" data-reveal>
            Common questions
          </h2>
          <span
            aria-hidden="true"
            className="mt-5 block h-0.5 w-16 bg-steel"
            data-reveal="rule"
          />
        </div>

        <div className="col-full" data-reveal-group>
          <dl className="grid gap-x-12 gap-y-7 md:grid-cols-2">
            {FAQS.map(({ q, a }) => (
              <div key={q} data-reveal>
                <dt className="card-title">{q}</dt>
                <dd className="copy mt-2">
                  {/* The reservations answer is the one with an action behind
                      it, so it carries the link rather than making the reader
                      go looking for the one in the footer. The SCHEMA answer
                      stays plain text — see data/faq.ts. */}
                  {/Reservations are booked through Yelp/.test(a) ? (
                    <>
                      Yes. Reservations are booked through{" "}
                      <a
                        href={RESERVATION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-flame underline-offset-4 hover:underline"
                      >
                        Yelp
                      </a>
                      , and there is a link on this page and in the footer.
                    </>
                  ) : (
                    a
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
