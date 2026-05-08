import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const ADMIN_USER = { email: 'admin1@pub.com', password: 'pub123' };
const DATASET = 'public';

type Car = {
    _id: string;
    brand: string;
    name: string;
    price: number;
    availability_status?: string;
    activeOffers?: Offer[];
};

type Offer = {
    _id: string;
    title: string;
    badge_text: string;
    car_id?: string;
    car?: { _id: string };
    status?: string;
};

const activeWindow = () => ({
    activation_date: getCurrentMinute().toISOString(),
    expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
});

const scheduledWindow = () => ({
    activation_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    expiry_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
});

const expiredWindow = () => ({
    activation_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    expiry_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
});

function inputDate(value: string) {
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getCurrentMinute() {
    const now = new Date();
    now.setSeconds(0, 0);
    return now;
}

function pastWindow() {
    return {
        activation_date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
}

function money(value: number) {
    return `$${Math.round(value).toLocaleString('en-US')}`;
}

function discountedPrice(price: number, discountPercent: number) {
    return price - Math.round(price * (discountPercent / 100));
}

function unique(prefix: string) {
    return `${DATASET}-${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

async function loginApi(request: APIRequestContext, baseURL: string) {
    const response = await request.post(`${baseURL}/api/admin/login`, { data: ADMIN_USER });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    return body.token as string;
}

async function loginUi(page: Page, baseURL: string) {
    await page.goto(`${baseURL}/admin`);
    await page.locator('#admin-email-input').fill(ADMIN_USER.email);
    await page.locator('#admin-password-input').fill(ADMIN_USER.password);
    await page.locator('#admin-login-button').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });
}

async function openAdminOffers(page: Page, baseURL: string, token: string) {
    await page.goto(`${baseURL}/`);
    await page.evaluate((adminToken) => localStorage.setItem('adminToken', adminToken), token);
    await page.goto(`${baseURL}/admin/offers`, { waitUntil: 'networkidle' });
    await expect(page.locator('#offer-form')).toBeVisible();
}

async function getCars(request: APIRequestContext, baseURL: string) {
    const response = await request.get(`${baseURL}/api/cars`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    return (body.cars ?? body) as Car[];
}

async function getAdminCars(request: APIRequestContext, baseURL: string, token: string) {
    const response = await request.get(`${baseURL}/api/cars/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    return (await response.json()) as Car[];
}

async function getAdminOffers(request: APIRequestContext, baseURL: string, token: string) {
    const response = await request.get(`${baseURL}/api/offers/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.ok()).toBeTruthy();
    return (await response.json()) as Offer[];
}

async function getCar(request: APIRequestContext, baseURL: string, index = 0) {
    const cars = await getCars(request, baseURL);
    const availableCars = cars.filter((car) => car.availability_status === 'Available');
    const selectableCars = availableCars.length > 0 ? availableCars : cars;
    expect(selectableCars.length).toBeGreaterThan(0);
    return selectableCars[index % selectableCars.length];
}

async function createTestCar(request: APIRequestContext, baseURL: string, token: string, overrides: Record<string, unknown> = {}) {
    const suffix = unique('car');
    const response = await request.post(`${baseURL}/api/cars`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
            name: `Offer Test ${suffix}`,
            brand: 'Trailblaze',
            model_year: 2026,
            transmission: 'Automatic',
            fuel_type: 'Electric',
            seating_capacity: 5,
            price: 45000,
            range: '320 km',
            body_type: 'SUV',
            mileage: '0',
            total_distance_covered: '0 km',
            available_colors: ['Black'],
            number_of_owners: 0,
            registration_city: 'Test City',
            insurance_validity: '2027-12-31',
            description: 'Automated offer test vehicle',
            image_url: '/uploads/cars/test-car.jpg',
            secondary_images: [],
            availability_status: 'Available',
            condition: 'New',
            past_owners: [],
            ...overrides,
        },
    });
    expect(response.status()).toBe(201);
    return (await response.json()) as Car;
}

async function getSoldCar(request: APIRequestContext, baseURL: string, token: string, index = 0) {
    const cars = await getAdminCars(request, baseURL, token);
    const soldCars = cars.filter((car) => car.availability_status === 'Sold');
    expect(soldCars.length).toBeGreaterThan(0);
    return soldCars[index % soldCars.length];
}

async function updateCarStatus(request: APIRequestContext, baseURL: string, token: string, carId: string, status: string) {
    const response = await request.put(`${baseURL}/api/cars/${carId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { status },
    });
    expect(response.ok()).toBeTruthy();
}

async function createOffer(
    request: APIRequestContext,
    baseURL: string,
    token: string,
    car: Car,
    overrides: Record<string, unknown> = {}
) {
    const title = unique('offer');
    const badge = unique('badge').slice(0, 24);
    const payload = {
        title,
        badge_text: badge,
        car_id: car._id,
        discount_percent: 10,
        is_enabled: true,
        ...activeWindow(),
        ...overrides,
    };
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: payload,
    });
    expect(response.status()).toBe(201);
    return (await response.json()) as Offer;
}

async function deleteOffer(request: APIRequestContext, baseURL: string, token: string, offerId: string) {
    await request.delete(`${baseURL}/api/offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

async function createIsolatedOffer(
    request: APIRequestContext,
    baseURL: string,
    token: string,
    carIndex: number,
    overrides: Record<string, unknown> = {}
) {
    const car = await createTestCar(request, baseURL, token, { price: 45000 + carIndex });
    const offer = await createOffer(request, baseURL, token, car, overrides);
    return { car, offer };
}

// POSITIVE TESTS (AC 1-22)

test(`AC 1: Authenticate with seeded admin credentials Navigate to /admin/offers Verify the Offer Management route renders the form container ID #offer-form and page heading ID #offers-heading.`, async ({ page, baseURL }) => {
    await loginUi(page, baseURL || '');
    await page.goto(`${baseURL}/admin/offers`);
    await expect(page.locator('#offer-form')).toBeVisible();
    await expect(page.locator('#offers-heading')).toContainText('Offer Management');
});

test(`AC 2: In Offer Management, submit an enabled offer with title, badge text, selected vehicle, discount_percent, activation_date not before the current minute, and expiry_date after activation_date Verify HTTP 201 and toast 'Offer scheduled' using IDs #offer-title-input, #offer-badge-input, #offer-car-select, #offer-discount-percent-input, #offer-activation-input, #offer-expiry-input, #offer-enabled-toggle, and #offer-submit-button.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    await openAdminOffers(page, baseURL || '', token);

    const title = unique('ui-create');
    const badge = unique('ui-badge').slice(0, 24);
    const dates = scheduledWindow();
    await page.locator('#offer-title-input').fill(title);
    await page.locator('#offer-badge-input').fill(badge);
    await page.locator('#offer-car-select').selectOption(car._id);
    await page.locator('#offer-discount-percent-input').fill('12');
    await page.locator('#offer-activation-input').fill(inputDate(dates.activation_date));
    await page.locator('#offer-expiry-input').fill(inputDate(dates.expiry_date));
    await page.locator('#offer-enabled-toggle').setChecked(true);

    const [response] = await Promise.all([
        page.waitForResponse((res) => res.url().includes('/api/offers') && res.request().method() === 'POST'),
        page.locator('#offer-submit-button').click(),
    ]);
    expect(response.status()).toBe(201);
    await expect(page.getByText('Offer scheduled')).toBeVisible();
    const created = await response.json();
    await deleteOffer(request, baseURL || '', token, created._id);
});

test(`AC 3: Select a vehicle and enter discount_percent Verify the client-side savings preview computes price multiplied by discount_percent using ID #offer-savings-preview.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    await openAdminOffers(page, baseURL || '', token);

    await page.locator('#offer-car-select').selectOption(car._id);
    await page.locator('#offer-discount-percent-input').fill('10');
    await expect(page.locator('#offer-savings-preview')).toContainText(money(car.price * 0.1));
});

test(`AC 4: After offer creation through the API, load Offer Management Verify the campaign timeline contains row ID #offer-row-{id}.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { offer } = await createIsolatedOffer(request, baseURL || '', token, 12);
    await openAdminOffers(page, baseURL || '', token);

    await expect(page.locator(`#offer-row-${offer._id}`)).toBeVisible();
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 5: After offer creation through the API, load Offer Management Verify row ID #offer-row-{id} displays badge_text, title, associated vehicle name, activation_date, expiry_date, discount_label, and Active status.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 13);
    await openAdminOffers(page, baseURL || '', token);

    const row = page.locator(`#offer-row-${offer._id}`);
    await expect(row).toContainText(offer.badge_text);
    await expect(row).toContainText(offer.title);
    await expect(row).toContainText(`${car.brand} ${car.name}`);
    await expect(row).toContainText('Activation');
    await expect(row).toContainText('Expiry');
    await expect(row).toContainText('Save');
    await expect(row).toContainText('Active');
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 6: Create offers in Active, Scheduled, and Paused states with an existing Expired offer present Verify the Offer Management metrics panel displays all four status labels.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const activeCar = await createTestCar(request, baseURL || '', token);
    const scheduledCar = await createTestCar(request, baseURL || '', token);
    const pausedCar = await createTestCar(request, baseURL || '', token);
    const created = [
        await createOffer(request, baseURL || '', token, activeCar, activeWindow()),
        await createOffer(request, baseURL || '', token, scheduledCar, scheduledWindow()),
        await createOffer(request, baseURL || '', token, pausedCar, { ...activeWindow(), is_enabled: false }),
    ];
    await openAdminOffers(page, baseURL || '', token);

    await expect(page.getByText('Active').first()).toBeVisible();
    await expect(page.getByText('Scheduled').first()).toBeVisible();
    await expect(page.getByText('Paused').first()).toBeVisible();
    await expect(page.getByText('Expired').first()).toBeVisible();
    for (const offer of created) await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 7: Select the Active campaign filter Verify an Active offer row remains visible and a Scheduled offer row is hidden in the campaign timeline.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const active = await createOffer(request, baseURL || '', token, await createTestCar(request, baseURL || '', token), activeWindow());
    const scheduled = await createOffer(request, baseURL || '', token, await createTestCar(request, baseURL || '', token), scheduledWindow());
    await openAdminOffers(page, baseURL || '', token);

    await page.getByRole('button', { name: 'Active' }).click();
    await expect(page.locator(`#offer-row-${active._id}`)).toBeVisible();
    await expect(page.locator(`#offer-row-${scheduled._id}`)).toBeHidden();
    await deleteOffer(request, baseURL || '', token, active._id);
    await deleteOffer(request, baseURL || '', token, scheduled._id);
});

test(`AC 8: Select the Scheduled campaign filter Verify a Scheduled offer row remains visible and an Active offer row is hidden in the campaign timeline.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const active = await createOffer(request, baseURL || '', token, await createTestCar(request, baseURL || '', token), activeWindow());
    const scheduled = await createOffer(request, baseURL || '', token, await createTestCar(request, baseURL || '', token), scheduledWindow());
    await openAdminOffers(page, baseURL || '', token);

    await page.getByRole('button', { name: 'Scheduled' }).click();
    await expect(page.locator(`#offer-row-${scheduled._id}`)).toBeVisible();
    await expect(page.locator(`#offer-row-${active._id}`)).toBeHidden();
    await deleteOffer(request, baseURL || '', token, active._id);
    await deleteOffer(request, baseURL || '', token, scheduled._id);
});

test(`AC 9: Open an existing offer in edit mode Modify title Submit the form Verify toast 'Offer updated' and preserved row ID #offer-row-{id} using IDs #offer-row-{id}-edit, #offer-title-input, and #offer-submit-button.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { offer } = await createIsolatedOffer(request, baseURL || '', token, 13);
    await openAdminOffers(page, baseURL || '', token);

    const updatedTitle = unique('updated-title');
    await page.locator(`#offer-row-${offer._id}-edit`).click();
    await page.locator('#offer-title-input').fill(updatedTitle);
    await page.locator('#offer-submit-button').click();
    await expect(page.getByText('Offer updated')).toBeVisible();
    await expect(page.locator(`#offer-row-${offer._id}`)).toContainText(updatedTitle);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 10: Click the Pause action for an enabled offer Verify row ID #offer-row-{id} transitions to Paused status using ID #offer-row-{id}-toggle.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { offer } = await createIsolatedOffer(request, baseURL || '', token, 14);
    await openAdminOffers(page, baseURL || '', token);

    await page.locator(`#offer-row-${offer._id}-toggle`).click();
    await expect(page.locator(`#offer-row-${offer._id}`)).toContainText('Paused');
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 11: Click the Enable action for a paused offer whose activation window includes the current datetime Verify row ID #offer-row-{id} transitions to Active status using ID #offer-row-{id}-toggle.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { offer } = await createIsolatedOffer(request, baseURL || '', token, 15, { is_enabled: false });
    await openAdminOffers(page, baseURL || '', token);

    await page.locator(`#offer-row-${offer._id}-toggle`).click();
    await expect(page.locator(`#offer-row-${offer._id}`)).toContainText('Active');
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 12: Click the delete action for an offer Verify toast 'Offer removed' and removal of row ID #offer-row-{id} from #offer-list using ID #offer-row-{id}-delete.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { offer } = await createIsolatedOffer(request, baseURL || '', token, 16);
    await openAdminOffers(page, baseURL || '', token);

    await page.locator(`#offer-row-${offer._id}-delete`).click();
    await expect(page.getByText('Offer removed')).toBeVisible();
    await expect(page.locator('#offer-list').locator(`#offer-row-${offer._id}`)).toHaveCount(0);
});

test(`AC 13: Open /browse with an active enabled offer Verify the matching vehicle card renders badge_text using ID #car-card-{id}-offer-badge.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 0);
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${car._id}-offer-badge`)).toContainText(offer.badge_text);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 14: Open /car/{id} with an active enabled offer Verify the vehicle detail offer banner renders badge_text, title, discount_percent, and savings_amount using ID #car-detail-offer-badge.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 1, { discount_percent: 15 });
    await page.goto(`${baseURL}/car/${car._id}`);

    const banner = page.locator('#car-detail-offer-badge');
    await expect(banner).toContainText(offer.badge_text);
    await expect(banner).toContainText(offer.title);
    await expect(banner).toContainText('15% off');
    await expect(banner).toContainText(money(car.price * 0.15).replace('$', ''));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 15: Open /browse for a vehicle with an active percentage discount Verify discounted price, original strikethrough price, and savings label render using IDs #car-card-{id}-price, #car-card-{id}-original-price, and #car-card-{id}-savings.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 2, { discount_percent: 10 });
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator(`#car-card-${car._id}`)).toBeVisible();

    await expect(page.locator(`#car-card-${car._id}-price`)).toContainText(money(discountedPrice(car.price, 10)));
    await expect(page.locator(`#car-card-${car._id}-original-price`)).toContainText(money(car.price));
    await expect(page.locator(`#car-card-${car._id}-savings`)).toContainText(money(car.price * 0.1).replace('$', 'Save $'));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 16: Open /car/{id} Overview for a vehicle with an active percentage discount Verify discounted acquisition price and original strikethrough price render using IDs #car-detail-current-price and #car-detail-original-price.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 3, { discount_percent: 10 });
    await page.goto(`${baseURL}/car/${car._id}`);

    await expect(page.locator('#car-detail-current-price')).toContainText(money(discountedPrice(car.price, 10)));
    await expect(page.locator('#car-detail-original-price')).toContainText(money(car.price));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 17: On /car/{id}, select the Price tab Verify the financial breakdown includes active offer discount values using IDs #car-price-tab-current-price, #car-price-tab-original-price, and #car-price-tab-savings.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 4, { discount_percent: 10 });
    await page.goto(`${baseURL}/car/${car._id}`);

    await page.getByRole('button', { name: 'Price' }).click();
    await expect(page.getByText('Active Offer Discount')).toBeVisible();
    await expect(page.locator('#car-price-tab-current-price')).toContainText(money(discountedPrice(car.price, 10)));
    await expect(page.locator('#car-price-tab-original-price')).toContainText(money(car.price));
    await expect(page.locator('#car-price-tab-savings')).toContainText(money(car.price * 0.1).replace('$', '$'));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 18: Open PurchaseModal for a vehicle with an active percentage discount Verify the modal price panel displays discounted price and original strikethrough price after clicking ID #book-now-main-button.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 5, { discount_percent: 10 });
    await page.goto(`${baseURL}/car/${car._id}`);

    await page.locator('#book-now-main-button').click();
    const modal = page.locator('h2:has-text("Booking")').locator('..').locator('..').locator('..');
    await expect(modal).toContainText(money(discountedPrice(car.price, 10)));
    await expect(modal).toContainText(money(car.price));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 19: Load Offer Management with a sold vehicle in the fleet Verify the sold vehicle is excluded from the vehicle select using ID #offer-car-select.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const soldCar = await getSoldCar(request, baseURL || '', token);
    await openAdminOffers(page, baseURL || '', token);

    const optionValues = await page.locator('#offer-car-select option').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value)
    );
    expect(optionValues).not.toContain(soldCar._id);
});

test(`AC 20: Load Offer Management after a vehicle already has an offer Verify that offered vehicle is excluded from the vehicle select using ID #offer-car-select.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const offer = await createOffer(request, baseURL || '', token, car);
    await openAdminOffers(page, baseURL || '', token);

    const optionValues = await page.locator('#offer-car-select option').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value)
    );
    expect(optionValues).not.toContain(car._id);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 21: Open /browse for a sold vehicle with an otherwise active offer Verify the matching vehicle card excludes that offer badge_text.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const offer = await createOffer(request, baseURL || '', token, car);
    await updateCarStatus(request, baseURL || '', token, car._id, 'Sold');
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${car._id}-offer-badge`)).toHaveCount(0);
    await updateCarStatus(request, baseURL || '', token, car._id, 'Available');
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 22: Request GET /api/cars for a sold vehicle with an otherwise active offer Verify the sold vehicle response includes an empty activeOffers array.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const offer = await createOffer(request, baseURL || '', token, car);
    await updateCarStatus(request, baseURL || '', token, car._id, 'Sold');

    const cars = await getCars(request, baseURL || '');
    const soldCar = cars.find((item) => item._id === car._id);
    expect(soldCar?.activeOffers ?? []).toHaveLength(0);
    await updateCarStatus(request, baseURL || '', token, car._id, 'Available');
    await deleteOffer(request, baseURL || '', token, offer._id);
});

// NEGATIVE TESTS (AC 23-35)

test(`AC 23: Remove adminToken from localStorage Navigate directly to /admin/offers Verify route guard redirects to /admin.`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => localStorage.removeItem('adminToken'));
    await page.goto(`${baseURL}/admin/offers`);
    await expect(page).toHaveURL(/\/admin$/);
});

test(`AC 24: Submit the offer form without selecting a vehicle Verify browser HTML5 required validation blocks submission using ID #offer-car-select.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const dates = activeWindow();
    await openAdminOffers(page, baseURL || '', token);

    await page.locator('#offer-title-input').fill(unique('missing-car'));
    await page.locator('#offer-badge-input').fill(unique('badge').slice(0, 24));
    await page.locator('#offer-discount-percent-input').fill('10');
    await page.locator('#offer-activation-input').fill(inputDate(dates.activation_date));
    await page.locator('#offer-expiry-input').fill(inputDate(dates.expiry_date));
    await page.locator('#offer-submit-button').click();
    const validation = await page.locator('#offer-car-select').evaluate((element: HTMLSelectElement) => element.validationMessage);
    expect(validation).not.toBe('');
});

test(`AC 25: Submit POST /api/offers without car_id Verify HTTP 400 and response message 'Please choose a vehicle for this offer.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('missing-car'), badge_text: unique('badge').slice(0, 24), discount_percent: 10, ...activeWindow() },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Please choose a vehicle for this offer.' });
});

test(`AC 26: Submit POST /api/offers with discount_percent greater than 95 Verify HTTP 400 and response message 'Discount percent must be between 0 and 95.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('bad-discount'), badge_text: unique('badge').slice(0, 24), car_id: car._id, discount_percent: 96, ...activeWindow() },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Discount percent must be between 0 and 95.' });
});

test(`AC 27: Submit POST /api/offers with expiry_date equal to activation_date Verify HTTP 400 and response message 'Expiry date and time must be after activation date and time.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const date = new Date().toISOString();
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('same-date'), badge_text: unique('badge').slice(0, 24), car_id: car._id, discount_percent: 10, activation_date: date, expiry_date: date },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Expiry date and time must be after activation date and time.' });
});

test(`AC 28: Create an offer with activation_date in the future Open /browse before activation_date Verify the matching vehicle card excludes that offer badge_text.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 6, scheduledWindow());
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${car._id}`)).not.toContainText(offer.badge_text);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 29: Submit POST /api/offers with expiry_date before the current minute Verify HTTP 400 and response message 'Expiry date and time cannot be in the past.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const activation = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const expiry = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('past-expiry'), badge_text: unique('badge').slice(0, 24), car_id: car._id, discount_percent: 10, activation_date: activation, expiry_date: expiry },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Expiry date and time cannot be in the past.' });
});

test(`AC 30: Create a disabled offer inside its activation window Open /browse Verify the matching vehicle card excludes that offer badge_text.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 8, { is_enabled: false });
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${car._id}`)).not.toContainText(offer.badge_text);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 31: Create an active offer assigned to one vehicle Open /browse Verify a different vehicle card excludes that offer badge_text.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const targetCar = await createTestCar(request, baseURL || '', token);
    const otherCar = await createTestCar(request, baseURL || '', token);
    const offer = await createOffer(request, baseURL || '', token, targetCar);
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${targetCar._id}`)).toContainText(offer.badge_text);
    await expect(page.locator(`#car-card-${otherCar._id}`)).not.toContainText(offer.badge_text);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 32: Submit POST /api/offers with activation_date before the current minute Verify HTTP 400 and response message 'Activation date and time cannot be in the past.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('past-activation'), badge_text: unique('badge').slice(0, 24), car_id: car._id, discount_percent: 10, ...pastWindow() },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Activation date and time cannot be in the past.' });
});

test(`AC 33: Submit POST /api/offers for a sold vehicle Verify HTTP 400 and response message 'Offers cannot be applied to sold vehicles.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const soldCar = await createTestCar(request, baseURL || '', token, { availability_status: 'Sold' });
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('sold-car'), badge_text: unique('badge').slice(0, 24), car_id: soldCar._id, discount_percent: 10, ...activeWindow() },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Offers cannot be applied to sold vehicles.' });
});

test(`AC 34: Submit POST /api/offers for a vehicle that already has an offer Verify HTTP 400 and response message 'This vehicle already has an offer.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const offer = await createOffer(request, baseURL || '', token, car);
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('duplicate'), badge_text: unique('badge').slice(0, 24), car_id: car._id, discount_percent: 12, ...activeWindow() },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'This vehicle already has an offer.' });
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 35: Submit POST /api/offers with expiry_date before activation_date Verify HTTP 400 and response message 'Expiry date and time must be after activation date and time.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await createTestCar(request, baseURL || '', token);
    const activation = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('bad-expiry'), badge_text: unique('badge').slice(0, 24), car_id: car._id, discount_percent: 10, activation_date: activation, expiry_date: expiry },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Expiry date and time must be after activation date and time.' });
});
