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

> **Provenance note — RESOLVED by measurement.** The blue field was first read
> by eye as cream/ivory, then corrected to blue by the owner. A pixel sample
> settles it: the mural's ground is **`#bbc1cd`, hue 220°, saturation 15%** — a
> genuinely cool, heavily desaturated blue-grey. Both earlier readings were
> wrong in the same direction and for the same reason: at 15% saturation under
> warm artificial light, a pale blue reads as neutral to the eye, and a guess
> made from memory of "sky blue" lands around 38% saturation, two and a half
> times too vivid. The pavilion is confirmed present at the right end (and a
> second at the left). Source: `public/images/interior.png`.

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

1. ~~**Sampled token values.**~~ **RESOLVED 2026-08-03.** See "The sampled
   palette" below. The frames were never sent — the source turned out to be
   `public/images/interior.png`, already in the repo, cut from the gallery by
   the dark rework and unreferenced ever since.
2. **Mural-blue placement.** The token is defined; where it lands is the owner's
   call. Candidates to be presented as screenshotted variants alongside a
   warm-only control: a section band, the About ground, or a footer/nav field.
3. ~~**The hero.**~~ **DECIDED 2026-08-03 by the owner: photographic, and
   moving.** The hero is the R2 clip `kmbbq-hero.mp4`, played over a poster cut
   from it, under the existing char scrim. The mural-led and type-only
   alternatives are not taken.

   **The glyph-contrast problem is solved, and measured.** The worry was that a
   photographic hero reopens what `ff80bf4` and `30e1200` failed to fix
   (supporting lines at 1.6–3.7:1). It does not, because those attempts were
   holding ink legible over a *bright cream* hero with halos and plates. This
   hero's type sits on a char scrim that is 86% opaque by 30% of the frame
   height — a real ground, not a halo. Swept across 14 frames of the clip with
   the type hidden and the background behind each block photographed:

   | Element | Needs | Worst frame | mean | p95 |
   |---|---|---|---|---|
   | Headline `ALL-YOU-CAN-EAT` (large) | 3:1 | 3.17s | 13.17:1 | **8.55:1** |
   | Price `$21.99 / $30.99` (large) | 3:1 | 2.60s | 13.93:1 | **11.90:1** |
   | Subhead `90 minutes…` (body) | 4.5:1 | 7.19s | 9.30:1 | **8.45:1** |

   `tools/verify-hero.mjs` re-measures this on every run.

   **The hero remains the site's one dark surface**, and that is a real tension
   with constraint 2 rather than an exception to it: it is a photograph, not a
   ground. Black here is the scrim that photography needs to carry type, not a
   section painted char. If the hero ever stops being photographic, it returns
   to sand rather than staying dark.

   Still open inside this decision: the price and eyebrow are `sand` rather than
   the accent in the hero, because the accent cannot carry text on a dark
   ground. A purpose-shot loop (NEEDS-ASSETS #1b) would not change that.
4. **The mural photograph.** The real wall mural has never been shot for the
   site — not in the cream direction, not in the dark one. This is the
   highest-value outstanding asset. It is cream-to-blue ground with red
   lettering, so it drops onto a warm-light ground natively and carries the
   brand voice and the accent colour in one frame.

---

## THE SAMPLED PALETTE

Source frame: **`public/images/interior.png`**, the client's own photograph of
the dining room. Each value is the median of a 19×19 pixel patch, so a specular
highlight or a grout line cannot swing it.

| Region sampled | Measured | Notes |
|---|---|---|
| Tan wall | `#edcea3` | hue 35°, sat 67%, light 78%, warmth (R−B) **74** |
| Terracotta floor | `#c26e33` / `#b24e10` | hue 23–25°, warmth **143–162** |
| Mural sky field | `#bbc1cd` | hue 220°, sat **15%**, warmth **−18** — cool |
| Mural brush red | `#c53737` | hue 0°, sat 56% — a **true** red, G=B=55 |
| Ceiling | `#060708` | luminance 0.0021, neutral-cool |
| Chair black | `#0c0703` | luminance 0.0024 |

### What shipped, and how each value relates to its sample

| Token | Value | Relation to the sample |
|---|---|---|
| `--color-sand` | `#f4ece1` | Wall **hue held exactly** (35°); saturation and lightness moved to page values, `hsl(35, 45%, 92%)`. A lit wall at 67%/78% is not a page ground. |
| `--color-sand-2` | `#ede0cf` | Same hue, `hsl(35, 45%, 87%)`. |
| `--color-sand-3` | `#dccab2` | Same hue, `hsl(35, 38%, 78%)`. |
| `--color-ink` | `#1f1a16` | Warm near-black in the room's hue family. Not sampled. |
| `--color-ash` | `#5c534b` | Warm muted grey, warmth +17. Not sampled. |
| `--color-char` | `#121110` | The ceiling sampled at `#060708`; the token is a deliberately lifted screen-safe black at the same neutral-cool character. |
| `--color-char-2` | `#1b1917` | Raised surface inside the structure. |
| `--color-steel` | `#7b828a` | **The one token not sampled.** The ducts are thin and specular, so a patch median off them is unreliable. Solved instead from its two constraints: ≥3:1 as a rule on sand (3.32) and ≥4.5:1 as meta text on char (4.85). Cool (−15) where `ash` is warm (+17). |
| `--color-flame` | `#b73434` | Mural red's **hue and saturation held**, lightness walked to 46% so it clears AA as text on the card ground. `#c53737` itself measures 4.13:1 there. |
| `--color-sky` | `#bbc1cd` | **Taken exactly as sampled.** |

### The rule the contrast maths forced

No single red clears 4.5:1 as **text** on both the warm ground and the black
structure — go light enough for char and it fails on sand, dark enough for sand
and it fails on char. That is physics, not taste, so it became a rule rather
than a second token:

> **The accent is text only on the warm ground.** On the black structure and
> inside a sky band it appears as a **fill**, where the contrast lives between
> the fill and its sand label. Links on those grounds are sand.

Consequences: the nav's active state is weight-of-colour plus a flame
underline; the price is sand in the sticky bar and the hero, and the accent
everywhere it sits on sand.

`tools/verify-palette.mjs` asserts all of this, **including that flame-on-char
(3.19:1) and flame-on-sky (3.27:1) keep failing.** If either starts passing, the
accent value has moved and the rule needs revisiting rather than silently
surviving.

### One documented exception to constraint 3

The accent's job is interaction. **The price figure is the single sanctioned
non-interaction use**, because the price *is* the offer for an all-you-can-eat
restaurant and because the room's own red is used for emphasis, not for
controls — "It's BBQ Time!" is painted in it. Every other decorative use was
stripped: five eyebrows, a menu tag, a category label, and the rule under
About's heading, which is chrome now.

---

## AMENDMENTS

Changes to the decided constraints, with who made them and why. A constraint
that gets quietly bent instead of listed here is the failure this file exists
to prevent — so an amendment is a normal, expected entry, and an unlisted
exception is a bug.

### A1 — The game panel may be black. Owner-directed, 2026-08-03.

Amends **constraint 2** ("black appears only in nav, footer, section caps and
grill-well punctuation"). The game's panel is a card, which is none of those.

It earns the exception because it is a **prop, not a surface**: the promotion is
a real clock and a red button by the restaurant's door, and the site's black is
the room's own ceiling and hardware. Rendering the machine in it describes
something real, which is what constraint 2 actually asks of black.

Scope, and it is narrow: **the section stays sand; only the panel is dark.**
`tools/verify-palette.mjs` still asserts that no `<section>` paints a black
ground, so this cannot spread from a card to a band without failing.

### A2 — A semantic status pair, green and red, on the sticky bar's dot only. Owner-directed, 2026-08-03.

Amends **constraint 3** ("exactly one accent colour"). `--color-open` `#3f8f5c`
is a second hue, and there is nothing green anywhere in the room.

It earns the exception because it is **information, not decoration**. Red/green
on a status dot is read without a legend; the palette-pure alternative — lit
sand against dim steel — says "inactive" rather than "closed". `--color-shut` is
the accent's own value, so the closed state costs nothing new.

Two things keep it honest:
- **Colour is never the only carrier.** The text beside the dot reads "Open
  until 9:30 PM" or "Closed now" in full, so nothing depends on telling red from
  green.
- **It is confined to the dot.** `verify-palette.mjs` counts every element
  painted with `--color-open` and fails if there is more than one, or if it
  appears outside the sticky bar.

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
