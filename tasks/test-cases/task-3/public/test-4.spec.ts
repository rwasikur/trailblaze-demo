import { test, expect } from '@playwright/test';

test('should allow sorting by popularity', async ({ request }) => {
    const res = await request.get('/api/cars?sort=popularity&order=desc');
    expect(res.status()).toBe(200);
});
