/**
 * Measures the hero's type against THE ACTUAL PIXELS BEHIND EACH GLYPH, on the
 * clip's worst-case frames.
 *
 *   node tools/hero-glyph-contrast.mjs [url]     (default http://localhost:3117/)
 *
 * Run tools/hero-worst-frames.mjs first — this reads contrast-check/frames.json
 * for which frames to park the video on.
 *
 * METHOD, and why it is not a block average:
 *   A block average over the type's bounding box answers "how bright is the
 *   region", which is not the question. A glyph is thin. It can sit in a bright
 *   box and still have a black grill vent running directly under one stem.
 *
 *   So: screenshot each type element twice, once normally and once with the
 *   text made transparent. The per-pixel difference is the GLYPH MASK — exactly
 *   the pixels the letterforms paint. The second screenshot, sampled at those
 *   same coordinates, is exactly what sits behind them.
 *
 *   Contrast is then computed per glyph pixel, and reported as a worst-case
 *   percentile rather than a mean, because legibility fails where the type is
 *   weakest, not on average.
 *
 *   ANTI-ALIASING: edge pixels are blends of ink and ground and would drag the
 *   numbers toward the middle in both directions. Only pixels whose alpha
 *   estimate is >= 0.85 (essentially solid ink) are counted.
 *
 *   WITH A GLOW: when the type carries a halo, the honest background is the
 *   halo, because that is what the eye sees against the stroke. Pass
 *   --effective to measure each glyph pixel against the RENDERED neighbourhood
 *   just outside the glyph instead of the raw footage. Both numbers are
 *   reported so the glow's contribution is visible rather than assumed.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const URL = process.argv.find((a) => a.startsWith("http")) || "http://localhost:3117/";
const EFFECTIVE = process.argv.includes("--effective");
const FPS = 30;
const A = join(tmpdir(), "km-glyph-a.png");
const B = join(tmpdir(), "km-glyph-b.png");

const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const relLum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hex = (a) => "#" + a.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

/** Raw RGB bytes of a PNG, via ImageMagick. */
function rgb(png) {
  return execFileSync("magick", [png, "-depth", "8", "RGB:-"], { maxBuffer: 1 << 28 });
}

/**
 * The PNG's REAL pixel width, which is not the CSS width. At
 * deviceScaleFactor 2 (every mobile run) Playwright writes a buffer twice as
 * wide as the clip, so indexing by the CSS width walks diagonally through the
 * image and samples "surround" from the wrong place entirely — it reported
 * medians of 1.5 where the true figure was over 15.
 */
function pngWidth(png) {
  return Number(execFileSync("magick", ["identify", "-format", "%w", png]).toString().trim());
}

const TARGETS = [
  { sel: "#home .eyebrow", label: "eyebrow", size: "body", min: 4.5 },
  { sel: "#home h1", label: "SELF SERVE (display)", size: "large", min: 3.0, target: 4.5 },
  { sel: "#home p.font-sans.text-copy", label: "supporting line (Korean BBQ)", size: "body", min: 4.5 },
  { sel: "#home .copy", label: "supporting line (subhead)", size: "body", min: 4.5 },
  { sel: "#home a[href='/menu']", label: "CTA pill label", size: "body", min: 4.5 },
];

const skipPreloader = (page) =>
  page.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });

// Pass --mobile to measure the 375px layout instead. There is no video there
// (poster-only below 768px), so the ground is the poster still rather than a
// parked frame — one case, not three.
const MOBILE = process.argv.includes("--mobile");

const browser = await chromium.launch();
const ctx = await browser.newContext(
  MOBILE
    ? { viewport: { width: 375, height: 812 }, isMobile: true, deviceScaleFactor: 2 }
    : { viewport: { width: 1440, height: 900 } }
);
const page = await ctx.newPage();
await skipPreloader(page);
await page.goto(URL);
await page.waitForLoadState("load");

// --css="<rules>" injects a stylesheet before measuring, so treatment variants
// can be compared without a rebuild between each one. The mask render below
// strips text-shadow itself, so an override here only affects the "as
// rendered" pass, which is exactly the pass a glow changes.
const cssArg = process.argv.find((a) => a.startsWith("--css="));
if (cssArg) {
  await page.addStyleTag({ content: cssArg.slice("--css=".length) });
  await page.waitForTimeout(200);
}

await page.waitForTimeout(2200);

const frames = JSON.parse(readFileSync("contrast-check/frames.json", "utf8"));
const CASES = MOBILE
  ? [["poster", null]]
  : [
      ["brightest", frames.brightest.frame],
      ["busiest", frames.busiest.frame],
      ["darkest", frames.darkest.frame],
    ];

mkdirSync("contrast-check", { recursive: true });

async function park(frame) {
  return page.evaluate(async (t) => {
    const v = document.querySelector("video");
    if (!v) return false;
    v.pause();
    await new Promise((res) => {
      const d = () => { v.removeEventListener("seeked", d); res(); };
      v.addEventListener("seeked", d);
      v.currentTime = t;
      setTimeout(res, 2500);
    });
    return true;
  }, frame / FPS);
}

const report = {};

for (const [caseName, frame] of CASES) {
  if (frame !== null && !(await park(frame))) {
    console.error("no video element — viewport must be >= 768px, or pass --mobile");
    process.exit(1);
  }
  report[caseName] = { frame, elements: {} };

  for (const t of TARGETS) {
    const box = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return null;
      // Pad so a glow around the glyphs is inside the crop.
      const pad = 8;
      return {
        x: Math.max(0, Math.round(r.x - pad)), y: Math.max(0, Math.round(r.y - pad)),
        w: Math.round(r.width + pad * 2), h: Math.round(r.height + pad * 2),
        color: getComputedStyle(el).color,
      };
    }, t.sel);
    if (!box) continue;

    const clip = { x: box.x, y: box.y, width: box.w, height: box.h };

    // ---- THE GLYPH MASK, derived once and independent of the frame ---------
    // Earlier versions inferred the mask per frame by diffing a with-type and
    // without-type render. That is unreliable on this clip: where the footage
    // is near-black it is already close to the ink colour, so halo fringe and
    // raw frame both masquerade as glyph, and the mask silently changed shape
    // with the video (the same unchanged sentence measured 56 glyph pixels on
    // one frame and 407 on another). A mask that moves with the background
    // cannot be used to measure the background.
    //
    // So: render the type with no halo, on flat white, with the media hidden.
    // Everything dark in that render is glyph, exactly, and it is the same mask
    // for every frame because the type has not moved.
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      el.dataset.kmMask = el.style.cssText;
      el.style.textShadow = "none";
      const win = document.querySelector(".hero-window");
      win.dataset.kmMask = win.style.cssText;
      win.style.background = "#fff";
      document.querySelectorAll(".hero-media, #home video").forEach((n) => {
        n.dataset.kmMask = n.style.cssText;
        n.style.visibility = "hidden";
      });
    }, t.sel);
    await page.waitForTimeout(140);
    const M = join(tmpdir(), "km-glyph-m.png");
    await page.screenshot({ path: M, clip });
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      el.style.cssText = el.dataset.kmMask || "";
      const win = document.querySelector(".hero-window");
      win.style.cssText = win.dataset.kmMask || "";
      document.querySelectorAll(".hero-media, #home video").forEach((n) => {
        n.style.cssText = n.dataset.kmMask || "";
      });
    }, t.sel);
    await page.waitForTimeout(140);

    await page.screenshot({ path: A, clip });

    // Hide only the text fill + any text-shadow, leaving everything else
    // (including an opaque control surface like the CTA pill) exactly as it is.
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      el.dataset.kmPrev = el.style.cssText;
      el.style.color = "transparent";
      el.style.textShadow = "none";
      el.querySelectorAll("*").forEach((c) => {
        c.dataset.kmPrev = c.style.cssText;
        c.style.color = "transparent";
        c.style.textShadow = "none";
      });
    }, t.sel);
    await page.waitForTimeout(120);
    await page.screenshot({ path: B, clip });
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      el.style.cssText = el.dataset.kmPrev || "";
      el.querySelectorAll("*").forEach((c) => { c.style.cssText = c.dataset.kmPrev || ""; });
    }, t.sel);

    const ra = rgb(A), rb = rgb(B);
    const fg = box.color.match(/[\d.]+/g).slice(0, 3).map(Number);
    const Lfg = relLum(fg);
    const px = Math.min(ra.length, rb.length) / 3;

    // THE GLYPH MASK comes from the flat-white render above, not from diffing
    // the two live renders. Everything about it is frame-independent by
    // construction: same type, same position, same white ground, every frame.
    //
    //   inked   any ink coverage at all, anti-aliasing included. A surround
    //           sample may never be one of these.
    //   solid   renders essentially AS the type colour, so its contrast is the
    //           contrast a reader actually experiences at the stroke.
    const rm = rgb(M);
    const dist = (p, q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]);
    const solid = [];
    const inked = new Uint8Array(px);
    for (let i = 0; i < px; i++) {
      const p = i * 3;
      const m = [rm[p], rm[p + 1], rm[p + 2]];
      if (765 - (m[0] + m[1] + m[2]) > 40) inked[i] = 1;   // darker than white
      if (dist(m, fg) > 60) continue;                       // not solid glyph
      solid.push({ i, bg: [rb[p], rb[p + 1], rb[p + 2]], rendered: [ra[p], ra[p + 1], ra[p + 2]] });
    }

    if (!solid.length) { report[caseName].elements[t.label] = { note: "no solid glyph pixels found" }; continue; }

    // Contrast of the type against the raw ground behind each glyph pixel.
    const raw = solid.map((s) => ratio(Lfg, relLum(s.bg))).sort((x, y) => x - y);
    const pct = (p) => +raw[Math.floor(raw.length * p)].toFixed(2);
    const worstIdx = raw.indexOf(raw[0]);

    const entry = {
      glyphPixels: solid.length,
      typeColor: hex(fg),
      minRequired: t.min,
      vsRawFootage: {
        worst: +raw[0].toFixed(2),
        p01: pct(0.01), p05: pct(0.05), median: pct(0.5),
        worstGroundColor: hex(solid[worstIdx] ? solid[worstIdx].bg : solid[0].bg),
        pixelsBelowMin: raw.filter((r) => r < t.min).length,
        pctBelowMin: +((raw.filter((r) => r < t.min).length / raw.length) * 100).toFixed(2),
      },
      passesRaw: raw[Math.floor(raw.length * 0.01)] >= t.min,
    };

    if (EFFECTIVE) {
      // What the eye actually sees: glyph ink against the RENDERED ring just
      // outside the letterform (the glow, if there is one).
      // REAL pixel dims, not CSS dims — see pngWidth().
      const W = pngWidth(A);
      const H = Math.round(px / W);
      const ring = [];
      for (const s of solid) {
        const x = s.i % W, y = Math.floor(s.i / W);
        // Walk outward until the first pixel with NO ink coverage. That pixel
        // is the true surround: the halo if there is one, the raw frame if not.
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          for (let step = 1; step <= 6; step++) {
            const nx = x + dx * step, ny = y + dy * step;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) break;
            const j = ny * W + nx;
            if (inked[j]) continue;                   // still glyph, keep going
            const p = j * 3;
            ring.push(ratio(Lfg, relLum([ra[p], ra[p + 1], ra[p + 2]])));
            break;
          }
        }
      }
      ring.sort((a, b) => a - b);
      if (ring.length) {
        entry.vsRenderedSurround = {
          worst: +ring[0].toFixed(2),
          p01: +ring[Math.floor(ring.length * 0.01)].toFixed(2),
          p05: +ring[Math.floor(ring.length * 0.05)].toFixed(2),
          median: +ring[Math.floor(ring.length * 0.5)].toFixed(2),
          samples: ring.length,
        };
        entry.passesEffective = ring[Math.floor(ring.length * 0.01)] >= t.min;
      }
    }

    report[caseName].elements[t.label] = entry;
  }

  // Keep an inspectable full-hero still per case.
  await page.locator("#home").screenshot({ path: `contrast-check/hero-on-${caseName}.png` });
}

console.log(JSON.stringify(report, null, 2));
await browser.close();
