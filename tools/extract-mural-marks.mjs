/**
 * Cuts the individual motifs out of the mural artwork and writes them to
 * public/images/marks/ as transparent PNG.
 *
 * Run: node tools/extract-mural-marks.mjs
 *
 * WHY: the mural is the brand centrepiece but it lived in exactly one place —
 * the About band — which is why About read as a different site. These are the
 * same artwork, one motif per section, so About reads as the full choir and
 * every other section carries a single voice from it.
 *
 * The mural files are flat rasters, but the motifs sit isolated on a
 * transparent field with real gaps between them, so a rectangle plus an alpha
 * trim is a clean cut — nothing is traced, redrawn or approximated. THE MARKS
 * STAY FULL COLOUR: no grade, no tint, no desaturation, same rule as the mural.
 *
 * Playwright does the pixel work, exactly as tools/build-icons.mjs does. It is
 * already a devDependency; sharp is deliberately not one (see build-icons.mjs).
 *
 * BOX is in source-image pixels. mural-left.webp is 889x884, mural-right.webp
 * is 890x884. It has to be the WebP pair, not the PNGs beside them: only the
 * WebPs have the white field baked out, so a cut from a PNG carries a white
 * card behind the motif.
 *
 * TWO THINGS THESE MARKS CANNOT DO, both inherited from the source art:
 *
 *   1. They cannot sit on a DARK ground. The white was keyed out of the whole
 *      painting, INCLUDING the white inside it — the tiger's teeth, the eye
 *      highlights, the grill's grate lines. On cream those holes are the page
 *      showing through and the art reads exactly as painted; on plum-ink they
 *      become dark punctures and the mark falls apart. So marks go on cream
 *      surfaces only, which is why neither the hero nor the footer carries one.
 *      Fixing that would need a re-keyed master with the interior whites kept.
 *   2. The chopsticks-and-spoon cannot be cut at all: their bounding rectangle
 *      overlaps the kimchi bowl above them, and a rectangle is the only cut
 *      available here. The table grill is used in that slot instead.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "images", "marks");

/** Longest edge of the emitted asset, in px. Marks render at 48-112 CSS px. */
const MAX_EDGE = 240;

const MARKS = [
  { name: "tiger", from: "mural-left.webp", box: [5, 55, 258, 232] },
  { name: "pine", from: "mural-left.webp", box: [700, 250, 186, 262] },
  { name: "mask", from: "mural-right.webp", box: [632, 358, 128, 198] },
  { name: "flame", from: "mural-right.webp", box: [358, 598, 242, 228] },
  { name: "grill", from: "mural-right.webp", box: [540, 100, 217, 172] },
];

// The mural files go in as data URLs rather than file:// URLs on purpose: a
// file:// image is an opaque origin in Chromium, which taints the canvas and
// makes the getImageData() alpha trim below throw. Data URLs are same-origin.
const sources = {};
for (const src of new Set(MARKS.map((m) => m.from))) {
  const buf = await fs.readFile(path.join(root, "public", "images", src));
  sources[src] = `data:image/webp;base64,${buf.toString("base64")}`;
}

const page = await (await chromium.launch()).newPage();

const results = await page.evaluate(
  async ({ marks, maxEdge }) => {
    const load = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    const out = [];
    for (const { name, from, box } of marks) {
      const img = await load(from);
      const [x, y, w, h] = box;

      // 1 — cut the rectangle.
      const cut = new OffscreenCanvas(w, h);
      const cx = cut.getContext("2d");
      cx.drawImage(img, x, y, w, h, 0, 0, w, h);

      // 2 — shrink to the motif's real alpha bounds, so the asset carries no
      //     transparent padding and the mark can be sized by its own art.
      const { data } = cx.getImageData(0, 0, w, h);
      let x0 = w, y0 = h, x1 = -1, y1 = -1;
      for (let py = 0; py < h; py++) {
        for (let px = 0; px < w; px++) {
          if (data[(py * w + px) * 4 + 3] > 8) {
            if (px < x0) x0 = px;
            if (px > x1) x1 = px;
            if (py < y0) y0 = py;
            if (py > y1) y1 = py;
          }
        }
      }
      const tw = x1 - x0 + 1;
      const th = y1 - y0 + 1;

      // NOTE for anyone tempted to bleed the artwork's colour outward into the
      // transparent border here (the usual cure for resample fringing): a 2D
      // canvas stores premultiplied alpha, so any colour written to a pixel
      // with alpha 0 is discarded on the next getImageData/encode. It cannot be
      // done on this pipeline. It is also not needed — the marks only ever sit
      // on cream, and the source's cut-away pixels are white.

      // 3 — scale so the longest edge is maxEdge, and encode.
      const scale = Math.min(1, maxEdge / Math.max(tw, th));
      const dw = Math.round(tw * scale);
      const dh = Math.round(th * scale);
      const dest = new OffscreenCanvas(dw, dh);
      const dctx = dest.getContext("2d");
      dctx.imageSmoothingQuality = "high";
      dctx.drawImage(cut, x0, y0, tw, th, 0, 0, dw, dh);

      // PNG, not WebP. Chromium's lossy WebP encoder in convertToBlob drops the
      // alpha channel and composites onto white, which put a white card behind
      // every mark on the cream page. PNG keeps the cut-out; next/image
      // re-encodes to AVIF/WebP at serve time anyway (and on Cloudflare the
      // Images binding does), so nothing ships these bytes as-is.
      const blob = await dest.convertToBlob({ type: "image/png" });
      const buf = new Uint8Array(await blob.arrayBuffer());
      out.push({ name, w: dw, h: dh, bytes: Array.from(buf) });
    }
    return out;
  },
  {
    marks: MARKS.map((m) => ({ ...m, from: sources[m.from] })),
    maxEdge: MAX_EDGE,
  }
);

await fs.mkdir(outDir, { recursive: true });
for (const { name, w, h, bytes } of results) {
  const file = path.join(outDir, `${name}.png`);
  await fs.writeFile(file, Buffer.from(bytes));
  console.log(`marks: ${name}.png  ${w}x${h}  ${(bytes.length / 1024).toFixed(1)}kB`);
}

// The alpha trim decides the final dimensions, so they change whenever a box
// does. src/components/MuralMark.tsx records them so next/image can reserve the
// box; print them ready to paste, rather than leaving the two to drift.
console.log("\nPaste into MuralMark.tsx:");
for (const { name, w, h } of results) {
  console.log(`  ${name}: { src: "/images/marks/${name}.png", w: ${w}, h: ${h} },`);
}

await page.context().browser().close();
