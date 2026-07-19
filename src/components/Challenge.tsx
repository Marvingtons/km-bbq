"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { gsap } from "gsap";
import { ScrollReveal } from "./ScrollReveal";
import { prefersReducedMotion } from "@/lib/motion";

// Seven-segment face for the LED clock — bundled locally (SIL OFL, see
// src/fonts/DSEG-LICENSE.txt) so the digits never depend on a CDN. Digits in
// DSEG7 share one advance width, which is what keeps the clock rock-steady
// while it counts.
const dseg7 = localFont({
  src: "../fonts/DSEG7Classic-Bold.woff2",
  weight: "700",
  display: "swap",
  // Below-the-fold decorative LED face — don't preload it site-wide (it was
  // being preloaded on every route, including /menu where it never renders).
  preload: false,
});

// Land on 10.00 seconds flat and your next visit is free. This is a practice
// round; the copy is explicit that only the clock at the restaurant pays out.
const TARGET_CS = 1000; // 10.00s in centiseconds

type Phase = "idle" | "running" | "stopped";

// Both the display and the judgement floor to centiseconds so the verdict
// always matches the digits the player sees.
function toCentiseconds(ms: number) {
  return Math.floor(ms / 10);
}

// Seconds and hundredths, separated by a decimal point rather than a colon: a
// colon reads as minutes:seconds, so "00:94" looked like 94 seconds instead of
// 0.94. DSEG7's "." is zero-advance and overlays the preceding digit cell, the
// way a real 7-segment decimal point does, so the digits stay on their grid.
function formatClock(cs: number) {
  const capped = Math.min(cs, 99_99);
  const secs = Math.floor(capped / 100);
  const rest = capped % 100;
  return `${String(secs).padStart(2, "0")}.${String(rest).padStart(2, "0")}`;
}

// The result read-out: a win, or how far off you landed plus a short reaction.
// Playful about a miss, never scolding — the player is meant to press again.
function readout(cs: number): { win: boolean; head: string; sub: string } {
  const diff = cs - TARGET_CS;
  const off = Math.abs(diff);
  if (off === 0)
    return {
      win: true,
      head: "10.00. Dead on.",
      sub: "Do that on the clock by our door and your next visit is on us.",
    };
  const offSec = (off / 100).toFixed(2);
  let note: string;
  if (off <= 5) note = "So close.";
  else if (off <= 20) note = diff < 0 ? "A hair early." : "A hair late.";
  else if (off <= 75) note = diff < 0 ? "Too quick." : "Too slow.";
  else note = diff < 0 ? "Way early." : "Way late.";
  return { win: false, head: `${offSec} off`, sub: note };
}

// LED digit rendering shared by the live, ghost, and glow layers — identical
// metrics on all three is what keeps them perfectly registered.
const digitStyle: React.CSSProperties = {
  letterSpacing: "0.05em",
  whiteSpace: "pre",
};

const LED_RED = "#ff2a1e";

// Fixed burst geometry so the client render matches SSR; each ember flies to
// its own angle/distance on a win.
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return {
    x: Math.cos(a) * (70 + (i % 3) * 22),
    y: Math.sin(a) * (60 + (i % 3) * 18),
  };
});

export function Challenge() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const faceRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const press = () => {
    if (phase === "running") {
      cancelAnimationFrame(rafRef.current);
      setElapsedMs(performance.now() - startRef.current);
      setPhase("stopped");
      return;
    }
    startRef.current = performance.now();
    setElapsedMs(0);
    setPhase("running");
    const tick = () => {
      setElapsedMs(performance.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Pointer presses fire on pointerdown — stopping a timing game on the smack,
  // not the release. Keyboard activation (Space/Enter) arrives as a click with
  // detail 0; pointer-initiated clicks (detail > 0) already fired above.
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    press();
  };
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.detail === 0) press();
  };

  const cs = toCentiseconds(elapsedMs);
  const display = phase === "idle" ? "10.00" : formatClock(cs);
  const [secsPart, csPart] = display.split(".");
  const result = phase === "stopped" ? readout(cs) : null;
  const won = result?.win ?? false;

  // Win moment: the clock pulses, the glow flares, and a ring of embers bursts
  // out. All transform/opacity, and skipped entirely for reduced motion.
  useEffect(() => {
    if (!won) return;
    if (prefersReducedMotion()) return;
    const tl = gsap.timeline();
    tl.fromTo(
      faceRef.current,
      { scale: 1 },
      { scale: 1.06, duration: 0.14, ease: "power2.out" }
    ).to(faceRef.current, {
      scale: 1,
      duration: 0.6,
      ease: "elastic.out(1, 0.45)",
    });
    tl.fromTo(
      glowRef.current,
      { opacity: 0 },
      { opacity: 0.9, duration: 0.14, ease: "power2.out" },
      0
    ).to(glowRef.current, { opacity: 0, duration: 0.75, ease: "power2.out" }, 0.18);

    const sparks = sparkRef.current?.children;
    if (sparks) {
      tl.fromTo(
        sparks,
        { x: 0, y: 0, scale: 0.4, autoAlpha: 1 },
        {
          x: (i: number) => SPARKS[i].x,
          y: (i: number) => SPARKS[i].y,
          scale: 1,
          autoAlpha: 0,
          duration: 0.85,
          ease: "power2.out",
          stagger: 0.012,
        },
        0
      );
    }
    return () => {
      tl.kill();
      gsap.set([faceRef.current, glowRef.current], { clearProps: "all" });
    };
  }, [won]);

  const status =
    phase === "idle"
      ? "Tap the button to start, then stop it on 10.00."
      : phase === "running"
        ? "Now. Hit it."
        : "";

  return (
    <section
      id="challenge"
      aria-labelledby="challenge-heading"
      className="relative bg-cream px-6 py-24 md:py-28"
      // Arrives carrying the Gallery's paper and settles back onto cream.
      data-seam-morph
      data-from="#F3EBDD"
      data-to="#FAF4EC"
    >
      {/* max-w-xl, not max-w-7xl: the game is one object, and a wide container
          left it floating in dead cream at 1440. */}
      <div className="mx-auto max-w-xl">
        {/* Compact header, tight to the machine below. */}
        <div className="mb-8 text-center">
          <ScrollReveal>
            <p className="mb-3 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember-deep">
              House game
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.05}>
            <h2
              id="challenge-heading"
              className="font-serif text-4xl font-light text-foreground md:text-5xl"
            >
              Beat the clock
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <p className="mx-auto mt-4 max-w-md font-sans text-base font-light leading-relaxed text-body">
              There is a clock and a red button by our door. Stop it dead on
              10.00 seconds and your next visit is free. Here is a practice
              round.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={0.12}>
          {/* The machine: one built object. A warm panel with an engraved
              nameplate, the LED inset, a fixed-height read-out, the button on
              its own recessed control deck, and the house rule as a placard.
              Nothing floats in cream on its own any more. */}
          <div className="relative mx-auto max-w-md overflow-hidden rounded-[1.6rem] border border-paper-line bg-gradient-to-b from-cream to-paper px-5 pb-7 pt-6 shadow-warm-lg sm:px-8">
            {/* Nameplate */}
            <div className="mb-5 flex items-center justify-center gap-2">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-ember"
              />
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/50">
                Stop the clock
              </span>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-ember"
              />
            </div>

            {/* LED clock in a dark bezel with mounting screws, like the door
                prop. Purely visual (aria-hidden): the button's label and the
                read-out's live region carry the game for screen readers. The
                bezel is sized independently of the font, so nothing shifts
                while DSEG7 loads. */}
            <div
              aria-hidden="true"
              className="relative mx-auto flex aspect-[2.9/1] w-full max-w-[360px] items-center justify-center rounded-2xl border border-[#242424]"
              style={{
                background: "linear-gradient(180deg, #141414 0%, #0a0a0a 100%)",
                boxShadow:
                  "inset 0 2px 12px rgba(0,0,0,0.85), inset 0 -1px 0 rgba(255,255,255,0.04), 0 20px 44px -24px rgba(120,60,20,0.55)",
              }}
            >
              {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map(
                (pos) => (
                  <span
                    key={pos}
                    className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-[#050505] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]`}
                  />
                )
              )}
              <div
                ref={faceRef}
                className={`${dseg7.className} relative text-[clamp(34px,10vw,52px)] leading-none`}
              >
                {/* Ghost segments — every segment faintly lit, the way unlit
                    LEDs still catch light on a real display. */}
                <span
                  className="absolute inset-0 block select-none"
                  style={{ ...digitStyle, color: "rgba(255, 42, 30, 0.08)" }}
                >
                  88.88
                </span>
                {/* Glow flare layer — invisible until the win pulse. */}
                <span
                  ref={glowRef}
                  className="absolute inset-0 block select-none opacity-0"
                  style={{ ...digitStyle, color: LED_RED, filter: "blur(7px)" }}
                >
                  {display}
                </span>
                {/* Live digits. The separator blinks at 1Hz only while the
                    clock idles at 10:00 (solid while running), and holds
                    steady for reduced motion. */}
                <span
                  className="relative block select-none"
                  style={{
                    ...digitStyle,
                    color: LED_RED,
                    textShadow:
                      "0 0 6px rgba(255,42,30,0.55), 0 0 18px rgba(255,42,30,0.28)",
                  }}
                >
                  {secsPart}
                  <span
                    className={
                      phase === "idle"
                        ? "motion-safe:animate-[led-blink_1s_linear_infinite]"
                        : undefined
                    }
                  >
                    .
                  </span>
                  {csPart}
                </span>
              </div>
            </div>

            {/* Read-out: fixed height so the panel never jumps between states. */}
            <div className="mt-4 flex min-h-[3.25rem] flex-col items-center justify-center text-center">
              {phase === "stopped" && result ? (
                <>
                  <p
                    aria-live="polite"
                    className={`font-sans text-lg font-semibold ${
                      won ? "text-ember-deep" : "text-foreground"
                    }`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {result.head}
                  </p>
                  <p className="mt-0.5 font-sans text-sm font-light text-body">
                    {result.sub}
                  </p>
                </>
              ) : (
                <p className="font-sans text-sm font-light text-foreground/50">
                  {status}
                </p>
              )}
            </div>

            {/* Control deck: a recessed strip that holds the button, so the
                dome reads as part of the machine, not floating on cream. */}
            <div
              className="relative mt-3 flex items-center justify-center rounded-2xl border border-paper-line bg-paper/70 px-6 py-6"
              style={{ boxShadow: "inset 0 2px 10px rgba(120,60,20,0.10)" }}
            >
              {/* Ember burst origin, centered on the button. */}
              <div
                ref={sparkRef}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-20"
              >
                {SPARKS.map((_, i) => (
                  <span
                    key={i}
                    className="absolute block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember opacity-0"
                    style={{
                      boxShadow:
                        "0 0 8px 2px color-mix(in srgb, var(--color-ember) 85%, transparent)",
                    }}
                  />
                ))}
              </div>

              {/* The <button> is the whole plate (generous hit target), but on
                  press only the dome sinks into it and springs back with a
                  little overshoot — the plate stays put. Space/Enter work
                  natively (real <button>), and :active gives keyboard presses
                  the same smack. */}
              <button
                type="button"
                onPointerDown={handlePointerDown}
                onClick={handleClick}
                aria-label={
                  phase === "running"
                    ? "Stop the clock"
                    : phase === "stopped"
                      ? "Try again"
                      : "Start the clock"
                }
                className="group relative flex h-[84px] w-[84px] cursor-pointer items-center justify-center rounded-full border border-[#242424] outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:h-[100px] sm:w-[100px]"
                style={{
                  background: "#0c0c0c",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 16px rgba(0,0,0,0.65), 0 18px 36px -18px rgba(120,60,20,0.55)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="relative block h-16 w-16 transition-transform duration-150 group-hover:-translate-y-px group-active:translate-y-0 motion-reduce:transition-none sm:h-[78px] sm:w-[78px]"
                >
                  {/* base rim: casts the dome's shadow onto the plate,
                      tightening on press while the plate stays put */}
                  <span className="absolute inset-x-[3%] bottom-0 top-[12%] block rounded-full bg-gradient-to-b from-[#8a1216] to-[#54080c] shadow-[0_14px_24px_-8px_rgba(0,0,0,0.75)] transition-shadow duration-150 group-active:shadow-[0_5px_10px_-6px_rgba(0,0,0,0.85)] motion-reduce:transition-none" />
                  {/* dome: sinks on press and springs back with a little
                      overshoot */}
                  <span
                    className="absolute inset-x-0 bottom-[10%] top-0 block rounded-full transition-transform duration-[180ms] ease-[cubic-bezier(0.34,1.8,0.64,1)] group-hover:brightness-105 group-active:translate-y-[6px] group-active:duration-[110ms] group-active:ease-out motion-reduce:transition-none"
                    style={{
                      background:
                        "radial-gradient(circle at 32% 26%, #ff7a6b 0%, #f24a43 22%, #e02128 55%, #b0141b 82%, #921016 100%)",
                      boxShadow:
                        "inset 0 -8px 14px rgba(80,5,8,0.45), inset 0 4px 8px rgba(255,255,255,0.28)",
                    }}
                  />
                </span>
              </button>
            </div>

            <p className="mt-3 text-center font-sans text-xs font-light text-foreground/50">
              {phase === "running"
                ? "Press to stop"
                : phase === "stopped"
                  ? "Press to try again"
                  : "Press to start"}
            </p>

            {/* House rule, inside the card rather than adrift beneath it. */}
            <p className="mt-5 border-t border-paper-line pt-4 text-center font-sans text-xs font-light leading-relaxed text-foreground/50">
              Practice here as much as you like. Only the clock at the
              restaurant counts, one press per table, per visit.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
