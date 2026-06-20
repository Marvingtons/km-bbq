const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });

  // Desktop check
  const desk = await browser.newPage();
  await desk.setViewportSize({ width: 1440, height: 900 });
  await desk.addInitScript(() => sessionStorage.removeItem('km-preloader-shown'));
  await desk.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await desk.waitForTimeout(4000);

  // Desktop: no actual horizontal scroll
  await desk.evaluate(() => { document.documentElement.scrollLeft = 50; });
  const deskSL = await desk.evaluate(() => document.documentElement.scrollLeft);
  console.log('Desktop: scrollLeft after set=50:', deskSL, deskSL === 0 ? '✓ OK' : '✗ PROBLEM');

  // Hero pinned
  await desk.evaluate(() => window.scrollTo({ top: 300 }));
  await desk.waitForTimeout(300);
  const heroTop = await desk.evaluate(() => document.getElementById('home')?.getBoundingClientRect().top ?? 'N/A');
  console.log('Desktop hero top at scroll=300:', heroTop, Math.abs(heroTop) < 5 ? '✓ PINNED' : '✗ NOT PINNED');

  // About mural intact
  const mural = await desk.evaluate(() => {
    const s = getComputedStyle(document.getElementById('about'));
    return s.backgroundSize + ' / ' + s.backgroundPosition;
  });
  console.log('About mural bg:', mural);

  await desk.screenshot({ path: 'C:/Users/brand/kmbbq/ss-final-desktop-hero.png' });
  await desk.evaluate(() => {
    const m = document.getElementById('menu');
    window.scrollTo({ top: m ? m.offsetTop - 80 : 2000 });
  });
  await desk.waitForTimeout(400);
  await desk.screenshot({ path: 'C:/Users/brand/kmbbq/ss-final-desktop-menu.png' });
  await desk.close();

  // Mobile check
  const mob = await browser.newPage();
  await mob.setViewportSize({ width: 390, height: 844 });
  await mob.addInitScript(() => sessionStorage.removeItem('km-preloader-shown'));
  await mob.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await mob.waitForTimeout(4000);

  await mob.evaluate(() => { document.documentElement.scrollLeft = 50; });
  const mobSL = await mob.evaluate(() => document.documentElement.scrollLeft);
  console.log('Mobile: scrollLeft after set=50:', mobSL, mobSL === 0 ? '✓ OK' : '✗ PROBLEM');

  const mobHeroTop = await mob.evaluate(() => {
    window.scrollTo({ top: 200 });
    return document.getElementById('home')?.getBoundingClientRect().top ?? 'N/A';
  });
  await mob.waitForTimeout(200);
  const heroTop2 = await mob.evaluate(() => document.getElementById('home')?.getBoundingClientRect().top ?? 'N/A');
  console.log('Mobile hero top at scroll=200 (should be -200, not pinned):', heroTop2);

  await mob.screenshot({ path: 'C:/Users/brand/kmbbq/ss-final-mobile-hero.png' });

  await mob.evaluate(() => {
    const m = document.getElementById('menu');
    window.scrollTo({ top: m ? m.offsetTop - 60 : 1000 });
  });
  await mob.waitForTimeout(500);
  await mob.screenshot({ path: 'C:/Users/brand/kmbbq/ss-final-mobile-menu.png' });
  await mob.close();

  await browser.close();
  console.log('Final checks done.');
})();
