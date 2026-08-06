/**
 * verify-assembly.mjs — the one video, the match cut, and the fire.
 *
 *   node tools/verify-assembly.mjs [url]     (default http://localhost:3111/)
 *
 * The section PINS and the grill ASSEMBLES inside the pin. What this file
 * guards is that sequence end to end, and the things about it that fail
 * invisibly:
 *
 *   1. THE ELEMENT COUNT. A second <video> "just for About" is the obvious
 *      implementation and it is wrong: two boxes of the same footage at
 *      different crops appear on screen together during the hand-over, which is
 *      the opposite of a match cut. Asserted at every scroll position, not once.
 *   2. THE MATCH. The chassis is drawn 138 x 139.7 in a 150-unit viewBox and
 *      sits above centre, so an illustration that "obviously fills its box" is
 *      7% too small and a couple of percent high, and the circle slides off it
 *      as it dissolves. Concentricity and diameter are measured, at the cut.
 *
 * Plus the two containment rules that have each broken once: nothing red or
 * orange renders before ignition, and no part of the illustration is ever
 * painted outside the shape the footage occupies.
 *
 * DRIVES REAL SCROLL, not the timeline API. GSAP is bundled as a module and is
 * not on `window`, so there is no handle to poke — and that is the better test
 * anyway: it exercises the ScrollTrigger, the scrub lag and the ember hand-off
 * exactly as a reader's wheel does.
 *
 * Scroll positions come from the trigger's own definition: the pin starts at
 * the section's `top top` and runs PIN_VH viewports, so progress p is
 * sectionTop + p * PIN_VH * vh.
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

/** Everything the state of this section can be read from, off computed style. */
function readState() {
  const svg = document.querySelector(".dual-grill");
  if (!svg) return null;
  const o = (sel) => { const e = svg.querySelector(sel); return e ? +getComputedStyle(e).opacity : null; };
  const many = (sel) => [...svg.querySelectorAll(sel)].map((e) => +getComputedStyle(e).opacity);
  const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);

  // Is anything the stylesheet paints red or orange actually being painted?
  const isHot = (c) => { const m = /rgba?\(([^)]+)\)/.exec(c || ""); if (!m) return false;
    const [r, g, b] = m[1].split(",").map(Number);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx < 90 || (mx - mn) / mx < 0.45 || r !== mx) return false;
    const hue = ((g - b) / (mx - mn)) * 60; return hue >= -10 && hue <= 55; };
  const effAlpha = (el) => { let a = 1, n = el;
    while (n && n !== document.documentElement) { const cs = getComputedStyle(n);
      if (cs.visibility === "hidden" || cs.display === "none") return 0;
      a *= +cs.opacity; n = n.parentElement; }
    return a; };
  const hotEls = [...svg.querySelectorAll("*")].filter((el) => {
    const cs = getComputedStyle(el);
    return isHot(cs.fill) || (cs.stroke !== "none" && isHot(cs.stroke));
  });

  const frame = document.querySelector(".media-frame");
  const win = document.querySelector(".hero-window");
  const plate = document.querySelector(".media-plate");
  const insets = (el) => {
    if (!el) return null;
    const c = getComputedStyle(el).clipPath;
    const m = /inset\(([^)]*)\)/.exec(c);
    if (!m) return null;
    const n = (m[1].match(/-?[\d.]+px/g) || []).map(parseFloat);
    const r = /round\s+([\d.]+)px/.exec(c);
    return { n, radius: r ? +r[1] : 0, raw: c };
  };

  return {
    // Every group is complete, always. Nothing here should ever move.
    chassis: o("#chassis"), gasSurface: o("#gas-surface"),
    slots: avg(many("#gas-surface .dial")), bowl: o("#charcoal-ground"),
    coals: avg(many("#coals > *:not(.ember):not(.ember-deep)")), grate: o("#grate"),
    meshDash: (() => { const e = svg.querySelector("#grate > *"); return e ? parseFloat(getComputedStyle(e).strokeDashoffset) || 0 : null; })(),
    dividerDash: (() => { const e = svg.querySelector(".divider"); return e ? parseFloat(getComputedStyle(e).strokeDashoffset) || 0 : null; })(),
    embers: many("#coals .ember, #coals .ember-deep"),
    emberAvg: avg(many("#coals .ember, #coals .ember-deep")),

    hotCount: hotEls.length,
    hotLit: hotEls.length ? Math.max(...hotEls.map(effAlpha)) : 0,

    videos: document.querySelectorAll("video").length,
    video: (() => { const v = document.querySelector("video"); return v ? (v.paused ? "paused" : "playing") : "none"; })(),
    plate: plate ? +(+getComputedStyle(plate).opacity).toFixed(3) : null,
    // The frame must stay square for the end of the morph to be a circle.
    frameSquare: (() => { if (!frame) return null; const r = frame.getBoundingClientRect();
      return Math.abs(r.width - r.height) <= 1 ? Math.round(r.width) : `${Math.round(r.width)}x${Math.round(r.height)}`; })(),
    winClip: insets(win),
    frameClip: insets(frame),
  };
}

/**
 * The circle and the chassis rim, as boxes. `getBoundingClientRect` on an SVG
 * path does NOT include the stroke, and the rim's stroke is a real 1.2 units of
 * visible edge, so it is added back before comparing diameters.
 */
function readMatch() {
  const win = document.querySelector(".hero-window");
  const rim = document.querySelector(".dual-grill .rim");
  const svg = document.querySelector(".dual-grill");
  if (!win || !rim || !svg) return null;
  const w = win.getBoundingClientRect();
  const m = /inset\(([^)]*)\)/.exec(getComputedStyle(win).clipPath);
  if (!m) return null;
  const n = (m[1].match(/-?[\d.]+px/g) || []).map(parseFloat);
  const [t, ri, b, l] = [n[0] ?? 0, n[1] ?? n[0] ?? 0, n[2] ?? n[0] ?? 0, n[3] ?? n[1] ?? n[0] ?? 0];
  const p = { top: w.top + t, right: w.right - ri, bottom: w.bottom - b, left: w.left + l };
  const r = rim.getBoundingClientRect();
  const pxPerUnit = svg.getBoundingClientRect().width / 150;
  const stroke = (parseFloat(getComputedStyle(rim).strokeWidth) || 0) * pxPerUnit;
  return {
    dcx: Math.abs((p.left + p.right) / 2 - (r.left + r.width / 2)),
    dcy: Math.abs((p.top + p.bottom) / 2 - (r.top + r.height / 2)),
    dw: Math.abs(p.right - p.left - (r.width + stroke)),
    dh: Math.abs(p.bottom - p.top - (r.height + stroke)),
    panelW: +(p.right - p.left).toFixed(1),
    rimW: +(r.width + stroke).toFixed(1),
    rimH: +(r.height + stroke).toFixed(1),
  };
}

/** PIN_VH in MediaStage.tsx. Asserted against the real pin-spacer below. */
const PIN_VH = 0.7;

/**
 * The pin's scroll range.
 *
 * `0.7` is written literally rather than read from PIN_VH above because this
 * function is stringified and evaluated INSIDE the page — a Node-side const is
 * not in scope there, and the failure is a ReferenceError from a stack that
 * points at the browser. The spacer assertion is what keeps the two honest: if
 * they ever disagree, "held scroll is capped at PIN_VH" fails first.
 */
function scrollBounds() {
  const fire = document.getElementById("pick-your-fire");
  // THE SPACER'S OFFSET, NOT THE SECTION'S. Once the pin engages, the section's
  // own rect is a VIEWPORT position — it reads 0 for the whole hold — so
  // deriving the start from it gives back wherever the reader already is, and
  // every subsequent goto() lands somewhere further down than the last. The
  // spacer stays in normal flow and is the only stable handle on where the pin
  // actually begins.
  const box = fire.parentElement.classList.contains("pin-spacer")
    ? fire.parentElement
    : fire;
  const top = box.getBoundingClientRect().top + window.scrollY;
  return { startY: top, endY: top + 0.7 * window.innerHeight };
}

const browser = await chromium.launch();
const seed = (p) => p.addInitScript(() => { try { sessionStorage.setItem("km-preloader-shown", "1"); } catch {} });

console.log("\n=== DESKTOP 1440 — ONE VIDEO, THE MORPH, THE CUT, THE FIRE ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 140)));
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);

  const goto = async (progress, settle = 1000) => {
    await p.evaluate(
      ([pr, boundsFn]) => {
        const { startY, endY } = new Function("return " + boundsFn)()();
        window.scrollTo(0, Math.round(startY + pr * (endY - startY)));
      },
      [progress, scrollBounds.toString()]
    );
    await p.waitForTimeout(settle);
  };
  const at = async (progress, settle) => { await goto(progress, settle); return p.evaluate(readState); };

  console.log("\n  --- the pin ---");
  {
    const pin = await p.evaluate(() => {
      const fire = document.getElementById("pick-your-fire");
      const spacer = fire.parentElement;
      return {
        wrapped: spacer.classList.contains("pin-spacer"),
        spacerH: Math.round(spacer.getBoundingClientRect().height),
        sectionH: Math.round(fire.getBoundingClientRect().height),
        vh: window.innerHeight,
      };
    });
    check("the section is wrapped in a pin-spacer", pin.wrapped);
    check(
      "the section is exactly one viewport (anything taller is off screen while held)",
      Math.abs(pin.sectionH - pin.vh) <= 2,
      `${pin.sectionH} vs ${pin.vh}`
    );
    check(
      "held scroll is capped at PIN_VH — the spacer is the section plus the pin and no more",
      Math.abs(pin.spacerH - (pin.sectionH + PIN_VH * pin.vh)) <= 4,
      `spacer ${pin.spacerH} = section ${pin.sectionH} + ${Math.round(PIN_VH * pin.vh)} held`
    );
  }

  // NOTHING MOVES WHILE IT IS HELD. That is the entire reason for the pin: the
  // composed view used to scroll apart while the animation it belonged to was
  // still running.
  {
    const seen = [];
    for (let pr = 0; pr <= 1; pr += 0.1) {
      await goto(+pr.toFixed(2), 420);
      seen.push(await p.evaluate(() => ({
        section: Math.round(document.getElementById("pick-your-fire").getBoundingClientRect().top),
        // `.fire-head` — the eyebrow and heading. This was `.fire-copy`, one
        // block holding the heading AND the body; the mobile morph split it so
        // the pin could hold the heading while the paragraphs stay below the
        // fold and arrive after the release. The heading is the part that must
        // not drift, at both breakpoints, and it is the part on screen here.
        copy: Math.round(document.querySelector(".fire-head").getBoundingClientRect().top),
      })));
    }
    const sectionDrift = Math.max(...seen.map((s) => Math.abs(s.section)));
    const copyDrift = Math.max(...seen.map((s) => Math.abs(s.copy - seen[0].copy)));
    check("the section holds at the top of the screen for the whole pin", sectionDrift <= 2, `max drift ${sectionDrift}px over 11 samples`);
    check("and the copy never moves with it", copyDrift <= 2, `max drift ${copyDrift}px`);
  }

  /* ---------- 1. ONE VIDEO, EVERYWHERE -------------------------------- */
  console.log("\n  --- one <video>, at every scroll position ---");
  {
    const doc = await p.evaluate(() => document.documentElement.scrollHeight);
    const vh = await p.evaluate(() => window.innerHeight);
    const seen = [];
    for (let y = 0; y <= doc - vh; y += Math.round(vh / 3)) {
      await p.evaluate((t) => window.scrollTo(0, t), y);
      await p.waitForTimeout(140);
      seen.push(await p.evaluate(() => document.querySelectorAll("video").length));
    }
    const bad = seen.filter((n) => n !== 1).length;
    check(
      "exactly one <video> on the page at every scroll position",
      bad === 0,
      `${seen.length} positions sampled, counts ${[...new Set(seen)].join("/")}`
    );
    check(
      "and it is the hero's own element, not a copy in About",
      (await p.evaluate(() => {
        const v = document.querySelector("video");
        return !!v && !!v.closest("#home") && !document.querySelector("#about video");
      })) === true
    );
  }

  /* ---------- 2. THE CHAIN -------------------------------------------- */
  console.log("\n  --- the panel the hero hands over ---");
  const s0 = await at(0.0);
  check("0.00 the frame is SQUARE (a squircle cannot be concentric with a round rim)", typeof s0.frameSquare === "number", `${s0.frameSquare}`);
  check("0.00 the panel arrives RECTANGULAR — wider than tall, small radius", s0.winClip && s0.winClip.n[0] > s0.winClip.n[1] && s0.winClip.radius < 20, `${s0.winClip?.raw}`);
  check("0.00 the clip is playing", s0.video === "playing", s0.video);
  check("0.00 only the CHASSIS exists — every other group is waiting", s0.chassis > 0.98 && [s0.gasSurface, s0.slots, s0.bowl, s0.coals, s0.grate].every((v) => v < 0.02), JSON.stringify({ chassis: s0.chassis, gas: s0.gasSurface, slots: s0.slots, bowl: s0.bowl, coals: s0.coals, grate: s0.grate }));

  console.log("\n  --- circle morph (0.00-0.14) ---");
  const s09 = await at(0.07);
  check("0.07 opening out and rounding down", s09.winClip.radius > s0.winClip.radius && s09.winClip.n[0] < s0.winClip.n[0], `radius ${s0.winClip.radius} -> ${s09.winClip.radius}, top inset ${s0.winClip.n[0].toFixed(0)} -> ${s09.winClip.n[0].toFixed(0)}`);
  check("0.07 the footage is still whole", s09.plate > 0.9, `plate ${s09.plate}`);

  console.log("\n  --- phase C: THE MATCH CUT (0.14-0.20) ---");
  await goto(0.17, 1300);
  const m = await p.evaluate(readMatch);
  const sCut = await p.evaluate(readState);
  check("0.17 the footage is mid-dissolve", sCut.plate > 0.02 && sCut.plate < 0.98, `plate ${sCut.plate}`);
  check("0.17 it is a TRUE circle while it dissolves", sCut.winClip.radius > (m.panelW / 2) - 1, `radius ${sCut.winClip.radius} of a ${m.panelW}px panel`);
  check("0.17 CONCENTRIC: the circle and the chassis rim share a centre", m.dcx <= 1.5 && m.dcy <= 1.5, `dx ${m.dcx.toFixed(2)}px, dy ${m.dcy.toFixed(2)}px`);
  check("0.17 MATCHED: rim diameter is the circle's, within a few px", m.dw <= 6 && m.dh <= 6, `circle ${m.panelW}px vs rim ${m.rimW} x ${m.rimH} (dw ${m.dw.toFixed(2)}, dh ${m.dh.toFixed(2)})`);

  /* THE ASSEMBLY, BEAT BY BEAT — and every sample below moved when the build
     was compressed into 0.20-0.68 of a 0.7-viewport pin. The positions are not
     arbitrary: each is the middle of the beat it names, so a phase that slips
     by a boundary's worth fails here rather than merely looking different. */
  console.log("\n  --- the assembly, beat by beat (0.20-0.68) ---");
  const s26 = await at(0.2, 1300);
  check("0.20 the cut is done and the pan is BARE", s26.plate < 0.02 && s26.chassis > 0.98 && [s26.gasSurface, s26.bowl, s26.coals, s26.grate].every((v) => v < 0.05), JSON.stringify({ plate: s26.plate, gas: s26.gasSurface, bowl: s26.bowl, coals: s26.coals, grate: s26.grate }));


  const s34 = await at(0.28);
  check("0.28 the footage has stopped decoding behind the illustration", s34.video === "paused", s34.video);
  check("0.28 burner plate in, dial mid-sweep, nothing on the charcoal side", s34.gasSurface > 0.9 && s34.slots > 0 && s34.slots < 1 && s34.coals < 0.05, `gas ${s34.gasSurface}, slots ${s34.slots}, coals ${s34.coals}`);

  const s50 = await at(0.38);
  check("0.38 dial finished, bowl in, coals pouring", s50.slots > 0.95 && s50.bowl > 0.9 && s50.coals > 0 && s50.coals < 1, `slots ${s50.slots}, bowl ${s50.bowl}, coals ${s50.coals}`);
  check("0.38 the grate has not started — it lands ON the coals, not with them", s50.grate < 0.05, `grate ${s50.grate}`);

  const s68 = await at(0.48);
  check("0.48 FEATURED BEAT: the grate descending over settled coals", s68.grate > 0.1 && s68.grate < 0.95 && s68.coals > 0.95, `grate ${s68.grate}, coals ${s68.coals}`);

  const s82 = await at(0.57);
  check("0.57 grate landed, the seam drawing", s82.grate > 0.98 && s82.dividerDash > 0.5 && s82.dividerDash < 117, `grate ${s82.grate}, dividerDash ${s82.dividerDash}`);

  /* THE REST BEAT, AND IT IS THE POINT OF THE WHOLE RETIMING. Sampled at 0.70
     — the first pixel past ignition — and again at 1.00, and the two have to
     agree: everything is built, the fire is lit, and the last third of the pin
     is a composed view rather than a sequence still finishing. */
  const s70 = await at(0.7, 1500);
  check("0.70 ASSEMBLED BY MID-PIN: nothing is still arriving beside the copy", [s70.chassis, s70.gasSurface, s70.slots, s70.bowl, s70.coals, s70.grate].every((v) => v > 0.98) && s70.meshDash < 0.5 && s70.dividerDash < 0.5, JSON.stringify({ gas: s70.gasSurface, slots: s70.slots, bowl: s70.bowl, coals: s70.coals, grate: s70.grate, mesh: s70.meshDash, seam: s70.dividerDash }));
  check("0.70 and it is already lit", s70.embers.every((o) => o >= 0.6), s70.embers.map((n) => n.toFixed(2)).join(","));

  const s100 = await at(1.0, 1500);
  check("assembled and lit: every group at full opacity", [s100.chassis, s100.gasSurface, s100.slots, s100.bowl, s100.coals, s100.grate].every((v) => v > 0.98));
  check("mesh and seam fully drawn", s100.meshDash < 0.5 && s100.dividerDash < 0.5, `mesh ${s100.meshDash}, seam ${s100.dividerDash}`);
  check("the fire is on the idle loop", s100.embers.every((o) => o >= 0.6), s100.embers.map((n) => n.toFixed(2)).join(","));

  /* ---------- 3. NOTHING IS LIT, AND NOTHING SPILLS ------------------- */
  console.log("\n  --- containment, swept ---");
  // Swept to just under ignition, which is now 0.60 rather than 0.88.
  let firstLit = null, spill = null, hotSeen = 0;
  for (let pr = 0; pr <= 0.56; pr += 0.02) {
    const s = await at(+pr.toFixed(2), 620);
    hotSeen = Math.max(hotSeen, s.hotCount);
    if (s.hotLit > 0.01 && firstLit === null) firstLit = { pr: +pr.toFixed(2), a: s.hotLit };
    // The illustration may only be painted where the footage is. The frame's
    // own clip is the panel converted into its coordinates; if the panel does
    // not reach the frame the insets exceed its box and nothing is drawn.
    if (!s.frameClip && spill === null) spill = { pr: +pr.toFixed(2), why: "frame has no clip" };
  }
  check(
    "every red/orange shape in the artwork stays dark right up to ignition",
    firstLit === null,
    firstLit ? `lit at progress ${firstLit.pr} (alpha ${firstLit.a})` : `swept 0.00-0.56, ${hotSeen} hot shapes, none rendered`
  );
  check(
    "the illustration is co-clipped to the footage at every position before the cut",
    spill === null,
    spill ? `${spill.pr}: ${spill.why}` : "frame carries the panel's shape throughout"
  );

  console.log("\n  --- the whole thing in reverse ---");
  const back = await at(0.0, 1600);
  check("scrubbing back puts the fire OUT — not back to the loop's 0.65 floor", back.hotLit < 0.01, `max alpha ${back.hotLit}`);
  check("and the footage comes back as a rounded rect, playing", back.plate > 0.98 && back.winClip.n[0] > back.winClip.n[1] && back.video === "playing", `plate ${back.plate}, ${back.video}`);
  check("and the illustration is back to a bare pan", back.chassis > 0.98 && [back.gasSurface, back.slots, back.bowl, back.coals, back.grate].every((v) => v < 0.05), JSON.stringify({ chassis: back.chassis, gas: back.gasSurface, slots: back.slots, bowl: back.bowl, coals: back.coals, grate: back.grate }));

  // Straddling LOOP_OFF (0.62) and LOOP_ON (0.68) in MediaStage.tsx — the band
  // the hand-off's hysteresis exists to survive. Moved with the gates.
  console.log("\n  --- ember hand-off, scrubbed fast across the boundary ---");
  for (const pr of [0.63, 1.0, 0.65, 1.0, 0.58, 1.0, 0.67, 1.0, 0.61, 1.0]) await at(pr, 220);
  const lit = await at(1.0, 1600);
  check("past the boundary the loop runs (embers between the floor and 1)", lit.embers.every((o) => o >= 0.6 && o <= 1.001), lit.embers.map((n) => n.toFixed(2)).join(","));
  const dropped = await at(0.2, 1400);
  check("scrubbed back below the release, no ember is left lit", dropped.embers.every((o) => o < 0.05), dropped.embers.map((n) => n.toFixed(2)).join(","));

  console.log("\n  --- fast scroll past ---");
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(1800);
  check(
    "after a fast scroll to the bottom, the media layer has left with the section",
    (await p.evaluate(() => {
      const w = document.querySelector(".hero-window").getBoundingClientRect();
      const cs = getComputedStyle(document.querySelector(".hero-window"));
      return w.bottom < 0 || cs.visibility === "hidden" || +cs.opacity < 0.02;
    })) === true,
    "fixed layer follows the frame out"
  );
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(1600);
  const afterTop = await p.evaluate(readState);
  check("and back at the top the ember loop is NOT still running", afterTop.embers.every((o) => o < 0.05), afterTop.embers.map((n) => n.toFixed(2)).join(","));
  check("and the video is playing again", afterTop.video === "playing", afterTop.video);

  check("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  await ctx.close();
}

console.log("\n=== THE CHOREOGRAPHY IS DEFINED ONCE ===");
{
  const lib = fs.readFileSync(new URL("../src/lib/assembly.ts", import.meta.url), "utf8");
  // The three orderings are the part that must not diverge between the scrubbed
  // path and the one-shot: a coal that tumbles with a different rotation in the
  // two is the same artwork behaving like two.
  for (const k of ["slotsCW", "coalsShuffled", "meshOrdered", "spinOf"]) {
    check(`lib/assembly.ts owns ${k}`, lib.includes(k));
  }
  /* ONE CONSUMER NOW, NOT TWO — and that is the mobile-morph pass landing.
     This required BOTH MediaStage and PickYourFire to import the choreography,
     because they each built it: MediaStage scrubbed it above 1024 and
     PickYourFire played it as a one-shot below. Two builders of one sequence is
     exactly the split that let mobile drift into a different feature, so the
     one-shot is gone and MediaStage owns the sequence at every width.

     What the check is actually for survives intact: nobody may RESTATE the
     choreography. So MediaStage must import it, and neither file may reach for
     the ordering primitives directly. */
  {
    const stage = fs.readFileSync(new URL("../src/components/MediaStage.tsx", import.meta.url), "utf8");
    check("MediaStage.tsx: imports the assembly rather than restating it",
      stage.includes('from "@/lib/assembly"') && !stage.includes("gsap.utils.shuffle"));
  }
  {
    const fire = fs.readFileSync(new URL("../src/components/PickYourFire.tsx", import.meta.url), "utf8");
    check("PickYourFire.tsx: no longer builds a second copy of the sequence",
      !fire.includes("buildAssembly") && !fire.includes("gsap.utils.shuffle"));
  }
}

/* =============================================================================
   MOBILE 375 — THE SAME MORPH, SCRUBBED AND PINNED.

   THIS BLOCK USED TO ASSERT THE OPPOSITE, and it is the reason the mobile morph
   was reported as "specced but never shipped": it locked in the fallback.
   Every check here read the other way — "no video in the section", "a one-shot,
   not a scrub", "nothing on this page is pinned", "the morph is desktop-only
   and so is its cost" — so the split path was not an oversight, it was a
   contract with a test behind it.

   The morph is width-independent now. Only `prefers-reduced-motion` opts out
   (asserted in its own block below), and the same single <video> is the hero's
   backdrop and the thing that becomes the grill at every width. So a phone that
   plays a one-shot, or has no pin, or holds a second piece of media, is the
   regression — which is what these now say.
   ============================================================================= */
console.log("\n=== MOBILE 375 — THE SAME MORPH, SCRUBBED AND PINNED ===");
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);

  // ONE VIDEO ON THE PAGE, AND IT IS THE HERO'S. The section still renders no
  // <video> of its own — the footage reaches it as a fixed layer clipped into
  // the frame, which is the whole single-element contract.
  check(
    "375: exactly one <video> on the page",
    (await p.evaluate(() => document.querySelectorAll("video").length)) === 1
  );
  check(
    "375: none of it is a second element in the section, and no stand-in still",
    (await p.evaluate(() => document.querySelectorAll("#pick-your-fire video").length === 0 && !document.querySelector(".fire-still"))) === true
  );

  const before375 = await p.evaluate(readState);
  check("375: the art starts unbuilt (JS-set initial states, never CSS)", before375.gasSurface < 0.05 && before375.chassis > 0.98, `gas ${before375.gasSurface}, chassis ${before375.chassis}`);

  // THE SECTION PINS. Scoped to this section's own spacer: the gallery
  // legitimately has one too at some widths.
  const spacerTop = await p.evaluate(() => {
    const sp = [...document.querySelectorAll(".pin-spacer")].find((s) => s.contains(document.querySelector("#pick-your-fire")));
    return sp ? Math.round(sp.getBoundingClientRect().top + window.scrollY) : null;
  });
  check("375: the section is pinned", spacerTop !== null, spacerTop === null ? "no pin-spacer around #pick-your-fire" : `spacer at ${spacerTop}`);

  if (spacerTop !== null) {
    // SCRUBBED, NOT PLAYED. Drive scroll to a progress and read the state; a
    // one-shot would run to completion on its own regardless of where we stop.
    const at = async (prog) => {
      await p.evaluate(([t]) => window.scrollTo({ top: t, behavior: "instant" }), [spacerTop + prog * 0.7 * 812]);
      await p.waitForTimeout(700);
      return p.evaluate(readState);
    };
    const early = await at(0.05);
    const mid = await at(0.45);
    const done = await at(0.95);

    check("375: it is a SCRUB — early in the pin the grill is still unbuilt", early.gasSurface < 0.5, `gas ${early.gasSurface.toFixed(2)}`);
    check("375: it advances with scroll", mid.gasSurface > early.gasSurface, `${early.gasSurface.toFixed(2)} -> ${mid.gasSurface.toFixed(2)}`);
    check("375: fully assembled by the end of the pin", [done.chassis, done.gasSurface, done.slots, done.bowl, done.coals, done.grate].every((v) => v > 0.98));
    check("375: lit by the end of the pin", done.embers.every((o) => o >= 0.6), done.embers.map((n) => n.toFixed(2)).join(","));

    // REVERSIBLE. Scrolling back up de-assembles, which a one-shot cannot do.
    const back = await at(0.05);
    check("375: reverse scroll de-assembles it", back.gasSurface < 0.5, `gas back to ${back.gasSurface.toFixed(2)}`);
  }

  check(
    "375: reading order is heading, illustration, then the copy the unpin reveals",
    (await p.evaluate(() => {
      const y = (s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY;
      return y(".fire-head") < y(".grill-layer") && y(".grill-layer") < y(".fire-body");
    })) === true
  );
  await ctx.close();
}

console.log("\n=== REDUCED MOTION — NOTHING IS BUILT ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2000);
  const s = await p.evaluate(readState);
  check("reduced motion: complete and lit from first paint", [s.chassis, s.gasSurface, s.slots, s.bowl, s.coals, s.grate].every((v) => v > 0.99));
  check("reduced motion: nothing was dash-prepped", s.meshDash === 0 && s.dividerDash === 0, `mesh ${s.meshDash}, seam ${s.dividerDash}`);
  check("reduced motion: nothing is pinned", (await p.evaluate(() => !document.getElementById("pick-your-fire").parentElement.classList.contains("pin-spacer"))) === true);
  check("reduced motion: embers static at FULL opacity", s.embers.every((o) => o === 1), s.embers.join(","));
  check("reduced motion: no clip is ever written", !s.winClip && !s.frameClip);
  /* THE VIDEO STILL MOUNTS UNDER REDUCED MOTION, and the four checks above are
     what actually carry that preference: nothing pinned, no clip written,
     nothing dash-prepped, embers static. Those are the scroll-driven effects.

     Unmounting the element was a side effect of gating the FETCH on the
     preference, and it stopped being defensible once the same element became
     the subject of the morph rather than a decorative layer beneath it. A
     muted, looping background is not what `prefers-reduced-motion` is about;
     a page that scrubs and pins under the reader is, and none of that runs. */
  check("reduced motion: the video still mounts, exactly one", s.videos === 1, `${s.videos}`);
  check(
    "reduced motion: the media layer does not stick to the viewport",
    (await p.evaluate(() => getComputedStyle(document.querySelector(".hero-window")).position !== "fixed")) === true
  );
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
  // Nothing will ever clip the media layer, so a sticky column would park an
  // illustration in a viewport that never releases it.
  check("no JS: the <noscript> drops the desktop layout back to the stack", /<noscript>[\s\S]*?display:\s*contents[\s\S]*?<\/noscript>/.test(html));
}

console.log("\n=== RESIZE ACROSS 1024px, BOTH DIRECTIONS ===");
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await seed(p);
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);
  const spacers = () => p.evaluate(() => document.querySelectorAll(".pin-spacer").length);
  const before = await spacers();
  for (let i = 0; i < 2; i++) {
    await p.setViewportSize({ width: 900, height: 900 });
    await p.waitForTimeout(1300);
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.waitForTimeout(1300);
  }
  check("pin-spacer count is stable across two round trips", (await spacers()) === before, `${before} -> ${await spacers()}`);
  check("and there are exactly two — this section and the gallery", before === 2, `${before}`);
  check("and still exactly one <video>", (await p.evaluate(() => document.querySelectorAll("video").length)) === 1);

  await p.evaluate((boundsFn) => {
    const { endY } = new Function("return " + boundsFn)()();
    window.scrollTo(0, Math.round(endY));
  }, scrollBounds.toString());
  await p.waitForTimeout(1700);
  const m2 = await p.evaluate(readMatch);
  check("after two round trips: the chassis still fits the circle", m2.dcx <= 1.5 && m2.dcy <= 1.5 && m2.dw <= 6 && m2.dh <= 6, `dx ${m2.dcx.toFixed(2)}, dy ${m2.dcy.toFixed(2)}, dw ${m2.dw.toFixed(2)}, dh ${m2.dh.toFixed(2)}`);
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${failures.length} failed`);
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => console.log("  - " + f));
  process.exit(1);
}
