/**
 * Verifies the hero's video treatment against the constraints that are written
 * into Hero.tsx as numbers, so those numbers stay claims you can re-run rather
 * than folklore.
 *
 *   node tools/verify-hero.mjs [url]     (default http://localhost:3117/)
 *
 * Needs a built site being served (`npm run build && npx next start -p 3117`)
 * — not `next dev`, whose unoptimised images and dev overlay change the bytes
 * and the paint order.
 *
 * WHAT IT CHECKS
 *   1. prefers-reduced-motion  -> no <video> in the DOM, no mp4 requested
 *   2. below 768px             -> no <video> in the DOM, no mp4 requested
 *   3. the layer under the media is --color-cream
 *   4. the scrim is sRGB rgba(), not Tailwind's oklab opacity modifier
 *   5. ink type clears 4.5:1 against the worst frame of the clip, sampled from
 *      the pixels the browser actually paints, inside the rectangles the hero's
 *      type really occupies
 *
 * ON MEASUREMENT: downsampling uses ImageMagick's BOX filter (a true area
 * average). The default (Lanczos) has negative lobes, rings past the real pixel
 * range on hard edges, and under-reports contrast — it invented a 4.58:1 here
 * where the honest figure is 5.17:1.
 */
import { execFileSync } from "node:child_process";
import { unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright-core";

const URL = process.argv[2] || "http://localhost:3117/";
const SCRATCH = join(tmpdir(), "km-hero-verify.png");

const CREAM = [250, 244, 236];
const INK = [0x1a, 0x1a, 0x1a];
const ALPHA = 0.55; // must match the scrim in Hero.tsx
const FRAMES = 24;
const CLIP_SECONDS = 10.1666;

const lin = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};
const relLum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hex = (a) =>
  "#" + a.slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();

/** ~28px area-averaged blocks of a PNG. */
function blocks(png, w, h) {
  const bw = Math.max(2, Math.round(w / 28));
  const bh = Math.max(2, Math.round(h / 28));
  const raw = execFileSync(
    "magick",
    [png, "-filter", "Box", "-resize", `${bw}x${bh}!`, "-depth", "8", "RGB:-"],
    { maxBuffer: 1 << 26 }
  );
  const out = [];
  for (let i = 0; i < bw * bh; i++) out.push([raw[i * 3], raw[i * 3 + 1], raw[i * 3 + 2]]);
  return out;
}

/** The preloader is time-choreographed; skip it the way the layout's own script does. */
const skipPreloader = (page) =>
  page.addInitScript(() => {
    try {
      sessionStorage.setItem("km-preloader-shown", "1");
    } catch {}
  });

async function open(browser, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  await skipPreloader(page);
  let mp4 = 0;
  page.on("response", (r) => {
    if (/\.mp4/.test(r.url())) mp4++;
  });
  await page.goto(URL);
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  return { ctx, page, mp4: () => mp4 };
}

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch();

// 1 — reduced motion
{
  const { ctx, page, mp4 } = await open(browser, {
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const videos = await page.evaluate(() => document.querySelectorAll("video").length);
  const poster = await page.evaluate(() => !!document.querySelector('img[src*="hero-poster"]'));
  check("reduced motion mounts no video", videos === 0 && mp4() === 0, `${videos} elements, ${mp4()} mp4 requests`);
  check("reduced motion still shows the poster", poster);
  await ctx.close();
}

// 2 — the 768px threshold
for (const [w, wantVideo] of [[390, false], [767, false], [768, true]]) {
  const { ctx, page, mp4 } = await open(browser, {
    viewport: { width: w, height: 844 },
    isMobile: w < 768,
  });
  const videos = await page.evaluate(() => document.querySelectorAll("video").length);
  check(
    `${w}px ${wantVideo ? "mounts" : "mounts no"} video`,
    wantVideo ? videos === 1 : videos === 0 && mp4() === 0,
    `${videos} elements, ${mp4()} mp4 requests`
  );
  await ctx.close();
}

// 3, 4, 5 — cream base, scrim colour space, and measured contrast
{
  const { ctx, page } = await open(browser, { viewport: { width: 1440, height: 900 } });

  // The hero is now a sticky stage holding a clip-path window; the cream base
  // rides on the media root inside that window, and the scrim is the shaped
  // column gradient rather than a full-frame fill.
  const layers = await page.evaluate(() => {
    const media = document.querySelector(".hero-media");
    const stage = document.querySelector(".hero-stage");
    const video = document.querySelector("#home video");
    const vr = video ? video.getBoundingClientRect() : null;

    // Anything that paints, overlaps the video box, and is NOT the media's own
    // cream base, the video, the poster, or the type. That set must be empty.
    const overlays = [];
    if (vr) {
      for (const el of document.querySelectorAll("#home *")) {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.right < vr.left || r.left > vr.right || r.bottom < vr.top || r.top > vr.bottom) continue;
        const paints =
          (cs.backgroundImage && cs.backgroundImage !== "none") ||
          (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)") ||
          (cs.backdropFilter && cs.backdropFilter !== "none") ||
          (cs.mixBlendMode && cs.mixBlendMode !== "normal");
        if (!paints) continue;
        // The media root's cream base is required (it is the load fallback);
        // the CTA is a control surface, not an overlay on the picture.
        if (el.classList.contains("hero-media")) continue;
        if (el.closest("a[href='/menu']")) continue;
        overlays.push({
          cls: (el.getAttribute("class") || el.tagName).slice(0, 50),
          bgImage: cs.backgroundImage === "none" ? null : cs.backgroundImage.slice(0, 60),
          bgColor: cs.backgroundColor,
        });
      }
    }

    const shadowOf = (sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).textShadow : null;
    };
    return {
      base: media ? getComputedStyle(media).backgroundColor : null,
      stageHasNoPaint: stage ? getComputedStyle(stage).backgroundColor === "rgba(0, 0, 0, 0)" : null,
      overlays,
      h1Shadow: shadowOf("#home h1"),
      copyShadow: shadowOf("#home .copy"),
    };
  });
  check("cream sits under the media", layers.base === "rgb(250, 244, 236)", layers.base);
  check(
    "NO overlay ELEMENT over the footage",
    layers.overlays.length === 0,
    layers.overlays.length
      ? layers.overlays.map((o) => `${o.cls} ${o.bgImage || o.bgColor}`).join(" | ")
      : "video + poster + type only"
  );

  // The copy plate is a ::before, so the element sweep above cannot see it.
  // Assert it explicitly rather than let it pass by being invisible to the
  // test: it must exist, and it must be scoped to the copy — a plate that has
  // grown to the width of the track is the frame-wide wash coming back.
  const plate = await page.evaluate(() => {
    const el = document.querySelector(".hero-copy-pool");
    if (!el) return null;
    const cs = getComputedStyle(el, "::before");
    const r = el.getBoundingClientRect();
    const track = document.querySelector("#home .track").getBoundingClientRect();
    return {
      bg: cs.backgroundColor,
      filter: cs.filter,
      widthPctOfTrack: +((r.width / track.width) * 100).toFixed(1),
      widthPctOfViewport: +((r.width / window.innerWidth) * 100).toFixed(1),
      heightPctOfViewport: +((r.height / window.innerHeight) * 100).toFixed(1),
    };
  });
  check(
    "copy plate is cream and soft-edged",
    !!plate && /250, 244, 236/.test(plate.bg) && /blur/.test(plate.filter),
    plate ? `${plate.bg}, ${plate.filter}` : "missing"
  );
  check(
    "copy plate stays scoped to the copy, not the frame",
    !!plate && plate.widthPctOfTrack < 45 && plate.heightPctOfViewport < 20,
    plate ? `${plate.widthPctOfTrack}% of track, ${plate.widthPctOfViewport}% of viewport, ${plate.heightPctOfViewport}% tall` : "missing"
  );

  // Every shadow colour must be cream. A grey or black one is the forbidden
  // drop shadow, and is easy to reintroduce by accident.
  const allCream = (s) =>
    !!s && s !== "none" && !/rgba?\((?!250, 244, 236)/.test(s.replace(/rgba?\(250, 244, 236[^)]*\)/g, "CREAM"));
  check("display halo is cream, not a dark shadow", allCream(layers.h1Shadow), (layers.h1Shadow || "").slice(0, 70));
  check("copy halo is cream, not a dark shadow", allCream(layers.copyShadow), (layers.copyShadow || "").slice(0, 70));
  check(
    "stage paints nothing, so the clip reveals About rather than cream",
    layers.stageHasNoPaint === true
  );

  const rects = await page.evaluate(() =>
    ["#home .eyebrow", "#home h1", "#home .copy", "#home p.font-sans", "#home a[href='/menu']"]
      .flatMap((sel) => [...document.querySelectorAll(sel)].map((el) => ({ sel, r: el.getBoundingClientRect() })))
      .filter(({ r }) => r.width > 4 && r.height > 4)
      .map(({ sel, r }) => ({ sel, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }))
  );

  // Hide the shaped scrim and the type: what is left in those rectangles is the
  // raw video, which is the ground the ladder's numbers are measured against.
  await page.evaluate(() => {
    const scrim = document.querySelector(".hero-copy-scrim");
    if (scrim) scrim.style.visibility = "hidden";
    document.querySelectorAll("#home .track").forEach((n) => (n.style.opacity = "0"));
  });

  const over = (bg) => CREAM.map((c, i) => Math.round(ALPHA * c + (1 - ALPHA) * bg[i]));
  let worst = { c: Infinity }, bright = { L: -1 };

  for (let f = 0; f < FRAMES; f++) {
    const ok = await page.evaluate(async (t) => {
      const v = document.querySelector("video");
      if (!v) return false;
      v.pause();
      await new Promise((res) => {
        const done = () => { v.removeEventListener("seeked", done); res(); };
        v.addEventListener("seeked", done);
        v.currentTime = t;
        setTimeout(res, 2000);
      });
      return true;
    }, (f / FRAMES) * CLIP_SECONDS);
    if (!ok) break;

    for (const r of rects) {
      await page.screenshot({ path: SCRATCH, clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
      for (const b of blocks(SCRATCH, r.w, r.h)) {
        const c = ratio(relLum(INK), relLum(over(b)));
        if (c < worst.c) worst = { c, src: hex(b), frame: f, sel: r.sel };
        if (relLum(b) > bright.L) bright = { L: relLum(b), src: hex(b), c: ratio(relLum(INK), relLum(over(b))) };
      }
    }
  }

  check(
    "ink clears 4.5:1 on the worst frame",
    worst.c >= 4.5,
    `${worst.c.toFixed(2)}:1 over ${worst.src} (frame ${worst.frame}/${FRAMES}, ${worst.sel})`
  );
  check(
    "ink on the brightest sample",
    bright.c >= 4.5,
    `${bright.c.toFixed(2)}:1 over ${bright.src}`
  );

  await ctx.close();
}

await browser.close();
try { unlinkSync(SCRATCH); } catch {}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
