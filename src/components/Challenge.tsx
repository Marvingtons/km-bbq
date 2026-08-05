"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReveal } from "@/lib/reveal";
import { CLOCK_PROMO, PRICING } from "@/data/info";

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

  const stop = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const press = () => {
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
      id="challenge"
      aria-labelledby="challenge-heading"
      className="grain relative bg-sand pb-section md:pb-section-lg"
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
      <div className="grid-page items-center gap-y-10">
        <div className="col-full grid gap-y-10 md:grid-cols-[1fr_1.1fr] md:gap-x-16">
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
          <div
            className="rounded-card bg-char p-6 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)] sm:p-8"
            data-reveal
          >
            <p className="eyebrow text-steel">Stop the clock</p>

            {/* The digits. tabular-nums is the whole reason DSEG7 was carried:
                one advance width, so the readout cannot jitter as it counts.
                On the dark panel a colour shift is legible again, so the three
                states are carried by colour: sand at rest and while running,
                the accent on a win, smoke on a miss. */}
            <p
              className={`mt-4 font-display text-display font-black leading-none [font-stretch:87.5%] [font-variant-numeric:tabular-nums] ${
                won
                  ? "animate-[win-pulse_420ms_var(--ease-house)] text-flame"
                  : phase === "stopped"
                    ? "text-steel"
                    : "text-sand"
              }`}
              aria-hidden="true"
            >
              {format(phase === "idle" ? TARGET_CS : cs)}
            </p>

            {/* THE ONE RESULT LINE. Present only after a press has landed —
                before that the digits say 10.00 and there is nothing to report.
                `aria-live` so a screen reader hears the outcome without having
                to go looking for it; the digits themselves stay aria-hidden
                because a counter announcing every centisecond is unusable. */}
            <p
              className="mt-3 min-h-6 font-sans text-sm font-semibold tabular-nums text-steel"
              aria-live="polite"
            >
              {phase === "stopped" ? result : ""}
            </p>

            {/* THE ARCADE PRESS.

                There is a real red button on the wall by the door, and this is
                the site's version of it. It was a pill — the site's shared
                button object, which was right when the section was a link with
                a label and wrong once the section is a MACHINE. A pill says
                "navigate"; a round button under a caption that says PRESS says
                what this actually is.

                DEPTH WITHOUT GLOSS. Two flat circles: a darker base offset five
                pixels down, which is the button's side wall, and the face on
                top. Pressing moves the face four pixels onto the base, so the
                wall shortens and the button is down. No gradient, no highlight,
                no inner shadow — the previous version of this section was 499
                lines of exactly that and it went for a reason (see above).

                THE PRESS IS EXPLICIT STATE, NOT `:active`. `:active` is
                reliable for mouse and touch and inconsistent for the keyboard:
                Space fires click on keyUP, Enter on keyDOWN, and browsers
                disagree about whether either paints `:active` at all. A button
                whose whole point is that it depresses cannot have the travel
                work for two input methods out of three. */}
            <div className="mt-7 flex flex-col items-center gap-4">
              <p className="eyebrow text-steel">{caption}</p>

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
                className="arcade-press relative size-20 shrink-0 rounded-pill min-[400px]:size-24"
              >
                {/* The side wall. */}
                <span
                  aria-hidden="true"
                  className="absolute -inset-[3px] translate-y-[5px] rounded-pill bg-[#A32C22]"
                />
                {/* The face, and the only thing that moves. */}
                <span
                  className={`absolute inset-0 grid place-items-center rounded-pill bg-flame font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-sand transition-transform duration-[70ms] ease-house motion-reduce:transition-none ${
                    held ? "translate-y-[4px]" : "translate-y-0"
                  }`}
                >
                  {face}
                </span>
              </button>
            </div>

            {/* Three sentences, no em dash. The clause after the dash was doing
                the work of a sentence, so it is one. */}
            <p className="mt-4 text-center font-sans text-xs text-steel">
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
