import { test, expect } from '@playwright/test';

test('should allow sorting in both ascending and descending order', async ({ request }) => {
    const ascRes = await request.get('/api/cars?sort=price&order=asc');
    expect(ascRes.status()).toBe(200);

    const descRes = await request.get('/api/cars?sort=price&order=desc');
    expect(descRes.status()).toBe(200);
});
