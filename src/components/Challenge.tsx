"use client";

import { useEffect, useRef, useState } from "react";
import localFont from "next/font/local";
import { gsap } from "gsap";
import { ScrollReveal } from "./ScrollReveal";
import { MOTION, prefersReducedMotion } from "@/lib/motion";

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

// The LED is the site's ember-red, not a red of its own. It used to be a
// one-off #ff2a1e; that is the same red the mural's flames and the logo's flame
// are painted in, so it now comes from the token like everything else.
const LED_RED = "var(--color-ember-red)";
// The unlit segments: the same red at 8%, so the ghost layer is literally the
// live colour turned down rather than a second dark red.
const LED_UNLIT = "color-mix(in srgb, var(--color-ember-red) 8%, transparent)";

// Shared LED text treatment: the glow is what sells it as emitted light rather
// than red paint, and every lit layer uses the same one.
const ledGlow =
  "0 0 6px color-mix(in srgb, var(--color-ember-red) 55%, transparent), 0 0 18px color-mix(in srgb, var(--color-ember-red) 28%, transparent)";

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
        background: lit ? LED_RED : LED_UNLIT,
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
        // The flash cadence and the elastic below are the RESULT MOMENT, and
        // the result moment is a settled part of the mechanic. Their eases come
        // from the shared table; their beats are how fast a scoreboard blinks,
        // which is the behaviour rather than the timing language.
        duration: won ? MOTION.dur.press : 0.13,
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
        { scale: 1.06, duration: 0.14, ease: MOTION.gsapEase },
        0
      ).to(faceRef.current, {
        scale: 1,
        // The one spring on the site outside the dome, and the same reason:
        // this is a physical object reacting, which is what --ease-press exists
        // for. Stated, not invented.
        duration: MOTION.dur.reveal,
        ease: "elastic.out(1, 0.45)",
      });
      tl.fromTo(
        glowRef.current,
        { opacity: 0 },
        { opacity: 0.9, duration: 0.14, ease: MOTION.gsapEase },
        0
      ).to(glowRef.current, { opacity: 0, duration: 0.75, ease: MOTION.gsapEase }, 0.18);

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
            ease: MOTION.gsapEase,
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

  // OFF-SCALE, and correctly so: the digits are sized to the PANEL they sit in,
  // not to the page. A seven-segment readout that stepped with the type scale
  // would stop fitting its own window. Same class of exception as the hero.
  const digitSize = "text-[clamp(38px,11vw,58px)]";

  return (
    <section
      id="challenge"
      aria-labelledby="challenge-heading"
      // Same ground and the same padding scale as every other section. The
      // seam-morph it used to carry (paper -> cream) is gone with the Gallery's
      // paper ground: nothing changes underfoot here any more.
      className="grain relative bg-cream py-section md:py-section-lg"
    >
      {/* THE ONE CENTRED SECTION ON THE SITE.
          Everything else left-aligns to the page grid; centring is spent
          exactly once, here, because the subject is a physical object bolted
          to a wall and an object centres under its own heading. That is what
          makes it read as a decision rather than as the default state.
          It still sits inside `.grid-page`, so its outer margins are the same
          margins as every other section — only its alignment differs. */}
      <div className="grid-page">
        <div className="col-full mx-auto flex max-w-md flex-col items-center text-center">
        <ScrollReveal>
          <p className="eyebrow mb-4">House game</p>
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <h2 id="challenge-heading" className="h2-scale">
            Beat the <em className="italic text-pink">clock</em>
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="copy mt-4">
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
            // rounded-prop: the one stated exception to the radius rule. This
            // is not a card, a control or a ground — it is a picture of a
            // machine, and a moulded corner is what a machine has.
            className="relative mx-auto mt-9 w-full max-w-[380px] rounded-prop p-5 shadow-[0_26px_50px_-24px_rgb(120_60_20/0.55),0_10px_20px_-14px_rgb(26_26_26/0.4)] ring-1 ring-black/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ember sm:p-6"
            // plum-ink, not the old neutral near-black. This and the footer are
            // the two dark grounds on the site, and both have to hold the pink
            // mark and the ember accent at once; the ramp is plum-ink lifted
            // toward white at the top and dropped toward black at the bottom,
            // so the housing is one colour lit from above rather than three
            // greys. Same light direction as before, same material.
            style={{
              background:
                "linear-gradient(158deg, color-mix(in srgb, var(--color-plum-ink) 82%, white) 0%, var(--color-plum-ink) 42%, color-mix(in srgb, var(--color-plum-ink) 78%, black) 100%)",
              boxShadow:
                "inset 0 1px 0 rgb(255 255 255 / 0.10), inset 0 -1px 0 rgb(0 0 0 / 0.6)",
            }}
          >
            {/* Four mount screws, one per corner of the housing. */}
            {["left-2.5 top-2.5", "right-2.5 top-2.5", "left-2.5 bottom-2.5", "right-2.5 bottom-2.5"].map(
              (pos) => (
                <span
                  key={pos}
                  aria-hidden="true"
                  className={`absolute ${pos} h-1.5 w-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-plum-ink)_55%,black)] shadow-[inset_0_1px_1px_rgb(255_255_255/0.16)]`}
                />
              )
            )}

            {/* Engraved nameplate. Cut into the panel via a dark text shadow
                over a light top edge, not printed on top of it. No decorative
                dots: the housing is the decoration. */}
            <p
              // white/50, not /35: at 10px on the housing that was 3.2:1.
              className="mb-4 text-center font-sans text-eyebrow font-semibold uppercase tracking-[0.32em] text-white/50"
              style={{ textShadow: "0 1px 0 rgba(255,255,255,0.08)" }}
            >
              Stop the clock
            </p>

            {/* LED window, recessed into the housing.
                THREE LAYERS, all inset-0 on one box and therefore exactly
                registered: the ghost ("8888", every segment at 8%, the way
                unlit LEDs still catch light), the blurred glow used only by the
                win pulse, and the live digits. Measured, all three occupy the
                same rect, so the ghost sits BEHIND the readout and never beside
                it.
                aria-hidden keeps the whole panel out of the accessibility tree
                (the live verdict is announced by the readout line below, which
                is the aria-live region). select-none is what stops the stacked
                layers concatenating into "88881000" when the page is selected
                or copied, or read by anything that walks innerText — the panel
                is a picture of a machine, not text. */}
            <div
              aria-hidden="true"
              className="relative mx-auto flex aspect-[2.9/1] w-full select-none items-center justify-center overflow-hidden rounded-photo"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in srgb, var(--color-plum-ink) 45%, black) 0%, color-mix(in srgb, var(--color-plum-ink) 18%, black) 100%)",
                boxShadow:
                  "inset 0 2px 10px rgb(0 0 0 / 0.9), inset 0 -1px 0 rgb(255 255 255 / 0.05)",
              }}
            >
              <div className={`${dseg7.className} relative ${digitSize} leading-none`}>
                {/* Ghost segments — every segment faintly lit, the way unlit
                    LEDs still catch light on a real display. */}
                <LedDigits
                  secs="88"
                  cents="88"
                  lit={false}
                  color={LED_UNLIT}
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
              className="mt-3 flex min-h-5 items-center justify-center text-center font-sans text-eyebrow font-semibold uppercase tracking-[0.22em]"
              style={{
                color: won ? LED_RED : "rgb(255 255 255 / 0.5)",
                textShadow: won ? ledGlow : undefined,
              }}
            >
              {readoutLine}
            </p>

            {/* Control deck: the button is seated in the same housing, on a
                slightly darker recess so it reads as mounted, not stacked. */}
            <div
              className="relative mt-4 flex items-center justify-center rounded-photo py-5"
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
                className="group relative flex h-[74px] w-[74px] cursor-pointer items-center justify-center rounded-control outline-none sm:h-[86px] sm:w-[86px]"
              >
                {/* Bezel the dome sits in, cut into the deck. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-control"
                  style={{
                    background:
                      "linear-gradient(158deg, color-mix(in srgb, var(--color-plum-ink) 88%, white) 0%, color-mix(in srgb, var(--color-plum-ink) 92%, black) 100%)",
                    boxShadow:
                      "inset 0 2px 5px rgb(0 0 0 / 0.8), 0 1px 0 rgb(255 255 255 / 0.06)",
                  }}
                />
                {/* The dome. On press it sinks INTO the housing: it scales
                    down, drops, and its cast shadow tightens to nothing. */}
                <span
                  aria-hidden="true"
                  className="relative block h-[76%] w-[76%] rounded-control shadow-[0_9px_16px_-4px_rgba(0,0,0,0.75)] transition-[transform,box-shadow] duration-[var(--dur-quick)] ease-press group-hover:brightness-110 group-active:translate-y-[3px] group-active:scale-[0.93] group-active:shadow-[0_2px_4px_-2px_rgba(0,0,0,0.9)] group-active:duration-[var(--dur-press)] motion-reduce:transition-none"
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
          <p className="mt-6 max-w-sm font-sans text-eyebrow font-light leading-relaxed text-foreground/50">
            Practice here as much as you like. Only the clock at the restaurant
            counts, one press per table, per visit.
          </p>
        </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
