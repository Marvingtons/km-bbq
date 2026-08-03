# Redesign brief vs. codebase — conflicts found in Phase 0

Recorded before any code was written, per the brief's instruction to stop and
report rather than improvise. Two were escalated and answered; the rest were
resolved with a documented decision.

## Escalated — answered by the client

### 1. "San Diego" vs. Oceanside — RESOLVED: use Oceanside

The brief specifies the hero eyebrow `KOREAN BBQ · SAN DIEGO`. Every fact in the
repo says Oceanside:

- `src/lib/restaurant.ts` — `2216 S El Camino Real #108–109, Oceanside, CA 92054`
- Phone `(760) 433-1888` (North San Diego County area code)
- Yelp slug `km-bbq-oceanside-2`, Instagram `kmkoreanbbq`
- "Oceanside" in the title tag, OG card, Twitter card and JSON-LD

Oceanside is *in* San Diego County but is a separate city. Law 1 (provenance is
never invented) outranks the literal string. **Decision: `KOREAN BBQ ·
OCEANSIDE, CA`,** and all metadata/schema stay Oceanside.

### 2. The stopwatch game's premise — RESOLVED: keep the real promo

The existing copy describes a real in-store promotion:

> "There is a clock and a red button by our door. Stop it dead on 10.00 seconds
> and your next visit is free."

It is cross-referenced on `/menu` (`page.tsx:611-614`). The brief's Phase 5
reframe (`90:00 — How much can you clear?`) replaces a real promotion with an
invented one, which Law 1 forbids. **Decision: keep the 10.00-second premise and
apply every other Phase 5 instruction** — flat neon scoreboard, no
skeuomorphism, drop the bundled seven-segment font, relocate after Visit, target
under ~150 lines. The 90-minute rule is tied in as supporting copy rather than
replacing the premise.

## Resolved with a documented decision

### 3. Display font — the brief contradicts itself

Phase 1 asks for "a heavy **condensed** grotesk" and then names "Archivo
**Expanded**/Black or Anton". Condensed and expanded are opposites. Verified
against `next/font/google`'s font data:

| Family | Weights | Axes |
|---|---|---|
| `Anton` | 400 only | none |
| `Archivo Black` | 400 only | none |
| `Archivo Expanded` | **does not exist as a family** | — |
| `Archivo` | 100–900 + variable | `wdth` 62–125, `wght` 100–900 |

- **Anton and Archivo Black cannot satisfy "weights 700–900 only"** — both ship a
  single 400 face.
- "Archivo Expanded" is not a Google family; Expanded is the `wdth` axis on
  variable `Archivo`.

**Decision: variable `Archivo` with the `wdth` axis loaded**, set at `wght 900 /
wdth 87.5%` for display. Condensed follows the brief's leading sentence (and is
what actual price boards use); it also lets `ALL-YOU-CAN-EAT` and `$21.99 LUNCH ·
$30.99 DINNER` set on one line at 375px, which an expanded face cannot.

### 4. `--km-blue: #2447C5` is not the logo's blue

The mark's badge circle is `#1A36AF` (`src/components/Logo.tsx:52`). Under Law 3
the token takes the real value. **Decision: `--km-blue: #1A36AF`.**

For reference, the mark's full palette: blue `#1A36AF`, orange gradient
`#EBA039 → #F58721`, red `#EC2229`, pink `#ED397D` / `#EE3C81`, white `#FFFFFF`.
`--neon-pink: #FF4FA0` and `--ember: #F27B21` are stated in the brief as
deliberate recasts, so those are used as written.

### 5. `data/info.ts` would duplicate an existing single source

`src/lib/restaurant.ts` already is the one source for hours, address, phone,
directions and socials. Creating a second file violates Law 5.
**Decision: move it to `src/data/info.ts`, add prices and the seating limit,
delete `restaurant.ts`, repoint all imports.** One file, the brief's name.

### 6. `Romanized Korean — English` cannot apply to every item

17 of 43 menu items have no Korean name in the data (Teriyaki Beef, Pork Chop,
Hot Dog, Squash, Garlic Broccoli, Fried Doughnuts, Ice Cream, Lamb, Mussels,
Corn Cheese, Popcorn Chicken, Beef Finger Meat, Freshly Cut Steak, Marinated
Chef Beef, Marinated Pork Belly, Beef Skirt Steak, Fresh Fish Fillet's tier
mates). **Decision: apply `Romanized — English` wherever a Korean name exists,
English alone otherwise.** Never invent a romanization.

### 7. The "Signature" tag is a dead label, not a dead link

`About.tsx:103` tags Galbi `Signature`. It is a `<span>` badge, not an anchor, so
there is no broken `href` — but it names a taxonomy that does not exist on
`/menu` (Galbi lives under `Premium` as "Beef Short Ribs"). **Decision: remove
the invented tag; the shared `data/menu.ts` makes the home cards and `/menu`
render the same strings from the same records.**

### 8. Logo.tsx must keep raw hex — documented exception to the Phase 7 grep

Law 3 forbids restyling the mark, so its SVG fills stay literal. Same for the
Google Maps style array (the JS Maps API cannot read CSS custom properties) and
the `theme-color` meta value. These are the only sanctioned raw-colour sites.

### 9. Phase 3's wayfinding copy would invent a fact

The brief suggests reusing the storefront shot with "we're in the plaza next
to …". Nothing in the repo establishes which businesses share the plaza.
**Decision: use the storefront photo as wayfinding with no neighbour claim.**

### 10. Only `mural-left` is named, but the band is two files

`mural-left.webp` and `mural-right.webp` are rendered as one band
(`About.tsx:422-465`). Both depict off-menu food (sundubu jjigae, bibimbap,
plain rice). **Decision: cut both**, plus the `.png` masters and the derived
`--color-pine` / `--color-plum` tokens sampled from them.

### 11. Paths

The brief says `app/globals.css` and `components/`. Actual layout is
`src/app/globals.css` and `src/components/`. Used as they are on disk.
