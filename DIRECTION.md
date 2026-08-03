# DIRECTION — KM.BBQ

**Status:** decided, 2026-08-03. Decided by the owner (Marvin) on photographic
evidence of the restaurant interior.

**This document outranks any brief.** It exists because of a specific failure,
described in "Why this file exists" at the bottom. Read that section before
proposing a change to anything above it.

---

## THE RULE

> Any future brief, redesign or direction change MUST be audited against this
> document, not only against factual accuracy.
>
> If a brief contradicts a decided constraint below, that is a **conflict to
> escalate before writing code** — exactly like a factual conflict. Silently
> executing it is the failure this file prevents. Recording it in a conflicts
> document is not enough; a reversal must be answered by the owner and this
> file must be updated in the same commit that reverses it.

An audit that checks a brief only for factual accuracy will pass a brief that
reverses a decided direction. That has already happened once here.

---

## THE ROOM (the evidence)

Everything below is keyed to photographs of the actual restaurant. The room is
the spec. A site that sets an expectation the room does not meet is the failure
mode this direction exists to avoid.

### The room is TWO-VALUE and warm

This is the single most important fact, and it is what both previous directions
got wrong — in opposite directions, by the same mistake.

- **Below (the guest's-eye value): light-to-warm.** Pale laminate tabletops,
  burnt-orange / terracotta polished concrete floor, tan-beige walls, light wood
  wainscot. These are the surfaces a guest sits at, walks on and faces. They are
  the largest and brightest surfaces in the room.
- **Above: black.** Fully exposed industrial ceiling — black-painted deck,
  exposed ductwork, black joists, black track-light rails. Genuinely dark, and
  roughly the top third of the frame.

The room is not a light room. It is not a dark room. It is **stacked**, and the
stacking is the character.

### Chrome is a defining material, not a detail

Ten-plus mirror-finish telescoping downdraft ducts descend from the black
ceiling to every table. They are the visual bridge between the black above and
the warm below, and they are the second thing you notice after the mural.

**Neither previous direction tokenized chrome at all.** This is new work.

### The mural is the real brand signature

Roughly 12 feet, on the back wall, deliberately lit by aimed track lights.

- Painted on a **pale blue sky field** with a **sandy/tan lower band**
- A **Korean pavilion** at the right end
- Illustrated food: marbled beef, shrimp, grilled items, lettuce, lemon,
  mushrooms
- **"It's BBQ Time!"** in a loose **brush-red script**, exclamation mark included

The mural's voice — loud, warm, unembarrassed, exclamatory — is the
restaurant's own voice. The site's voice should not be cooler than the room's.

> **Provenance note.** The blue field and the pavilion are owner-reported from
> frames not yet pixel-sampled. The interior frame reviewed on 2026-08-03 was
> read by eye as a cream/ivory field, which the owner has corrected to blue —
> plausibly a pale blue read as neutral under warm artificial light. **Sampled
> values are pending** (see "Open, not decided"). This note exists so the
> distinction between measured and reported evidence stays visible.

### Furniture, light, density

- Furniture is **dark**: black bistro chairs, dark brown banquette, dark table
  bases. Dark furniture on light floor — the two-value structure again.
- Lighting is **bright, even and artificial**. No windows in frame. Nothing
  moody, dim or pooled.
- **High density, narrow aisles.** A volume and turnover room, for groups and
  families. Cheerful. Not date-night, and not trying to be.

---

## THE DIRECTION (decided)

### 1. Ground: warm light

Keyed to the room's actual warm surfaces — tan / sand / warm off-white
territory, **sampled from the frames, not invented**.

- **NOT** `#FAF4EC` — the old cool cream. Wrong temperature; the room is warm.
- **NOT** `#121110` — char. That is the ceiling, not the room.

### 2. Black is structure, never field

Black in this room is architectural and overhead. On the page it belongs to:

- the nav
- the footer
- section caps and bands
- grill-well punctuation

**Black must describe something real.** It is never the page ground. A section
that is black for mood rather than for structure is a violation of this
direction.

### 3. Chrome is a real material

A steel/chrome token, **distinct from any grey text colour**. Used for hairline
rules, dividers, frame edges and structural detail.

This is what stops a warm-light site from reading soft. It is the room's own
material and it has never been on the site.

### 4. One accent, one job

**One heat accent**, sampled from the mural's brush red. (`--color-flame`
`#e63b2e` is already close — verify against the frame and adjust to the sampled
value.)

- Collapse `flame` + `ember` into this single accent
- Its one job is **interaction**
- **DELETE** `--color-neon-pink` — 5 sites, and no referent anywhere in the
  room. There is nothing pink, neon or lit-sign in this restaurant.
- **DELETE** `--color-km-blue` — 0 references, and its comment falsely claimed
  it was in use for focus rings and footer links. The focus ring is `ember`.

### 5. Type: do not touch

Condensed Archivo 900, uppercase, price-board register — exactly what Phase 1
built. It matches "It's BBQ Time!" far better than the old Cormorant Garamond
ever did.

**The typeface was never the problem.** What made the site read formal was the
near-black field under the type, not the type.

### 6. The mural blue is a real brand colour

The mural's sky-blue field has genuine provenance, and it is the only thing on
the site or in the room that would give the logo's blue badge (`#1A36AF`) a
reason to exist.

**Defined as a token. Applied in at most ONE restrained place.** Placement is
not yet decided — see "Open, not decided".

---

## DECIDED CONSTRAINTS

A short list, phrased so a violation is checkable.

1. **The page ground is warm light.** Never char. Never cool cream.
2. **Black appears only in nav, footer, section caps/bands, and grill-well
   punctuation.** Never as a section ground for mood.
3. **Exactly one accent colour, and its job is interaction.** Not decoration,
   not headings, not "one italic word".
4. **No pink on this site.** No neon. No lit-sign metaphors. Nothing in the room
   supports them.
5. **Chrome/steel is tokenized and in use.** A warm-light site without it reads
   soft and is wrong.
6. **The display face is condensed Archivo 900.** Not to be revisited as part of
   a palette change.
7. **The mural blue appears in at most one place.** More than one is a
   violation until this document says otherwise.
8. **Photography is graded for a light ground.** The dark-ground grade
   (`brightness(0.94)` + a char-to-transparent scrim, which sinks images *into*
   a dark field) inverts on light and must be reversed.
9. **The site's voice is not cooler than the room's.** The room shouts "It's BBQ
   Time!". Terse-and-premium is a misrepresentation.
10. **No asset ships that is not the restaurant's own.** Yelp-quality frames are
    colour reference only.

---

## WHAT THIS SUPERSEDES

### The dark rework, `dca56c5..7afd87c` (2026-08-03)

Seven commits, "Phase 1" through "Phase 7", executed in a single 48-minute
session. It moved the site to a near-black ground (`--color-char #121110`), a
bright tomato accent, a recast neon pink, and removed the illustration mural.

**It is superseded on surface, mood and palette. It is NOT superseded on
structure.**

The dark rework's engineering was materially better than what it replaced.
Reverting it wholesale via `git revert` would hand back real wins. Those wins
are to be **reconstructed deliberately** on the new ground:

- Price up front in the hero — `$21.99 Lunch` / `$30.99 Dinner`. For an
  all-you-can-eat restaurant the price *is* the offer, and the previous hero put
  no number anywhere on the homepage.
- `"90 minutes on the clock. Walk in. No reservations."`
- **StickyInfoBar** — price, tonight's close, CALL, DIRECTIONS — at
  **bottom-right**. Phase 7 correctly moved it off top-right, where being fixed
  it permanently covered the second house-favourite card at 1440.
- **`src/data/menu.ts` as the single menu source**, with `FEATURED` resolving
  ids at module load and **throwing on a bad one**, so name drift breaks the
  build rather than the page.
- **The unpinned gallery** — 9,372px → 6,573px document height, GSAP removed,
  all three captions visible at once instead of two of three being invisible.
- **The rebuilt game** — 499 → 161 lines, bundled seven-segment webfont deleted.
- **The Google Maps embed stays dead.** It shipped Google's chrome inside the
  page and labelled Texas Roadhouse, Chili's, Krispy Kreme and a competing
  Korean BBQ inside our own Contact section.
- **The refusal of the brief's 90:00 game reframe.** The 10.00-second promotion
  is real and the restaurant runs it; the reframe would have invented one.

### The warm-cream direction (2026-07, `upstream/main` lineage)

Also superseded. It was right that the room is warm and that the dark hero
misrepresented the restaurant, and wrong in the mirror image of the dark
rework: **cream everywhere missed the black ceiling and the chrome entirely.**

Its illustration mural (`mural-left` / `mural-right` — tiger, samulnori drummer,
hanok, Hahoe mask, flame mascot, stews) was **never the restaurant's wall
mural**. It was commissioned or generated artwork standing in for a real painted
wall that had never been photographed for the site. **It is not to be restored.**

---

## OPEN, NOT DECIDED

These are explicitly *not* settled by this document. Do not decide them
autonomously.

1. **Sampled token values.** Every hex in the new palette must be sampled from
   the restaurant frames and reported with the frame it came from. Pending the
   photographs.
2. **Mural-blue placement.** The token is defined; where it lands is the owner's
   call. Candidates to be presented as screenshotted variants alongside a
   warm-only control: a section band, the About ground, or a footer/nav field.
3. **The hero.** Pass two. A photographic backdrop on a light ground reopens the
   glyph-contrast problem that `ff80bf4` and `30e1200` both failed to solve
   (supporting lines landed at 1.6–3.7:1). The alternatives are mural-led or
   type-only. Genuine design decision; not a token sweep.
4. **The mural photograph.** The real wall mural has never been shot for the
   site — not in the cream direction, not in the dark one. This is the
   highest-value outstanding asset. It is cream-to-blue ground with red
   lettering, so it drops onto a warm-light ground natively and carries the
   brand voice and the accent colour in one frame.

---

## WHY THIS FILE EXISTS

On 2026-07-28 the owner decided the hero would be cream with ink type, and that
decision was recorded as a hard constraint with the reason attached: the dark
hero *"read as steakhouse-premium and misrepresents the restaurant."*

Six days later, `dca56c5..7afd87c` reintroduced a full-bleed grill still under a
char scrim with bone type — the exact thing that decision forbade.

The rework was executed carefully. It shipped a Phase 0 audit,
[REDESIGN-CONFLICTS.md](REDESIGN-CONFLICTS.md), which caught **eleven** conflicts
between the brief and the codebase: that "San Diego" was factually wrong, that
"Archivo Expanded" is not a font family, that the brief's game reframe would
have invented a promotion the restaurant does not run. Every one of those eleven
is a **fact** conflict.

**Not one of them asked why the surface went dark.** The dark ground, the accent
and the mural cut were taken as given and executed. None of the seven commit
messages acknowledges that a prior direction existed or was being overturned.

The audit was rigorous and it missed the only conflict that mattered, because it
was auditing the brief against **the code** and nothing existed to audit it
against **prior decisions**.

That is what this file is. Keep it current, or it becomes the next thing that
was true once.
