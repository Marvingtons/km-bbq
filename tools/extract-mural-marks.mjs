/**
 * Cuts the individual motifs out of the mural artwork and writes them to
 * public/images/marks/ as transparent PNG.
 *
 * Run: node tools/extract-mural-marks.mjs
 *      node tools/extract-mural-marks.mjs --sheet   (also write a contact sheet
 *                                                    of every mark on cream and
 *                                                    on plum-ink, for review)
 *
 * WHY: the mural is the brand centrepiece but it lived in exactly one place —
 * the About band — which is why About read as a different site. These are the
 * same artwork, composed per section, so About reads as the full choir and
 * every other view carries a few voices from it.
 *
 * ---------------------------------------------------------------------------
 * THE MATTE. This is the part that matters, and it changed in pass 3.
 *
 * The source pair comes in two forms. mural-*.webp already has an alpha
 * channel, but it was keyed by removing WHITE from the whole painting —
 * including the white INSIDE it. The tiger's teeth, its eye highlights and the
 * grill's grate lines are all holes in that version. On cream those holes are
 * the page showing through and the art looks right; on any darker ground they
 * are punctures and the mark falls apart, which is why marks were confined to
 * cream surfaces until now.
 *
 * mural-*-cream.png is the same painting, fully opaque, on a cream field, with
 * every interior white intact. So the cut is made from THAT instead, and the
 * transparency is found by flood-filling the field inward from the crop border:
 * anything the flood can reach from outside is background, anything enclosed by
 * paint is kept. Interior whites survive because the flood cannot get to them.
 *
 * Edges are soft, not binary: a pixel's "fieldness" is its distance from the
 * field colour, so the boundary carries partial alpha, and the colour there is
 * un-composited from cream (c_true = (c - field*(1-a)) / a) so the mark does
 * not drag a cream halo onto a dark ground.
 *
 * Result: the marks now work on ANY ground, which is what let the hero get a
 * mural composition at all.
 * ---------------------------------------------------------------------------
 *
 * Playwright does the pixel work, exactly as tools/build-icons.mjs does. It is
 * already a devDependency; sharp is deliberately not one (see build-icons.mjs).
 *
 * BOX is [left, top, width, height] in source pixels. mural-left-cream.png is
 * 889x884 and mural-right-cream.png is 890x884.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images", "marks");
const wantSheet = process.argv.includes("--sheet");

/**
 * Longest edge of the emitted asset, in px.
 *
 * NOTE ON THE CEILING THIS IMPLIES. The masters are 890x884 for the WHOLE
 * mural, so a single motif is only 100-260 source pixels across. Nothing here
 * is upscaled on export, which means the largest a mark can be DISPLAYED before
 * it visibly softens is roughly 1.5x its own source width. That is what caps
 * the hero element at ~400px rather than the ~660px the composition initially
 * wanted: past that the flame goes jagged. A bigger hero element needs a re-cut
 * master at higher resolution, not a bigger number here.
 */
const MAX_EDGE = 420;

const L = "mural-left-cream.png";
const R = "mural-right-cream.png";

const MARKS = [
  // --- the five semantic marks, unchanged assignments -------------------
  { name: "tiger", from: L, box: [5, 55, 258, 232] },
  { name: "pine", from: L, box: [700, 250, 186, 262] },
  { name: "mask", from: R, box: [632, 358, 128, 198] },
  { name: "flame", from: R, box: [358, 598, 242, 228] },
  { name: "grill", from: R, box: [540, 100, 217, 172] },
  // --- pass 3: the pieces a composition needs ---------------------------
  // Hero scale, and the two that carry ambient motion.
  { name: "stew", from: L, box: [325, 268, 258, 240] }, // pot + its steam column
  { name: "smoke", from: L, box: [562, 36, 172, 168] }, // the black ink swirl
  { name: "wisp", from: L, box: [434, 82, 176, 98] }, // the pale drifting wisp
  { name: "branch", from: R, box: [457, 379, 99, 108] }, // berry sprig, overhangs
  { name: "chili", from: R, box: [368, 466, 96, 96] },
  { name: "bloom", from: L, box: [428, 616, 84, 86] }, // single red flower
  { name: "drum", from: L, box: [222, 442, 118, 122] },
];

/** Colour distance below which a pixel counts as field, and the soft band. */
const FIELD_TOL = 26;
const FIELD_SOFT = 52;

const sources = {};
for (const src of new Set(MARKS.map((m) => m.from))) {
  const buf = await fs.readFile(path.join(root, "public", "images", src));
  sources[src] = `data:image/png;base64,${buf.toString("base64")}`;
}

const browser = await chromium.launch();
const page = await browser.newPage();

/** Each master's flat field colour, read once from its own outer corners. */
const fields = await page.evaluate(async (srcs) => {
  const load = (src) =>
    new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    });
  const out = {};
  for (const [name, src] of Object.entries(srcs)) {
    const img = await load(src);
    const cv = new OffscreenCanvas(img.width, img.height);
    const c = cv.getContext("2d", { willReadFrequently: true });
    c.drawImage(img, 0, 0);
    const pts = [
      [2, 2],
      [img.width - 3, 2],
      [2, img.height - 3],
      [img.width - 3, img.height - 3],
    ];
    let r = 0, g = 0, b = 0;
    for (const [x, y] of pts) {
      const d = c.getImageData(x, y, 1, 1).data;
      r += d[0];
      g += d[1];
      b += d[2];
    }
    out[name] = [r / 4, g / 4, b / 4];
  }
  return out;
}, sources);
console.log("field colours:", fields);

const results = await page.evaluate(
  async ({ marks, maxEdge, tol, soft }) => {
    const load = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const out = [];
    for (const { name, from, box, fieldRGB } of marks) {
      const img = await load(from);
      const [x, y, w, h] = box;

      const cut = new OffscreenCanvas(w, h);
      const cx = cut.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, x, y, w, h, 0, 0, w, h);
      const px = cx.getImageData(0, 0, w, h);
      const d = px.data;
      const n = w * h;

      // 1 — the field colour comes from the MASTER's own corner, not from this
      //     crop's corners. A tight crop often has paint in a corner (the smoke
      //     swirl fills three of them), and sampling that made the tool treat
      //     ink as the background: the flood then reached nothing and the mark
      //     shipped as a cream card with a motif on it.
      const [fr, fg, fb] = fieldRGB;

      // 2 — fieldness per pixel: 1 = pure field, 0 = definitely paint.
      const field = new Float32Array(n);
      for (let p = 0; p < n; p++) {
        const dr = d[p * 4] - fr;
        const dg = d[p * 4 + 1] - fg;
        const db = d[p * 4 + 2] - fb;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);
        field[p] = dist <= tol ? 1 : dist >= soft ? 0 : 1 - (dist - tol) / (soft - tol);
      }

      // 3 — flood the field inward from every border pixel. Anything the flood
      //     cannot reach is enclosed by paint and stays opaque: this is what
      //     keeps the tiger's teeth and the grill's grate lines.
      const outside = new Uint8Array(n);
      const stack = [];
      for (let i = 0; i < w; i++) {
        stack.push(i, (h - 1) * w + i);
      }
      for (let j = 0; j < h; j++) {
        stack.push(j * w, j * w + w - 1);
      }
      while (stack.length) {
        const p = stack.pop();
        if (outside[p] || field[p] < 0.5) continue;
        outside[p] = 1;
        const col = p % w;
        if (col > 0) stack.push(p - 1);
        if (col < w - 1) stack.push(p + 1);
        if (p >= w) stack.push(p - w);
        if (p < n - w) stack.push(p + w);
      }

      let floodCount = 0;
      for (let p = 0; p < n; p++) if (outside[p]) floodCount++;

      // 4 — alpha, and un-composite the soft edge off the cream field so the
      //     mark carries no halo onto a dark ground.
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let p = 0; p < n; p++) {
        let a = 1;
        if (outside[p]) a = 1 - field[p];
        else {
          // A pixel touching the outside region is a boundary pixel: let its
          // fieldness soften it too, so the silhouette is antialiased.
          const col = p % w;
          const touches =
            (col > 0 && outside[p - 1]) ||
            (col < w - 1 && outside[p + 1]) ||
            (p >= w && outside[p - w]) ||
            (p < n - w && outside[p + w]);
          if (touches) a = 1 - field[p];
        }
        if (a <= 0.004) {
          d[p * 4 + 3] = 0;
          continue;
        }
        if (a < 1) {
          d[p * 4] = Math.max(0, Math.min(255, (d[p * 4] - fr * (1 - a)) / a));
          d[p * 4 + 1] = Math.max(0, Math.min(255, (d[p * 4 + 1] - fg * (1 - a)) / a));
          d[p * 4 + 2] = Math.max(0, Math.min(255, (d[p * 4 + 2] - fb * (1 - a)) / a));
        }
        d[p * 4 + 3] = Math.round(a * 255);
        if (a > 0.03) {
          const col = p % w;
          const row = (p - col) / w;
          if (col < x0) x0 = col;
          if (col > x1) x1 = col;
          if (row < y0) y0 = row;
          if (row > y1) y1 = row;
        }
      }
      cx.putImageData(px, 0, 0);

      // 5 — trim to the motif's real bounds, scale, encode.
      const tw = x1 - x0 + 1;
      const th = y1 - y0 + 1;
      const scale = Math.min(1, maxEdge / Math.max(tw, th));
      const dw = Math.max(1, Math.round(tw * scale));
      const dh = Math.max(1, Math.round(th * scale));
      const dest = new OffscreenCanvas(dw, dh);
      const dctx = dest.getContext("2d");
      dctx.imageSmoothingQuality = "high";
      dctx.drawImage(cut, x0, y0, tw, th, 0, 0, dw, dh);

      // PNG, not WebP: Chromium's lossy WebP encoder in convertToBlob drops the
      // alpha channel. next/image re-encodes to AVIF/WebP at serve time anyway.
      const blob = await dest.convertToBlob({ type: "image/png" });
      const buf = new Uint8Array(await blob.arrayBuffer());
      out.push({ name, w: dw, h: dh, cut: floodCount / n, bytes: Array.from(buf) });
    }
    return out;
  },
  {
    marks: MARKS.map((m) => ({ ...m, from: sources[m.from], fieldRGB: fields[m.from] })),
    maxEdge: MAX_EDGE,
    tol: FIELD_TOL,
    soft: FIELD_SOFT,
  }
);

await fs.mkdir(outDir, { recursive: true });
for (const { name, w, h, cut, bytes } of results) {
  await fs.writeFile(path.join(outDir, `${name}.png`), Buffer.from(bytes));
  const pct = (cut * 100).toFixed(0);
  // A crop whose field never got flooded ships as a cream card with a motif on
  // it. Anything under ~12% cut away is almost certainly that failure.
  const flag = cut < 0.12 ? "  <-- CHECK: almost nothing was cut away" : "";
  console.log(`marks: ${name}.png  ${w}x${h}  ${(bytes.length / 1024).toFixed(1)}kB  field ${pct}%${flag}`);
}

// The trim decides the final dimensions, so they change whenever a box does.
// src/components/MuralMark.tsx records them so next/image can reserve the box;
// print them ready to paste rather than letting the two drift.
console.log("\nPaste into MuralMark.tsx:");
for (const { name, w, h } of results) {
  console.log(`  ${name}: { src: "/images/marks/${name}.png", w: ${w}, h: ${h} },`);
}

if (wantSheet) {
  // Review sheet: every mark on cream and on plum-ink, because "does the matte
  // survive a dark ground" is the whole question this tool exists to answer.
  const sheet = await page.evaluate(
    async ({ marks }) => {
      const load = (src) =>
        new Promise((res, rej) => {
          const i = new Image();
          i.onload = () => res(i);
          i.onerror = rej;
          i.src = src;
        });
      const cell = 190;
      const cols = Math.min(7, marks.length);
      const rows = Math.ceil(marks.length / cols);
      const cv = new OffscreenCanvas(cell * cols, cell * rows * 2);
      const c = cv.getContext("2d");
      c.fillStyle = "#FAF4EC";
      c.fillRect(0, 0, cv.width, cell * rows);
      c.fillStyle = "#1B1215";
      c.fillRect(0, cell * rows, cv.width, cell * rows);
      for (let i = 0; i < marks.length; i++) {
        const img = await load(marks[i].src);
        const s = Math.min((cell - 20) / img.width, (cell - 20) / img.height);
        const dw = img.width * s;
        const dh = img.height * s;
        const cxp = (i % cols) * cell + (cell - dw) / 2;
        const cyp = Math.floor(i / cols) * cell + (cell - dh) / 2;
        c.drawImage(img, cxp, cyp, dw, dh);
        c.drawImage(img, cxp, cyp + cell * rows, dw, dh);
      }
      const blob = await cv.convertToBlob({ type: "image/png" });
      return Array.from(new Uint8Array(await blob.arrayBuffer()));
    },
    {
      marks: results.map((r) => ({
        src: `data:image/png;base64,${Buffer.from(r.bytes).toString("base64")}`,
      })),
    }
  );
  const p = path.join(root, "tools", "marks-sheet.png");
  await fs.writeFile(p, Buffer.from(sheet));
  console.log(`\nreview sheet -> ${p}`);
}

await browser.close();
