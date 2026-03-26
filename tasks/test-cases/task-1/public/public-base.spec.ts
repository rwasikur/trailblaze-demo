import { test, expect } from '@playwright/test';

test.describe('Public Seed Tests', () => {
    const API_URL = 'http://localhost';

    test.describe.configure({ mode: 'serial' });

    test('5. Cars API response includes total count matching array length', async ({ request }) => {
        const response = await request.get(`${API_URL}/api/cars`);
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('total');
        expect(data).toHaveProperty('cars');
        expect(data.total).toBe(data.cars.length);
    });

    test('6. Car list items have required fields', async ({ request }) => {
        const response = await request.get(`${API_URL}/api/cars`);
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data).toHaveProperty('cars');
        expect(Array.isArray(data.cars)).toBeTruthy();
        expect(data.cars.length).toBeGreaterThan(0);

        const car = data.cars[0];
        expect(car).toHaveProperty('name');
        expect(car).toHaveProperty('brand');
        expect(car).toHaveProperty('price_per_day');
        expect(car).toHaveProperty('availability_status');
        expect(typeof car.price_per_day).toBe('number');
        expect(car.price_per_day).toBeGreaterThan(0);
    });
});
