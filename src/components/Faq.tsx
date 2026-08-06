"use client";

import { useId, useRef, useState } from "react";
import { FAQS } from "@/data/faq";
import { RESERVATION_URL } from "@/data/info";
import { useReveal } from "@/lib/reveal";

/* ===========================================================================
   THE QUESTIONS, AS AN ACCORDION.

   It closes the page after the game: a visitor who has read the menu, the
   story and the hours is one question from deciding, and this is where those
   questions land. Everything it renders comes from src/data/faq.ts, which the
   JSON-LD `FAQPage` node also reads — the marked-up answer and the visible
   answer are the same string by construction, which is what the FAQ
   rich-result guidelines require rather than merely recommend.

   THE ANSWERS ARE ALWAYS IN THE DOM. Collapsed rows are hidden by CSS
   (a zero-height grid row), never by a conditional render. Two reasons and
   both are hard requirements:

     1. Marking up an answer that is not in the page is the one thing the FAQ
        guidelines prohibit outright. A conditionally-rendered answer is not in
        the server payload, so the schema would be describing text a crawler
        cannot find.
     2. In-page find (Ctrl+F) and a crawler's text extraction both read the
        DOM. An accordion that unmounts its content is a page whose text
        disappears when you close it.

   `grid-template-rows: 0fr -> 1fr` IS THE ANIMATION. It is the only way to
   transition to a content-driven height in CSS — `height: auto` is not an
   animatable value, and the alternatives are measuring the panel in JS on
   every resize or hard-coding a max-height that clips the longest answer the
   first time someone edits it. The inner element carries `overflow: hidden`
   so the text is clipped rather than spilling while the row is short.

   MULTIPLE ROWS MAY BE OPEN. This is reference material, not a wizard: a
   visitor comparing "how much" against "what is included" should not have the
   first one close when they open the second.
   =========================================================================== */

function Plus({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      /* `.faq-plus` is the hook the dark band uses to take this to sand. On
         char the accent measures 3.19:1, which clears the 3:1 a graphical
         object needs — so this is a legibility preference rather than a fix,
         and it is the one thing on a band that steps off the accent. */
      className={`faq-plus relative ml-4 grid size-6 shrink-0 place-items-center text-flame transition-[transform,color] duration-[var(--dur-base)] ease-house motion-reduce:transition-none ${
        open ? "rotate-45" : "rotate-0"
      }`}
    >
      {/* Two rules rather than a glyph, so the 45° turn lands exactly on an ×
          and the stroke weight matches the rules between the rows. */}
      <span className="absolute h-px w-4 bg-current" />
      <span className="absolute h-4 w-px bg-current" />
    </span>
  );
}

/**
 * The reservations answer is the one with an action behind it, so on the page
 * it carries the link. The SCHEMA answer stays plain text — see data/faq.ts.
 * Split here rather than storing markup in the data.
 */
function Answer({ text }: { text: string }) {
  if (!/Reservations are booked through Yelp/.test(text)) return <>{text}</>;
  return (
    <>
      Yes. Reservations are booked through{" "}
      {/* SAND TYPE, FLAME UNDERLINE — and that swap is required, not
          preferred. This section is a dark band now, and the accent measures
          3.19:1 as text on char: it fails AA outright. DIRECTION.md settles
          what to do about it ("the accent is text only on the warm ground; on
          the black structure it appears as a FILL, and links on those grounds
          are sand"), so the label takes `text-ink` — which the band remaps to
          sand, 15.8:1 — and the accent moves to the underline, where it is a
          fill and has no such limit. Through the token rather than hardcoded,
          so this link is still correct if the section is ever cream again.

          The underline is permanent rather than on hover, because colour alone
          can no longer distinguish this link from the sentence around it —
          which is the whole reason the rule exists. Hover thickens it to sand
          instead of adding it. */}
      <a
        href={RESERVATION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-ink underline decoration-flame decoration-2 underline-offset-4 transition-colors duration-[var(--dur-base)] ease-house hover:decoration-ink"
      >
        Yelp
      </a>
      , and there is a link on this page and in the footer.
    </>
  );
}

function Row({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  return (
    <div className="border-b border-sand-3" data-reveal>
      <h3>
        {/* A real <button> inside the heading: the heading carries the outline
            structure, the button carries the interaction. `aria-expanded` and
            `aria-controls` are what make it an accordion rather than a div
            that happens to toggle; Enter and Space come free with the element,
            which is the other half of why this is not a div. */}
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          /* THE HOVER MOVED OFF THE QUESTION AND ONTO THE PLUS.
             It was `hover:text-flame` on the whole row, which took the
             question text to the accent. On this section's dark ground the
             accent is 3.19:1 as text: hovering a legible question made it
             illegible, and it is a nine-row list so it would have happened
             constantly. The row is `group` now and the plus carries the
             response instead — the accent as a small graphical object, which
             is the one thing it is allowed to be on char, and it puts the
             accent back on the interaction after `.faq-plus` took the resting
             state to sand. The question stays at 15.8:1 throughout. */
          className="group flex w-full items-start justify-between gap-4 py-5 text-left"
        >
          {/* `.card-title` SETS ITS OWN COLOUR, and taking that away here is
              what made every question on the band invisible.

              It was `card-title text-inherit`, which existed so the row's
              `hover:text-flame` could reach the text. The catch is that CSS
              inherits a COMPUTED value, not the `var()` that produced it: the
              button inherits `color` from <body>, which resolved
              --color-ink against `:root` long before this section overrode it
              — so nine questions rendered in near-black on a near-black
              ground while the heading two inches above them, which names the
              token itself, came out correctly in sand.

              The hover it was serving has moved to the plus (see the button),
              so the class has no job left. Anything that needs a band's ink
              must NAME the token; `inherit` reaches past the override. */}
          <span className="card-title">{q}</span>
          <Plus open={open} />
        </button>
      </h3>

      {/* THE PANEL IS ALWAYS RENDERED. `grid-template-rows` carries the
          animation; the inner div clips. `hidden` is deliberately NOT used —
          it would take the text out of find-in-page and out of the accessible
          tree even when the row is open mid-transition. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-[grid-template-rows] duration-[var(--dur-base)] ease-house motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        {/* THE CLIP IS THE ONLY THING HIDING THE TEXT. No `visibility: hidden`
            and no `hidden` attribute: both would take the answer out of
            find-in-page, and an FAQ whose text cannot be searched is a worse
            failure than a screen reader reaching a collapsed answer in browse
            mode. `aria-expanded` on the button is what carries the state. */}
        <div className="overflow-hidden">
          <p className="copy pb-5 pr-10">
            <Answer text={a} />
          </p>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref);

  return (
    <section
      ref={ref}
      id="faq"
      aria-labelledby="faq-heading"
      /* A DARK BAND. It had no block padding at all — a `<SectionDivider />`
         sat on each side and owned the rest between the game, the questions and
         the storefront. Both are gone and `.section-dark` carries the padding
         now, along with the ground and the token remap: bone questions (the
         `.card-title` inside each button resolves --color-ink), muted answers
         (`.copy` resolves --color-ash), sand-25% rules, and the plus in sand
         via `.faq-plus`. */
      className="section-dark grain relative"
    >
      <div className="grid-page">
        <div className="col-full mb-10 text-center" data-reveal-group>
          <p className="eyebrow" data-reveal>
            Before you come
          </p>
          <h2 id="faq-heading" className="h2-scale mt-4" data-reveal>
            Common questions
          </h2>
          <span
            aria-hidden="true"
            className="mx-auto mt-5 block h-0.5 w-16 bg-steel"
            data-reveal="rule"
          />
        </div>

        {/* 52rem and centred: an accordion row is a full-width click target,
            and a full-width click target on a 1280 track is a 1200px line of
            hairline with a question at one end and a plus at the other. */}
        {/* 0.06 rather than the site's 0.08. Nine rows of identical hairline
            geometry read as a LIST assembling, not as nine separate arrivals,
            and at the default stagger the last row lands more than half a
            second after the first. Tight enough to be one gesture; wide enough
            that the eye still travels down it. */}
        <div
          className="col-full mx-auto w-full max-w-[52rem]"
          data-reveal-group
          data-reveal-stagger="0.06"
        >
          {/* `border-sand-3`, not `border-char/30`, and the same on every row.
              sand-3's job in the token sheet is literally "borders, dividers",
              so it is the token that a ground change is entitled to move: the
              band remaps it to sand at 25%, which measures 2.07:1 on char and
              is the exact mirror of what char/30 measured on cream. Hardcoding
              char/30 here would have drawn a black hairline on a black
              ground. */}
          <div className="border-t border-sand-3">
            {FAQS.map(({ q, a }) => (
              <Row key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
