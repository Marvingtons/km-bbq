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
- **Currently rendering:** `live-grill.png` as an interim still — the client's
  own photograph of their own grill with their own food on it, so it is neither
  stock nor off-menu — under a char scrim and a low ember glow. It is not a
  substitute for the loop: it was never shot for this frame, and it shows. The
  hero window clips into About's right-hand columns, and the right third of
  this photo is tables and chairs rather than food, so `object-position` is
  currently biased to 62% to drag the grill toward the dock. A loop shot for
  the frame makes that workaround unnecessary.

## 2. About section photograph — RESOLVED for now

`live-grill.png` was promoted to the hero, and the hero window clips down into
About's media column, so the dock now lands on a photograph of the room with
food on the grill. No second asset is needed until the loop lands, at which
point About inherits the loop's docked panel automatically.

## 3. Re-graded gallery set — the gallery is down to three tiles

The audit cut five of eight. What is left, and why:

| File | Verdict |
|---|---|
| `samgyeopsal-grilling` | **Keep.** Pork belly over live coals. |
| `marbled-wagyu` | **Keep.** Raw marbling under tongs, portrait. |
| `banchan-spread` | **Keep.** Overhead, lit, on the menu. |
| `live-grill` | Promoted to the hero. Appears once, and travels. |
| `interior` | **Cut.** Empty dining room, daylight, brown tile. |
| `table` | **Cut.** Empty table, cold grill. |
| `drinks` | **Cut.** Two soju bottles and a Corona on bare white. |
| `outside` | **Moved** to Contact as wayfinding. |

The three cut files are still on disk and still in the image manifest — they
are the client's own photographs and are deliberately unreferenced pending a
reshoot, not deleted.

- **Wanted:** 3–5 more frames, shot **at night with the room lit** — a full
  table mid-service, hands over a grill, banchan going down, the pass. People
  welcome. Same warm-dark grade as the three keepers.
- **Aspect:** mixed is good; tiles share one height and vary in width.

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
