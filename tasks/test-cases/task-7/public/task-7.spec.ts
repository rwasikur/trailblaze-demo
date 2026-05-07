import { test, expect, request as playwrightRequest, type APIRequestContext, type Locator, type Page } from '@playwright/test';

const DATA = {
    admin: { email: 'admin1@pub.com', password: 'pub123' },
    discountedName: 'Elite i20',
    zeroDiscountName: 'Polo GTI',
    createColor: 'White'
};

type Car = Record<string, any>;

const money = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`;
const discountedPrice = (car: Car) => Math.round(car.price - (car.price * Number(car.discount_percentage) / 100));
const discountAmount = (car: Car) => car.price - discountedPrice(car);
const validDiscount = (car: Car) => Number(car.discount_percentage) > 0 && Number(car.discount_percentage) < 100;

async function api(baseURL: string) {
    return playwrightRequest.newContext({ baseURL });
}

async function authToken(ctx: APIRequestContext) {
    const res = await ctx.post('/api/admin/login', { data: DATA.admin });
    expect(res.ok()).toBeTruthy();
    return (await res.json()).token;
}

async function allCars(ctx: APIRequestContext) {
    const res = await ctx.get('/api/cars');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    return body.cars ?? body;
}

async function findCar(ctx: APIRequestContext, predicate: (car: Car) => boolean) {
    const car = (await allCars(ctx)).find(predicate);
    expect(car).toBeDefined();
    return car;
}

function carPayloadFromSeed(seed: Car, overrides: Car = {}) {
    const payload: Car = {
        ...seed,
        name: overrides.name ?? `${seed.name} Task7 ${Date.now()}`,
        brand: overrides.brand ?? seed.brand,
        model_year: overrides.model_year ?? seed.model_year,
        image_url: seed.image_url,
        secondary_images: seed.secondary_images ?? [],
        available_colors: seed.available_colors ?? [DATA.createColor],
        past_owners: seed.past_owners ?? [],
        ...overrides
    };
    delete payload._id;
    delete payload.createdAt;
    delete payload.updatedAt;
    return payload;
}

async function createCar(ctx: APIRequestContext, token: string, seed: Car, overrides: Car = {}) {
    const res = await ctx.post('/api/cars', {
        headers: { Authorization: `Bearer ${token}` },
        data: carPayloadFromSeed(seed, overrides)
    });
    expect(res.ok()).toBeTruthy();
    return res.json();
}

async function updateCar(ctx: APIRequestContext, token: string, car: Car, overrides: Car = {}) {
    const res = await ctx.put(`/api/cars/${car._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: carPayloadFromSeed(car, { name: car.name, ...overrides })
    });
    expect(res.ok()).toBeTruthy();
    return res.json();
}

async function availableZeroDiscountCar(ctx: APIRequestContext) {
    const existing = (await allCars(ctx)).find((c: Car) => Number(c.discount_percentage) === 0 && c.availability_status === 'Available');
    if (existing) return existing;
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => Number(c.discount_percentage) === 0);
    return createCar(ctx, token, seed, { discount_percentage: 0, availability_status: 'Available', condition: 'New', number_of_owners: 0, past_owners: [] });
}

async function createBooking(ctx: APIRequestContext, car: Car, emailPrefix = 'task7') {
    const res = await ctx.post('/api/bookings', {
        data: {
            car_id: car._id,
            user_name: 'Task Seven',
            user_email: `${emailPrefix}.${Date.now()}@example.com`,
            user_contact: '9876543210',
            selected_color: car.available_colors?.[0] ?? DATA.createColor
        }
    });
    expect(res.ok()).toBeTruthy();
    return (await res.json()).booking;
}

async function login(page: Page, baseURL: string) {
    await page.goto(`${baseURL}/admin`, { waitUntil: 'networkidle' });
    if (page.url().includes('dashboard')) return;
    await page.locator('#admin-email-input').fill(DATA.admin.email);
    await page.locator('#admin-password-input').fill(DATA.admin.password);
    await page.locator('#admin-login-button').click();
    await page.waitForURL(/dashboard/, { timeout: 15000 });
}

async function openAddCarWithCopiedSeed(page: Page, baseURL: string, seed: Car) {
    const ctx = await api(baseURL);
    const token = await authToken(ctx);
    await ctx.dispose();
    await page.addInitScript(({ adminToken, car }: { adminToken: string; car: Car }) => {
        localStorage.setItem('adminToken', adminToken);
        window.history.replaceState({ usr: { copyFrom: car }, key: 'task7-copy' }, '', '/admin/add-car');
    }, { adminToken: token, car: seed });
    await page.goto(`${baseURL}/admin/add-car`, { waitUntil: 'domcontentloaded' });
}

async function advanceAddCarToPricing(page: Page, baseURL: string) {
    const ctx = await api(baseURL);
    const seed = await findCar(ctx, car => validDiscount(car) && car.availability_status === 'Available' && car.condition === 'New' && car.image_url);
    await ctx.dispose();
    await openAddCarWithCopiedSeed(page, baseURL, seed);
    await page.getByRole('button', { name: /Next Step/i }).click();
    await page.getByRole('button', { name: /Next Step/i }).click();
    await expect(page.getByRole('heading', { name: 'Registration & Details' })).toBeVisible();
}

async function expectLineThrough(locator: Locator) {
    await expect(locator).toBeVisible();
    await expect(locator).toHaveCSS('text-decoration-line', /line-through/);
}

async function openDiscountedCarCard(page: Page, baseURL: string, car: Car) {
    await page.goto(`${baseURL}/browse`, { waitUntil: 'networkidle' });
    await expect(page.locator(`#car-card-${car._id}`)).toBeVisible({ timeout: 15000 });
}

test("AC 1: 'Car' model must define 'discount_percentage' as an integer field with default value 0.", async ({ baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const payload = carPayloadFromSeed(seed, { name: `${seed.name} Default Discount ${Date.now()}` });
    delete payload.discount_percentage;
    const res = await ctx.post('/api/cars', { headers: { Authorization: `Bearer ${token}` }, data: payload });
    expect(res.ok()).toBeTruthy();
    const created = await res.json();
    expect(created.discount_percentage).toBe(0);
    expect(Number.isInteger(created.discount_percentage)).toBeTruthy();
    await ctx.dispose();
});

test("AC 2: 'POST /api/cars' must persist a provided 'discount_percentage' value as an integer.", async ({ baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const created = await createCar(ctx, token, seed, { discount_percentage: '13' });
    expect(created.discount_percentage).toBe(13);
    expect(Number.isInteger(created.discount_percentage)).toBeTruthy();
    await ctx.dispose();
});

test("AC 3: 'PUT /api/cars/:id' must persist a provided 'discount_percentage' value as an integer.", async ({ baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const created = await createCar(ctx, token, seed, { discount_percentage: 4 });
    const updated = await updateCar(ctx, token, created, { discount_percentage: '17' });
    expect(updated.discount_percentage).toBe(17);
    expect(Number.isInteger(updated.discount_percentage)).toBeTruthy();
    await ctx.dispose();
});

test("AC 4: 'AddCarPage' must render a 'Discount (%)' number input with id='car-discount-input' in the pricing/details step.", async ({ page, baseURL }) => {
    await advanceAddCarToPricing(page, baseURL || '');
    const input = page.locator('#car-discount-input');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('type', 'number');
});

test("AC 5: 'AddCarPage' must include the entered discount value in the submitted 'POST /api/cars' request body.", async ({ page, baseURL }) => {
    await advanceAddCarToPricing(page, baseURL || '');
    await page.locator('#car-price-input').fill('4699');
    await page.locator('#car-discount-input').fill('11');
    await page.getByRole('button', { name: /Next Step/i }).click();
    await expect(page.getByRole('heading', { name: 'Vehicle Media' })).toBeVisible();
    const requestPromise = page.waitForRequest(req => req.method() === 'POST' && /\/api\/cars$/.test(req.url()));
    await page.getByRole('button', { name: /Save Vehicle to Fleet/i }).click({ force: true });
    const body = requestPromise.then(req => req.postDataJSON());
    await expect(await body).toMatchObject({ discount_percentage: '11' });
});

test("AC 6: 'EditCarPage' must pre-fill the discount input from the car's persisted 'discount_percentage'.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const created = await createCar(ctx, token, seed, { discount_percentage: 23, condition: 'New', number_of_owners: 0, past_owners: [] });
    await ctx.dispose();
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/edit-car/${created._id}`);
    await expect(page.locator('#car-discount-input')).toHaveValue('23', { timeout: 15000 });
});

test("AC 7: 'EditCarPage' must include the edited discount value in the submitted 'PUT /api/cars/:id' request body.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const created = await createCar(ctx, token, seed, { discount_percentage: 6, condition: 'New', number_of_owners: 0, past_owners: [] });
    await ctx.dispose();
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/edit-car/${created._id}`);
    await page.locator('#car-discount-input').fill('19');
    const requestPromise = page.waitForRequest(req => req.method() === 'PUT' && req.url().includes(`/api/cars/${created._id}`));
    await page.getByRole('button', { name: /Save Changes/i }).click({ force: true });
    expect((await requestPromise).postDataJSON().discount_percentage).toBe('19');
});

test("AC 8: 'CarCard' must render a discount badge with '<discount_percentage>% OFF' when 'discount_percentage' is greater than 0 and less than 100.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName);
    await ctx.dispose();
    await openDiscountedCarCard(page, baseURL || '', car);
    await expect(page.locator(`#car-card-${car._id}-discount-badge`)).toHaveText(`${car.discount_percentage}% OFF`);
});

test("AC 9: 'CarCard' must render the rounded discounted price when 'discount_percentage' is greater than 0 and less than 100.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName);
    await ctx.dispose();
    await openDiscountedCarCard(page, baseURL || '', car);
    await expect(page.locator(`#car-card-${car._id}-price`)).toHaveText(money(discountedPrice(car)));
});

test("AC 10: 'CarCard' must render the original price as a line-through value when a valid discount is present.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName);
    await ctx.dispose();
    await openDiscountedCarCard(page, baseURL || '', car);
    const original = page.locator(`#car-card-${car._id}-original-price`);
    await expect(original).toHaveText(money(car.price));
    await expectLineThrough(original);
});

test("AC 11: 'CarDetailsPage' Overview tab must render a discount badge with '<discount_percentage>% OFF' when a valid discount is present.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName);
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.locator('#car-details-discount-badge')).toHaveText(`${car.discount_percentage}% OFF`);
});

test("AC 12: 'CarDetailsPage' Overview acquisition card must render the original price as a line-through value when a valid discount is present.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName);
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.getByText(money(discountedPrice(car))).first()).toBeVisible();
    await expectLineThrough(page.getByText(money(car.price)).first());
});

test("AC 13: 'CarDetailsPage' Price tab must render the discount deduction amount as original price minus discounted price.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName);
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.getByRole('button', { name: /^Price$/ }).click();
    await expect(page.getByText(`- ${money(discountAmount(car))}`).first()).toBeVisible();
});

test("AC 14: 'PurchaseModal' must render the rounded final discounted price when a valid discount is present.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName && c.availability_status === 'Available');
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible();
    await expect(page.getByText(money(discountedPrice(car))).first()).toBeVisible();
});

test("AC 15: 'PurchaseModal' must render an 'Offer' value of '<discount_percentage>% OFF' when a valid discount is present.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName && c.availability_status === 'Available');
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    await expect(page.getByText('Offer')).toBeVisible();
    await expect(page.getByText(`${car.discount_percentage}% OFF`).first()).toBeVisible();
});

test("AC 16: 'PurchaseModal' must render the original price as a line-through value when a valid discount is present.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName && c.availability_status === 'Available');
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    await expectLineThrough(page.getByText(money(car.price)).first());
});

test("AC 17: 'AdminDashboard' Vehicles tab must render the discounted display price for a discounted car.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName);
    await ctx.dispose();
    await login(page, baseURL || '');
    const row = page.locator(`#car-row-${car._id}`);
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByText(money(discountedPrice(car)))).toBeVisible();
});

test("AC 18: 'AdminDashboard' Bookings tab must render the discounted display price for a booking whose car has a valid discount.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.discountedName && c.availability_status === 'Available');
    const booking = await createBooking(ctx, car, 'discount-booking');
    await ctx.dispose();
    await login(page, baseURL || '');
    await page.locator('#admin-bookings-tab').click();
    const row = page.locator(`#booking-row-${booking._id}`);
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByText(money(discountedPrice(car)))).toBeVisible();
});

test("AC 19: 'HomePage' must render '#homepage-discounts-section' when the API returns at least one car with a valid discount.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.locator('#homepage-discounts-section')).toBeVisible({ timeout: 15000 });
});

test("AC 20: 'HomePage' must render no more than six discounted car banners.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.locator('#homepage-discounts-section')).toBeVisible({ timeout: 15000 });
    expect(await page.locator('[id^="discount-banner-"]:not([id$="-badge"]):not([id$="-price"]):not([id$="-original-price"])').count()).toBeLessThanOrEqual(6);
});

test("AC 21: 'HomePage' must render each discounted car banner as a link to '/car/<car._id>'.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const valid = (await allCars(ctx)).filter((c: Car) => Number(c.discount_percentage) > 0 && Number(c.discount_percentage) < 100).slice(0, 6);
    await ctx.dispose();
    await page.goto(`${baseURL}/`);
    for (const car of valid) {
        await expect(page.locator(`#discount-banner-${car._id}`)).toHaveAttribute('href', `/car/${car._id}`);
    }
});

test("AC 22: 'HomePage' must render each discount banner with '<discount_percentage>% OFF' badge text and the rounded discounted price.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const valid = (await allCars(ctx)).filter((c: Car) => Number(c.discount_percentage) > 0 && Number(c.discount_percentage) < 100).slice(0, 6);
    await ctx.dispose();
    await page.goto(`${baseURL}/`);
    for (const car of valid) {
        await expect(page.locator(`#discount-banner-${car._id}-badge`)).toHaveText(`${car.discount_percentage}% OFF`);
        await expect(page.locator(`#discount-banner-${car._id}-price`)).toHaveText(money(discountedPrice(car)));
    }
});

test("AC 23: 'HomePage' must render each discount banner's original price as a line-through value.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const valid = (await allCars(ctx)).filter((c: Car) => Number(c.discount_percentage) > 0 && Number(c.discount_percentage) < 100).slice(0, 6);
    await ctx.dispose();
    await page.goto(`${baseURL}/`);
    for (const car of valid) {
        const original = page.locator(`#discount-banner-${car._id}-original-price`);
        await expect(original).toHaveText(money(car.price));
        await expectLineThrough(original);
    }
});

test("AC 24: 'CarCard' must not render a discount badge when 'discount_percentage' is 0.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await availableZeroDiscountCar(ctx);
    await ctx.dispose();
    await openDiscountedCarCard(page, baseURL || '', car);
    await expect(page.locator(`#car-card-${car._id}-discount-badge`)).toHaveCount(0);
});

test("AC 25: 'CarCard' must render the original price, not a discounted price, when 'discount_percentage' is 100.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const car = await createCar(ctx, token, seed, { discount_percentage: 100 });
    await ctx.dispose();
    await openDiscountedCarCard(page, baseURL || '', car);
    await expect(page.locator(`#car-card-${car._id}-price`)).toHaveText(money(car.price));
    await expect(page.locator(`#car-card-${car._id}-discount-badge`)).toHaveCount(0);
});

test("AC 26: 'CarDetailsPage' Overview tab must not render a discount badge when 'discount_percentage' is 0.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await availableZeroDiscountCar(ctx);
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.locator('#car-details-discount-badge')).toHaveCount(0);
});

test("AC 27: 'CarDetailsPage' Price tab must not render a discount row when 'discount_percentage' is 0.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await availableZeroDiscountCar(ctx);
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.getByRole('button', { name: /^Price$/ }).click();
    await expect(page.getByText(/Discount \(/)).toHaveCount(0);
});

test("AC 28: 'CarDetailsPage' Overview tab must render the original acquisition price, not a discounted price, when 'discount_percentage' is negative.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const car = await createCar(ctx, token, seed, { discount_percentage: -10 });
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.locator('#car-details-discount-badge')).toHaveCount(0);
    await expect(page.getByText(money(car.price)).first()).toBeVisible();
});

test("AC 29: 'PurchaseModal' must not render the 'Offer' section when 'discount_percentage' is 0.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await availableZeroDiscountCar(ctx);
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    await expect(page.getByText('Offer')).toHaveCount(0);
});

test("AC 30: 'PurchaseModal' must render the original price and no discount offer when 'discount_percentage' is 100.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const car = await createCar(ctx, token, seed, { discount_percentage: 100 });
    await ctx.dispose();
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    await expect(page.getByText(money(car.price)).first()).toBeVisible();
    await expect(page.getByText('Offer')).toHaveCount(0);
});

test("AC 31: 'AdminDashboard' Vehicles tab must render the original price when 'discount_percentage' is 0.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await availableZeroDiscountCar(ctx);
    await ctx.dispose();
    await login(page, baseURL || '');
    const row = page.locator(`#car-row-${car._id}`);
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByText(money(car.price))).toBeVisible();
});

test("AC 32: 'AdminDashboard' Bookings tab must render the original booking car price when 'discount_percentage' is 100.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const token = await authToken(ctx);
    const seed = await findCar(ctx, c => c.name === DATA.discountedName);
    const car = await createCar(ctx, token, seed, { discount_percentage: 100 });
    const booking = await createBooking(ctx, car, 'hundred-booking');
    await ctx.dispose();
    await login(page, baseURL || '');
    await page.locator('#admin-bookings-tab').click();
    const row = page.locator(`#booking-row-${booking._id}`);
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row.getByText(money(car.price))).toBeVisible();
});

test("AC 33: 'HomePage' must not render a discount banner for a seeded car with 'discount_percentage' 0.", async ({ page, baseURL }) => {
    const ctx = await api(baseURL || '');
    const car = await findCar(ctx, c => c.name === DATA.zeroDiscountName);
    await ctx.dispose();
    await page.goto(`${baseURL}/`);
    await expect(page.locator(`#discount-banner-${car._id}`)).toHaveCount(0);
});
