const { chromium } = require('./node_modules/playwright');
const BASE = 'http://localhost:3001';

const SELECTORS = {
  heroHeadline: '#home h1',
  heroVideoBg:  '#home > div[aria-hidden="true"]',
  aboutBlock:   '#about .max-w-2xl',
  menuCard0:    '#menu .km-dish-card:nth-child(1)',
  menuCard2:    '#menu .km-dish-card:nth-child(3)',
  galleryTile0: '#gallery .km-gallery-tile:nth-child(1)',
  galleryTile1: '#gallery .km-gallery-tile:nth-child(2)',
  cateringH:    '#catering h2',
  cateringBody: '#catering p.max-w-xl',
  contactItem:  '#contact .km-contact-item',
};

async function scan(page, label) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  const distinct = {}; for (const k in SELECTORS) distinct[k] = new Set();
  let heroPinnedSamples = [];
  let maxScrollWidth = 0;
  for (let y = 0; y <= h - vh; y += 120) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
    const res = await page.evaluate((sels) => {
      const out = {};
      for (const k in sels) {
        const el = document.querySelector(sels[k]);
        out[k] = el ? getComputedStyle(el).transform : 'MISSING';
      }
      const home = document.getElementById('home');
      out.__heroTop = home ? Math.round(home.getBoundingClientRect().top) : null;
      out.__sw = document.documentElement.scrollWidth;
      out.__cw = document.documentElement.clientWidth;
      return out;
    }, SELECTORS);
    for (const k in SELECTORS) distinct[k].add(res[k]);
    if (y > 50 && y < 600) heroPinnedSamples.push(res.__heroTop);
    if (res.__sw > maxScrollWidth) maxScrollWidth = res.__sw;
    var lastCW = res.__cw;
  }
  console.log(`\n=== ${label} ===`);
  for (const k in SELECTORS) {
    const n = distinct[k].size;
    console.log(`  ${k.padEnd(13)} distinct-transforms=${n} ${n>1?'MOVES ✓':'static •'}`);
  }
  console.log(`  heroTop during early-scroll (pin keeps ~0 on desktop): ${heroPinnedSamples.slice(0,6).join(',')}`);
  console.log(`  horizontal: maxScrollWidth=${maxScrollWidth} clientWidth=${lastCW} -> ${maxScrollWidth<=lastCW?'NO h-scroll ✓':'OVERFLOW ✗'}`);
  const mural = await page.evaluate(() => { const s=getComputedStyle(document.getElementById('about')); return `size=${s.backgroundSize} pos=${s.backgroundPosition} mural=${s.backgroundImage.includes('mural')}`; });
  console.log(`  about mural bg: ${mural}`);
}

(async () => {
  const b = await chromium.launch({ headless: true });

  const desk = await b.newPage();
  await desk.setViewportSize({ width: 1440, height: 900 });
  await desk.addInitScript(() => sessionStorage.setItem('km-preloader-shown','1'));
  await desk.goto(BASE, { waitUntil: 'networkidle' });
  await desk.waitForTimeout(1500);
  await scan(desk, 'DESKTOP 1440x900');
  await desk.close();

  const mob = await b.newPage();
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.addInitScript(() => sessionStorage.setItem('km-preloader-shown','1'));
  await mob.goto(BASE, { waitUntil: 'networkidle' });
  await mob.waitForTimeout(1500);
  await scan(mob, 'MOBILE 390x844');
  await mob.close();

  // Reduced motion: content must be visible & static (opacity 1, no leftover hidden state)
  const rm = await b.newPage();
  await rm.setViewportSize({ width: 1440, height: 900 });
  await rm.emulateMedia({ reducedMotion: 'reduce' });
  await rm.addInitScript(() => sessionStorage.setItem('km-preloader-shown','1'));
  await rm.goto(BASE, { waitUntil: 'networkidle' });
  await rm.waitForTimeout(1200);
  const rmCheck = await rm.evaluate(() => {
    const els = ['#about h2', '#menu .km-dish-card:nth-child(1)', '#catering h2', '#contact .km-contact-item'];
    return els.map(s => { const e=document.querySelector(s); return e?`${s} opacity=${getComputedStyle(e).opacity}`:`${s} MISSING`; });
  });
  const rmHeroTop = [];
  for (const y of [0, 200, 400]) { await rm.evaluate(yy=>window.scrollTo(0,yy), y); await rm.waitForTimeout(80); rmHeroTop.push(await rm.evaluate(()=>Math.round(document.getElementById('home').getBoundingClientRect().top))); }
  console.log(`\n=== REDUCED MOTION (should be visible & no pin) ===`);
  rmCheck.forEach(c => console.log('  '+c));
  console.log(`  heroTop at scroll 0/200/400 (should change = NOT pinned): ${rmHeroTop.join(',')}`);
  await rm.close();

  await b.close();
})();
