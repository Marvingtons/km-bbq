"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HeroBackdrop } from "./HeroBackdrop";
import { MOTION } from "@/lib/motion";
import { findEmbers, buildEmberLoop } from "@/lib/embers";
import {
  collectGrill,
  setAssemblyInitial,
  buildAssembly,
  inWindow,
  span,
  A,
  type Span,
} from "@/lib/assembly";

gsap.registerPlugin(ScrollTrigger);

/* ===========================================================================
   THE MEDIA STAGE — one video element, from the top of the page to the grill.

   THERE IS EXACTLY ONE <video> ON THE HOME PAGE and this is it. It is the
   hero's full-bleed backdrop, it is the panel the hero clips down into, it is
   the circle that panel becomes, and it is what dissolves into the
   illustration. Not a copy of the footage, not a still of it, not a second
   element crossfaded to: the same DOM node the whole way down, still playing.

   WHY A FIXED LAYER (pattern (a)), and why not reparenting (pattern (b)).
   The video has to stay viewport-aligned from scrollY 0 until the illustration
   takes over, which is roughly two viewports later. Three ways to do that:

     - Pin the hero for that whole distance. Two viewports of held scroll, on a
       site already over its budget (DIRECTION.md A3). Rejected.
     - Move the node into the fire section's frame when the hero lets go. React owns this
       node — HeroBackdrop re-renders it on `ready` and on `allowed` — so
       moving it out from under React invites `removeChild` on a node that is
       no longer there, and the spec pauses a media element when it leaves the
       document. Reversing it on every scrub direction change makes that a race
       rather than a one-off. Rejected.
     - Take the video out of the scrolling flow entirely and let clip-path say
       where it is. No pin, no reparenting, no second element. This.

   So `.hero-window` is `position: fixed` and the clip is a pure function of
   scroll: full-bleed -> the panel -> the circle. One writer, one element, one
   continuous shape.

   THE ILLUSTRATION STAYS IN PICK YOUR FIRE'S DOM, and is co-clipped from here.
   It could have lived in this layer, but then it would need a second copy in
   that section for the stacked layout below 1024 — 202 paths of duplicate SVG
   in the markup to avoid one extra clip. Instead the same panel rectangle is
   written twice: once in viewport pixels onto this fixed window, once converted
   into the section's frame and clamped, onto `.media-frame`. Two coordinate systems, one geometry, so
   the illustration is visible exactly where the video is and nowhere else. That
   is what stops the chassis showing above and below the panel before the cut.

   THE STAGE MEASURES A REAL GRID CELL and never recomputes it. `.media-rest`
   is the shape the panel passes through, `.media-frame` is the square the
   circle is inscribed in; both are real boxes in Pick Your Fire's grid. A cell
   cannot be wrong about the grid.
   =========================================================================== */

/**
 * PHASES, as fractions of the PIN. The section holds still for `PIN_VH` of
 * scroll and the mechanism runs in the FIRST TWO THIRDS of it:
 *
 *   circle    0.00-0.14  the rounded panel opens out and rounds to a disc
 *   cut       0.14-0.20  the footage dissolves off, revealing #chassis ONLY
 *   assembly  0.20-0.68  the grill builds itself — see lib/assembly.ts
 *   settle    0.68-1.00  at rest: a finished grill beside finished copy
 *
 * THE REST BEAT IS A THIRD OF THE PIN, AND THAT IS THE POINT OF THE PIN.
 * It used to be 0.04, which meant the fire lit on the reader's last scroll
 * pixel and the composed view — copy left, assembled grill right — existed for
 * one frame before the section released. The reader spent the whole hold
 * reading about gas and charcoal beside a grill that had not been built yet.
 * Now the build is over well before the first paragraph is, and what the held
 * scroll buys is the composed view rather than the machinery.
 *
 * There is no hold at the front. The panel state is what the hero hands over
 * AT the moment of lock, so the first pixel of the pin is already the morph;
 * a hold here would be a rounded rectangle sitting still in a section whose
 * entire purpose is that scrolling drives it.
 *
 * No gap between the moving phases exceeds 0.04. A pinned section that stops
 * responding partway through its mechanism reads as broken scrolling rather
 * than as a pause, because the page itself is not moving either — which is
 * exactly why the one long still stretch is at the END, where the thing being
 * held still is a finished composition and not a half-built object.
 */
const M = {
  circle: [0.0, 0.14],
  cut: [0.14, 0.2],
  assembly: [0.2, 0.68],
  settle: [0.68, 1.0],
} as const;

/**
 * THE PIN'S SCROLL COST, in viewport heights, and it is a CAP.
 *
 * This is held scroll — the part of the page that does not move under the
 * reader — and the site's budget for it (DIRECTION.md Law 6, amended by A3)
 * was already overspent by the hero and the pinned gallery before this
 * existed. The section itself is one viewport instead of the 1.4 it was, which
 * gives about a third of it back, and this number came down from 1.3 with the
 * retimed build above: the sequence no longer needs the distance, so the
 * reader no longer pays for it. It stays a hard cap either way —
 * tools/verify-assembly.mjs measures the pin-spacer and fails if it grows past
 * this number.
 */
const PIN_VH = 0.7;

/**
 * Ember hand-off, with hysteresis.
 *
 * The loop takes over where ignition ends (M.settle[0]) and hands back well
 * before it — the gap is what stops a scrub that jitters at rest from building
 * and killing a four-target stagger on alternate frames. Both moved forward
 * with the retimed assembly; the band between them is the tail of the ignition
 * ramp, exactly as it was.
 */
const LOOP_ON = 0.68;
const LOOP_OFF = 0.62;

/**
 * How much of the dock the panel's SIDES take, against the full travel its top
 * and bottom take. See the note in `paint()`: it is what puts a clip edge off
 * the fire copy's column before that copy is revealed on it.
 *
 * FIRE_COPY_IN is its other half, one written as a fraction of the dock and one
 * as a fraction of a viewport, because the dock IS one viewport. Change one,
 * change the other.
 */
const SIDES_LEAD = 0.55;

export function MediaStage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const win = root?.querySelector<HTMLElement>(".hero-window");
    if (!root || !win) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          /* ELEMENTS, NEVER SELECTOR STRINGS, for anything outside this
             component. `gsap.context(fn, root)` scopes every selector string
             inside it to `root`, including a ScrollTrigger's `trigger` — so
             `trigger: "#pick-your-fire"` resolves against the media stage, finds
             nothing, and the trigger silently reports progress 1 at the top of
             the page. The panel was docked before the reader had scrolled. */
          const fire = document.getElementById("pick-your-fire");
          const frame = fire?.querySelector<HTMLElement>(".media-frame");
          const rest = fire?.querySelector<HTMLElement>(".media-rest");
          const stage = fire?.querySelector<HTMLElement>(".fire-stage");
          const svg = fire?.querySelector<SVGSVGElement>(".dual-grill");
          const media = root.querySelector<HTMLElement>(".hero-media");
          const seam = root.querySelector<HTMLElement>(".hero-dock-seam");
          if (!fire || !frame || !rest || !stage || !svg) return;

          // The ONLY thing in the illustration that is ever hidden. Found by
          // colour rather than by name — see src/lib/embers.ts.
          const embers = findEmbers(svg);
          gsap.set(embers, { autoAlpha: 0 });

          // Everything the assembly moves, and the state it starts from. The
          // chassis is deliberately not in either: it is what the cut reveals.
          const parts = collectGrill(svg);
          setAssemblyInitial(parts);

          /* --------------------------------------------------------------
             GEOMETRY, measured off the section's real cells and recomputed only on
             refresh. Everything is stored as PARKED VIEWPORT PIXELS — where
             the panel sits once the media column has come to rest — because
             that is the one frame of reference both the fixed window and the
             sticky frame can be expressed in.

             In pixels, not percentages: `inset()`'s `round` resolves
             percentages against the reference box, which for a viewport-sized
             window is the viewport, so `round 50%` there would be an ellipse
             the size of the screen rather than a circle the size of the frame.
             -------------------------------------------------------------- */
          type Box = { top: number; right: number; bottom: number; left: number };
          let G: {
            rest: Box;
            disc: Box;
            restRadius: number;
            discRadius: number;
            parkTop: number;
          } | null = null;

          const measure = () => {
            const f = frame.getBoundingClientRect();
            const d = rest.getBoundingClientRect();
            if (!f.width || !f.height || !d.width || !d.height) return null;
            /* WHERE THE FRAME SITS ONCE THE SECTION IS PINNED. The section is
               one viewport tall and pins at `top top`, so while it is held its
               own top is at viewport 0 and the frame's viewport position is its
               offset inside the section — a constant, and the one frame of
               reference the fixed window and the pinned frame can share.

               Read as a DIFFERENCE between two live rects, which is
               scroll-invariant: it is the same number before the pin, during
               it, and after it releases. */
            const s = fire.getBoundingClientRect();
            const parkTop = f.top - s.top;
            const dy = parkTop - f.top;
            // THE WINDOW'S OWN RECT, not innerWidth and not clientWidth.
            // `inset()` resolves against the element's reference box, and a
            // fixed inset-0 box is the viewport INCLUDING the scrollbar gutter
            // while clientWidth excludes it. Ten pixels of permanent error on
            // the right edge, which is exactly enough to put the circle's
            // centre off the chassis's.
            const w = win.getBoundingClientRect();
            const asParked = (r: DOMRect): Box => ({
              top: r.top + dy - w.top,
              right: w.right - r.right,
              bottom: w.bottom - (r.bottom + dy),
              left: r.left - w.left,
            });
            return {
              rest: asParked(d),
              disc: asParked(f),
              restRadius:
                parseFloat(getComputedStyle(rest).borderTopLeftRadius) || 0,
              discRadius: f.width / 2,
              parkTop,
            };
          };

          // Two playheads, one shape. `dock` runs while the section rises into
          // place; `morph` runs after it has parked. Their ranges are disjoint
          // and each clamps to 0/1 outside its own, so at every scroll
          // position — including a refresh landing anywhere — exactly one of
          // them is moving and the other is holding the value that makes the
          // join continuous.
          const P = { dock: 0, radius: 0, morph: 0 };

          const mix = (a: number, b: number, k: number) => a + (b - a) * k;

          const paint = () => {
            if (!G) {
              win.style.clipPath = "none";
              frame.style.clipPath = "none";
              return;
            }
            const t = P.dock;
            const m = P.morph;

            /* THE SIDES CLOSE FIRST, and this is not a flourish — it is what
               keeps a clip edge off the type.

               The dock now spans a whole viewport, which means the fire copy is
               already on screen while the panel is still shrinking. If all four
               edges moved together, the left one would sweep right across the
               copy column with the heading under it, and a glyph bisected by a
               hard clip is half a letter: the type is char-on-sand, and the
               half of it over the footage is simply not drawn.

               So the horizontal edges finish in the first 55% of the dock. The
               window narrows to the right-hand column while the copy is still
               behind it, and only then shortens into the panel — and the fire
               copy is revealed on the frame that clearance is reached (see
               FIRE_COPY_IN in lib/motion.ts, which is the same number). The
               vertical edges keep the full travel, so the shape still lands on
               the rest box exactly as the media column parks. */
            const th = gsap.utils.clamp(0, 1, t / SIDES_LEAD);
            const left = mix(0, G.rest.left, th);
            const right = mix(0, G.rest.right, th);
            // Vertical: the dock takes it to the rest box, the morph opens it
            // back out to the square the circle is inscribed in.
            const top = mix(mix(0, G.rest.top, t), G.disc.top, m);
            const bottom = mix(mix(0, G.rest.bottom, t), G.disc.bottom, m);
            const rad = mix(P.radius, G.discRadius, m);

            win.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${rad}px)`;

            // THE SAME RECTANGLE, IN ABOUT'S FRAME. The illustration lives in
            // the fire section's DOM so the stacked layout below 1024 has it in
            // flow, which means it needs its own copy of this shape — clamped
            // at zero, so where the panel does not reach the frame the clip is
            // empty and the chassis simply is not painted. Without this the
            // grill's top and bottom arcs show above and below the panel from
            // the moment the section scrolls into view.
            const f = frame.getBoundingClientRect();
            const w = win.getBoundingClientRect();
            const pt = w.top + top;
            const pl = w.left + left;
            const pr = w.right - right;
            const pb = w.bottom - bottom;
            const c = (n: number) => Math.max(0, n);
            frame.style.clipPath =
              `inset(${c(pt - f.top)}px ${c(f.right - pr)}px ` +
              `${c(f.bottom - pb)}px ${c(pl - f.left)}px round ${rad}px)`;
          };

          /* THE RELEASE. A fixed layer does not scroll away on its own, so the
             last thing the stage does is follow the SECTION out of the page:
             zero while the section is still arriving or pinned, and the
             section's own overshoot once the pin lets go. That reproduces the
             pin's release exactly, because it IS the pinned element's
             displacement — read, not modelled. */
          const follow = () => {
            const y = Math.min(0, fire.getBoundingClientRect().top);
            gsap.set(win, { y, autoAlpha: y < -window.innerHeight ? 0 : 1 });
          };

          const refresh = () => {
            G = measure();
            paint();
            follow();
          };

          /* ============================================================
             STAGE ONE — the hero hands over.

             The window runs from the section entering the bottom of the viewport to
             the section's top reaching the top of it, which is one viewport of
             scroll and, more usefully, ENDS ON THE FRAME EXACTLY WHERE THE
             STICKY MEDIA COLUMN COMES TO REST. The dock and the park are the
             same event; there is no stretch where a docked panel is waiting
             for a frame that has not arrived, which is what made the previous
             version show two boxes.
             ============================================================ */
          const exitSupport = Array.from(
            document.querySelectorAll<HTMLElement>("#home .hero-exit-support")
          );
          const exitDisplay = document.querySelector<HTMLElement>(
            "#home .hero-exit-display"
          );

          const dock = gsap.timeline({
            defaults: { ease: "none" },
            onUpdate: paint,
            scrollTrigger: {
              trigger: fire,
              start: "top bottom",
              end: "top top",
              scrub: MOTION.scrub,
              invalidateOnRefresh: true,
              onRefresh: refresh,
              onUpdate: follow,
            },
          });

          // PHASE A. The copy leaves before the panel moves. Every tween is a
          // `fromTo` with an explicit from-state: `invalidateOnRefresh`
          // re-reads the start value of a `.to()` off the live element, so a
          // mid-scroll refresh would record "opacity 0.4" as the start and
          // scrolling back would never restore the copy.
          if (exitSupport.length)
            dock.fromTo(
              exitSupport,
              { y: 0, autoAlpha: 1 },
              {
                y: -MOTION.rise,
                autoAlpha: 0,
                duration: 0.1,
                stagger: 0.03,
                ease: MOTION.gsapEaseInOut,
                immediateRender: false,
              },
              0.03
            );
          if (exitDisplay)
            dock.fromTo(
              exitDisplay,
              { y: 0, autoAlpha: 1 },
              {
                y: -MOTION.rise,
                autoAlpha: 0,
                duration: 0.1,
                ease: MOTION.gsapEaseInOut,
                immediateRender: false,
              },
              0.1
            );

          // The corner radius resolves while the frame is still full-bleed and
          // its corners are the viewport's own, so it is a CONSTANT for the
          // whole geometric travel and the hero's rest frame stays square.
          dock.fromTo(
            P,
            { radius: 0 },
            { radius: () => G?.restRadius ?? 0, duration: 0.08 },
            0
          );

          // PHASE B. The frame shrinks into the cell, finishing exactly as the
          // media column parks.
          dock.fromTo(
            P,
            { dock: 0 },
            { dock: 1, duration: 0.72, ease: MOTION.gsapEase },
            0.28
          );

          // PHASE C. The hairline draws at the seam, then leaves with the
          // rectangle it belonged to — a vertical rule down the side of a
          // circle is not a seam, it is a tangent.
          if (seam)
            dock.fromTo(
              seam,
              { scaleY: 0 },
              {
                scaleY: 1,
                duration: 0.12,
                ease: MOTION.gsapEase,
                immediateRender: false,
              },
              0.86
            );

          // The footage drifts against the clip, on the SAME playhead, so it
          // can never desync from the shape it drifts inside. The 8% vertical
          // bleed on `.hero-media` is the travel room.
          if (media)
            dock.fromTo(media, { yPercent: 0 }, { yPercent: 4, duration: 1 }, 0);

          /* THE EMBER AND VIDEO HAND-OFFS ARE DECLARED BEFORE THE TIMELINE
             THAT CALLS THEM. Building a timeline with a ScrollTrigger attached
             refreshes it immediately, which calls onRefresh, which calls
             onMorph — so anything onMorph reads has to already exist. Read a
             `let` from inside that first synchronous call and it is a
             temporal-dead-zone ReferenceError before the page has painted. */

          /** What the master alone wants the embers at, for a given progress. */
          const EMBERS: Span = inWindow(M.assembly, A.embers);
          const emberOpacityAt = (p: number) =>
            gsap.utils.clamp(0, 1, (p - EMBERS[0]) / span(EMBERS));

          /**
           * HAND-OFF: KILL AND REBUILD, NOT PAUSE AND RESUME. A staggered yoyo
           * still owns its per-target sub-tweens while paused, so a `gsap.set`
           * issued straight after `pause()` races them — and one ember of four
           * reliably stayed at the loop's 0.65 floor all the way back down to
           * progress 0, glowing under an unlit grill.
           */
          let loop: gsap.core.Tween | null = null;
          function stopLoop(progress: number) {
            if (!loop) return;
            loop.kill();
            loop = null;
            // `autoAlpha`, not `opacity`, so the hand-back writes BOTH halves
            // of what the ignition tween owns. Handing back opacity alone left
            // an ember at `visibility: visible; opacity: 0` — invisible, but a
            // state the timeline had not put it in, and the next thing to touch
            // visibility inherited the mismatch.
            gsap.set(embers, { autoAlpha: emberOpacityAt(progress) });
          }

          let wantVideo = true;
          const syncVideo = () => {
            const v = win.querySelector("video");
            if (!v) return;
            if (wantVideo && v.paused) v.play().catch(() => {});
            else if (!wantVideo && !v.paused) v.pause();
          };
          function wantAt(progress: number) {
            wantVideo = progress < M.cut[1];
            syncVideo();
          }
          // `play` does not bubble, so this is a CAPTURE listener — which is
          // what lets one handler cover an element that does not exist yet.
          win.addEventListener("play", syncVideo, true);

          /* ============================================================
             STAGE TWO — the morph, the cut, and the fire.
             ============================================================ */
          /**
           * EVERYTHING GATES ON THE TIMELINE'S PROGRESS, NOT THE SCROLL'S, and
           * that distinction is the whole of a bug that took an evening.
           *
           * A scrub does not track the wheel; it CHASES it, 0.4s behind. The
           * ScrollTrigger's `progress` is where the reader is, the timeline's is
           * what is painted, and the ember loop hands off from the TIMELINE —
           * it takes over the embers exactly where the ignition tween let go.
           *
           * Gated on the scroll instead, the loop started while the ignition
           * tween was still ramping the same property, and the two fought for
           * however long the catch-up lasted. That was survivable on a 1350px
           * scrub, where 0.4s is a few percent of the range. This section is
           * 360px: the same 0.4s is most of it, and one ember of four came out
           * of the fight stuck at the loop's 0.65 floor, visible under an unlit
           * grill, permanently — the same failure the kill-and-rebuild note
           * below describes, arriving by a different route.
           *
           * The timeline's own `onUpdate` also fires on every frame the scrub
           * renders, where the ScrollTrigger's only fires on scroll events. So
           * the last word after the wheel stops belongs to this, not to a stale
           * reading taken mid-catch-up.
           */
          const onMorph = () => {
            paint();
            const p = morph.progress();
            // HYSTERESIS, not a threshold. Starting and stopping on the same
            // number means a scrub that jitters across it — which is what a
            // trackpad does at rest — builds and kills a four-target stagger
            // on alternate frames.
            if (p > LOOP_ON) {
              if (!loop) loop = buildEmberLoop(embers).play(0);
            } else if (p < LOOP_OFF) {
              stopLoop(p);
            }
            // Do not decode frames behind an opaque illustration. Declared as a
            // want and enforced below, because the element mounts `autoPlay`
            // after `window.load` and HeroBackdrop's own IntersectionObserver
            // resumes it on re-entry — and `visibility: hidden` still
            // intersects.
            wantAt(p);
          };

          /* THE TIMELINE FIRST, ITS TRIGGER LAST — not `gsap.timeline({
             scrollTrigger })`, which builds both at once. `onMorph` closes over
             this timeline to read its progress, and creating the trigger inline
             lets it refresh before the assignment has landed, so the first
             callback can reach a variable that does not have a value yet. Built
             in two steps the hazard cannot exist, and the trigger also gets to
             measure a timeline that already has all its tweens on it. */
          const morph = gsap.timeline({
            defaults: { ease: "none" },
            onUpdate: onMorph,
          });

          // The panel opens out and rounds down to a disc. Both ends of the
          // shape are the same `inset()`; the box it is inscribed in is square,
          // which is the only reason the end state is a circle and not a
          // squircle.
          morph.fromTo(
            P,
            { morph: 0 },
            { morph: 1, duration: span(M.circle), immediateRender: false },
            M.circle[0]
          );
          // The room going out of the footage as it becomes an object.
          morph.fromTo(
            root.querySelector(".photo-tint"),
            { opacity: 0 },
            { opacity: 0.35, duration: span(M.circle), immediateRender: false },
            M.circle[0]
          );

          // THE CUT, AND IT REVEALS A BARE PAN. The chassis has been sitting
          // under the footage at the same diameter the whole time, co-clipped
          // to the same shape; this is only the footage ceasing to cover it.
          // Everything else the grill is made of is hidden behind it and
          // arrives afterwards, which is what the rest of the pin is for.
          morph.fromTo(
            root.querySelector(".media-plate"),
            { autoAlpha: 1 },
            { autoAlpha: 0, duration: span(M.cut), immediateRender: false },
            M.cut[0]
          );

          // THE ASSEMBLY: burner plate, dial sweep, bowl, coal pour, the grate
          // landing over the coals, the seam. See lib/assembly.ts.
          buildAssembly(morph, parts, M.assembly, "none", "none");

          // IGNITION, at the tail of the assembly's own window.
          morph.fromTo(
            embers,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: span(EMBERS), immediateRender: false },
            EMBERS[0]
          );

          // THE SETTLE, AS A REAL BEAT, and now a third of the pin. Nothing
          // animates in it, but it has to OCCUPY time: a scrubbed timeline is
          // only as long as its last tween, so without this the whole thing
          // would end at 0.68 and the pin's scroll would be remapped onto
          // 0..0.68 — every phase boundary landing where it used to, and the
          // compression undone by the very thing meant to express it.
          morph.to({}, { duration: span(M.settle) }, M.settle[0]);

          /* THE PIN. The section is one viewport tall and locks at `top top`,
             so the composed view — copy left, media right — is fully on screen
             and STAYS there while scroll drives the whole sequence. Nothing
             inside it moves of its own accord; the only thing travelling is the
             timeline.

             `end` is a hard cap, not a target: see PIN_VH. `anticipatePin`
             because a pin that engages a frame late shows one frame of the
             section still scrolling, which on a section this composed reads as
             a jolt. */
          const morphST = ScrollTrigger.create({
            trigger: fire,
            start: "top top",
            end: `+=${PIN_VH * 100}%`,
            pin: true,
            // Default pinType. Lenis smooths the WINDOW scroll position rather
            // than transforming a wrapper, so ScrollTrigger's normal
            // fixed-position pinning is correct here — forcing
            // pinType: "transform" is what makes a pin jitter under Lenis.
            scrub: 0.4,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            animation: morph,
            // Only the things that are about where the READER is: the fixed
            // layer's release, and re-measuring. Everything about what is
            // PAINTED rides the timeline's own onUpdate.
            onUpdate: follow,
            onRefresh: () => {
              refresh();
              onMorph();
            },
          });



          /* THE RELEASE NEEDS ITS OWN RANGE. `follow` rides the two timelines'
             `onUpdate`, and both stop firing at their own end — the morph's is
             the section's last scroll pixel, which is precisely where the stage
             has to START leaving. Without this the fixed layer parks a grill in
             the middle of the gallery. `bottom top` carries it until the
             section is entirely above the viewport, by which point `follow` has
             translated it a screen out and switched it off. */
          const release = ScrollTrigger.create({
            trigger: fire,
            start: "top top",
            // The pin's own distance PLUS a viewport: the release only begins
            // where the pin ends, so a range that stopped there would stop
            // firing on the exact pixel it is needed for.
            end: `+=${(PIN_VH + 1) * 100}%`,
            onUpdate: follow,
            onRefresh: follow,
          });

          refresh();

          return () => {
            win.removeEventListener("play", syncVideo, true);
            loop?.kill();
            release.kill();
            dock.scrollTrigger?.kill();
            morphST.kill();
            dock.kill();
            morph.kill();
            win.style.clipPath = "";
            frame.style.clipPath = "";
            gsap.set(win, { clearProps: "transform,opacity,visibility" });
          };
        }
      );

      /* Below 1024, and for anyone who has asked for less motion, nothing here
         runs at all: the window is `position: absolute` inside the hero, no
         clip is ever written, and the illustration is a block in normal
         flow with its own entrance. */
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="media-stage" aria-hidden="true">
      {/* THE WINDOW — the one box that is clipped, and the only place a
          <video> exists on this page. Viewport-sized so the clip's pixels mean
          what they say. The media inside carries an 8% vertical bleed, which is
          the drift's travel room, so it has to be a separate box from the thing
          being clipped. */}
      <div className="hero-window">
        {/* The plate is what the cut dissolves — the footage AND the tint that
            has been taking the room out of it. Fading the footage alone would
            leave a char wash sitting over the illustration. */}
        <div className="media-plate">
          <HeroBackdrop className="hero-media absolute inset-x-0 -inset-y-[8%]" />
          {/* Char, not a black. Its own element because the plate's opacity is
              the cut and cannot also be the tint. */}
          <span className="photo-tint" />
        </div>
      </div>

      {/* The chrome hairline at the panel's seam, drawn by the scrub once the
          window has docked. No height until it is measured. */}
      <span className="hero-dock-seam pointer-events-none absolute left-0 top-0 z-nav w-px origin-top scale-y-0 bg-gradient-to-b from-transparent via-flame/70 to-transparent" />
    </div>
  );
}
