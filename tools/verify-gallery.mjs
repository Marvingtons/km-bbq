/**
 * verify-gallery.mjs — the two-mode gallery.
 *
 *   node tools/verify-gallery.mjs [url]     (default http://localhost:3111/)
 *
 * The gallery serves one DOM in two modes: a GSAP-pinned horizontal scrub at
 * >=1024px with motion allowed, and a native scroll-snap strip everywhere else.
 * The failure modes worth guarding are the ones this project has actually hit:
 *
 *   - the heading rendering as an empty block because something animated it
 *   - the first card clipped off the left edge because the track starts at a
 *     negative offset or loses its padding
 *   - duplicate pin-spacers stacking across hot reload or a resize, which
 *     shows up as a screen of blank scroll
 *   - the pin quietly growing past the dead-scroll budget
 *   - a pin-spacer existing at all on mobile
 */
const pw = await import(
  new URL("../node_modules/playwright-core/index.js", import.meta.url).href
);
const chromium = (pw.default ?? pw).chromium;

const URL_ = process.argv[2] || "http://localhost:3111/";
const MAX_PIN_VH = 1.75;

let pass = 0;
const failures = [];
const check = (l, ok, d = "") => {
  if (ok) { pass++; console.log(`  PASS  ${l}${d ? ` — ${d}` : ""}`); }
  else { failures.push(`${l}${d ? ` — ${d}` : ""}`); console.log(`  FAIL  ${l}${d ? ` — ${d}` : ""}`); }
};

const browser = await chromium.launch();
const seed = (p) => p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });

/** The heading must be visible everywhere, including with JS off. */
const headingState = (p) =>
  p.evaluate(() => {
    const h = document.getElementById("gallery-heading");
    const e = document.querySelector("#gallery .eyebrow");
    const hidden = (el) => {
      let n = el;
      while (n && n !== document.body) {
        const c = getComputedStyle(n);
        if (+c.opacity < 0.99 || c.visibility === "hidden" || c.display === "none") return true;
        n = n.parentElement;
      }
      return false;
    };
    return {
      text: h?.textContent?.trim(),
      eyebrow: e?.textContent?.trim(),
      h: h ? Math.round(h.getBoundingClientRect().height) : 0,
      inline: h?.getAttribute("style") || "",
      hidden: h ? hidden(h) : true,
    };
  });

/* ------------------------------------------------------- 1440: pinned mode */
console.log("\n=== 1440px — PINNED MODE ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 120)));
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);

  const head = await headingState(p);
  check("heading is visible and unanimated", head.text === "A look inside" && head.h > 20 && !head.hidden && head.inline === "", `"${head.text}" h=${head.h} style="${head.inline}"`);
  check("eyebrow is visible", head.eyebrow === "Gallery");

  // ONE SPACER AROUND THE GALLERY, not one on the page. Pick Your Fire pins
  // too now, so counting every `.pin-spacer` counts a different section's — and
  // what this check exists for is that the gallery never STACKS a second one on
  // a hot reload or a resize.
  const spacers = await p.evaluate(
    () =>
      [...document.querySelectorAll(".pin-spacer")].filter((s) =>
        s.querySelector("#gallery")
      ).length
  );
  check("exactly one pin-spacer around the gallery", spacers === 1, `${spacers}`);

  // HELD scroll, not spacer height. The pin-spacer is the section's own height
  // PLUS the pinned duration, so measuring the spacer alone charges the budget
  // for a screen the reader was going to scroll past anyway. The dead-scroll
  // cost is the part where the page does not move: spacer minus section.
  const geom = await p.evaluate(() => {
    const sp = document.getElementById("gallery").parentElement;
    const sec = document.getElementById("gallery");
    return {
      spacerH: sp ? Math.round(sp.getBoundingClientRect().height) : 0,
      sectionH: Math.round(sec.getBoundingClientRect().height),
      vh: window.innerHeight,
    };
  });
  const held = geom.spacerH - geom.sectionH;
  const vhCost = held / geom.vh;
  check(
    `held scroll within ${MAX_PIN_VH} viewport heights`,
    vhCost <= MAX_PIN_VH + 0.02,
    `${held}px held = ${vhCost.toFixed(2)}vh (spacer ${geom.spacerH}, section ${geom.sectionH})`
  );

  // Scroll to the top of the pin and confirm the first card is fully visible.
  const atStart = await p.evaluate(async () => {
    const sec = document.getElementById("gallery");
    window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY);
    await new Promise((r) => setTimeout(r, 1400));
    const first = document.querySelector(".gallery-item");
    const cap = first.querySelector("figcaption");
    const track = document.querySelector(".gallery-track");
    const col = document.querySelector("#gallery .col-text");
    const fr = first.getBoundingClientRect(), cr = cap.getBoundingClientRect();
    return {
      left: Math.round(fr.left), right: Math.round(fr.right),
      colLeft: Math.round(col.getBoundingClientRect().left),
      x: Math.round(new DOMMatrix(getComputedStyle(track).transform).m41),
      capVisible: cr.height > 0 && +getComputedStyle(cap).opacity > 0.99,
      win: window.innerWidth,
    };
  });
  check("at rest the track sits at x=0", Math.abs(atStart.x) <= 2, `x=${atStart.x}`);
  check("first card is NOT clipped off the left edge", atStart.left >= 0, `left=${atStart.left}`);
  check("first card aligns with the page container", Math.abs(atStart.left - atStart.colLeft) <= 2, `card ${atStart.left} vs column ${atStart.colLeft}`);
  check("first card is fully on screen", atStart.right <= atStart.win, `right=${atStart.right} vs ${atStart.win}`);
  check("its caption is visible at full opacity", atStart.capVisible);

  // Scroll through the pin and confirm the track actually scrubs.
  const scrub = await p.evaluate(async () => {
    const sec = document.getElementById("gallery");
    const sp = document.getElementById("gallery").parentElement;
    const top = sp.getBoundingClientRect().top + window.scrollY;
    const track = document.querySelector(".gallery-track");
    const xs = [];
    for (const f of [0, 0.35, 0.7, 1]) {
      window.scrollTo(0, top + sp.getBoundingClientRect().height * f);
      await new Promise((r) => setTimeout(r, 1000));
      xs.push(Math.round(new DOMMatrix(getComputedStyle(track).transform).m41));
    }
    const items = [...document.querySelectorAll(".gallery-item")];
    const last = items[items.length - 1].getBoundingClientRect();
    void sec;
    return { xs, lastRight: Math.round(last.right), win: window.innerWidth, pinned: getComputedStyle(document.getElementById("gallery")).position };
  });
  check("track scrubs left as the pin advances", scrub.xs.every((v, i) => i === 0 || v <= scrub.xs[i - 1] + 1), scrub.xs.join(" -> "));
  check("track actually travels", scrub.xs[scrub.xs.length - 1] < -100, `ends at ${scrub.xs[scrub.xs.length - 1]}`);
  check("last card ends fully on screen with room to spare", scrub.lastRight <= scrub.win && scrub.lastRight > scrub.win - 260, `right=${scrub.lastRight} vs ${scrub.win}`);

  // Back up: nothing un-reveals, heading still there.
  const back = await p.evaluate(async () => {
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 1200));
    const h = document.getElementById("gallery-heading");
    return { h: Math.round(h.getBoundingClientRect().height), op: getComputedStyle(h).opacity };
  });
  check("scrolling back up does not un-reveal the heading", back.h > 20 && back.op === "1", `h=${back.h} op=${back.op}`);

  // The chevrons and the section's block padding both belong to strip mode.
  // Both were silently beaten by Tailwind utilities when the pinned rules lived
  // inside @layer components — utilities sit in a later layer, so a layered
  // rule loses however specific it is. Asserted because eyes caught this, not
  // the suite.
  const modeBleed = await p.evaluate(() => {
    const sec = document.getElementById("gallery");
    const chev = document.querySelector(".gallery-chevrons");
    const cs = getComputedStyle(sec);
    return {
      chevronsHidden: chev ? getComputedStyle(chev).display === "none" : true,
      padTop: cs.paddingTop,
      padBottom: cs.paddingBottom,
      height: Math.round(sec.getBoundingClientRect().height),
      vh: window.innerHeight,
    };
  });
  check("chevrons are hidden in pinned mode", modeBleed.chevronsHidden);
  check("section block padding is zeroed in pinned mode", modeBleed.padTop === "0px" && modeBleed.padBottom === "0px", `${modeBleed.padTop} / ${modeBleed.padBottom}`);
  check("pinned section is exactly one viewport tall", Math.abs(modeBleed.height - modeBleed.vh) <= 2, `${modeBleed.height} vs ${modeBleed.vh}`);

  check("no console errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await ctx.close();
}

/* ------------------------------------------------------- 375: strip mode */
console.log("\n=== 375px — STRIP MODE ===");
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);

  const head = await headingState(p);
  check("heading is visible", head.text === "A look inside" && head.h > 20 && !head.hidden);

  const s = await p.evaluate(async () => {
    document.getElementById("gallery").scrollIntoView({ block: "center" });
    await new Promise((r) => setTimeout(r, 700));
    const strip = document.querySelector(".gallery-strip");
    const track = document.querySelector(".gallery-track");
    const first = document.querySelector(".gallery-item");
    const chev = document.querySelector(".gallery-chevrons");
    return {
      spacers: [...document.querySelectorAll(".pin-spacer")].filter((x) => x.querySelector("#gallery")).length,
      canScroll: strip.scrollWidth > strip.clientWidth + 2,
      snap: getComputedStyle(strip).scrollSnapType,
      overflow: getComputedStyle(strip).overflowX,
      trackX: Math.round(new DOMMatrix(getComputedStyle(track).transform).m41),
      firstLeft: Math.round(first.getBoundingClientRect().left),
      chevronsHidden: chev ? getComputedStyle(chev).display === "none" : true,
      bodyOverflow: document.body.scrollWidth - window.innerWidth,
    };
  });
  check("NO pin-spacer around the gallery at all", s.spacers === 0, `${s.spacers}`);
  check("strip scrolls natively", s.canScroll && s.overflow === "auto");
  check("scroll-snap is on", /mandatory/.test(s.snap), s.snap);
  check("track carries no transform", s.trackX === 0, `x=${s.trackX}`);
  check("first card is not clipped", s.firstLeft >= 0, `left=${s.firstLeft}`);
  check("chevrons hidden at 375", s.chevronsHidden);
  check("no horizontal page overflow", s.bodyOverflow <= 0, `${s.bodyOverflow}`);
  await ctx.close();
}

/* --------------------------------------------- reduced motion at 1440 */
console.log("\n=== 1440px + prefers-reduced-motion ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const head = await headingState(p);
  check("heading is visible", head.text === "A look inside" && head.h > 20 && !head.hidden);
  const s = await p.evaluate(() => ({
    spacers: [...document.querySelectorAll(".pin-spacer")].filter((x) => x.querySelector("#gallery")).length,
    overflow: getComputedStyle(document.querySelector(".gallery-strip")).overflowX,
    trackX: Math.round(new DOMMatrix(getComputedStyle(document.querySelector(".gallery-track")).transform).m41),
  }));
  check("no pin-spacer under reduced motion", s.spacers === 0, `${s.spacers}`);
  check("falls back to the native scroller", s.overflow === "auto", s.overflow);
  check("track carries no transform", s.trackX === 0, `x=${s.trackX}`);
  await ctx.close();
}

/* ------------------------------- resize across the 1024px boundary */
console.log("\n=== resize across 1024px, both directions ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);

  const read = async () =>
    p.evaluate(() => ({
      spacers: [...document.querySelectorAll(".pin-spacer")].filter((x) => x.querySelector("#gallery")).length,
      trackX: Math.round(new DOMMatrix(getComputedStyle(document.querySelector(".gallery-track")).transform).m41),
      overflow: getComputedStyle(document.querySelector(".gallery-strip")).overflowX,
    }));

  const start = await read();
  check("start at 1440: one pin-spacer around the gallery", start.spacers === 1, `${start.spacers}`);

  await p.setViewportSize({ width: 900, height: 900 });
  await p.waitForTimeout(1500);
  const down = await read();
  check("down to 900: pin-spacer removed", down.spacers === 0, `${down.spacers}`);
  check("down to 900: no stuck transform", down.trackX === 0, `x=${down.trackX}`);
  check("down to 900: scroller restored", down.overflow === "auto", down.overflow);

  await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForTimeout(1500);
  const up = await read();
  check("back to 1440: exactly one gallery pin-spacer, not two", up.spacers === 1, `${up.spacers}`);

  // And once more, to catch anything that only stacks on the second pass.
  await p.setViewportSize({ width: 900, height: 900 });
  await p.waitForTimeout(1200);
  await p.setViewportSize({ width: 1440, height: 900 });
  await p.waitForTimeout(1500);
  const again = await read();
  check("after a second round trip: still exactly one", again.spacers === 1, `${again.spacers}`);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
