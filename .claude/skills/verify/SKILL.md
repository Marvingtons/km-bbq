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
- **Hero:** `HeroBackdrop.tsx` (not `HeroVideo.tsx`, deleted). It renders
  `live-grill.png` as an interim still under a char scrim plus an accent radial;
  the R2 clip is wired but `VIDEO_SRC` is unset, so there is usually no
  `<video>` in the DOM at all. There is no `hero-poster.webp` — it was deleted.
- **Hero arithmetic:** the hero is **160vh** with a sticky stage and About is
  pulled up **`-mt-[60vh]`**. One number written twice; change both in one
  commit. Both halves are `motion-safe:md:`.
- **There is NO mural on this site,** and that is enforced, not incidental. The
  old illustration set (tiger, samulnori drummer, hanok, Hahoe mask, flame
  mascot, stews) was never the restaurant's wall and is not to be restored — see
  DIRECTION.md. The real wall mural has never been photographed for the site.
- **The gallery is not pinned.** It is a native scroll-snap strip with all three
  captions visible in flow under their photograph. No GSAP, no ScrollTrigger.
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
- `node tools/hero-worst-frames.mjs` then
  `node tools/hero-glyph-contrast.mjs --effective [url]` — per-glyph contrast
  against the actual pixels behind each letterform. Written for the video hero;
  **useful again only when the hero pass lands**, since there is currently no
  clip to sample frames from.

`tools/verify-hero.mjs` was **deleted**. Every assertion it carried — cream
base, `hero-poster.webp`, cream glyph halos, the blurred copy plate, the sRGB
scrim — described elements removed two directions ago. It had been unrunnable
since `dca56c5` and nobody noticed, which is the exact failure this file is now
written to avoid. Do not resurrect it; write the hero's checks fresh when the
hero pass decides what the hero is.

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
