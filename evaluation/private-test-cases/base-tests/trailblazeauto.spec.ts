import { test, expect } from '@playwright/test';

test.describe('Base Application Core Tests', () => {
    const API_URL = 'http://localhost';
    let sampleCarId: string;

    test.describe.configure({ mode: 'serial' });

    test('1. Fetch all cars (GET /api/cars)', async ({ request }) => {
        const response = await request.get(`${API_URL}/api/cars`);
        expect(response.status()).toBe(200);
        
        const data = await response.json();
        expect(data).toHaveProperty('cars');
        expect(Array.isArray(data.cars)).toBeTruthy();
        
        if (data.cars.length > 0) {
            sampleCarId = data.cars[0]._id || data.cars[0].id;
        }
    });

    test('2. Fetch a car by ID (GET /api/cars/:id)', async ({ request }) => {
        test.skip(!sampleCarId, 'No seeded cars found to test against');
        
        const response = await request.get(`${API_URL}/api/cars/${sampleCarId}`);
        expect(response.status()).toBe(200);
        
        const data = await response.json();
        const returnedId = data._id || data.id;
        expect(returnedId).toBe(sampleCarId);
    });

    test('3. Verify homepage loads correctly', async ({ page }) => {
        await page.goto(`${API_URL}/`);
        // Basic check for frontend mounting successfully (usually containing Trailblaze Auto branding)
        await expect(page.locator('body')).toBeVisible();
        await expect(page.locator('text=Drive Your Dream').first()).toBeVisible();
    });

    test('4. Verify car details page renders correctly', async ({ page }) => {
        test.skip(!sampleCarId, 'No seeded cars found to test against');
        
        await page.goto(`${API_URL}/car/${sampleCarId}`);
        // Ensure the specifics page mounts elements and isn't crashed
        await expect(page.locator('body')).toBeVisible();
    });
});
