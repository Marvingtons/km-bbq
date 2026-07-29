# Dead code audit — cleanup/dead-code

Taken on branch `cleanup/dead-code`, committed **before** anything was deleted so
the deletions can be reviewed against a recorded inventory rather than taken on
trust.

Method: every file under `src/` and `tools/`, plus the root configs, was read and
cross-referenced. Components were checked for importers, lib modules for import
sites, `public/` assets for any reference in `src/` **excluding**
`src/lib/imageManifest.generated.ts` (that file is a machine-written listing of
what exists on disk, so it references everything and proves nothing), and
dependencies for import sites in source, tools, configs and npm scripts.

---

## A. Confirmed dead — deleted in this pass

| # | Path | What it was | Evidence |
|---|------|-------------|----------|
| 1 | `src/components/SeamThread.tsx` | A thread/line motif drawn between sections. 34 lines. | No importers anywhere in `src/`. Its only export `SeamThread` has zero references. Retired site-wide in `37b92c3` ("refactor(motion): retire the SeamThread motif site-wide") but the file was left behind. |
| 2 | `tools/extract-mural-marks.mjs` | Cut the mural "spot marks" (flame, chili, leaf sprig, chopsticks, smoke wisps) out of the mural into individual PNGs. | Not in any `package.json` script, not referenced in any doc. Its consumer `MuralMark.tsx` and its output `public/images/marks/*` are already gone. Its product is under a standing "must never return" constraint, so the generator is dead by policy as well as by reference. |
| 3 | `public/images/mural-left-cream.png` | 975 KB. Cream-matted mural half. | Referenced **only** by `tools/extract-mural-marks.mjs:69` as its extraction source. Nothing in `src/` reads it. Dies with the tool. |
| 4 | `public/images/mural-right-cream.png` | 985 KB. Same. | Same — `tools/extract-mural-marks.mjs:70`. |
| 5 | `public/images/contact-map.jpg` | 211 KB. Static map still for the Contact section. | Contact renders a live Google Maps embed (`ContactMap.tsx` → `StyledMap.tsx`). `ContactMap.tsx` contains no `<img>`, no `Image`, and no fallback path. Only occurrence of the filename in the repo is the generated manifest. |
| 6 | `export` on `REDUCED_MOTION_QUERY` (`src/lib/motion.ts:95`) | Public export. | Used only inside its own module, by `prefersReducedMotion()` on line 112. No external reference. The constant stays; only the needless public surface goes. |
| 7 | Stale scrim comment in `src/components/HeroVideo.tsx` | Comment justifying `quality={60}` "because the scrim eats the detail". | The scrim no longer exists. The comment now argues from a layer that was deleted, which is worse than no comment. |

**Everything the brief listed as a known candidate was already removed in earlier
passes; verified absent on disk in this audit:**
`public/images/gallery-bg-warm.jpg`, `public/videos/` (the 22.8 MB local hero
clip), `public/images/marks/` (5 spot-mark PNGs), `src/components/MuralMark.tsx`,
`src/components/hero/HeroCta.tsx` (the old hero CTA variant),
`public/images/hero-poster.jpg`, `public/images/kmbbq-hero-poster.jpg`, and every
scrim/overlay div and its `.hero-copy-scrim` CSS.

---

## B. Checked and found CLEAN — nothing to remove

- **Commented-out code blocks.** Zero. No `// <div`, `// const`, `// function`,
  `// gsap.` etc. anywhere in `src/`.
- **Unused CSS classes.** Every `.class` defined in `globals.css` is referenced.
- **Unused exports.** Only the two listed above (`SeamThread`, and the
  needlessly-exported `REDUCED_MOTION_QUERY`).
- **Single-branch feature flags.** `SeamMotion`'s `calm` prop takes both
  branches: `/menu` passes `calm`, `/` does not.
- **Unreferenced components.** Only `SeamThread`. Every other component has at
  least one importer, including the easily-doubted ones — `Dot` (menu + footer),
  `StyledMap` (via `ContactMap`), `SeamThread`'s neighbour `SectionSeam` (About +
  Footer).
- **Unreferenced lib modules.** None. `mapStyle` is used by `StyledMap`.
- **Dependencies.** The audit script flagged `react-dom`, `@playwright/test`,
  `@types/react`, `@types/react-dom` — all four are **false positives**:
  `react-dom` is React's renderer, `@playwright/test` supplies the
  `playwright-core` that the `tools/verify-*.mjs` runners import, and the two
  `@types` packages are consumed by the compiler, not by an import statement.
  Nothing in `package.json` is genuinely unused.

---

## C. KEEP-UNSURE — deliberately NOT deleted

| Path / item | Size | Why it stays |
|---|---|---|
| `public/images/mural-left.png` | 990 KB | Same 889x884 dimensions as the shipped `mural-left.webp`. This is the **master** the webp was encoded from, and nothing else can regenerate it. It is unreferenced by the site and does ship as a static asset, so it is genuine deploy weight — but deleting an irreplaceable source to save bytes is the wrong trade. **Recommend moving both masters out of `public/` rather than deleting.** |
| `public/images/mural-right.png` | 1000 KB | Same. |
| `public/images/beef-tongue.png` | 2609 KB | Real dish photography for an item not currently on the menu. `src/app/menu/page.tsx` lists every photo explicitly, and these four are not in that list. But they are shot, paid-for product photos, and menu items come and go — this looks far more like "not on the menu yet" than "dead". |
| `public/images/butter-garlic-jumbo-shrimp.png` | 3026 KB | Same. |
| `public/images/prime-new-york-steak.png` | 2563 KB | Same. |
| `public/images/spicy-octopus.png` | 2435 KB | Same. |
| `@keyframes led-blink` (`globals.css:664`) | 12 lines | Zero references. It belongs to the game's LED clock, which is under a standing "must not change" constraint. An unapplied keyframe cannot affect rendering, so keeping it costs nothing — but deleting it would erase the evidence that the separator's blink may have been dropped by accident when the clock was rebuilt. That is a question to answer, not to bury. |

Total held back: **13.5 MB** of assets, all of it recoverable value rather than
dead weight. If the owner confirms those four dishes are off the menu for good
and the mural masters are archived elsewhere, a follow-up pass removes ~13.5 MB
more.

---

## D. The hero video's full layer stack

Enumerated live in the browser: every element in `#home` that paints (has a
background colour, background image, backdrop-filter or blend mode) and whose
box overlaps the `<video>` rect.

| Layer | Element | Verdict |
|---|---|---|
| 1 | `.hero-media` — `bg-cream` | **Keep.** Not an overlay: it is *under* the video and poster, and it is the load-failure fallback that guarantees cream rather than black or white. |
| 2 | `<video>` — R2 stream | The footage. |
| 3 | poster `<img>` — `hero-poster.webp` | The LCP element. |
| 4 | type block (`h1`, eyebrow, supporting line, CTA) at `z-10` | The type. |

Not overlays, listed for completeness: the CTA pill's own `bg-cream` control
surface and its `::before` ember hover fill (a button, not a wash); the navbar's
`bg-cream/90` panel, which sits at `opacity: 0` at rest and is 76px tall; and
`#about`, which begins at y=900 and only intersects because the media layer
carries an 8% vertical bleed that is clipped.

**There is no gradient, no wash, no veil, and no grey anywhere in the stack.**
`tools/verify-hero.mjs` now asserts this set is empty on every run rather than
relying on this document staying true.
