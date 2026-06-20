const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  // iPhone 14 Pro dimensions
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.removeItem('km-preloader-shown'));
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // HScroll on mobile
  const { maxScrollLeft } = await page.evaluate(() => ({
    maxScrollLeft: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  console.log('Mobile maxScrollLeft (0 = good):', maxScrollLeft);

  // Confirm hero is NOT pinned on mobile (should scroll normally)
  await page.evaluate(() => window.scrollTo({ top: 200 }));
  await page.waitForTimeout(300);
  const heroTop = await page.evaluate(() => document.getElementById('home')?.getBoundingClientRect().top ?? 'N/A');
  console.log('Hero top at scroll=200 on mobile (should be negative, not pinned):', heroTop);

  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-mobile-hero.png' });

  // Menu on mobile - cards should render normally (grid, no horizontal overflow)
  await page.evaluate(() => {
    const m = document.getElementById('menu');
    window.scrollTo({ top: m ? m.offsetTop - 50 : 1000 });
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-mobile-menu.png' });

  // Final hscroll check
  const finalMaxSL = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  console.log('Mobile final maxScrollLeft:', finalMaxSL);

  await browser.close();
  console.log('Mobile checks done.');
})();
