import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const ADMIN_USER = { email: 'admin1@pub.com', password: 'pub123' };
const DATASET = 'public';

type Car = {
    _id: string;
    brand: string;
    name: string;
    price: number;
    availability_status?: string;
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
    activation_date: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
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

function money(value: number) {
    return `$${Math.round(value).toLocaleString('en-US')}`;
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

async function getCar(request: APIRequestContext, baseURL: string, index = 0) {
    const cars = await getCars(request, baseURL);
    const availableCars = cars.filter((car) => car.availability_status === 'Available');
    const selectableCars = availableCars.length > 0 ? availableCars : cars;
    expect(selectableCars.length).toBeGreaterThan(0);
    return selectableCars[index % selectableCars.length];
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
    const car = await getCar(request, baseURL, carIndex);
    const offer = await createOffer(request, baseURL, token, car, overrides);
    return { car, offer };
}

// POSITIVE TESTS (AC 1-18)

test(`AC 1: Authenticate with seeded admin credentials Navigate to /admin/offers Verify the Offer Management route renders the form container ID #offer-form and page heading ID #offers-heading.`, async ({ page, baseURL }) => {
    await loginUi(page, baseURL || '');
    await page.goto(`${baseURL}/admin/offers`);
    await expect(page.locator('#offer-form')).toBeVisible();
    await expect(page.locator('#offers-heading')).toContainText('Offer Management');
});

test(`AC 2: In Offer Management, submit an enabled offer with title, badge text, selected vehicle, discount_percent, activation_date, and expiry_date Verify HTTP 201 and toast 'Offer scheduled' using IDs #offer-title-input, #offer-badge-input, #offer-car-select, #offer-discount-percent-input, #offer-activation-input, #offer-expiry-input, #offer-enabled-toggle, and #offer-submit-button.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await getCar(request, baseURL || '', 11);
    await openAdminOffers(page, baseURL || '', token);

    const title = unique('ui-create');
    const badge = unique('ui-badge').slice(0, 24);
    const dates = activeWindow();
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

test(`AC 3: Select a seeded vehicle and enter discount_percent Verify the client-side savings preview computes price multiplied by discount_percent using ID #offer-savings-preview.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await getCar(request, baseURL || '', 1);
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

test(`AC 6: Create offers in Active, Scheduled, Paused, and Expired states Verify the Offer Management metrics panel displays all four status labels.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const cars = (await getCars(request, baseURL || '')).filter((car) => car.availability_status === 'Available');
    expect(cars.length).toBeGreaterThan(0);
    const created = [
        await createOffer(request, baseURL || '', token, cars[14 % cars.length], activeWindow()),
        await createOffer(request, baseURL || '', token, cars[15 % cars.length], scheduledWindow()),
        await createOffer(request, baseURL || '', token, cars[16 % cars.length], { ...activeWindow(), is_enabled: false }),
        await createOffer(request, baseURL || '', token, cars[17 % cars.length], expiredWindow()),
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
    const active = await createOffer(request, baseURL || '', token, await getCar(request, baseURL || '', 18), activeWindow());
    const scheduled = await createOffer(request, baseURL || '', token, await getCar(request, baseURL || '', 19), scheduledWindow());
    await openAdminOffers(page, baseURL || '', token);

    await page.getByRole('button', { name: 'Active' }).click();
    await expect(page.locator(`#offer-row-${active._id}`)).toBeVisible();
    await expect(page.locator(`#offer-row-${scheduled._id}`)).toBeHidden();
    await deleteOffer(request, baseURL || '', token, active._id);
    await deleteOffer(request, baseURL || '', token, scheduled._id);
});

test(`AC 8: Select the Scheduled campaign filter Verify a Scheduled offer row remains visible and an Active offer row is hidden in the campaign timeline.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const active = await createOffer(request, baseURL || '', token, await getCar(request, baseURL || '', 11), activeWindow());
    const scheduled = await createOffer(request, baseURL || '', token, await getCar(request, baseURL || '', 12), scheduledWindow());
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
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 0, { activation_date: '1970-01-01T00:00:00.000Z', expiry_date: '2099-01-01T00:00:00.000Z' });
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${car._id}-offer-badge`)).toContainText(offer.badge_text);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 14: Open /car/{id} with an active enabled offer Verify the vehicle detail offer banner renders badge_text, title, discount_percent, and savings_amount using ID #car-detail-offer-badge.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 1, { discount_percent: 15, activation_date: '1970-01-01T00:00:00.000Z', expiry_date: '2099-01-01T00:00:00.000Z' });
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
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 2, { discount_percent: 10, activation_date: '1970-01-01T00:00:00.000Z', expiry_date: '2099-01-01T00:00:00.000Z' });
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator(`#car-card-${car._id}`)).toBeVisible();

    await expect(page.locator(`#car-card-${car._id}-price`)).toContainText(money(car.price * 0.9));
    await expect(page.locator(`#car-card-${car._id}-original-price`)).toContainText(money(car.price));
    await expect(page.locator(`#car-card-${car._id}-savings`)).toContainText(money(car.price * 0.1).replace('$', 'Save $'));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 16: Open /car/{id} Overview for a vehicle with an active percentage discount Verify discounted acquisition price and original strikethrough price render using IDs #car-detail-current-price and #car-detail-original-price.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 3, { discount_percent: 10, activation_date: '1970-01-01T00:00:00.000Z', expiry_date: '2099-01-01T00:00:00.000Z' });
    await page.goto(`${baseURL}/car/${car._id}`);

    await expect(page.locator('#car-detail-current-price')).toContainText(money(car.price * 0.9));
    await expect(page.locator('#car-detail-original-price')).toContainText(money(car.price));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 17: On /car/{id}, select the Price tab Verify the financial breakdown includes active offer discount values using IDs #car-price-tab-current-price, #car-price-tab-original-price, and #car-price-tab-savings.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 4, { discount_percent: 10, activation_date: '1970-01-01T00:00:00.000Z', expiry_date: '2099-01-01T00:00:00.000Z' });
    await page.goto(`${baseURL}/car/${car._id}`);

    await page.getByRole('button', { name: 'Price' }).click();
    await expect(page.getByText('Active Offer Discount')).toBeVisible();
    await expect(page.locator('#car-price-tab-current-price')).toContainText(money(car.price * 0.9));
    await expect(page.locator('#car-price-tab-original-price')).toContainText(money(car.price));
    await expect(page.locator('#car-price-tab-savings')).toContainText(money(car.price * 0.1).replace('$', '$'));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 18: Open PurchaseModal for a vehicle with an active percentage discount Verify the modal price panel displays discounted price and original strikethrough price after clicking ID #book-now-main-button.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 5, { discount_percent: 10, activation_date: '1970-01-01T00:00:00.000Z', expiry_date: '2099-01-01T00:00:00.000Z' });
    await page.goto(`${baseURL}/car/${car._id}`);

    await page.locator('#book-now-main-button').click();
    const modal = page.locator('h2:has-text("Booking")').locator('..').locator('..').locator('..');
    await expect(modal).toContainText(money(car.price * 0.9));
    await expect(modal).toContainText(money(car.price));
    await deleteOffer(request, baseURL || '', token, offer._id);
});

// NEGATIVE TESTS (AC 19-27)

test(`AC 19: Remove adminToken from localStorage Navigate directly to /admin/offers Verify route guard redirects to /admin.`, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => localStorage.removeItem('adminToken'));
    await page.goto(`${baseURL}/admin/offers`);
    await expect(page).toHaveURL(/\/admin$/);
});

test(`AC 20: Submit the offer form without selecting a vehicle Verify browser HTML5 required validation blocks submission using ID #offer-car-select.`, async ({ page, request, baseURL }) => {
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

test(`AC 21: Submit POST /api/offers without car_id Verify HTTP 400 and response message 'Please choose a vehicle for this offer.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('missing-car'), badge_text: unique('badge').slice(0, 24), discount_percent: 10, ...activeWindow() },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Please choose a vehicle for this offer.' });
});

test(`AC 22: Submit POST /api/offers with discount_percent greater than 95 Verify HTTP 400 and response message 'Discount percent must be between 0 and 95.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await getCar(request, baseURL || '', 0);
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('bad-discount'), badge_text: unique('badge').slice(0, 24), car_id: car._id, discount_percent: 96, ...activeWindow() },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Discount percent must be between 0 and 95.' });
});

test(`AC 23: Submit POST /api/offers with expiry_date equal to activation_date Verify HTTP 400 and response message 'Expiry date must be after activation date.'.`, async ({ request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const car = await getCar(request, baseURL || '', 1);
    const date = new Date().toISOString();
    const response = await request.post(`${baseURL}/api/offers`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { title: unique('same-date'), badge_text: unique('badge').slice(0, 24), car_id: car._id, discount_percent: 10, activation_date: date, expiry_date: date },
    });
    expect(response.status()).toBe(400);
    await expect(await response.json()).toMatchObject({ message: 'Expiry date must be after activation date.' });
});

test(`AC 24: Create an offer with activation_date in the future Open /browse before activation_date Verify the matching vehicle card excludes that offer badge_text.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 6, scheduledWindow());
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${car._id}`)).not.toContainText(offer.badge_text);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 25: Create an offer with expiry_date in the past Open /car/{id} after expiry_date Verify the vehicle detail page excludes that offer badge_text and title.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 7, expiredWindow());
    await page.goto(`${baseURL}/car/${car._id}`);

    await expect(page.locator('main')).not.toContainText(offer.badge_text);
    await expect(page.locator('main')).not.toContainText(offer.title);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 26: Create a disabled offer inside its activation window Open /browse Verify the matching vehicle card excludes that offer badge_text.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const { car, offer } = await createIsolatedOffer(request, baseURL || '', token, 8, { is_enabled: false });
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${car._id}`)).not.toContainText(offer.badge_text);
    await deleteOffer(request, baseURL || '', token, offer._id);
});

test(`AC 27: Create an active offer assigned to one vehicle Open /browse Verify a different vehicle card excludes that offer badge_text.`, async ({ page, request, baseURL }) => {
    const token = await loginApi(request, baseURL || '');
    const targetCar = await getCar(request, baseURL || '', 9);
    const otherCar = await getCar(request, baseURL || '', 10);
    const offer = await createOffer(request, baseURL || '', token, targetCar, { activation_date: '1970-01-01T00:00:00.000Z', expiry_date: '2099-01-01T00:00:00.000Z' });
    await page.goto(`${baseURL}/browse`);

    await expect(page.locator(`#car-card-${targetCar._id}`)).toContainText(offer.badge_text);
    await expect(page.locator(`#car-card-${otherCar._id}`)).not.toContainText(offer.badge_text);
    await deleteOffer(request, baseURL || '', token, offer._id);
});
