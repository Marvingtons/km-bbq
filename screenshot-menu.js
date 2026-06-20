const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
  const page = await ctx.newPage();
  // skip preloader by pre-seeding sessionStorage
  await page.addInitScript(() => sessionStorage.setItem('km-preloader-shown', '1'));
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('[id="menu"]', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(1500);
  // get absolute page top of menu section
  const menuTop = await page.evaluate(() => {
    const el = document.getElementById('menu');
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  });
  console.log('menu absolute top:', menuTop);

  // row 1 crop (top of cards)
  await page.evaluate((y) => window.scrollTo(0, y + 280), menuTop);
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/menu-row1.png' });

  // row 2 crop
  await page.evaluate((y) => window.scrollTo(0, y + 280 + 620), menuTop);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/menu-row2.png' });
  await browser.close();
  console.log('done');
})();
