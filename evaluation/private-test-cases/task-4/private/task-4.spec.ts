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
    admin: { email: 'admin@test.com', password: 'password123' },
    admin1: { email: 'admin1@pri.com', password: 'pri123' },
    admin2: { email: 'admin2@pri.com', password: 'pri123' },
    admin3: { email: 'admin3@pri.com', password: 'pri123' },
    admin4: { email: 'admin4@pri.com', password: 'pri123' },
    admin5: { email: 'admin5@pri.com', password: 'pri123' }
};

async function login(page: any, baseURL: string, user = USERS.admin) {
    await page.goto(`${baseURL}/admin`, { waitUntil: 'networkidle' });
    await page.locator('#admin-email-input').fill(user.email);
    await page.locator('#admin-password-input').fill(user.password);
    await page.locator('#admin-login-button').click();
    try {
        await page.waitForURL(/dashboard/, { timeout: 8000 });
    } catch (e) {
        // Fallback for local environments where specific test admins might not be seeded
        await page.locator('#admin-email-input').fill(USERS.admin.email);
        await page.locator('#admin-password-input').fill(USERS.admin.password);
        await page.locator('#admin-login-button').click();
        await page.waitForURL(/dashboard/, { timeout: 15000 });
    }
}


test.describe('Task 4: Recently Viewed - Private Validation Suite', () => {

    test.beforeEach(async ({ page, baseURL }) => {
        await page.goto(`${baseURL || ''}/`);
        await page.evaluate(() => localStorage.clear());
    });

    /**
     * VISITOR FLOW
     * Validates unauthenticated tracking history and UI reflection.
     */
    test('Visitor Role Flow: Tracking and Filtering', async ({ page, baseURL }) => {
        const allCars = await getCars(baseURL || '');
        const availableCars = allCars.filter((c: any) => c.availability_status === 'Available');
        const targetCar = availableCars[0] || allCars[0];

        // Step 1: Open /browse (Catalogue Page)
        await page.goto(`${baseURL || ''}/browse`);

        // Step 2: Verify visibility of 'Recent' filter button
        const recentButton = page.getByRole('button', { name: /^Recent$/i });
        await expect(recentButton).toBeVisible();

        // Step 3: Click on 'Recent' (verify empty state)
        await recentButton.click();
        await expect(page.getByText(/No matches found/i)).toBeVisible();

        // Step 4: Visit any car model details page
        await page.goto(`${baseURL || ''}/car/${targetCar._id}`);
        await page.waitForTimeout(500);

        // Step 5: Get back to browse and activate 'Recent' filter
        await page.goto(`${baseURL || ''}/browse`);
        await page.getByRole('button', { name: /^Recent$/i }).click();

        // Step 6: Verify visited car model is reflecting properly
        const carCard = page.locator(`article[id="car-card-${targetCar._id}"]`);
        await expect(carCard).toBeVisible();
        await expect(carCard).toContainText(targetCar.name);
    });

    /**
     * ADMIN FLOW
     * Validates authenticated tracking history and feature parity.
     */
    test('Admin Role Flow: Tracking and Filtering', async ({ page, baseURL }) => {
        const allCars = await getCars(baseURL || '');
        const availableCars = allCars.filter((c: any) => c.availability_status === 'Available');
        const targetCar = availableCars[1] || allCars[1];

        // Step 1: Login flow and access verification
        await login(page, baseURL || '', USERS.admin1);

        // Step 2: Open /browse (Catalogue Page)
        await page.goto(`${baseURL || ''}/browse`);

        // Step 3: Verify visibility of 'Recent' filter button
        const recentButton = page.getByRole('button', { name: /^Recent$/i });
        await expect(recentButton).toBeVisible();

        // Step 4: Visit any car model details page
        await page.goto(`${baseURL || ''}/car/${targetCar._id}`);
        await page.waitForTimeout(500);

        // Step 5: Get back to browse and activate 'Recent' filter
        await page.goto(`${baseURL || ''}/browse`);
        await page.getByRole('button', { name: /^Recent$/i }).click();

        // Step 6: Verify visited car model is reflecting properly
        const carCard = page.locator(`article[id="car-card-${targetCar._id}"]`);
        await expect(carCard).toBeVisible();
        await expect(carCard).toContainText(targetCar.name);
    });

    test('Filter Persistence: Default State on Clean Navigation', async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin2);
        await page.goto(`${baseURL || ''}/browse`);
        const allFilter = page.getByRole('button', { name: /^All$/i }).nth(1);
        await expect(allFilter).toHaveClass(/bg-white text-slate-900/);
    });

    test('Inventory Restoration: Toggle back to All Collection', async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin3);
        await page.goto(`${baseURL || ''}/browse`);
        await page.getByRole('button', { name: /^Recent$/i }).click();
        await page.getByRole('button', { name: /^All$/i }).nth(1).click();
        const cards = page.locator('article[id^="car-card-"]');
        expect(await cards.count()).toBeGreaterThan(1);
    });

    test('Tracking Logic: Deduplication and Recency Prepending', async ({ page, baseURL }) => {
        const cars = await getCars(baseURL || '');
        await login(page, baseURL || '', USERS.admin4);
        await page.goto(`${baseURL || ''}/car/${cars[0]._id}`);
        await page.goto(`${baseURL || ''}/car/${cars[1]._id}`);
        await page.goto(`${baseURL || ''}/car/${cars[0]._id}`);
        const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('recentCars') || '[]'));
        expect(recent[0]).toBe(cars[0]._id);
        expect(recent.length).toBe(2);
    });

    test('Tracking Logic: Strict 5-Item Limit Enforcement', async ({ page, baseURL }) => {
        const cars = await getCars(baseURL || '');
        await login(page, baseURL || '', USERS.admin5);
        for (let i = 0; i < 6; i++) {
            await page.goto(`${baseURL || ''}/car/${cars[i]._id}`);
            await page.waitForTimeout(100);
        }
        const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('recentCars') || '[]'));
        expect(recent.length).toBe(5);
        expect(recent).not.toContain(cars[0]._id);
    });

    test('Resilience: Handling of Corrupted localStorage Data', async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin);
        await page.goto(`${baseURL || ''}/browse`);
        await page.evaluate(() => {
            localStorage.setItem('recentCars', '{broken:');
            window.dispatchEvent(new Event('recentCarsUpdated'));
        });
        await page.getByRole('button', { name: /^Recent$/i }).click();
        await expect(page.getByText(/No matches found/i)).toBeVisible();
    });

    test('Resilience: Silent Suppression of Non-Existent Car IDs', async ({ page, baseURL }) => {
        const allCars = await getCars(baseURL || '');
        const availableCars = allCars.filter((c: any) => c.availability_status === 'Available');
        const targetCar = availableCars[0] || allCars[0];
        await page.evaluate((id) => {
            localStorage.setItem('recentCars', JSON.stringify(['ghost-id', id]));
            window.dispatchEvent(new Event('recentCarsUpdated'));
        }, targetCar._id);
        await page.goto(`${baseURL || ''}/browse`);
        await page.getByRole('button', { name: /^Recent$/i }).click();
        const cards = page.locator('article[id^="car-card-"]');
        await expect(cards).toHaveCount(1);
        await expect(cards).toContainText(targetCar.name);
    });

    test('Empty State: Displaying No Matches Found for New History', async ({ page, baseURL }) => {
        await page.goto(`${baseURL || ''}/browse`);
        await page.evaluate(() => {
            localStorage.removeItem('recentCars');
            window.dispatchEvent(new Event('recentCarsUpdated'));
        });
        await page.getByRole('button', { name: /^Recent$/i }).click();
        await expect(page.getByText(/No matches found/i)).toBeVisible();
    });

    test('Security: Automatic Reset of Maliciously Expanded Data', async ({ page, baseURL }) => {
        const cars = await getCars(baseURL || '');
        const bigList = cars.slice(0, 10).map((c: any) => c._id);
        await page.goto(`${baseURL || ''}/`);
        await page.evaluate((ids) => localStorage.setItem('recentCars', JSON.stringify(ids)), bigList);
        await page.goto(`${baseURL || ''}/car/${cars[10]._id}`);
        await page.waitForTimeout(500);
        const recent = await page.evaluate(() => JSON.parse(localStorage.getItem('recentCars') || '[]'));
        expect(recent.length).toBe(5);
        expect(recent[0]).toBe(cars[10]._id);
    });

});
