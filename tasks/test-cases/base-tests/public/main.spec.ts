// VERSION: 2026-04-04-public
import { test, expect, request as playwrightRequest } from '@playwright/test';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
// Fixed credentials — never use Date.now() or random values (Principle 13)

const SEED_ADMIN = {
    name: 'Seed Admin User',
    email: 'seed-admin@trailblazer.test',
    password: 'SeedPass123!',
};

// Dedicated account for registration UI test — distinct from SEED_ADMIN (Principle 13)
const REG_TEST_EMAIL = 'reg-ui-test@trailblazer.test';

// Dedicated account for registration API test — distinct from both above (Principle 13)
const API_TEST_EMAIL = 'reg-api-test@trailblazer.test';

const INVALID_CREDENTIALS = {
    email: 'nobody@doesnotexist.test',
    password: 'WrongPassword999!',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function requireBaseURL(baseURL: string | undefined): string {
    // Principle 6: never fall back to hardcoded URL — fail loudly if not configured
    if (!baseURL) throw new Error(
        '[Setup] baseURL is not configured. Define it in playwright.config.ts before running tests.'
    );
    return baseURL;
}

async function getFirstCar(baseURL: string): Promise<{ _id: string; brand: string; name: string; price_per_day: number }> {
    // Principle 3: fetch seed data from API — never hardcode IDs
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    await ctx.dispose();
    const cars = body.cars ?? body;
    if (!Array.isArray(cars) || cars.length === 0) {
        throw new Error('[Precondition] No cars in catalogue. Run seed script before tests.');
    }
    return cars[0];
}

async function loginAsAdmin(page: any, baseURL: string): Promise<void> {
    // Principle 9: use stable id selectors, not generic input[type=...]
    // Principle 7: wait for real API response before asserting
    await page.goto(`${baseURL}/admin`);
    await expect(
        page.locator('#admin-email-input'),
        '[Precondition] Admin login page must show email input'
    ).toBeVisible();

    await page.locator('#admin-email-input').fill(SEED_ADMIN.email);
    await page.locator('#admin-password-input').fill(SEED_ADMIN.password);

    const [loginResponse] = await Promise.all([
        page.waitForResponse((r: any) => r.url().includes('/api/admin/login') && r.request().method() === 'POST'),
        page.locator('#admin-login-button').click(),
    ]);

    if (loginResponse.status() !== 200) {
        throw new Error(
            `[Setup] loginAsAdmin failed — API returned ${loginResponse.status()}. ` +
            `Check SEED_ADMIN credentials and that beforeAll created the account.`
        );
    }
    await page.waitForURL(/dashboard/);
}

// ─── SUITE ───────────────────────────────────────────────────────────────────

test.describe('Base Application Core Tests', () => {

    // Principle 16: shared setup validated upfront — if it fails, the entire suite fails
    test.beforeAll(async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();

        // 1. Verify application is reachable
        const healthRes = await ctx.get(`${url}/health`);
        if (!healthRes.ok()) {
            throw new Error(
                `[Setup] /health returned HTTP ${healthRes.status()}. Application must be running before tests.`
            );
        }

        // 2. Verify catalogue has seed cars (Principle 3)
        const carsRes = await ctx.get(`${url}/api/cars`);
        const carsBody = await carsRes.json();
        const cars = carsBody.cars ?? carsBody;
        if (!Array.isArray(cars) || cars.length === 0) {
            throw new Error('[Setup] Car catalogue is empty. Run the seed script before running tests.');
        }

        // 3. Reset and recreate SEED_ADMIN for deterministic state (Principle 12, 24)
        await ctx.delete(`${url}/api/admin/users/${encodeURIComponent(SEED_ADMIN.email)}`);
        await ctx.delete(`${url}/api/admin/users/${encodeURIComponent(REG_TEST_EMAIL)}`);
        await ctx.delete(`${url}/api/admin/users/${encodeURIComponent(API_TEST_EMAIL)}`);

        const signupRes = await ctx.post(`${url}/api/admin/signup`, {
            data: { full_name: SEED_ADMIN.name, email: SEED_ADMIN.email, password: SEED_ADMIN.password }
        });
        if (signupRes.status() !== 201) {
            throw new Error(
                `[Setup] Failed to create SEED_ADMIN — signup returned ${signupRes.status()}.`
            );
        }

        await ctx.dispose();
    });

    // ─── HOMEPAGE ────────────────────────────────────────────────────────────

    test('HP-01: Homepage renders the hero section with required interactive elements', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/`);
        // Assert — validate meaningful structure, not just body (Principle 4)
        await expect(page.locator('#hero-heading'), 'Hero heading must be visible').toBeVisible();
        await expect(page.locator('#browse-cars-cta'), 'Browse CTA must be visible').toBeVisible();
        await expect(page.locator('#browse-link'), 'Browse nav link must be visible').toBeVisible();
    });

    test('HP-02: Hero heading contains car-related branding text', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/`);
        await expect(page.locator('#hero-heading')).toBeVisible();
        // Assert — heading must contain actual car-domain keywords, not just any text (Principle 5, 10)
        await expect(page.locator('#hero-heading')).toContainText(/drive|dream|car|fleet|vehicle/i);
    });

    test('HP-03: CTA button is labelled with a browse-related action', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/`);
        const cta = page.locator('#browse-cars-cta');
        await expect(cta).toBeVisible();
        // Assert — label must reflect the action (Principle 5, 20)
        await expect(cta).toContainText(/explore|browse|fleet|cars/i);
    });

    test('HP-04: Navigation browse link points to /browse', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/`);
        const browseLink = page.locator('#browse-link');
        await expect(browseLink).toBeVisible();
        // Assert — href must resolve to browse route (Principle 10)
        const href = await browseLink.getAttribute('href');
        expect(href, 'Browse link href must contain "browse"').toMatch(/browse/);
    });

    test('HP-05: Navigation admin link points to /admin', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/`);
        const adminLink = page.locator('#admin-link');
        await expect(adminLink).toBeVisible();
        // Assert — href must resolve to admin route (Principle 10)
        const href = await adminLink.getAttribute('href');
        expect(href, 'Admin link href must contain "admin"').toMatch(/admin/);
    });

    test('HP-06: Clicking Browse CTA navigates to the car catalogue', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        await page.goto(`${url}/`);
        await expect(page.locator('#browse-cars-cta')).toBeVisible();
        // Act
        await page.locator('#browse-cars-cta').click();
        // Assert — URL changes AND catalogue grid is present (Principle 2: validate system reaction + final state)
        await expect(page).toHaveURL(/\/browse/);
        await expect(page.locator('#car-grid'), 'Car grid must appear after navigating to browse').toBeVisible();
    });

    // ─── BROWSE CARS PAGE ────────────────────────────────────────────────────

    test('BC-01: /browse renders the car catalogue grid', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/browse`);
        // Assert — validate meaningful page structure, not body (Principle 4)
        await expect(page.locator('#car-grid'), 'Car grid must be visible on /browse').toBeVisible();
    });

    test('BC-02: Car grid contains at least one car card from seed data', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/browse`);
        await expect(page.locator('#car-grid')).toBeVisible();
        // Assert — at least one car card must be rendered (Principle 11)
        const cards = page.locator('[id^="car-card-"]');
        await expect(cards.first(), 'First car card must be visible').toBeVisible();
        const count = await cards.count();
        expect(count, 'Car grid must contain at least one car card').toBeGreaterThan(0);
    });

    test('BC-03: Each car card displays a non-empty brand name', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/browse`);
        const brandEl = page.locator('[id^="car-card-"][id$="-brand"]').first();
        await expect(brandEl).toBeVisible();
        // Assert — brand must be a real word, not whitespace (Principle 4, 10)
        const brandText = await brandEl.textContent();
        expect(brandText?.trim(), 'Brand must match a word with at least 2 characters').toMatch(/\w{2,}/);
    });

    test('BC-04: Each car card displays a non-empty model name', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/browse`);
        const nameEl = page.locator('[id^="car-card-"][id$="-name"]').first();
        await expect(nameEl).toBeVisible();
        // Assert — model name must be a real word (Principle 4, 10)
        const nameText = await nameEl.textContent();
        expect(nameText?.trim(), 'Model name must match a word with at least 2 characters').toMatch(/\w{2,}/);
    });

    test('BC-05: Each car card displays a price with currency symbol', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/browse`);
        const priceEl = page.locator('[id^="car-card-"][id$="-price"]').first();
        await expect(priceEl).toBeVisible();
        // Assert — price must contain a $ sign and a numeric value (Principle 5, 10)
        const priceText = await priceEl.textContent();
        expect(priceText, 'Price must contain a $ currency symbol').toContain('$');
        expect(priceText, 'Price must contain a numeric value').toMatch(/\d+/);
    });

    test('BC-06: Each car card displays a valid availability status', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/browse`);
        const statusEl = page.locator('[id^="car-card-"][id$="-status"]').first();
        await expect(statusEl).toBeVisible();
        // Assert — status must be one of the valid business states, not arbitrary text (Principle 5, 10)
        const statusText = await statusEl.textContent();
        expect(statusText?.trim(), 'Status must be "Available" or "Booked"').toMatch(/^(available|booked)$/i);
    });

    test('BC-07: Each car card has a View Details button with an action label', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/browse`);
        const btn = page.locator('[id^="car-card-"][id$="-view-details"]').first();
        await expect(btn).toBeVisible();
        // Assert — button label must communicate the action (Principle 5, 20)
        await expect(btn).toContainText(/view|details|see/i);
    });

    test('BC-08: GET /api/cars returns 200 with a non-empty cars array', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Act
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/cars`);
        // Assert
        expect(res.status(), 'GET /api/cars must return 200').toBe(200);
        const body = await res.json();
        const cars = body.cars ?? body;
        expect(Array.isArray(cars), 'Response body must be an array').toBe(true);
        expect(cars.length, 'Cars array must not be empty').toBeGreaterThan(0);
        await ctx.dispose();
    });

    test('BC-09: Every car object in GET /api/cars includes required fields with valid values', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Act
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/cars`);
        const body = await res.json();
        const cars = body.cars ?? body;
        // Precondition (Principle 3)
        expect(cars.length, '[Precondition] API must return cars to validate structure').toBeGreaterThan(0);
        // Assert — validate every car, not just the first (Principle 11, 21)
        for (const car of cars) {
            expect(car._id, `Car must have _id`).toBeTruthy();
            expect(typeof car.brand).toBe('string');
            expect(car.brand.trim(), `Car._id=${car._id} brand must not be empty`).not.toBe('');
            expect(typeof car.name).toBe('string');
            expect(car.name.trim(), `Car._id=${car._id} name must not be empty`).not.toBe('');
            expect(typeof car.price_per_day).toBe('number');
            expect(car.price_per_day, `Car._id=${car._id} price_per_day must be positive`).toBeGreaterThan(0);
        }
        await ctx.dispose();
    });

    test('BC-10: Clicking View Details navigates to the correct car URL', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        await page.goto(`${url}/browse`);
        await expect(page.locator('[id^="car-card-"][id$="-view-details"]').first()).toBeVisible();
        // Act
        await page.locator('[id^="car-card-"][id$="-view-details"]').first().click();
        // Assert — URL must contain the specific car ID, not just any /car/ path (Principle 10)
        await expect(page).toHaveURL(new RegExp(`/car/${firstCar._id}`));
    });

    // ─── CAR DETAILS PAGE ────────────────────────────────────────────────────

    test('CD-01: Car details page loads and shows car name and brand', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        await page.goto(`${url}/car/${firstCar._id}`);
        // Assert — both fields must be visible, proving page loaded the car (Principle 2)
        await expect(page.locator('#car-detail-name'), 'Car name must be visible').toBeVisible();
        await expect(page.locator('#car-detail-brand'), 'Car brand must be visible').toBeVisible();
    });

    test('CD-02: Car details page displays the name matching the API response', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-name')).toBeVisible();
        // Assert — UI must show the exact name returned by the API (Principle 10, 22)
        await expect(page.locator('#car-detail-name')).toContainText(firstCar.name);
    });

    test('CD-03: Car details page displays the brand matching the API response', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-brand')).toBeVisible();
        // Assert — UI must show the exact brand returned by the API (Principle 10, 22)
        await expect(page.locator('#car-detail-brand')).toContainText(firstCar.brand);
    });

    test('CD-04: Car details page displays a formatted price with currency symbol', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-price')).toBeVisible();
        // Assert — price must be formatted with $ and contain the API value (Principle 10, 22)
        const priceText = await page.locator('#car-detail-price').textContent();
        expect(priceText, 'Price must contain a $ currency symbol').toContain('$');
        expect(priceText, 'Price must contain a numeric value').toMatch(/\d+/);
        expect(priceText, 'Price must reflect the API value').toContain(
            firstCar.price_per_day.toLocaleString()
        );
    });

    test('CD-05: Car primary image loads without error (naturalWidth > 0)', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        await page.goto(`${url}/car/${firstCar._id}`);
        const img = page.locator('#car-detail-image');
        await expect(img).toBeVisible();
        // Assert — naturalWidth > 0 proves the image loaded, not just that the tag exists (Principle 2, 4)
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth, 'Car image must be fully loaded (naturalWidth must be > 0)').toBeGreaterThan(0);
    });

    test('CD-06: Car details page shows a recognised fuel type', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-fuel')).toBeVisible();
        // Assert — fuel type must be a known domain value (Principle 5, 10)
        const fuelText = await page.locator('#car-detail-fuel').textContent();
        expect(fuelText?.trim(), 'Fuel type must be a recognised value').toMatch(
            /petrol|diesel|electric|hybrid|ev|gasoline/i
        );
    });

    test('CD-07: Car details page has a back button with a return label', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        await page.goto(`${url}/car/${firstCar._id}`);
        const backBtn = page.locator('#back-to-catalogue');
        await expect(backBtn).toBeVisible();
        // Assert — label must communicate navigation direction (Principle 5, 20)
        await expect(backBtn).toContainText(/back|catalogue|return/i);
    });

    test('CD-08: Clicking back button navigates user away from car details', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        await page.goto(`${url}/browse`);
        await expect(page.locator('[id^="car-card-"][id$="-view-details"]').first()).toBeVisible();
        // Act
        await page.locator('[id^="car-card-"][id$="-view-details"]').first().click();
        await expect(page).toHaveURL(/\/car\//);
        await page.locator('#back-to-catalogue').click();
        // Assert — URL must no longer be a /car/ route (Principle 2: validate system reaction)
        await expect(page).not.toHaveURL(/\/car\//);
    });

    test('CD-09: GET /api/cars/:id returns 200 with correct data for a valid ID', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/cars/${firstCar._id}`);
        // Assert — status and payload must match the requested car (Principle 22)
        expect(res.status(), 'Valid car ID must return 200').toBe(200);
        const car = await res.json();
        expect(car._id, 'Response _id must match requested ID').toBe(firstCar._id);
        expect(car.brand, 'Response must include non-empty brand').toBeTruthy();
        expect(car.name, 'Response must include non-empty name').toBeTruthy();
        await ctx.dispose();
    });

    // Separated from CD-09 — one test per behavior (Principle 23)
    test('CD-10: GET /api/cars/:id returns 404 for a non-existent ID', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Act
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/cars/nonexistent-car-id-99999`);
        // Assert — non-existent resource must return exactly 404 (Principle 21)
        expect(res.status(), 'Non-existent car ID must return 404').toBe(404);
        await ctx.dispose();
    });

    // ─── ADMIN AUTH ──────────────────────────────────────────────────────────

    test('AA-01: Admin page renders all login form fields', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/admin`);
        // Assert — validate form structure, not body (Principle 4)
        await expect(page.locator('#admin-email-input'), 'Email input must be visible').toBeVisible();
        await expect(page.locator('#admin-password-input'), 'Password input must be visible').toBeVisible();
        await expect(page.locator('#admin-login-button'), 'Login button must be visible').toBeVisible();
    });

    test('AA-02: Email input accepts and retains typed input', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        await page.goto(`${url}/admin`);
        const emailInput = page.locator('#admin-email-input');
        await expect(emailInput).toBeVisible();
        // Act
        await emailInput.fill('admin@example.com');
        // Assert — input must hold the value entered (Principle 2)
        await expect(emailInput).toHaveValue('admin@example.com');
    });

    test('AA-03: Password input has type="password" to mask the value', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/admin`);
        const pwInput = page.locator('#admin-password-input');
        await expect(pwInput).toBeVisible();
        // Assert — type must be exactly "password" (Principle 21)
        const type = await pwInput.getAttribute('type');
        expect(type, 'Password input must have type="password"').toBe('password');
    });

    test('AA-04: Signup toggle is visible and contains the expected prompt text', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await page.goto(`${url}/admin`);
        const toggle = page.locator('#admin-signup-toggle');
        await expect(toggle).toBeVisible();
        // Assert — toggle must contain a recognisable sign-up prompt (Principle 5)
        await expect(toggle).toContainText(/don't have an account/i);
    });

    test('AA-05: Clicking signup toggle reveals name input and hides login button', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-login-button')).toBeVisible();
        // Act
        await page.locator('#admin-signup-toggle').click();
        // Assert — registration form revealed, login button replaced by signup button (Principle 2)
        await expect(page.locator('#admin-name-input'), 'Name input must appear after toggle').toBeVisible();
        await expect(page.locator('#admin-signup-button'), 'Signup button must appear after toggle').toBeVisible();
        await expect(page.locator('#admin-login-button'), 'Login button must be hidden in signup mode').not.toBeVisible();
    });

    test('AA-06: Registration with valid credentials returns 201 and redirects to dashboard', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange — REG_TEST_EMAIL cleaned up in beforeAll (Principle 13)
        await page.goto(`${url}/admin`);
        await page.locator('#admin-signup-toggle').click();
        await expect(page.locator('#admin-name-input')).toBeVisible();
        // Act
        await page.locator('#admin-name-input').fill('Registration Test Admin');
        await page.locator('#admin-email-input').fill(REG_TEST_EMAIL);
        await page.locator('#admin-password-input').fill('RegTestPass123!');
        const [registrationResponse] = await Promise.all([
            page.waitForResponse((r: any) => r.url().includes('/api/admin/signup') && r.request().method() === 'POST'),
            page.locator('#admin-signup-button').click(),
        ]);
        // Assert — API must return 201, UI must navigate to dashboard (Principle 7, 17, 22)
        expect(registrationResponse.status(), 'Registration must return 201 Created').toBe(201);
        await expect(page).toHaveURL(/dashboard/);
    });

    test('AA-07: Registration API returns 201 and a token for a valid payload', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange — API_TEST_EMAIL cleaned up in beforeAll (Principle 13)
        const ctx = await playwrightRequest.newContext();
        // Act
        const res = await ctx.post(`${url}/api/admin/signup`, {
            data: { full_name: 'API Test Admin', email: API_TEST_EMAIL, password: 'ApiTestPass123!' }
        });
        // Assert — exact status code, not a range (Principle 4, 21)
        expect(res.status(), 'Signup API must return exactly 201 Created').toBe(201);
        const body = await res.json();
        expect(body.token, 'Signup response must include a JWT token').toBeTruthy();
        await ctx.dispose();
    });

    test('AA-08: Registration API rejects a duplicate email with 4xx', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange — SEED_ADMIN already exists from beforeAll (Principle 3)
        const ctx = await playwrightRequest.newContext();
        // Act — attempt to re-register the same email
        const res = await ctx.post(`${url}/api/admin/signup`, {
            data: { full_name: SEED_ADMIN.name, email: SEED_ADMIN.email, password: SEED_ADMIN.password }
        });
        // Assert — duplicate must be rejected (Principle 2, 21)
        expect(res.status(), 'Duplicate registration must return 4xx').toBeGreaterThanOrEqual(400);
        expect(res.status(), 'Duplicate registration must return 4xx').toBeLessThan(500);
        await ctx.dispose();
    });

    test('AA-09: Login with valid credentials returns 200 and navigates to dashboard', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange — SEED_ADMIN created in beforeAll (Principle 3, 12)
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-email-input')).toBeVisible();
        // Act
        await page.locator('#admin-email-input').fill(SEED_ADMIN.email);
        await page.locator('#admin-password-input').fill(SEED_ADMIN.password);
        const [loginResponse] = await Promise.all([
            // Principle 7: wait for real API response (not a timeout)
            page.waitForResponse((r: any) => r.url().includes('/api/admin/login') && r.request().method() === 'POST'),
            page.locator('#admin-login-button').click(),
        ]);
        // Assert — API must return 200, UI must navigate away from /admin (Principle 2, 22)
        expect(loginResponse.status(), 'Valid login must return 200').toBe(200);
        await expect(page).toHaveURL(/dashboard/);
    });

    test('AA-10: Login with invalid credentials returns 401 and shows an error message', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-email-input')).toBeVisible();
        // Act
        await page.locator('#admin-email-input').fill(INVALID_CREDENTIALS.email);
        await page.locator('#admin-password-input').fill(INVALID_CREDENTIALS.password);
        const [loginResponse] = await Promise.all([
            page.waitForResponse((r: any) => r.url().includes('/api/admin/login') && r.request().method() === 'POST'),
            page.locator('#admin-login-button').click(),
        ]);
        // Assert — exact 401 status, error visible, URL unchanged (Principle 2, 21)
        expect(loginResponse.status(), 'Invalid credentials must return 401').toBe(401);
        await expect(
            page.getByText(/authentication failed|invalid|incorrect/i).first(),
            'Error message must be visible after failed login'
        ).toBeVisible();
        await expect(page, 'User must remain on /admin after failed login').toHaveURL(`${url}/admin`);
    });

    test('AA-11: Malformed email prevents form submission and no API call is made', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-email-input')).toBeVisible();
        // Track whether any login API call is triggered (Principle 2)
        let apiCallMade = false;
        page.on('request', (req: any) => {
            if (req.url().includes('/api/admin/login')) apiCallMade = true;
        });
        // Act
        await page.locator('#admin-email-input').fill('notanemail');
        await page.locator('#admin-password-input').fill(SEED_ADMIN.password);
        await page.locator('#admin-login-button').click();
        // Assert — no API call made, user stays on login page (Principle 2, 22)
        await expect(page, 'User must stay on /admin with malformed email').toHaveURL(`${url}/admin`);
        expect(apiCallMade, 'Malformed email must not trigger a backend API request').toBe(false);
    });

    // ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────

    test('AD-01: Authenticated admin sees the dashboard heading', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange — SEED_ADMIN created in beforeAll (Principle 12)
        // Act
        await loginAsAdmin(page, url);
        // Assert — heading must be visible and labelled (Principle 2, 5)
        await expect(page).toHaveURL(/dashboard/);
        await expect(page.locator('#dashboard-heading'), 'Dashboard heading must be visible').toBeVisible();
        await expect(page.locator('#dashboard-heading')).toContainText(/dashboard/i);
    });

    test('AD-02: Dashboard displays seeded car inventory with correct car IDs', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange
        const firstCar = await getFirstCar(url);
        // Act
        await loginAsAdmin(page, url);
        await expect(page.locator('#dashboard-car-list'), 'Car list must be visible').toBeVisible();
        // Assert — seeded car must appear by its specific ID (Principle 11, 10)
        const rows = page.locator('[id^="car-row-"]');
        const rowCount = await rows.count();
        expect(rowCount, 'Dashboard must show at least one car row').toBeGreaterThan(0);
        await expect(
            page.locator(`#car-row-${firstCar._id}`),
            `Car row for seed car _id=${firstCar._id} must be visible`
        ).toBeVisible();
    });

    test('AD-03: Dashboard Add New Vehicle button is visible and labelled', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Arrange + Act
        await loginAsAdmin(page, url);
        const addBtn = page.locator('#add-car-button');
        await expect(addBtn, 'Add car button must be visible').toBeVisible();
        // Assert — label must communicate the action (Principle 5, 20)
        await expect(addBtn).toContainText(/add|new|vehicle|car/i);
    });

});
