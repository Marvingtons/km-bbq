# NEEDS ASSETS

Shots the redesign has built a slot for but cannot fill. Every entry has a
labelled placeholder in the code (`/* NEEDS ASSET: ... */`) and renders a dark
block rather than a substitute. Nothing here is filled with stock, and no food
is shown that is not on the menu (Law 1).

Grep for `NEEDS ASSET` to find every slot.

---

## 1. Hero loop — RESOLVED. The clip is live.

`kmbbq-hero.mp4` is served from R2 and plays in the hero. The interim still and
its 62% `object-position` workaround are both gone.

**The record was wrong about this asset**, and that is why it sat unused. This
file described it as "a macro of a *clean, empty* grill plate — cold, metallic,
no food", and Phase 3 banned it from both slots on that basis. Frame by frame it
is nothing of the sort: the plate is empty for roughly the first second, then a
hand oils it, tongs lay down a marbled steak, and the remaining eight seconds
are that steak searing with the fat rendering and juice beading on the ridges.
It is close to the brief it was said to fail. Playback starts at **2.6s** so the
empty opening is skipped, and the poster is cut from that same timestamp.

### 1a. Re-encode and re-upload the clip with `+faststart` — worth doing

**The MP4 is not faststart.** Atom order is `ftyp / free / mdat / moov`, with
`moov` at offset 2,283,224 — *after* all 2.28MB of media data. A browser cannot
decode a single frame until it has read `moov`, so it must fetch essentially the
whole file before first paint. Measured at 4Mbps / 4× CPU that is ~3.6s to first
video frame.

This does not currently hurt LCP — the poster holds the LCP slot at 544ms and
the video is a progressive enhancement layered over it — but it does mean the
loop starts several seconds later than it needs to on a slow connection.

- **Fix:** `ffmpeg -i kmbbq-hero.mp4 -c copy -movflags +faststart out.mp4`, then
  re-upload to the same R2 key. It is a remux, not a re-encode: no quality
  change, seconds to run.
- **While you are there:** the file carries an AAC audio track that is never
  played (the element is `muted`). `-an` drops it and saves bandwidth.
- Nothing in the repo needs to change when this lands — same URL, same poster.

### 1b. A purpose-shot loop is still the ceiling, not a blocker

The current clip is one continuous macro of a single steak. A shot-for-the-frame
loop would earn its place, but the slot is filled and this is now a nice-to-have.

- **Aspect:** 16:9, 1920×1080 or better
- **Format:** MP4 (H.264, **faststart**, no audio track) + WebM
- **Length:** 10–15s, seamless loop, silent
- **Brief:** Meat on a live grill — smoke moving through the frame, tongs
  turning a cut, fat catching. Tripod at table height, lit by the room and the
  grill. No faces required. Do not open on an empty grill plate.

## 2. About section photograph — RESOLVED for now

`live-grill.png` was promoted to the hero, and the hero window clips down into
About's media column, so the dock now lands on a photograph of the room with
food on the grill. No second asset is needed until the loop lands, at which
point About inherits the loop's docked panel automatically.

## 3. Gallery — five tiles after the re-audit, still short

The dark rework's audit cut five of eight. Two of those cuts were made for
failing a palette that was itself wrong, and are now restored:

| File | Verdict |
|---|---|
| `samgyeopsal-grilling` | **Keep.** Pork belly over live coals. |
| `marbled-wagyu` | **Keep.** Raw marbling under tongs, portrait. |
| `banchan-spread` | **Keep.** Overhead, lit, on the menu. |
| `live-grill` | Promoted to the hero. Appears once, and travels. |
| `interior` | **RESTORED.** Cut as "empty dining room, daylight, brown tile" — a brightness objection that only held against a near-black ground. It is the room: terracotta floor, black ceiling, chrome ducts, the whole 12ft mural. **The site's palette is sampled from this file.** |
| `table` | **RESTORED.** Cut as "empty table, cold grill". It is the best photograph of the CHROME on disk, and chrome is a tokenized material now. |
| `drinks` | **Still cut**, for a better reason. Not "bare white" — that is no longer disqualifying — but because it is three bottles of two other companies' packaging (Jinro, Corona) sharp and front-and-centre in our own gallery. Same mistake as the Maps embed labelling the neighbours. |
| `outside` | **Moved** to Contact as wayfinding. |

- **Wanted:** 3–5 more frames of the room **in service** — a full table
  mid-service, hands over a grill, banchan going down, the pass. People
  welcome. The room is bright and warm; shoot it that way rather than grading
  it down.
- **Aspect:** mixed is good; tiles share one height and vary in width.

## 3a. The wall mural — the highest-value outstanding shot

The ~12ft mural on the back wall has **never been photographed for the site**,
in any direction. `interior.png` catches it obliquely, at an angle, with chrome
ducts crossing it — good enough to sample colour from, not good enough to ship
as the brand signature.

- **Wanted:** straight-on, whole mural, lit as the track lights already light
  it. Shoot from far enough back that the ducts do not cross the art, or from
  a position where they fall between panels.
- **Why it matters:** it is painted on a pale blue field with a sandy lower
  band and a Korean pavilion at each end, with "It's BBQ Time!" in a brush red
  that is now the site's accent colour. It carries the brand's voice and its
  accent in one frame, and it drops onto the warm ground natively.
- The retired illustration mural (`mural-left` / `mural-right`) is **not** this
  and is not to be restored — see DIRECTION.md.

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
