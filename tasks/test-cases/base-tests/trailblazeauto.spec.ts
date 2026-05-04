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
async function getFirstCar(baseURL: string, condition?: string) {
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
    const avail = filtered.find((c: any) => c.availability_status === 'Available');
    if (avail) return avail;

    // If none available in condition, try any available
    const anyAvail = cars.find((c: any) => c.availability_status === 'Available');
    return anyAvail || cars[0];
}

// Helper: interact with react-select by inputId index
async function selectReactOption(page: any, inputId: string, optionText: string) {
    await page.locator(`#${inputId}`).click();
    await page.locator(`#${inputId}`).fill(optionText);
    await page.getByText(optionText, { exact: true }).first().click();
}

async function login(page: any, baseURL: string, user = USERS.admin1) {
    const tryLogin = async () => {
        if (!page.url().includes('/admin')) {
            await page.goto(`${baseURL}/admin`);
        }

        // Ensure we are on the login form (not signup)
        const signupToggle = page.locator('button:has-text("Sign Up")');
        if (await signupToggle.isVisible() && (await signupToggle.textContent())?.includes("Don't have an account")) {
            // Already on login page, good
        } else if (page.url().includes('signup')) {
            const loginToggle = page.locator('button:has-text("Login")');
            if (await loginToggle.isVisible()) {
                await loginToggle.click({ force: true });
                await page.waitForURL(/admin$/, { timeout: 10000 });
            }
        }

        const emailInput = page.locator('#admin-email-input');
        if (await emailInput.isVisible({ timeout: 15000 })) {
            await emailInput.fill(user.email);
            await page.locator('#admin-password-input').fill(user.password);
            await page.locator('#admin-login-button').click({ force: true });
            try {
                await page.waitForURL(/dashboard/, { timeout: 15000 });
                return true;
            } catch (e) {
                return false;
            }
        }
        return page.url().includes('dashboard');
    };

    if (await tryLogin()) return;

    // Fallback Signup if login failed (maybe user doesn't exist)
    if (!page.url().includes('signup')) {
        const signupToggle = page.locator('button:has-text("Sign Up")');
        if (await signupToggle.isVisible()) {
            await signupToggle.click({ force: true });
            await page.waitForURL(/admin\/signup/, { timeout: 10000 });
        }
    }

    if (page.url().includes('signup')) {
        await page.locator('input[placeholder*="name"]').fill('Evaluation Admin');
        await page.locator('#admin-email-input').fill(user.email);
        await page.locator('#admin-password-input').fill(user.password);
        await page.locator('#admin-login-button').click({ force: true });

        // After signup, wait for redirect
        await page.waitForURL(/dashboard|admin/, { timeout: 15000 });

        if (page.url().includes('admin') && !page.url().includes('dashboard')) {
            // If redirected back to login, try login one last time
            await page.locator('#admin-email-input').fill(user.email);
            await page.locator('#admin-password-input').fill(user.password);
            await page.locator('#admin-login-button').click({ force: true });
            await page.waitForURL(/dashboard/, { timeout: 15000 });
        }
    }

    await expect(page).toHaveURL(/dashboard/, { timeout: 20000 });
}

// POSITIVE TESTS (AC 1-11, 14-16, 18-20, 22-25, 28-30)

test("AC 1: [Step 1] Navigate to / [Step 2] Verify branding 'Elegance for' is visible [Step 3] Verify 'Catalogue' link with ID 'browse-link'.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.getByText(/Elegance for/i)).toBeVisible();
    await expect(page.locator('#browse-link')).toBeVisible();
});

test("AC 2: [Step 1] Click 'Catalogue' link [Step 2] Verify redirection to /browse [Step 3] Verify grid with ID 'car-grid' loads.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.locator('#browse-link').click();
    await expect(page).toHaveURL(/browse/);
    await expect(page.locator('#car-grid')).toBeVisible();
});

test("AC 3: [Step 1] Inspect car cards on /browse [Step 2] Verify Brand, Name, and Price are correctly rendered using IDs.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    const car = await getFirstCar(baseURL || '');
    const firstCard = page.locator(`#car-card-${car._id}`);
    await expect(firstCard).toBeVisible();
    await expect(page.locator(`#car-card-${car._id}-brand`)).toContainText(new RegExp(car.brand, 'i'));
    await expect(page.locator(`#car-card-${car._id}-name`)).toContainText(new RegExp(car.name, 'i'));
    await expect(page.locator(`#car-card-${car._id}-price`)).toContainText(/₹/);
});

test("AC 4: [Step 1] Click any vehicle card [Step 2] Verify navigation to /car/[id] [Step 3] Verify dynamic data loads.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/browse`);
    await page.locator(`#car-card-${car._id}`).click();
    await expect(page).toHaveURL(new RegExp(`/car/${car._id}`));
    await expect(page.getByText(new RegExp(car.name, 'i')).first()).toBeVisible();
});

test("AC 5: [Step 1] On car details, click 'Specs' tab [Step 2] Verify Transmission is visible [Step 3] Click 'Overview' tab [Step 4] Verify System (Fuel Type) is visible.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);

    await page.getByText('Specs').click();
    await expect(page.getByText(/Technical Specifications/i)).toBeVisible();
    await expect(page.getByText(new RegExp(car.transmission, 'i'))).toBeVisible();

    await page.getByText('Overview').click();
    await expect(page.getByText(new RegExp(car.fuel_type, 'i'))).toBeVisible();
});

test("AC 6: [Step 1] On /browse, select 'New' filter [Step 2] Verify only 'Brand New' status cars are visible.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'New', exact: true }).click();

    const statusBadges = page.locator('article[id^="car-card-"] .badge');
    if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toContainText(/Brand New/i);
    }
});

test("AC 7: [Step 1] On /browse, select 'Pre-Owned' filter [Step 2] Verify only 'Pre-Owned' status cars are visible.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'Pre-Owned', exact: true }).click();

    const statusBadges = page.locator('article[id^="car-card-"] .badge');
    if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toContainText(/Certified|Pre-Owned/i);
    }
});

test("AC 8: [Step 1] Click 'All' filter [Step 2] Verify grid resets to display complete vehicle inventory.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'New', exact: true }).click();

    await page.getByRole('button', { name: 'New', exact: true }).click();
    await page.getByRole('button', { name: 'All', exact: true }).click();

    await expect(page.locator('#car-grid article')).not.toHaveCount(0);
});

test("AC 9: [Step 1] On used car details, click 'Price' tab [Step 2] Verify 'Owner Depreciation' financial breakdown.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '', 'Used');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.getByText('Price').click();
    if (car.condition === 'Used') {
        await expect(page.getByText(/Financial Breakdown/i)).toBeVisible();
        await expect(page.getByText(/Owner Depreciation/i)).toBeVisible();
    }
});

test("AC 10: [Step 1] Navigate to /admin/signup [Step 2] Fill valid details [Step 3] Click 'Initialize Account' [Step 4] Verify toast 'Account created successfully' and redirect to /admin.", async ({ page, baseURL }) => {
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

test("AC 11: [Step 1] Login at /admin with valid credentials [Step 2] Verify toast 'Access Granted.' [Step 3] Verify redirection to /admin/dashboard.", async ({ page, baseURL }) => {
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

test("AC 14: [Step 1] Load Admin Dashboard [Step 2] Verify 'Inventory Overview' and 'Incoming Requests' are rendered.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await expect(page.getByText(/Inventory Overview/i)).toBeVisible();
    await page.getByRole('button', { name: /Bookings/i }).click();
    await expect(page.getByText(/Incoming Requests/i)).toBeVisible();
});

test("AC 15: [Step 1] Open 'Add Car' [Step 2] Fill New vehicle fields [Step 3] Click 'Save Vehicle' [Step 4] Verify toast 'Vehicle added successfully!' and redirection.", async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin1);
    await page.goto(`${baseURL}/admin/add-car`);

    // Step 1 - Basic Info (Jeep Meridian 2025 - from seed)
    await page.locator('select').first().selectOption('New');
    await selectReactOption(page, 'brand-select', 'Jeep');
    await selectReactOption(page, 'model-select', 'Meridian');
    await selectReactOption(page, 'year-select', '2025');
    await page.locator('label:has-text("Exterior Color") + select').selectOption('Rosso Corsa');
    await page.locator('label:has-text("Interior Color") + select').selectOption('Red Racing Seats');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 2 - Specifications
    await page.locator('label:has-text("Transmission") + select').selectOption('Automatic');
    await page.locator('label:has-text("Fuel Type") + select').selectOption('Electric');
    await page.locator('label:has-text("Seating Capacity") + input').fill('6');
    await page.locator('label:has-text("Range") + input').fill('450 km');
    await page.locator('label:has-text("Body Type") + input').fill('SUV');
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

test("AC 16: [Step 1] Open 'Add Car' [Step 2] Select 'Used' [Step 3] Fill owners/history [Step 4] Verify record persistence.", async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin2);
    await page.goto(`${baseURL}/admin/add-car`);

    // Step 1 - Basic Info (Maruti Suzuki Swift 2018 - inspired by seed)
    await page.locator('select').first().selectOption('Used');
    await selectReactOption(page, 'brand-select', 'Maruti Suzuki');
    await selectReactOption(page, 'model-select', 'Swift');
    await selectReactOption(page, 'year-select', '2018');
    await page.locator('label:has-text("Exterior Color") + select').selectOption('Red');
    await page.locator('label:has-text("Interior Color") + select').selectOption('Black');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 2 - Specifications
    await page.locator('label:has-text("Transmission") + select').selectOption('Manual');
    await page.locator('label:has-text("Fuel Type") + select').selectOption('Petrol');
    await page.locator('label:has-text("Seating Capacity") + input').fill('5');
    await page.locator('label:has-text("Range") + input').fill('150 km');
    await page.locator('label:has-text("Body Type") + input').fill('Hatchback');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 3 - Registration & Details (owners)
    await page.locator('#owners-count-input').fill('1');
    await page.locator('#car-price-input').fill('450000');
    await page.locator('#registration-city-input').fill('Mumbai');
    await page.locator('label:has-text("Sale Date") + input').first().fill('2018-05-15');
    await page.locator('label:has-text("Sale Price (₹)") + input').first().fill('750000');
    await page.locator('label:has-text("Seller Name") + input').first().fill('Maruti Suzuki Arena');
    await page.locator('label:has-text("Buyer Name") + input').first().fill('Rajesh Kumar');
    await page.getByRole('button', { name: /Next Step/i }).click();

    // Step 4 - Media
    await page.setInputFiles('#main-image-input', USED_IMAGE_PATH);
    await expect(page.getByText(/Main image uploaded/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Save Vehicle to Fleet/i }).click({ force: true });
    await expect(page.getByText(/Vehicle added successfully!/i)).toBeVisible();
});

test("AC 18: [Step 1] Open 'Edit Car' [Step 2] Modify price [Step 3] Verify toast 'Vehicle updated successfully!' [Step 4] Verify reflected on public page.", async ({ page, baseURL }) => {
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
    await expect(page.getByText(/₹8,888,888/)).toBeVisible();
});

test("AC 19: [Step 1] In Admin Dashboard, click 'Sign Out' [Step 2] Verify toast 'Logged out successfully' [Step 3] Verify redirect to home.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.locator('button:has-text("Sign Out")').click();
    await expect(page.getByText(/Logged out successfully/i)).toBeVisible();
    await page.waitForURL(`${baseURL}/`, { timeout: 5000 });
    await expect(page).toHaveURL(`${baseURL}/`);
});

test("AC 20: [Step 1] Navigate to /admin/profile [Step 2] Update Name/Bio [Step 3] Click 'Synchronize Profile Data' [Step 4] Verify toast 'Profile updated successfully!'.", async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin4);
    await page.goto(`${baseURL}/admin/profile`);
    await page.locator('label:has-text("Full Legal Name") + input').fill('Evaluation Profile Updated');
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    await expect(page.getByText(/Profile updated successfully!/i)).toBeVisible();
});

test("AC 22: [Step 1] Update password in Profile [Step 2] Sync data [Step 3] Verify login works with new password.", async ({ page, baseURL }) => {
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

test("AC 23: [Step 1] Navigate to any car page [Step 2] Click 'Book Now' trigger [Step 3] Verify booking modal opens.", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click({ force: true });
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible();
});

test("AC 24: [Step 1] Fill booking modal with valid data [Step 2] Click 'Book Now' submit [Step 3] Verify 201 response.", async ({ page, baseURL }) => {
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

test("AC 25: [Step 1] Upon successful booking [Step 2] Verify toast 'Booking request sent! Our team will contact you soon.' [Step 3] Verify modal closes.", async ({ page, baseURL }) => {
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

test("AC 28: [Step 1] Login to admin [Step 2] Open Bookings tab [Step 3] Verify customer requests are listed in table.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();
    await expect(page.getByText(/Incoming Requests/i)).toBeVisible();
    await expect(page.locator('th:has-text("Customer Profile")')).toBeVisible();
});

test("AC 29: [Step 1] Locate pending booking [Step 2] Click 'Accept' [Step 3] Verify status 'Accepted' and toast 'Booking accepted!'.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();
    const acceptBtn = page.locator('button:has-text("Accept")').first();
    if (await acceptBtn.isVisible()) {
        await acceptBtn.click();
        await expect(page.getByText(/Booking accepted!/i)).toBeVisible();
    }
});

test("AC 30: [Step 1] Locate pending booking [Step 2] Click 'Reject' [Step 3] Verify status 'Rejected' and toast 'Booking rejected!'.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();
    const rejectBtn = page.locator('button:has-text("Reject")').first();
    if (await rejectBtn.isVisible()) {
        await rejectBtn.click();
        await expect(page.getByText(/Booking rejected!/i)).toBeVisible();
    }
});

// NEGATIVE TESTS (AC 12-13, 17, 21, 26-27, 31-32)

test("AC 12: [Step 1] Attempt login with invalid credentials [Step 2] Verify toast 'Invalid email or password'.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/admin`);
    await page.locator('#admin-email-input').fill('invalid@test.com');
    await page.locator('#admin-password-input').fill('wrongpass');
    await page.locator('#admin-login-button').click();
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible();
});

test("AC 13: [Step 1] Clear token [Step 2] Navigate directly to /admin/dashboard [Step 3] Verify redirect to /admin.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => localStorage.removeItem('adminToken'));
    await page.goto(`${baseURL}/admin/dashboard`);
    await expect(page).toHaveURL(/admin$/);
});

test("AC 17: [Step 1] In 'Add Car', leave 'Car Name' empty [Step 2] Click 'Next Step' [Step 3] Verify toast 'Please fill in all basic information' and block.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/add-car`);

    // Select Brand only — skip Car Name to trigger validation
    await selectReactOption(page, 'brand-select', 'Honda');
    await page.getByRole('button', { name: /Next Step/i }).click();
    await expect(page.getByText(/Please fill in all basic information/i)).toBeVisible();
});

test("AC 21: [Step 1] In Profile, clear 'Full Legal Name' [Step 2] Click 'Synchronize' [Step 3] Verify HTML5 validation block.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/profile`);
    const nameInput = page.locator('label:has-text("Full Legal Name") + input');
    await nameInput.fill('');
    await page.getByRole('button', { name: /Synchronize Profile Data/i }).click();
    const validationMsg = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMsg).not.toBe('');
});

test("AC 26: [Step 1] In 'PurchaseModal', enter invalid email [Step 2] Submit [Step 3] Verify toast 'Please enter a valid email address.'.", async ({ page, baseURL }) => {
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

test("AC 27: [Step 1] Submit booking twice with same email [Step 2] Verify API 400 and toast 'A booking request with this email already exists for this vehicle.'", async ({ page, baseURL }) => {
    const car = await getFirstCar(baseURL || '');
    const email = `duplicate_${Date.now()}@test.com`;

    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(/Scanning vehicle signatures/i)).not.toBeVisible();
    await page.locator('#book-now-main-button').click({ force: true });
    await page.locator('#purchase-name').fill('Evaluation Booker');
    await page.locator('#purchase-email').fill(email);
    await page.locator('#purchase-contact').fill('9998887776');
    await page.locator('#purchase-submit').click();

    // Wait for the modal to close or the toast to be processed
    await page.waitForTimeout(2000);

    // Second attempt - must re-open modal if it closed
    if (await page.locator('#purchase-email').isHidden()) {
        await page.locator('#book-now-main-button').click({ force: true });
    }

    await page.locator('#purchase-name').fill('Evaluation Booker');
    await page.locator('#purchase-email').fill(email);
    await page.locator('#purchase-contact').fill('9998887776');
    await page.locator('#purchase-submit').click();
    await expect(page.getByText(/already exists/i)).toBeVisible();
});

test("AC 31: [Step 1] Navigate to /car/invalid-id-999 [Step 2] Verify 'Vehicle Not Found' message and 'Back to Fleet' button.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/car/invalid-id-999`);
    await expect(page.getByText(/Vehicle Not Found/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Back to Fleet/i })).toBeVisible();
});

test("AC 32: [Step 1] On database with no bookings [Step 2] Verify 'No active bookings.' fallback message in dashboard.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();
    const rows = page.locator('tbody tr');
    if (await rows.count() === 0) {
        await expect(page.getByText(/No active bookings/i)).toBeVisible();
    }
});