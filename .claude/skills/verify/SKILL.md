---
name: verify
description: Build, run, and visually verify kmbbq (Next.js site) changes with Playwright screenshots
---

# Verifying kmbbq changes

Build + serve (never rebuild `.next` while `next start` is running — it serves garbage; stop the server first):

```
npm run build
npx next start -p 3111        # run in background
```

Drive the UI with Playwright (`playwright-core` comes via `@playwright/test`, browsers already installed). Scripts run from outside the repo need `NODE_PATH` pointed at the repo's node_modules:

```
$env:NODE_PATH = "<repo>\node_modules"
node <script.js>
```

In scripts: `const { chromium } = require("playwright-core")`.

Gotchas / flows worth driving:
- **Preloader**: plays on every full document load, including refreshes (no session gate; it's in the SSR HTML, so animation starts at first paint). It's time-choreographed, so screenshot beats drift; capture several frames. Reduced motion: `newContext({ reducedMotion: "reduce" })` must show the finished badge instantly. While the overlay is up, `<html>` has class `preloading` (scroll lock + HeroVideo holds on its poster; video resumes when the class is removed).
- Hero media (HeroVideo holds the poster while `preloading`, then plays): the poster is `/images/hero-poster.webp` and it is the page's LCP element; the clip is served from R2, not from `public/` (`pub-364f647b29874b09922e1889f267c323.r2.dev/kmbbq-hero.mp4`). The `<video>` is mounted by an effect and ONLY above 768px, without `prefers-reduced-motion` and without save-data — below any of those the poster is the whole hero and no element exists to drive. The preloader itself is time-based and gates on nothing.
- The hero carries NO mural. The mural's only home is About, full-bleed.
- **The hero is 200vh with a sticky stage, and About is pulled up `-mt-[100vh]` to sit behind it.** That is what lets the hero's video clip down to an inset panel and reveal About's real mural behind it. Net page height is unchanged and About's pin still starts on `top top`. The arithmetic is documented in Hero.tsx — read it before touching either number.
- **NOTHING is layered over the hero footage.** The stack is video, poster, type — full stop. Two cream scrims (full-frame, then shaped-to-the-copy-column) have been built and deleted here; the shaped one composited to grey over the near-black grill vents and read as a diagonal wash. Legibility is bought at the glyphs by cream halos: `.hero-display-glow` and `.hero-copy-glow` in globals.css. Both are cream-only — a grey or black shadow is the failure mode to watch for, and `verify-hero.mjs` asserts against it.
- Runners, all against a built site, all re-deriving their numbers rather than trusting comments:
  - `node tools/hero-worst-frames.mjs` — writes the clip's brightest / busiest / darkest frames to `contrast-check/`. Run before the next one.
  - `node tools/hero-glyph-contrast.mjs --effective [url]` — per-glyph contrast against the actual pixels behind each letterform on those frames. Not a block average: it diffs a with-type and without-type render to get the glyph mask. Use `--effective` to measure the display line against its halo.
  - `node tools/verify-hero.mjs [url]` — cream base, sRGB scrim, and the reduced-motion / sub-768px poster-only gates.
  - `node tools/verify-window.mjs [url]` — the window transition: clip progression, mid-gesture reversibility, zero layout animation, CLS 0, mural behind and ungraded, hairline, off-screen video pause, and the reduced-motion / mobile opt-outs.
  - `node tools/verify-mobile.mjs [url]` — 375px: no `<video>` in the DOM at all, no horizontal overflow on ANY route, the split lockup neither overflowing nor colliding (tested in pixels, since `leading-[0.8]` makes the line boxes overlap by design), and 44px tap targets.
- Measuring on the workerd preview (`npm run preview`, :8787) is NOT comparable to `next start` for LCP: the Cloudflare Images binding is only emulated locally and its optimizer is slow enough to delay the poster past the video's first frame, which then takes the LCP slot. On a real image path the poster wins. Use `next start` for LCP trend, and a real deploy to settle it.
- Menu page: missing photos render lettered placeholder tiles (build-time `fs.existsSync`), not broken images.
