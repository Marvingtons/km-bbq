"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollReveal } from "./ScrollReveal";
import { CLOCK_PROMO, PRICING } from "@/data/info";

/* ===========================================================================
   THE CLOCK — a flat neon scoreboard.

   THE PREMISE IS REAL AND UNCHANGED. There is a clock and a red button by the
   door, and stopping it dead on 10.00 seconds gets your next visit free. The
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
  const [phase, setPhase] = useState<Phase>("idle");
  const [cs, setCs] = useState(0);
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

  const readout =
    phase === "idle"
      ? "Press to start"
      : phase === "running"
        ? "Stop it on 10.00"
        : won
          ? "Dead on — next visit free"
          : `${format(Math.abs(off))} ${off > 0 ? "over" : "under"}`;

  return (
    <section
      id="challenge"
      aria-labelledby="challenge-heading"
      className="grain relative bg-sand pb-section md:pb-section-lg"
    >
      {/* TWO COLUMNS FROM md, and that is the fix for the empty right half.
          The copy sat in `.col-text` (columns 1-7) with the panel dropped
          BELOW it in `.col-wide`, which left the right five columns blank for
          the whole section and pushed the panel a screen further down. Story
          left, machine right, stacked on phones. */}
      <div className="grid-page items-start gap-y-10">
        <div className="col-story">
          <ScrollReveal>
            <p className="eyebrow">House game</p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            {/* THE NEON HEADING IS GONE, and no heading replaces the colour.
                It was pink with a 22px pink glow, justified as "this section is
                literally a lit sign by the door". There is no lit sign in this
                restaurant, and nothing pink or neon anywhere in the room — the
                treatment was describing a fiction. --color-neon-pink is deleted
                (DIRECTION.md constraint 4) and the accent that remains has one
                job, which a heading is not (constraint 3). So this is the same
                .h2-scale as every other section heading. */}
            <h2 id="challenge-heading" className="h2-scale mt-4">
              Beat the clock
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.08}>
            <p className="copy measure mt-4">
              {CLOCK_PROMO.rule} Your table gets {PRICING.seatingMinutes}{" "}
              minutes and last call is at {PRICING.lastCallMinutes}, so there is
              time to work up to it.
            </p>
          </ScrollReveal>
        </div>

        {/* THE PANEL IS DARK, and it is the site's one dark card.
            DIRECTION.md constraint 2 puts black in the nav, the footer and
            section caps — a card is none of those, so this is a recorded
            amendment rather than a slip. The reason it earns it: the game is a
            real object in the room, a scoreboard and a red button by the door,
            and the site's black is the room's own ceiling and hardware. The
            SECTION stays sand; only the prop is dark. */}
        <ScrollReveal delay={0.1} className="col-panel">
          <div className="rounded-card bg-char p-6 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)] sm:p-8">
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

            {/* The delta, small, under the digits — only after a miss. */}
            {phase === "stopped" && !won && (
              <p
                aria-hidden="true"
                className="mt-2 font-sans text-sm font-semibold tabular-nums text-steel"
              >
                {off > 0 ? "+" : "−"}
                {format(Math.abs(off))}
              </p>
            )}

            <p
              className="eyebrow mt-5 border-t border-sand/10 pt-4 text-steel"
              aria-live="polite"
            >
              {readout}
            </p>

            {/* FLAT RECTANGLE. The pill and its gloss are gone: this is a
                machine's button, not a link. Hover darkens toward the panel,
                active drops it 1px. No gradient, no shadow, no radius beyond
                the panel's own. */}
            <button
              type="button"
              onClick={press}
              className="mt-6 min-h-12 w-full rounded-[4px] bg-flame px-6 py-3 font-sans text-sm font-semibold uppercase tracking-[0.14em] text-sand transition-[background-color,transform] duration-[var(--dur-quick)] ease-house hover:bg-[#96271f] active:translate-y-px"
            >
              {phase === "running"
                ? "Stop"
                : phase === "idle"
                  ? "Start"
                  : "Again"}
            </button>

            <p className="mt-4 font-sans text-xs text-steel">
              Practice as much as you like. Only the clock at the restaurant
              counts — one press per table, per visit.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
