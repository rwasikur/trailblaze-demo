import { test, expect, request as playwrightRequest } from '@playwright/test';

const USERS = {
    admin1: { email: 'admin1@pub.com', password: 'pub123' },
    admin2: { email: 'admin2@pub.com', password: 'pub123' }
};

// Helpers
async function getCars(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    const body = await res.json();
    const cars = (body.cars ?? body);
    await ctx.dispose();
    return cars.filter((c: any) => c.availability_status === 'Available');
}

async function login(page: any, baseURL: string, user = USERS.admin1) {
    await page.goto(`${baseURL}/admin`, { waitUntil: 'networkidle' });
    await page.locator('#admin-email-input').fill(user.email);
    await page.locator('#admin-password-input').fill(user.password);
    await page.locator('#admin-login-button').click();
    await page.waitForURL(/dashboard/, { timeout: 30000 });
}

// POSITIVE TESTS

test('Public users can toggle vehicles for comparison using a dedicated \'Compare\' button on the /browse page, triggering a success toast and a glassmorphic floating bar showing accurate selection counts.', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    const carCards = page.locator('article[id^="car-card-"]');
    await expect(carCards.first()).toBeVisible();

    // Toggle first car
    const compareBtn = carCards.first().locator('.compare-toggle-btn').first();
    await compareBtn.click();

    // Expect toast and internal state change (button style)
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    await expect(compareBtn).toHaveClass(/bg-blue-600/);

    // Select second car
    await carCards.nth(1).locator('.compare-toggle-btn').first().click();

    const floatingBar = page.locator('.fixed.bottom-10');
    await expect(floatingBar).toBeVisible();
    await expect(floatingBar).toContainText('2');
});

test('Selection status persists when navigating between the catalog, individual vehicle details page, and back, with the button state reflecting \'In Comparison\'.', async ({ page, baseURL }) => {
    const cars = await getCars(baseURL || '');
    const firstCar = cars[0];

    // Select on Catalog
    await page.goto(`${baseURL}/browse`);
    await page.locator(`article[id="car-card-${firstCar._id}"] .compare-toggle-btn`).first().click();

    // Navigate to Details
    await page.goto(`${baseURL}/car/${firstCar._id}`);
    await expect(page.locator('#detail-compare-btn')).toHaveText(/In Comparison/i);

    // Navigate back to Catalog
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator('.fixed.bottom-10')).toContainText('1');
});

test('Users can add/remove vehicles from comparison directly from the /car/:id overview section using a matching \'Compare\' toggle with toast confirmation on addition.', async ({ page, baseURL }) => {
    const cars = await getCars(baseURL || '');
    const firstCar = cars[0];

    await page.goto(`${baseURL}/car/${firstCar._id}`);
    const compareBtn = page.locator('#detail-compare-btn');

    // Select on Detail Page
    await compareBtn.click();
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    await expect(compareBtn).toHaveText(/In Comparison/i);

    // Remove on Detail Page
    await compareBtn.click();
    await expect(compareBtn).toHaveText(/\+ Compare/i);
});

test('Comparing 2 or more vehicles generates a technical side-by-side spec table on the /compare page.', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    const carCards = page.locator('article[id^="car-card-"]');

    await carCards.nth(0).locator('.compare-toggle-btn').first().click();
    await carCards.nth(1).locator('.compare-toggle-btn').first().click();

    await page.locator('a:has-text("Compare Now")').click();
    await expect(page).toHaveURL(/compare/);

    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('table')).toContainText('Parameters');
});

test('Each column in the comparison matrix features the vehicle\'s high-resolution image and a \'View Masterpiece\' button that successfully lands the user on the specific /car/:id profile.', async ({ page, baseURL }) => {
    const allCars = await getCars(baseURL || '');
    const carA = allCars[0];
    const carB = allCars[1];

    await page.goto(`${baseURL}/browse`);
    await page.locator(`article[id="car-card-${carA._id}"] .compare-toggle-btn`).first().click();
    await page.locator(`article[id="car-card-${carB._id}"] .compare-toggle-btn`).first().click();

    await page.locator('a:has-text("Compare Now")').click();
    await page.waitForURL(/compare/);

    await expect(page.locator('table img')).toHaveCount(2);
    await expect(page.locator('button:has-text("View Masterpiece")')).toHaveCount(2);

    const secondDetailBtn = page.locator('button:has-text("View Masterpiece")').nth(1);
    await secondDetailBtn.click();

    await expect(page).toHaveURL(new RegExp(`/car/(${carA._id}|${carB._id})`));
});

test('Authenticated administrators can utilize the comparison system while managing the fleet to evaluate market positioning.', async ({ page, baseURL }) => {
    await login(page, baseURL || '', USERS.admin2);
    await page.goto(`${baseURL}/browse`);

    const carCards = page.locator('article[id^="car-card-"]');
    await carCards.nth(0).locator('.compare-toggle-btn').first().click();
    await carCards.nth(1).locator('.compare-toggle-btn').first().click();

    await page.locator('a:has-text("Compare Now")').click();
    await expect(page.locator('table')).toBeVisible();
});

test('Users can click a \'Clear Comparison\' button within the floating comparison bar to instantly remove all currently selected vehicles from the comparison list and hide the bar.', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    const carCards = page.locator('article[id^="car-card-"]');

    // Select two cars
    await carCards.nth(0).locator('.compare-toggle-btn').first().click();
    await carCards.nth(1).locator('.compare-toggle-btn').first().click();

    const floatingBar = page.locator('.fixed.bottom-10');
    await expect(floatingBar).toBeVisible();

    const clearBtn = page.locator('button[title="Clear Comparison"]');
    await clearBtn.click();

    await expect(floatingBar).toBeHidden();
});

// NEGATIVE TESTS

test('Attempting to select more than 4 vehicles triggers a warning toast: \'Maximum 4 vehicles can be compared at once\' and blocks the addition.', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    const carCards = page.locator('article[id^="car-card-"]');

    for (let i = 0; i < 4; i++) {
        await carCards.nth(i).locator('.compare-toggle-btn').first().click();
    }

    await carCards.nth(4).locator('.compare-toggle-btn').first().click();
    await expect(page.locator('.Toastify__toast--warning')).toContainText('Maximum 4 vehicles can be compared at once');
});

test('Attempting to launch a comparison with fewer than 2 vehicles triggers an info toast: \'Select at least 2 vehicles to compare\' and prevents navigation.', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.locator('article[id^="car-card-"]').first().locator('.compare-toggle-btn').first().click();

    const compareLink = page.locator('a:has-text("Compare Now")');
    await compareLink.click();

    await expect(page.locator('.Toastify__toast--info')).toContainText('Select at least 2 vehicles to compare');
    await expect(page).toHaveURL(/browse/);
});

test('Direct navigation to /compare with no vehicles selected displays a \'Comparison Empty\' fallback with a Browse Fleet option.', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/compare`);
    await expect(page.locator('h2')).toContainText('Comparison Empty');
    const backBtn = page.locator('button:has-text("Browse Fleet")');
    await backBtn.click();
    await expect(page).toHaveURL(/browse/);
});
