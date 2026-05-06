import { test, expect, request as playwrightRequest } from '@playwright/test';

const CONFIG = {
    admin: { email: 'admin1@pri.com', password: 'pri123' }
};

type CarSeed = {
    _id: string;
    brand?: string;
    availability_status?: string;
    fuel_type?: string;
    body_type?: string;
    condition?: string;
    registration_city?: string;
    price?: number | string | null;
};

type BookingSeed = {
    _id: string;
    status?: string;
    createdAt?: string;
    car?: CarSeed;
};

type QueryParams = Record<string, string>;

async function getAdminToken(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    try {
        let res = await ctx.post(`${baseURL}/api/admin/login`, { data: CONFIG.admin });
        if (!res.ok()) {
            res = await ctx.post(`${baseURL}/api/admin/login`, {
                data: { email: 'admin@test.com', password: 'password123' }
            });
        }
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        return body.token as string;
    } finally {
        await ctx.dispose();
    }
}

async function getSeedCars(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    try {
        const res = await ctx.get(`${baseURL}/api/cars`);
        expect(res.ok()).toBeTruthy();
        const body = await res.json();
        return (body.cars ?? body) as CarSeed[];
    } finally {
        await ctx.dispose();
    }
}

async function getSeedBookings(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    try {
        const token = await getAdminToken(baseURL);
        const res = await ctx.get(`${baseURL}/api/bookings/admin/all`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(res.ok()).toBeTruthy();
        return await res.json() as BookingSeed[];
    } finally {
        await ctx.dispose();
    }
}

async function getAnalytics(baseURL: string, params: QueryParams = {}) {
    const ctx = await playwrightRequest.newContext();
    try {
        const token = await getAdminToken(baseURL);
        const search = new URLSearchParams(params).toString();
        const res = await ctx.get(`${baseURL}/api/cars/analytics/summary${search ? `?${search}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        expect(res.ok()).toBeTruthy();
        return await res.json();
    } finally {
        await ctx.dispose();
    }
}

function sortedUniqueNonEmpty(values: Array<string | undefined>) {
    return [...new Set(values.filter((value): value is string => Boolean(value)))]
        .sort();
}

function money(value: unknown) {
    return Number(value) || 0;
}

function percentage(count: number, total: number) {
    return total === 0 ? 0 : Math.round((count / total) * 100);
}

function matchesFilters(car: CarSeed | undefined, filters: QueryParams) {
    if (!car) return false;
    if (filters.status && car.availability_status !== filters.status) return false;
    if (filters.brand && car.brand !== filters.brand) return false;
    if (filters.fuelType && car.fuel_type !== filters.fuelType) return false;
    if (filters.bodyType && car.body_type !== filters.bodyType) return false;
    if (filters.condition && car.condition !== filters.condition) return false;
    if (filters.city && car.registration_city !== filters.city) return false;
    return true;
}

function inLastDays(value: string | undefined, days: number) {
    if (!value) return false;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return false;
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    return date >= start && date <= now;
}

function periodKey(value: string | undefined) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
}

function chooseFilterCar(cars: CarSeed[]) {
    const car = cars.find(item => item.brand && item.fuel_type && item.registration_city);
    expect(car).toBeTruthy();
    return car as CarSeed;
}

test('AC 1: `filterOptions.brands` must contain each non-empty car brand exactly once, sorted ascending alphabetically.', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.filterOptions.brands).toEqual(sortedUniqueNonEmpty(cars.map(car => car.brand)));
});

test('AC 2: `filterOptions.statuses` must contain each non-empty `availability_status` exactly once, sorted ascending alphabetically.', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.filterOptions.statuses).toEqual(sortedUniqueNonEmpty(cars.map(car => car.availability_status)));
});

test('AC 3: When `status=<value>` is provided, `carRows` must contain only cars whose `availability_status` exactly equals `<value>`.', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const status = sortedUniqueNonEmpty(cars.map(car => car.availability_status))[0];
    const analytics = await getAnalytics(baseURL || '', { status });
    expect(analytics.carRows.length).toBeGreaterThan(0);
    expect(analytics.carRows.every((row: any) => row.status === status)).toBeTruthy();
});

test('AC 4: When `brand`, `fuelType`, and `city` are provided together, the API must apply all three filters with AND semantics.', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const selected = chooseFilterCar(cars);
    const filters = {
        brand: selected.brand || '',
        fuelType: selected.fuel_type || '',
        city: selected.registration_city || ''
    };
    const analytics = await getAnalytics(baseURL || '', filters);
    const expected = cars.filter(car => matchesFilters(car, filters));
    expect(analytics.totalFleet).toBe(expected.length);
    expect(analytics.carRows.every((row: any) =>
        row.brand === filters.brand &&
        row.fuelType === filters.fuelType &&
        row.city === filters.city
    )).toBeTruthy();
});

test('AC 5: `totalInventoryValue` must equal the sum of numeric `price` values for filtered cars.', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const selected = chooseFilterCar(cars);
    const filters = { brand: selected.brand || '' };
    const analytics = await getAnalytics(baseURL || '', filters);
    const expected = cars.filter(car => matchesFilters(car, filters)).reduce((sum, car) => sum + money(car.price), 0);
    expect(analytics.totalInventoryValue).toBe(expected);
});

test('AC 6: `availableInventoryValue` must equal the sum of numeric `price` values for filtered cars where `availability_status === "Available"`.', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const selected = chooseFilterCar(cars);
    const filters = { brand: selected.brand || '' };
    const analytics = await getAnalytics(baseURL || '', filters);
    const expected = cars
        .filter(car => matchesFilters(car, filters) && car.availability_status === 'Available')
        .reduce((sum, car) => sum + money(car.price), 0);
    expect(analytics.availableInventoryValue).toBe(expected);
});

test('AC 7: `soldInventoryValue` must equal the sum of numeric `price` values for filtered cars where `availability_status === "Sold"`.', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const selected = cars.find(car => car.availability_status === 'Sold' && car.brand) || chooseFilterCar(cars);
    const filters = { brand: selected.brand || '' };
    const analytics = await getAnalytics(baseURL || '', filters);
    const expected = cars
        .filter(car => matchesFilters(car, filters) && car.availability_status === 'Sold')
        .reduce((sum, car) => sum + money(car.price), 0);
    expect(analytics.soldInventoryValue).toBe(expected);
});

test('AC 8: `averageListingPrice` must equal `Math.round(totalInventoryValue / totalFleet)` when `totalFleet > 0`.', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.totalFleet).toBeGreaterThan(0);
    expect(analytics.averageListingPrice).toBe(Math.round(analytics.totalInventoryValue / analytics.totalFleet));
});

test('AC 9: `totalBookings` must count only bookings inside the selected date range whose associated car matches the active vehicle filters.', async ({ baseURL }) => {
    const bookings = await getSeedBookings(baseURL || '');
    const bookingWithCar = bookings.find(booking => booking.car?.brand);
    expect(bookingWithCar).toBeTruthy();
    const filters = { range: '30', brand: bookingWithCar?.car?.brand || '' };
    const analytics = await getAnalytics(baseURL || '', filters);
    const expected = bookings.filter(booking =>
        inLastDays(booking.createdAt, 30) &&
        matchesFilters(booking.car, filters)
    ).length;
    expect(analytics.totalBookings).toBe(expected);
});

test('AC 10: `bookingConversionRate` must equal `Math.round((acceptedBookings / totalBookings) * 100)` when `totalBookings > 0`.', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.totalBookings).toBeGreaterThan(0);
    expect(analytics.bookingConversionRate).toBe(percentage(analytics.acceptedBookings, analytics.totalBookings));
});

test('AC 11: `pendingPipelineValue` must equal the sum of numeric associated-car prices for filtered bookings with `status === "Pending"`.', async ({ baseURL }) => {
    const bookings = await getSeedBookings(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    const expected = bookings
        .filter(booking => booking.status === 'Pending')
        .reduce((sum, booking) => sum + money(booking.car?.price), 0);
    expect(analytics.pendingPipelineValue).toBe(expected);
});

test('AC 12: `acceptedBookingValue` must equal the sum of numeric associated-car prices for filtered bookings with `status === "Accepted"`.', async ({ baseURL }) => {
    const bookings = await getSeedBookings(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    const expected = bookings
        .filter(booking => booking.status === 'Accepted')
        .reduce((sum, booking) => sum + money(booking.car?.price), 0);
    expect(analytics.acceptedBookingValue).toBe(expected);
});

test('AC 13: `demandByVehicle` must be sorted by `bookingCount` descending and contain at most 10 rows.', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.demandByVehicle.length).toBeLessThanOrEqual(10);
    for (let i = 1; i < analytics.demandByVehicle.length; i += 1) {
        expect(analytics.demandByVehicle[i - 1].bookingCount).toBeGreaterThanOrEqual(analytics.demandByVehicle[i].bookingCount);
    }
});

test('AC 14: With `granularity=day`, every `salesByMonth[].period` value must use the `YYYY-MM-DD` date bucket format.', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '', { granularity: 'day' });
    expect(analytics.salesByMonth.length).toBeGreaterThan(0);
    for (const row of analytics.salesByMonth) {
        expect(row.period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
});

test('AC 15: If `granularity` is not `day`, `week`, or `month`, the API must return `period.granularity: "month"`.', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '', { granularity: 'quarter' });
    expect(analytics.period.granularity).toBe('month');
});

test('AC 16: If `range=custom` is sent without both valid `startDate` and `endDate`, the API must return all-time booking and sales totals instead of applying a partial date range.', async ({ baseURL }) => {
    const allTime = await getAnalytics(baseURL || '');
    const partialCustom = await getAnalytics(baseURL || '', { range: 'custom', startDate: '2026-01-01' });
    expect(partialCustom.totalBookings).toBe(allTime.totalBookings);
    expect(partialCustom.totalVehiclesSold).toBe(allTime.totalVehiclesSold);
    expect(partialCustom.totalSalesRevenue).toBe(allTime.totalSalesRevenue);
});

test('AC 17: If `totalFleet` is `0`, `averageListingPrice` must return `0` and must not return `NaN`, `Infinity`, or `null`.', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '', { brand: '__missing_seed_brand__' });
    expect(analytics.totalFleet).toBe(0);
    expect(analytics.averageListingPrice).toBe(0);
    expect(Number.isFinite(analytics.averageListingPrice)).toBeTruthy();
});

test('AC 18: If `totalBookings` is `0`, `bookingConversionRate` must return `0` and must not return `NaN`, `Infinity`, or `null`.', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '', { range: 'custom', startDate: '1900-01-01', endDate: '1900-01-02' });
    expect(analytics.totalBookings).toBe(0);
    expect(analytics.bookingConversionRate).toBe(0);
    expect(Number.isFinite(analytics.bookingConversionRate)).toBeTruthy();
});

test('AC 19: If a comparison previous value is `0`, its `deltaPercentage` must be `null` and must not return `0`, `NaN`, or `Infinity`.', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '', { range: '7' });
    const zeroPreviousComparison = Object.values(analytics.comparisons).find((comparison: any) => comparison.previous === 0) as any;
    expect(zeroPreviousComparison).toBeTruthy();
    expect(zeroPreviousComparison.deltaPercentage).toBeNull();
});

test('AC 20: If a ranged booking or sale has an unparsable date, it must not be included in `bookingsByMonth`, `salesByMonth`, or ranged totals.', async ({ baseURL }) => {
    const bookings = await getSeedBookings(baseURL || '');
    const analytics = await getAnalytics(baseURL || '', { range: '30', granularity: 'day' });
    const expectedBookingPeriods = new Set(
        bookings
            .filter(booking => inLastDays(booking.createdAt, 30))
            .map(booking => periodKey(booking.createdAt))
            .filter(Boolean)
    );
    const actualBookingTotal = analytics.bookingsByMonth.reduce((sum: number, row: any) => sum + row.bookings, 0);
    expect(actualBookingTotal).toBe([...expectedBookingPeriods].reduce((sum, period) => {
        return sum + bookings.filter(booking => inLastDays(booking.createdAt, 30) && periodKey(booking.createdAt) === period).length;
    }, 0));
    for (const row of [...analytics.bookingsByMonth, ...analytics.salesByMonth]) {
        expect(row.period).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Number.isNaN(new Date(row.period).getTime())).toBeFalsy();
    }
});
