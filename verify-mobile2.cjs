const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => sessionStorage.removeItem('km-preloader-shown'));
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Try to actually scroll horizontally
  await page.evaluate(() => { document.documentElement.scrollLeft = 50; });
  const actualSL = await page.evaluate(() => document.documentElement.scrollLeft);
  console.log('Mobile: actual scrollLeft after trying to set 50:', actualSL, '(0 = no h-scroll)');

  // Which elements overflow on mobile?
  const wideEls = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 2) {
        items.push(`${el.tagName}.${[...el.classList].slice(0, 3).join('.')} right=${r.right.toFixed(1)}`);
      }
    });
    return items.slice(0, 5).join(' | ');
  });
  console.log('Mobile: elements overflowing:', wideEls || 'none');

  await browser.close();
})();
