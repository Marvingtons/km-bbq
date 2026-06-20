const { chromium } = require('./node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => sessionStorage.removeItem('km-preloader-shown'));
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const info = await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    return {
      bodyStyle: body.getAttribute('style'),
      htmlStyle: html.getAttribute('style'),
      bodyCssOverflowX: getComputedStyle(body).overflowX,
      htmlCssOverflowX: getComputedStyle(html).overflowX,
      bodyPaddingRight: getComputedStyle(body).paddingRight,
      bodyWidth: body.offsetWidth,
      htmlWidth: html.offsetWidth,
    };
  });
  console.log('Styles:', JSON.stringify(info, null, 2));

  // Check what element is causing the overflow
  const wideEl = await page.evaluate(() => {
    let maxW = 0, elInfo = '';
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1) {
        elInfo += `${el.tagName}.${[...el.classList].join('.')} right=${r.right.toFixed(1)} | `;
      }
    });
    return elInfo;
  });
  console.log('Elements overflowing right edge:', wideEl || 'none found');

  await browser.close();
})();
