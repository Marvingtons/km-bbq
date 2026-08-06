/**
 * verify-illustration.mjs — the Pick Your Fire artwork and the copy beside it.
 *
 *   node tools/verify-illustration.mjs [url]     (default http://localhost:3111/)
 *
 * PICK YOUR FIRE IS NOT A SECTION ANY MORE. It is the second copy block of
 * `#about`, beside a sticky media column the illustration shares with the
 * photograph it is match-cut from, so everything here that used to be phrased
 * as "the section" is phrased against `#pick-your-fire` the block and
 * `.grill-layer` the artwork. The layout assertions changed with it: the
 * illustration is on the RIGHT above 1024 and BELOW the copy under it, which
 * is the reverse of the standalone section on both counts.
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

console.log("\n=== THE COPY AND THE ARTWORK, AT EACH WIDTH ===");
for (const [w, h] of [[1440, 900], [768, 1024], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  // The illustration, not the copy: above 1024 the copy scrolls past a sticky
  // media column, so centring the copy and centring the artwork are different
  // scroll positions and only the second one has the grill assembled.
  await p.evaluate(() => document.querySelector(".grill-layer")?.scrollIntoView({ block: "center" }));
  await p.waitForTimeout(1800);

  const s = await p.evaluate(() => {
    // `.fire-stage`, not `.fire-copy`. The copy block was split into
    // `.fire-head` (eyebrow + heading, inside the pinned hold) and
    // `.fire-body` (paragraphs + pill, below it), so no single element holds
    // both the eyebrow and the CTA any more. The stage contains all of them at
    // every breakpoint, which is what this block is actually reaching for.
    const block = document.querySelector(".fire-stage");
    const svg = document.querySelector(".dual-grill");
    const head = document.getElementById("fire-heading");
    const eyebrow = block.querySelector(".eyebrow");
    const cta = block.querySelector("a[href='/menu']");
    const sr = svg.getBoundingClientRect(), hr = head.getBoundingClientRect();
    return {
      sectionBg: getComputedStyle(document.getElementById("pick-your-fire")).backgroundColor,
      svgW: Math.round(sr.width),
      frameW: Math.round(document.querySelector(".media-frame").getBoundingClientRect().width),
      svgSquare: Math.abs(sr.width - sr.height) <= 2,
      headVisible: +getComputedStyle(head).opacity > 0.99 && hr.height > 20,
      eyebrowText: eyebrow?.textContent?.trim(),
      headText: head.textContent.trim(),
      ctaText: cta?.textContent?.trim(),
      // Above 1024 the artwork is the RIGHT column; below it, it is the last
      // block in a single stacked flow.
      artRight: sr.left >= hr.right - 4,
      artAfterCopy: sr.top >= hr.top,
      menuButtons: document.querySelectorAll("#pick-your-fire a[href='/menu']").length,
      overflow: document.body.scrollWidth - window.innerWidth,
    };
  });

  console.log(`\n  --- ${w}px ---`);
  check(`${w}: the section keeps the warm ground`, s.sectionBg === "rgb(244, 236, 225)", s.sectionBg);
  check(`${w}: heading visible`, s.headVisible && s.headText === "Gas or charcoal", `"${s.headText}"`);
  check(`${w}: eyebrow present`, s.eyebrowText === "Pick your fire", `"${s.eyebrowText}"`);
  check(`${w}: CTA present`, /See the menu/.test(s.ctaText || ""), s.ctaText);
  check(`${w}: exactly ONE menu button on the stage`, s.menuButtons === 1, `${s.menuButtons}`);
  check(`${w}: illustration is square`, s.svgSquare, `${s.svgW}px`);
  check(`${w}: no horizontal overflow`, s.overflow <= 0, `${s.overflow}`);
  if (w >= 1024) {
    // The SVG box is deliberately LARGER than the frame: the chassis rim is
    // scaled up until it fills the frame, so the viewBox overhangs it.
    check(`${w}: the frame is min(520, 42vw)`, s.frameW === Math.round(Math.min(520, w * 0.42)), `${s.frameW}px vs ${Math.round(Math.min(520, w * 0.42))}`);
    check(`${w}: the artwork is scaled up to fill the frame`, s.svgW > s.frameW && s.svgW < s.frameW * 1.15, `svg ${s.svgW}px in a ${s.frameW}px frame`);
    check(`${w}: two columns, illustration RIGHT`, s.artRight);
  } else {
    /* THE CAP MOVED FROM THE SVG TO THE FRAME, because below 1024 there is a
       frame now. This read `svgW <= min(480, 88vw)`, which was right while the
       illustration was a plain block in flow at that width and carried no
       transform. It is the morph's layer now: absolutely positioned inside
       `.media-frame` and scaled up so the chassis rim fills it, so its own box
       deliberately overhangs by ~7% and the clip is what bounds what you see.
       Measuring the transformed layer against an untransformed cap reported
       353px against 330 at 375 — a pass turned into a failure by the artwork
       doing exactly what it is supposed to.

       Same shape as the >=1024 branch above: assert the FRAME against its
       formula, then assert the artwork overhangs it by a bounded amount. */
    const cap = Math.round(Math.min(w * 0.88, h * 0.56));
    check(`${w}: the frame is min(88vw, 56vh)`, Math.abs(s.frameW - cap) <= 2, `${s.frameW}px vs ${cap}`);
    check(`${w}: the artwork is scaled up to fill the frame`, s.svgW > s.frameW && s.svgW < s.frameW * 1.15, `svg ${s.svgW}px in a ${s.frameW}px frame`);
    check(`${w}: stacked, illustration after the copy`, s.artAfterCopy);
  }
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
