/**
 * Finds the two frames of the hero clip that are hardest for type to sit on,
 * and writes them into contrast-check/ so the contrast result is inspectable
 * rather than asserted.
 *
 *   node tools/hero-worst-frames.mjs [path-or-url]
 *
 * The two cases, both measured only inside the band where the hero's type
 * actually lands (the copy block is bottom-anchored, so that is the lower
 * ~62% of the frame after the object-cover crop):
 *
 *   BRIGHTEST  highest mean relative luminance. The worst case for LIGHT type,
 *              and the frame the brief asks about by name.
 *   BUSIEST    highest high-frequency energy — mean absolute Laplacian over
 *              the luma plane. This is the one that actually breaks legibility:
 *              a frame can be mid-bright on average and still shred a letterform
 *              by running hard light/dark edges through it at glyph scale.
 *
 * Also reports the DARKEST frame, because for INK type on footage the binding
 * constraint is dark ground, not bright — a fact worth keeping in the output so
 * nobody re-derives the wrong worst case later.
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SRC = process.argv[2] || "https://pub-364f647b29874b09922e1889f267c323.r2.dev/kmbbq-hero.mp4";
const OUT = "contrast-check";
const W = 320, H = 180;            // analysis resolution
const TYPE_TOP = Math.floor(H * 0.38); // where hero type starts, post-crop

const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };

// --- pull every frame as gray at analysis resolution ------------------------
const ff = spawn("ffmpeg", ["-v", "error", "-i", SRC,
  "-vf", `scale=${W}:${H}:flags=area,format=gray`, "-f", "rawvideo", "-"]);
const chunks = [];
ff.stdout.on("data", (d) => chunks.push(d));
ff.stderr.on("data", (d) => process.stderr.write(d));
await new Promise((r) => ff.on("close", r));

const buf = Buffer.concat(chunks);
const frameBytes = W * H;
const frames = Math.floor(buf.length / frameBytes);
if (!frames) { console.error("no frames decoded"); process.exit(1); }

const stats = [];
for (let f = 0; f < frames; f++) {
  const off = f * frameBytes;
  let lumSum = 0, lapSum = 0, n = 0;

  for (let y = TYPE_TOP; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const v = buf[off + y * W + x];
      lumSum += lin(v);
      n++;
      // 4-neighbour Laplacian: high where the frame has glyph-scale edges.
      if (x > 0 && x < W - 1 && y > TYPE_TOP && y < H - 1) {
        const lap =
          4 * v -
          buf[off + y * W + (x - 1)] -
          buf[off + y * W + (x + 1)] -
          buf[off + (y - 1) * W + x] -
          buf[off + (y + 1) * W + x];
        lapSum += Math.abs(lap);
      }
    }
  }
  stats.push({ f, meanL: lumSum / n, busy: lapSum / n });
}

const brightest = stats.reduce((a, b) => (b.meanL > a.meanL ? b : a));
const busiest = stats.reduce((a, b) => (b.busy > a.busy ? b : a));
const darkest = stats.reduce((a, b) => (b.meanL < a.meanL ? b : a));

mkdirSync(OUT, { recursive: true });

const grab = (frame, name) => {
  execFileSync("ffmpeg", ["-v", "error", "-i", SRC,
    "-vf", `select=eq(n\\,${frame})`, "-frames:v", "1", "-y", `${OUT}/${name}.png`]);
  return `${OUT}/${name}.png`;
};

const files = {
  brightest: grab(brightest.f, "frame-brightest"),
  busiest: grab(busiest.f, "frame-busiest"),
  darkest: grab(darkest.f, "frame-darkest"),
};

const fps = 30;
const summary = {
  source: SRC,
  frames,
  analysedRegion: `lower ${Math.round((1 - TYPE_TOP / H) * 100)}% of frame (where hero type lands)`,
  brightest: { frame: brightest.f, timeSec: +(brightest.f / fps).toFixed(3), meanRelLuminance: +brightest.meanL.toFixed(4), file: files.brightest },
  busiest: { frame: busiest.f, timeSec: +(busiest.f / fps).toFixed(3), laplacianEnergy: +busiest.busy.toFixed(2), meanRelLuminance: +busiest.meanL.toFixed(4), file: files.busiest },
  darkest: { frame: darkest.f, timeSec: +(darkest.f / fps).toFixed(3), meanRelLuminance: +darkest.meanL.toFixed(4), file: files.darkest,
             note: "Not requested, but this is the binding case for INK type. Kept so the wrong worst case does not get re-derived later." },
};

writeFileSync(`${OUT}/frames.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
