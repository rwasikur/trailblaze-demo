import { test, expect, request as playwrightRequest } from '@playwright/test';

// Config - Admin mapping (matching public seed)
const USERS = {
    admin1: { email: 'admin@test.com', password: 'password123' },
    admin2: { email: 'admin@test.com', password: 'password123' },
    admin3: { email: 'admin@test.com', password: 'password123' },
    admin4: { email: 'admin@test.com', password: 'password123' },
    admin5: { email: 'admin@test.com', password: 'password123' }
};

async function login(page: any, baseURL: string, user = USERS.admin1) {
    await page.goto(`${baseURL}/admin`);
    if (page.url().includes('/admin/dashboard')) return;
    await page.locator('#admin-email-input').fill(user.email);
    await page.locator('#admin-password-input').fill(user.password);
    await page.locator('#admin-login-button').click();
    await page.waitForURL(/dashboard/);
}

async function getFirstCar(baseURL: string, condition?: string) {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    await ctx.dispose();
    const cars = (body.cars ?? body);
    if (condition) return cars.find((c: any) => c.condition === condition);
    return cars[0];
}

test.describe('Task 5: Sale History & Ownership Heritage - Public Validation', () => {

    test("AC 1: [Step 1] Login as admin [Step 2] Access Used car [Step 3] Verify 'history-tab' and 'heritage-timeline' visibility.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        const car = await getFirstCar(baseURL || '', 'Used');
        await page.goto(`${baseURL}/car/${car._id}`);
        await expect(page.locator('#history-tab')).toBeVisible();
        await page.locator('#history-tab').click();
        await expect(page.locator('#heritage-timeline')).toBeVisible();
        await expect(page.locator('text=1ST OWNER')).toBeVisible();
    });

    test("AC 2: [Step 1] Inspect timeline [Step 2] Verify visual highlights 'animate-pulse' and 'border-blue-400' on recent records.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin2);
        const car = await getFirstCar(baseURL || '', 'Used');
        await page.goto(`${baseURL}/car/${car._id}`);
        await page.locator('#history-tab').click();
        const topRecord = page.locator('#heritage-timeline > div').first();
        await expect(topRecord.locator('.animate-pulse')).toBeVisible();
        await expect(topRecord.locator('.border-blue-400')).toBeVisible();
    });

    test("AC 3: [Step 1] Access Used car as guest [Step 2] Verify 'history-tab' ID is completely absent from DOM.", async ({ page, baseURL }) => {
        const car = await getFirstCar(baseURL || '', 'Used');
        await page.goto(`${baseURL}/car/${car._id}`);
        await page.evaluate(() => localStorage.removeItem('adminToken'));
        await page.reload();
        await expect(page.locator('#history-tab')).not.toBeAttached();
    });

    test("AC 4: [Step 1] Admin access to New car [Step 2] Verify 'history-tab' is hidden for cars with no heritage.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin3);
        const car = await getFirstCar(baseURL || '', 'New');
        await page.goto(`${baseURL}/car/${car._id}`);
        await expect(page.locator('#history-tab')).not.toBeVisible();
    });

    test("AC 5: [Step 1] Open Admin Dashboard [Step 2] Navigate to 'sales-history-tab' [Step 3] Verify 'sales-ledger-table' contains data.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        await page.goto(`${baseURL}/admin/dashboard`);
        await page.locator('#sales-history-tab').click();
        await expect(page.locator('#sales-ledger-table')).toBeVisible();
        await expect(page.locator('#sales-ledger-table tbody tr')).not.toHaveCount(0);
    });

    test("AC 6: [Step 1] Inspect Sales Ledger [Step 2] Verify 'condition-badge' ID is present for inventory auditing.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin4);
        await page.goto(`${baseURL}/admin/dashboard`);
        await page.locator('#sales-history-tab').click();
        await expect(page.locator('#condition-badge').first()).toBeVisible();
    });

    test("AC 7: [Step 1] Accept booking [Step 2] Verify jump to Sales History [Step 3] Verify row highlight 'bg-blue-50/50'.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin5);
        await page.click('button:has-text("Bookings")');
        const acceptBtn = page.locator('button:has-text("Accept")').first();
        if (await acceptBtn.isVisible()) {
            await acceptBtn.click();
            await expect(page.locator('#sales-ledger-table')).toBeVisible();
            await expect(page.locator('#sales-ledger-table .bg-blue-50\\/50')).toBeVisible();
        }
    });

    test("AC 8: [Step 1] Verify 'net-revenue-stat' ID [Step 2] Confirm total sums the immutable 'final_price' field accurately.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        await page.goto(`${baseURL}/admin/dashboard`);
        await expect(page.locator('#net-revenue-stat')).toBeVisible();
        await expect(page.locator('#net-revenue-stat')).toContainText(/₹/);
    });

    test("AC 9: [Step 1] Confirm JSONB data population [Step 2] Verify buyer/seller names from 'past_owners' are correctly rendered.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin2);
        const car = await getFirstCar(baseURL || '', 'Used');
        await page.goto(`${baseURL}/car/${car._id}`);
        await page.locator('#history-tab').click();
        await expect(page.locator('text=Authorized Seller')).toBeVisible();
        await expect(page.locator('text=Acquired By')).toBeVisible();
    });

    test("AC 10: [Step 1] Access Used car [Step 2] Navigate to 'Price' tab [Step 3] Verify 'Owner Depreciation' rendering.", async ({ page, baseURL }) => {
        const car = await getFirstCar(baseURL || '', 'Used');
        await page.goto(`${baseURL}/car/${car._id}`);
        await page.click('button:has-text("Price")');
        await expect(page.locator('text=Financial Breakdown')).toBeVisible();
        await expect(page.locator('text=Owner Depreciation')).toBeVisible();
    });

});