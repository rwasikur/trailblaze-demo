import { test, expect } from '@playwright/test';

// TrailblazeAuto tests go here
test.describe('TrailblazeAuto Public UI Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Setup initial state
        await page.goto('http://localhost:5173/');
    });

    test('should load the homepage and check title', async ({ page }) => {
        await expect(page).toHaveTitle(/TrailblazeAuto - Premium Car Dealership/i);
    });
});
