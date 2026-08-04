/**
 * Verifies the Hero -> About window transition.
 *
 *   node tools/verify-window.mjs [url]     (default http://localhost:3117/)
 *
 * Needs a built site being served. Replaces the older verify-handoff.mjs, which
 * tested the drift-and-fade arrival this transition superseded.
 *
 * WHAT IT CHECKS
 *   1. the video clips from full-bleed to an inset rounded panel across scroll
 *   2. the scrub is monotonic AND reversible mid-gesture (not fire-and-play)
 *   3. clip-path/transform only — the panel's layout box never changes, and
 *      CLS across the whole transition stays 0
 *   4. the window opens onto About's SAND ground with the story composed on it,
 *      and the retired illustration mural is absent — no <img>, no CSS
 *      background, no band or parallax markup left behind
 *   5. the chrome hairline is present at the ground change
 *   6. the video pauses once fully off-screen and resumes on return
 *   7. prefers-reduced-motion: nothing clips, nothing moves, hairline intact
 *   8. under 768px: no clip scrub at all, and no horizontal overflow at 375px
 */
import { chromium } from "playwright-core";

const URL = process.argv[2] || "http://localhost:3117/";
const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const skipPreloader = (page) =>
  page.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });

/** Parse `inset(a% b% c% d% round r)` into numbers; full-bleed reads as zeros. */
const parseInset = (s) => {
  if (!s || s === "none") return null;
  const n = (s.match(/-?[\d.]+%/g) || []).map(parseFloat);
  return n.length ? { top: n[0], right: n[1] ?? n[0], bottom: n[2] ?? n[0], left: n[3] ?? n[1] ?? n[0] } : { top: 0, right: 0, bottom: 0, left: 0 };
};

async function scrollTo(page, y) {
  await page.evaluate((t) => window.scrollTo(0, t), y);
  await page.waitForTimeout(950); // Lenis + scrub catch-up
}
const readClip = (page) =>
  page.evaluate(() => {
    const w = document.querySelector(".hero-window");
    if (!w) return null;
    const r = w.getBoundingClientRect();
    return { clip: getComputedStyle(w).clipPath, box: { w: Math.round(r.width), h: Math.round(r.height) } };
  });

/**
 * Is About's story ever visible with nothing painted over it?
 *
 * This exists because of a specific bug. The hero runs 160vh with a sticky
 * stage and About is pulled up -60vh to sit behind it — which is free WHILE
 * THE WINDOW CLIPS, because by the time the stage releases it is a small docked
 * panel. Where the clip never runs (reduced motion, under 768px) the stage stays
 * full-bleed and opaque for that whole extra viewport and then slides up over
 * About: the story is revealed from behind a departing video and has scrolled
 * past the top of the page before the video has finished leaving. Nothing
 * throws, nothing overflows, and the section simply cannot be read.
 *
 * So both halves of that arithmetic are `motion-safe:md:`, and this asserts the
 * consequence rather than the class name: at SOME scroll position the heading is
 * on screen and the hero stage is not on top of it.
 */
async function storyReadable(page) {
  const h = await page.evaluate(() => window.innerHeight);
  let bestClear = false, sawIt = false;
  for (let y = 0; y <= 3 * h; y += h / 6) {
    await scrollTo(page, Math.round(y));
    const s = await page.evaluate(() => {
      const stage = document.querySelector(".hero-stage");
      const head = document.getElementById("about-heading");
      if (!stage || !head) return null;
      const sb = stage.getBoundingClientRect(), hb = head.getBoundingClientRect();
      const onScreen = hb.bottom > 0 && hb.top < innerHeight;
      const under = hb.top < sb.bottom && sb.top < hb.bottom;
      return { onScreen, under };
    });
    if (!s) continue;
    if (s.onScreen) {
      sawIt = true;
      if (!s.under) bestClear = true;
    }
    if (bestClear) break;
  }
  return [bestClear, sawIt ? (bestClear ? "heading visible and clear of the hero" : "heading is only ever behind the hero stage") : "heading never on screen"];
}

const browser = await chromium.launch();

// ---- desktop: the transition ----------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await skipPreloader(page);

  // CLS observer installed before first paint.
  await page.addInitScript(() => {
    window.__cls = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });

  await page.goto(URL);
  await page.waitForLoadState("load");
  await page.waitForTimeout(2200);

  const vh = 900;
  const steps = [0, 0.25, 0.5, 0.75, 1];
  const seen = [];
  for (const f of steps) {
    await scrollTo(page, Math.round(f * vh));
    seen.push({ f, ...(await readClip(page)) });
  }

  const first = parseInset(seen[0].clip), last = parseInset(seen[seen.length - 1].clip);
  check("starts full-bleed", first && first.right === 0 && first.bottom === 0, seen[0].clip.slice(0, 40));
  check(
    "ends as an inset rounded panel",
    // The dock BLEEDS RIGHT, so its right inset is 0 by design — asserting on
    // it would be permanently false. The left inset is the meaningful one now:
    // the panel's left edge is column 9's left edge.
    last && last.left > 55 && last.top > 5 && /round/.test(seen[seen.length - 1].clip),
    seen[seen.length - 1].clip.slice(0, 60)
  );

  const rights = seen.map((s) => parseInset(s.clip).left);
  check("clip progresses monotonically with scroll (left edge)", rights.every((v, i) => i === 0 || v >= rights[i - 1] - 0.01), rights.map((r) => r.toFixed(1)).join(" -> "));

  // Reversible mid-gesture: go forward, come back, land on the same shape.
  await scrollTo(page, Math.round(0.5 * vh));
  const mid = parseInset((await readClip(page)).clip);
  await scrollTo(page, Math.round(0.9 * vh));
  await scrollTo(page, Math.round(0.5 * vh));
  const midAgain = parseInset((await readClip(page)).clip);
  check(
    "scrub is reversible mid-gesture",
    Math.abs(mid.left - midAgain.left) < 0.6,
    `left ${mid.left.toFixed(2)}% -> away -> ${midAgain.left.toFixed(2)}%`
  );

  // Layout box must never change: clip-path only, no width/height animation.
  const boxes = seen.map((s) => `${s.box.w}x${s.box.h}`);
  check("panel's layout box never changes (no layout animation)", new Set(boxes).size === 1, boxes.join(" "));

  const cls = await page.evaluate(() => window.__cls);
  check("CLS through the transition is 0", cls < 0.005, `CLS ${cls.toFixed(4)}`);

  // WHAT THE WINDOW OPENS ONTO.
  //
  // This block has now been wrong twice, in opposite directions, and the second
  // time nothing caught it. It first asserted the mural was behind the panel.
  // The reveal-retarget pass moved the target to About's CREAM ground and left
  // mural assertions below. Then dca56c5..7afd87c deleted the mural entirely and
  // made the ground char, and this file kept asserting rgb(250,244,236) against
  // a near-black page — it could not have passed, and it was not run.
  //
  // It now asserts the current truth: the window opens onto About's SAND ground
  // with the story composed on it, and there is no mural anywhere. The mural
  // checks are inverted rather than deleted, because "the illustration set is
  // not restored" is a live requirement of DIRECTION.md, not merely a fact.
  const behind = await page.evaluate(() => {
    const about = document.getElementById("about");
    const stage = document.querySelector("#about .about-stage");
    const heading = document.getElementById("about-heading");
    const copy = document.querySelector("#about .about-text p");
    const cta = document.querySelector("#about .about-text a");
    const vis = (e) => {
      if (!e) return false;
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && +cs.opacity > 0.5;
    };
    return {
      ground: getComputedStyle(about).backgroundColor,
      composed: [heading, copy, cta].every(vis),
      muralInStage: stage ? stage.querySelectorAll("img[src*='mural']").length : -1,
    };
  });
  // --color-sand. Read from the token sheet rather than hardcoded: this check
  // was written against #f2eadd and silently went red the moment the palette
  // was resampled from interior.png to #f4ece1. If it ever reads rgb(18,17,16)
  // the page ground has gone dark again, which constraint 1 forbids.
  const sandRGB = await page.evaluate(() => {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-sand")
      .trim();
    const c = document.createElement("canvas").getContext("2d");
    c.fillStyle = v;
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
  });
  check(
    "the window opens onto About's SAND ground",
    behind && behind.ground === sandRGB,
    `ground ${behind?.ground}, --color-sand ${sandRGB}`
  );
  check(
    "settled state is composed: heading, copy and action are all visible",
    behind && behind.composed,
    `composed ${behind?.composed}`
  );

  // THE MURAL SET STAYS GONE. The illustration mural (tiger, samulnori drummer,
  // hanok, Hahoe mask, flame mascot, stews) was never the restaurant's wall — it
  // stood in for a real painted wall that had never been photographed for the
  // site. DIRECTION.md supersedes it and says do not restore it, so this asserts
  // absence rather than composition.
  const mural = await page.evaluate(() => ({
    imgs: document.querySelectorAll("img[src*='mural']").length,
    backgrounds: [...document.querySelectorAll("*")].filter((e) =>
      /mural/.test(getComputedStyle(e).backgroundImage)
    ).length,
    bandEls: document.querySelectorAll(".mural-band, .mural-parallax").length,
  }));
  check("no mural <img> anywhere on the page", mural.imgs === 0, `${mural.imgs} found`);
  check("no mural used as a CSS background anywhere", mural.backgrounds === 0, `${mural.backgrounds} elements`);
  check("no mural band or parallax markup left behind", mural.bandEls === 0, `${mural.bandEls} elements`);

  const seam = await page.evaluate(() => {
    const el = document.querySelector("#about > div[aria-hidden='true']");
    return el ? { h: getComputedStyle(el).height, bg: getComputedStyle(el).backgroundImage.slice(0, 40) } : null;
  });
  check("chrome hairline present at the ground change", !!seam && seam.h === "1px" && /gradient/.test(seam.bg), seam ? seam.h : "missing");

  // Video pauses fully off-screen, resumes on return.
  await scrollTo(page, 3400);
  const offState = await page.evaluate(() => {
    const v = document.querySelector("video");
    if (!v) return null;
    const r = v.getBoundingClientRect();
    return { paused: v.paused, offScreen: r.bottom <= 0 || r.top >= innerHeight };
  });
  check("video pauses once fully off-screen", offState && offState.offScreen && offState.paused, `offScreen ${offState?.offScreen}, paused ${offState?.paused}`);
  await scrollTo(page, 0);
  await page.waitForTimeout(700);
  const backState = await page.evaluate(() => { const v = document.querySelector("video"); return v ? v.paused : null; });
  check("video resumes when it returns", backState === false, `paused ${backState}`);

  await ctx.close();
}

// ---- reduced motion --------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await skipPreloader(page);
  await page.goto(URL);
  await page.waitForLoadState("load");
  await page.waitForTimeout(1800);

  const before = await readClip(page);
  await scrollTo(page, 700);
  const after = await readClip(page);
  const p = parseInset(after.clip);
  check(
    "reduced motion: nothing clips",
    (after.clip === "none" || (p && p.right === 0 && p.bottom === 0)) && before.clip === after.clip,
    `clip ${after.clip.slice(0, 30)}`
  );
  const moved = await page.evaluate(() => {
    const m = document.querySelector(".hero-media");
    const t = getComputedStyle(m).transform;
    return t === "none" ? 0 : Math.abs(new DOMMatrixReadOnly(t).m42);
  });
  check("reduced motion: no parallax", moved < 0.5, `media ty ${moved}px`);
  const seam = await page.evaluate(() => {
    const el = document.querySelector("#about > div[aria-hidden='true']");
    return el ? getComputedStyle(el).height : null;
  });
  check("reduced motion: hairline intact", seam === "1px", String(seam));
  check("reduced motion: the story is actually readable", ...(await storyReadable(page)));
  await ctx.close();
}

// ---- mobile ----------------------------------------------------------------
for (const w of [375, 767]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 812 }, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await skipPreloader(page);
  await page.goto(URL);
  await page.waitForLoadState("load");
  await page.waitForTimeout(1800);

  await scrollTo(page, 600);
  const c = await readClip(page);
  const p = parseInset(c.clip);
  check(`${w}px: no clip scrub`, c.clip === "none" || (p && p.right === 0 && p.bottom === 0), `clip ${c.clip.slice(0, 30)}`);

  const overflow = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
  }));
  check(`${w}px: no horizontal overflow`, overflow.doc <= overflow.win + 1, `scrollWidth ${overflow.doc} vs ${overflow.win}`);
  check(`${w}px: the story is actually readable`, ...(await storyReadable(page)));

  // The retired illustration mural stays absent at every width, not just at
  // desktop. (This assertion was inverted in the desktop block and missed here,
  // so it went on demanding two mural sheets that no longer exist.)
  const m = await page.evaluate(
    () => document.querySelectorAll("img[src*='mural']").length
  );
  check(`${w}px: no mural <img>`, m === 0, `${m} found`);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
