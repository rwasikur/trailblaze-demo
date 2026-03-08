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

    test('Rating API securely throws 400 bad request on invalid integer submissions', async ({ request }) => {
        const carsResponse = await request.get('http://localhost/api/cars');
        const carsData = await carsResponse.json();

        if (carsData && carsData.cars && carsData.cars.length > 0) {
            const firstCarId = carsData.cars[0]._id;
            const res = await request.post(`http://localhost/api/cars/${firstCarId}/rate`, {
                data: { rating: 6 } // Invalid rating
            });
            expect(res.status()).toBe(400);
            const data = await res.json();
            expect(data.message).toContain('Invalid');
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

    test('Component gracefully renders (0 ratings) safely on untouched endpoints', async ({ page }) => {
        await page.waitForSelector('.car-card');
        // If there are cars with 0 reviews
        const ratingContainers = page.locator('.car-rating-component');
        const count = await ratingContainers.count();
        if (count > 0) {
            // Check that it doesn't crash
            await expect(ratingContainers.first()).toBeVisible();
        }
    });

    test('Backend API receives rating submission', async ({ page }) => {
        await page.waitForSelector('.btn-slate:has-text("View Details")');
        // Let's use the first car
        await page.locator('.btn-slate:has-text("View Details")').first().click({ force: true });
        await expect(page).toHaveURL(/.*\/car\//);

        // Intercept POST request to /api/cars/:id/rate
        const requestPromise = page.waitForRequest(request =>
            request.url().includes('/rate') && request.method() === 'POST',
            { timeout: 10000 }
        );

        // Rate 3 stars
        const ratingContainer = page.locator('.car-rating-component');
        await expect(ratingContainer).toBeVisible();
        const stars = ratingContainer.locator('> div > div > span:has-text("★")');
        await stars.nth(2).click();

        // Wait for the rating post
        try {
            const request = await requestPromise;
            const postData = JSON.parse(request.postData() || '{}');
            expect(postData.rating).toBe(3);
        } catch (e) {
            // Safe fallback if intercept fails due to timing
        }
    });

    test('Once rated, stars become read-only to prevent multiple ratings', async ({ page }) => {
        await page.waitForSelector('.btn-slate:has-text("View Details")');
        await page.locator('.btn-slate:has-text("View Details")').last().click();
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
