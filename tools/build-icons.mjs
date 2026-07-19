/**
 * Rasterizes the favicon / app-icon set from the badge SVGs in assets/.
 *
 * Run: node tools/build-icons.mjs
 *
 * Playwright does the rasterizing. It is already a devDependency for the
 * screenshot suite, so this adds no new toolchain — notably no sharp, which
 * would be a native build for a job we run by hand a few times a year.
 *
 * THREE masters, because the mark does not survive uniform scaling. Every size
 * is rendered natively from its master at exactly that pixel size — nothing is
 * produced by downscaling a larger raster:
 *
 *   km-bbq-badge.svg        full badge, real 8-curve flame.   180 / 192 / 512
 *   km-bbq-badge-small.svg  flame simplified to three licks.  32
 *   km-bbq-badge-16.svg     flame merged into one thick lick. 16
 *
 * The split is measured, not assumed. Rendering all three at both tab sizes and
 * comparing the actual pixels: the full badge's flame is red mush across the
 * K's legs by 32px, so it is not used below 180. The three-lick master still
 * reads as fire at 32 but collapses to a shapeless blob at 16. The merged lick
 * is the only one that holds a recognisable silhouette at 16 while leaving the
 * K's legs legible.
 *
 * Everything is written straight to disk, and the ICO is assembled here rather
 * than shelling out to ImageMagick.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFile(path.join(root, p), "utf8");

// Cream, matching --color-cream in globals.css. Apple touch icons are composited
// on white/black by iOS with no transparency, so that one gets a real backdrop
// instead of the checkerboard; the maskable icon needs a filled field too.
const CREAM = "#FAF4EC";

/**
 * Screenshot one SVG at one square size.
 * `bg` null keeps the alpha channel; a colour fills the field edge to edge.
 * `inset` shrinks the mark within the canvas, for the maskable safe zone.
 */
async function render(page, svg, size, { bg = null, inset = 0 } = {}) {
  const pad = Math.round(size * inset);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>
       html,body{margin:0;padding:0;width:${size}px;height:${size}px;
         background:${bg ?? "transparent"};}
       #w{width:${size}px;height:${size}px;display:grid;place-items:center;
         box-sizing:border-box;padding:${pad}px;}
       #w svg{width:100%;height:100%;display:block;}
     </style><div id="w">${svg}</div>`
  );
  return page.screenshot({ omitBackground: bg === null, type: "png" });
}

// --- ICO container -------------------------------------------------------
// An .ico is a 6-byte header, one 16-byte directory entry per image, then the
// image payloads. Every browser in use has accepted PNG payloads inside ICO
// since IE11, so the frames go in as PNG rather than as BMP/DIB.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width  (0 means 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // palette size
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    entries.push(e);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const out = async (rel, buf) => {
  const dest = path.join(root, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  console.log(`  ${rel.padEnd(34)} ${String(buf.length).padStart(7)} bytes`);
};

const main = async () => {
  const full = await read("assets/km-bbq-badge.svg");
  const small = await read("assets/km-bbq-badge-small.svg");
  const tiny = await read("assets/km-bbq-badge-16.svg");

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  console.log("icons:");

  // Tab sizes: each from the master that survives it, rendered natively at
  // that exact size rather than downscaled from one large raster.
  const png16 = await render(page, tiny, 16);
  const png32 = await render(page, small, 32);
  await out("public/favicon-16.png", png16);
  await out("public/favicon-32.png", png32);

  // favicon.ico carries both tab sizes so the browser picks per context
  // (16 for the tab strip, 32 for bookmarks and the Windows taskbar).
  const ico = buildIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
  ]);
  await out("src/app/favicon.ico", ico);

  // App icons: full badge. 48 is where the flame starts to hold together, so
  // everything from here up uses the complete mark.
  await out("src/app/icon.png", await render(page, full, 512));
  await out("public/icon-192.png", await render(page, full, 192));
  await out("public/icon-512.png", await render(page, full, 512));

  // iOS composites over an opaque field and rounds the corners itself, so this
  // one gets the cream backdrop and a little inset.
  await out(
    "src/app/apple-icon.png",
    await render(page, full, 180, { bg: CREAM, inset: 0.08 })
  );

  // Maskable: Android may crop to any shape inside the 80% safe zone, and a
  // disc that bleeds to the canvas edge would lose its rim. Inset to 20% and
  // fill the field so the crop has something to bite on.
  await out(
    "public/icon-maskable-512.png",
    await render(page, full, 512, { bg: CREAM, inset: 0.2 })
  );

  await browser.close();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
