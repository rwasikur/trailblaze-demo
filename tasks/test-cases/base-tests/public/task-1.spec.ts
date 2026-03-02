import { test, expect } from '@playwright/test';

test.describe('Task 1 - Public Logic Tests - Car Rating System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/browse');
    });

    test('Display star rating elements on the catalogue page naturally beside the title', async ({ page }) => {
        // Wait for fetching to finish
        await page.waitForSelector('.car-card');

        const firstCarCard = page.locator('.car-card').first();

        // Expect car rating element to be mounted inside the card
        const ratingElement = firstCarCard.locator('.car-rating-component');
        await expect(ratingElement).toBeVisible();

        // Should have text for average reviews (since mock data gives default fake ratings)
        await expect(ratingElement).toContainText('reviews');

        // Verify 5 active stars display format
        expect(await ratingElement.locator('span:has-text("★")').count()).toBeGreaterThanOrEqual(5);
    });

    test('Navigate to car details and perform an active 5-star rating interaction', async ({ page }) => {
        // Find View Details button
        await page.waitForSelector('.btn-slate');
        await page.locator('.btn-slate').first().click();

        // Wait to open Car Details page
        await expect(page).toHaveURL(/.*\/car\//);

        // Ensure Breakdown text or title is present
        await expect(page.getByText(/Rate This Car/i)).toBeVisible();

        // Find standard hover rating triggers
        const ratingContainer = page.locator('.car-rating-component');
        await expect(ratingContainer).toBeVisible();

        // Click the 5th star
        const stars = ratingContainer.locator('> div > div > span:has-text("★")');
        if (await stars.count() >= 5) {
            await stars.nth(4).click();

            // Check feedback states
            await expect(page.getByText('Excellent')).toBeVisible();
            await expect(page.getByText('Thank you for rating this car!')).toBeVisible();
        }
    });

});
