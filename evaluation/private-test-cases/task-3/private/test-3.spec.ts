import { test, expect } from '@playwright/test';

test('should sort cars by model year descending', async ({ request }) => {
    const res = await request.get('/api/cars?sort=year&order=desc');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.cars)).toBe(true);
    if (data.cars.length > 1) {
        for (let i = 1; i < data.cars.length; i++) {
            expect(data.cars[i].model_year).toBeLessThanOrEqual(data.cars[i - 1].model_year);
        }
    }
});
