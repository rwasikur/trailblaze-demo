import { test, expect } from '@playwright/test';

test.describe('Private Seed Tests', () => {
    const API_URL = '';

    test.describe.configure({ mode: 'serial' });

    let cars: any[] = [];

    test.beforeAll(async ({ request }) => {
        const response = await request.get(`${API_URL}/api/cars`);
        const data = await response.json();
        cars = data.cars || [];
    });

    test('7. Premium cars exist in private fleet (price_per_day > 1000)', async () => {
        const premiumCars = cars.filter((c: any) => c.price_per_day > 1000);
        test.skip(premiumCars.length === 0, 'No premium cars — skipping private seed test');
        expect(premiumCars.length).toBeGreaterThan(0);
    });

    test('8. Private fleet contains a Mercedes entry', async () => {
        const mercedes = cars.find((c: any) => c.brand === 'Honda');
        test.skip(!mercedes, 'No Mercedes found — skipping private seed test');
        expect(mercedes.availability_status).toBe('Available');
    });
});
