import { test, expect } from '@playwright/test';

test('should allow sorting by year', async ({ request }) => {
    const res = await request.get('/api/cars?sort=year&order=desc');
    expect(res.status()).toBe(200);
});
