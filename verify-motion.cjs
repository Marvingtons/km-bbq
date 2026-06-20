const { chromium } = require('./node_modules/playwright');

const SELECTORS = {
  heroContent: '#home .max-w-5xl',
  heroVideo:   '#home video',
  aboutText:   '#about .max-w-2xl',
  menuCard0:   '#menu .dish-card:nth-child(1)',
  menuCard2:   '#menu .dish-card:nth-child(3)',
  galleryCell0:'#gallery .gallery-cell:nth-child(1)',
  galleryCell1:'#gallery .gallery-cell:nth-child(2)',
  cateringH:   '#catering h2',
  cateringBody:'#catering p.max-w-xl',
  contactLeft: '#contact .space-y-12',
};

async function scan(page, label) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);
  const distinct = {}; for (const k in SELECTORS) distinct[k] = new Set();
  let heroPinnedSamples = [];
  for (let y = 0; y <= h - vh; y += 150) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(70);
    const res = await page.evaluate((sels) => {
      const out = {};
      for (const k in sels) {
        const el = document.querySelector(sels[k]);
        out[k] = el ? getComputedStyle(el).transform : 'MISSING';
      }
      const home = document.getElementById('home');
      out.__heroTop = home ? Math.round(home.getBoundingClientRect().top) : null;
      out.__opacity = (() => { const e=document.querySelector('#home .max-w-5xl'); return e?getComputedStyle(e).opacity:null; })();
      return out;
    }, SELECTORS);
    for (const k in SELECTORS) distinct[k].add(res[k]);
    if (y > 0 && y < 650) heroPinnedSamples.push(res.__heroTop);
  }
  console.log(`\n=== ${label} ===`);
  for (const k in SELECTORS) {
    const n = distinct[k].size;
    const sample = [...distinct[k]].slice(0,2).map(s=>s.length>40?s.slice(0,40)+'…':s);
    console.log(`  ${k.padEnd(13)} distinct-transforms=${n} ${n>1?'✓ MOVES':'• static'}  e.g. ${sample.join(' | ')}`);
  }
  console.log(`  heroTop during pin range (should stay ~0): ${heroPinnedSamples.join(',')}`);
  const overflow = await page.evaluate(() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth}));
  console.log(`  horizontal: scrollWidth=${overflow.sw} clientWidth=${overflow.cw} -> ${overflow.sw<=overflow.cw?'✓ no h-scroll':'✗ OVERFLOW'}`);
  const mural = await page.evaluate(() => { const s=getComputedStyle(document.getElementById('about')); return `${s.backgroundSize} / ${s.backgroundPosition} / img:${s.backgroundImage.includes('mural')}`; });
  console.log(`  about mural bg: ${mural}`);
}

(async () => {
  const b = await chromium.launch({ headless: true });
  const desk = await b.newPage();
  await desk.setViewportSize({ width: 1440, height: 900 });
  await desk.addInitScript(() => sessionStorage.setItem('km-preloader-shown','1'));
  await desk.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await desk.waitForTimeout(1500);
  await scan(desk, 'DESKTOP 1440x900');
  await desk.close();

  const mob = await b.newPage();
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.addInitScript(() => sessionStorage.setItem('km-preloader-shown','1'));
  await mob.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await mob.waitForTimeout(1500);
  await scan(mob, 'MOBILE 390x844');
  await mob.close();

  await b.close();
})();
