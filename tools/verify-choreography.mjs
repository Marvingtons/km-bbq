/**
 * Verifies the phased window transition.
 *
 *   node tools/verify-choreography.mjs [url]     (default http://localhost:3117/)
 *
 * The two claims this pass has to prove, at every scroll position rather than
 * at the end state:
 *
 *   1. HERO TYPE NEVER CROSSES THE CLIP BOUNDARY. Phase A exits the copy before
 *      the panel moves, so at no scroll position may a glyph straddle the panel
 *      edge. Checked geometrically (does any visible type rect intersect the
 *      clip edge) AND in pixels (is any glyph rendered with footage on one side
 *      and mural on the other).
 *   2. THE PANEL AND ABOUT'S CONTENT NEVER OVERLAP. The panel docks into a
 *      reserved media column; About's heading and body live in their own
 *      columns. Their rects must be disjoint at 40/60/80% and everywhere else
 *      sampled.
 *
 * Everything is sampled across the whole scrub, not just at the rest points the
 * brief names, because a transition that is clean at 40/60/80 and broken at 55
 * is still broken.
 */
import { chromium } from "playwright-core";

const URL = process.argv.find((a) => a.startsWith("http")) || "http://localhost:3117/";
const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const skip = (p) =>
  p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });

/**
 * Panel rect in viewport coords, derived from the live clip-path.
 *
 * The clip is written in PIXELS now — the window is fixed and viewport-sized,
 * and a percentage there would resolve against the scrollbar gutter as well —
 * so both unit systems are handled and converted against the window's own rect,
 * which is the clip's actual reference box.
 */
const PANEL = `(() => {
  const w = document.querySelector(".hero-window");
  if (!w) return null;
  const r = w.getBoundingClientRect();
  const cs = getComputedStyle(w).clipPath;
  const m = cs.match(/inset\\(([^)]*)\\)/);
  if (!m) return { top: r.top, right: r.right, bottom: r.bottom, left: r.left, clip: cs };
  const px = (m[1].match(/-?[\\d.]+px/g) || []).map(parseFloat);
  const pc = (m[1].match(/-?[\\d.]+%/g) || []).map(parseFloat);
  const nums = px.length
    ? px.map((v, i) => (v / (i % 2 ? r.width : r.height)) * 100)
    : pc;
  const [t, ri, b, l] = [nums[0] ?? 0, nums[1] ?? nums[0] ?? 0, nums[2] ?? nums[0] ?? 0, nums[3] ?? nums[1] ?? nums[0] ?? 0];
  return {
    top: r.top + (t / 100) * r.height,
    right: r.right - (ri / 100) * r.width,
    bottom: r.bottom - (b / 100) * r.height,
    left: r.left + (l / 100) * r.width,
    clip: cs,
  };
})()`;

/** Visible hero type rects (ink extents), plus their opacity. */
const TYPE_RECTS = `(() => {
  const out = [];
  const sels = ["#home .eyebrow", "#home h1", "#home p.font-sans.text-copy", "#home .copy", "#home a[href='/menu']"];
  for (const s of sels) {
    const el = document.querySelector(s);
    if (!el) continue;
    // Walk up for any ancestor opacity the exit tween may have set.
    let op = 1, n = el;
    while (n && n !== document.body) { op *= parseFloat(getComputedStyle(n).opacity || "1"); n = n.parentElement; }
    if (op < 0.02) continue;               // faded out: not visible, cannot cross
    /* VISIBLE INK ONLY — sr-only subtrees are excluded.

       A visually-hidden span is clipped to 1px, but it is still LAID OUT, so a
       Range over its contents reports the full untruncated text width. The hero
       h1 now carries sr-only fragments naming the restaurant and the city (its
       display type is one word; its accessible and crawlable text is a
       sentence), and measuring the h1 wholesale reported ~760px of hidden text
       straddling the panel's clip edge — a crossing that nothing visible was
       making.

       So the range is built per text node, skipping anything inside .sr-only.
       This is what "does visible type cross the edge" always meant. */
    const rects = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.nodeValue.trim()) continue;
      if (node.parentElement?.closest(".sr-only")) continue;
      const rg = document.createRange();
      rg.selectNodeContents(node);
      for (const r of rg.getClientRects()) {
        if (r.width > 2 && r.height > 2) rects.push(r);
      }
    }
    const box = rects.length ? rects : [el.getBoundingClientRect()];
    for (const r of box) out.push({ sel: s, op: +op.toFixed(3), top: r.top, right: r.right, bottom: r.bottom, left: r.left });
  }
  return out;
})()`;

/** About's own content rects (heading + body + CTA), when visible.
 *
 *  GLYPH RUNS, via Range — the same technique TYPE_RECTS uses for the hero, and
 *  for the same reason. An element's own getBoundingClientRect() is its BLOCK
 *  box, which spans the full width of its grid column (804px at 1440) however
 *  short the line inside it actually is. Measured that way this reported the
 *  panel "overlapping the heading" by 13,000px² at a scroll position where the
 *  panel's edge was 200px clear of the last glyph — contact with the column's
 *  trailing whitespace, which nobody can see. The hero side was already
 *  measured properly; About was not, because under the old design About's copy
 *  was never visible during the sweep and the difference could not show up. */
const ABOUT_RECTS = `(() => {
  const out = [];
  for (const s of ["#pick-your-fire h2", "#pick-your-fire .copy p", "#pick-your-fire a", ".favorites-head"]) {
    for (const el of document.querySelectorAll(s)) {
      // Effective opacity: the entrance fades the COLUMN, so every child still
      // computes to 1 while the whole block is invisible.
      let op = 1, n = el;
      while (n && n !== document.body) { op *= parseFloat(getComputedStyle(n).opacity || "1"); n = n.parentElement; }
      if (op < 0.02) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const rg = document.createRange();
      rg.selectNodeContents(el);
      const tight = [...rg.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
      // A card or a rule has no text of its own; its box IS its ink.
      const rects = tight.length ? tight : [el.getBoundingClientRect()];
      for (const r of rects) {
        if (r.width < 2 || r.height < 2) continue;
        if (r.bottom < 0 || r.top > window.innerHeight) continue;   // off-screen
        out.push({ sel: s, op: +op.toFixed(3), top: r.top, right: r.right, bottom: r.bottom, left: r.left });
      }
    }
  }
  return out;
})()`;

const overlapArea = (a, b) => {
  const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
  const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
  return w > 0 && h > 0 ? w * h : 0;
};

/** Does a rect straddle the panel's edge (partly in, partly out)? */
const straddles = (r, p, tol = 1.5) => {
  const inside =
    r.left >= p.left - tol && r.right <= p.right + tol &&
    r.top >= p.top - tol && r.bottom <= p.bottom + tol;
  const outside = r.right <= p.left + tol || r.left >= p.right - tol || r.bottom <= p.top + tol || r.top >= p.bottom - tol;
  return !inside && !outside;
};

const browser = await chromium.launch();

// ---- the scrub, sampled densely -------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await skip(page);
  await page.goto(URL);
  await page.waitForLoadState("load");
  await page.waitForTimeout(2400);

  const vh = 900;
  const crossings = [];
  const overlaps = [];
  const samples = [];
  const edgeExists = [];
  const storyOpacity = [];

  // A clip whose four insets are all 0 has no edge inside the viewport.
  //
  // Two traps here, both of which made the first version of this check wrong.
  // The browser NORMALISES `inset(0% 0% 0% 0%)` down to `inset(0%)`, so an
  // `n.length === 4` test never matches the very case it exists to accept. And
  // the `round <r>` suffix carries its own lengths, which must not be counted
  // as insets — the radius ramps to 12px in the first tenth while the frame is
  // still full-bleed, so its corners are the VIEWPORT's corners and there is no
  // edge anywhere near the type.
  // Either unit: the clip is written in pixels now (the window is fixed and
  // viewport-sized, so a percentage would resolve against the scrollbar gutter
  // too). Zero is zero in both, so the only change is which pattern to read.
  const fullBleed = (clip) => {
    const insetPart = clip.split(/\bround\b/)[0];
    const n = (insetPart.match(/-?[\d.]+(?:px|%)/g) || []).map(parseFloat);
    return n.length >= 1 && n.length <= 4 && n.every((v) => Math.abs(v) < 0.5);
  };

  for (let pct = 0; pct <= 100; pct += 5) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((pct / 100) * vh));
    await page.waitForTimeout(650);
    const panel = await page.evaluate(PANEL);
    const type = await page.evaluate(TYPE_RECTS);
    const about = await page.evaluate(ABOUT_RECTS);
    if (!panel) continue;

    for (const t of type) if (straddles(t, panel)) crossings.push({ pct, sel: t.sel, op: t.op });
    for (const a of about) {
      const area = overlapArea(a, panel);
      if (area > 400) overlaps.push({ pct, sel: a.sel, area: Math.round(area), op: a.op });
    }
    // THE STRUCTURAL INVARIANT, stronger than the geometric straddle test: at
    // no scroll position may visible type coexist with a clip edge at all.
    // Phase A empties the frame before Phase B creates an edge, and both ride
    // one playhead, so this holds under any scrub lag or dropped frame. A
    // straddle test alone would pass vacuously the moment the copy happened to
    // sit clear of the edge.
    if (type.length > 0 && !fullBleed(panel.clip))
      edgeExists.push({ pct, n: type.length, clip: panel.clip.slice(0, 34) });

    // WHAT THE WINDOW OPENS ONTO. This used to assert the opposite — that
    // About's copy stayed at opacity 0 for the whole sweep, because the old
    // design revealed the mural and the copy did not arrive until About's own
    // pin ran. The reveal target is the sand story now, so the copy MUST be up
    // by the time the panel docks; what must never happen is the panel's edge
    // sitting on top of it, which `overlaps` above tests glyph by glyph.
    //
    // The copy's entrance therefore fires off the hero's own scroll rather than
    // off its own position — see the note in About.tsx. Triggered the ordinary
    // way it arrived at ~29% of the transition at 1440x900 and ~25% at 768x800,
    // straight under the sweeping edge.
    const story = await page.evaluate(`(() => {
      const el = document.querySelector(".fire-copy");
      if (!el) return 1;
      let op = 1, n = el;
      while (n && n !== document.body) { op *= parseFloat(getComputedStyle(n).opacity || "1"); n = n.parentElement; }
      return op;
    })()`);
    storyOpacity.push({ pct, op: +story.toFixed(3) });

    samples.push({ pct, visibleType: type.length, visibleAbout: about.length, panelW: Math.round(panel.right - panel.left) });
  }

  check(
    "hero type never crosses the panel's clip edge",
    crossings.length === 0,
    crossings.length ? crossings.slice(0, 6).map((c) => `${c.pct}% ${c.sel} (op ${c.op})`).join("; ") : "21 scroll positions sampled"
  );
  check(
    "visible hero type only ever coexists with a full-bleed frame",
    edgeExists.length === 0,
    edgeExists.length
      ? edgeExists.slice(0, 6).map((e) => `${e.pct}% ${e.n} rects, ${e.clip}`).join("; ")
      : "21 positions: type visible only while inset() is 0 on all four edges"
  );
  {
    const up = storyOpacity.filter((s) => s.op > 0.98).map((s) => s.pct);
    const settled = up.length ? Math.min(...up) : null;
    check(
      "the fire copy is fully up by the time the panel docks",
      settled !== null && settled <= 100,
      settled === null ? "never reaches opacity 1" : `opacity 1 from ${settled}% (dock completes at 100%)`
    );
  }
  check(
    "panel never overlaps the section's content",
    overlaps.length === 0,
    overlaps.length ? overlaps.slice(0, 6).map((o) => `${o.pct}% ${o.sel} ${o.area}px²`).join("; ") : "21 scroll positions sampled"
  );

  // Phase A: by 30% the panel must be empty of type.
  const typeAt30 = await (async () => {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round(0.3 * vh));
    await page.waitForTimeout(700);
    const panel = await page.evaluate(PANEL);
    const type = await page.evaluate(TYPE_RECTS);
    return type.filter((t) => overlapArea(t, panel) > 200);
  })();
  check(
    "Phase A: panel is an empty frame by 30%",
    typeAt30.length === 0,
    typeAt30.length ? typeAt30.map((t) => `${t.sel} op ${t.op}`).join("; ") : "no type inside the panel at 30%"
  );

  // The named rest points, called out explicitly.
  for (const pct of [40, 60, 80]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((pct / 100) * vh));
    await page.waitForTimeout(700);
    const panel = await page.evaluate(PANEL);
    const about = await page.evaluate(ABOUT_RECTS);
    const bad = about.filter((a) => overlapArea(a, panel) > 400);
    check(`  ${pct}%: panel clear of About content`, bad.length === 0,
      bad.length ? bad.map((b) => `${b.sel} ${Math.round(overlapArea(b, panel))}px²`).join("; ") : `${about.length} About elements visible, all clear`);
  }

  // THE DOCKED CLIP *IS* THE CELL. This is the one check that catches a wrong
  // denominator (innerWidth vs the clip's own reference box), a stale
  // measurement, or a scrollbar-gutter error — none of which the static grid
  // check can see, because they all leave the grid perfectly correct and only
  // the panel wrong.
  //
  // MEASURED AT THE DOCK FRAME AND IN THE WINDOW'S OWN FRAME OF REFERENCE, and
  // both halves of that are corrections.
  //
  // This used to sample at `scrollTo(0, vh)` and compare two live viewport
  // rects, which was right when the transition cost a full viewport and has
  // been wrong since HERO_SCRUB became 0.6: the stage releases at 0.6vh and
  // then scrolls away with the page, so by 1.0vh the panel is 0.4vh above
  // wherever the cell is and the check reported a 400px "error" in a
  // transition that was working. It failed for months without meaning
  // anything.
  //
  // What is actually load-bearing is that the panel and the cell agree on
  // SIZE, on LEFT, and on the cell's RESTING top — the cell is sticky now, so
  // its resting offset is a constant (its own `top`) rather than whatever the
  // scroll position makes of it. That is precisely the contract SeamMotion's
  // dock() computes, so this is the check that can catch it being wrong.
  // ONE VIEWPORT. The clip runs from the top of the page until Pick Your
  // reaches the top of the viewport, because that is the frame the sticky
  // media column parks on, and the dock and the park have to be the same event.
  // It was 0.6vh (HERO_SCRUB) when the hero's own held scroll bounded the clip;
  // it does not any more — the media outlives the hero stage.
  const dockAt = await page.evaluate(
    () => document.getElementById("pick-your-fire").getBoundingClientRect().top + window.scrollY
  );
  await page.evaluate((y) => window.scrollTo(0, y), dockAt);
  await page.waitForTimeout(1000);
  const docked = await page.evaluate(PANEL);
  // The cell's RESTING viewport top, derived the same way SeamMotion derives
  // it: the nearest sticky ancestor's resolved \`top\`, plus how far the cell
  // sits inside that ancestor. Both terms are scroll-invariant. Reading the
  // cell's live \`r.top\` instead would measure wherever the reader happens to
  // be, which is a 360px "error" in a dock that is exact.
  const cell = await page.evaluate(`(() => {
    const el = document.querySelector("#pick-your-fire .col-media");
    const w = document.querySelector(".hero-window");
    if (!el || !w) return null;
    const r = el.getBoundingClientRect();
    let s = el;
    while (s && getComputedStyle(s).position !== "sticky") s = s.parentElement;
    return {
      width: r.width, height: r.height, left: r.left, right: r.right,
      restTop: s
        ? (parseFloat(getComputedStyle(s).top) || 0) + (r.top - s.getBoundingClientRect().top)
        : r.top,
      winTop: w.getBoundingClientRect().top,
    };
  })()`);
  const edgeDelta = cell && docked
    ? Math.max(
        Math.abs((docked.right - docked.left) - cell.width),
        Math.abs((docked.bottom - docked.top) - cell.height),
        Math.abs(docked.left - cell.left),
        Math.abs((docked.top - cell.winTop) - cell.restTop)
      )
    : Infinity;
  check(
    "docked panel IS the media cell it hands over to",
    edgeDelta < 1.5,
    cell ? `max delta ${edgeDelta.toFixed(2)}px (w/h/left/rest-top)` : "no .col-media"
  );

  // Reversibility: land on the same clip after going away and back.
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(0.5 * vh));
  await page.waitForTimeout(800);
  const mid1 = (await page.evaluate(PANEL)).clip;
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(0.95 * vh));
  await page.waitForTimeout(800);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(0.5 * vh));
  await page.waitForTimeout(900);
  const mid2 = (await page.evaluate(PANEL)).clip;
  const num = (s) => (s.match(/[\d.]+/g) || []).map(Number);
  const a = num(mid1), b = num(mid2);
  const maxDelta = a.length === b.length ? Math.max(...a.map((v, i) => Math.abs(v - b[i]))) : Infinity;
  check("scrub is reversible mid-gesture", maxDelta < 0.8, `max stop delta ${maxDelta.toFixed(2)}`);

  // Radius constant through the scrub.
  const radii = [];
  for (const pct of [20, 40, 60, 80, 100]) {
    await page.evaluate((y) => window.scrollTo(0, y), Math.round((pct / 100) * vh));
    await page.waitForTimeout(600);
    const c = (await page.evaluate(PANEL)).clip;
    const m = c.match(/round\s+([\d.]+px)/);
    radii.push(m ? m[1] : "none");
  }
  check("panel radius constant across the scrub", new Set(radii).size === 1, radii.join(" "));

  await ctx.close();
}

// ---- reduced motion: docked end state, no animation -----------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await skip(page);
  await page.goto(URL);
  await page.waitForLoadState("load");
  await page.waitForTimeout(1800);

  const before = await page.evaluate(PANEL);
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(800);
  const after = await page.evaluate(PANEL);
  check(
    "reduced motion: nothing animates the panel",
    before && after && before.clip === after.clip,
    `${(after && after.clip ? after.clip : "?").slice(0, 42)}`
  );

  const about = await page.evaluate(ABOUT_RECTS);
  const panel = after;
  const bad = about.filter((a) => overlapArea(a, panel) > 400);
  check("reduced motion: docked panel clear of section content", bad.length === 0,
    bad.length ? bad.map((b) => b.sel).join("; ") : `${about.length} About elements visible, all clear`);
  await ctx.close();
}

/* ---- mobile: THE SCRUB RUNS HERE TOO ---------------------------------------
   Inverted. This block asserted "375px: no scrub" and "375px: no video
   element", which described the old mobile path: the footage stayed in the hero
   and a separate one-shot assembled the illustration further down. The morph is
   width-independent now — only `prefers-reduced-motion` opts out — so a phone
   that does NOT scrub is the bug, and the one video element is the feature. */
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await skip(page);
  await page.goto(URL);
  await page.waitForLoadState("load");
  await page.waitForTimeout(1800);
  const before = await page.evaluate(PANEL);
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(800);
  const after = await page.evaluate(PANEL);
  check("375px: the clip scrubs", before && after && before.clip !== after.clip, `${(before?.clip ?? "?").slice(0, 26)} -> ${(after?.clip ?? "?").slice(0, 26)}`);
  const videos = await page.evaluate(() => document.querySelectorAll("video").length);
  check("375px: exactly one video element", videos === 1, `${videos} elements`);
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
