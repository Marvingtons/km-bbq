---
name: verify
description: Build, run, and visually verify kmbbq (Next.js site) changes with Playwright screenshots
---

# Verifying kmbbq changes

**Read [DIRECTION.md](../../../DIRECTION.md) first.** It carries the decided
visual direction and ten constraints phrased so a violation is checkable. A
change that passes every runner here and violates one of those constraints has
still failed.

Build + serve (never rebuild `.next` while `next start` is running — it serves
garbage; stop the server first):

```
npm run build
npx next start -p 3111        # run in background
```

Drive the UI with Playwright (`playwright-core` comes via `@playwright/test`,
browsers already installed). Scripts inside `tools/` resolve it by relative
path; scripts run from outside the repo need the same treatment, since
**`NODE_PATH` does not work for ESM** — import by absolute URL instead:

```js
const pw = await import(new URL("<repo>/node_modules/playwright-core/index.js").href);
const chromium = (pw.default ?? pw).chromium;   // it is CJS, so unwrap .default
```

## The site as it actually is

- **Two-value palette.** Warm-light ground (`--color-sand #f2eadd`), black as
  STRUCTURE only (nav, footer, section caps), chrome (`--color-steel`) as the
  material that bridges them. One accent, `--color-flame #bc2c19`, whose job is
  interaction.
- **The accent is text only on the warm ground.** On char it is 3.15:1 and on a
  sky band 3.52:1, so on those grounds it appears as a FILL and links are sand.
  Deliberate, and `verify-palette.mjs` asserts it stays that way.
- **Hero:** `HeroBackdrop.tsx` (not `HeroVideo.tsx`, deleted). It is a **video**
  hero now: `kmbbq-hero.mp4` served straight from R2, over a
  `/images/hero-poster.webp` cut from the clip at 2.6s, under a char scrim plus
  an accent radial.
  - **Playback starts at 2.6s and loops back to 2.6, not 0.** The first ~1.8s is
    the bare plate and the oiling hand. There is deliberately **no `loop`
    attribute** — `onEnded` seeks to `START`, and `ended` does not fire when
    `loop` is present.
  - The `<video>` is mounted **after `window.load`**, and not at all under
    reduced motion or save-data. The poster never unmounts, so every failure
    path (R2 down, codec, autoplay refused) lands on a real photograph.
  - **The poster's `sizes` is load-bearing.** `object-cover` draws the 16:9
    poster ~30% wider than the viewport; told `100vw` the browser picks a 1200px
    variant, Chrome scores that LCP candidate below the video's, and the video
    takes the LCP slot at ~3.6s. `sizes="(max-width: 768px) 140vw, 1920px"` is
    what keeps LCP at ~544ms. Do not "simplify" it back to `100vw`.
  - **The clip is not faststart** (`moov` after `mdat`), so first video frame is
    ~3.6s on a 4Mbps profile. That is an asset defect, logged as NEEDS-ASSETS
    #1a, not a code one.
- **Hero arithmetic:** the hero is **160vh** with a sticky stage and About is
  pulled up **`-mt-[60vh]`**. One number written twice; change both in one
  commit. Both halves are `motion-safe:lg:` — the window clips into About's
  square media frame, which only exists above 1024, so below that bracket the
  extra viewport and the negative margin are switched off together. They were
  `md:` until the About/Pick Your Fire merge; the whole composed sequence now
  lives at the same 1024px the pinned gallery uses.
- **THERE IS EXACTLY ONE `<video>` ON THE HOME PAGE.** It is the hero's
  backdrop, the panel the hero clips into, the circle that becomes, and what
  dissolves into the illustration — one DOM node the whole way, still playing.
  `verify-assembly.mjs` asserts `querySelectorAll('video').length === 1` at
  every scroll position, because a second one "just for About" is the obvious
  implementation and it puts two boxes of the same footage on screen at once.
  - **`MediaStage.tsx` owns it, and `.hero-window` is `position: fixed`.** Not
    sticky (it would stop being viewport-aligned when the hero released), not
    reparented (React owns the node, and the spec pauses a media element when it
    leaves the document), not pinned (two viewports of held scroll). Fixed +
    clip-path costs no scroll and needs no second element.
  - **The clip is written in PIXELS.** The window's reference box is the
    viewport *including* the scrollbar gutter, so a percentage there is ~10px
    wrong on the right edge — permanently, not as an edge case.
  - **The dock runs one full viewport**, from About entering the bottom of the
    screen to its top reaching the top — because that is the frame About's
    sticky media column parks on, and the dock and the park must be the same
    event. It is NOT bounded by `HERO_SCRUB` any more.
  - **The sides close first (`SIDES_LEAD` = 55%), and the story appears on that
    frame (`ABOUT_COPY_IN`).** With a viewport-long dock the copy is on screen
    while the panel is still shrinking; if all four edges moved together the
    left one would sweep across the heading and draw half a glyph at a time.
    The two constants are one number written twice.
  - **`.media-rest` is one box with two readers**: MediaStage builds the panel's
    rest shape from it, and the hero's window docks into it (it carries
    `.col-media`). Do not give either its own numbers.
- **Page order: Hero → Pick Your Fire → What to grill first → Our Story →
  Gallery → Contact → Beat the Clock.** The grill sequence opens the page; the
  story is a quiet two-column section AFTER the menu preview. `id="about"` is on
  Our Story (the nav's ABOUT link means that copy); `id="pick-your-fire"` is the
  morph section. Three components: `PickYourFire.tsx`, `Favorites.tsx`,
  `About.tsx`.
  - **Our Story has one fade and nothing else** — no scrub, no sticky, no
    animated illustration, no CTA (the menu preview directly above ends with
    one). Its media is `about.png` as **declared artwork**: a cave painting on a
    parchment ground, in a cream mat inside a 1px ochre hairline
    (`.artwork-card` / `.artwork-frame`), with a provenance caption crediting
    the dining-room mural. The mat is load-bearing — the parchment is warmer
    than `--color-sand` and a bare image reads as a patch of the page rather
    than a picture on it. Never `.photo`: that treatment's grade and bottom
    scrim exist to sink photographs INTO the ground. `live-grill.png`, which
    this replaced, is gallery tile 4 ("Mid-service").
- **Pick Your Fire PINS.** One viewport tall, locks at `top top`, held for
  PIN_VH = 0.7 viewports while scroll drives the whole sequence. Phases: circle
  0.00-0.14, cut 0.14-0.20 (revealing #chassis ONLY), assembly 0.20-0.68,
  **at rest 0.68-1.00**. Nothing in the section moves during the hold — that is
  the point; before the pin the composed view scrolled apart mid-animation.
  - **THE BUILD LIVES IN THE FRONT TWO THIRDS, AND THAT IS A FIX.** It used to
    run 0.26-0.96 of a 1.3vh pin, so the fire lit on the reader's last scroll
    pixel: they sat beside two finished paragraphs about gas and charcoal
    watching a half-built grill. The rest beat is now a third of the pin and is
    what the held scroll actually buys. `verify-assembly.mjs` asserts it at
    0.70 — everything at full opacity, mesh and seam drawn, embers already lit.
  - **THE GRILL ASSEMBLES**, piece by piece: burner plate, dial sweep
    (angle-sorted, NOT DOM order), bowl, coal pour (shuffled, pre-assigned
    rotations), grate landing OVER the coals (the longest window — the featured
    beat), mesh weave, seam, fire. `src/lib/assembly.ts` owns the choreography
    and the three orderings, because it plays twice: scrubbed in the pin above
    1024, and as a 1.2s eased one-shot below it.
  - **HELD SCROLL IS THE PRICE.** 0.7vh here on top of the hero's 0.6 and the
    gallery's 1.42 — about 2.7vh against Law 6's budget of 1.0, down from 3.3
    when the pin was 1.3. Owner-directed, capped, and asserted:
    verify-assembly.mjs fails if the pin-spacer grows past section + PIN_VH.
  - **The gallery is no longer the page's only pin.** Any check that counted
    `.pin-spacer` globally has to name its own; verify-gallery.mjs filters for
    the one containing `#gallery`.
  - **CLS: pins register as layout shifts under programmatic scroll.** A pinned
    element goes to `position: fixed` and its in-flow height drops to zero,
    which Chrome scores against it even though the spacer holds the space and
    nothing visible moves. verify-window.mjs partitions those out and asserts
    the transition's own CLS is 0. Both pinned sections show it; always have.
  - **The ember gates read the TIMELINE's progress, not the ScrollTrigger's.**
    A scrub chases the wheel 0.4s behind; the loop hands off from the timeline.
    Gated on scroll, the loop starts while the ignition tween is still ramping
    the same property, and on a 360px scrub — where 0.4s is most of the range —
    one ember of four ends up stuck at the loop's 0.65 floor, permanently.
  - The standalone `PickYourFire.tsx` that was deleted in the merge is back, but
    it is the whole section now, not an illustration beside a paragraph.
  - **THERE IS NO ASSEMBLY.** The illustration is complete from the first
    frame — the payoff is the cut, and a build after it made the reader wait
    through a second event for a picture they had already been shown. Phases are
    hold → circle → cut → ignition → settle. `verify-assembly.mjs` greps both
    components for the old machinery (`buildAssembly`, `dashPrep`, …).
  - **The illustration is CO-CLIPPED to the footage.** It lives in About's DOM
    (so the stacked layout below 1024 has it in flow) and MediaStage writes the
    same panel rectangle onto `.media-frame`, converted into its coordinates and
    clamped. Without it the chassis shows above and below the panel — the rim is
    a full circle in a square frame and the panel at rest is a landscape rect.
  - **The clip starts RECTANGULAR and ends CIRCULAR, in one `inset()`.** The
    frame stays square the whole way — a circle needs a square box — and the
    landscape rest shape comes from `--rest-inset: 12%`. Never tween `inset()`
    to `circle()`; they do not interpolate.
  - **Nothing red or orange renders before ignition.** The ignition set is found
    by COMPUTED FILL, not by class name (`src/lib/embers.ts`), so a hot shape
    added to the artwork later cannot ship glowing under an unlit grill. Today
    it is exactly four: `.ember` ×2 (`--dg-ember #ea5818`) and `.ember-deep` ×2
    (`--color-flame`). There is no pilot flame on the gas side.
  - **The chassis is fitted to the frame by measurement, not by eye.** The
    artwork's rim is 138 x 139.7 in a 150-unit viewBox and sits above centre, so
    `About.tsx` measures it and writes `--dg-fit` / `--dg-x` / `--dg-y`. Without
    that the circle photo dissolves onto a chassis 7% too small.
  - Below 1024, under reduced motion, and with JS off it is plain stacked flow —
    story, photograph, fire copy, illustration — which is the CSS **default**,
    with the sticky layering added inside one media query on top. `<noscript>`
    undoes that layering, because nothing would fade the photograph off the
    illustration it sits on.
  - `tools/verify-assembly.mjs` owns the match: concentricity and diameter at
    progress 0.17 — the middle of the cut, which moved forward with the
    retiming — within 1.5px of centre and 6px of diameter.
- **/menu IS TYPOGRAPHIC. There are no per-item photographs and there will not
  be.** The old ones were stock/generated food presented under the restaurant's
  own item names, which is the provenance rule's central case. Items are rows
  on the cream — printed number, `ROMANIZED — PRINTED ENGLISH`, hangul,
  description, data-driven badges — in two CSS columns with `break-inside:
  avoid` per category. `app/menu/MenuBoard.tsx`. **35 orphaned item images were
  deleted; the five the homepage preview uses are the only food photos left and
  `FEATURED` throws at module load if one loses its `image`.**
  - **`data/menu.ts` is a transcription of the printed lunch and dinner cards.**
    `num` is the restaurant's own item number and is non-contiguous on purpose
    (the dinner card publishes 1B, 4B, 5B and nothing else in that range — the
    gap is not ours to fill). Korean names appear ONLY where a standard dish
    name exists; "Head Shrimp", "Hot Dog", "Corn Cheese" and the rest stand in
    English. The previous file invented both dishes and Korean names.
  - **The lunch/dinner toggle defaults off the visitor's clock via
    `useSyncExternalStore`, never `useState(() => ...)`.** The server has no
    visitor clock, so an initialiser is a hydration mismatch and React discards
    the whole static subtree. `getServerSnapshot` returns lunch; the client
    corrects within a frame. Signature renders in dinner only; in lunch it is a
    non-clickable teaser and no B-item is in the DOM.
  - **Category ink marks use `pathLength={1}`** so one dasharray retracts every
    glyph whatever its geometry. Retracted state is set in JS, drawn once on
    intersect, static under reduced motion.
- **The restaurant TAKES RESERVATIONS** (Yelp), and `acceptsReservations` in the
  JSON-LD is the URL, not `false`. Every surface says "Walk-ins welcome ·
  Reservations available" from `WALK_IN_LINE` — both facts are true and a
  straight swap would have turned away walk-ins. Lunch cutoff is **3:30 PM**,
  confirmed; it shipped as a 4:00 placeholder for one patch.
- **There is NO mural on this site,** and that is enforced, not incidental. The
  old illustration set (tiger, samulnori drummer, hanok, Hahoe mask, flame
  mascot, stews) was never the restaurant's wall and is not to be restored — see
  DIRECTION.md. The real wall mural has never been photographed for the site.
- **The gallery has TWO modes from one DOM.** A GSAP-pinned horizontal scrub
  inside `(min-width: 1024px) and (prefers-reduced-motion: no-preference)`, and
  a native scroll-snap strip everywhere else. The bracket is written twice — in
  `globals.css` and in `gsap.matchMedia()` — and they must stay identical, or
  you get a transformed track inside a live overflow scroller.
  - Captions sit under their photograph in flow in **both** modes. There is no
    caption fade choreography and it is not coming back.
  - **The pinned rules live OUTSIDE `@layer components`, deliberately.**
    Tailwind's utilities are in a later layer, so a layered rule loses to any
    utility regardless of specificity — inside the layer, `md:flex` kept the
    chevrons visible and `md:py-section-lg` kept the section taller than the
    viewport it was pinned to.
  - Held scroll is capped at `min(trackDistance, innerHeight × 1.75)`. It is a
    cap: a longer strip scrubs faster, the pin never grows. See DIRECTION.md
    amendment A3 for the budget this spends.
- **There are no glyph halos.** `.hero-display-glow` / `.hero-copy-glow` and the
  blurred copy plate are gone. Legibility over photography is currently bought
  by the backdrop's own scrim, and is an open question for the hero pass.
- **Preloader:** plays on every full document load including refreshes (no
  session gate; it is in the SSR HTML so it starts at first paint). Its ground
  is **sand**, not black. Time-choreographed at 1.2s with a 2.2s CSS failsafe,
  so screenshot beats drift — capture several frames, or wait ~3.2s before
  shooting. While it is up, `<html>` carries class `preloading` (scroll lock).
  Reduced motion must show the finished badge instantly.

## Runners

All against a built site, all re-deriving their numbers rather than trusting
comments.

- `node tools/verify-palette.mjs [url]` — **the direction guard, and the one to
  run on any colour change.** Static: no retired token (`bone`, `smoke`,
  `ember`, `char-3`, `neon-pink`, `km-blue`) anywhere in `src/`, in a utility or
  a `--color-*`. Computed: every rendered contrast pair against AA, chrome
  distinct from the muted grey in both value and temperature, the ground warm
  and neither predecessor. Rendered: body ground is sand, no `<section>` paints
  a black ground, the footer IS black, the mural set is absent, the mural blue
  appears at most once.
- `node tools/verify-gallery.mjs [url]` — **the two-mode gallery**, and the file
  to run on any gallery change. Heading visibility (it must never be animated),
  first-card alignment against the page container, held-scroll cap, pin-spacer
  count at 1440 / 375 / reduced-motion, the scrub actually travelling, and a
  double round trip across the 1024px boundary to catch stacked pin-spacers.
  35 checks.
- `node tools/verify-assembly.mjs [url]` — **the grill assembly scrub.** Drives
  REAL scroll (gsap is not on `window`, and the wheel is the honest input),
  computing each progress from the pin's own definition — the spacer's offset
  plus `p × PIN_VH × vh`. Asserts the phases in order (cut at 0.17, the beats
  through 0.57, **fully assembled and lit at 0.70**), the ember hand-off
  scrubbed fast across 0.58–1.0, the mobile one-shot, reduced motion, JS-off,
  and two round trips across 1024px. 68 checks.
  - **The section IS pinned, and the spacer is the handle.** Once the pin
    engages the section's own rect is a viewport position and reads 0 for the
    whole hold, so deriving a scroll target from it walks further down the page
    on every call. Read the spacer's offset instead. Scope any pin-spacer count
    to the section: the gallery legitimately has one too.
  - Two traps this cost real time on, both worth remembering: `gsap.fromTo`
    immediate-renders its from-value **even when `paused: true`**, and a paused
    staggered yoyo still owns its per-target sub-tweens, so a `gsap.set` after
    `pause()` races them. The ember loop is therefore killed and rebuilt rather
    than paused and resumed.
  - When screenshotting phases, use `page.screenshot({clip})` or full-viewport —
    `elementHandle.screenshot()` scrolls the element into view and moves the
    scrub, so every frame comes out more assembled than its label.
- `node tools/verify-illustration.mjs [url]` — **the Pick Your Fire section and
  the dual-grill artwork.** The load-bearing check is DOCUMENT ORDER: `#grate`
  must come after `#coals`, because the raw art drew the mesh first and the
  briquettes floated on top of the bars they should rest under. Also asserts
  zero gradients, zero `<style>`, zero `cls-N`, exactly two stroke weights, the
  five distinct coal/ember fills, `role="img"`, the section at 1440/768/375,
  and reduced-motion (embers static at FULL opacity, not frozen mid-pulse).
  44 checks.
  - The artwork is generated: `node tools/build-dual-grill.mjs` rebuilds
    `DualGrill.tsx` from `assets/dual-grill-raw.svg`. Edit the generator, not
    the component — every `d` is copied verbatim and hand-editing 190 paths is
    how geometry drifts.
- `node tools/verify-window.mjs [url]` — the Hero→About window transition: clip
  progression, mid-gesture reversibility, zero layout animation, CLS 0, the
  window opening onto About's sand ground, the chrome hairline, off-screen video
  pause, and the reduced-motion / mobile opt-outs.
- `node tools/verify-choreography.mjs [url]` — section reveal ordering and
  pacing.
- `node tools/verify-mobile.mjs [url]` — 375px: no `<video>` in the DOM at all,
  no horizontal overflow on ANY route, the lockup neither overflowing nor
  colliding (tested in pixels, since `leading-[0.8]` makes the line boxes
  overlap by design), and 44px tap targets.
- `node tools/verify-hero.mjs [url]` — **the video hero**, and the file to run
  on any hero change. Element contract (R2 source, muted/autoPlay/playsInline,
  no `loop`, preload not `auto`, intrinsic ratio, playback past the empty
  opening), the poster underneath, **a 14-frame contrast sweep**, CLS, the
  R2-blocked fallback, reduced motion, and 375px autoplay. 27 checks.
  - The sweep is the point. It hides the type, photographs what is actually
    behind each text block at 14 timestamps, and reports the worst case — a
    poster-only check would hide exactly the problem this hero is known for.
    It composites alpha type over the measured background, because the
    supporting lines are `text-sand/80` and measuring the token alone flatters
    them. It reports `mean` and `p95`, and judges AA on `p95`.
- `node tools/hero-worst-frames.mjs` then
  `node tools/hero-glyph-contrast.mjs --effective [url]` — the older per-glyph
  samplers, written when the hero was cream over video. `verify-hero.mjs`
  supersedes them for the current hero; keep them for glyph-level work.

The **previous** `verify-hero.mjs` was deleted in the direction pass — cream
base, cream glyph halos, a blurred copy plate — all removed two directions ago,
and it had been unrunnable since `dca56c5`. The current file shares only its
name.

## Gotchas worth knowing

- **Full-page screenshots outrun `ScrollReveal`.** It is an
  IntersectionObserver, so `fullPage: true` captures large blank warm gaps where
  content has not been revealed. That is a capture artifact, not a layout bug —
  scroll each section into view and shoot the viewport instead.
- Measuring on the workerd preview (`npm run preview`, :8787) is NOT comparable
  to `next start` for LCP: the Cloudflare Images binding is only emulated
  locally and its optimizer is slow enough to skew which element takes the LCP
  slot. Use `next start` for LCP trend, and a real deploy to settle it.
- Menu page: missing photos render lettered placeholder tiles (build-time
  `fs.existsSync`), not broken images.
- The Next.js dev-mode indicator badge sits bottom-left and will overlap the
  sticky info bar in dev screenshots. It does not ship.
