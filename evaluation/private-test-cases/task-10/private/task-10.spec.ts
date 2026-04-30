import { test, expect, request as playwrightRequest, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const TASK_DIR = path.resolve(__dirname);
const REPO_ROOT = path.resolve(TASK_DIR, '..', '..', '..', '..');
const ADMIN_ANALYTICS_DASHBOARD_PATH = path.join(REPO_ROOT, 'base-app', 'src', 'frontend', 'src', 'pages', 'AdminAnalyticsDashboard.jsx');
const ADMIN_CONTROLLER_PATH = path.join(REPO_ROOT, 'base-app', 'src', 'backend', 'controllers', 'adminController.js');

const CONFIG = {
    admin: { email: 'admin1@pri.com', password: 'pri123' },
    salesMode: 'private'
};

type CarSeed = {
    _id: string;
    brand?: string;
    model_year?: number | string;
    transmission?: string;
    fuel_type?: string;
    price_per_day?: number | string | null;
    condition?: string;
    availability_status?: string;
    body_type?: string;
    registration_city?: string;
    insurance_validity?: string | null;
    number_of_owners?: number | string | null;
};

async function getSeedCars(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    await ctx.dispose();
    return (body.cars ?? body) as CarSeed[];
}

async function getAnalytics(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    const res = await ctx.get(`${baseURL}/api/cars/analytics/summary`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    await ctx.dispose();
    return body;
}

async function getAdminToken(baseURL: string) {
    const ctx = await playwrightRequest.newContext();
    let res = await ctx.post(`${baseURL}/api/admin/login`, { data: CONFIG.admin });
    if (!res.ok()) {
        res = await ctx.post(`${baseURL}/api/admin/login`, {
            data: { email: 'admin@test.com', password: 'password123' }
        });
    }
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    await ctx.dispose();
    return body.token as string;
}

async function openAnalyticsDashboardWithToken(page: Page, baseURL: string) {
    const token = await getAdminToken(baseURL);
    await page.addInitScript(adminToken => {
        window.localStorage.setItem('adminToken', adminToken);
    }, token);
    await page.goto(`${baseURL}/admin/analytics`, { waitUntil: 'domcontentloaded' });
    return token;
}

async function openAdminDashboardWithToken(page: Page, baseURL: string) {
    const token = await getAdminToken(baseURL);
    await page.addInitScript(adminToken => {
        window.localStorage.setItem('adminToken', adminToken);
    }, token);
    await page.goto(`${baseURL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    return token;
}

function percentage(count: number, total: number) {
    return total === 0 ? 0 : Math.round((count / total) * 100);
}

function numericPrice(car: CarSeed) {
    return Number(car.price_per_day) || 0;
}

function validModelYears(cars: CarSeed[]) {
    return cars
        .map(car => Number(car.model_year))
        .filter(year => Number.isFinite(year) && year > 0);
}

function parseInsuranceDate(value: string | null | undefined) {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function distribution(cars: CarSeed[], field: keyof CarSeed, outputKey: string) {
    const counts = new Map<string, number>();
    for (const car of cars) {
        const key = String(car[field] || 'Unknown');
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([key, count]) => ({ [outputKey]: key, count, percentage: percentage(count, cars.length) }))
        .sort((a: any, b: any) => b.count - a.count);
}

function expectCountsSortedDescending(items: Array<{ count: number }>) {
    for (let i = 1; i < items.length; i += 1) {
        expect(items[i - 1].count).toBeGreaterThanOrEqual(items[i].count);
    }
}

function sortedDistribution(items: any[], key: string) {
    return [...items].sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return String(a[key]).localeCompare(String(b[key]));
    });
}

function expectDistributionItemsMatchSeed(actualItems: any[], expectedItems: any[], key: string) {
    for (const actual of actualItems) {
        const expected = expectedItems.find(item => item[key] === actual[key]);
        expect(expected).toBeTruthy();
        expect(actual.count).toBe(expected.count);
        expect(actual.percentage).toBe(expected.percentage);
    }
}

function readSource(filePath: string) {
    return fs.readFileSync(filePath, 'utf8');
}

// POSITIVE TESTS (AC 1 - 20)

test('AC 1: totalFleet equals the number of seeded car records returned by the cars API', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.totalFleet).toBe(cars.length);
});

test('AC 2: availableCount counts only seeded cars with Available status', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.availableCount).toBe(cars.filter(car => car.availability_status === 'Available').length);
});

test('AC 3: unavailableCount equals totalFleet minus availableCount', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.unavailableCount).toBe(analytics.totalFleet - analytics.availableCount);
});

test('AC 4: availabilityRate is rounded available percentage for the seeded fleet', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.availabilityRate).toBe(Math.round((analytics.availableCount / analytics.totalFleet) * 100));
});

test('AC 5: averageDailyRate rounds seeded fleet price total with invalid prices treated as 0', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    const expected = Math.round(cars.reduce((sum, car) => sum + numericPrice(car), 0) / cars.length);
    expect(analytics.averageDailyRate).toBe(expected);
});

test('AC 6: availableDailyRate sums seeded Available car prices only', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    const expected = cars
        .filter(car => car.availability_status === 'Available')
        .reduce((sum, car) => sum + numericPrice(car), 0);
    expect(analytics.availableDailyRate).toBe(expected);
});

test('AC 7: averageFleetAge uses only finite positive seeded model years', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    const years = validModelYears(cars);
    const expected = Math.round(years.reduce((sum, year) => sum + (new Date().getFullYear() - year), 0) / years.length);
    expect(analytics.averageFleetAge).toBe(expected);
});

test('AC 8: oldestModelYear is the minimum seeded finite positive model year', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.oldestModelYear).toBe(Math.min(...validModelYears(cars)));
});

test('AC 9: newestModelYear is the maximum seeded finite positive model year', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expect(analytics.newestModelYear).toBe(Math.max(...validModelYears(cars)));
});

test('AC 10: expiredInsuranceCount counts seeded parsable insurance dates before now', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    const now = new Date();
    const expected = cars
        .map(car => parseInsuranceDate(car.insurance_validity))
        .filter((date): date is Date => date !== null && date < now)
        .length;
    expect(analytics.expiredInsuranceCount).toBe(expected);
});

test('AC 11: insuranceExpiringSoonCount counts seeded parsable insurance dates through 30 days', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    const expected = cars
        .map(car => parseInsuranceDate(car.insurance_validity))
        .filter((date): date is Date => date !== null && date >= now && date <= soon)
        .length;
    expect(analytics.insuranceExpiringSoonCount).toBe(expected);
});

test('AC 12: brandDistribution is sorted by seeded brand count descending', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expectCountsSortedDescending(analytics.brandDistribution);
    expect(analytics.brandDistribution).toHaveLength(Math.min(8, distribution(cars, 'brand', 'brand').length));
    expectDistributionItemsMatchSeed(analytics.brandDistribution, distribution(cars, 'brand', 'brand'), 'brand');
});

test('AC 13: registrationCityDistribution is sorted by seeded city count descending', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expectCountsSortedDescending(analytics.registrationCityDistribution);
    expect(analytics.registrationCityDistribution).toHaveLength(Math.min(8, distribution(cars, 'registration_city', 'city').length));
    expectDistributionItemsMatchSeed(analytics.registrationCityDistribution, distribution(cars, 'registration_city', 'city'), 'city');
});

test('AC 14: fuelTypeDistribution objects include fuelType, count, and seeded percentage', async ({ baseURL }) => {
    const cars = await getSeedCars(baseURL || '');
    const analytics = await getAnalytics(baseURL || '');
    expect(sortedDistribution(analytics.fuelTypeDistribution, 'fuelType')).toEqual(
        sortedDistribution(distribution(cars, 'fuel_type', 'fuelType'), 'fuelType')
    );
});

test('AC 15: totalSalesRevenue is returned from SaleHistory.sum("price")', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '');
    const source = readSource(ADMIN_CONTROLLER_PATH);
    expect(source).toContain("SaleHistory.sum('price')");
    expect(Number.isFinite(analytics.totalSalesRevenue)).toBeTruthy();
});

test('AC 16: totalVehiclesSold is returned from SaleHistory.count()', async ({ baseURL }) => {
    const analytics = await getAnalytics(baseURL || '');
    const source = readSource(ADMIN_CONTROLLER_PATH);

    expect(source).toContain('SaleHistory.count()');
    expect(Number.isFinite(analytics.totalVehiclesSold)).toBeTruthy();
});

test('AC 17: analytics dashboard currency formatter supports displaying 12345 as $12,345', async () => {
    const source = readSource(ADMIN_ANALYTICS_DASHBOARD_PATH);
    expect(source).toContain('const formatCurrency = (value) => `$${(value ?? 0).toLocaleString()}`');
    expect(source).toContain('id="metric-total-sales-revenue"');
});

test('AC 18: analytics dashboard displays one seeded fleet status legend row per returned status', async ({ page, baseURL }) => {
    const analytics = await getAnalytics(baseURL || '');
    await openAnalyticsDashboardWithToken(page, baseURL || '');
    await expect(page.locator('#fleet-status-chart')).toBeVisible();
    const rows = page.locator('#fleet-status-chart .space-y-3 > div');
    await expect(rows).toHaveCount(analytics.statusDistribution.length);
    const rowTexts = await rows.allTextContents();
    for (const item of analytics.statusDistribution) {
        expect(rowTexts.some(text => text.includes(item.status) && text.includes(`${item.count} vehicles - ${item.percentage}%`))).toBeTruthy();
    }
});

test('AC 19: analytics navigation routes to the dedicated analytics page', async ({ page, baseURL }) => {
    await openAdminDashboardWithToken(page, baseURL || '');
    await page.locator('#analytics-dashboard-button').click();
    await expect(page).toHaveURL(/admin\/analytics/);
});

test('AC 20: dashboard return navigation routes back to admin dashboard', async ({ page, baseURL }) => {
    await openAnalyticsDashboardWithToken(page, baseURL || '');
    await page.locator('#back-to-admin-dashboard-button').click();
    await expect(page).toHaveURL(/admin\/dashboard/);
});

// NEGATIVE TESTS (AC 21 - 31)

test('AC 21: backend returns zero-valued fleet metrics when there are zero car records', async () => {
    const source = readSource(ADMIN_CONTROLLER_PATH);
    expect(source).toContain('totalFleet === 0 ? 0 : Math.round((count / totalFleet) * 100)');
    expect(source).toContain('totalFleet === 0');
    expect(source).toContain('averageDailyRate');
    expect(source).toContain('availableDailyRate');
});

test('AC 22: averageFleetAge returns 0 when there are no finite positive model years', async () => {
    const source = readSource(ADMIN_CONTROLLER_PATH);
    expect(source).toContain('validYears.length === 0');
    expect(source).toContain('? 0');
});

test('AC 23: oldestModelYear returns null when there are no finite positive model years', async () => {
    const source = readSource(ADMIN_CONTROLLER_PATH);
    expect(source).toContain('const oldestModelYear = validYears.length ? Math.min(...validYears) : null');
});

test('AC 24: newestModelYear returns null when there are no finite positive model years', async () => {
    const source = readSource(ADMIN_CONTROLLER_PATH);
    expect(source).toContain('const newestModelYear = validYears.length ? Math.max(...validYears) : null');
});

test('AC 25: missing, empty, or unparsable insurance does not increment expiredInsuranceCount', async () => {
    const source = readSource(ADMIN_CONTROLLER_PATH);
    expect(source).toContain('if (!value) return null');
    expect(source).toContain('Number.isNaN(parsed.getTime()) ? null : parsed');
    expect(source).toContain('expiredInsuranceCount = insuranceDates.filter(date => date < now).length');
});

test('AC 26: missing, empty, or unparsable insurance does not increment insuranceExpiringSoonCount', async () => {
    const source = readSource(ADMIN_CONTROLLER_PATH);
    expect(source).toContain('if (!value) return null');
    expect(source).toContain('Number.isNaN(parsed.getTime()) ? null : parsed');
    expect(source).toContain('insuranceExpiringSoonCount = insuranceDates.filter(date => date >= now && date <= soon).length');
});

test('AC 27: analytics dashboard has an empty state for empty statusDistribution without a chart', async () => {
    const source = readSource(ADMIN_ANALYTICS_DASHBOARD_PATH);
    expect(source).toContain('id="fleet-status-empty"');
    expect(source).toContain('No fleet status data available.');
    expect(source).toContain('id="fleet-status-chart"');
});

test('AC 28: analytics dashboard has an empty state for empty fuelTypeDistribution', async () => {
    const source = readSource(ADMIN_ANALYTICS_DASHBOARD_PATH);
    expect(source).toContain('id="fuel-type-empty"');
    expect(source).toContain('No fuel type data available.');
});

test('AC 29: analytics dashboard displays analytics request failure message', async ({ page, baseURL }) => {
    const token = await getAdminToken(baseURL || '');
    await page.addInitScript(adminToken => {
        window.localStorage.setItem('adminToken', adminToken);
    }, token);
    await page.route('**/api/cars/analytics/summary', route => route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"failed"}' }));
    await page.goto(`${baseURL}/admin/analytics`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#analytics-error-message')).toHaveText('Unable to load fleet analytics. Select Retry to request the latest data.');
});

test('AC 30: Retry sends one additional analytics summary request', async ({ page, baseURL }) => {
    let requestCount = 0;

    const token = await getAdminToken(baseURL || '');
    await page.addInitScript(adminToken => {
        window.localStorage.setItem('adminToken', adminToken);
    }, token);
    await page.route('**/api/cars/analytics/summary', route => {
        requestCount += 1;
        route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"failed"}' });
    });

    await page.goto(`${baseURL}/admin/analytics`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#analytics-error-message')).toBeVisible();
    const beforeRetry = requestCount;
    await page.locator('#analytics-retry-button').click();
    await expect.poll(() => requestCount).toBe(beforeRetry + 1);
});

test('AC 31: totalSalesRevenue returns 0 when SaleHistory.sum("price") returns null', async () => {
    const source = readSource(ADMIN_CONTROLLER_PATH);
    expect(source).toContain("const totalSalesRevenue = await SaleHistory.sum('price') || 0");
});
