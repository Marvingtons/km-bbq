/**
 * build-dual-grill.mjs — turns the raw illustration into the shipped component.
 *
 *   node tools/build-dual-grill.mjs
 *   assets/dual-grill-raw.svg  ->  src/components/illustrations/DualGrill.tsx
 *
 * WHY A GENERATOR AND NOT A HAND EDIT. The raw file is 202 elements with no
 * groups and machine class names. Re-typing 202 `d` attributes by hand is how
 * geometry silently changes; this reorganises and restyles without ever
 * touching a coordinate. Every `d`, `points`, `x1/y1` and transform is copied
 * verbatim.
 *
 * It is kept in the repo as the provenance record: if the raw art is ever
 * revised, re-run this rather than patching the component.
 *
 * CLASSIFICATION IS MEASURED, NOT GUESSED. Class names alone are ambiguous —
 * `.cls-4` is the gas half's whole ground AND a dozen individual coal shapes —
 * so every element's real bounding box is read from the browser via getBBox()
 * and combined with its class to decide side (left of the divider = gas, right
 * = charcoal) and role (a 40-unit arc is structure, a 12-unit blob is a coal).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not .pathname: a repo path containing a space arrives
// percent-encoded and ENOENTs on "Website%20Projects".
const REPO = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const RAW = path.join(REPO, "assets/dual-grill-raw.svg");
const OUT = path.join(REPO, "src/components/illustrations/DualGrill.tsx");

const pw = await import(new URL("../node_modules/playwright-core/index.js", import.meta.url).href);
const chromium = (pw.default ?? pw).chromium;

const raw = fs.readFileSync(RAW, "utf8");

/* ------------------------------------------------- measure every element */
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(`<body style="margin:0">${raw}</body>`);
const measured = await page.evaluate(() => {
  const svg = document.querySelector("svg");
  const out = [];
  [...svg.children].forEach((el, i) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "style" || tag === "lineargradient" || tag === "defs") return;
    let bb = null;
    try { bb = el.getBBox(); } catch { /* non-renderable */ }
    out.push({
      i,
      tag,
      cls: el.getAttribute("class") || "",
      html: el.outerHTML,
      x: bb ? +bb.x.toFixed(2) : null,
      y: bb ? +bb.y.toFixed(2) : null,
      w: bb ? +bb.width.toFixed(2) : null,
      h: bb ? +bb.height.toFixed(2) : null,
    });
  });
  return out;
});
await browser.close();

/* -------------------------------------------------------------- classify */
const DIVIDER = 75; // the grill's centre line, in viewBox units

// Classes that are pure-white specular hairlines. The brief calls these out as
// fake highlights that glow oddly on a cream page: they go entirely.
const WHITE_HAIRLINE = new Set(["cls-9", "cls-16"]);
// Near-white strokes that ARE structural (the grate mesh, the rim sheen).
// These are restyled to a warm sheen rather than deleted.
const SHEEN = new Set(["cls-5", "cls-10", "cls-17", "cls-21", "cls-22", "cls-23"]);
// Classes declared `fill: none` in the raw stylesheet — pure outlines. Used to
// tell a rim ARC from a large filled BED, which size alone cannot do.
const STROKE_ONLY = new Set([
  "cls-3", "cls-5", "cls-8", "cls-9", "cls-10", "cls-12",
  "cls-16", "cls-17", "cls-21", "cls-22", "cls-23",
]);
const EMBER = new Set(["cls-19", "cls-20"]);
const GAS_RIB = new Set(["cls-14", "cls-15"]);
const GAS_DIAL = new Set(["cls-18", "cls-24"]);

const drop = [];
const bucket = { chassis: [], gasGround: [], gasSurface: [], charGround: [], coals: [], embers: [], grate: [] };

for (const el of measured) {
  const { cls, w, h, x } = el;
  const big = (w ?? 0) > 35 || (h ?? 0) > 35;
  const empty = !w && !h;
  const right = (x ?? 0) >= DIVIDER - 1;

  // 1. Geometry that draws nothing — a lone moveto with no path after it.
  if (empty) { drop.push({ ...el, why: "empty geometry" }); continue; }
  // 2. Pure-white specular hairlines.
  if (WHITE_HAIRLINE.has(cls)) { drop.push({ ...el, why: "pure-white specular hairline" }); continue; }

  if (EMBER.has(cls)) { bucket.embers.push(el); continue; }

  if (SHEEN.has(cls)) {
    // A near-white stroke on the charcoal half that is not a giant rim arc is
    // the wire mesh; everything else is rim sheen.
    if (right && !big) bucket.grate.push(el);
    else if (right && big && el.w > 40 && el.h > 40) bucket.chassis.push(el);
    else if (right) bucket.grate.push(el);
    else bucket.chassis.push(el);
    continue;
  }

  if (cls === "cls-0" || cls === "cls-1") { bucket.chassis.push(el); continue; }
  if (cls === "cls-2") { bucket.charGround.push(el); continue; }
  if (cls === "cls-11" || cls === "cls-13") { bucket.gasGround.push(el); continue; }
  if (GAS_RIB.has(cls) || GAS_DIAL.has(cls)) { bucket.gasSurface.push(el); continue; }

  // Big elements split by whether they are STROKED or FILLED, not by side
  // alone. This caught a real bug: `.cls-7` and `.cls-4` each draw one large
  // open path on the charcoal half that is FILLED grey — they are the coal
  // bed the briquettes sit on. Treating every big shape as a rim arc restyled
  // them to `fill: none`, which turned the whole charcoal half solid black and
  // left two stray diagonal strokes across the gas plate.
  if (big) {
    if (STROKE_ONLY.has(cls)) bucket.chassis.push(el);
    else if (right) bucket.charGround.push(el);
    else bucket.gasGround.push(el);
    continue;
  }
  if (right) { bucket.coals.push(el); continue; }
  bucket.gasSurface.push(el);
}

/* ------------------------------------------------------------- restyling */
// Machine class -> readable class. The visual mapping is documented in the
// component's own stylesheet; this only renames.
// The readable name comes from the BUCKET first and the original class second.
// Keying off the class alone was wrong: `.cls-7` is a coal in the middle of the
// charcoal half and a 50-unit rim arc at its edge, so a class-only map named
// two chassis arcs "coal-deep" and a rim sheen "mesh".
const NAME_IN = {
  chassis: (c) => (c === "cls-0" ? "rim" : c === "cls-1" ? "body" : SHEEN.has(c) ? "sheen" : "rim-line"),
  gasGround: (c) => (c === "cls-11" ? "gas-inner" : c === "cls-13" ? "gas-plate" : "gas-base"),
  gasSurface: (c) =>
    c === "cls-14" ? "rib-light" : c === "cls-15" ? "rib-dark" : GAS_DIAL.has(c) ? "dial" : "gas-detail",
  charGround: (c) =>
    c === "cls-2" ? "char-ground" : c === "cls-7" ? "coal-bed" : "coal-bed-lit",
  // "" means: carry no class at all and inherit the group's default. The two
  // biggest sets are uniform — 73 coal bodies and all 27 mesh strands — so
  // naming each one individually is ~1.8KB of served markup that says nothing
  // a `#grate > *` selector does not already say, and it buries the shapes
  // that ARE different in a wall of identical attributes.
  coals: (c) => (c === "cls-6" ? "" : c === "cls-7" ? "coal-deep" : "coal-mid"),
  embers: (c) => (c === "cls-20" ? "ember-deep" : "ember"),
  grate: () => "",
};

const toJSX = (html, group) =>
  html
    .replace(/ class="([^"]*)"/g, (_, c) => {
      const name = NAME_IN[group](c.trim());
      return name ? ` className="${name}"` : "";
    })
    .replace(/ stroke-width="[^"]*"/g, "")
    .replace(/ ([a-z]+)-([a-z]+)=/g, (m, a, b) => ` ${a}${b[0].toUpperCase()}${b.slice(1)}=`)
    .replace(/><\/(path|line|rect|polygon|polyline|ellipse)>$/, " />")
    .replace(/\s+\/>$/, " />");

const emit = (list, indent, group) =>
  list.map((e) => `${" ".repeat(indent)}${toJSX(e.html, group)}`).join("\n");

/* ---------------------------------------------------------------- report */
const total = measured.length;
const kept = Object.values(bucket).reduce((n, b) => n + b.length, 0);
console.log(`raw elements measured : ${total}`);
console.log(`dropped               : ${drop.length}`);
for (const [why, n] of Object.entries(drop.reduce((a, d) => ((a[d.why] = (a[d.why] || 0) + 1), a), {})))
  console.log(`    ${why}: ${n}`);
console.log(`kept                  : ${kept}`);
for (const [k, v] of Object.entries(bucket)) console.log(`    ${k.padEnd(12)} ${v.length}`);

const body = `      <g id="chassis">
${emit(bucket.chassis, 8, "chassis")}
        {/* THE ONE PIECE OF GEOMETRY THAT IS NOT IN THE RAW FILE.
            The raw art has no divider element — the centre seam is simply
            where the gas half's fill ends (x=75.2) and the charcoal half's
            begins. That is fine to look at and impossible to animate, and the
            assembly choreography draws the divider as its own beat.

            So this is a single <line> traced along the seam the two fills
            already share: x=75.2, from the inner rim's top (y=15.9) to its
            bottom (y=133.8), both read off .gas-inner's own path. It adds no
            visual element that was not already there as an edge. */}
        <line className="divider" x1="75.2" y1="15.9" x2="75.2" y2="133.8" />
      </g>

      <g id="gas-side">
        <g id="gas-ground">
${emit(bucket.gasGround, 10, "gasGround")}
        </g>
        <g id="gas-surface">
${emit(bucket.gasSurface, 10, "gasSurface")}
        </g>
      </g>

      <g id="charcoal-side">
        <g id="charcoal-ground">
${emit(bucket.charGround, 10, "charGround")}
        </g>
        {/* COALS COME FIRST, GRATE SECOND. In the raw file the mesh was drawn
            before the coals, so the coals sat ON TOP of the grate — briquettes
            floating above the bars they are supposed to be resting under. This
            ordering is the whole point of the rebuild. */}
        <g id="coals">
${emit(bucket.coals, 10, "coals")}
${emit(bucket.embers, 10, "embers")}
        </g>
        <g id="grate">
${emit(bucket.grate, 10, "grate")}
        </g>
      </g>`;

const component = `// GENERATED by tools/build-dual-grill.mjs from assets/dual-grill-raw.svg.
// Re-run that rather than editing geometry here; every \`d\` is copied verbatim
// from the raw art and no coordinate has been touched.
//
// WHAT CHANGED FROM THE RAW FILE
//   - 202 ungrouped elements -> semantic groups: chassis / gas-side /
//     charcoal-side, with coals BEFORE the grate so the mesh crosses in front
//     of the briquettes. In the raw art the grate was drawn first and the
//     coals floated on top of the bars they should be resting under. That
//     inversion is the reason this component exists.
//   - 3 <linearGradient> fills flattened. No gradient remains.
//   - 25 machine class names (cls-0..cls-24) -> 17 readable roles.
//   - ${drop.filter((d) => d.why.includes("white")).length} pure-white specular hairlines deleted; the structural light
//     strokes (rim sheen, grate mesh) restyled to a warm sheen at 0.8 opacity
//     so they read as reflected light rather than white ink on cream.
//   - ${drop.filter((d) => d.why.includes("empty")).length} elements carrying a lone moveto and no drawing commands deleted.
//   - Stroke widths normalised from 0.37-0.78 to two weights, 1.2 structural
//     and 0.8 fine. Styles live in globals.css under \`.dual-grill\`.
//
// Colours: near-blacks map to --color-char and the deep ember to
// --color-flame. The steels, the coal mid-tones and the hot ember core are
// component-scoped literals — grill hardware and glowing charcoal are
// depicted MATERIALS, the same exemption Logo.tsx has under Law 3, not brand
// chrome. See globals.css for the full mapping and the reasoning.
"use client";

export function DualGrill({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 150 150"
      role="img"
      aria-label="Top-down view of a Korean BBQ grill, gas on one side, charcoal on the other"
      className={\`dual-grill \${className}\`}
    >
${body}
    </svg>
  );
}
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, component);
fs.rmSync(path.join(REPO, "tools/.dual-grill-body.txt"), { force: true });
console.log(`\nwrote ${path.relative(REPO, OUT)} (${component.length} chars)`);
console.log("ember paths:", bucket.embers.length, "| grate paths:", bucket.grate.length, "| coal paths:", bucket.coals.length);
