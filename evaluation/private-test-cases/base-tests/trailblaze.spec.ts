import { test, expect, request as playwrightRequest } from '@playwright/test';

// Config - Private Admin mapping
const USERS = {
    admin: { email: 'admin@test.com', password: 'password123' },
    admin1: { email: 'admin1@pri.com', password: 'pri123' },
    admin2: { email: 'admin2@pri.com', password: 'pri123' },
    admin3: { email: 'admin3@pri.com', password: 'pri123' },
    admin4: { email: 'admin4@pri.com', password: 'pri123' },
    admin5: { email: 'admin5@pri.com', password: 'pri123' }
};

// Helpers
async function getFirstCar(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    await ctx.dispose();
    return (body.cars ?? body)[0];
}

async function login(page: any, baseURL: string, user = USERS.admin) {
    await page.goto(`${baseURL}/admin`);
    await page.locator('#admin-email-input').fill(user.email);
    await page.locator('#admin-password-input').fill(user.password);
    await page.locator('#admin-login-button').click();
    await page.waitForURL(/dashboard/);
}

// Tests (Strict AC alignment, Flat structure)
test('AC 1: Hero Section and Browse Entry', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.getByText(/Drive Your Dream/i)).toBeVisible();
    await page.locator('#browse-cars-cta').click();
    await expect(page).toHaveURL(/browse/);
});

test('AC 2: Car Catalog Display', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator('#car-grid')).toBeVisible();
    await expect(page.locator('article[id^="car-card-"]').first()).toBeVisible();
});

test('AC 3: Vehicle Specifications Viewer', async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.locator('#car-detail-name')).toContainText(car.name);
    // Must click Specs tab to see technical details
    await page.getByText('Specs').click();
    await expect(page.getByText(/Vehicle Specifications/i)).toBeVisible();
});

test('AC 4: Administrator Sign-in', async ({ page, baseURL }) => {
    const user = USERS.admin;
    await page.goto(`${baseURL}/admin`);
    await page.locator('#admin-email-input').fill(user.email);
    await page.locator('#admin-password-input').fill(user.password);
    await page.locator('#admin-login-button').click();
    await expect(page).toHaveURL(/dashboard/);
});

test('AC 5: Centralized Admin Dashboard', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin1);
    await expect(page.locator('#dashboard-car-list')).toBeVisible();
    await expect(page.locator('[id^="car-row-"]').first()).toBeVisible();
});

test('AC 6: Fleet Expansion (Add Car) - Step Flow', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin2);
    await page.goto(`${baseURL}/admin/add-car`);
    await page.locator('label:has-text("Car Name") + input').fill('Private Audit Car');
    await page.locator('label:has-text("Brand") + input').fill('PrivateBrand');
    await page.locator('label:has-text("Model Year") + input').fill('2025');
    await page.locator('label:has-text("Price ($)") + input').fill('299');
    await page.getByRole('button', { name: /Next Step|Save/i }).click();
    await expect(page.getByText(/Specifications/i).first()).toBeVisible();
});

test('AC 7: Multi-Step Form Persistence', async ({ page, baseURL }) => {
    const uniqueSuffix = Date.now();
    // Monitor for toast errors or other issues
    page.on('console', msg => {
        if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`);
    });

    await login(page, baseURL || '', USERS.admin3);
    await page.goto(`${baseURL}/admin/add-car`);

    // Step 1: Basic Info
    await page.locator('label:has-text("Car Name") + input').fill(`Private Persistent Car ${uniqueSuffix}`);
    await page.locator('label:has-text("Brand") + input').fill('Private-AC7');
    await page.locator('label:has-text("Model Year") + input').fill('2025');
    await page.locator('label:has-text("Price ($)") + input').fill('500');
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 2: Specifications
    await expect(page.getByText(/Specifications/i).first(), 'Should reach Step 2').toBeVisible();
    await page.locator('label:has-text("Transmission") + select').selectOption('Automatic');
    await page.locator('label:has-text("Fuel Type") + input').fill('Hybrid');
    await page.locator('label:has-text("Seating Capacity") + input').fill('7');
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 3: Registration & Details
    await expect(page.getByText(/Registration & Details/i).first(), 'Should reach Step 3').toBeVisible();
    // Fill optional but potentially sensitive fields (integers)
    await page.locator('label:has-text("Number of Owners") + input').fill('2');
    await page.locator('label:has-text("Registration City") + input').fill('Private City');
    await page.locator('label:has-text("Insurance Validity") + input').fill('2027-01-01');
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 4: Media - Final Submit
    await expect(page.getByText(/Vehicle Media/i).first(), 'Should reach Step 4').toBeVisible();
    await page.locator('label:has-text("Image URL") + input').fill('https://images.unsplash.com/photo-1503376780353-7e6692767b70');

    // Ensure the button actually says "Save" before clicking to avoid double-next race condition
    const saveButton = page.getByRole('button', { name: /Save Vehicle/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    await expect(page, 'Should redirect to dashboard after submission').toHaveURL(/dashboard/, { timeout: 15000 });
});

test('AC 8: Admin Profile Management', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin4);
    await page.goto(`${baseURL}/admin/profile`);
    await expect(page.getByText(/Account Settings/i)).toBeVisible();
});

test('AC 9: Authentication Rejection (Negative)', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/admin`);
    await page.locator('#admin-email-input').fill('invalid-private@user.com');
    await page.locator('#admin-password-input').fill('wrongpass');
    await page.locator('#admin-login-button').click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
});

test('AC 10: Form Validation for Mandatory Fields (Negative)', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin5);
    await page.goto(`${baseURL}/admin/add-car`);
    await page.getByRole('button', { name: /Next Step/i }).click();
    const validationMsg = await page.locator('label:has-text("Car Name") + input').evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMsg).not.toBe('');
});

test('AC 11: Route Protection for Unauthenticated Access (Negative)', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/admin/dashboard`);
    await expect(page).toHaveURL(/admin$/);
});

test('AC 12: Invalid Car Details Access (Negative)', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/car/non-existent-id-0000`);
    await expect(page.locator('body')).not.toContainText(/Success/i);
});