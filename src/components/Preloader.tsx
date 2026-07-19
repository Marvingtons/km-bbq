"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Logo } from "./Logo";
import { PRELOADER } from "@/lib/motion";

// The overlay's markup is ALWAYS server-rendered, so it is present and painted
// in the very first frame. Whether it is actually shown is decided by the
// inline script in the layout, which sets data-preloader on <html> before
// paint; CSS keys off that attribute.
//
// This replaces a useSyncExternalStore approach whose server snapshot said
// "skip". That kept the overlay out of the SSR HTML entirely, so the hero
// painted first and the overlay only appeared once React had hydrated — which
// is exactly the flash this component exists to prevent.
const shouldRun = () =>
  document.documentElement.getAttribute("data-preloader") === "run";

/**
 * The preloader: a cream field over the already-rendering page, on which the
 * real sign mark builds itself. Beats (see PRELOADER in lib/motion.ts):
 *
 *   1. LINE IN — ember hairline scales in beneath the mark.
 *   2. MARK BUILDS — the 8 logo paths stagger in, in document order (badge, K,
 *      flame, M, dot, B, B, Q), while the whole lockup settles 1.04 -> 1.
 *   3. EYEBROW — "Korean Barbecue" fades in below the line, overlapping.
 *   4. HOLD — a deliberate rest with the mark assembled. Load-aware: if the
 *      page is already ready when the mark finishes assembling, the hold is
 *      skipped and the exit plays immediately; if the page is still loading
 *      after the hold, the assembled mark simply holds (no spinner) until the
 *      window load event, then exits.
 *   5. EXIT — the line stretches to 3x, the lockup fades, and the cream field
 *      wipes upward to reveal the hero; the line reads as the sweeping edge.
 */
export function Preloader() {
  const [dismissed, setDismissed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The inline script already decided this, before paint.
    if (!shouldRun()) return;
    const root = rootRef.current;
    if (!root) return;

    // Mark shown immediately so an in-session navigation mid-animation still
    // skips the loader on the next page. (`preloading` was already added by the
    // inline script, so the scroll lock and the hero video's hold have been
    // active since the first frame.)
    sessionStorage.setItem("km-preloader-shown", "1");

    const q = gsap.utils.selector(root);
    const isLoaded = () => document.readyState === "complete";
    const onWindowLoad = () => tl.play("exit");

    const tl = gsap.timeline({ defaults: { ease: PRELOADER.ease } });

    // 1 — LINE IN
    tl.fromTo(
      q(".pre-line"),
      { scaleX: 0.3, autoAlpha: 0 },
      { scaleX: 1, autoAlpha: 1, duration: PRELOADER.line },
      0
    );
    // 2 — MARK BUILDS: paths in document order + one slow breath on the lockup
    tl.fromTo(
      q(".logo-path"),
      { autoAlpha: 0, y: PRELOADER.pathRise },
      {
        autoAlpha: 1,
        y: 0,
        duration: PRELOADER.pathIn,
        stagger: PRELOADER.pathStagger,
      },
      0.15
    );
    tl.fromTo(
      q(".pre-lockup"),
      { scale: PRELOADER.lockupScaleFrom },
      { scale: 1, duration: PRELOADER.build },
      0
    );
    // 3 — EYEBROW, overlapping the build's tail
    tl.fromTo(
      q(".pre-eyebrow"),
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: PRELOADER.eyebrow },
      PRELOADER.build - 2 * PRELOADER.eyebrow
    );

    // 4 — assembled checkpoint: page already loaded -> skip the HOLD.
    tl.addLabel("assembled", PRELOADER.build);
    tl.call(() => {
      if (isLoaded()) tl.play("exit");
    });
    tl.to({}, { duration: PRELOADER.hold }); // the deliberate rest beat
    // Still not loaded after the hold: park on the assembled mark (no spinner,
    // no pulse) and exit the moment the window load event lands.
    tl.call(() => {
      if (!isLoaded()) {
        tl.pause();
        window.addEventListener("load", onWindowLoad, { once: true });
      }
    });

    // 5 — EXIT: the hero video restarts from frame one as the wipe begins.
    tl.addLabel("exit");
    tl.call(
      () => document.documentElement.classList.remove("preloading"),
      [],
      "exit"
    );
    tl.to(
      q(".pre-lockup"),
      {
        autoAlpha: 0,
        scale: PRELOADER.exitLockupScale,
        duration: 0.5,
        ease: "power2.out",
      },
      "exit"
    );
    tl.to(
      q(".pre-eyebrow"),
      { autoAlpha: 0, duration: 0.4, ease: "power2.out" },
      "exit"
    );
    tl.to(
      q(".pre-line"),
      {
        scaleX: PRELOADER.exitLineStretch,
        duration: PRELOADER.exit,
        ease: PRELOADER.exitEase,
      },
      "exit"
    );
    tl.to(
      root,
      { yPercent: -100, duration: PRELOADER.exit, ease: PRELOADER.exitEase },
      "exit"
    );
    tl.call(() => {
      // Flip the attribute before unmounting: if anything ever remounts this
      // component in-session, CSS keeps the overlay hidden rather than letting
      // the intro replay.
      document.documentElement.setAttribute("data-preloader", "skip");
      setDismissed(true); // unmount: overlay leaves the DOM
    });

    return () => {
      window.removeEventListener("load", onWindowLoad);
      tl.kill();
      document.documentElement.classList.remove("preloading");
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      ref={rootRef}
      // `preloader-overlay` carries the visibility rule (globals.css) plus the
      // failsafe that clears it if JS never gets to run the timeline.
      className="preloader-overlay fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-cream"
      role="status"
      aria-label="KM.BBQ is loading"
    >
      {/* Elements start CSS-hidden so nothing flashes before the timeline's
          first tick; GSAP owns their states from there. */}
      <div className="pre-lockup w-[min(70vw,340px)] [&_.logo-path]:opacity-0">
        <Logo size={340} className="h-auto w-full" />
      </div>
      <div
        aria-hidden="true"
        className="pre-line mt-7 h-0.5 w-[120px] rounded-full bg-ember opacity-0"
      />
      <p className="pre-eyebrow mr-[-0.34em] mt-6 font-sans text-xs font-medium uppercase tracking-[0.34em] text-ember-deep opacity-0">
        Korean Barbecue
      </p>
    </div>
  );
}
