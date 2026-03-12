import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport to a wide screen
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Navigating to Browse Page...');
  await page.goto('http://localhost:80/browse');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'browse_fix.png', fullPage: true });

  await browser.close();
  console.log('Screenshot captured successfully!');
})();
