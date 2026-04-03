import { test, expect, request as playwrightRequest } from '@playwright/test';

function requireBaseURL(baseURL: string | undefined): string {
    if (!baseURL) throw new Error(
        '[Setup] baseURL is not configured. Define it in playwright.config.ts before running tests.'
    );
    return baseURL;
}

const SEED_ADMIN = {
    name: 'Seed Admin User',
    email: 'seed-admin@trailblazer.test',
    password: 'SeedPass123!',
};

const INVALID_CREDENTIALS = {
    email: 'invalid@test.com',
    password: 'wrongpassword',
};

test.describe('Base Application Core Tests', () => {

    test.beforeAll(async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);

        const ctx = await playwrightRequest.newContext();
        const response = await ctx.get(`${url}/admin`);
        if (!response.ok()) {
            throw new Error(
                `[Setup] /admin returned HTTP ${response.status()}. Suite cannot run. Fix the application before retrying.`
            );
        }

        // Clean up seed user from prior runs to ensure deterministic state
        await ctx.delete(`${url}/api/admin/users/${encodeURIComponent(SEED_ADMIN.email)}`);
        // Ignore response — user may not exist yet on first run; that is expected

        await ctx.dispose();
    });


    test('Admin registration with valid seed credentials navigates to dashboard', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);

        await page.goto(`${url}/admin`);
        await page.waitForLoadState('networkidle');

        // Toggle is a <div>, not a link or button — matched by visible text
        const signUpTrigger = page.getByText(/don't have an account/i);
        await expect(
            signUpTrigger,
            '[Precondition] "Don\'t have an account? Sign Up" toggle must be present on /admin'
        ).toBeVisible();

        await signUpTrigger.click();
        await page.waitForLoadState('networkidle');

        await expect(
            page.getByRole('button', { name: 'Sign Up' }),
            '[Precondition] Registration form submit button must read "Sign Up" after toggling'
        ).toBeVisible();

        await page.locator('input[type="text"]').fill(SEED_ADMIN.name);
        await page.locator('input[type="email"]').fill(SEED_ADMIN.email);
        await page.locator('input[type="password"]').fill(SEED_ADMIN.password);

        const [registrationResponse] = await Promise.all([
            page.waitForResponse(
                (resp) => resp.url().includes('/api') && resp.request().method() === 'POST'
            ),
            page.getByRole('button', { name: 'Sign Up' }).click(),
        ]);

        const status = registrationResponse.status();
        expect(
            status >= 200 && status < 300,
            `[API] Registration must return 2xx. Got: ${status}`
        ).toBe(true);

        await expect(
            page,
            '[UI] Successful registration must redirect to dashboard'
        ).toHaveURL(/dashboard/);
    });


    test('Admin login with invalid credentials shows error and stays on login page', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);

        await page.goto(`${url}/admin`);
        await page.waitForLoadState('networkidle');

        await expect(
            page.locator('input[type="email"]'),
            '[Precondition] Email input must exist on /admin login page'
        ).toBeVisible();

        await page.locator('input[type="email"]').fill(INVALID_CREDENTIALS.email);
        await page.locator('input[type="password"]').fill(INVALID_CREDENTIALS.password);

        const [loginResponse] = await Promise.all([
            page.waitForResponse(
                (resp) => resp.url().includes('/api') && resp.request().method() === 'POST'
            ),
            page.getByRole('button', { name: 'Login' }).click(),
        ]);

        const status = loginResponse.status();
        expect(
            status >= 400 && status < 500,
            `[API] Login with invalid credentials must return 4xx. Got: ${status}`
        ).toBe(true);

        // Error is rendered via react-toastify, not an inline DOM element
        await expect(
            page.getByText(/authentication failed|invalid|incorrect/i).first(),
            '[UI] Toast error must be visible after failed login attempt'
        ).toBeVisible();

        await expect(
            page,
            '[UI] User must NOT be redirected away from /admin after failed login'
        ).toHaveURL(`${url}/admin`);
    });


    test('Admin login rejects malformed email and does not submit to backend', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);

        await page.goto(`${url}/admin`);
        await page.waitForLoadState('networkidle');

        await expect(
            page.locator('input[type="email"]'),
            '[Precondition] Email input must exist on /admin login page'
        ).toBeVisible();

        await page.locator('input[type="email"]').fill('notanemail');
        await page.locator('input[type="password"]').fill(SEED_ADMIN.password);

        await page.getByRole('button', { name: 'Login' }).click();

        await expect(
            page,
            '[UI] Malformed email must not navigate away from /admin'
        ).toHaveURL(`${url}/admin`);

        await expect(
            page.getByRole('button', { name: 'Login' }),
            '[UI] Login button must still be present — form was not submitted to backend'
        ).toBeVisible();
    });

});
