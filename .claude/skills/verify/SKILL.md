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
$env:NODE_PATH = "C:\Users\brand\kmbbq\node_modules"
node <script.js>
```

In scripts: `const { chromium } = require("playwright-core")`.

Gotchas / flows worth driving:
- **Preloader**: plays on every full document load, including refreshes (no session gate; it's in the SSR HTML, so animation starts at first paint). It's time-choreographed, so screenshot beats drift; capture several frames. Reduced motion: `newContext({ reducedMotion: "reduce" })` must show the finished badge instantly. While the overlay is up, `<html>` has class `preloading` (scroll lock + HeroVideo holds on its poster; video resumes when the class is removed).
- Hero assets the preloader gates on: `/images/hero-poster3.jpg`, `/videos/hero-video3.mp4`.
- Menu page: missing photos render lettered placeholder tiles (build-time `fs.existsSync`), not broken images.
