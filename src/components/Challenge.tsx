"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { REVEAL, useReveal } from "@/lib/reveal";
import { MOTION_OK } from "@/lib/motion";
import { CLOCK_PROMO, PRICING } from "@/data/info";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   THE CLOCK — a flat neon scoreboard.

   THE PREMISE IS REAL AND UNCHANGED. There is a clock and a red button by the
   door, and stopping it dead on 10.00 seconds gets THE PRESSER's all-you-can-eat
   free — one cover, not the table's bill. See CLOCK_PROMO in data/info.ts. The
   brief proposed reframing this as a 90-minute "how much can you clear"
   counter; that would have replaced a promotion the restaurant actually runs
   with one it does not, which Law 1 forbids. So the premise stayed and
   everything around it changed. See REDESIGN-CONFLICTS.md #2.

   WHAT WENT. 499 lines of 2008-iOS skeuomorphism: a moulded housing with a
   three-stop gradient, four fake mount screws, an engraved nameplate, a
   recessed window, a ghost-segment layer at 8% alpha, a separate blur-glow
   layer, a 74/86px glossy red dome built from a five-stop radial of hand-typed
   hex, an elastic overshoot on press, and a twelve-particle flame burst on a
   win. It was the only section on the site with its own physics.

   THE FONT WENT WITH IT. DSEG7Classic-Bold.woff2 was 5,132 bytes of webfont
   bundled to draw ten digits — one extra font request on every page that
   rendered this section — plus a 4,392-byte license file in the repo. The
   display face is already loaded and already variable, and
   `font-variant-numeric: tabular-nums` gives the same fixed advance width that
   kept the readout from jittering as it counts. 5.1 kB off the wire, 9.5 kB
   out of the tree, and no license to carry.

   It is a scoreboard now: a sand-2 panel, a hairline rule, tabular flame digits
   with a neon glow, and a button that looks like a button.
   =========================================================================== */

const TARGET_CS = 1000; // 10.00s, in centiseconds
type Phase = "idle" | "running" | "stopped";

const format = (cs: number) =>
  `${Math.floor(cs / 100)}.${String(cs % 100).padStart(2, "0")}`;

export function Challenge() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  const [phase, setPhase] = useState<Phase>("idle");
  const [cs, setCs] = useState(0);
  /** Is the button down right now? See the note on the button itself. */
  const [held, setHeld] = useState(false);
  const raf = useRef<number | null>(null);
  const startedAt = useRef(0);

  /**
   * THE TEASE. Non-null only while the one-time roll-up is playing; the digits
   * fall back to a static 10.00 either side of it, which is what the server
   * renders and what a reader with JavaScript off or reduced motion on sees.
   */
  const [roll, setRoll] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** Set the instant the button is touched, and never cleared. The roll is a
   *  demonstration of the game; someone already playing it does not need one. */
  const played = useRef(false);

  const stop = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  /* -------------------------------------------------------------------------
     THE DIGITS ROLL UP, ONCE, THE FIRST TIME THE PANEL ARRIVES.

     0.00 to 10.00 in 0.8s on the house curve, so the panel shows you what it
     does before anyone has pressed anything. It is a tease, not a state: the
     tween drives a plain object and React only ever renders the number, so
     there is no animated DOM to unwind and the readout is the same element it
     always was.

     `tabular-nums` on the digits is what makes it legible rather than a jitter
     — every glyph has one advance width, so a counter running through 900
     values does not shuffle the layout under itself.

     Same `MOTION_OK` bracket and the same start as every other entrance on the
     site, so it lands with the panel rather than on its own schedule. Under
     reduced motion the ScrollTrigger is never created and the digits read
     10.00 from first paint.
     ------------------------------------------------------------------------- */
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const proxy = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: REVEAL.start,
          once: true,
          onEnter: () => {
            if (played.current) return;
            setRoll(0);
            gsap.to(proxy, {
              v: TARGET_CS,
              duration: 0.8,
              // Just behind the panel's own entrance, so the card lands and
              // then the machine starts counting.
              delay: 0.25,
              ease: "power2.out",
              onUpdate: () => {
                if (!played.current) setRoll(Math.round(proxy.v));
              },
              // Hand the readout back to its static value. Identical number,
              // so nothing moves at the handover.
              onComplete: () => setRoll(null),
            });
          },
        });
      });

      return () => mm.revert();
    }, el);

    return () => ctx.revert();
  }, []);

  const press = () => {
    played.current = true;
    setRoll(null);
    if (phase === "running") {
      stop();
      setPhase("stopped");
      return;
    }
    setPhase("running");
    setCs(0);
    startedAt.current = performance.now();
    const tick = (now: number) => {
      setCs(Math.floor((now - startedAt.current) / 10));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  const won = phase === "stopped" && cs === TARGET_CS;
  const off = phase === "stopped" ? cs - TARGET_CS : 0;

  /**
   * ONE RESULT LINE, NOT TWO. The panel used to print the delta twice after a
   * miss — `−8.59` under the digits AND `8.59 under` on its own rule-separated
   * row below it. Two readings of one number, in two formats, three lines
   * apart, and the second one carried a divider that made it look like a
   * different fact. This is the single line, in the format the delta already
   * had, with the outcome attached.
   */
  const result = won
    ? `Dead on · ${CLOCK_PROMO.won}`
    : `${off > 0 ? "+" : "−"}${format(Math.abs(off))} · Good luck`;

  /**
   * THE BUTTON'S OWN CAPTION, which is what the "Press to start" line always
   * was — it sat above the digits describing a control four elements below it.
   * It moves down to the button and tracks all three states.
   */
  const caption =
    phase === "idle"
      ? "Press to start"
      : phase === "running"
        ? "Press to stop"
        : "Press to try again";

  const label =
    phase === "idle"
      ? "Start the clock"
      : phase === "running"
        ? "Stop the clock"
        : "Try again";

  const face = phase === "running" ? "Stop" : phase === "idle" ? "Start" : "Again";

  return (
    <section
      /* THE REF WAS NEVER ATTACHED. `useReveal(sectionRef)` has been called
         here since the section was written and the ref went nowhere, so the
         hook found no root and returned immediately — which is why this was
         the one section at the end of the page that had no entrance at all
         while carrying a full set of `data-reveal` attributes. */
      ref={sectionRef}
      id="challenge"
      aria-labelledby="challenge-heading"
      /* CREAM, AND SANDWICHED BY BANDS — which is what finally makes the panel
         below read as an object.

         The section had no block padding at all: a `<SectionDivider />` sat on
         each side and owned the whole rest. Both are gone, so it takes the
         standard section rhythm like every other cream section.

         It stays cream deliberately. The panel is `bg-char`, and on a char band
         a dark card on a dark ground is a card you cannot see — the site's one
         sanctioned dark PROP would have dissolved into the surface. On cream,
         with a dark band above (the gallery) and another below (the FAQ), the
         same panel is the only dark object in a light room and reads as an
         intentional inversion. See DIRECTION.md A1 and A4. */
      className="grain relative bg-sand py-section md:py-section-lg"
    >
      {/* TWO COLUMNS, AND THE COPY IS PUSHED TOWARD THE PANEL.

          It was `.col-story` / `.col-panel` — a 6/5 split of the page's own
          12-column track with the grid gap between them. At 1440 that put the
          copy hard against the left page margin and the panel hard against the
          right, with a 44ch measure floating in a 600px column: a paragraph and
          a machine at opposite ends of the screen with a void between them, and
          nothing in the void.

          The fix is not a narrower page. It is `margin-left: auto` on the copy
          BLOCK inside its column — the column still spans the same grid, but
          the text sits against the gap instead of against the page edge, so the
          two halves read as one composed unit. `max-w-[44ch]` keeps the measure
          honest while it does that.

          `1fr 1.1fr` rather than the 6/5 grid span, so the panel takes the
          slightly larger share — it is the object, and the copy is the caption. */}
      {/* `md:items-center` — the two columns are centred against each other.
          The panel is the taller of the two and it just got much shorter, so
          top-aligned the copy hung at the top of a column with a void under it
          and the section read as half-empty. Centred, the paragraph sits
          against the middle of the machine it is describing. */}
      <div className="grid-page items-center gap-y-10">
        <div className="col-full grid gap-y-10 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-x-16">
          <div className="md:ml-auto md:max-w-[44ch]" data-reveal-group>
            <p className="eyebrow" data-reveal>
              House game
            </p>
            {/* THE NEON HEADING IS GONE, and no heading replaces the colour.
                It was pink with a 22px pink glow, justified as "this section is
                literally a lit sign by the door". There is no lit sign in this
                restaurant, and nothing pink or neon anywhere in the room — the
                treatment was describing a fiction. --color-neon-pink is deleted
                (DIRECTION.md constraint 4) and the accent that remains has one
                job, which a heading is not (constraint 3). So this is the same
                .h2-scale as every other section heading. */}
            <h2 id="challenge-heading" className="h2-scale mt-4" data-reveal>
              Beat the clock
            </h2>
            <span
              aria-hidden="true"
              className="mt-5 block h-0.5 w-16 bg-steel"
              data-reveal="rule"
            />
            {/* THE PRIZE IS ONE COVER. `CLOCK_PROMO.scope` is the sentence that
                says so, and it sits between the rule and the table's time on
                purpose: "your all-you-can-eat is free" followed immediately by
                "your table gets 90 minutes" was two sentences that both start
                with a possessive, and the reader carried the second one's scope
                back onto the first. */}
            <p className="copy mt-6" data-reveal>
              {CLOCK_PROMO.rule} {CLOCK_PROMO.scope} Your table gets{" "}
              {PRICING.seatingMinutes} minutes and last call is at{" "}
              {PRICING.lastCallMinutes}, so there is time to work up to it.
            </p>
          </div>

        {/* THE PANEL IS DARK, and it is the site's one dark card.
            DIRECTION.md constraint 2 puts black in the nav, the footer and
            section caps — a card is none of those, so this is a recorded
            amendment rather than a slip. The reason it earns it: the game is a
            real object in the room, a scoreboard and a red button by the door,
            and the site's black is the room's own ceiling and hardware. The
            SECTION stays sand; only the prop is dark. */}
        <div data-reveal-group>
          {/* ONE CENTRELINE FOR THE WHOLE PANEL, AND ONE GAP BETWEEN EVERY
              BAND.

              The digits were left-hung while the button centred, so the panel
              had two axes and read as slightly broken — the kind of wrong that
              is easier to feel than to name. Everything sits on the panel's
              own centre now: eyebrow, digits, result, caption, button,
              disclaimer.

              THE SIZE WAS THE REAL PROBLEM. The panel took the full width of a
              1.1fr column — ~600px at 1440 — around a `--text-display` readout
              that clamps to 7rem, and the bands were hand-spaced (`mt-6`,
              `mt-4`, `mt-6`, `mt-6`, `gap-5`, `mt-7`), so the button block
              floated in dead space at the bottom. It is capped at 480px and
              sits against the START of its column rather than stretching
              across it, the digits come down to a size a panel can hold, and
              the seven bands are one 22px flex gap. Nothing here is spaced by
              hand any more.

              `md:mr-auto` and not `mx-auto`: the panel is aligned to the
              column's own left edge, which is the page's gap — so the copy's
              right edge and the panel's left edge frame the same channel. */}
          <div
            ref={panelRef}
            className="mx-auto flex w-full max-w-[480px] flex-col gap-[22px] rounded-card bg-char p-7 text-center shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)] sm:p-10 md:mx-0 md:mr-auto"
            data-reveal="panel"
          >
            <p className="eyebrow text-steel">Stop the clock</p>

            {/* The digits. tabular-nums is the whole reason DSEG7 was carried:
                one advance width, so the readout cannot jitter as it counts —
                and it is also what lets the roll-up run through 900 values
                without the panel breathing.

                NOT `--text-display`. That step clamps to 7rem and is the
                hero's lockup size; inside a 480px card it was a billboard with
                a paragraph of legal text under it. 4.5rem desktop / 3.5rem
                mobile is still comfortably the largest thing in the panel,
                which is all the readout has to be.

                On the dark panel a colour shift is legible again, so the three
                states are carried by colour: sand at rest and while running,
                the accent on a win, steel on a miss. */}
            <p
              className={`text-center font-display text-[3.5rem] font-black leading-none [font-stretch:87.5%] [font-variant-numeric:tabular-nums] sm:text-[4.5rem] ${
                won
                  ? "animate-[win-pulse_420ms_var(--ease-house)] text-flame"
                  : phase === "stopped"
                    ? "text-steel"
                    : "text-sand"
              }`}
              aria-hidden="true"
            >
              {format(phase === "idle" ? (roll ?? TARGET_CS) : cs)}
            </p>

            {/* THE ONE RESULT LINE. Present only after a press has landed —
                before that the digits say 10.00 and there is nothing to report.
                `aria-live` so a screen reader hears the outcome without having
                to go looking for it; the digits themselves stay aria-hidden
                because a counter announcing every centisecond is unusable. */}
            <p
              className="min-h-6 font-sans text-sm font-semibold tabular-nums text-steel"
              aria-live="polite"
            >
              {phase === "stopped" ? result : ""}
            </p>

            {/* The one divider, and it separates the READOUT from the CONTROL —
                which is the panel's only real seam. */}
            <span
              aria-hidden="true"
              className="mx-auto block h-px w-full max-w-56 bg-sand/10"
            />

            {/* THE ARCADE PRESS.

                There is a real red button on the wall by the door, and this is
                the site's version of it. It was a pill — the site's shared
                button object, which was right when the section was a link with
                a label and wrong once the section is a MACHINE. A pill says
                "navigate"; a round button under a caption that says PRESS says
                what this actually is.

                DEPTH WITHOUT GLOSS. Three flat rings and nothing else, and ALL
                THREE ARE THE SAME CIRCLE:

                  housing  a 2px hairline circle at 12px clearance, concentric
                           with the disc. It is what turns a floating red disc
                           into a press MOUNTED in a panel — the disc alone read
                           as a button someone had dropped on the artwork.
                  base     the same diameter as the face, offset 6px down. This
                           is the button's side wall, and it is the whole
                           illusion: you see the wall, so the face is standing
                           on something.
                  face     the flame circle you actually press.

                THE BASE USED TO BE BIGGER THAN THE FACE (`-inset-[5px]`, so
                122px under a 112px disc) AND offset 6px down at the same time.
                Those two together are not a side wall, they are an EGG: 5px of
                dark red showing at the top and 11px at the bottom reads as one
                asymmetric shape rather than as a disc standing on a cylinder.
                Same diameter, offset only — the wall is the 6px crescent at the
                foot, which is exactly what you see on a real arcade press.

                AND IT IS A CIRCLE STRUCTURALLY, NOT BY RADIUS ALONE. Explicit
                equal `width`/`height`, `aspect-ratio: 1/1` as a second lock,
                `shrink-0`, and a wrapper that CENTRES rather than stretches —
                the button is never a flex child that can be sized by its
                container. `rounded-[50%]` rather than the pill token, so the
                radius is defined against the element's own box and cannot
                describe a stadium if anything ever does stretch it.

                Pressing moves the face 5px onto the base, so the wall shortens
                by five sixths and the button is down. TRANSLATE ONLY — no
                scale, or the disc stops being round for 70ms every press. No
                gradient, no highlight, no inner shadow — the previous version
                of this section was 499 lines of exactly that and it went for a
                reason (see the header).

                THE PRESS IS EXPLICIT STATE, NOT `:active`. `:active` is
                reliable for mouse and touch and inconsistent for the keyboard:
                Space fires click on keyUP, Enter on keyDOWN, and browsers
                disagree about whether either paints `:active` at all. A button
                whose whole point is that it depresses cannot have the travel
                work for two input methods out of three. */}
            <p className="eyebrow text-steel">{caption}</p>

            {/* The centring container. `justify-center` places the button;
                `items-center` stops the cross axis from stretching it. The
                button carries its own size and never inherits one. */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={press}
                aria-label={label}
                onPointerDown={() => setHeld(true)}
                onPointerUp={() => setHeld(false)}
                onPointerLeave={() => setHeld(false)}
                onPointerCancel={() => setHeld(false)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") setHeld(true);
                }}
                onKeyUp={() => setHeld(false)}
                onBlur={() => setHeld(false)}
                /* The hit target is the whole circle, and the circle is the
                   button — the base and the face are decorative spans inside
                   it, so there is no way to press the artwork and miss the
                   control.

                   `.arcade-press` carries the focus ring. It has to be a real
                   rule in globals.css rather than a utility here: the site's
                   `:focus-visible` is unlayered and beats every Tailwind class,
                   so `focus-visible:outline-sand` loses to it silently and the
                   ring stays flame-on-flame. See the note there. */
                className="arcade-press relative size-24 shrink-0 self-center rounded-[50%] [aspect-ratio:1/1] min-[640px]:size-28"
              >
                {/* The housing the press is mounted in. 12px of clearance on
                    every side of the DISC, so the ring reads as panel hardware
                    rather than as a border on the button. */}
                <span
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[50%] border-2 border-sand/12"
                />
                {/* The side wall: the same circle as the face, 6px lower. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 translate-y-[6px] rounded-[50%] bg-[#A32C22]"
                />
                {/* The face, and the only thing that moves. */}
                <span
                  className={`absolute inset-0 grid place-items-center rounded-[50%] bg-flame font-sans text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-sand transition-transform duration-[70ms] ease-house motion-reduce:transition-none ${
                    held ? "translate-y-[5px]" : "translate-y-0"
                  }`}
                >
                  {face}
                </span>
              </button>
            </div>

            {/* Three sentences, no em dash. The clause after the dash was doing
                the work of a sentence, so it is one. */}
            <p className="mx-auto max-w-sm text-center font-sans text-xs text-steel">
              Practice as much as you like. Only the clock at the restaurant
              counts. One press per table, per visit.
            </p>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
