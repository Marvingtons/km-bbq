const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.removeItem('km-preloader-shown'));
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);
  // Check horizontal overflow properly
  const result = await page.evaluate(() => ({
    docScrollWidth: document.documentElement.scrollWidth,
    docClientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  console.log('HScroll check:', JSON.stringify(result, null, 2));
  const hasHScroll = result.docScrollWidth > result.docClientWidth;
  console.log('Actual horizontal overflow:', hasHScroll ? 'YES (problem)' : 'NO (good)');
  // Also check at various scroll positions
  for (const y of [0, 300, 600, 900]) {
    await page.evaluate(y => window.scrollTo({ top: y }), y);
    await page.waitForTimeout(200);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`  scroll=${y}: scrollWidth=${sw}, clientWidth=${cw}, overflow=${sw > cw ? 'YES' : 'NO'}`);
  }
  await browser.close();
})();
