import { test, expect, request as playwrightRequest } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

function requireBaseURL(baseURL: string | undefined): string {
    if (!baseURL) throw new Error(
        '[Setup] baseURL is not configured. Define it in playwright.config.ts before running tests.'
    );
    return baseURL;
}

async function getFirstCar(baseURL: string): Promise<{ _id: string; brand: string; name: string; price_per_day: number }> {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    await ctx.dispose();
    const cars = body.cars ?? body;
    if (!Array.isArray(cars) || cars.length === 0) {
        throw new Error('[Precondition] No cars in catalogue. Run seed script before tests.');
    }
    const stableCar = cars.find((car: any) => car.brand !== 'TestBrand');
    if (!stableCar) {
        throw new Error('[Precondition] No stable seeded cars found. Run seed script before tests.');
    }
    return stableCar;
}

// Uses the seeded admin account — login is read-only, no conflict possible in parallel.
const SEED_ADMIN = {
    email: 'admin@test.com',
    password: 'password123',
};

const INVALID_CREDENTIALS = {
    email: 'nobody@doesnotexist.test',
    password: 'WrongPassword999!',
};

// Each test that needs a unique admin (signup tests) creates its own account inline.
function makeAdmin(suffix: string) {
    return {
        name: `Test Admin ${suffix}`,
        email: `seed-admin-${suffix}@trailblazer.test`,
        password: 'SeedPass123!',
    };
}

async function createAdmin(baseURL: string, admin: { name: string; email: string; password: string }) {
    const ctx = await playwrightRequest.newContext();
    await ctx.delete(`${baseURL}/api/admin/users/${encodeURIComponent(admin.email)}`);
    const res = await ctx.post(`${baseURL}/api/admin/signup`, {
        data: { full_name: admin.name, email: admin.email, password: admin.password }
    });
    await ctx.dispose();
    if (res.status() !== 201) {
        throw new Error(`[Setup] Failed to create admin ${admin.email} — signup returned ${res.status()}.`);
    }
}

async function loginAsAdmin(page: any, baseURL: string, admin: { email: string; password: string }): Promise<void> {
    await page.goto(`${baseURL}/admin`);
    await expect(
        page.locator('#admin-email-input'),
        '[Precondition] Admin login page must show email input'
    ).toBeVisible();
    await page.locator('#admin-email-input').fill(admin.email);
    await page.locator('#admin-password-input').fill(admin.password);
    const [loginResponse] = await Promise.all([
        page.waitForResponse((r: any) => r.url().includes('/api/admin/login') && r.request().method() === 'POST'),
        page.locator('#admin-login-button').click(),
    ]);
    if (loginResponse.status() !== 200) {
        throw new Error(`[Setup] loginAsAdmin failed — API returned ${loginResponse.status()}.`);
    }
    await page.waitForURL(/dashboard/);
}

// ─── Health check (shared across all describes via single beforeAll) ──────────

test.beforeAll(async ({ baseURL }) => {
    const url = requireBaseURL(baseURL);
    const ctx = await playwrightRequest.newContext();
    const healthRes = await ctx.get(`${url}/health`);
    if (!healthRes.ok()) {
        throw new Error(`[Setup] /health returned HTTP ${healthRes.status()}. Application must be running before tests.`);
    }
    await ctx.dispose();
});

// ─── Homepage ─────────────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Homepage', () => {

    test('HP-01: Homepage renders the hero section with required interactive elements', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/`);
        await expect(page.locator('#hero-heading'), 'Hero heading must be visible').toBeVisible();
        await expect(page.locator('#browse-cars-cta'), 'Browse CTA must be visible').toBeVisible();
        await expect(page.locator('#browse-link'), 'Browse nav link must be visible').toBeVisible();
    });

    test('HP-02: Hero heading contains car-related branding text', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/`);
        await expect(page.locator('#hero-heading')).toBeVisible();
        await expect(page.locator('#hero-heading')).toContainText(/drive|dream|car|fleet|vehicle/i);
    });

    test('HP-03: CTA button is labelled with a browse-related action', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/`);
        const cta = page.locator('#browse-cars-cta');
        await expect(cta).toBeVisible();
        await expect(cta).toContainText(/explore|browse|fleet|cars/i);
    });

    test('HP-04: Navigation browse link points to /browse', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/`);
        const browseLink = page.locator('#browse-link');
        await expect(browseLink).toBeVisible();
        const href = await browseLink.getAttribute('href');
        expect(href, 'Browse link href must contain "browse"').toMatch(/browse/);
    });

    test('HP-05: Navigation admin link points to /admin', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/`);
        const adminLink = page.locator('#admin-link');
        await expect(adminLink).toBeVisible();
        const href = await adminLink.getAttribute('href');
        expect(href, 'Admin link href must contain "admin"').toMatch(/admin/);
    });

    test('HP-06: Clicking Browse CTA navigates to the car catalogue', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/`);
        await expect(page.locator('#browse-cars-cta')).toBeVisible();
        await page.locator('#browse-cars-cta').click();
        await expect(page).toHaveURL(/\/browse/);
        await expect(page.locator('#car-grid'), 'Car grid must appear after navigating to browse').toBeVisible();
    });

});

// ─── Browse Cars ──────────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Browse Cars', () => {

    test.beforeAll(async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();
        const carsRes = await ctx.get(`${url}/api/cars`);
        const carsBody = await carsRes.json();
        const cars = carsBody.cars ?? carsBody;
        if (!Array.isArray(cars) || cars.length === 0) {
            throw new Error('[Setup] Car catalogue is empty. Run the seed script before running tests.');
        }
        await ctx.dispose();
    });

    test('BC-01: /browse renders the car catalogue grid', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/browse`);
        await expect(page.locator('#car-grid'), 'Car grid must be visible on /browse').toBeVisible();
    });

    test('BC-02: Car grid contains at least one car card from seed data', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const apiContext = await playwrightRequest.newContext();
        const response = await apiContext.get(`${url}/api/cars`);
        expect(response.ok(), 'GET /api/cars must return a successful response').toBeTruthy();
        const body = await response.json();
        const seedCars = body.cars ?? body;
        expect(seedCars.length, 'API must return at least one car from seed data').toBeGreaterThan(0);

        await page.goto(`${url}/browse`);
        await expect(page.locator('#car-grid'), 'Car grid must be visible on /browse').toBeVisible();

        await page.waitForSelector('article[id^="car-card-"]');

        let matchFound = false;
        for (const car of seedCars) {
            const count = await page.locator('article[id^="car-card-"]').filter({ hasText: car.name }).count();
            if (count > 0) {
                matchFound = true;
                break;
            }
        }

        expect(matchFound, 'At least one car from seed data must be visible in the grid').toBe(true);
    });

    test('BC-03: Each car card displays a non-empty brand name', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/browse`);
        const brandEl = page.locator('[id^="car-card-"][id$="-brand"]').first();
        await expect(brandEl).toBeVisible();
        const brandText = await brandEl.textContent();
        expect(brandText?.trim(), 'Brand must match a word with at least 2 characters').toMatch(/\w{2,}/);
    });

    test('BC-04: Each car card displays a non-empty model name', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/browse`);
        const nameEl = page.locator('[id^="car-card-"][id$="-name"]').first();
        await expect(nameEl).toBeVisible();
        const nameText = await nameEl.textContent();
        expect(nameText?.trim(), 'Model name must match a word with at least 2 characters').toMatch(/\w{2,}/);
    });

    test('BC-05: Each car card displays a price with currency symbol', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/browse`);
        const priceEl = page.locator('[id^="car-card-"][id$="-price"]').first();
        await expect(priceEl).toBeVisible();
        const priceText = await priceEl.textContent();
        expect(priceText, 'Price must contain a $ currency symbol').toContain('$');
        expect(priceText, 'Price must contain a numeric value').toMatch(/\d+/);
    });

    test('BC-06: Each car card displays a valid availability status', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/browse`);
        const statusEl = page.locator('[id^="car-card-"][id$="-status"]').first();
        await expect(statusEl).toBeVisible();
        const statusText = await statusEl.textContent();
        expect(statusText?.trim(), 'Status must be a valid availability value').toMatch(/^(available|unavailable|pending)$/i);
    });

    test('BC-07: Each car card has a View Details button with an action label', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/browse`);
        const btn = page.locator('[id^="car-card-"][id$="-view-details"]').first();
        await expect(btn).toBeVisible();
        await expect(btn).toContainText(/view|details|see/i);
    });

    test('BC-08: GET /api/cars returns 200 with a non-empty cars array', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/cars`);
        expect(res.status(), 'GET /api/cars must return 200').toBe(200);
        const body = await res.json();
        const cars = body.cars ?? body;
        expect(Array.isArray(cars), 'Response body must be an array').toBe(true);
        expect(cars.length, 'Cars array must not be empty').toBeGreaterThan(0);
        await ctx.dispose();
    });

    test('BC-09: Every car object in GET /api/cars includes required fields with valid values', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/cars`);
        const body = await res.json();
        const cars = body.cars ?? body;
        expect(cars.length, '[Precondition] API must return cars to validate structure').toBeGreaterThan(0);
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
        await page.goto(`${url}/browse`);
        const firstViewDetails = page.locator('[id^="car-card-"][id$="-view-details"]').first();
        await expect(firstViewDetails).toBeVisible();
        const cardId = await firstViewDetails.getAttribute('id');
        // id format: car-card-{uuid}-view-details
        const carId = cardId?.replace('car-card-', '').replace('-view-details', '');
        await firstViewDetails.click();
        await expect(page).toHaveURL(new RegExp(`/car/${carId}`));
    });

});

// ─── Car Details ──────────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Car Details', () => {

    test.beforeAll(async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();
        const carsRes = await ctx.get(`${url}/api/cars`);
        const carsBody = await carsRes.json();
        const cars = carsBody.cars ?? carsBody;
        if (!Array.isArray(cars) || cars.length === 0) {
            throw new Error('[Setup] Car catalogue is empty. Run the seed script before running tests.');
        }
        await ctx.dispose();
    });

    test('CD-01: Car details page loads and shows car name and brand', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-name'), 'Car name must be visible').toBeVisible();
        await expect(page.locator('#car-detail-brand'), 'Car brand must be visible').toBeVisible();
    });

    test('CD-02: Car details page displays the name matching the API response', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-name')).toBeVisible();
        await expect(page.locator('#car-detail-name')).toContainText(firstCar.name);
    });

    test('CD-03: Car details page displays the brand matching the API response', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-brand')).toBeVisible();
        await expect(page.locator('#car-detail-brand')).toContainText(firstCar.brand);
    });

    test('CD-04: Car details page displays a formatted price with currency symbol', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-price')).toBeVisible();
        const priceText = await page.locator('#car-detail-price').textContent();
        expect(priceText, 'Price must contain a $ currency symbol').toContain('$');
        expect(priceText, 'Price must contain a numeric value').toMatch(/\d+/);
        expect(priceText, 'Price must reflect the API value').toContain(
            firstCar.price_per_day.toLocaleString()
        );
    });

    test('CD-05: Car primary image loads without error (naturalWidth > 0)', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await page.goto(`${url}/car/${firstCar._id}`);
        const img = page.locator('#car-detail-image');
        await expect(img).toBeVisible();
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth, 'Car image must be fully loaded (naturalWidth must be > 0)').toBeGreaterThan(0);
    });

    test('CD-06: Car details page shows a recognised fuel type', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await page.goto(`${url}/car/${firstCar._id}`);
        await expect(page.locator('#car-detail-fuel')).toBeVisible();
        const fuelText = await page.locator('#car-detail-fuel').textContent();
        expect(fuelText?.trim(), 'Fuel type must be a recognised value').toMatch(
            /petrol|diesel|electric|hybrid|ev|gasoline/i
        );
    });

    test('CD-07: Car details page has a back button with a return label', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await page.goto(`${url}/car/${firstCar._id}`);
        const backBtn = page.locator('#back-to-catalogue');
        await expect(backBtn).toBeVisible();
        await expect(backBtn).toContainText(/back|catalogue|return/i);
    });

    test('CD-08: Clicking back button navigates user away from car details', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/browse`);
        await expect(page.locator('[id^="car-card-"][id$="-view-details"]').first()).toBeVisible();
        await page.locator('[id^="car-card-"][id$="-view-details"]').first().click();
        await expect(page).toHaveURL(/\/car\//);
        await page.locator('#back-to-catalogue').click();
        await expect(page).not.toHaveURL(/\/car\//);
    });

    test('CD-09: GET /api/cars/:id returns 200 with correct data for a valid ID', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/cars/${firstCar._id}`);
        expect(res.status(), 'Valid car ID must return 200').toBe(200);
        const car = await res.json();
        expect(car._id, 'Response _id must match requested ID').toBe(firstCar._id);
        expect(car.brand, 'Response must include non-empty brand').toBeTruthy();
        expect(car.name, 'Response must include non-empty name').toBeTruthy();
        await ctx.dispose();
    });

    test('CD-10: GET /api/cars/:id returns 404 for a non-existent ID', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/cars/nonexistent-car-id-99999`);
        expect(res.status(), 'Non-existent car ID must return 404').toBe(404);
        await ctx.dispose();
    });

});

// ─── Admin Auth ───────────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Admin Auth', () => {

    test('AA-01: Admin page renders all login form fields', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-email-input'), 'Email input must be visible').toBeVisible();
        await expect(page.locator('#admin-password-input'), 'Password input must be visible').toBeVisible();
        await expect(page.locator('#admin-login-button'), 'Login button must be visible').toBeVisible();
    });

    test('AA-02: Email input accepts and retains typed input', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin`);
        const emailInput = page.locator('#admin-email-input');
        await expect(emailInput).toBeVisible();
        await emailInput.fill('admin@example.com');
        await expect(emailInput).toHaveValue('admin@example.com');
    });

    test('AA-03: Password input has type="password" to mask the value', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin`);
        const pwInput = page.locator('#admin-password-input');
        await expect(pwInput).toBeVisible();
        const type = await pwInput.getAttribute('type');
        expect(type, 'Password input must have type="password"').toBe('password');
    });

    test('AA-04: Signup toggle is visible and contains the expected prompt text', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin`);
        const toggle = page.locator('#admin-signup-toggle');
        await expect(toggle).toBeVisible();
        await expect(toggle).toContainText(/don't have an account/i);
    });

    test('AA-05: Clicking signup toggle reveals name input and hides login button', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-login-button')).toBeVisible();
        await page.locator('#admin-signup-toggle').click();
        await expect(page.locator('#admin-name-input'), 'Name input must appear after toggle').toBeVisible();
        await expect(page.locator('#admin-signup-button'), 'Signup button must appear after toggle').toBeVisible();
        await expect(page.locator('#admin-login-button'), 'Login button must be hidden in signup mode').not.toBeVisible();
    });

    test('AA-06: Registration with valid credentials returns 201 and redirects to dashboard', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const regEmail = 'reg-ui-test-aa06@trailblazer.test';
        const ctx = await playwrightRequest.newContext();
        await ctx.delete(`${url}/api/admin/users/${encodeURIComponent(regEmail)}`);
        await ctx.dispose();

        await page.goto(`${url}/admin`);
        await page.locator('#admin-signup-toggle').click();
        await expect(page.locator('#admin-name-input')).toBeVisible();
        await page.locator('#admin-name-input').fill('Registration Test Admin');
        await page.locator('#admin-email-input').fill(regEmail);
        await page.locator('#admin-password-input').fill('RegTestPass123!');
        const [registrationResponse] = await Promise.all([
            page.waitForResponse((r: any) => r.url().includes('/api/admin/signup') && r.request().method() === 'POST'),
            page.locator('#admin-signup-button').click(),
        ]);
        expect(registrationResponse.status(), 'Registration must return 201 Created').toBe(201);
        await expect(page).toHaveURL(/dashboard/);
    });

    test('AA-07: Registration API returns 201 and a token for a valid payload', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const apiEmail = 'reg-api-test-aa07@trailblazer.test';
        const ctx = await playwrightRequest.newContext();
        await ctx.delete(`${url}/api/admin/users/${encodeURIComponent(apiEmail)}`);
        const res = await ctx.post(`${url}/api/admin/signup`, {
            data: { full_name: 'API Test Admin', email: apiEmail, password: 'ApiTestPass123!' }
        });
        expect(res.status(), 'Signup API must return exactly 201 Created').toBe(201);
        const body = await res.json();
        expect(body.token, 'Signup response must include a JWT token').toBeTruthy();
        await ctx.dispose();
    });

    test('AA-08: Registration API rejects a duplicate email with 4xx', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const admin = makeAdmin('aa08');
        await createAdmin(url, admin);
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.post(`${url}/api/admin/signup`, {
            data: { full_name: admin.name, email: admin.email, password: admin.password }
        });
        expect(res.status(), 'Duplicate registration must return 4xx').toBeGreaterThanOrEqual(400);
        expect(res.status(), 'Duplicate registration must return 4xx').toBeLessThan(500);
        await ctx.dispose();
    });

    test('AA-09: Login with valid credentials returns 200 and navigates to dashboard', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-email-input')).toBeVisible();
        await page.locator('#admin-email-input').fill(SEED_ADMIN.email);
        await page.locator('#admin-password-input').fill(SEED_ADMIN.password);
        const [loginResponse] = await Promise.all([
            page.waitForResponse((r: any) => r.url().includes('/api/admin/login') && r.request().method() === 'POST'),
            page.locator('#admin-login-button').click(),
        ]);
        expect(loginResponse.status(), 'Valid login must return 200').toBe(200);
        await expect(page).toHaveURL(/dashboard/);
    });

    test('AA-10: Login with invalid credentials returns 401 and shows an error message', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-email-input')).toBeVisible();
        await page.locator('#admin-email-input').fill(INVALID_CREDENTIALS.email);
        await page.locator('#admin-password-input').fill(INVALID_CREDENTIALS.password);
        const [loginResponse] = await Promise.all([
            page.waitForResponse((r: any) => r.url().includes('/api/admin/login') && r.request().method() === 'POST'),
            page.locator('#admin-login-button').click(),
        ]);
        expect(loginResponse.status(), 'Invalid credentials must return 401').toBe(401);
        await expect(
            page.getByText(/Invalid email or password/i).first(),
            'Error message "Invalid email or password" must be visible after failed login'
        ).toBeVisible();
        await expect(page, 'User must remain on /admin after failed login').toHaveURL(`${url}/admin`);
    });

    test('AA-11: Malformed email prevents form submission and no API call is made', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin`);
        await expect(page.locator('#admin-email-input')).toBeVisible();
        let apiCallMade = false;
        page.on('request', (req: any) => {
            if (req.url().includes('/api/admin/login')) apiCallMade = true;
        });
        await page.locator('#admin-email-input').fill('notanemail');
        await page.locator('#admin-password-input').fill('SeedPass123!');
        await page.locator('#admin-login-button').click();
        await expect(page, 'User must stay on /admin with malformed email').toHaveURL(`${url}/admin`);
        expect(apiCallMade, 'Malformed email must not trigger a backend API request').toBe(false);
        const emailValidationMsg = await page.locator('#admin-email-input').evaluate(
            (el: HTMLInputElement) => el.validationMessage
        );
        expect(emailValidationMsg, 'Browser must report a validation error for malformed email').not.toBe('');
    });

});

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Admin Dashboard', () => {

    test('AD-01: Authenticated admin sees the dashboard heading', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await expect(page).toHaveURL(/dashboard/);
        await expect(page.locator('#dashboard-heading'), 'Dashboard heading must be visible').toBeVisible();
        await expect(page.locator('#dashboard-heading')).toContainText(/dashboard/i);
    });

    test('AD-02: Dashboard displays seeded car inventory with correct car IDs', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await expect(page.locator('#dashboard-car-list'), 'Car list must be visible').toBeVisible();
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
        await loginAsAdmin(page, url, SEED_ADMIN);
        const addBtn = page.locator('#add-car-button');
        await expect(addBtn, 'Add car button must be visible').toBeVisible();
        await expect(addBtn).toContainText(/add|new|vehicle|car/i);
    });

});

// ─── Add Car Flow ─────────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Add Car Flow', () => {

    test('AC-01: Add car page renders with heading, step indicator and form fields', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/add-car`);
        await expect(page.locator('h1'), 'Add New Vehicle heading must be visible').toContainText(/Add New Vehicle/i);
        await expect(page.getByText('Basic Info').first(), 'Step indicator must show Basic Info step').toBeVisible();
        await expect(page.locator('label:has-text("Car Name") + input'), 'Car Name field must be visible').toBeVisible();
        await expect(page.locator('label:has-text("Brand") + input'), 'Brand field must be visible').toBeVisible();
        await expect(page.locator('label:has-text("Model Year") + input'), 'Model Year field must be visible').toBeVisible();
        await expect(page.locator('label:has-text("Price ($)") + input'), 'Price field must be visible').toBeVisible();
    });

    test('AC-02: Next Step button advances the wizard from step 1 to step 2', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/add-car`);
        await page.locator('label:has-text("Car Name") + input').fill('Test Car');
        await page.locator('label:has-text("Brand") + input').fill('TestBrand');
        await page.locator('label:has-text("Model Year") + input').fill('2024');
        await page.locator('label:has-text("Price ($)") + input').fill('100');
        await page.getByRole('button', { name: 'Next Step' }).click();
        await expect(page.locator('h3:has-text("Specifications")'), 'Step 2 Specifications heading must appear').toBeVisible();
    });

    test('AC-03: Full Add Car wizard completes and redirects to dashboard with 201 response', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/add-car`);

        // Step 1: Basic Info
        await page.locator('label:has-text("Car Name") + input').fill('Wizard Flow Car');
        await page.locator('label:has-text("Brand") + input').fill('FlowBrand');
        await page.locator('label:has-text("Model Year") + input').fill('2024');
        await page.locator('label:has-text("Price ($)") + input').fill('150');
        await page.getByRole('button', { name: 'Next Step' }).click();

        // Step 2: Specifications
        await expect(page.locator('h3:has-text("Specifications")')).toBeVisible();
        await page.locator('label:has-text("Transmission") + select').selectOption('Automatic');
        await page.locator('label:has-text("Fuel Type") + input').fill('Petrol');
        await page.locator('label:has-text("Seating Capacity") + input').fill('5');
        await page.getByRole('button', { name: 'Next Step' }).click();

        // Step 3: Registration & Details
        await expect(page.locator('h3:has-text("Registration & Details")')).toBeVisible();
        await page.locator('label:has-text("Number of Owners") + input').fill('1');
        await page.getByRole('button', { name: 'Next Step' }).click();

        // Step 4: Media — submit
        await expect(page.locator('h3:has-text("Vehicle Media")')).toBeVisible();
        const [addResponse] = await Promise.all([
            page.waitForResponse((r: any) => r.url().includes('/api/cars') && r.request().method() === 'POST'),
            page.getByRole('button', { name: 'Save Vehicle to Fleet' }).click(),
        ]);
        expect(addResponse.status(), 'POST /api/cars must return 201 Created').toBe(201);
        await expect(page).toHaveURL(/dashboard/);
    });

    test('AC-04: POST /api/cars with valid token creates a car and returns 201', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();
        const loginRes = await ctx.post(`${url}/api/admin/login`, {
            data: { email: SEED_ADMIN.email, password: SEED_ADMIN.password }
        });
        expect(loginRes.status(), 'Admin login must succeed for setup').toBe(200);
        const { token } = await loginRes.json();
        const res = await ctx.post(`${url}/api/cars`, {
            data: {
                name: 'API Created Car', brand: 'APIBrand', model_year: '2024',
                price_per_day: 200, fuel_type: 'Petrol', transmission: 'Automatic', seating_capacity: 5
            },
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(res.status(), 'POST /api/cars with valid token must return 201').toBe(201);
        const body = await res.json();
        const carId = body._id ?? body.car?._id;
        expect(carId, 'Created car must have an _id field').toBeTruthy();
        await ctx.dispose();
    });

    test('AC-05: Back to Dashboard button on Add Car page navigates to dashboard', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/add-car`);
        await expect(page.locator('h1')).toContainText(/Add New Vehicle/i);
        await page.getByRole('button', { name: 'Back to Dashboard' }).click();
        await expect(page).toHaveURL(/dashboard/);
    });

});

// ─── Edit Car Flow ─────────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Edit Car Flow', () => {

    test('EC-01: Edit car page renders with "Edit Vehicle" heading', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/edit-car/${firstCar._id}`);
        await expect(page.locator('h1'), 'Edit Vehicle heading must be visible').toContainText(/Edit Vehicle/i);
    });

    test('EC-02: Edit car page pre-populates form with existing car name and brand', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/edit-car/${firstCar._id}`);
        await expect(page.locator('label:has-text("Car Name") + input')).not.toHaveValue('');
        const nameValue = await page.locator('label:has-text("Car Name") + input').inputValue();
        expect(nameValue, 'Car name input must be pre-populated with the existing car name').toBe(firstCar.name);
        const brandValue = await page.locator('label:has-text("Brand") + input').inputValue();
        expect(brandValue, 'Brand input must be pre-populated with the existing car brand').toBe(firstCar.brand);
    });

    test('EC-03: Full Edit Car flow saves changes with 200 response and redirects to inventory', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/edit-car/${firstCar._id}`);
        await expect(page.locator('label:has-text("Car Name") + input')).not.toHaveValue('');
        // Ensure the number_of_owners integer field has a value to avoid a DB type error on empty string
        await page.locator('label:has-text("Number of Owners") + input').fill('1');
        // Submit the form to validate the round-trip
        const [editResponse] = await Promise.all([
            page.waitForResponse((r: any) => r.url().includes(`/api/cars/${firstCar._id}`) && r.request().method() === 'PUT'),
            page.getByRole('button', { name: 'Save Updates to Fleet' }).click(),
        ]);
        expect(editResponse.status(), 'PUT /api/cars/:id must return 200 OK').toBe(200);
        await expect(page).toHaveURL(/inventory/);
    });

    test('EC-04: PUT /api/cars/:id with valid token updates the car and returns 200', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        const ctx = await playwrightRequest.newContext();
        const loginRes = await ctx.post(`${url}/api/admin/login`, {
            data: { email: SEED_ADMIN.email, password: SEED_ADMIN.password }
        });
        expect(loginRes.status(), 'Admin login must succeed for setup').toBe(200);
        const { token } = await loginRes.json();
        const res = await ctx.put(`${url}/api/cars/${firstCar._id}`, {
            data: { name: firstCar.name },
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(res.status(), 'PUT /api/cars/:id with valid token must return 200').toBe(200);
        await ctx.dispose();
    });

    test('EC-05: Edit car "Back to Inventory" button navigates to the inventory page', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/edit-car/${firstCar._id}`);
        await expect(page.locator('h1')).toContainText(/Edit Vehicle/i);
        await page.getByRole('button', { name: 'Back to Inventory' }).click();
        await expect(page).toHaveURL(/inventory/);
    });

});

// ─── Manage Inventory ─────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Manage Inventory', () => {

    test('MI-01: Manage Inventory page renders with heading and vehicle table', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/inventory`);
        await expect(page.locator('h1'), 'Manage Inventory heading must be visible').toContainText(/Manage Inventory/i);
        await expect(page.locator('table'), 'Inventory table must be visible').toBeVisible();
    });

    test('MI-02: Inventory table rows show car name, brand, price and status', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/inventory`);
        await page.waitForSelector('tbody tr td:not([colspan])');
        const rows = page.locator('tbody tr');
        expect(await rows.count(), 'Inventory table must contain at least one car row').toBeGreaterThan(0);
        const firstRow = rows.first();
        const cells = firstRow.locator('td');
        const name = await cells.nth(1).textContent();
        expect(name?.trim(), 'Car name column must be non-empty').toMatch(/\w{2,}/);
        const brand = await cells.nth(2).textContent();
        expect(brand?.trim(), 'Brand column must be non-empty').toMatch(/\w{2,}/);
        const price = await cells.nth(3).textContent();
        expect(price, 'Price column must contain a $ symbol').toContain('$');
        const status = await cells.nth(4).textContent();
        expect(status?.trim(), 'Status column must show a recognised availability value').toMatch(/Available|Unavailable|Pending/i);
    });

    test('MI-03: Clicking Options button reveals the dropdown with Edit Vehicle option', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/inventory`);
        await page.waitForSelector('tbody tr td:not([colspan])');
        const optionsBtn = page.getByRole('button', { name: 'Options ▼' }).first();
        await expect(optionsBtn, 'Options ▼ button must be visible').toBeVisible();
        await optionsBtn.click();
        await expect(
            page.getByRole('button', { name: /Edit Vehicle/i }),
            'Edit Vehicle option must appear after clicking Options'
        ).toBeVisible();
    });

    test('MI-04: Status update toggle changes car status and shows success message', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        // Create a dedicated test car with Unavailable status so we can test "Return to Available"
        // without mutating shared seed data during parallel test runs
        const ctx = await playwrightRequest.newContext();
        const loginRes = await ctx.post(`${url}/api/admin/login`, { data: SEED_ADMIN });
        const { token } = await loginRes.json();
        const createRes = await ctx.post(`${url}/api/cars`, {
            data: {
                name: 'MI-04 Status Toggle Car', brand: 'TestBrand', model_year: 2024,
                price_per_day: 99, fuel_type: 'Electric', transmission: 'Automatic',
                seating_capacity: 4, availability_status: 'Unavailable', number_of_owners: 1
            },
            headers: { Authorization: `Bearer ${token}` }
        });
        const testCar = await createRes.json();
        const testCarId = testCar._id ?? testCar.car?._id;
        await ctx.dispose();

        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/inventory`);
        await page.waitForSelector('tbody tr td:not([colspan])');

        // Identify the row by the last 6 chars of the test car's _id (shown in the ID column)
        const idSuffix = testCarId.substring(testCarId.length - 6);
        const carRow = page.locator('tbody tr').filter({ hasText: idSuffix }).first();
        await carRow.getByRole('button', { name: 'Options ▼' }).click();

        // "Return to Available" only appears when status is Unavailable
        await expect(
            page.getByRole('button', { name: /Return to Available/i }),
            '"Return to Available" option must appear for Unavailable car'
        ).toBeVisible();
        await page.getByRole('button', { name: /Return to Available/i }).click();

        // Verify success toast message
        await expect(
            page.getByText('Status updated successfully'),
            'Success toast "Status updated successfully" must appear after status change'
        ).toBeVisible();
    });

    test('MI-05: Back to Dashboard button on Manage Inventory page navigates to dashboard', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await loginAsAdmin(page, url, SEED_ADMIN);
        await page.goto(`${url}/admin/inventory`);
        await page.getByRole('button', { name: 'Back to Dashboard' }).click();
        await expect(page).toHaveURL(/dashboard/);
    });

});

// ─── Security Tests ───────────────────────────────────────────────────────────

test.describe('Base Application Core Tests — Security', () => {

    test('SEC-02: POST /api/cars returns 401 without an auth token', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.post(`${url}/api/cars`, {
            data: { name: 'Unauthorized Car', brand: 'NoBrand', price_per_day: 100 }
        });
        expect(res.status(), 'Unauthenticated POST /api/cars must return 401').toBe(401);
        await ctx.dispose();
    });

    test('SEC-03: PUT /api/cars/:id/status returns 401 without an auth token', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const firstCar = await getFirstCar(url);
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.put(`${url}/api/cars/${firstCar._id}/status`, {
            data: { status: 'Unavailable' }
        });
        expect(res.status(), 'Unauthenticated PUT /api/cars/:id/status must return 401').toBe(401);
        await ctx.dispose();
    });

    test('SEC-05: GET /api/admin/profile returns 401 without an auth token', async ({ baseURL }) => {
        const url = requireBaseURL(baseURL);
        const ctx = await playwrightRequest.newContext();
        const res = await ctx.get(`${url}/api/admin/profile`);
        expect(res.status(), 'Unauthenticated GET /api/admin/profile must return 401').toBe(401);
        await ctx.dispose();
    });

    test('SEC-06: Admin dashboard page redirects unauthenticated browser to login', async ({ page, baseURL }) => {
        const url = requireBaseURL(baseURL);
        await page.goto(`${url}/admin/dashboard`);
        // Should either redirect to /admin login or show a login prompt
        await expect(page).not.toHaveURL(/dashboard/);
    });

});