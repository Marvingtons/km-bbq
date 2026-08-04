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
  commit. Both halves are `motion-safe:md:`.
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
