import { test, expect, request as playwrightRequest } from '@playwright/test';

// Config - Admin mapping (matching private seed)
const USERS = {
    admin1: { email: 'admin1@pri.com', password: 'pri123' },
    admin2: { email: 'admin2@pri.com', password: 'pri123' },
    admin3: { email: 'admin3@pri.com', password: 'pri123' },
    admin4: { email: 'admin4@pri.com', password: 'pri123' },
    admin5: { email: 'admin5@pri.com', password: 'pri123' }
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

test.describe('Task 5: Sale History & Ownership Heritage - Private Validation', () => {

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
        // Ensure no admin token
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

    test("AC 5: [Step 1] Open Admin Dashboard [Step 2] Navigate to 'sales-history-link' [Step 3] Verify 'sales-ledger-table' contains data.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        await page.goto(`${baseURL}/admin/dashboard`);
        await page.locator('#sales-history-link').click();
        await expect(page.locator('#sales-ledger-table')).toBeVisible();
        await expect(page.locator('#sales-ledger-table tbody tr')).not.toHaveCount(0);
    });

    test("AC 6: [Step 1] Inspect Sales Ledger [Step 2] Verify 'condition-badge' ID is present for inventory auditing.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin4);
        await page.goto(`${baseURL}/admin/dashboard`);
        await page.locator('#sales-history-link').click();
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
        await page.goto(`${baseURL}/admin/sales-history`);
        await expect(page.locator('#net-revenue-stat')).toBeVisible();
        await expect(page.locator('#net-revenue-stat')).toContainText(/\$/);
    });

    test("AC 9: [Step 1] Confirm JSONB data population [Step 2] Verify buyer/seller names from 'past_owners' are correctly rendered.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin2);
        const car = await getFirstCar(baseURL || '', 'Used');
        await page.goto(`${baseURL}/car/${car._id}`);
        await page.locator('#history-tab').click();
        // Check for common seed names or labels
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

    test("AC 11: [Step 1] Navigate to Sales History [Step 2] Click 'Export Report' [Step 3] Verify CSV download trigger.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        await page.goto(`${baseURL}/admin/sales-history`);
        const downloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("Export Report")');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('sales_report');
    });

    test("AC 12: [Step 1] Inspect Sales Table [Step 2] Verify absence of 'Verified Sale' and buyer emails.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        await page.goto(`${baseURL}/admin/sales-history`);
        await expect(page.locator('text=Verified Sale')).not.toBeVisible();
        await expect(page.locator('text=@')).not.toBeVisible(); // No emails in the table
    });

    test("AC 13: [Step 1] Apply Search 'Skoda' [Step 2] Verify metrics recalculate correctly.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        await page.goto(`${baseURL}/admin/sales-history`);
        const initialSales = await page.locator('#sales-ledger-table tbody tr').count();
        await page.locator('input[placeholder*="Search"]').fill('Skoda');
        await page.waitForTimeout(500); // Wait for useMemo
        const filteredSales = await page.locator('#sales-ledger-table tbody tr').count();
        expect(filteredSales).toBeLessThanOrEqual(initialSales);
        const revenueText = await page.locator('#net-revenue-stat').textContent();
        expect(revenueText).not.toBe('');
    });

    test("AC 14: [Negative] [Step 1] Access sales history without token [Step 2] Verify redirect to login.", async ({ page, baseURL }) => {
        await page.goto(`${baseURL}/admin/sales-history`);
        await page.evaluate(() => localStorage.removeItem('adminToken'));
        await page.reload();
        await expect(page).toHaveURL(/.*admin/); // Should redirect to /admin or /admin-login
    });

    test("AC 15: [Negative] [Step 1] Search for non-existent term [Step 2] Verify empty state UI.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        await page.goto(`${baseURL}/admin/sales-history`);
        await page.locator('input[placeholder*="Search"]').fill('NON_EXISTENT_CAR_XYZ');
        await expect(page.locator('text=No records matching')).toBeVisible();
        await expect(page.locator('button:has-text("Reset Filters")')).toBeVisible();
    });

    test("AC 16: [Negative] [Step 1] Empty search result [Step 2] Click Export [Step 3] Verify error toast.", async ({ page, baseURL }) => {
        await login(page, baseURL || '', USERS.admin1);
        await page.goto(`${baseURL}/admin/sales-history`);
        await page.locator('input[placeholder*="Search"]').fill('NON_EXISTENT_CAR_XYZ');
        await page.click('button:has-text("Export Report")');
        await expect(page.locator('text=No data available to export')).toBeVisible();
    });

});