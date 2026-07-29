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
 *   4. About's mural is behind the window, full-bleed, at full opacity, and
 *      is the section's own element rather than a second copy of the asset
 *   5. the ember hairline is present at the ground change
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
    last && last.right > 15 && last.top > 5 && /round/.test(seen[seen.length - 1].clip),
    seen[seen.length - 1].clip.slice(0, 60)
  );

  const rights = seen.map((s) => parseInset(s.clip).right);
  check("clip progresses monotonically with scroll", rights.every((v, i) => i === 0 || v >= rights[i - 1] - 0.01), rights.map((r) => r.toFixed(1)).join(" -> "));

  // Reversible mid-gesture: go forward, come back, land on the same shape.
  await scrollTo(page, Math.round(0.5 * vh));
  const mid = parseInset((await readClip(page)).clip);
  await scrollTo(page, Math.round(0.9 * vh));
  await scrollTo(page, Math.round(0.5 * vh));
  const midAgain = parseInset((await readClip(page)).clip);
  check(
    "scrub is reversible mid-gesture",
    Math.abs(mid.right - midAgain.right) < 0.6,
    `right ${mid.right.toFixed(2)}% -> away -> ${midAgain.right.toFixed(2)}%`
  );

  // Layout box must never change: clip-path only, no width/height animation.
  const boxes = seen.map((s) => `${s.box.w}x${s.box.h}`);
  check("panel's layout box never changes (no layout animation)", new Set(boxes).size === 1, boxes.join(" "));

  const cls = await page.evaluate(() => window.__cls);
  check("CLS through the transition is 0", cls < 0.005, `CLS ${cls.toFixed(4)}`);

  // The mural behind: About's own element, untouched.
  const mural = await page.evaluate(() => {
    const img = document.querySelector("#about img[src*='mural-left']");
    if (!img) return null;
    const stage = img.closest(".mural-arrive") || img.parentElement;
    const cs = getComputedStyle(img);
    const sc = getComputedStyle(stage);
    return {
      count: document.querySelectorAll("img[src*='mural']").length,
      inHero: document.querySelectorAll("#home img[src*='mural']").length,
      opacity: cs.opacity, filter: cs.filter, stageOpacity: sc.opacity,
      aboutZ: getComputedStyle(document.getElementById("about")).zIndex,
      heroZ: getComputedStyle(document.getElementById("home")).zIndex,
    };
  });
  check("mural is About's own, none in the hero", mural && mural.inHero === 0, `${mural?.inHero} in hero, ${mural?.count} total`);
  check("mural is full-opacity and ungraded", mural && mural.opacity === "1" && mural.filter === "none" && mural.stageOpacity === "1", `opacity ${mural?.opacity}, filter ${mural?.filter}`);
  check("mural sits behind the hero's window", mural && Number(mural.aboutZ) < Number(mural.heroZ), `about z${mural?.aboutZ} < hero z${mural?.heroZ}`);

  const seam = await page.evaluate(() => {
    const el = document.querySelector("#about > div[aria-hidden='true']");
    return el ? { h: getComputedStyle(el).height, bg: getComputedStyle(el).backgroundImage.slice(0, 40) } : null;
  });
  check("ember hairline present at the ground change", !!seam && seam.h === "1px" && /gradient/.test(seam.bg), seam ? seam.h : "missing");

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
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
