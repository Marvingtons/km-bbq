/**
 * Rasterizes the favicon / app-icon set from the badge SVGs in assets/.
 *
 * Run: node tools/build-icons.mjs
 *
 * Playwright does the rasterizing. It is already a devDependency for the
 * screenshot suite, so this adds no new toolchain — notably no sharp, which
 * would be a native build for a job we run by hand a few times a year.
 *
 * One master, the full badge, for every size from 180 up:
 *
 *   km-bbq-badge.svg        full badge, real 8-curve flame.   180 / 192 / 512
 *
 * The tab icon is no longer built here. It is /icon-192.png, declared in
 * src/app/layout.tsx and downscaled by the browser.
 *
 * Note for anyone restoring dedicated tab sizes: assets/km-bbq-badge-small.svg
 * (32) and km-bbq-badge-16.svg (16) are still in assets/. They exist because
 * measuring real pixels showed the full badge's flame goes to red mush across
 * the K's legs by 32px. That measurement has not changed — only the decision to
 * ship a single source did.
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

const out = async (rel, buf) => {
  const dest = path.join(root, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  console.log(`  ${rel.padEnd(34)} ${String(buf.length).padStart(7)} bytes`);
};

const main = async () => {
  const full = await read("assets/km-bbq-badge.svg");

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  console.log("icons:");

  // The tab icon is /icon-192.png (declared in src/app/layout.tsx), downscaled
  // by the browser. The per-size masters this used to emit — public/favicon-16
  // .png, public/favicon-32.png and the src/app/favicon.ico built from them —
  // are gone on purpose. Don't reintroduce favicon.ico: browsers prefer it over
  // any declared <link>, so it would silently win back the tab.

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
