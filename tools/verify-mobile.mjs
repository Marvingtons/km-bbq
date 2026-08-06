/**
 * Mobile audit at 375px (and 390/767 for the breakpoint edges).
 *
 *   node tools/verify-mobile.mjs [url]
 *
 * Checks the things that only break on a phone: that no <video> is in the DOM
 * (not merely invisible), that nothing overflows horizontally on ANY route,
 * that the split display type neither overflows nor collides, and that every
 * interactive target clears 44px.
 */
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = (process.argv[2] || "http://localhost:3117").replace(/\/$/, "");
const ROUTES = ["/", "/menu", "/privacy", "/terms"];
const results = [];
const check = (n, pass, d) => { results.push({ n, pass }); console.log(`${pass ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`); };

const skip = (p) => p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });
const browser = await chromium.launch();

// --- no video in the DOM, at every sub-768 width ---------------------------
for (const w of [375, 390, 767]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 812 }, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await skip(p);
  let mp4 = 0;
  p.on("response", (r) => { if (/\.mp4/.test(r.url())) mp4++; });
  await p.goto(BASE + "/");
  await p.waitForLoadState("load");
  await p.waitForTimeout(1800);
  const dom = await p.evaluate(() => ({
    videos: document.querySelectorAll("video").length,
    poster: !!document.querySelector('img[src*="hero-poster"]'),
  }));
  /* EXACTLY ONE <video>, AND THAT IS THE REVERSE OF WHAT THIS ASSERTED.
     ------------------------------------------------------------------------
     It read `dom.videos === 0 && mp4 === 0`: a phone got the poster and never
     fetched the clip, because below 1024 there was no morph for the footage to
     be part of. The morph runs at every width now, and the whole trick is that
     the SAME element is the hero's backdrop and the thing that becomes the
     grill — so zero videos on a phone would mean the feature is missing, and
     two would mean the single-element contract is broken. One is the assertion
     at every width, which is the same thing verify-assembly checks at 1440. */
  check(`${w}px: exactly one <video> in the DOM`, dom.videos === 1, `${dom.videos} elements, ${mp4} mp4 requests`);
  check(`${w}px: poster present`, dom.poster);
  await ctx.close();
}

// --- horizontal overflow on every route ------------------------------------
for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await skip(p);
  await p.goto(BASE + route);
  await p.waitForLoadState("load");
  await p.waitForTimeout(1500);
  // Scroll the whole page: overflow can appear only once pinned sections engage.
  const worst = await p.evaluate(async () => {
    let max = 0;
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y <= h; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
      max = Math.max(max, document.documentElement.scrollWidth);
    }
    return { max, vw: window.innerWidth };
  });
  check(`${route} : scrollWidth === viewport at 375px`, worst.max === worst.vw, `${worst.max} vs ${worst.vw}`);
  await ctx.close();
}

// --- display type + tap targets at 375 -------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await skip(p);
  await p.goto(BASE + "/");
  await p.waitForLoadState("load");
  await p.waitForTimeout(1800);

  const type = await p.evaluate(() => {
    const ink = (el) => { const r = document.createRange(); r.selectNodeContents(el); const b = [...r.getClientRects()];
      return b.length ? { l: Math.min(...b.map(x=>x.left)), r: Math.max(...b.map(x=>x.right)), t: Math.min(...b.map(x=>x.top)), b: Math.max(...b.map(x=>x.bottom)) } : null; };
    /* THE VISIBLE LOCKUP, EXPLICITLY. These read `span:first-child` /
       `span:last-child`, which is fragile the moment the h1 gains any other
       span — and it has: the heading now carries `sr-only` fragments naming
       the restaurant and the city, so the h1's accessible and crawlable text
       is a full sentence while the display type stays one word.

       An `sr-only` span is clipped to 1px, but a Range over its CONTENTS still
       reports the untruncated width, so `span:last-child` measured 759px of
       hidden text on a 375px screen and failed a viewport-overflow check that
       nothing visible was failing. `[data-headline]` is the display lockup and
       is what these two checks were always about. */
    const lockup = document.querySelector("#home h1 [data-headline]");
    const self = ink(lockup);
    const serve = ink(lockup);
    const sub = ink(document.querySelector("#home .copy"));
    const cta = document.querySelector("#home a[href='/menu']").getBoundingClientRect();
    return { vw: innerWidth, vh: innerHeight,
      selfR: Math.round(self.r), serveR: Math.round(serve.r),
      overlap: +(self.b - serve.t).toFixed(1),
      subR: Math.round(sub.r), ctaBottom: Math.round(cta.bottom) };
  });
  check("375px: SELF does not overflow", type.selfR <= type.vw, `right edge ${type.selfR} / ${type.vw}`);
  check("375px: SERVE does not overflow", type.serveR <= type.vw, `right edge ${type.serveR} / ${type.vw}`);
  // COLLISION IS ABOUT INK, NOT LINE BOXES. Variant B sets the lockup at
  // leading-[0.8], so the two line boxes overlap by ~33px on purpose — the
  // tight leading IS the split scale. Comparing getClientRects() reports a
  // collision that is not there. The honest test is pixels: render the lockup
  // with no halo over flat white and look for a fully-blank row between the
  // two words. If one exists, they do not touch.
  await p.evaluate(() => {
    const h1 = document.querySelector("#home h1");
    h1.dataset.kmPrev = h1.style.cssText;
    h1.style.textShadow = "none";
    const w = document.querySelector(".hero-window");
    w.dataset.kmPrev = w.style.cssText;
    w.style.background = "#fff";
    document.querySelectorAll(".hero-media").forEach((n) => { n.dataset.kmPrev = n.style.cssText; n.style.visibility = "hidden"; });
  });
  await p.waitForTimeout(150);
  const hb = await p.evaluate(() => { const r = document.querySelector("#home h1").getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
  const SHOT = join(tmpdir(), "km-lockup.png");
  await p.screenshot({ path: SHOT, clip: { x: hb.x, y: hb.y, width: hb.w, height: hb.h } });
  await p.evaluate(() => {
    const h1 = document.querySelector("#home h1"); h1.style.cssText = h1.dataset.kmPrev || "";
    const w = document.querySelector(".hero-window"); w.style.cssText = w.dataset.kmPrev || "";
    document.querySelectorAll(".hero-media").forEach((n) => { n.style.cssText = n.dataset.kmPrev || ""; });
  });
  const raw = execFileSync("magick", [SHOT, "-depth", "8", "RGB:-"], { maxBuffer: 1 << 28 });
  const W = hb.w, H = raw.length / 3 / W;
  const rowHasInk = [];
  for (let y = 0; y < H; y++) {
    let ink = false;
    for (let x = 0; x < W; x++) { const p2 = (y * W + x) * 3; if (765 - (raw[p2] + raw[p2+1] + raw[p2+2]) > 90) { ink = true; break; } }
    rowHasInk.push(ink);
  }
  const first = rowHasInk.indexOf(true), last = rowHasInk.lastIndexOf(true);
  let blankRuns = 0, run = 0, longest = 0;
  for (let y = first; y <= last; y++) { if (!rowHasInk[y]) { run++; longest = Math.max(longest, run); } else { if (run > 0) blankRuns++; run = 0; } }
  check(
    "375px: split lines do not collide (blank pixel row between words)",
    longest >= 1,
    `${longest}px of blank rows separate the two words; their line boxes overlap ${type.overlap}px by design (leading-[0.8])`
  );

  check("375px: subhead does not overflow", type.subR <= type.vw, `right edge ${type.subR} / ${type.vw}`);
  check("375px: CTA fully visible in the first screen", type.ctaBottom <= type.vh, `bottom ${type.ctaBottom} / ${type.vh}`);

  const taps = await p.evaluate(() => {
    const out = [];
    const sels = ["header a", "header button", "#home a[href='/menu']"];
    for (const s of sels) for (const el of document.querySelectorAll(s)) {
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      out.push({ what: (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 22), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
  const small = taps.filter((t) => t.h < 44 || t.w < 44);
  check("375px: tap targets >= 44px", small.length === 0, small.length ? small.map((t) => `${t.what} ${t.w}x${t.h}`).join("; ") : `${taps.length} targets checked`);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
