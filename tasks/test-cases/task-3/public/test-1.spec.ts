import { test, expect } from '@playwright/test';

test('should allow user to browse cars', async ({ page }) => {
    await page.goto('http://localhost');
    await expect(page.locator('h1')).toBeVisible();
});
