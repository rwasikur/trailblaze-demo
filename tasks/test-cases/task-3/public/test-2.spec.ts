import { test, expect } from '@playwright/test';

test('should allow sorting by price', async ({ request }) => {
    const res = await request.get('/api/cars?sort=price&order=asc');
    expect(res.status()).toBe(200);
});
