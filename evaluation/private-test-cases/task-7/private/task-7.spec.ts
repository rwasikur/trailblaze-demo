import { test, expect, request as playwrightRequest } from '@playwright/test';

const ADMIN = { email: 'admin1@pri.com', password: 'pri123' };

type CarRecord = Record<string, any>;

async function apiContext(baseURL: string) {
    return playwrightRequest.newContext({ baseURL });
}

async function getAdminToken(baseURL: string) {
    const ctx = await apiContext(baseURL);
    const response = await ctx.post('/api/admin/login', { data: ADMIN });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    await ctx.dispose();
    return body.token;
}

async function getCars(baseURL: string) {
    const ctx = await apiContext(baseURL);
    const response = await ctx.get('/api/cars');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    await ctx.dispose();
    return (body.cars ?? body) as CarRecord[];
}

async function getSeedCar(baseURL: string, predicate: (car: CarRecord) => boolean) {
    const cars = await getCars(baseURL);
    const car = cars.find(predicate);
    expect(car, 'Expected matching private seeded car to exist').toBeTruthy();
    return car!;
}

function carPayloadFromSeed(seed: CarRecord, overrides: CarRecord = {}) {
    return {
        name: `${seed.name} Private Task7 ${Date.now()} ${Math.floor(Math.random() * 100000)}`,
        brand: seed.brand,
        model_year: seed.model_year,
        transmission: seed.transmission,
        fuel_type: seed.fuel_type,
        seating_capacity: seed.seating_capacity,
        price: seed.price,
        range: seed.range,
        body_type: seed.body_type,
        mileage: seed.mileage,
        total_distance_covered: seed.total_distance_covered,
        exterior_color: seed.exterior_color,
        interior_color: seed.interior_color,
        number_of_owners: seed.condition === 'Used' ? seed.number_of_owners || 1 : 0,
        registration_city: seed.registration_city,
        insurance_validity: seed.insurance_validity,
        description: seed.description,
        image_url: seed.image_url,
        secondary_images: seed.secondary_images || [],
        availability_status: 'Available',
        condition: seed.condition,
        past_owners: seed.past_owners || [],
        ...overrides,
    };
}

async function createCarFromSeed(baseURL: string, overrides: CarRecord = {}, seedPredicate: (car: CarRecord) => boolean = () => true) {
    const seed = await getSeedCar(baseURL, seedPredicate);
    const token = await getAdminToken(baseURL);
    const ctx = await apiContext(baseURL);
    const response = await ctx.post('/api/cars', {
        headers: { Authorization: `Bearer ${token}` },
        data: carPayloadFromSeed(seed, overrides),
    });
    expect(response.ok()).toBeTruthy();
    const created = await response.json();
    await ctx.dispose();
    return created as CarRecord;
}

async function updateCar(baseURL: string, car: CarRecord, overrides: CarRecord) {
    const token = await getAdminToken(baseURL);
    const ctx = await apiContext(baseURL);
    const response = await ctx.put(`/api/cars/${car._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { ...car, ...overrides },
    });
    expect(response.ok()).toBeTruthy();
    const updated = await response.json();
    await ctx.dispose();
    return updated as CarRecord;
}

async function signInBrowser(page: any, baseURL: string) {
    const token = await getAdminToken(baseURL);
    await page.goto(`${baseURL}/`);
    await page.evaluate((adminToken: string) => localStorage.setItem('adminToken', adminToken), token);
}

async function selectReactOption(page: any, inputId: string, optionText: string) {
    await page.locator(`#${inputId}`).click();
    await page.locator(`#${inputId}`).fill(optionText);
    await page.getByText(optionText, { exact: true }).first().click();
}

async function reachAddCarStep3(page: any, baseURL: string) {
    await signInBrowser(page, baseURL);
    await page.goto(`${baseURL}/admin/add-car`);
    await page.locator('select').first().selectOption('New');
    await selectReactOption(page, 'brand-select', 'Tata');
    await selectReactOption(page, 'model-select', 'Safari');
    await selectReactOption(page, 'year-select', '2024');
    await page.locator('label:has-text("Exterior Color") + select').selectOption('Cosmic Gold');
    await page.locator('label:has-text("Interior Color") + select').selectOption('Black');
    await page.getByRole('button', { name: /Next Step/i }).click();
    await page.locator('label:has-text("Transmission") + select').selectOption('Automatic');
    await page.locator('label:has-text("Fuel Type") + select').selectOption('Diesel');
    await page.locator('label:has-text("Seating Capacity") + input').fill('7');
    await page.locator('label:has-text("Range") + input').fill('175');
    await page.locator('label:has-text("Body Type") + input').fill('SUV');
    await page.getByRole('button', { name: /Next Step/i }).click();
}

function expectedDiscountedPrice(price: number, discount: number) {
    return Math.round(price - (price * discount / 100)).toLocaleString('en-US');
}

function expectedAppPrice(price: number) {
    return price.toLocaleString('en-US');
}

// POSITIVE TESTS (AC 1-16)

test("AC 1: 'GET /api/cars' must serialize seeded 'discount_percentage' values as numeric fields.", async ({ baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Innova Crysta' && seed.discount_percentage === 15);
    expect(typeof car.discount_percentage).toBe('number');
});

test("AC 2: 'POST /api/cars' must persist 'discount_percentage' as integer 15 when the create request body contains 'discount_percentage': 15.", async ({ baseURL }) => {
    const car = await createCarFromSeed(baseURL || '', { price: 100000, discount_percentage: 15 });
    expect(car.discount_percentage).toBe(15);
});

test("AC 3: 'POST /api/cars' must persist 'discount_percentage' as 0 when the create request body omits the 'discount_percentage' property.", async ({ baseURL }) => {
    const car = await createCarFromSeed(baseURL || '', { price: 100000, discount_percentage: undefined });
    expect(car.discount_percentage).toBe(0);
});

test("AC 4: 'PUT /api/cars/:id' must persist 'discount_percentage' as integer 25 when the update request body contains 'discount_percentage': 25.", async ({ baseURL }) => {
    const car = await createCarFromSeed(baseURL || '', { price: 100000, discount_percentage: 5 });
    const updated = await updateCar(baseURL || '', car, { discount_percentage: 25 });
    expect(updated.discount_percentage).toBe(25);
});

test("AC 5: 'GET /api/cars' must include the persisted 'discount_percentage' property in every serialized car object.", async ({ baseURL }) => {
    const cars = await getCars(baseURL || '');
    expect(cars.length).toBeGreaterThan(0);
    for (const car of cars) expect(car).toHaveProperty('discount_percentage');
});

test("AC 6: 'GET /api/cars/:id' must include the persisted 'discount_percentage' property in the serialized car object.", async ({ baseURL }) => {
    const seed = await getSeedCar(baseURL || '', car => car.name === 'Innova Crysta' && car.discount_percentage === 15);
    const ctx = await apiContext(baseURL || '');
    const response = await ctx.get(`/api/cars/${seed._id}`);
    expect(response.ok()).toBeTruthy();
    const car = await response.json();
    await ctx.dispose();
    expect(car.discount_percentage).toBe(15);
});

test("AC 7: 'AddCarPage' must render the 'Discount (%)' number input with id='car-discount-input' in Step 3 'Registration & Details' immediately after the 'Price' input.", async ({ page, baseURL }) => {
    await reachAddCarStep3(page, baseURL || '');
    await expect(page.getByRole('heading', { name: 'Registration & Details' })).toBeVisible();
    await expect(page.locator('#car-discount-input')).toBeVisible();
    const order = await page.evaluate(() => {
        const price = document.querySelector('#car-price-input');
        const discount = document.querySelector('#car-discount-input');
        return !!price && !!discount && price.compareDocumentPosition(discount) === Node.DOCUMENT_POSITION_FOLLOWING;
    });
    expect(order).toBeTruthy();
});

test("AC 8: 'EditCarPage' must render the 'Discount (%)' number input with id='car-discount-input' and pre-fill it from the car's persisted 'discount_percentage' value.", async ({ page, baseURL }) => {
    const seed = await getSeedCar(baseURL || '', car => car.name === 'Safari Accomplished' && car.discount_percentage === 20);
    await signInBrowser(page, baseURL || '');
    await page.goto(`${baseURL}/admin/edit-car/${seed._id}`);
    await page.locator('#car-price-input').waitFor({ state: 'visible' });
    await expect(page.locator('#car-discount-input')).toBeVisible();
    await expect(page.locator('#car-discount-input')).toHaveValue('20');
});

test("AC 9: 'CarCard' must render a discount badge with text '15% OFF' for a seeded car with 'discount_percentage': 15.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Innova Crysta' && seed.discount_percentage === 15);
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator(`#car-card-${car._id}-discount-badge`)).toHaveText(/15% OFF/);
});

test("AC 10: 'CarCard' must render the discounted price for a seeded car with 'discount_percentage': 15.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Innova Crysta' && seed.discount_percentage === 15);
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator(`#car-card-${car._id}-price`)).toContainText(expectedDiscountedPrice(car.price, 15));
});

test("AC 11: 'CarCard' must render the original price as a line-through value for a seeded car with 'discount_percentage': 15.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Innova Crysta' && seed.discount_percentage === 15);
    await page.goto(`${baseURL}/browse`);
    const original = page.locator(`#car-card-${car._id}-original-price`);
    await expect(original).toContainText(expectedAppPrice(car.price));
    await expect(original).toHaveClass(/line-through/);
});

test("AC 12: 'CarDetailsPage' Overview tab must render a discount badge with text '15% OFF' for a seeded API car response with 'discount_percentage': 15.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Innova Crysta' && seed.discount_percentage === 15);
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.locator('#car-details-discount-badge')).toHaveText(/15% OFF/);
});

test("AC 13: 'CarDetailsPage' Price tab must render 'Festival Discount (15%)' for a seeded new car API response with 'condition': 'New' and 'discount_percentage': 15.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Slavia Style' && seed.condition === 'New' && seed.discount_percentage === 15);
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.getByRole('button', { name: 'Price' }).click();
    await expect(page.getByText('Festival Discount (15%)')).toBeVisible();
});

test("AC 14: 'CarDetailsPage' Price tab must render 'Special Offer Discount (15%)' for a seeded used car API response with 'condition': 'Used' and 'discount_percentage': 15.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Innova Crysta' && seed.condition === 'Used' && seed.discount_percentage === 15);
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.getByRole('button', { name: 'Price' }).click();
    await expect(page.getByText('Special Offer Discount (15%)')).toBeVisible();
});

test("AC 15: 'PurchaseModal' must render the final discounted price for a seeded car with 'discount_percentage': 15.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Innova Crysta' && seed.discount_percentage === 15);
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    await expect(page.locator('h2:has-text("Booking")')).toBeVisible();
    await expect(page.locator('.fixed').last().getByText(new RegExp(expectedDiscountedPrice(car.price, 15))).last()).toBeVisible();
});

test("AC 16: 'PurchaseModal' must render an 'Offer' value of '15% OFF' for a seeded car with 'discount_percentage': 15.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Innova Crysta' && seed.discount_percentage === 15);
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    const modal = page.locator('.fixed').last();
    await expect(modal.getByText('Offer')).toBeVisible();
    await expect(modal.getByText('15% OFF').last()).toBeVisible();
});

// NEGATIVE TESTS (AC 17-23)

test("AC 17: Negative - 'CarCard' must not render a discount badge for a seeded car with 'discount_percentage': 0.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Polo GTI' && seed.discount_percentage === 0);
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator(`#car-card-${car._id}-discount-badge`)).toHaveCount(0);
});

test("AC 18: Negative - 'CarCard' must not render an original line-through price for a seeded car with 'discount_percentage': 0.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Polo GTI' && seed.discount_percentage === 0);
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator(`#car-card-${car._id}-original-price`)).toHaveCount(0);
});

test("AC 19: Negative - 'CarDetailsPage' Overview tab must not render a discount badge for a seeded API car response with 'discount_percentage': 0.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Polo GTI' && seed.discount_percentage === 0);
    await page.goto(`${baseURL}/car/${car._id}`);
    await expect(page.locator('#car-details-discount-badge')).toHaveCount(0);
});

test("AC 20: Negative - 'PurchaseModal' must not render the 'Offer' section for a seeded car with 'discount_percentage': 0.", async ({ page, baseURL }) => {
    const car = await getSeedCar(baseURL || '', seed => seed.name === 'Polo GTI' && seed.discount_percentage === 0);
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    await expect(page.getByText('Offer')).toHaveCount(0);
});

test("AC 21: Negative - 'CarCard' must render the original price, not a discounted price, when 'discount_percentage' is 100.", async ({ page, baseURL }) => {
    const car = await createCarFromSeed(baseURL || '', { price: 100000, discount_percentage: 100 });
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator(`#car-card-${car._id}-price`)).toContainText('100,000');
    await expect(page.locator(`#car-card-${car._id}-original-price`)).toHaveCount(0);
});

test("AC 22: Negative - 'CarDetailsPage' Overview tab must render the original acquisition price, not a discounted price, when 'discount_percentage' is -10.", async ({ page, baseURL }) => {
    const car = await createCarFromSeed(baseURL || '', { price: 100000, discount_percentage: 0 });
    const updated = await updateCar(baseURL || '', car, { discount_percentage: -10 });
    await page.goto(`${baseURL}/car/${updated._id}`);
    await expect(page.getByText(/100,000/)).toBeVisible();
    await expect(page.getByText(/110,000/)).toHaveCount(0);
});

test("AC 23: Negative - 'PurchaseModal' must render the original price and must not render an 'Offer' section when 'discount_percentage' is 100.", async ({ page, baseURL }) => {
    const car = await createCarFromSeed(baseURL || '', { price: 100000, discount_percentage: 100 });
    await page.goto(`${baseURL}/car/${car._id}`);
    await page.locator('#book-now-main-button').click();
    const modal = page.locator('.fixed').last();
    await expect(modal.getByText(/100,000/).last()).toBeVisible();
    await expect(modal.getByText('Offer')).toHaveCount(0);
});
