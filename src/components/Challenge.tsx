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
   hex, an elastic overshoot on press, and a twelve-particle ember burst on a
   win. It was the only section on the site with its own physics.

   THE FONT WENT WITH IT. DSEG7Classic-Bold.woff2 was 5,132 bytes of webfont
   bundled to draw ten digits — one extra font request on every page that
   rendered this section — plus a 4,392-byte license file in the repo. The
   display face is already loaded and already variable, and
   `font-variant-numeric: tabular-nums` gives the same fixed advance width that
   kept the readout from jittering as it counts. 5.1 kB off the wire, 9.5 kB
   out of the tree, and no license to carry.

   It is a scoreboard now: a char-2 panel, a hairline rule, tabular flame digits
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
      className="grain relative bg-char pb-section md:pb-section-lg"
    >
      <div className="grid-page">
        <div className="col-text">
          <ScrollReveal>
            <p className="eyebrow text-ember">House game</p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            {/* THE NEON HEADING, and one of only two permitted on the site.
                This section is literally a lit sign by the door, so the
                treatment describes the subject rather than decorating it. The
                second is deliberately left unspent. */}
            <h2
              id="challenge-heading"
              className="h2-scale mt-4 text-neon-pink"
              style={{ textShadow: "0 0 22px rgb(255 79 160 / 0.45)" }}
            >
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

        <ScrollReveal delay={0.1} className="col-wide mt-10">
          <div className="max-w-md rounded-card border border-char-3 bg-char-2 p-6 sm:p-8">
            <p className="eyebrow">Stop the clock</p>

            {/* The digits. tabular-nums is the whole reason DSEG7 was carried:
                one advance width, so the readout cannot jitter as it counts. */}
            <p
              className="mt-4 font-display text-2xl font-black leading-none [font-stretch:87.5%] [font-variant-numeric:tabular-nums] sm:text-display"
              style={{
                color: won ? "var(--color-ember)" : "var(--color-flame)",
                textShadow: won
                  ? "0 0 34px rgb(242 123 33 / 0.55)"
                  : "0 0 26px rgb(230 59 46 / 0.35)",
              }}
              aria-hidden="true"
            >
              {format(phase === "idle" ? TARGET_CS : cs)}
            </p>

            <p
              className="eyebrow mt-4 border-t border-char-3 pt-4"
              aria-live="polite"
            >
              {readout}
            </p>

            <button
              type="button"
              onClick={press}
              className="mt-6 min-h-11 w-full rounded-pill bg-flame px-6 py-3 font-sans text-sm font-semibold text-bone transition-colors duration-[var(--dur-base)] ease-house hover:bg-ember hover:text-char"
            >
              {phase === "running"
                ? "Stop"
                : phase === "idle"
                  ? "Start"
                  : "Again"}
            </button>

            <p className="mt-4 font-sans text-xs text-smoke">
              Practice as much as you like. Only the clock at the restaurant
              counts — one press per table, per visit.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
