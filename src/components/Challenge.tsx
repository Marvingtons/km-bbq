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

/**
 * Seconds and hundredths as two separate 2-digit groups.
 *
 * They are returned separately, rather than as one "10.00" string, because
 * DSEG7's "." cannot be trusted to read. Its decimal glyph is zero-advance, so
 * it draws on top of the following digit cell rather than between the groups,
 * and at real display sizes it lands as a ~2px speck lost inside the next
 * digit's glow — which is why the clock read "1000". The separator is drawn as
 * its own element instead (see LedDot), the way a real seven-segment panel has
 * a discrete decimal LED rather than a typeset period.
 */
function clockParts(cs: number): [string, string] {
  const capped = Math.min(cs, 99_99);
  return [
    String(Math.floor(capped / 100)).padStart(2, "0"),
    String(capped % 100).padStart(2, "0"),
  ];
}

/**
 * The verdict, phrased for the machine's own readout line rather than for a
 * paragraph of cream text. Short, uppercase, and true at a glance.
 */
function readout(cs: number): { win: boolean; line: string } {
  const diff = cs - TARGET_CS;
  const off = Math.abs(diff);
  if (off === 0) return { win: true, line: "DEAD ON  ·  NEXT VISIT FREE" };
  const offSec = (off / 100).toFixed(2);
  const dir = diff < 0 ? "EARLY" : "LATE";
  return { win: false, line: `${offSec} ${dir}` };
}

const LED_RED = "#ff2a1e";

// Shared LED text treatment: the glow is what sells it as emitted light rather
// than red paint, and every lit layer uses the same one.
const ledGlow = "0 0 6px rgba(255,42,30,0.55), 0 0 18px rgba(255,42,30,0.28)";

// Fixed burst geometry so the client render matches SSR; each ember flies to
// its own angle/distance on a win.
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return {
    x: Math.cos(a) * (70 + (i % 3) * 22),
    y: Math.sin(a) * (60 + (i % 3) * 18),
  };
});

/**
 * The decimal point, as a discrete lit element on the panel. Sized and
 * positioned in em so it tracks the digit size at every breakpoint, and
 * rendered identically on the ghost, glow and live layers so all three stay
 * registered.
 */
function LedDot({ lit }: { lit: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="mx-[0.07em] mb-[0.1em] block h-[0.15em] w-[0.15em] shrink-0 self-end rounded-[0.03em]"
      style={{
        background: lit ? LED_RED : "rgba(255, 42, 30, 0.08)",
        boxShadow: lit ? ledGlow : undefined,
      }}
    />
  );
}

/** One rendering of the four digits + separator, used by all three layers. */
function LedDigits({
  secs,
  cents,
  color,
  lit,
  className = "",
  style,
}: {
  secs: string;
  cents: string;
  color: string;
  lit: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`flex items-center justify-center ${className}`}
      style={{ color, letterSpacing: "0.05em", whiteSpace: "pre", ...style }}
    >
      {secs}
      <LedDot lit={lit} />
      {cents}
    </span>
  );
}

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
  const [secs, cents] = clockParts(phase === "idle" ? TARGET_CS : cs);
  const result = phase === "stopped" ? readout(cs) : null;
  const won = result?.win ?? false;

  // Everything the machine has to say goes on its own readout line, so there is
  // no floating cream text competing with the prop.
  const readoutLine =
    phase === "idle"
      ? "PRESS TO START"
      : phase === "running"
        ? "STOP IT ON 10.00"
        : (result?.line ?? "");

  // RESULT + WIN, both played on the display itself.
  useEffect(() => {
    if (phase !== "stopped") return;
    if (prefersReducedMotion()) return; // no flashing under reduced motion

    const tl = gsap.timeline();

    // Every stop flashes the result on the panel, the way a scoreboard
    // confirms a reading. A win gets a longer, faster celebration pattern.
    tl.fromTo(
      faceRef.current,
      { autoAlpha: 1 },
      {
        autoAlpha: 0.15,
        duration: won ? 0.09 : 0.13,
        repeat: won ? 7 : 3,
        yoyo: true,
        ease: "none",
      }
    );
    tl.set(faceRef.current, { autoAlpha: 1 });

    if (won) {
      tl.fromTo(
        faceRef.current,
        { scale: 1 },
        { scale: 1.06, duration: 0.14, ease: "power2.out" },
        0
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
    }

    return () => {
      tl.kill();
      gsap.set([faceRef.current, glowRef.current], { clearProps: "all" });
    };
  }, [phase, won, elapsedMs]);

  const digitSize = "text-[clamp(38px,11vw,58px)]";

  return (
    <section
      id="challenge"
      aria-labelledby="challenge-heading"
      // Deliberately shorter than the sections either side of it. This is a
      // beat between the gallery and the visit, not a destination of its own.
      className="relative bg-cream px-6 py-16 md:py-20"
      // Arrives carrying the Gallery's paper and settles back onto cream.
      data-seam-morph
      data-from="#F3EBDD"
      data-to="#FAF4EC"
    >
      {/* One column, one width. The copy used to sit in a 576px container above
          a 448px card, which read as two mismatched stacks and made the prop
          look adrift in the cream rather than centred under its own heading. */}
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
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
          <p className="mt-4 font-sans text-base font-light leading-relaxed text-body">
            There is a clock and a red button by our door. Stop it dead on 10.00
            seconds and your next visit is free.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15} className="w-full">
          {/* THE PROP — one housing.
              Display and button are mounted in a single dark unit rather than
              being a screen floating above a separate button on beige. One
              light direction (top-left): the top and left edges catch a hairline
              highlight, the drop shadow falls down and right. One shadow
              family: the same warm rgb(120 60 20) used everywhere on the site.

              focus-visible lands on the HOUSING via :has(), so tabbing to the
              button outlines the whole machine rather than ringing the dome. */}
          <div
            className="relative mx-auto mt-9 w-full max-w-[380px] rounded-[1.4rem] p-5 shadow-[0_26px_50px_-24px_rgb(120_60_20/0.55),0_10px_20px_-14px_rgb(26_26_26/0.4)] ring-1 ring-black/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember sm:p-6"
            style={{
              background:
                "linear-gradient(158deg, #2b2a2f 0%, #1b1a1e 42%, #121215 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.6)",
            }}
          >
            {/* Four mount screws, one per corner of the housing. */}
            {["left-2.5 top-2.5", "right-2.5 top-2.5", "left-2.5 bottom-2.5", "right-2.5 bottom-2.5"].map(
              (pos) => (
                <span
                  key={pos}
                  aria-hidden="true"
                  className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-[#0a0a0c] shadow-[inset_0_1px_1px_rgba(255,255,255,0.16)]`}
                />
              )
            )}

            {/* Engraved nameplate. Cut into the panel via a dark text shadow
                over a light top edge, not printed on top of it. No decorative
                dots: the housing is the decoration. */}
            <p
              className="mb-4 text-center font-sans text-[10px] font-semibold uppercase tracking-[0.32em] text-white/35"
              style={{ textShadow: "0 1px 0 rgba(255,255,255,0.08)" }}
            >
              Stop the clock
            </p>

            {/* LED window, recessed into the housing. */}
            <div
              aria-hidden="true"
              className="relative mx-auto flex aspect-[2.9/1] w-full items-center justify-center overflow-hidden rounded-xl"
              style={{
                background:
                  "linear-gradient(180deg, #0b0b0d 0%, #050506 100%)",
                boxShadow:
                  "inset 0 2px 10px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <div className={`${dseg7.className} relative ${digitSize} leading-none`}>
                {/* Ghost segments — every segment faintly lit, the way unlit
                    LEDs still catch light on a real display. */}
                <LedDigits
                  secs="88"
                  cents="88"
                  lit={false}
                  color="rgba(255, 42, 30, 0.08)"
                  className="absolute inset-0"
                />
                {/* Glow flare layer — invisible until the win pulse. */}
                <span ref={glowRef} className="absolute inset-0 block opacity-0">
                  <LedDigits
                    secs={secs}
                    cents={cents}
                    lit
                    color={LED_RED}
                    style={{ filter: "blur(7px)" }}
                  />
                </span>
                {/* Live digits. */}
                <div ref={faceRef} className="relative">
                  <LedDigits
                    secs={secs}
                    cents={cents}
                    lit
                    color={LED_RED}
                    style={{ textShadow: ledGlow }}
                  />
                </div>
              </div>
            </div>

            {/* The machine's readout line: hint, then verdict. Fixed height so
                the housing never changes size between states. */}
            <p
              aria-live="polite"
              className="mt-3 flex min-h-5 items-center justify-center text-center font-sans text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{
                color: won ? LED_RED : "rgba(255,255,255,0.5)",
                textShadow: won ? ledGlow : undefined,
              }}
            >
              {readoutLine}
            </p>

            {/* Control deck: the button is seated in the same housing, on a
                slightly darker recess so it reads as mounted, not stacked. */}
            <div
              className="relative mt-4 flex items-center justify-center rounded-xl py-5"
              style={{
                background: "rgba(0,0,0,0.28)",
                boxShadow:
                  "inset 0 2px 8px rgba(0,0,0,0.65), inset 0 -1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Ember burst origin, centred on the button. */}
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
                // outline-none because the ring is drawn on the housing.
                className="group relative flex h-[74px] w-[74px] cursor-pointer items-center justify-center rounded-full outline-none sm:h-[86px] sm:w-[86px]"
              >
                {/* Bezel the dome sits in, cut into the deck. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "linear-gradient(158deg, #232227 0%, #131316 100%)",
                    boxShadow:
                      "inset 0 2px 5px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.06)",
                  }}
                />
                {/* The dome. On press it sinks INTO the housing: it scales
                    down, drops, and its cast shadow tightens to nothing. */}
                <span
                  aria-hidden="true"
                  className="relative block h-[76%] w-[76%] rounded-full shadow-[0_9px_16px_-4px_rgba(0,0,0,0.75)] transition-[transform,box-shadow] duration-[170ms] ease-[cubic-bezier(0.34,1.7,0.64,1)] group-hover:brightness-110 group-active:translate-y-[3px] group-active:scale-[0.93] group-active:shadow-[0_2px_4px_-2px_rgba(0,0,0,0.9)] group-active:duration-[90ms] motion-reduce:transition-none"
                  style={{
                    background:
                      "radial-gradient(circle at 34% 26%, #ff7a6b 0%, #f24a43 22%, #e02128 55%, #b0141b 82%, #921016 100%)",
                    boxShadow:
                      "inset 0 -7px 12px rgba(80,5,8,0.5), inset 0 4px 8px rgba(255,255,255,0.3)",
                  }}
                />
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* House rule, on the cream stage below the prop rather than on it. */}
        <ScrollReveal delay={0.2}>
          <p className="mt-6 max-w-sm font-sans text-xs font-light leading-relaxed text-foreground/50">
            Practice here as much as you like. Only the clock at the restaurant
            counts, one press per table, per visit.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
