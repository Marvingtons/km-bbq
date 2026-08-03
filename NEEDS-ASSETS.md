# NEEDS ASSETS

Shots the redesign has built a slot for but cannot fill. Every entry has a
labelled placeholder in the code (`/* NEEDS ASSET: ... */`) and renders a dark
block rather than a substitute. Nothing here is filled with stock, and no food
is shown that is not on the menu (Law 1).

Grep for `NEEDS ASSET` to find every slot.

---

## 1. Hero loop — BLOCKING, highest value

- **Slot:** `src/components/HeroBackdrop.tsx`, full-viewport background
- **Aspect:** 16:9, delivered at 1920×1080 or better
- **Format:** MP4 (H.264) + WebM, plus a WebP first-frame poster
- **Length:** 10–15s, seamless loop, silent
- **Brief:** Meat on a live grill — close and dim. Smoke moving through the
  frame, tongs turning a cut, fat catching. Shoot from a tripod at table
  height, lit only by the room and the grill. Slow motion if the phone offers
  it. No faces required. Do not shoot an empty grill plate.
- **Why:** The current R2 clip (`kmbbq-hero.mp4`) is a macro of a *clean, empty*
  grill plate — cold, metallic, no food, and it is the same frame the About
  panel used. Phase 3 bans it from both slots.
- **Currently rendering:** `--char` ground with a low ember glow at the bottom
  edge, so the hero reads as a dark grill room rather than a failed load.

## 2. About section photograph

- **Slot:** `src/components/About.tsx`, the docked media column (`.col-media`)
- **Aspect:** 3:4 portrait at md+, 16:9 below
- **Brief:** One frame of the room working — a table mid-service, hands over a
  grill, a full spread. People welcome. This is the frame the hero window
  clips down into, so it must survive being seen large.
- **Why:** The slot previously held `hero-poster.webp`, the same empty-grill
  macro as the hero. Showing one photo twice in two consecutive sections was
  the single most visible repetition on the page.

## 3. Re-graded gallery set

- **Slot:** `src/components/Gallery.tsx`
- **Aspect:** mixed, tiles share one height
- **Brief:** Reshoot `drinks`, `table`, `interior` and `outside` at night with
  the room lit. The current four are daylight phone snapshots on white tables
  and read a full tier below the food photography beside them.
- **Kept and in use meanwhile:** `live-grill`, `banchan-spread`,
  `marbled-wagyu`, `samgyeopsal-grilling` — all styled food shots that hold up
  under the warm-dark grade.
- **Note:** `outside.png` is retained deliberately, but only in the Visit
  section as wayfinding, not in the gallery. See Phase 3.

## 4. Static map image (optional)

- **Slot:** `src/components/Contact.tsx`, below the hours/location pair
- **Aspect:** 21:9 desktop, 16:10 mobile
- **Brief:** A styled dark static map of the block, exported to match the
  `--char` ground. Replaces the raw Google Maps iframe, which shipped Google's
  own chrome and labelled three competing restaurants inside our own footer.
- **Currently rendering:** address text plus a `Directions` link, which is the
  action anyone actually wants. The map is a nice-to-have, not a blocker.

## 5. Menu photography gaps — pre-existing

7 of 43 `/menu` items have no photo on disk and fall back to a lettered card:
`teriyaki-chicken`, `spicy-squid`, `fishcake`, `lamb`, `marinated-pork-belly`,
`beef-skirt-steak`, `popcorn-chicken`.

4 of those 7 are in the **Premium** tier (40% of that section) — the one the
copy calls "the good stuff". Shoot Premium first.

- **Aspect:** 16:9, on the plate or on the grill, consistent lighting
- **Note:** `MISSING_IMAGES.md` is stale — 5 of the 12 files it lists are filed
  under a `Signature` section that no longer exists in the code.
