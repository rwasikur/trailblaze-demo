import { test, expect } from '@playwright/test';

test.describe('Task 1 - Public Logic Tests - Car Rating System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/browse');
    });

    test('Display star rating elements on the catalogue page naturally beside the title', async ({ page }) => {
        await page.waitForSelector('.car-card');
        const firstCarCard = page.locator('.car-card').first();
        const ratingElement = firstCarCard.locator('.car-rating-component');
        await expect(ratingElement).toBeVisible();
        await expect(ratingElement).toContainText('ratings');
        expect(await ratingElement.locator('span:has-text("★")').count()).toBeGreaterThanOrEqual(5);
    });

    test('Navigate to car details and perform an active 5-star rating interaction', async ({ page }) => {
        await page.waitForSelector('.btn-slate:has-text("View Details")');
        await page.locator('.btn-slate:has-text("View Details")').first().click();
        await expect(page).toHaveURL(/.*\/car\//);

        const ratingContainer = page.locator('.car-rating-component');
        await expect(ratingContainer).toBeVisible();

        const stars = ratingContainer.locator('> div > div > span:has-text("★")');
        if (await stars.count() >= 5) {
            await stars.nth(4).click();
            await expect(page.getByText('Excellent')).toBeVisible();
            await expect(page.getByText('Thank you for rating this car!')).toBeVisible();
        }
    });

    test('Perform a 1-star rating interaction and verify feedback', async ({ page }) => {
        await page.waitForSelector('.btn-slate:has-text("View Details")');
        // Click the second car to ensure clean state
        await page.locator('.btn-slate:has-text("View Details")').nth(1).click();
        await expect(page).toHaveURL(/.*\/car\//);

        const ratingContainer = page.locator('.car-rating-component');
        await expect(ratingContainer).toBeVisible();

        const stars = ratingContainer.locator('> div > div > span:has-text("★")');
        if (await stars.count() >= 5) {
            await stars.nth(0).click(); // 1st star
            await expect(page.getByText('Poor')).toBeVisible();
            await expect(page.getByText('Thank you for rating this car!')).toBeVisible();
        }
    });

    test('Verify hover states on the rating stars before clicking', async ({ page }) => {
        await page.waitForSelector('.btn-slate:has-text("View Details")');
        await page.locator('.btn-slate:has-text("View Details")').first().click();
        await expect(page).toHaveURL(/.*\/car\//);

        const ratingContainer = page.locator('.car-rating-component');
        await expect(ratingContainer).toBeVisible();

        const stars = ratingContainer.locator('> div > div > span:has-text("★")');
        if (await stars.count() >= 5) {
            // Hover 3rd star
            await stars.nth(2).hover();
            await expect(page.getByText('Good')).toBeVisible();

            // Hover 2nd star
            await stars.nth(1).hover();
            await expect(page.getByText('Fair')).toBeVisible();

            // Hover 4th star
            await stars.nth(3).hover();
            await expect(page.getByText('Very Good')).toBeVisible();
        }
    });

    test('Validate that API response structure formats ratings adequately', async ({ page, request }) => {
        // Testing backend integration fetching ratings directly
        const carsResponse = await request.get('http://localhost/api/cars');
        const carsData = await carsResponse.json();

        if (carsData && carsData.cars && carsData.cars.length > 0) {
            const firstCarId = carsData.cars[0]._id;
            const res = await request.get(`http://localhost/api/cars/${firstCarId}/ratings`);
            expect(res.ok()).toBeTruthy();
            const data = await res.json();
            expect(data).toHaveProperty('rating_count');
            expect(data).toHaveProperty('rating_sum');
        }
    });

});
