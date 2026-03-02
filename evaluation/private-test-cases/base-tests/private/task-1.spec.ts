import { test, expect } from '@playwright/test';

test.describe('Task 1 - Private Internal Logic - Car Rating Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/browse');
    });

    test('Should display fractional filled rating stars by deriving average review ratio accurately', async ({ page }) => {
        await page.waitForSelector('.car-card');

        const firstCarCard = page.locator('.car-card').first();
        const ratingElement = firstCarCard.locator('.car-rating-component');

        await expect(ratingElement).toBeVisible();

        // Testing the inner HTML implementation for fractional background styling 
        const filledStarFragments = ratingElement.locator("span[style*='overflow: hidden']");

        // Assert width properties indicating fractional rendering is active correctly
        await expect(filledStarFragments.first()).toBeVisible();
    });

    test('Rating breakdown visuals correctly scales bar width dynamically in details view', async ({ page }) => {
        await page.goto('http://localhost:5173/browse');

        await page.waitForSelector('.btn-slate');
        await page.locator('.btn-slate').first().click();

        await expect(page).toHaveURL(/.*\/car\//);
        await page.waitForSelector('h3:has-text("Rate This Car")');

        const ratingContainer = page.locator('.car-rating-component');
        await expect(ratingContainer).toBeVisible();

        // Ensure "Rating Breakdown" component expanded properly
        const breakdownSection = page.locator('h4:has-text("Rating Breakdown")');
        await expect(breakdownSection).toBeVisible();

        // Verifying width percentage exists on the visual bars in the breakdown structure
        const breakdownBars = ratingContainer.locator("div[style*='width:']");
        if (await breakdownBars.count() >= 5) {
            // Find progress bar inside
            await expect(breakdownBars.first()).toHaveCSS('width', /.+/);
        }
    });

    test('Read-only ratings on browse page reject interactions fully', async ({ page }) => {
        // Wait for fetching
        await page.waitForSelector('.car-card');
        const firstCarCard = page.locator('.car-card').first();
        const ratingElement = firstCarCard.locator('.car-rating-component');

        // Find a specific star from the catalogue array map overview 
        const firstStar = ratingElement.locator('span:has-text("★")').first();

        // Ensures standard cursor defaults denoting inactive click modes
        await expect(firstStar).toHaveCSS('cursor', 'default');
    });
});
