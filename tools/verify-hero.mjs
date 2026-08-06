/**
 * verify-hero.mjs — the video hero.
 *
 *   node tools/verify-hero.mjs [url]     (default http://localhost:3111/)
 *
 * The previous file of this name was deleted: every assertion it carried
 * described the cream hero — a cream base, hero-poster.webp, cream glyph
 * halos, a blurred copy plate — and it had been unrunnable for two directions.
 * This is written fresh for what the hero now is.
 *
 * THE POINT OF THIS FILE IS THE CONTRAST SWEEP. Hero legibility here is a
 * documented unsolved problem: prior attempts measured 1.6-3.7:1 on the
 * supporting lines, and a poster-only check hides that, because the poster is
 * one frame and the type has to survive all 305 of them. So this seeks the
 * video across the clip, hides the type, photographs what is actually behind
 * each text block at each timestamp, and reports the worst case.
 *
 * Two numbers per element, because one is misleading on photography:
 *   mean  — contrast against the average background behind the glyphs
 *   p95   — contrast against the 95th-percentile brightest pixels, i.e. the
 *           highlight that a single blown-out specular can create
 * AA is judged on p95. Mean is reported so a marginal pass is legible as one.
 */
const pw = await import(
  new URL("../node_modules/playwright-core/index.js", import.meta.url).href
);
const chromium = (pw.default ?? pw).chromium;

const URL_ = process.argv[2] || "http://localhost:3111/";
const SAMPLES = 14; // timestamps swept across the clip

let pass = 0;
const failures = [];
const check = (label, ok, detail = "") => {
  if (ok) { pass++; console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ""}`); }
  else { failures.push(`${label}${detail ? ` — ${detail}` : ""}`); console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`); }
};

const relLumChannel = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
const relLum = (r, g, b) =>
  0.2126 * relLumChannel(r) + 0.7152 * relLumChannel(g) + 0.0722 * relLumChannel(b);
const contrast = (l1, l2) => { const [a, b] = [l1, l2].sort((x, y) => y - x); return (a + 0.05) / (b + 0.05); };

const browser = await chromium.launch();

/* ------------------------------------------------------------------ 1440 */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => {
  try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {}
  window.__cls = 0;
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
  }).observe({ type: "layout-shift", buffered: true });
});
// Media loads through range requests, and the engine cancels outstanding ones
// when it has buffered enough or when we seek. Playwright reports a cancel as
// `requestfailed`, so an aborted media request is normal and only a real
// transport error counts.
const failedReq = [];
page.on("requestfailed", (r) => {
  const err = r.failure()?.errorText || "";
  if (/ERR_ABORTED|net::ERR_ABORTED/.test(err)) return;
  failedReq.push(`${r.url()} (${err})`);
});
await page.goto(URL_, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

console.log("\n=== THE ELEMENT ===");
const el = await page.evaluate(() => {
  const v = document.querySelector("#home video");
  if (!v) return null;
  return {
    src: v.getAttribute("src"),
    poster: v.getAttribute("poster"),
    muted: v.muted,
    autoplay: v.autoplay,
    playsInline: v.playsInline || v.hasAttribute("playsinline"),
    hasLoopAttr: v.hasAttribute("loop"),
    controls: v.controls,
    preload: v.getAttribute("preload"),
    w: v.getAttribute("width"),
    h: v.getAttribute("height"),
    duration: v.duration,
    readyState: v.readyState,
    paused: v.paused,
    currentTime: v.currentTime,
  };
});
check("a <video> is mounted in the hero", !!el);
if (!el) { console.log("\nNo video — nothing further to measure."); await browser.close(); process.exit(1); }

/* THREE OF THESE ARE INVERTED, and all three for the same reason: the file was
   re-encoded. See the header of HeroBackdrop.tsx.

   SOURCE. Was "served from R2, not from /public". The R2 object is the ORIGINAL
   — 2.19MB, an unused AAC track, and `moov` at 99.5% of the file, so nothing
   could decode until the whole thing had landed. The re-encode is 0.93MB and
   faststart, and the bucket is not writable from the build, so the file that
   ships is the one in /public. Asserted the other way round now: a bare R2 URL
   here means the slow original is back.

   PRELOAD. Was "not 'auto' (must not compete with LCP)". Correct while the
   element mounted after `load` and could not play early anyway. With a
   faststart file the fetch is the whole point, and the poster keeps the LCP
   slot on its own (priority, 58KB, candidate area matched to the video's).

   LOOP. Was "no `loop` — looping would replay the empty plate from 0". The
   empty plate is not in the file any more (`-ss 2.6`), so frame zero IS the
   steak and looping to it is correct. This is the assertion that would catch
   the file being swapped back without the trim. */
check(
  "served from /public and not the un-faststart R2 original",
  el.src.startsWith("/") && /\.mp4$/.test(el.src) && !/r2\.dev/.test(el.src),
  el.src
);
check("muted", el.muted === true);
check("autoPlay", el.autoplay === true);
check("playsInline (required for iOS inline autoplay)", el.playsInline === true);
check("preload is 'auto' (faststart file, fetch is the point)", el.preload === "auto", `preload="${el.preload}"`);
check("intrinsic ratio declared (CLS safety)", el.w === "1920" && el.h === "1080", `${el.w}x${el.h}`);
check(
  "`loop` is set — the empty plate is trimmed out of the file, so 0 is the steak",
  el.hasLoopAttr === true
);
check("no controls — the poster is the graceful floor", el.controls !== true);
check("a poster is set on the element", !!el.poster, el.poster || "");
check("it is actually playing", el.paused === false, `paused=${el.paused}`);
/* THE EMPTY-PLATE CHECK MOVED FROM THE PLAYHEAD TO THE FILE.
   It read `currentTime >= 2.5`, which was how the old build skipped the bare
   plate and the oiling hand: seek past them on every loop. The trim removed
   them from the source, so the same guarantee is now "the file is the short
   one" — 7.57s, not the original 10.17s. Asserting currentTime >= 2.5 against
   a trimmed file would demand a seek that would put the playhead a third of
   the way in for no reason. */
check(
  "the empty-plate opening is trimmed out of the file",
  el.duration > 0 && el.duration < 8.5,
  `duration ${el.duration?.toFixed(2)}s (original was 10.17s)`
);
check("playback is at a real frame", el.currentTime >= 0, `currentTime ${el.currentTime?.toFixed(2)}s`);

check("no failed network requests", failedReq.length === 0, failedReq.slice(0, 2).join(", "));

console.log("\n=== THE POSTER UNDER IT ===");
const poster = await page.evaluate(() => {
  const img = document.querySelector("#home img");
  if (!img) return null;
  const r = img.getBoundingClientRect();
  return { src: img.currentSrc || img.src, w: Math.round(r.width), h: Math.round(r.height), complete: img.complete };
});
check("an optimised <Image> poster sits under the video", !!poster && poster.complete);
check("the poster fills the stage", !!poster && poster.w >= 1400 && poster.h > 400, poster ? `${poster.w}x${poster.h}` : "");

/* --------------------------------------------------- THE CONTRAST SWEEP */
console.log(`\n=== CONTRAST SWEEP — ${SAMPLES} frames across the clip ===`);
console.log("    Type is hidden and the background behind each block is photographed.\n");

const boxes = await page.evaluate(() => {
  // Resolve any CSS colour — including the oklab()/color-mix() that Tailwind
  // emits for alpha utilities like `text-sand/70` — down to real sRGB plus
  // alpha, by letting the canvas do the parsing. A regex over the computed
  // string does NOT work here: `oklab(0.94 0.003 0.019 / 0.7)` yields digits
  // that look like channel values and produce nonsense contrast in the
  // billions, which is how this was wrong the first time.
  const resolve = (css) => {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const g = c.getContext("2d");
    g.clearRect(0, 0, 1, 1);
    g.fillStyle = css;
    g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  };
  const box = (e) => {
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return {
      x: Math.round(r.x), y: Math.round(r.y),
      w: Math.round(r.width), h: Math.round(r.height),
      fg: resolve(getComputedStyle(e).color),
      text: (e.textContent || "").trim().slice(0, 34),
    };
  };
  // Found by CONTENT, not by structure. The price figure is a <span> nested
  // inside the price paragraph, and the paragraph itself sets no colour —
  // measuring the wrapper would read the inherited ink and report a number
  // that has nothing to do with what is on screen.
  // Match the figure EXACTLY ($21.99), not merely something starting with it.
  // The loose test caught the flex wrapper around "$21.99 Lunch", which sets
  // no colour of its own, inherits ink, and renders no text — reporting a
  // 1.01:1 failure for a span nobody can see.
  const priceFigure = [...document.querySelectorAll("#home span")].find(
    (s) => /^\$[\d.,]+$/.test((s.textContent || "").trim())
  );
  return {
    headline: box(document.querySelector("#home h1")),
    price: box(priceFigure),
    subhead: box(document.querySelector("#home p.copy")),
  };
});
for (const [k, b] of Object.entries(boxes))
  console.log(`    ${k.padEnd(9)} "${b?.text ?? "NOT FOUND"}"  fg rgba(${b?.fg.r},${b?.fg.g},${b?.fg.b},${b?.fg.a.toFixed(2)})  ${b?.w}x${b?.h}`);
console.log();

// Hide the type so the camera sees the ground it sits on.
await page.evaluate(() => {
  document.querySelectorAll("#home h1, #home p, #home a").forEach((e) => (e.style.visibility = "hidden"));
});

const duration = el.duration && isFinite(el.duration) ? el.duration : 10.16;
const START = 2.6;
const stamps = Array.from({ length: SAMPLES }, (_, i) => START + ((duration - START - 0.1) * i) / (SAMPLES - 1));

const analyse = async (clip) => {
  const buf = await page.screenshot({ clip });
  const b64 = buf.toString("base64");
  return page.evaluate(
    async ([data, w, h]) => {
      const img = new window.Image();
      img.src = "data:image/png;base64," + data;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, w, h).data;
      const lin = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      const px = [];
      let sr = 0, sg = 0, sb = 0;
      for (let i = 0; i < d.length; i += 4) {
        const L = 0.2126 * lin(d[i]) + 0.7152 * lin(d[i + 1]) + 0.0722 * lin(d[i + 2]);
        px.push({ L, r: d[i], g: d[i + 1], b: d[i + 2] });
        sr += d[i]; sg += d[i + 1]; sb += d[i + 2];
      }
      px.sort((a, b) => a.L - b.L);
      const n = px.length;
      const p = px[Math.floor(n * 0.95)];
      // Return RGB, not just luminance: alpha type has to be composited over
      // the real background before it can be measured.
      return {
        mean: { r: sr / n, g: sg / n, b: sb / n },
        p95: { r: p.r, g: p.g, b: p.b },
      };
    },
    [b64, Math.round(clip.width), Math.round(clip.height)]
  );
};

const worst = {};
for (const t of stamps) {
  await page.evaluate((time) => {
    const v = document.querySelector("#home video");
    v.pause();
    v.currentTime = time;
    return new Promise((res) => v.addEventListener("seeked", res, { once: true }));
  }, t);
  await page.waitForTimeout(120);

  for (const [name, box] of Object.entries(boxes)) {
    if (!box || box.w < 4 || box.h < 4) continue;
    const stats = await analyse({ x: box.x, y: box.y, width: box.w, height: box.h });
    // The supporting lines are alpha (text-sand/70, /80), so the glyph's real
    // colour is the token composited over whatever is behind it — measuring the
    // token alone would flatter every one of them.
    const over = (bg) => {
      const a = box.fg.a;
      const l = (ch, b) => relLumChannel(a * box.fg[ch] + (1 - a) * b);
      return 0.2126 * l("r", bg.r) + 0.7152 * l("g", bg.g) + 0.0722 * l("b", bg.b);
    };
    const cMean = contrast(over(stats.mean), relLum(stats.mean.r, stats.mean.g, stats.mean.b));
    const cP95 = contrast(over(stats.p95), relLum(stats.p95.r, stats.p95.g, stats.p95.b));
    if (!worst[name] || cP95 < worst[name].p95) worst[name] = { p95: cP95, mean: cMean, t };
  }
}

const NEED = { headline: 3.0, price: 3.0, subhead: 4.5 }; // large text 3:1, body 4.5:1
const LABEL = { headline: "headline  ALL-YOU-CAN-EAT (large)", price: "price     $21.99 / $30.99 (large)", subhead: "subhead   90 minutes... (body)" };
for (const [name, w] of Object.entries(worst)) {
  console.log(
    `  ${LABEL[name].padEnd(38)} worst frame ${w.t.toFixed(2)}s   mean ${w.mean.toFixed(2)}:1   p95 ${w.p95.toFixed(2)}:1`
  );
}
console.log();
for (const [name, w] of Object.entries(worst))
  check(`${name} clears ${NEED[name]}:1 on its WORST frame`, w.p95 >= NEED[name], `p95 ${w.p95.toFixed(2)}:1 at ${w.t.toFixed(2)}s`);

// Restore type, then CLS.
await page.evaluate(() => {
  document.querySelectorAll("#home h1, #home p, #home a").forEach((e) => (e.style.visibility = ""));
});
const cls = await page.evaluate(() => window.__cls);
check("CLS is 0 through hero load", cls < 0.005, `CLS ${cls.toFixed(4)}`);
await ctx.close();

/* --------------------------------------- FALLBACK: the clip is unreachable */
/* THE ROUTE PATTERN HAS TO FOLLOW THE SOURCE. It blocked `**\/*.r2.dev/**`,
   which after the re-encode matches nothing — so the video loaded normally and
   the "never fades in over it" assertion failed against a working page instead
   of a broken one. A fallback test that cannot trigger the fallback is worse
   than no test, because it reports PASS for the wrong reason right up until it
   reports FAIL for the wrong reason. */
console.log("\n=== FALLBACK — the clip is unreachable ===");
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await c.newPage();
  await p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });
  await p.route("**/kmbbq-hero.mp4", (route) => route.abort());
  await p.goto(URL_, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2500);
  const s = await p.evaluate(() => {
    const v = document.querySelector("#home video");
    const img = document.querySelector("#home img");
    return {
      videoOpacity: v ? getComputedStyle(v).opacity : null,
      posterComplete: img ? img.complete && img.naturalWidth > 0 : false,
      posterOpacity: img ? getComputedStyle(img).opacity : null,
    };
  });
  check("poster still painted when the clip fails", s.posterComplete === true && s.posterOpacity !== "0");
  check("failed video never fades in over it", s.videoOpacity === "0" || s.videoOpacity === null, `opacity ${s.videoOpacity}`);
  await c.close();
}

/* ------------------------------------------------------ REDUCED MOTION */
console.log("\n=== prefers-reduced-motion: reduce ===");
{
  const c = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await c.newPage();
  await p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });

  p.on("request", (r) => { if (/r2\.dev/.test(r.url())) r2.push(r.url()); });
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const s = await p.evaluate(() => ({
    video: !!document.querySelector("#home video"),
    posterComplete: (() => { const i = document.querySelector("#home img"); return !!i && i.complete && i.naturalWidth > 0; })(),
  }));
  /* INVERTED. This asserted that reduced motion mounted no <video> and never
     requested the clip.

     That gate was removed with the mobile-morph pass, and removing it was the
     point rather than a side effect: the video is now the single element the
     whole hero-to-grill sequence is built on, so unmounting it under a
     preference does not disable an animation, it removes the subject of one.
     What reduced motion actually objects to is the section-scale
     choreography — the pin, the scrub, the clip — and that is gated properly in
     MediaStage and PickYourFire, which build no timeline at all under it. Those
     opt-outs are asserted in verify-window and verify-assembly.

     A muted, looping, decorative background loop is not what the preference is
     about. What matters here is that nothing SCROLL-DRIVEN runs, which the
     `clip none` assertion in verify-window covers. */
  check("the video still mounts (it is the morph's subject, not an effect)", s.video === true);
  check("the poster is what renders underneath", s.posterComplete === true);
  await c.close();
}

/* -------------------------------------------------------------- MOBILE */
console.log("\n=== 375px ===");
{
  const c = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  const p = await c.newPage();
  await p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  const s = await p.evaluate(() => {
    const v = document.querySelector("#home video");
    const i = document.querySelector("#home img");
    return {
      hasVideo: !!v,
      paused: v ? v.paused : null,
      muted: v ? v.muted : null,
      playsInline: v ? v.playsInline : null,
      currentTime: v ? v.currentTime : null,
      posterComplete: !!i && i.complete && i.naturalWidth > 0,
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  check("no horizontal overflow at 375", s.overflowX === false);
  check("the poster is painted either way", s.posterComplete === true);
  if (s.hasVideo) {
    check("mobile video is muted + playsInline (the autoplay preconditions)", s.muted === true && s.playsInline === true);
    check(
      "it autoplays, or falls back to the poster cleanly",
      s.paused === false || s.posterComplete === true,
      s.paused === false ? `playing at ${s.currentTime?.toFixed(2)}s` : "paused, poster showing"
    );
  } else {
    check("no video mounted; poster carries the hero", s.posterComplete === true);
  }
  await c.close();
}

await browser.close();
console.log(`\n${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
