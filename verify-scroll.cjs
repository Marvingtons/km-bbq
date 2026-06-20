const { chromium } = require('./node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.addInitScript(() => {
    sessionStorage.removeItem('km-preloader-shown');
  });

  console.log('Navigating...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });

  const preloaderVisible = await page.locator('[aria-label="Loading KM.BBQ"]').isVisible().catch(() => false);
  console.log('1. Preloader visible:', preloaderVisible);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-01-preloader.png' });

  await page.waitForTimeout(3800);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-02-hero.png' });

  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  console.log('2. HScroll check: scrollWidth', scrollWidth, 'innerWidth', innerWidth, '→', scrollWidth > innerWidth + 2 ? 'PROBLEM' : 'OK');

  const muralStyle = await page.evaluate(() => {
    const s = getComputedStyle(document.getElementById('about'));
    return { backgroundSize: s.backgroundSize, backgroundPosition: s.backgroundPosition };
  });
  console.log('3. About mural bg:', JSON.stringify(muralStyle));

  // Hero pin test
  await page.evaluate(() => window.scrollTo({ top: 300 }));
  await page.waitForTimeout(600);
  const heroTop = await page.evaluate(() => document.getElementById('home')?.getBoundingClientRect().top ?? 'N/A');
  const heroPinned = typeof heroTop === 'number' && Math.abs(heroTop) < 5;
  console.log('4. Hero top at scroll=300:', heroTop, '→', heroPinned ? 'PINNED ✓' : 'NOT PINNED');
  const contentTransform = await page.evaluate(() => {
    const el = document.querySelector('#home [style*="will-change"]');
    return el ? getComputedStyle(el).transform : 'not found';
  });
  console.log('5. Hero content transform (should show y offset):', contentTransform);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-03-hero-pinned.png' });

  // About slide
  await page.evaluate(() => window.scrollTo({ top: 950 }));
  await page.waitForTimeout(500);
  const aboutTextTransform = await page.evaluate(() => {
    const el = document.querySelector('#about [style*="will-change"]');
    return el ? getComputedStyle(el).transform : 'not found';
  });
  console.log('6. About text block transform mid-enter:', aboutTextTransform);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-04-about.png' });

  // Menu
  await page.evaluate(() => {
    const m = document.getElementById('menu');
    window.scrollTo({ top: m ? m.offsetTop - 100 : 2000 });
  });
  await page.waitForTimeout(500);
  const cardTransforms = await page.evaluate(() =>
    [...document.querySelectorAll('.dish-card')]
      .map((c, i) => `[${i}]: ${getComputedStyle(c).transform}`)
      .join(' | ')
  );
  console.log('7. Dish card transforms on menu enter:\n', cardTransforms);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-05-menu.png' });

  // Gallery
  await page.evaluate(() => {
    const g = document.getElementById('gallery');
    window.scrollTo({ top: g ? g.offsetTop - 100 : 4000 });
  });
  await page.waitForTimeout(500);
  const cellTransforms = await page.evaluate(() =>
    [...document.querySelectorAll('.gallery-cell')]
      .slice(0, 4)
      .map((c, i) => `[${i}]: ${getComputedStyle(c).transform}`)
      .join(' | ')
  );
  console.log('8. Gallery cell transforms:', cellTransforms);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-06-gallery.png' });

  // Catering
  await page.evaluate(() => {
    const c = document.getElementById('catering');
    window.scrollTo({ top: c ? c.offsetTop - 100 : 5000 });
  });
  await page.waitForTimeout(500);
  const cateringTransforms = await page.evaluate(() =>
    [...document.querySelectorAll('#catering [style*="will-change"]')]
      .map((el, i) => `[${i}]: ${getComputedStyle(el).transform}`)
      .join(' | ')
  );
  console.log('9. Catering transforms on enter:', cateringTransforms);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-07-catering.png' });

  // Contact
  await page.evaluate(() => {
    const c = document.getElementById('contact');
    window.scrollTo({ top: c ? c.offsetTop - 100 : 6000 });
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-08-contact.png' });

  // Final
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await page.waitForTimeout(500);
  const finalSW = await page.evaluate(() => document.body.scrollWidth);
  console.log('10. Final scrollWidth:', finalSW, 'innerWidth:', innerWidth, '→', finalSW > innerWidth + 2 ? 'PROBLEM' : 'OK');
  await page.screenshot({ path: 'C:/Users/brand/kmbbq/ss-09-footer.png' });

  await browser.close();
  console.log('Done. Screenshots in C:/Users/brand/kmbbq/ss-*.png');
})();
