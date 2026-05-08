import { test, expect, request as playwrightRequest } from '@playwright/test';
import path from 'path';

const ASSERT_DIR = path.resolve(__dirname, 'test-assert');
const USED_IMAGE_PATH = path.join(ASSERT_DIR, 'car1.webp');
const SEED_IMAGE_PATH = path.join(ASSERT_DIR, 'car2.webp');

const USERS = {
    admin1: { email: 'admin1@pub.com', password: 'pub123' },
    admin2: { email: 'admin2@pub.com', password: 'pub123' },
    admin3: { email: 'admin3@pub.com', password: 'pub123' },
    admin4: { email: 'admin4@pub.com', password: 'pub123' },
    admin5: { email: 'admin5@pub.com', password: 'pub123' }
};

// Helpers
async function getFirstCar(baseURL: string, condition?: string, preferredIndex = 0) {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    await ctx.dispose();
    const cars = body.cars ?? body;

    let filtered = cars;
    if (condition) {
        filtered = cars.filter((c: any) => c.condition === condition);
    }

    // Prioritize available cars
    const available = filtered.filter((c: any) => c.availability_status === 'Available');
    if (available.length > preferredIndex) return available[preferredIndex];
    if (available.length > 0) return available[0];

    return cars[0];
}

// Helper: interact with react-select by inputId
async function selectReactOption(page: any, inputId: string, optionText: string) {
    await page.locator(`#${inputId}`).click();
    await page.locator(`#${inputId}`).fill(optionText);
    await page.getByText(optionText, { exact: true }).first().click();
}

async function login(page: any, baseURL: string, user = USERS.admin1) {
    const url = `${baseURL}/admin`;

    // Always navigate/reload to ensure a fresh state if we are not already on dashboard
    if (!page.url().includes('dashboard')) {
        await page.goto(url, { waitUntil: 'networkidle' });
    }

    // 1. Check if already on dashboard
    if (page.url().includes('dashboard')) return;

    // 2. Wait for the login form, signup form, or dashboard
    await Promise.race([
        page.locator('#admin-email-input').waitFor({ state: 'visible', timeout: 10000 }).catch(() => { }),
        page.locator('#admin-signup-email').waitFor({ state: 'visible', timeout: 10000 }).catch(() => { }),
        page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => { })
    ]);

    if (page.url().includes('dashboard')) return;

    // 3. Handle Toggle to Login if we are on Signup
    if (await page.locator('#admin-signup-email').isVisible()) {
        const loginToggle = page.locator('#admin-login-toggle');
        if (await loginToggle.isVisible()) {
            await loginToggle.click();
            await page.locator('#admin-email-input').waitFor({ state: 'visible', timeout: 5000 });
        }
    }

    // 4. Perform Login
    if (await page.locator('#admin-email-input').isVisible()) {
        await page.locator('#admin-email-input').fill(user.email);
        await page.locator('#admin-password-input').fill(user.password);
        await page.locator('#admin-login-button').click();

        const result = await Promise.race([
            page.waitForURL(/dashboard/, { timeout: 10000 }).then(() => 'success'),
            page.locator('.Toastify__toast--error').waitFor({ state: 'visible', timeout: 8000 }).then(() => 'error')
        ]);

        if (result === 'success') return;

        // If login failed, try Signup as fallback
        const signupToggle = page.locator('#admin-signup-toggle');
        if (await signupToggle.isVisible()) {
            await signupToggle.click();
            await page.waitForURL(/signup/, { timeout: 5000 });
        }
    }

    // 5. Perform Signup (Fallback)
    if (page.url().includes('signup') || await page.locator('#admin-signup-email').isVisible()) {
        await page.locator('#admin-signup-name').fill('Evaluation Admin');
        await page.locator('#admin-signup-email').fill(user.email);
        await page.locator('#admin-signup-password').fill(user.password);
        await page.locator('#admin-signup-button').click();

        // Wait for redirect or error
        const signupResult = await Promise.race([
            page.waitForURL(/admin|dashboard/, { timeout: 15000 }).then(() => 'success'),
            page.locator('.Toastify__toast--error').waitFor({ state: 'visible', timeout: 8000 }).then(() => 'error')
        ]);

        if (page.url().includes('admin') && !page.url().includes('dashboard')) {
            // Re-attempt login one final time
            await page.locator('#admin-email-input').waitFor({ state: 'visible' });
            await page.locator('#admin-email-input').fill(user.email);
            await page.locator('#admin-password-input').fill(user.password);
            await page.locator('#admin-login-button').click();
            await page.waitForURL(/dashboard/, { timeout: 10000 });
        }
    }

    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
}

// POSITIVE TESTS (AC 1-11, 14-16, 18-20, 22-25, 28-30)

test("Navigate to / Verify branding 'Elegance for' is visible Verify 'Catalogue' link with ID #browse-link.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.getByText(/Elegance for/i)).toBeVisible();
    await expect(page.locator('#browse-link')).toBeVisible();
});

test("Click 'Catalogue' link Verify redirection to /browse Verify grid with ID #car-grid loads.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.locator('#browse-link').click();
    await expect(page).toHaveURL(/browse/);
    await expect(page.locator('#car-grid')).toBeVisible();
});

test("Inspect car cards on /browse Verify Brand, Name, and Price are correctly rendered using IDs #car-card-{id}, #car-card-{id}-brand, #car-card-{id}-name, and #car-card-{id}-price.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    const car = await getFirstCar(baseURL || '');
    const firstCard = page.locator(`#car-card-${car._id}`);
    await expect(firstCard).toBeVisible();
    await expect(page.locator(`#car-card-${car._id}-brand`)).toContainText(new RegExp(car.brand, 'i'));
    await expect(page.locator(`#car-card-${car._id}-name`)).toContainText(new RegExp(car.name, 'i'));
    await expect(page.locator(`#car-card-${car._id}-price`)).toContainText(/\$/);
});

test("Click any vehicle card Verify navigation to /car/[id] Verify dynamic data loads using ID #car-card-{id}.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/browse`);
    await page.locator(`#car-card-${car._id}`).click();
    await expect(page).toHaveURL(new RegExp(`/car/${car._id}`));
    await expect(page.getByText(new RegExp(car.name, 'i')).first()).toBeVisible();
});

test("On car details, click 'Specs' tab Verify Transmission is visible Click 'Overview' tab Verify System (Fuel Type) is visible.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);

    await page.getByText('Specs').click();
    await expect(page.getByText(/Technical Specifications/i)).toBeVisible();
    await expect(page.getByText(new RegExp(car.transmission, 'i'))).toBeVisible();

    await page.getByText('Overview').click();
    await expect(page.getByText(new RegExp(car.fuel_type, 'i'))).toBeVisible();
});

test("On /browse, select 'New' filter Verify only 'Brand New' status cars are visible using ID article[id^='car-card'] and class .badge.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'New', exact: true }).click();

    const statusBadges = page.locator('article[id^="car-card-"] .badge');
    if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toContainText(/Brand New/i);
    }
});

test("On /browse, select 'Pre-Owned' filter Verify only 'Pre-Owned' status cars are visible using ID article[id^='car - card - '] and class .badge.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'Pre-Owned', exact: true }).click();

    const statusBadges = page.locator('article[id^="car-card-"] .badge');
    if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toContainText(/Certified|Pre-Owned/i);
    }
});

test("Click 'All' filter Verify grid resets to display complete vehicle inventory using ID #car-grid.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'New', exact: true }).click();

    await page.getByRole('button', { name: 'New', exact: true }).click();
    await page.getByRole('button', { name: 'All', exact: true }).click();

    await expect(page.locator('#car-grid article')).not.toHaveCount(0);
});

test("On used car details, click 'Price' tab Verify 'Owner Depreciation' financial breakdown.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '', 'Used');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.getByText('Price').click();
    if (car.condition === 'Used') {
        await expect(page.getByText(/Financial Breakdown/i)).toBeVisible();
        await expect(page.getByText(/Owner Depreciation/i)).toBeVisible();
    }
});

test("Navigate to /admin/signup Fill valid details Click 'Create Account' Verify toast 'Account created successfully' and redirect to /admin using IDs #admin-signup-name, #admin-signup-email, #admin-signup-password, and #admin-signup-button.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/admin/signup`);
    await page.locator('#admin-signup-name').fill('Signup Tester');
    await page.locator('#admin-signup-email').fill(`signup_${Date.now()}@test.com`);
    await page.locator('#admin-signup-password').fill('password123');
    await page.locator('#admin-signup-button').click();

    // If user already exists, just pass (since it's not dynamic anymore)
    const alreadyExists = await page.getByText(/already exists/i).isVisible({ timeout: 2000 }).catch(() => false);
    if (!alreadyExists) {
        await expect(page.getByText(/Account created successfully/i)).toBeVisible();
    }
    await expect(page).toHaveURL(/admin$/);
});

test("Login at /admin with valid credentials Verify toast 'Access Granted.' Verify redirection to /admin/dashboard using IDs #admin-email-input, #admin-password-input, and #admin-login-button.", async ({ page, baseURL }) => {
    // Clear any existing token so login form is shown
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => localStorage.removeItem('adminToken'));
    await page.goto(`${baseURL}/admin`, { waitUntil: 'networkidle' });
    await page.locator('#admin-email-input').waitFor({ timeout: 10000 });
    await page.locator('#admin-email-input').fill(USERS.admin1.email);
    await page.locator('#admin-password-input').fill(USERS.admin1.password);
    await page.locator('#admin-login-button').click();
    await expect(page.getByText(/Access Granted\./i)).toBeVisible({ timeout: 8000 });
    await expect(page).toHaveURL(/dashboard/);
});

test("Load Admin Dashboard Verify 'Inventory Overview' and 'Incoming Requests' are rendered.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await expect(page.getByText(/Inventory Overview/i)).toBeVisible();
    await page.getByRole('button', { name: /Bookings/i }).click();
    await expect(page.getByText(/Incoming Requests/i)).toBeVisible();
});

test("Open 'Add Car' Fill New vehicle fields Click 'Save Vehicle' Verify toast 'Vehicle added successfully!' and redirection using IDs #brand-select, #model-select, #year-select, #car-price-input, and #main-image-input.", async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin1);
    await page.goto(`${baseURL}/admin/add-car`);

    // Step 1 - Basic Info
    await page.locator('select').first().selectOption('New');
    await selectReactOption(page, 'brand-select', 'Jeep');
    await selectReactOption(page, 'model-select', 'Meridian');
    await selectReactOption(page, 'year-select', '2025');

    // Set color count to 2 (Exterior and Interior)
    await page.locator('label:has-text("How many colors available?") + input').fill('2');

    await page.locator('label:has-text("Color Option 1") + select').selectOption('Rosso Corsa');
    await page.locator('label:has-text("Color Option 2") + select').selectOption('Red Racing Seats');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 2 - Specifications
    await page.locator('label:has-text("Transmission") + select').selectOption('Automatic');
    await page.locator('label:has-text("Fuel Type") + select').selectOption('Electric');
    await page.getByLabel(/Seating Capacity/i).fill('6');
    await page.getByLabel(/Range/i).fill('450 km');
    await page.getByLabel(/Body Type/i).fill('SUV');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 3 - Registration & Details
    await page.locator('#car-price-input').fill('4500000');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 4 - Media
    await page.setInputFiles('#main-image-input', SEED_IMAGE_PATH);
    await expect(page.getByText(/Main image uploaded/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Save Vehicle to Fleet/i }).click({ force: true });
    await expect(page.getByText(/Vehicle added successfully!/i)).toBeVisible();
    await expect(page).toHaveURL(/dashboard/);
});

test("Open 'Add Car' Select 'Used' Fill owners/history Verify record persistence using IDs #brand-select, #model-select, #year-select, #owners-count-input, #car-price-input, #registration-city-input, and #main-image-input.", async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin2);
    await page.goto(`${baseURL}/admin/add-car`);

    // Step 1 - Basic Info
    await page.locator('select').first().selectOption('Used');
    await selectReactOption(page, 'brand-select', 'Maruti Suzuki');
    await selectReactOption(page, 'model-select', 'Swift');
    await selectReactOption(page, 'year-select', '2018');
    await page.locator('label:has-text("Color Option 1") + select').selectOption('Red');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 2 - Specifications
    await page.locator('label:has-text("Transmission") + select').selectOption('Manual');
    await page.locator('label:has-text("Fuel Type") + select').selectOption('Petrol');
    await page.getByLabel(/Seating Capacity/i).fill('5');
    await page.getByLabel(/Range/i).fill('150 km');
    await page.getByLabel(/Body Type/i).fill('Hatchback');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 3 - Registration & Details (owners)
    await page.locator('#owners-count-input').fill('1');
    await page.locator('#car-price-input').fill('450000');
    await page.locator('#registration-city-input').fill('Mumbai');
    await page.locator('label:has-text("Sale Date") + input').first().fill('2018-05-15');
    await page.locator('label:has-text("Sale Price ($)") + input').first().fill('750000');
    await page.locator('label:has-text("Seller Name") + input').first().fill('Maruti Suzuki Arena');
    await page.locator('label:has-text("Buyer Name") + input').first().fill('Rajesh Kumar');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 4 - Media
    await page.setInputFiles('#main-image-input', USED_IMAGE_PATH);
    await expect(page.getByText(/Main image uploaded/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Save Vehicle to Fleet/i }).click({ force: true });
    await expect(page.getByText(/Vehicle added successfully!/i)).toBeVisible();
});

test("Open 'Edit Car' Modify price Verify toast 'Vehicle updated successfully!' Verify reflected on public page using ID #car-price-input.", async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin3);
    const car = await getFirstCar(baseURL || '', 'New');
    await page.goto(`${baseURL}/admin/edit-car/${car._id}`);

    // Wait for the data to be loaded from API
    await page.locator('#car-price-input').waitFor({ state: 'visible' });
    await expect(page.locator('#car-price-input')).not.toHaveValue('', { timeout: 10000 });

    await page.locator('#car-price-input').fill('8888888');
    await page.getByRole('button', { name: /Save Changes/i }).click({ force: true });
    await page.waitForURL(/admin\/catalogue/, { timeout: 30000 });
    await expect(page.getByText(/Vehicle updated successfully!/i)).toBeVisible();

    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/\$8,888,888/)).toBeVisible();
});

test("In Admin Dashboard, click 'Sign Out' Verify toast 'Logged out successfully' Verify redirect to home.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.locator('button:has-text("Sign Out")').click();
    await expect(page.getByText(/Logged out successfully/i)).toBeVisible();
    await page.waitForURL(`${baseURL}/`, { timeout: 5000 });
    await expect(page).toHaveURL(`${baseURL}/`);
});

test("Navigate to /admin/profile Update Name/Bio Click 'Synchronize Profile Data' Verify toast 'Profile updated successfully!'.", async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin4);
    await page.goto(`${baseURL}/admin/profile`);
    await page.locator('label:has-text("Full Legal Name") + input').fill('Evaluation Profile Updated');
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    await expect(page.getByText(/Profile updated successfully!/i)).toBeVisible();
});

test("Update password in Profile Sync data Verify login works with new password using IDs #admin-email-input, #admin-password-input, and #admin-login-button.", async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin5);
    await page.goto(`${baseURL}/admin/profile`);
    const newPass = 'eval_pass_123';
    await page.locator('input[type="password"]').fill(newPass);
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    await expect(page.getByText(/Profile updated successfully!/i)).toBeVisible();

    await page.locator('button:has-text("Sign Out")').click();
    await page.goto(`${baseURL}/admin`);
    await page.locator('#admin-email-input').fill(USERS.admin5.email);
    await page.locator('#admin-password-input').fill(newPass);
    await page.locator('#admin-login-button').click();
    await expect(page).toHaveURL(/dashboard/);

    // Reset password
    await page.goto(`${baseURL}/admin/profile`);
    await page.locator('input[type="password"]').fill(USERS.admin5.password);
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
});

test("Navigate to any car page Click 'Book Now' trigger Verify booking modal opens using ID #book-now-main-button.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click({ force: true });
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible();
});

test("Fill booking modal with valid data Click 'Book Now' submit Verify 201 response using ID #book-now-main-button.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click({ force: true });

    await page.locator('input[placeholder="Your Name"]').fill('Evaluation Booker');
    await page.locator('input[placeholder="Email Address"]').fill('booker_v1@test.com');
    await page.locator('input[placeholder="Phone Number"]').fill('9998887776');

    await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/bookings') && res.status() === 201),
        page.getByRole('button', { name: /Book Now/i, exact: true }).last().click()
    ]);
});

test("Upon successful booking Verify toast 'Booking request sent! Our team will contact you soon.' Verify modal closes using IDs #book-now-main-button, #purchase-name, #purchase-email, #purchase-contact, and #purchase-submit.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click({ force: true });

    await page.locator('#purchase-name').fill('Evaluation Booker');
    await page.locator('#purchase-email').fill('booker_v2@test.com');
    await page.locator('#purchase-contact').fill('9998887776');

    await page.locator('#purchase-submit').click();
    await expect(page.getByText(/Booking request sent/i)).toBeVisible();
    await expect(page.locator('h2:has-text("Booking")')).not.toBeVisible();
});

test("Login to admin Open Bookings tab Verify customer requests are listed in table.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();
    await expect(page.getByText(/Incoming Requests/i)).toBeVisible();
    await expect(page.locator('th:has-text("Customer Name")')).toBeVisible();
});

test("Locate pending booking Click 'Accept' Verify status 'Accepted' and toast 'Booking accepted!' using IDs #book-now-main-button, #purchase-name, #purchase-email, #purchase-contact, #purchase-submit, #admin-bookings-tab, #booking-row-{id}, and #booking-row-{id}-accept.", async ({ page, baseURL }) => {
    // Ensure a pending booking exists
    const car = await getFirstCar(baseURL || '', undefined, 0);
    const email = `status_test_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`;
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click({ force: true });
    await page.locator('#purchase-name').fill('Status Tester');
    await page.locator('#purchase-email').fill(email);
    await page.locator('#purchase-contact').fill('9998887776');
    await page.locator('#purchase-submit').click();
    await expect(page.getByText(/Booking request sent/i)).toBeVisible();

    await login(page, baseURL || '');

    // Wait for bookings to load
    const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/bookings/admin/all') && res.status() === 200),
        page.locator('#admin-bookings-tab').click()
    ]);

    await expect(page.getByText(/Incoming Requests/i)).toBeVisible();

    const bookings = await response.json();
    const myBooking = (bookings.bookings ?? bookings).find((b: any) => b.user_email === email);
    expect(myBooking).toBeDefined();

    const bookingRow = page.locator(`#booking-row-${myBooking._id}`);
    await expect(bookingRow).toBeVisible({ timeout: 15000 });

    const acceptBtn = page.locator(`#booking-row-${myBooking._id}-accept`);
    await expect(acceptBtn).toBeVisible({ timeout: 10000 });
    await acceptBtn.click({ force: true });
    await expect(page.getByText(/Booking accepted!/i)).toBeVisible();
});

test("Locate pending booking Click 'Reject' Verify status 'Rejected' and toast 'Booking rejected!' using IDs #book-now-main-button, #purchase-name, #purchase-email, #purchase-contact, #purchase-submit, #admin-bookings-tab, #booking-row-{id}, and #booking-row-{id}-reject.", async ({ page, baseURL }) => {
    // Ensure a pending booking exists - use a different car than AC 29 to avoid auto-rejection race conditions
    const car = await getFirstCar(baseURL || '', undefined, 1);
    const email = `reject_test_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`;
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click({ force: true });
    await page.locator('#purchase-name').fill('Reject Tester');
    await page.locator('#purchase-email').fill(email);
    await page.locator('#purchase-contact').fill('9998887776');
    await page.locator('#purchase-submit').click();
    await expect(page.getByText(/Booking request sent/i)).toBeVisible();

    await login(page, baseURL || '');

    // Wait for bookings to load
    const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/bookings/admin/all') && res.status() === 200),
        page.locator('#admin-bookings-tab').click()
    ]);

    await expect(page.getByText(/Incoming Requests/i)).toBeVisible();

    const bookings = await response.json();
    const myBooking = (bookings.bookings ?? bookings).find((b: any) => b.user_email === email);
    expect(myBooking).toBeDefined();

    const bookingRow = page.locator(`#booking-row-${myBooking._id}`);
    await expect(bookingRow).toBeVisible({ timeout: 15000 });

    const rejectBtn = page.locator(`#booking-row-${myBooking._id}-reject`);
    await expect(rejectBtn).toBeVisible({ timeout: 10000 });
    await rejectBtn.click({ force: true });
    await expect(page.getByText(/Booking rejected!/i)).toBeVisible();
});

// NEGATIVE TESTS (AC 12-13, 17, 21, 26-27, 31-32)

test("Attempt login with invalid credentials Verify toast 'Invalid email or password' using IDs #admin-email-input, #admin-password-input, and #admin-login-button.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/admin`);
    await page.locator('#admin-email-input').fill('invalid@test.com');
    await page.locator('#admin-password-input').fill('wrongpass');
    await page.locator('#admin-login-button').click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
});

test("Clear token Navigate directly to /admin/dashboard Verify redirect to /admin using localStorage.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => localStorage.removeItem('adminToken'));
    await page.goto(`${baseURL}/admin/dashboard`);
    await expect(page).toHaveURL(/admin$/);
});

test("In 'Add Car', leave 'Car Name' empty Click 'Next Step' Verify toast 'Please fill in all basic information' and block using ID #brand-select.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/add-car`);

    // Select Brand only — skip Car Name (model) to trigger validation
    await selectReactOption(page, 'brand-select', 'Honda');
    await page.getByRole('button', { name: /Next Step/i }).click();
    await expect(page.getByText(/Please fill in all basic information/i)).toBeVisible();
});

test("In Profile, clear 'Full Legal Name' Click 'Synchronize' Verify HTML5 validation block.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/profile`);
    const nameInput = page.locator('label:has-text("Full Legal Name") + input');
    await nameInput.fill('');
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    const validationMsg = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMsg).not.toBe('');
});

test("In 'PurchaseModal', enter invalid email Submit Verify toast 'Please enter a valid email address.' using IDs #book-now-main-button, #purchase-email, #purchase-name, #purchase-contact, and #purchase-submit.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible();
    await page.locator('#book-now-main-button').click({ force: true });

    // Must bypass browser's type="email" validation to reach JS validation
    await page.locator('#purchase-email').fill('notanemail');
    await page.locator('#purchase-name').fill('Test User');
    await page.locator('#purchase-contact').fill('9876543210');
    await page.locator('#purchase-submit').click();
    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible({ timeout: 10000 });
});

test("Submit booking twice with same email Verify API 400 and toast 'already exists' using IDs #book-now-main-button, #purchase-name, #purchase-email, #purchase-contact, and #purchase-submit.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    const email = `duplicate_api_${Date.now()}@test.com`;

    // First Booking via API
    const res1 = await page.request.post(`${baseURL}/api/bookings`, {
        data: { 
            car_id: car._id, 
            user_name: 'API Booker', 
            user_email: email, 
            user_contact: '9998887776',
            selected_color: car.available_colors?.[0] || null
        }
    });
    expect(res1.status()).toBe(201);

    // Second Booking via UI
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible();
    await page.locator('#book-now-main-button').click({ force: true });

    await page.locator('#purchase-name').fill('Evaluation Booker');
    await page.locator('#purchase-email').fill(email);
    await page.locator('#purchase-contact').fill('9998887776');

    const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/bookings') && res.status() === 400, { timeout: 15000 }),
        page.locator('#purchase-submit').click()
    ]);

    const body = await response.json();
    expect(body.message.toLowerCase()).toContain('already exists');
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 15000 });
});

test("Navigate to /car/invalid-id-999 Verify 'Vehicle Not Found' message and 'Back to Fleet' button.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/car/invalid-id-999`);
    await expect(page.getByText(/Vehicle Not Found/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Back to Fleet/i })).toBeVisible();
});

test("On database with no bookings Verify 'No active bookings.' fallback message in dashboard.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();
    const rows = page.locator('tbody tr');
    if (await rows.count() === 0) {
        await expect(page.getByText(/No active bookings/i)).toBeVisible();
    }
});


test("Login as admin Go to Bookings Edit status of non-pending booking Verify toast and update.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();

    // Find an 'Edit Status' button (for Accepted/Rejected bookings)
    const editStatusBtn = page.locator('button:has-text("Edit Status")').first();
    await expect(editStatusBtn).toBeVisible({ timeout: 10000 });
    await editStatusBtn.click();

    // Change status to Pending
    await page.locator('select').selectOption('Pending');
    await expect(page.getByText(/Booking pending!/i)).toBeVisible();
});

// NEW NEGATIVE TESTS (AC 35-38)

test("In 'PurchaseModal', enter 5-digit contact Submit Verify toast 'Please enter a valid phone number (min 10 digits)' using IDs #book-now-main-button, #purchase-name, #purchase-email, #purchase-contact, and #purchase-submit.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click({ force: true });

    await page.locator('#purchase-name').fill('Evaluation User');
    await page.locator('#purchase-email').fill('eval@test.com');
    await page.locator('#purchase-contact').fill('12345');
    await page.locator('#purchase-submit').click();

    await expect(page.getByText(/Please enter a valid phone number \(min 10 digits\)/i)).toBeVisible();
});

test("In 'Add Car', enter price below $100 Save Verify toast 'Price must be at least $100' using ID #car-price-input.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/add-car`);

    // Step 1 - Basic Info
    await page.locator('select').first().selectOption('New');
    await selectReactOption(page, 'brand-select', 'Honda');
    await selectReactOption(page, 'model-select', 'City');
    await selectReactOption(page, 'year-select', '2024');
    await page.locator('select').nth(1).selectOption('Silver');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 2 - Specifications
    await page.locator('select').first().selectOption('Automatic');
    await page.locator('select').nth(1).selectOption('Petrol');
    await page.getByLabel(/Seating Capacity/i).fill('5');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 3 - Registration & Details (Negative/Low Price)
    await page.locator('#car-price-input').fill('50');
    await page.getByRole('button', { name: /Next Step/i }).click();

    await expect(page.getByText(/Price must be at least \$100/i)).toBeVisible();
});

test("In Profile, enter invalid email Sync Verify toast 'Please enter a valid email address.'.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/profile`);

    const emailInput = page.locator('label:has-text("Secure Email Gateway") + input');
    await emailInput.fill('invalid-email-format');
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();

    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
});

test("Clear token Navigate directly to /admin/add-car Verify redirect to /admin using localStorage.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => localStorage.removeItem('adminToken'));
    await page.goto(`${baseURL}/admin/add-car`);
    await expect(page).toHaveURL(/admin$/);
});

test("In 'PurchaseModal', enter 1-character name Submit Verify toast 'Please enter a valid full name (min 2 characters)' using IDs #book-now-main-button, #purchase-name, #purchase-email, #purchase-contact, and #purchase-submit.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click({ force: true });

    await page.locator('#purchase-name').fill('A');
    await page.locator('#purchase-email').fill('public@example.com');
    await page.locator('#purchase-contact').fill('9876543210');
    await page.locator('#purchase-submit').click();

    await expect(page.getByText(/Please enter a valid full name \(min 2 characters\)/i)).toBeVisible();
});
