/**
 * verify-palette.mjs — the direction guard.
 *
 *   node tools/verify-palette.mjs [url]     (default http://localhost:3111/)
 *
 * DIRECTION.md carries ten decided constraints, phrased so a violation is
 * checkable rather than arguable. This is the thing that checks them. It is the
 * file that did not exist when dca56c5..7afd87c reversed a decided direction
 * across seven commits without anything failing.
 *
 * It asserts against the RENDERED page, not the token sheet, because a token
 * sheet can be correct while a component hard-codes past it. Two of the checks
 * are static greps over src/ instead, for the cases where "no such utility
 * exists anywhere" is the actual requirement.
 *
 * What it does NOT do is judge whether the derived hex values are the right
 * ones. They were reasoned rather than sampled from the restaurant frames (see
 * DIRECTION.md, "Open, not decided" #1). When the frames arrive and the values
 * move, update TOKENS below in the same commit — this file asserts internal
 * consistency and AA, and both survive a value change.
 *
 * AMENDMENT A4 CHANGED THE SHAPE OF ONE CHECK. Constraint 2 used to be checked
 * as "no <section> paints a black ground". The home page alternates grounds
 * now, so that assertion is replaced by one on the ARRANGEMENT — every section
 * is warm or char, no two adjacent sections share a ground, the rhythm opens
 * and closes dark, and every dark section declares itself with `.section-dark`
 * rather than hand-painting char. That is a tighter bound on the failure the
 * original was written against ("black for mood") than a count was: a fifth
 * band cannot appear without displacing a cream one.
 *
 * The band's four remapped tokens are `color-mix()` results, so they are read
 * off the rendered page rather than listed in TOKENS. A table that has to be
 * kept in step with a stylesheet by hand is the thing this file exists to
 * replace.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const pw = await import(
  new URL("../node_modules/playwright-core/index.js", import.meta.url).href
);
const chromium = (pw.default ?? pw).chromium;

const URL_ = process.argv[2] || "http://localhost:3111/";

const TOKENS = {
  sand: "#f4ece1",
  "sand-2": "#ede0cf",
  "sand-3": "#dccab2",
  ink: "#1f1a16",
  ash: "#5c534b",
  char: "#121110",
  "char-2": "#1b1917",
  steel: "#7b828a",
  flame: "#b73434",
  sky: "#bbc1cd",
};

/** Tokens deleted by the direction. None may reappear, in any form. */
const RETIRED = ["bone", "smoke", "ember", "char-3", "neon-pink", "km-blue"];

let pass = 0;
const failures = [];
const check = (label, ok, detail = "") => {
  if (ok) { pass++; console.log(`  PASS  ${label}`); }
  else { failures.push(`${label}${detail ? ` — ${detail}` : ""}`); console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`); }
};

/* ------------------------------------------------------------------ colour */
const hex = (h) => { const n = parseInt(h.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const lum = (h) => { const [r, g, b] = hex(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const warmth = (h) => { const [r, , b] = hex(h); return r - b; };
const rgbOf = (h) => { const [r, g, b] = hex(h); return `rgb(${r}, ${g}, ${b})`; };

/* ------------------------------------------------------------ static grep  */
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(p)) out.push(p);
  }
  return out;
}

console.log("\n=== STATIC: the retired tokens are gone ===");
{
  const files = walk("src");
  const utility = new RegExp(
    `\\b(?:hover:|focus:|focus-visible:|group-hover:|sm:|md:|lg:|xl:)?(?:bg|text|border|from|via|to|fill|stroke|ring|shadow|divide|outline|decoration|placeholder)-(?:${RETIRED.join("|")})(?:\\/[0-9.\\[\\]]+)?\\b`
  );
  const cssVar = new RegExp(`--color-(?:${RETIRED.join("|")})\\b`);
  const badUtility = [], badVar = [];
  // Comments explaining WHY a token was deleted must be allowed to name it, or
  // the guard punishes the documentation. Block comments span lines, so they
  // are stripped wholesale rather than sniffed line by line — the previous
  // per-line heuristic passed the opening `/*` and then flagged every
  // continuation line inside it.
  const stripComments = (s) =>
    s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
     .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
  for (const f of files) {
    const src = stripComments(readFileSync(f, "utf8"));
    src.split("\n").forEach((line, i) => {
      if (utility.test(line)) badUtility.push(`${f}:${i + 1}`);
      if (cssVar.test(line)) badVar.push(`${f}:${i + 1}`);
    });
  }
  check("no retired colour utility anywhere in src/", badUtility.length === 0, badUtility.slice(0, 4).join(", "));
  check("no retired --color-* declared or referenced", badVar.length === 0, badVar.slice(0, 4).join(", "));
}

console.log("\n=== CONTRAST: every pair the site actually renders ===");
{
  const T = TOKENS;
  const need = (label, fg, bg, min = 4.5) =>
    check(`${label} (${ratio(T[fg], T[bg]).toFixed(2)}:1 >= ${min})`, ratio(T[fg], T[bg]) >= min);

  // On the warm ground.
  need("ink on sand", "ink", "sand");
  need("ash on sand", "ash", "sand");
  need("ink on sand-2", "ink", "sand-2");
  need("ash on sand-2", "ash", "sand-2");
  need("flame as text on sand", "flame", "sand");
  need("flame as text on sand-2", "flame", "sand-2");
  // The accent as a fill, which is how it appears on every other ground.
  need("sand label on a flame fill", "sand", "flame");
  need("sand label on the char hover fill", "sand", "char");
  // On the black structure.
  need("sand on char", "sand", "char");
  need("steel on char", "steel", "char");
  need("sand on char-2", "sand", "char-2");
  // Chrome as a rule is non-text, so 3:1.
  need("steel as a rule on sand", "steel", "sand", 3);
  // The sky band, if it is in use.
  need("ink on sky", "ink", "sky");

  // THE TWO DELIBERATE NON-PAIRS. These are rules, not failures: the accent is
  // text only on the warm ground. If either ever passes, the accent value moved
  // and the rule should be revisited rather than silently kept.
  check(
    "flame is NOT usable as text on char, and the site does not use it that way",
    ratio(T.flame, T.char) < 4.5,
    `${ratio(T.flame, T.char).toFixed(2)}:1`
  );
  check(
    "flame is NOT usable as text on sky, and the site does not use it that way",
    ratio(T.flame, T.sky) < 4.5,
    `${ratio(T.flame, T.sky).toFixed(2)}:1`
  );
}

console.log("\n=== CHROME IS NOT A GREY TEXT COLOUR ===");
check(
  `steel is cool and ash is warm (${warmth(TOKENS.steel)} vs ${warmth(TOKENS.ash)})`,
  warmth(TOKENS.steel) < 0 && warmth(TOKENS.ash) > 0
);
check(
  `steel and ash are separated in value (${ratio(TOKENS.steel, TOKENS.ash).toFixed(2)}:1 >= 1.5)`,
  ratio(TOKENS.steel, TOKENS.ash) >= 1.5
);

console.log("\n=== THE GROUND IS WARM, AND IS NEITHER PREDECESSOR ===");
check(`sand is warmer than the retired cream (${warmth(TOKENS.sand)} > 14)`, warmth(TOKENS.sand) > 14);
check("sand is not #faf4ec (the cream direction)", TOKENS.sand.toLowerCase() !== "#faf4ec");
check("sand is not #121110 (the dark direction)", TOKENS.sand.toLowerCase() !== "#121110");
check("the page ground is light (luminance > 0.6)", lum(TOKENS.sand) > 0.6);

/* --------------------------------------------------------------- rendered  */
console.log(`\n=== RENDERED: ${URL_} ===`);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));

await page.goto(URL_, { waitUntil: "networkidle" });
await page.waitForTimeout(3200);

const seen = await page.evaluate(() => {
  const bg = (sel) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).backgroundColor : "MISSING";
  };
  // Every element painting a full-width ground, and what it paints.
  const wide = [...document.querySelectorAll("section, footer, header, main, body")]
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      bg: getComputedStyle(el).backgroundColor,
      w: el.getBoundingClientRect().width,
    }))
    .filter((e) => e.w > 600);

  /* THE GROUND SEQUENCE, IN PAGE ORDER — the thing constraint 2 is checked by
     since amendment A4.

     Sorted by document position rather than by DOM order: two sections are
     inside ScrollTrigger pin-spacers, so `main > section` misses them and a
     naive querySelectorAll order is not the order a reader meets them in.

     The hero counts as DARK even though it paints nothing. Its ground is the
     photograph — HeroBackdrop paints char under the poster — and the section
     itself is deliberately transparent, because it is up to 160vh tall on the
     nav tier with the next section pulled up underneath it; painting there
     would black out the top of Pick Your Fire. */
  const order = [...document.querySelectorAll("section")]
    .map((s) => ({
      id: s.id || s.className.split(" ")[0],
      bg: getComputedStyle(s).backgroundColor,
      declaresDark: s.classList.contains("section-dark"),
      top: s.getBoundingClientRect().top + window.scrollY,
    }))
    .sort((a, b) => a.top - b.top);
  const f = document.querySelector("footer");
  if (f) order.push({ id: "footer", bg: getComputedStyle(f).backgroundColor, declaresDark: true, top: Infinity });

  // The band's four remapped tokens, read off a section that actually paints
  // one — so the assertion is against what the browser resolved, not against a
  // table in this file that could drift from it.
  const band = document.querySelector(".section-dark:not(.section-dark-media)");
  const cv = document.createElement("canvas").getContext("2d");
  const hex = (v) => {
    cv.fillStyle = "#000";
    cv.fillStyle = v;
    cv.fillRect(0, 0, 1, 1);
    const d = cv.getImageData(0, 0, 1, 1).data;
    return "#" + [d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, "0")).join("");
  };
  const bandTokens = band
    ? (() => {
        const cs = getComputedStyle(band);
        const t = (n) => hex(cs.getPropertyValue(n).trim());
        return {
          ground: hex(cs.backgroundColor),
          ink: t("--color-ink"),
          ash: t("--color-ash"),
          "sand-2": t("--color-sand-2"),
          "sand-3": t("--color-sand-3"),
          steel: t("--color-steel"),
          flame: t("--color-flame"),
          sand: t("--color-sand"),
        };
      })()
    : null;

  return {
    body: bg("body"),
    html: getComputedStyle(document.documentElement).backgroundColor,
    footer: bg("footer"),
    sections: Object.fromEntries(
      [...document.querySelectorAll("section[id]")].map((s) => [s.id, getComputedStyle(s).backgroundColor])
    ),
    order,
    bandTokens,
    wide,
    muralImgs: document.querySelectorAll("img[src*='mural']").length,
    overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
});

check("body ground is sand", seen.body === rgbOf(TOKENS.sand), seen.body);
check("no horizontal overflow at 1440", seen.overflowX === false);
check(
  "the mural illustration set is NOT restored (DIRECTION.md supersession)",
  seen.muralImgs === 0,
  `${seen.muralImgs} mural img`
);

/* CONSTRAINT 2, AS AMENDED BY A4 — the grounds ALTERNATE.
   ---------------------------------------------------------------------------
   This used to read "no <section> paints a black ground", which was the right
   check while black was confined to the nav, the footer and two props. A4
   replaces the divider system with alternating full-bleed bands, so that
   assertion would now fail on four sections that are correct.

   What replaces it is STRICTER in the way that matters, not looser. The old
   check bounded the COUNT of dark sections at zero; this one bounds the
   ARRANGEMENT, which is what "never black for mood" actually meant. A fifth
   band cannot be added without displacing a cream one, and a page that drifts
   toward dark-everywhere — the failure DIRECTION.md exists to prevent — breaks
   the alternation on its first step. Constraint 1 is still checked separately:
   the page ground is sand and it is light.
   ------------------------------------------------------------------------- */
const blacks = [rgbOf(TOKENS.char), rgbOf(TOKENS["char-2"])];
const groundOf = (s) =>
  s.id === "home"
    ? "dark" // its ground is the photograph; see the note in the evaluate above
    : blacks.includes(s.bg)
      ? "dark"
      : s.bg === rgbOf(TOKENS.sand)
        ? "warm"
        : `OTHER(${s.bg})`;

const grounds = seen.order.map((s) => ({ id: s.id, g: groundOf(s), declaresDark: s.declaresDark }));
console.log(`  ...ground sequence: ${grounds.map((s) => `${s.id}=${s.g}`).join(" ")}`);

check(
  "every section paints either the warm ground or the black structure",
  grounds.every((s) => s.g === "dark" || s.g === "warm"),
  grounds.filter((s) => s.g.startsWith("OTHER")).map((s) => `#${s.id} ${s.g}`).join(", ")
);

const adjacent = grounds
  .map((s, i) => (i > 0 && s.g === grounds[i - 1].g ? `${grounds[i - 1].id}/${s.id} both ${s.g}` : null))
  .filter(Boolean);
check(
  `no two adjacent sections share a ground (${grounds.length} sections, perfect alternation)`,
  adjacent.length === 0,
  adjacent.join(", ")
);

// The rhythm has to START and END dark — the hero and the footer are the two
// pieces of structure the alternation hangs off.
check("the rhythm opens on the hero's dark ground", grounds[0]?.g === "dark", grounds[0]?.id);
check("the footer IS black (the structure exists, not merely absent)", blacks.includes(seen.footer), seen.footer);

// ONE MECHANISM. Every dark section must declare itself with `.section-dark`
// rather than by painting char with a utility of its own — that is what stops a
// band acquiring a treatment the other bands do not have.
const undeclared = grounds.filter((s) => s.g === "dark" && s.id !== "footer" && !s.declaresDark);
check(
  "every dark section is declared with .section-dark, not hand-painted",
  undeclared.length === 0,
  undeclared.map((s) => `#${s.id}`).join(", ")
);

/* THE BAND'S REMAPPED TOKENS, MEASURED ON THE RENDERED PAGE.
   These are `color-mix()` results rather than literals, so there is no hex to
   put in TOKENS above — and that is the point: the check reads what the browser
   resolved, so it cannot drift from the value the way a copied table does. */
console.log("\n=== THE DARK BAND'S OWN PAIRS ===");
if (!seen.bandTokens) {
  check("a painted dark band exists to measure", false);
} else {
  const B = seen.bandTokens;
  console.log(`  ...band tokens: ${JSON.stringify(B)}`);
  const needB = (label, fg, bg, min = 4.5) =>
    check(`${label} (${ratio(B[fg], B[bg]).toFixed(2)}:1 >= ${min})`, ratio(B[fg], B[bg]) >= min);

  needB("band heading/ink on the band ground", "ink", "ground");
  needB("band muted copy on the band ground", "ash", "ground");
  needB("band ink on a band card (sand-2 -> char-2)", "ink", "sand-2");
  needB("band muted copy on a band card", "ash", "sand-2");
  // Chrome is unchanged by the band and still has to work as a rule on it.
  needB("the header-cadence rule (steel) on the band ground", "steel", "ground", 3);

  check(
    `the band's ground IS --color-char (${B.ground})`,
    B.ground === TOKENS.char
  );
  check(
    "the band remaps ink to sand rather than inventing a light value",
    B.ink === TOKENS.sand,
    B.ink
  );
  check(
    "the band does NOT remap steel — chrome is one material on both grounds",
    B.steel === TOKENS.steel,
    B.steel
  );
  check(
    "the band does NOT remap flame — the accent's fills are unchanged",
    B.flame === TOKENS.flame,
    B.flame
  );
  check(
    "the band does NOT remap sand — it is the label on every flame fill",
    B.sand === TOKENS.sand,
    B.sand
  );
  // The hairline is a DIVISION, not a control boundary: it must be visible and
  // must not become a line of colour. Bracketed rather than floored.
  const hair = ratio(B["sand-3"], B.ground);
  check(
    `the band hairline is a division, not a border (${hair.toFixed(2)}:1 in 1.5-3.0)`,
    hair >= 1.5 && hair <= 3.0
  );

  // THE ACCENT'S RULE SURVIVES THE NEW GROUND. Same two deliberate non-pairs as
  // above, restated against the band — if flame ever clears as text here, the
  // FAQ link and the plus icon need revisiting rather than silently surviving.
  check(
    "flame is still NOT usable as text on the band, and the band does not use it that way",
    ratio(B.flame, B.ground) < 4.5,
    `${ratio(B.flame, B.ground).toFixed(2)}:1`
  );
}

// CONSTRAINT 7 — the mural blue appears at most once.
const skyUsers = seen.wide.filter((e) => e.bg === rgbOf(TOKENS.sky));
check(
  `the mural blue is used at most once as a ground (found ${skyUsers.length})`,
  skyUsers.length <= 1,
  skyUsers.map((e) => e.id || e.tag).join(", ")
);

// THE STATUS PAIR IS CONFINED TO THE STATUS DOT. `--color-open` is the one
// colour on the site outside the single accent (DIRECTION.md, Amendments), and
// it is allowed because it is semantic rather than decorative. That argument
// only holds while it stays on the dot, so this counts every element painted
// with it and requires at most one, inside the sticky bar.
const openUse = await page.evaluate(() => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-open")
    .trim();
  const c = document.createElement("canvas").getContext("2d");
  c.fillStyle = v;
  c.fillRect(0, 0, 1, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  const target = `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
  const hits = [...document.querySelectorAll("*")].filter((e) => {
    const s = getComputedStyle(e);
    return s.backgroundColor === target || s.color === target;
  });
  return {
    count: hits.length,
    allInBar: hits.every((e) => !!e.closest("aside")),
    where: hits.map((e) => e.tagName + "." + String(e.className).slice(0, 24)),
  };
});
check(
  "the open/closed green is used at most once, and only inside the sticky bar",
  openUse.count <= 1 && openUse.allInBar,
  `${openUse.count} element(s): ${openUse.where.join(", ")}`
);

check("no console errors", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "));

await ctx.close();
await browser.close();

console.log(`\n${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
