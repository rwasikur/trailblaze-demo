import { test, expect } from '@playwright/test';

test('should sort cars by price ascending with cheapest first', async ({ request }) => {
    const res = await request.get('/api/cars?sort=price&order=asc');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.cars)).toBe(true);
    if (data.cars.length > 1) {
        for (let i = 1; i < data.cars.length; i++) {
            expect(data.cars[i].price_per_day).toBeGreaterThanOrEqual(data.cars[i - 1].price_per_day);
        }
    }
});
