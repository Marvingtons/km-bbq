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
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const pw = await import(
  new URL("../node_modules/playwright-core/index.js", import.meta.url).href
);
const chromium = (pw.default ?? pw).chromium;

const URL_ = process.argv[2] || "http://localhost:3111/";

const TOKENS = {
  sand: "#f2eadd",
  "sand-2": "#e9dfce",
  "sand-3": "#d9ccb8",
  ink: "#1f1a16",
  ash: "#5c534b",
  char: "#121110",
  "char-2": "#1b1917",
  steel: "#7b828a",
  flame: "#bc2c19",
  sky: "#aecbdb",
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
  return {
    body: bg("body"),
    html: getComputedStyle(document.documentElement).backgroundColor,
    footer: bg("footer"),
    sections: Object.fromEntries(
      [...document.querySelectorAll("section[id]")].map((s) => [s.id, getComputedStyle(s).backgroundColor])
    ),
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

// CONSTRAINT 2 — black is structure, never a page section's ground.
const blacks = [rgbOf(TOKENS.char), rgbOf(TOKENS["char-2"])];
const blackSections = Object.entries(seen.sections).filter(([, bg]) => blacks.includes(bg));
check(
  "no <section> paints a black ground (black is nav/footer/caps only)",
  blackSections.length === 0,
  blackSections.map(([id]) => `#${id}`).join(", ")
);
check("the footer IS black (the structure exists, not merely absent)", blacks.includes(seen.footer), seen.footer);

// CONSTRAINT 7 — the mural blue appears at most once.
const skyUsers = seen.wide.filter((e) => e.bg === rgbOf(TOKENS.sky));
check(
  `the mural blue is used at most once as a ground (found ${skyUsers.length})`,
  skyUsers.length <= 1,
  skyUsers.map((e) => e.id || e.tag).join(", ")
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
