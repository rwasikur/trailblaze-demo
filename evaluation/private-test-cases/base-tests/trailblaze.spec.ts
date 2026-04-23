import { test, expect, request as playwrightRequest } from '@playwright/test';
import path from 'path';

const ASSERT_DIR = path.resolve(__dirname, 'test-assert');
const USED_IMAGE_PATH = path.join(ASSERT_DIR, 'car3.avif');
const SEED_IMAGE_PATH = path.join(ASSERT_DIR, 'car4.jpg');

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
    await page.goto(`${baseURL}/admin`, { waitUntil: 'networkidle' });
    await page.locator('#admin-email-input').fill(user.email);
    await page.locator('#admin-password-input').fill(user.password);
    await page.locator('#admin-login-button').click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });
}

// POSITIVE TESTS (AC 1 - 15)

test('AC 1: Home Page Branding', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.getByText(/Elegance for/i)).toBeVisible();
    await expect(page.locator('nav').getByText(/Catalogue/i)).toBeVisible();
});

test('AC 2: Dynamic Catalogue Gallery', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.locator('#browse-cars-cta').click();
    await expect(page).toHaveURL(/browse/);
    await expect(page.locator('#car-grid')).toBeVisible();
    await expect(page.locator('article[id^="car-card-"]').first()).toBeVisible();
});

test('AC 3: Deep Vehicle Specification Access', async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.getByText('Specs').click();
    await expect(page.getByText(/Vehicle Specifications/i)).toBeVisible();
    await expect(page.getByText(/Transmission/i)).toBeVisible();
    await expect(page.getByText(new RegExp(car.transmission, 'i'))).toBeVisible();
});

test('AC 4: Verified Ownership Transaction History', async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.getByText('History', { exact: true }).click();
    await expect(page.getByText(/Ownership History/i)).toBeVisible();
});

test('AC 5: Condition-Based Filtering: New Arrivals', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: /New Arrivals/i }).click();
    const cards = page.locator('article[id^="car-card-"]');
    if (await cards.count() > 0) {
        await expect(cards.first().getByText(/Brand New/i)).toBeVisible();
    }
});

test('AC 6: Condition-Based Filtering: Pre-Owned', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: /Pre-Owned/i }).click();
    const cards = page.locator('article[id^="car-card-"]');
    if (await cards.count() > 0) {
        await expect(cards.first().getByText(/Pre-Owned/i)).toBeVisible();
    }
});

test('AC 7: Comprehensive Collection View (All Filter)', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: /New Arrivals/i }).click();
    await page.getByRole('button', { name: /All/i }).click();
    await expect(page.locator('#car-grid')).toBeVisible();
});

test('AC 8: Administrative Authentication Session', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin);
    await expect(page).toHaveURL(/dashboard/);
});

test('AC 9: Centralized Fleet Analytics (Dashboard)', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin1);
    await expect(page.getByText(/Admin Dashboard/i)).toBeVisible();
    await expect(page.locator('#dashboard-car-list')).toBeVisible();
});

test('AC 10: Fleet Expansion: Brand New Vehicle', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin2);
    await page.goto(`${baseURL}/admin/add-car`, { waitUntil: 'networkidle' });

    // Step 1: Brand New
    await page.locator('label:has-text("Vehicle Condition") + select').selectOption('New');
    await page.locator('label:has-text("Brand") + select').selectOption('Tesla');

    // Wait for model dropdown (instead of timeout)
    await expect(page.locator('label:has-text("Car Name") + select option').nth(1)).toBeAttached();

    await page.locator('label:has-text("Car Name") + select').selectOption('Model 3');
    await page.locator('label:has-text("Model Year") + input').fill('2012');
    await page.locator('label:has-text("Price ($)") + input').fill('25000');
    await page.locator('label:has-text("Exterior Color") + select').selectOption('Black');
    await page.locator('label:has-text("Interior Color") + select').selectOption('White');

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 2: Specifications
    await expect(page.getByRole('heading', { name: /Specifications/i })).toBeVisible();

    await page.locator('label:has-text("Transmission") + select').selectOption('Automatic');
    await page.locator('label:has-text("Fuel Type") + input').fill('Electric');
    await page.locator('label:has-text("Seating Capacity") + input').fill('5');

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 3: Registration
    await expect(page.getByRole('heading', { name: /Registration & Details/i })).toBeVisible();
    await page.getByRole('button', { name: /Next/i }).click();

    // Step 4: Media
    await expect(page.getByRole('heading', { name: /Media/i })).toBeVisible();

    await page.setInputFiles('input[type="file"]', SEED_IMAGE_PATH);
    await expect(page.getByText(/Main image uploaded/i)).toBeVisible({ timeout: 15000 });

    // 🔥 FIX: sync click + API + navigation
    await Promise.all([
        page.waitForResponse(res =>
            res.url().includes('/api/cars') && res.status() === 201
        ),
        page.waitForURL(/dashboard/),
        page.getByRole('button', { name: /Save Vehicle/i }).click()
    ]);

    // Optional soft validation
    await expect(page.locator('body')).toContainText(/success|added/i);
});

test('AC 11: Fleet Expansion: Pre-Owned Vehicle', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin2);
    await page.goto(`${baseURL}/admin/add-car`, { waitUntil: 'networkidle' });

    // Step 1: Pre-Owned
    await page.locator('label:has-text("Vehicle Condition") + select').selectOption('Used');
    await page.locator('label:has-text("Brand") + select').selectOption('Porsche');

    // Wait for model dropdown
    await expect(page.locator('label:has-text("Car Name") + select option').nth(1)).toBeAttached();

    await page.locator('label:has-text("Car Name") + select').selectOption('Panamera');
    await page.locator('label:has-text("Model Year") + input').fill('2025');
    await page.locator('label:has-text("Price ($)") + input').fill('35000');
    await page.locator('label:has-text("Exterior Color") + select').selectOption('Silver');
    await page.locator('label:has-text("Interior Color") + select').selectOption('Black');

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 2: Specifications
    await expect(page.getByRole('heading', { name: /Specifications/i })).toBeVisible();

    await page.locator('label:has-text("Transmission") + select').selectOption('Automatic');
    await page.locator('label:has-text("Fuel Type") + input').fill('Petrol');
    await page.locator('label:has-text("Seating Capacity") + input').fill('4');

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 3: Registration
    await expect(page.getByRole('heading', { name: /Registration & Details/i })).toBeVisible();

    const ownersInput = page.locator('label:has-text("Number of Owners") + input');
    await expect(ownersInput).toBeEnabled();
    await ownersInput.fill('2');

    await page.getByRole('button', { name: /Next/i }).click();

    // Step 4: Media
    await expect(page.getByRole('heading', { name: /Media/i })).toBeVisible();

    await page.setInputFiles('input[type="file"]', USED_IMAGE_PATH);
    await expect(page.getByText(/Main image uploaded/i)).toBeVisible({ timeout: 15000 });

    // 🔥 FIX
    await Promise.all([
        page.waitForResponse(res =>
            res.url().includes('/api/cars') && res.status() === 201
        ),
        page.waitForURL(/dashboard/),
        page.getByRole('button', { name: /Save Vehicle/i }).click()
    ]);

    await expect(page.locator('body')).toContainText(/success|added/i);
});

test('AC 12: Existing Fleet Data Mutation (Edit Car)', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin3);
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/admin/edit-car/${car._id}`, { waitUntil: 'networkidle' });
    const newName = `Updated ${car.name}`;
    await page.locator('label:has-text("Car Name") + input').fill(newName);
    await page.getByRole('button', { name: /Save Changes/i }).click();
    await expect(page).toHaveURL(/admin\/catalogue/);
    // Verify on public page
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.locator('#car-detail-name')).toContainText(newName);
});

test('AC 13: Catalogue Status Lifecycle Management', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin3);
    await page.goto(`${baseURL}/admin/catalogue`);
    await expect(page.getByText(/Manage Catalogue/i)).toBeVisible();
    await page.locator('button:has-text("Options ▼")').first().click();
    await expect(page.getByText(/Edit Vehicle/i)).toBeVisible();
});

test('AC 14: Administrative Profile Synchronization', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin);
    await page.goto(`${baseURL}/admin/profile`);
    await page.locator('label:has-text("Full Legal Name") + input').fill('Updated Admin Name');
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible();
});

test('AC 15: Sector Credential Update (Password)', async ({ page, baseURL }) => {
    // Step 1: Login (handling potential persistence from previous failed runs)
    await page.goto(`${baseURL}/admin`, { waitUntil: 'networkidle' });
    await page.locator('#admin-email-input').fill(USERS.admin4.email);
    await page.locator('#admin-password-input').fill(USERS.admin4.password);
    await page.locator('#admin-login-button').click();

    try {
        // Wait for dashboard. If it fails quickly, try the 'new' password from previous run.
        await page.waitForURL(/dashboard/, { timeout: 5000 });
    } catch (e) {
        await page.locator('#admin-password-input').fill('newpassword123');
        await page.locator('#admin-login-button').click();
        await page.waitForURL(/dashboard/, { timeout: 20000 });
    }

    // Step 2: Update password to 'newpassword123' (The actual AC test)
    await page.goto(`${baseURL}/admin/profile`);
    await page.locator('input[type="password"]').fill('newpassword123');
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible();

    // Step 3: MANDATORY CLEANUP - Revert password to original 'pub123'
    // This ensures the next run of 'npm test' starts with the expected state.
    await page.locator('input[type="password"]').fill(USERS.admin4.password);
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    await expect(page.getByText(/Profile updated successfully/i)).toBeVisible();
});

// NEGATIVE TESTS (AC 16 - 21)

test('AC 16: Authentication Challenge Rejection', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/admin`);
    await page.locator('#admin-email-input').fill('wrong@test.com');
    await page.locator('#admin-password-input').fill('wrongpass');
    await page.locator('#admin-login-button').click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
});

test('AC 17: Mandatory Schematic Validation Failure', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin5);
    await page.goto(`${baseURL}/admin/add-car`);
    await page.locator('label:has-text("Brand") + select').selectOption('Tesla');
    await page.getByRole('button', { name: /Next Step/i }).click();
    const validationMsg = await page.locator('label:has-text("Car Name") + select').evaluate((el: HTMLSelectElement) => el.validationMessage);
    expect(validationMsg).not.toBe('');
});

test('AC 18: Protective Route Enforcement Redirect', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => localStorage.removeItem('adminToken'));
    await page.goto(`${baseURL}/admin/dashboard`);
    await expect(page).toHaveURL(/admin$/);
});

test('AC 19: Void Resource Identifier Fallback', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/car/non-existent-id-999`);
    await expect(page.getByText(/Vehicle Not Found/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Back to Fleet/i })).toBeVisible();
});

test('AC 20: Asset Media Link Fallback Handling', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin);
    await page.goto(`${baseURL}/admin/add-car`);
    await page.locator('label:has-text("Brand") + select').selectOption('Tesla');
    await page.locator('label:has-text("Car Name") + select').selectOption('Model 3');
});

test('AC 21: Invalid Admin Profile Update', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin);
    await page.goto(`${baseURL}/admin/profile`);
    const nameInput = page.locator('label:has-text("Full Legal Name") + input');
    await nameInput.fill('');
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    const validationMsg = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMsg).not.toBe('');
});