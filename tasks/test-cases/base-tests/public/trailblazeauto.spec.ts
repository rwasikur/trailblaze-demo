import { test, expect } from '@playwright/test';

test.describe('TrailblazeAuto Public UI Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/');
        await page.evaluate(() => localStorage.clear());
    });

    test('should load the homepage and check title', async ({ page }) => {
        await expect(page).toHaveTitle(/TrailblazeAuto/i);
    });

    test('should navigate to catalogue and see cars', async ({ page }) => {
        await page.click('button:has-text("Explore Cars")');
        await expect(page).toHaveURL(/.*browse/);
        // Expect at least one seeded car card to render
        await expect(page.locator('.car-card').first()).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to car details', async ({ page }) => {
        await page.goto('http://localhost/browse');
        // Click on the first "View Details" button
        await page.locator('button:has-text("View Details")').first().click();
        await expect(page).toHaveURL(/.*car\/.*/);
        // Wait for the action button to appear
        await page.waitForSelector('button:has-text("Book Now"), button:has-text("Currently Unavailable")', { timeout: 10000 });

        // Check that Share button is removed
        await expect(page.locator('button:has-text("Share")')).toBeHidden();

        const buttonText = await page.locator('button').allTextContents();
        const hasBookingBtn = buttonText.some(t => t.includes('Book Now') || t.includes('Currently Unavailable'));
        expect(hasBookingBtn).toBeTruthy();
    });

    test('should submit a booking request (if Available)', async ({ page }) => {
        await page.goto('http://localhost/browse');
        await page.locator('button:has-text("View Details")').first().click();

        // Check if button is disabled ("Currently Unavailable") before filling
        const bookingButton = page.locator('button:has-text("Book Now")');
        if (await bookingButton.count() > 0 && await bookingButton.isVisible()) {
            await bookingButton.click();
            await expect(page.locator('text=Complete Booking')).toBeVisible();

            const inputs = page.locator('input');
            await inputs.nth(0).fill('Test User');
            await inputs.nth(1).fill('+1987654321');

            await page.click('button:has-text("Submit Request")');
            await expect(page.locator('text=Complete Booking')).toBeHidden({ timeout: 5000 });
        }
    });
});
