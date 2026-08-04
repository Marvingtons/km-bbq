/**
 * verify-assembly.mjs — the grill assembly scrub.
 *
 *   node tools/verify-assembly.mjs [url]     (default http://localhost:3111/)
 *
 * DRIVES REAL SCROLL, not the timeline API. GSAP is bundled as a module and is
 * not on `window`, so there is no handle to poke — and that is the better test
 * anyway: it exercises the ScrollTrigger, the scrub lag and the ember hand-off
 * exactly as a reader's wheel does.
 *
 * Scroll positions are computed from the trigger's own definition rather than
 * guessed: start is `top 85%` and end is `center center`, so
 *     startY = sectionTop - 0.85 * vh
 *     endY   = sectionTop + sectionHeight / 2 - 0.5 * vh
 * and any progress p is startY + p * (endY - startY).
 *
 * One limit, stated rather than hidden: the brief asks for `gsap.getTweensOf`
 * to be watched for duplicate tweens. That needs gsap on `window`, which would
 * mean shipping a test hook in production. What is asserted instead is the
 * user-visible equivalent — after fast scrubbing back and forth across the
 * hand-off, no ember is left lit below the boundary and none is stuck mid-pulse
 * above it. A duplicated or orphaned tween shows up as exactly that.
 */
const pw = await import(
  new URL("../node_modules/playwright-core/index.js", import.meta.url).href
);
const chromium = (pw.default ?? pw).chromium;
const fs = await import("node:fs");

const URL_ = process.argv[2] || "http://localhost:3111/";
let pass = 0;
const failures = [];
const check = (l, ok, d = "") => {
  if (ok) { pass++; console.log(`  PASS  ${l}${d ? ` — ${d}` : ""}`); }
  else { failures.push(`${l}${d ? ` — ${d}` : ""}`); console.log(`  FAIL  ${l}${d ? ` — ${d}` : ""}`); }
};

/** State of every animated group, read off computed style. */
function readState() {
  const svg = document.querySelector(".dual-grill");
  if (!svg) return null;
  const o = (sel) => { const e = svg.querySelector(sel); return e ? +getComputedStyle(e).opacity : null; };
  const many = (sel) => [...svg.querySelectorAll(sel)].map((e) => +getComputedStyle(e).opacity);
  const dash = (sel) => { const e = svg.querySelector(sel); return e ? parseFloat(getComputedStyle(e).strokeDashoffset) || 0 : null; };
  const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
  return {
    chassis: o("#chassis"),
    gasSurface: o("#gas-surface"),
    slots: avg(many("#gas-surface .dial")),
    bowl: o("#charcoal-ground"),
    coals: avg(many("#coals > *:not(.ember):not(.ember-deep)")),
    grate: o("#grate"),
    meshDash: dash("#grate > *"),
    dividerDash: dash(".divider"),
    embers: many("#coals .ember, #coals .ember-deep"),
    emberAvg: avg(many("#coals .ember, #coals .ember-deep")),
  };
}

function scrollBounds() {
  const sec = document.getElementById("pick-your-fire");
  const r = sec.getBoundingClientRect();
  const top = r.top + window.scrollY;
  const vh = window.innerHeight;
  return { startY: top - 0.85 * vh, endY: top + r.height / 2 - 0.5 * vh };
}

const browser = await chromium.launch();
const seed = (p) => p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });

console.log("\n=== DESKTOP 1440 — SCRUBBED ASSEMBLY ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 140)));
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);

  const at = async (progress, settle = 900) => {
    await p.evaluate(
      ([pr, boundsFn]) => {
        const { startY, endY } = new Function("return " + boundsFn)()();
        window.scrollTo(0, Math.round(startY + pr * (endY - startY)));
      },
      [progress, scrollBounds.toString()]
    );
    await p.waitForTimeout(settle);
    return p.evaluate(readState);
  };

  check(
    "no pin-spacer AROUND THIS SECTION (the gallery has one; scope the check)",
    (await p.evaluate(() => !document.getElementById("pick-your-fire").parentElement.classList.contains("pin-spacer"))) === true
  );

  const s0 = await at(0.0);
  check("before the trigger: everything hidden", [s0.chassis, s0.gasSurface, s0.bowl, s0.grate, s0.emberAvg].every((v) => v < 0.05), JSON.stringify({ ...s0, embers: undefined }));

  const s15 = await at(0.15);
  check("0.15 chassis arriving, gas has not started", s15.chassis > 0.4 && s15.gasSurface < 0.1, `chassis ${s15.chassis?.toFixed(2)}, gas ${s15.gasSurface?.toFixed(2)}`);

  const s35 = await at(0.35);
  check("0.35 gas plate in, dial mid-sweep, coals not started", s35.gasSurface > 0.9 && s35.slots > 0 && s35.slots < 1 && s35.coals < 0.1, `gas ${s35.gasSurface?.toFixed(2)}, slots ${s35.slots?.toFixed(2)}, coals ${s35.coals?.toFixed(2)}`);

  const s47 = await at(0.47);
  check("0.47 dial finished before the pour", s47.slots > 0.95 && s47.coals < 0.3, `slots ${s47.slots?.toFixed(2)}, coals ${s47.coals?.toFixed(2)}`);

  const s60 = await at(0.6);
  check("0.60 coals tumbling, grate still up", s60.coals > 0.2 && s60.coals < 1 && s60.grate < 0.1, `coals ${s60.coals?.toFixed(2)}, grate ${s60.grate?.toFixed(2)}`);

  const s74 = await at(0.74);
  check("0.74 FEATURED BEAT: grate landing over settled coals", s74.grate > 0.15 && s74.coals > 0.95, `grate ${s74.grate?.toFixed(2)}, coals ${s74.coals?.toFixed(2)}`);

  const s88 = await at(0.88);
  check("0.88 divider drawing, embers not lit", s88.dividerDash < 117 && s88.emberAvg < 0.1, `dividerDash ${s88.dividerDash?.toFixed(1)}, embers ${s88.emberAvg?.toFixed(2)}`);

  const s100 = await at(1.02);
  check("assembled: every group at full opacity", [s100.chassis, s100.gasSurface, s100.slots, s100.bowl, s100.coals, s100.grate].every((v) => v > 0.98), JSON.stringify({ ...s100, embers: undefined }));
  check("assembled: mesh and divider fully drawn", s100.meshDash < 0.5 && s100.dividerDash < 0.5, `mesh ${s100.meshDash}, divider ${s100.dividerDash}`);

  const back = await at(0.0);
  check("scrubbing back disassembles with no orphans", [back.chassis, back.gasSurface, back.bowl, back.grate, back.emberAvg].every((v) => v < 0.05), JSON.stringify({ ...back, embers: undefined }));

  console.log("\n  --- ember hand-off, scrubbed fast across 0.9-1.0 ---");
  for (const pr of [0.88, 0.98, 0.91, 1.02, 0.85, 1.02, 0.92]) await at(pr, 260);
  const lit = await at(1.05, 1400);
  check("past the boundary the loop runs (embers between the floor and 1)", lit.embers.every((o) => o >= 0.6 && o <= 1.001) && lit.embers.some((o) => o < 1), lit.embers.map((n) => n.toFixed(2)).join(","));

  const dropped = await at(0.6, 1100);
  check("scrubbed back below 0.9, no ember is left lit", dropped.embers.every((o) => o < 0.05), dropped.embers.map((n) => n.toFixed(2)).join(","));

  const relit = await at(1.05, 1400);
  check("and it re-lights cleanly on the way back up", relit.embers.every((o) => o >= 0.6), relit.embers.map((n) => n.toFixed(2)).join(","));

  console.log("\n  --- fast scroll past ---");
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(1800);
  await p.evaluate(() => {
    const sec = document.getElementById("pick-your-fire");
    window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY - 100);
  });
  await p.waitForTimeout(1400);
  const afterFast = await p.evaluate(readState);
  check("after a fast scroll past and back, nothing is stuck hidden", [afterFast.chassis, afterFast.gasSurface, afterFast.coals, afterFast.grate].every((v) => v > 0.9), JSON.stringify({ ...afterFast, embers: undefined }));

  check("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await ctx.close();
}

console.log("\n=== NO EASE OTHER THAN 'none' IN THE SCRUBBED BRACKET ===");
{
  const src = fs.readFileSync(new URL("../src/components/PickYourFire.tsx", import.meta.url), "utf8");
  const bracket = src.slice(
    src.indexOf('"(min-width: 1024px) and (prefers-reduced-motion: no-preference)"'),
    src.indexOf('"(max-width: 1023px)')
  );
  check("desktop bracket exists", bracket.length > 100, `${bracket.length} chars`);
  const built = [...bracket.matchAll(/buildTimeline\(([^)]*)\)/g)].map((m) => m[1].replace(/\s+/g, " "));
  check("it builds the timeline with none/none", built.length === 1 && /"none", "none"/.test(built[0]), built.join(" | "));
  const stray = [...bracket.matchAll(/ease:\s*"(?!none")([^"]+)"/g)].map((m) => m[1]);
  check("no other ease string inside it", stray.length === 0, stray.join(","));
}

console.log("\n=== MOBILE 375 — ONE-SHOT, NO SCRUB ===");
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const before = await p.evaluate(readState);
  check("375: art starts hidden (JS-set initial states)", before.chassis < 0.05, `${before.chassis}`);
  await p.evaluate(() => document.querySelector("#pick-your-fire").scrollIntoView({ block: "center" }));
  await p.waitForTimeout(1000);
  const mid = await p.evaluate(readState);
  await p.waitForTimeout(2200);
  const after = await p.evaluate(readState);
  check("375: it plays without scroll input (one-shot, not scrubbed)", mid.chassis > 0.5, `chassis at ~1s: ${mid.chassis?.toFixed(2)}`);
  check("375: completes fully assembled", [after.chassis, after.gasSurface, after.coals, after.grate].every((v) => v > 0.98), JSON.stringify({ ...after, embers: undefined }));
  check("375: embers end up on the idle loop", after.embers.every((o) => o >= 0.6), after.embers.map((n) => n.toFixed(2)).join(","));
  check(
    "375: the section is not pinned",
    (await p.evaluate(() => !document.getElementById("pick-your-fire").parentElement.classList.contains("pin-spacer"))) === true
  );
  await ctx.close();
}

console.log("\n=== REDUCED MOTION — NO TIMELINE AT ALL ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const s = await p.evaluate(readState);
  check("reduced motion: fully assembled from first paint", [s.chassis, s.gasSurface, s.slots, s.bowl, s.coals, s.grate].every((v) => v > 0.99), JSON.stringify({ ...s, embers: undefined }));
  check("reduced motion: embers static at FULL opacity", s.embers.every((o) => o === 1), s.embers.join(","));
  check("reduced motion: nothing was dash-prepped", s.meshDash === 0 && s.dividerDash === 0, `mesh ${s.meshDash}, divider ${s.dividerDash}`);
  await ctx.close();
}

console.log("\n=== JS DISABLED ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(URL_, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  const html = await p.content();
  check("no JS: groups are present", /id="chassis"/.test(html) && /id="grate"/.test(html) && /id="coals"/.test(html));
  check("no JS: no inline opacity:0 anywhere in the illustration", !/dual-grill[\s\S]{0,40000}?opacity:\s*0[;"]/.test(html.slice(html.indexOf("dual-grill"), html.indexOf("</svg>"))));
  await ctx.close();
}

console.log("\n=== RESIZE ACROSS 1024px, BOTH DIRECTIONS ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);
  // A double-built timeline shows up as the art never reaching a clean state
  // and as extra pin-spacers/triggers; with no gsap global, the observable
  // proxy is that the section still assembles and disassembles correctly
  // after repeated crossings.
  const roundTrip = async () => {
    await p.setViewportSize({ width: 900, height: 900 });
    await p.waitForTimeout(1200);
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.waitForTimeout(1200);
  };
  await roundTrip();
  await roundTrip();
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(900);
  const top = await p.evaluate(readState);
  check("after two round trips: still hidden above the trigger", top.chassis < 0.1, `chassis ${top.chassis?.toFixed(2)}`);
  await p.evaluate(() => {
    const sec = document.getElementById("pick-your-fire");
    window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY + sec.getBoundingClientRect().height / 2 - window.innerHeight / 2);
  });
  await p.waitForTimeout(1400);
  const assembled = await p.evaluate(readState);
  check("after two round trips: still assembles to complete", [assembled.chassis, assembled.gasSurface, assembled.coals, assembled.grate].every((v) => v > 0.95), JSON.stringify({ ...assembled, embers: undefined }));
  check(
    "after two round trips: the section still is not pinned",
    (await p.evaluate(() => !document.getElementById("pick-your-fire").parentElement.classList.contains("pin-spacer"))) === true
  );
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
