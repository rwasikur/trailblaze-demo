import { test, expect } from '@playwright/test';

test('should sort cars by price descending with most expensive first', async ({ request }) => {
    const res = await request.get('/api/cars?sort=price&order=desc');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.cars)).toBe(true);
    if (data.cars.length > 1) {
        for (let i = 1; i < data.cars.length; i++) {
            expect(data.cars[i].price_per_day).toBeLessThanOrEqual(data.cars[i - 1].price_per_day);
        }
    }
});
