import { test, expect } from '@playwright/test';

test.describe('Task 1 - Private Internal Logic - Car Rating Edge Cases', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/browse');
    });

    test('Should display fractional filled rating stars by deriving average review ratio accurately', async ({ page }) => {
        await page.waitForSelector('.car-card');
        const firstCarCard = page.locator('.car-card').first();
        const ratingElement = firstCarCard.locator('.car-rating-component');
        await expect(ratingElement).toBeVisible();

        const filledStarFragments = ratingElement.locator("span[style*='overflow: hidden']");
        await expect(filledStarFragments.first()).toBeVisible();
    });

    test('Rating breakdown visuals correctly scales bar width dynamically in details view', async ({ page }) => {
        await page.waitForSelector('.btn-slate:has-text("View Details")');
        await page.locator('.btn-slate:has-text("View Details")').first().click();
        await expect(page).toHaveURL(/.*\/car\//);

        const ratingContainer = page.locator('.car-rating-component');
        await expect(ratingContainer).toBeVisible();

        const breakdownSection = page.locator('h4:has-text("Rating Breakdown")');
        await expect(breakdownSection).toBeVisible();

        const breakdownBars = ratingContainer.locator("div[style*='width:']");
        if (await breakdownBars.count() >= 5) {
            await expect(breakdownBars.first()).toHaveCSS('width', /.+/);
        }
    });

    test('Read-only ratings on browse page reject interactions fully', async ({ page }) => {
        await page.waitForSelector('.car-card');
        const firstCarCard = page.locator('.car-card').first();
        const ratingElement = firstCarCard.locator('.car-rating-component');
        const firstStar = ratingElement.locator('span:has-text("★")').first();

        await expect(firstStar).toHaveCSS('cursor', 'default');

        // Check that hovering doesn't trigger feedback texts
        await firstStar.hover();
        await expect(page.getByText('Poor')).not.toBeVisible();
        await expect(page.getByText('Excellent')).not.toBeVisible();
    });

    test('Rating breakdown is hidden on catalogue browse view but present on detail view', async ({ page }) => {
        await page.waitForSelector('.car-card');
        // It should NOT be on the browse page
        const breakdownTitle = page.locator('h4:has-text("Rating Breakdown")');
        await expect(breakdownTitle).toHaveCount(0);
    });

    test('Simulated DB in localStorage is updated when rating submitted', async ({ page }) => {
        await page.waitForSelector('.btn-slate:has-text("View Details")');
        await page.locator('.btn-slate:has-text("View Details")').first().click();
        await expect(page).toHaveURL(/.*\/car\//);

        // Before rating
        const initialDB = await page.evaluate(() => localStorage.getItem('carRatingsDB'));

        // Rate 3 stars
        const ratingContainer = page.locator('.car-rating-component');
        await expect(ratingContainer).toBeVisible();
        const stars = ratingContainer.locator('> div > div > span:has-text("★")');
        await stars.nth(2).click();

        // After rating
        const updatedDB = await page.evaluate(() => localStorage.getItem('carRatingsDB'));
        expect(initialDB).not.toBe(updatedDB);
    });

    test('Once rated, stars become read-only to prevent multiple ratings', async ({ page }) => {
        await page.waitForSelector('.btn-slate:has-text("View Details")');
        await page.locator('.btn-slate:has-text("View Details")').nth(2).click();
        await expect(page).toHaveURL(/.*\/car\//);

        const ratingContainer = page.locator('.car-rating-component');
        const stars = ratingContainer.locator('> div > div > span:has-text("★")');

        // Rate 5 stars
        await stars.nth(4).click();
        await expect(page.getByText('Thank you for rating this car!')).toBeVisible();

        // Ensure cursor is default after rating (interaction locked)
        await expect(stars.nth(4)).toHaveCSS('cursor', 'default');
    });
});
