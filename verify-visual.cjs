const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.removeItem('km-preloader-shown'));
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Check if user can actually scroll horizontally (not just scrollWidth)
  const canHScroll = await page.evaluate(() => {
    const el = document.documentElement;
    return {
      scrollLeft: el.scrollLeft,
      // Try to scroll and see if it works
      maxScrollLeft: el.scrollWidth - el.clientWidth,
    };
  });
  console.log('Can scroll horizontally:', JSON.stringify(canHScroll));

  // Actually try to scroll right and see if it moves
  await page.evaluate(() => { document.documentElement.scrollLeft = 50; });
  const actualScrollLeft = await page.evaluate(() => document.documentElement.scrollLeft);
  console.log('After trying to scroll left=50, actual scrollLeft:', actualScrollLeft, '(0 = no h-scroll)');

  // Screenshot at page top 
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-initial-view.png', fullPage: false });
  
  // HTML overflow-x computed
  const htmlOverflow = await page.evaluate(() => getComputedStyle(document.documentElement).overflowX);
  console.log('html computed overflow-x:', htmlOverflow);

  await browser.close();
  console.log('Done.');
})();
