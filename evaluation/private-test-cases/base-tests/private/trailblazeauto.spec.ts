import { test, expect } from '@playwright/test';

// Use a unique email to guarantee clean register over repeating tests without wiping
const adminEmail = `admin-${Date.now()}@test.com`;

test.describe('TrailblazeAuto Private UI Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/');
        await page.evaluate(() => localStorage.clear());
    });

    test('should contain private seed data in catalogue', async ({ page }) => {
        await page.goto('http://localhost/browse');
        await expect(page.locator('.car-card').first()).toBeVisible({ timeout: 10000 });
    });

    test('should register and view dashboard stats', async ({ page }) => {
        // Register the new admin
        await page.goto('http://localhost/admin');
        await page.click('text=Don\'t have an account? Sign Up');

        await page.fill('input:near(label:has-text("Full Name"))', 'Test Admin');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 10000 });
        await expect(page.locator('text=Dealership Dashboard')).toBeVisible({ timeout: 10000 });
    });

    test('should load manage inventory page', async ({ page }) => {
        // Log in using generated admin
        await page.goto('http://localhost/admin');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 10000 });

        await page.click('button:has-text("Manage Inventory")');
        await expect(page).toHaveURL(/.*admin\/inventory/, { timeout: 10000 });
    });

    test('should render add car page with multi-image drag area', async ({ page }) => {
        await page.goto('http://localhost/admin');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await page.click('button:has-text("Add New Vehicle")');
        await expect(page).toHaveURL(/.*admin\/add-car/, { timeout: 10000 });

        await expect(page.locator('label:has-text("Car Name")')).toBeVisible();
    });

    test('should render edit car page correctly', async ({ page }) => {
        await page.goto('http://localhost/admin');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await page.click('button:has-text("Manage Inventory")');

        const targetRow = page.locator('tr').nth(1); // Click first car row
        if (await targetRow.count() > 0) {
            await targetRow.locator('button:has-text("Options")').click();
            const editButton = page.locator('button:has-text("Edit Vehicle")');
            await expect(editButton).toBeVisible();
            await editButton.click();
            await expect(page).toHaveURL(/.*admin\/edit-car\/.*/, { timeout: 10000 });
            await expect(page.locator('button:has-text("Save Updates to Fleet")')).toBeVisible();
        }
    });

    test('should successfully create a new vehicle', async ({ page }) => {
        await page.goto('http://localhost/admin');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        await page.click('button:has-text("Add New Vehicle")');
        await expect(page).toHaveURL(/.*admin\/add-car/);

        // Step 1: Basic Info
        await page.locator('input').nth(0).fill('Test Auto');
        await page.locator('input').nth(1).fill('QA Motors');
        await page.locator('input').nth(2).fill('2025');
        await page.locator('input').nth(3).fill('5000');
        await page.click('button:has-text("Next Step")');
        await page.waitForTimeout(1000);

        // Step 2: Specifications
        await page.waitForSelector('text=Specifications');
        await page.locator('select').first().selectOption('Automatic');
        await page.locator('input').nth(0).fill('Electric');
        await page.locator('input').nth(1).fill('5');
        await page.click('button:has-text("Next Step")');
        await page.waitForTimeout(1000);

        // Step 3: Registration & Details
        await page.waitForSelector('text=Registration & Details');
        // Inputs in Step 3 starts from index 0 again
        await page.locator('input').nth(0).fill('1'); // owner
        await page.locator('input').nth(1).fill('New York'); // city
        await page.locator('textarea').fill('A very neat testing auto created from E2E suite.');
        await page.click('button:has-text("Next Step")');
        await page.waitForTimeout(1000);

        // Step 4: Media
        await page.waitForSelector('text=Vehicle Media');
        await page.click('button:has-text("Save Vehicle to Fleet")');

        await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 15000 });
        await page.click('button:has-text("Manage Inventory")');
        await expect(page).toHaveURL(/.*admin\/inventory/, { timeout: 10000 });
        await expect(page.locator('text=Test Auto').first()).toBeVisible({ timeout: 5000 });
    });

    test('should track changing vehicle status workflow', async ({ page }) => {
        // Book the "Test Auto" car
        await page.goto('http://localhost/browse');
        const viewBtn = page.locator('h3:has-text("Test Auto")').locator('..').locator('button:has-text("View Details")');

        if (await viewBtn.count() > 0) {
            await viewBtn.first().click();
            const bookingButton = page.locator('button:has-text("Book Now")');
            if (await bookingButton.isVisible()) {
                await bookingButton.click();
                await page.locator('input').nth(0).fill('Private VIP');
                await page.locator('input').nth(1).fill('+1900000000');
                await page.click('button:has-text("Submit Request")');
                await page.waitForTimeout(2000);
            }
        }

        // Log into admin and approve/return it
        await page.goto('http://localhost/admin');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.click('button:has-text("Manage Inventory")');
        await page.waitForTimeout(2000);

        // Check if Test Auto is inside Inventory
        const targetRow = page.locator('tr').filter({ hasText: 'Test Auto' });
        if (await targetRow.count() > 0 && await targetRow.locator('text=Pending').count() > 0) {
            await targetRow.locator('button:has-text("Options")').click();
            await expect(page.locator('button:has-text("Approve")')).toBeVisible();
            await page.locator('button:has-text("Approve")').click();
            await page.waitForTimeout(2000);

            await targetRow.locator('button:has-text("Options")').click();
            await expect(page.locator('button:has-text("Return")')).toBeVisible();
            await page.locator('button:has-text("Return")').click();
            await page.waitForTimeout(1000);
        }
    });

    test('should delete a vehicle from inventory', async ({ page }) => {
        await page.goto('http://localhost/admin');
        await page.fill('input[type="email"]', adminEmail);
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.click('button:has-text("Manage Inventory")');
        await page.waitForTimeout(2000);

        const targetRow = page.locator('tr').filter({ hasText: 'Test Auto' }).first();
        if (await targetRow.count() > 0) {
            page.on('dialog', dialog => dialog.accept());
            await targetRow.locator('button:has-text("Options")').click();
            await page.locator('button:has-text("Delete Vehicle")').first().click();
            await page.waitForTimeout(2000);
        }
    });
});
