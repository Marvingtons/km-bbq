const { chromium } = require('./node_modules/playwright');
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ reducedMotion: 'reduce', viewport: {width:1440,height:900} });
  const p = await ctx.newPage();
  await p.addInitScript(() => sessionStorage.setItem('km-preloader-shown','1'));
  await p.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);

  // hero should NOT pin under reduced motion
  await p.evaluate(() => window.scrollTo(0,300));
  await p.waitForTimeout(300);
  const heroTop = await p.evaluate(() => Math.round(document.getElementById('home').getBoundingClientRect().top));
  console.log('reduced-motion heroTop at scroll=300 (should be -300, NOT pinned):', heroTop);

  // content should be visible (opacity 1) at rest, not stuck hidden
  const vis = await p.evaluate(() => {
    const pick = s => { const e=document.querySelector(s); return e?+getComputedStyle(e).opacity:null; };
    return { aboutText: pick('#about .max-w-2xl'), menuCard: pick('#menu .dish-card'),
             cateringH: pick('#catering h2'), contactLeft: pick('#contact .space-y-12') };
  });
  console.log('reduced-motion opacities (should all be 1):', JSON.stringify(vis));

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  console.log('reduced-motion no h-scroll:', overflow ? '✓' : '✗');
  await b.close();
})();
