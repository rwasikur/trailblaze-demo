import { test, expect } from '@playwright/test';

test.describe('Base Application Core Tests', () => {

    test('Admin registration with valid credentials creates new admin', async ({ page, baseURL }) => {

        const url = baseURL || 'http://localhost';
        await page.goto(`${url}/admin`);
        await page.waitForLoadState('networkidle');

        // Switch to signup (if exists)
        const signUpLink = page.locator('text=Sign Up');
        if (await signUpLink.count() > 0) {
            await signUpLink.first().click();
        }

        // Fill form
        const timestamp = Date.now();

        await page.locator('input[type="text"]').first().fill(`Admin ${timestamp}`);
        await page.locator('input[type="email"]').fill(`admin${timestamp}@test.com`);
        await page.locator('input[type="password"]').first().fill('password123');

        await page.locator('button[type="submit"]').click();

        // Functional assertion: successful navigation
        await expect(page).toHaveURL(/dashboard/, { timeout: 7000 });
    });


    test('Admin login with invalid credentials shows error message', async ({ page, baseURL }) => {

        const url = baseURL || 'http://localhost';
        await page.goto(`${url}/admin`);
        await page.waitForLoadState('networkidle');

        await page.locator('input[type="email"]').fill('invalid@test.com');
        await page.locator('input[type="password"]').first().fill('wrongpass');

        await page.locator('button[type="submit"]').click();

        // Functional assertion: error must appear
        const error = page.locator('text=/invalid|incorrect|wrong/i');
        await expect(error.first()).toBeVisible({ timeout: 5000 });
    });


    test('Admin login validates email format', async ({ page, baseURL }) => {

        const url = baseURL || 'http://localhost';
        await page.goto(`${url}/admin`);
        await page.waitForLoadState('networkidle');

        await page.locator('input[type="email"]').fill('notanemail');
        await page.locator('input[type="password"]').first().fill('password123');

        await page.locator('button[type="submit"]').click();

        // Functional assertion:
        // Either validation message OR form not submitted

        const urlBefore = `${url}/admin`;

        const validationError = page.locator('text=/email|valid/i');

        const hasError = await validationError.count() > 0;

        if (hasError) {
            await expect(validationError.first()).toBeVisible();
        } else {
            // fallback: should NOT redirect
            await expect(page).toHaveURL(urlBefore);
        }
    });

});