"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { gsap } from "gsap";
import { ScrollReveal } from "./ScrollReveal";

// Seven-segment face for the LED clock — bundled locally (SIL OFL, see
// src/fonts/DSEG-LICENSE.txt) so the digits never depend on a CDN. Digits in
// DSEG7 share one advance width, which is what keeps the clock rock-steady
// while it counts.
const dseg7 = localFont({
  src: "../fonts/DSEG7Classic-Bold.woff2",
  weight: "700",
  display: "swap",
});

const REVEAL = { margin: "0px 0px -20% 0px", duration: 0.45 } as const;

// The house game, exactly as played at the restaurant: a clock counts up and
// one press of the red button stops it. Land on 10.00 seconds flat and your
// next barbecue is free. This section is a practice round — the copy is
// explicit that only the clock at the restaurant awards the prize.
const TARGET_CS = 1000; // 10.00s in centiseconds

type Phase = "idle" | "running" | "stopped";

// Both the display and the judgement floor to centiseconds so the verdict
// always matches the digits the player sees.
function toCentiseconds(ms: number) {
  return Math.floor(ms / 10);
}

function formatClock(cs: number) {
  const capped = Math.min(cs, 99_99);
  const secs = Math.floor(capped / 100);
  const rest = capped % 100;
  return `${String(secs).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function verdict(cs: number) {
  const diff = cs - TARGET_CS;
  if (diff === 0)
    return "10:00 flat. You have the touch — now do it at the table.";
  if (Math.abs(diff) <= 5) return "Agonizingly close. The button awaits you.";
  if (Math.abs(diff) <= 30)
    return diff < 0
      ? "So close — a breath too early."
      : "So close — a breath too late.";
  return diff < 0
    ? "Too eager. The grill teaches patience."
    : "A beat too late. The grill respects the effort.";
}

// LED digit rendering shared by the live, ghost, and glow layers — identical
// metrics on all three is what keeps them perfectly registered.
const digitStyle: React.CSSProperties = {
  letterSpacing: "0.05em",
  whiteSpace: "pre",
};

const LED_RED = "#ff2a1e";

export function Challenge() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const faceRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);

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
  const display = phase === "idle" ? "10:00" : formatClock(cs);
  const [secsPart, csPart] = display.split(":");
  const won = phase === "stopped" && cs === TARGET_CS;

  // Win flare: the glow layer flashes bright and the face gives a tiny scale
  // pulse — the LED equivalent of the restaurant clock's jackpot moment.
  useEffect(() => {
    if (!won) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = gsap.timeline();
    tl.fromTo(
      faceRef.current,
      { scale: 1 },
      { scale: 1.05, duration: 0.12, ease: "power2.out" }
    ).to(faceRef.current, {
      scale: 1,
      duration: 0.5,
      ease: "elastic.out(1, 0.45)",
    });
    tl.fromTo(
      glowRef.current,
      { opacity: 0 },
      { opacity: 0.9, duration: 0.12, ease: "power2.out" },
      0
    ).to(glowRef.current, { opacity: 0, duration: 0.7, ease: "power2.out" }, 0.15);
    return () => {
      tl.kill();
      gsap.set([faceRef.current, glowRef.current], { clearProps: "all" });
    };
  }, [won]);

  return (
    <section
      id="challenge"
      aria-labelledby="challenge-heading"
      className="bg-cream px-6 py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <ScrollReveal {...REVEAL}>
            <p className="mb-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-ember">
              The House Game
            </p>
          </ScrollReveal>
          <ScrollReveal {...REVEAL} delay={0.05}>
            <h2
              id="challenge-heading"
              className="font-serif text-5xl font-light text-foreground md:text-6xl"
            >
              Feeling <em className="italic text-ember">Lucky?</em>
            </h2>
          </ScrollReveal>
          <ScrollReveal {...REVEAL} delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl font-sans text-base font-light leading-relaxed text-foreground/60">
              By the door hangs a clock and a single red button. Every table
              gets one press per visit — stop the clock at exactly 10.00
              seconds and your next barbecue is on us.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal {...REVEAL} delay={0.12}>
          <div className="mx-auto flex max-w-md flex-col items-center">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.2em] text-foreground/45">
              The Clock
            </span>

            {/* The LED clock — a black bezel with glowing 7-seg digits, built
                to read like the physical prop by the restaurant door. Purely
                visual (aria-hidden): the button's label and the verdict live
                region carry the game for screen readers. The bezel is sized
                independently of the font, so nothing shifts while DSEG7
                loads. */}
            <div
              aria-hidden="true"
              className="relative mt-4 flex aspect-[2.8/1] w-[min(90vw,340px)] items-center justify-center rounded-2xl border border-[#242424] sm:w-[400px]"
              style={{
                background: "linear-gradient(180deg, #141414 0%, #0a0a0a 100%)",
                boxShadow:
                  "inset 0 2px 12px rgba(0,0,0,0.85), inset 0 -1px 0 rgba(255,255,255,0.04), 0 24px 48px -22px rgba(120,60,20,0.5), 0 8px 20px -12px rgba(26,26,26,0.35)",
              }}
            >
              <div
                ref={faceRef}
                className={`${dseg7.className} relative text-[38px] leading-none sm:text-[50px]`}
              >
                {/* Ghost segments — every segment faintly lit, the way unlit
                    LEDs still catch light on a real display. */}
                <span
                  className="absolute inset-0 block select-none"
                  style={{ ...digitStyle, color: "rgba(255, 42, 30, 0.08)" }}
                >
                  88:88
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
                    :
                  </span>
                  {csPart}
                </span>
              </div>
            </div>

            {/* The red button — the only start/stop control, built like the
                arcade dome by the door: a red dome mounted on a circular
                black plate whose finish matches the clock bezel, so the two
                read as parts of the same prop. The <button> is the whole plate (generous
                hit target), but on press only the dome sinks into it and
                springs back with a little overshoot — the plate stays put.
                Space/Enter work natively (real <button>), and :active gives
                keyboard presses the same smack. */}
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
              className="group relative mt-10 flex h-[84px] w-[84px] cursor-pointer items-center justify-center rounded-full border border-[#242424] sm:h-[108px] sm:w-[108px]"
              style={{
                background: "#0c0c0c",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 16px rgba(0,0,0,0.65), 0 20px 40px -20px rgba(120,60,20,0.5), 0 6px 16px -10px rgba(26,26,26,0.35)",
              }}
            >
              {/* dome assembly, centered on the plate */}
              <span
                aria-hidden="true"
                className="relative block h-16 w-16 sm:h-[84px] sm:w-[84px]"
              >
                {/* base rim where the dome meets the plate; carries the
                    dome's shadow cast onto the plate, which tightens on
                    press while the plate holds still */}
                <span
                  className="absolute inset-x-[3%] top-[12%] bottom-0 block rounded-full bg-gradient-to-b from-[#8a1216] to-[#54080c] shadow-[0_14px_24px_-8px_rgba(0,0,0,0.75)] transition-shadow duration-150 group-active:shadow-[0_6px_12px_-6px_rgba(0,0,0,0.8)] motion-reduce:transition-none"
                />
                {/* dome */}
                <span
                  className="absolute inset-x-0 top-0 bottom-[10%] block rounded-full transition-transform duration-[180ms] ease-[cubic-bezier(0.34,1.8,0.64,1)] group-active:translate-y-1 group-active:duration-[120ms] group-active:ease-out motion-reduce:transition-none"
                  style={{
                    background:
                      "radial-gradient(circle at 32% 26%, #ff7a6b 0%, #f24a43 22%, #e02128 55%, #b0141b 82%, #921016 100%)",
                    boxShadow:
                      "inset 0 -8px 14px rgba(80,5,8,0.45), inset 0 4px 8px rgba(255,255,255,0.28)",
                  }}
                />
              </span>
            </button>

            <span className="mt-5 block font-sans text-xs font-light text-foreground/40">
              {phase === "running"
                ? "press to stop"
                : phase === "stopped"
                  ? "press to try again"
                  : "press to start"}
            </span>

            {/* Verdict — polite live region so the result is announced once */}
            <p
              aria-live="polite"
              className="mt-8 min-h-6 text-center font-sans text-sm font-light text-foreground/70"
            >
              {phase === "stopped" && (
                <>
                  You stopped at{" "}
                  <span
                    className={`font-medium ${won ? "text-red" : "text-foreground"}`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatClock(cs)}
                  </span>
                  {" — "}
                  {verdict(cs)}
                </>
              )}
            </p>

            <p className="mt-8 text-center font-sans text-xs font-light leading-relaxed text-foreground/40">
              Practice here all you like — only the clock at the restaurant
              counts, one shot per table, per visit.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
