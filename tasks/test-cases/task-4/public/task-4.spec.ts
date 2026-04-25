import { test, expect, request as playwrightRequest } from '@playwright/test';

// Helpers (Same style as base test cases)
async function getCars(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    await ctx.dispose();
    return body.cars || body;
}

const USERS = {
    admin: { email: 'admin@test.com', password: 'password123' }
};

async function login(page: any, baseURL: string, user = USERS.admin) {
    await page.goto(`${baseURL}/admin`, { waitUntil: 'networkidle' });
    await page.locator('#admin-email-input').fill(user.email);
    await page.locator('#admin-password-input').fill(user.password);
    await page.locator('#admin-login-button').click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });
}

// Robust URL resolution for environments where baseURL is not properly configured
const resolveURL = (baseURL: string | undefined) => {
    if (!baseURL || baseURL === 'http://localhost' || baseURL === '') {
        return 'http://localhost:5173';
    }
    return baseURL;
};

test.describe('Task 4: Recently Viewed - Comprehensive Validation', () => {

    test.beforeEach(async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        await page.goto(`${url}/`);
        await page.evaluate(() => localStorage.clear());
    });

    /**
     * VISITOR FLOW
     * Validates that unauthenticated visitors can track history and filter the gallery.
     */
    test('Visitor Role Flow: Tracking and Filtering', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        const cars = await getCars(url);
        const targetCar = cars[0];

        // Step 1: Open /browse
        await page.goto(`${url}/browse`);

        // Step 2: Verify visibility of 'Recent' button
        const recentButton = page.getByRole('button', { name: /^Recent$/i });
        await expect(recentButton).toBeVisible();

        // Step 3: Visit car model
        await page.goto(`${url}/car/${targetCar._id}`);
        await page.waitForTimeout(500);

        // Step 4: Back to browse and click 'Recent'
        await page.goto(`${url}/browse`);
        await page.getByRole('button', { name: /^Recent$/i }).click();

        // Step 5: Verify reflecting properly
        const carCard = page.locator(`article[id="car-card-${targetCar._id}"]`);
        await expect(carCard).toBeVisible();
        await expect(carCard).toContainText(targetCar.name);
    });

    /**
     * ADMIN FLOW
     * Validates that authenticated admins have parity in feature access.
     */
    test('Admin Role Flow: Tracking and Filtering', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        const cars = await getCars(url);
        const targetCar = cars[1];

        // Step 1: Login flow
        await login(page, url);

        // Step 2: Open /browse and verify 'Recent' visibility
        await page.goto(`${url}/browse`);
        await expect(page.getByRole('button', { name: /^Recent$/i })).toBeVisible();

        // Step 3: Visit car model
        await page.goto(`${url}/car/${targetCar._id}`);
        await page.waitForTimeout(500);

        // Step 4: Back to browse and click 'Recent'
        await page.goto(`${url}/browse`);
        await page.getByRole('button', { name: /^Recent$/i }).click();

        // Step 5: Verify reflecting properly
        const carCard = page.locator(`article[id="car-card-${targetCar._id}"]`);
        await expect(carCard).toBeVisible();
        await expect(carCard).toContainText(targetCar.name);
    });

    test('Filter Persistence: Default State on Clean Navigation', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        await page.goto(`${url}/browse`);
        const allFilter = page.getByRole('button', { name: /^All$/i });
        await expect(allFilter).toHaveClass(/bg-white text-slate-900/);
    });

    test('Inventory Restoration: Toggle back to All Collection', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        await page.goto(`${url}/browse`);
        await page.getByRole('button', { name: /^Recent$/i }).click();
        await page.getByRole('button', { name: /^All$/i }).click();
        const cards = page.locator('article[id^="car-card-"]');
        expect(await cards.count()).toBeGreaterThan(1);
    });

    test('Tracking Logic: Deduplication and Recency Prepending', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        const cars = await getCars(url);
        await page.goto(`${url}/car/${cars[0]._id}`);
        await page.goto(`${url}/car/${cars[1]._id}`);
        await page.goto(`${url}/car/${cars[0]._id}`); // Revisit

        const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('recentCars') || '[]'));
        expect(recent[0]).toBe(cars[0]._id);
        expect(recent.length).toBe(2);
    });

    test('Tracking Logic: Strict 5-Item Limit Enforcement', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        const cars = await getCars(url);
        for (let i = 0; i < 6; i++) {
            await page.goto(`${url}/car/${cars[i]._id}`);
            await page.waitForTimeout(100);
        }
        const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('recentCars') || '[]'));
        expect(recent.length).toBe(5);
        expect(recent).not.toContain(cars[0]._id); // Oldest evicted
    });

    test('Resilience: Handling of Corrupted localStorage Data', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        await page.goto(`${url}/browse`);
        await page.evaluate(() => {
            localStorage.setItem('recentCars', '{broken:');
            window.dispatchEvent(new Event('recentCarsUpdated'));
        });
        await page.getByRole('button', { name: /^Recent$/i }).click();
        await expect(page.getByText(/No matches found/i)).toBeVisible();
    });

    test('Resilience: Silent Suppression of Non-Existent Car IDs', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        const cars = await getCars(url);
        await page.evaluate((id) => {
            localStorage.setItem('recentCars', JSON.stringify(['ghost-id', id]));
            window.dispatchEvent(new Event('recentCarsUpdated'));
        }, cars[0]._id);
        await page.goto(`${url}/browse`);
        await page.getByRole('button', { name: /^Recent$/i }).click();
        const cards = page.locator('article[id^="car-card-"]');
        await expect(cards).toHaveCount(1);
        await expect(cards).toContainText(cars[0].name);
    });

    test('Empty State: Displaying No Matches Found for New History', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        await page.goto(`${url}/browse`);
        await page.evaluate(() => {
            localStorage.removeItem('recentCars');
            window.dispatchEvent(new Event('recentCarsUpdated'));
        });
        await page.getByRole('button', { name: /^Recent$/i }).click();
        await expect(page.getByText(/No matches found/i)).toBeVisible();
    });

    test('Security: Automatic Reset of Maliciously Expanded Data', async ({ page, baseURL }) => {
        const url = resolveURL(baseURL);
        const cars = await getCars(url);
        const bigList = cars.slice(0, 10).map((c: any) => c._id);
        await page.goto(`${url}/`);
        await page.evaluate((ids) => localStorage.setItem('recentCars', JSON.stringify(ids)), bigList);

        await page.goto(`${url}/car/${cars[10]._id}`); // 11th visit
        await page.waitForTimeout(500);

        const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('recentCars') || '[]'));
        expect(recent.length).toBe(5);
        expect(recent[0]).toBe(cars[10]._id);
    });

});
