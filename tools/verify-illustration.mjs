/**
 * verify-illustration.mjs — the Pick Your Fire section and its artwork.
 *
 *   node tools/verify-illustration.mjs [url]     (default http://localhost:3111/)
 *
 * The one thing worth guarding above all others is DOCUMENT ORDER inside the
 * charcoal half. The raw art drew the wire grate first and the briquettes
 * after it, so the coals floated on top of the bars they should be resting
 * under. That is a z-order bug a screenshot review catches once and a refactor
 * silently reintroduces, so it is asserted here.
 */
const pw = await import(
  new URL("../node_modules/playwright-core/index.js", import.meta.url).href
);
const chromium = (pw.default ?? pw).chromium;

const URL_ = process.argv[2] || "http://localhost:3111/";
let pass = 0;
const failures = [];
const check = (l, ok, d = "") => {
  if (ok) { pass++; console.log(`  PASS  ${l}${d ? ` — ${d}` : ""}`); }
  else { failures.push(`${l}${d ? ` — ${d}` : ""}`); console.log(`  FAIL  ${l}${d ? ` — ${d}` : ""}`); }
};

const browser = await chromium.launch();
const seed = (p) => p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });

console.log("\n=== THE ARTWORK ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.evaluate(() => document.querySelector("#pick-your-fire")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(1400);

  const svg = await p.evaluate(() => {
    const s = document.querySelector(".dual-grill");
    if (!s) return null;
    const coals = s.querySelector("#coals");
    const grate = s.querySelector("#grate");
    const after = (a, b) => !!a && !!b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) > 0;
    const strokeWidths = new Set();
    s.querySelectorAll("*").forEach((el) => {
      const w = getComputedStyle(el).strokeWidth;
      if (w && w !== "0px" && getComputedStyle(el).stroke !== "none") strokeWidths.add(w);
    });
    return {
      bytes: new Blob([s.outerHTML]).size,
      role: s.getAttribute("role"),
      label: s.getAttribute("aria-label"),
      groups: [...s.querySelectorAll("g")].map((g) => g.id).filter(Boolean),
      gradients: s.querySelectorAll("linearGradient,radialGradient,defs").length,
      styleTags: s.querySelectorAll("style").length,
      grateAfterCoals: after(coals, grate),
      coalCount: coals ? coals.children.length : 0,
      grateCount: grate ? grate.children.length : 0,
      emberCount: s.querySelectorAll("#coals .ember, #coals .ember-deep").length,
      strokeWidths: [...strokeWidths].sort(),
      // The measured on-screen box, to judge stroke crispness.
      renderedPx: Math.round(s.getBoundingClientRect().width),
    };
  });

  check("the illustration is inline SVG on the page", !!svg);
  check('role="img"', svg.role === "img");
  check("aria-label describes both halves", /gas/i.test(svg.label) && /charcoal/i.test(svg.label));
  check(
    "semantic groups exist",
    ["chassis", "gas-side", "charcoal-side", "coals", "grate"].every((g) => svg.groups.includes(g)),
    svg.groups.join(", ")
  );
  check("ZERO gradients / defs", svg.gradients === 0, `${svg.gradients}`);
  check("ZERO <style> tags inside the SVG", svg.styleTags === 0, `${svg.styleTags}`);
  check(
    "THE Z-ORDER FIX: #grate comes after #coals",
    svg.grateAfterCoals === true,
    `${svg.coalCount} coals then ${svg.grateCount} grate strands`
  );
  check("all four embers survived", svg.emberCount === 4, `${svg.emberCount}`);

  // COLOUR, not just count. A group-level default written as `#coals > *`
  // carries an ID and outranks `.ember`, which repainted every ember and every
  // coal highlight in the body colour — four shapes still present, fire out.
  // Counting them did not catch it; this does.
  const fills = await p.evaluate(() => {
    const f = (s) => {
      const e = document.querySelector(`.dual-grill ${s}`);
      return e ? getComputedStyle(e).fill : "MISSING";
    };
    return { ember: f(".ember"), emberDeep: f(".ember-deep"), coalDeep: f(".coal-deep"), coalMid: f(".coal-mid"), body: f("#coals > *:not([class])") };
  });
  const distinct = new Set(Object.values(fills)).size;
  check("the coal group's default does not flatten its own overrides", distinct === 5, JSON.stringify(fills));
  check("the hot ember is actually hot", fills.ember === "rgb(234, 88, 24)", fills.ember);
  check("the deep ember takes the brand accent", fills.emberDeep === "rgb(183, 52, 52)", fills.emberDeep);
  check(
    "exactly two stroke weights",
    svg.strokeWidths.length === 2,
    svg.strokeWidths.join(" / ")
  );
  check("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  console.log(`  INFO  served markup ${svg.bytes} bytes, rendered at ${svg.renderedPx}px`);

  // No machine names or retired colours reached the DOM.
  const dirty = await p.evaluate(() => {
    const s = document.querySelector(".dual-grill");
    const html = s.outerHTML;
    return {
      cls: (html.match(/cls-\d+/g) || []).length,
      white: (html.match(/#(FFFFFF|fff|DFDFDE|DBDDDC|DCDDDC|EEEEED)/gi) || []).length,
      inlineFill: (html.match(/ fill="/g) || []).length,
    };
  });
  check("no cls-N names in the DOM", dirty.cls === 0, `${dirty.cls}`);
  check("no white-family literals in the DOM", dirty.white === 0, `${dirty.white}`);
  check("no inline fill attributes (all styling is external)", dirty.inlineFill === 0, `${dirty.inlineFill}`);

  await ctx.close();
}

console.log("\n=== THE SECTION, AT EACH WIDTH ===");
for (const [w, h] of [[1440, 900], [768, 1024], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.evaluate(() => document.querySelector("#pick-your-fire")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(1400);

  const s = await p.evaluate(() => {
    const sec = document.getElementById("pick-your-fire");
    const svg = document.querySelector(".dual-grill");
    const head = document.getElementById("fire-heading");
    const eyebrow = sec.querySelector(".eyebrow");
    const cta = sec.querySelector("a[href='/menu']");
    const sr = svg.getBoundingClientRect(), hr = head.getBoundingClientRect();
    return {
      sectionBg: getComputedStyle(sec).backgroundColor,
      svgW: Math.round(sr.width),
      svgSquare: Math.abs(sr.width - sr.height) <= 2,
      headVisible: +getComputedStyle(head).opacity > 0.99 && hr.height > 20,
      eyebrowText: eyebrow?.textContent?.trim(),
      headText: head.textContent.trim(),
      ctaText: cta?.textContent?.trim(),
      sideBySide: sr.right <= hr.left + 4,
      illustrationFirst: sr.top <= hr.top + 2,
      overflow: document.body.scrollWidth - window.innerWidth,
    };
  });

  console.log(`\n  --- ${w}px ---`);
  check(`${w}: section keeps the warm ground`, s.sectionBg === "rgb(244, 236, 225)", s.sectionBg);
  check(`${w}: heading visible`, s.headVisible && s.headText === "Gas or charcoal", `"${s.headText}"`);
  check(`${w}: eyebrow present`, s.eyebrowText === "Pick your fire", `"${s.eyebrowText}"`);
  check(`${w}: CTA present`, /See the menu/.test(s.ctaText || ""), s.ctaText);
  check(`${w}: illustration is square`, s.svgSquare, `${s.svgW}px`);
  check(`${w}: illustration <= min(480, 88vw)`, s.svgW <= Math.min(480, w * 0.88) + 2, `${s.svgW}px vs ${Math.round(Math.min(480, w * 0.88))}`);
  check(`${w}: no horizontal overflow`, s.overflow <= 0, `${s.overflow}`);
  if (w >= 768) check(`${w}: two columns, illustration left`, s.sideBySide);
  else check(`${w}: stacked with the illustration first`, s.illustrationFirst);
  await ctx.close();
}

console.log("\n=== prefers-reduced-motion ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  await p.evaluate(() => document.querySelector("#pick-your-fire")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(1200);
  const s = await p.evaluate(() => {
    const embers = [...document.querySelectorAll(".dual-grill #coals .ember, .dual-grill #coals .ember-deep")];
    const head = document.getElementById("fire-heading");
    return {
      animations: embers.map((e) => getComputedStyle(e).animationName),
      opacities: embers.map((e) => getComputedStyle(e).opacity),
      headOpacity: getComputedStyle(head).opacity,
      // The SVG's OWN opacity. It used to be read off a `.scroll-reveal`
      // wrapper, which the assembly pass removed — the artwork is no longer
      // faded in as a block, it assembles part by part, so there is no wrapper
      // left to interrogate.
      svgOpacity: getComputedStyle(document.querySelector(".dual-grill")).opacity,
      chassisOpacity: getComputedStyle(document.querySelector(".dual-grill #chassis")).opacity,
    };
  });
  check("embers do not animate", s.animations.every((a) => a === "none"), s.animations.join(","));
  check("reduced motion: the assembly never ran (chassis at full opacity)", s.chassisOpacity === "1", s.chassisOpacity);
  check("embers sit at FULL opacity, not frozen at 0.65", s.opacities.every((o) => o === "1"), s.opacities.join(","));
  check("heading fully visible", s.headOpacity === "1", s.headOpacity);
  check("illustration fully visible", s.svgOpacity === "1", s.svgOpacity);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
