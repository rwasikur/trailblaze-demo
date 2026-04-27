const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('http://localhost:5173/admin');
    await page.locator('#admin-email-input').fill('admin1@pri.com');
    await page.locator('#admin-password-input').fill('pri123');
    await page.locator('#admin-login-button').click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log("LOGIN SUCCESS");
  } catch (err) {
    console.log("LOGIN FAILED:", err.message);
    const text = await page.content();
    if (text.includes('Invalid credentials')) console.log('Error: Invalid credentials');
    else console.log('Error not visible in page text');
  }
  await browser.close();
})();
