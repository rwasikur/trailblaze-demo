import { test, expect, Page } from '@playwright/test';

test.describe('Catalogue Search Bar - Task 6 Suite (Private)', () => {

    test.beforeEach(async ({ page }: { page: Page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/browse');
        await page.waitForLoadState('networkidle');
    });

    test("Catalogue page must feature a prominent search input with id 'search-input' and the placeholder 'Search by make, model, or details...'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveAttribute('placeholder', 'Search by make, model, or details...');
    });

    test("Search input with id 'search-input' must filter the car list in real-time as the user types, displaying results within the container id 'car-grid'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Baleno');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Baleno');
    });

    test("The search functionality must match the car's 'brand' property (e.g., searching 'Maruti' should show Maruti Suzuki cars) within the car cards in id 'car-grid'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Maruti Suzuki');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Maruti Suzuki|Swift|Baleno|Fronx/i);
        }
    });

    test("The search functionality must match the car's 'body_type' property (e.g., searching 'SUV' should show SUV cars) within the car cards in id 'car-grid'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('MUV');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        // Carens and Triber are MUVs in private seed
    });

    test("The search functionality must match the car's 'fuel_type' property (e.g., searching 'Diesel' should show diesel cars) within the car cards in id 'car-grid'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Diesel');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Diesel/i);
        }
    });

    test("The search functionality must match the car's 'transmission' property (e.g., searching 'Automatic' or 'Manual') within the car cards in id 'car-grid'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        
        // Search Manual
        await searchInput.fill('Manual');
        const manualCards = page.locator('#car-grid article');
        const manualCount = await manualCards.count();
        expect(manualCount).toBeGreaterThan(0);
        for (let i = 0; i < manualCount; i++) {
            await expect(manualCards.nth(i)).toContainText(/Manu/i);
        }

        // Search Automatic
        await searchInput.fill('Automatic');
        const autoCards = page.locator('#car-grid article');
        const autoCount = await autoCards.count();
        expect(autoCount).toBeGreaterThan(0);
        for (let i = 0; i < autoCount; i++) {
            await expect(autoCards.nth(i)).toContainText(/Auto/i);
        }
    });

    test("All search operations performed via id 'search-input' must be case-insensitive to ensure a user-friendly experience.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('skoda');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Skoda/i);
        }
    });

    test("The search functionality must match the car's 'description' text fragment (e.g., searching 'scratchless' should show matching cars) within the car cards in id 'car-grid'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Big Daddy');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Scorpio-N');
    });

    test("Search input id 'search-input' must work seamlessly in combination with the condition filters using ids 'filter-new' and 'filter-pre-owned'.", async ({ page }: { page: Page }) => {
        await page.locator('#filter-pre-owned').click();
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Altroz');
        
        const carCards = page.locator('#car-grid article');
        await expect(carCards).toHaveCount(1);
        await expect(carCards.first()).toContainText('Altroz');
    });

    test("Clearing the search input id 'search-input' must immediately restore the full list of available cars in id 'car-grid', respecting any active condition filters.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Baleno');
        await expect(page.locator('#car-grid article')).toHaveCount(1);
        
        await searchInput.fill('');
        const count = await page.locator('#car-grid article').count();
        expect(count).toBeGreaterThan(5); 
    });

    // Negative Cases (30% of 12-14 cases is ~4-5)

    test("Negative: Search for a non-existent brand 'Lamborghini' should show no results.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Lamborghini');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search for 'Kushaq' when 'Pre-Owned' filter is selected should show no results.", async ({ page }: { page: Page }) => {
        await page.locator('#filter-pre-owned').click();
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Kushaq');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search with random special characters '!!!!' should show no results.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('!!!!');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("Negative: Search for a sold car model 'Venue' should not display it.", async ({ page }: { page: Page }) => {
        // Venue is Sold in private seed
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Venue');
        
        await expect(page.locator('text=No matches found')).toBeVisible();
        await expect(page.locator('#car-grid article')).toHaveCount(0);
    });

    test("The search functionality must match the car's 'registration_city' or 'registration_state' properties within the car cards in id 'car-grid'.", async ({ page }: { page: Page }) => {
        const searchInput = page.locator('#search-input');
        await searchInput.fill('Ghaziabad');
        
        const carCards = page.locator('#car-grid article');
        const count = await carCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(carCards.nth(i)).toContainText(/Scorpio-N/i); // Scorpio-N is in Ghaziabad
        }
    });

    test.describe('Admin Dashboard Search Bar', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/admin');
            await page.evaluate(() => localStorage.clear());
            await page.reload();
            await page.locator('#admin-email-input').fill('admin1@pri.com');
            await page.locator('#admin-password-input').fill('pri123');
            await page.locator('#admin-login-button').click();
            await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
        });

        test("Admin Dashboard must include a persistent search input with id 'admin-search-input' to filter administrative views.", async ({ page }) => {
            const searchInput = page.locator('#admin-search-input');
            await expect(searchInput).toBeVisible();
        });

        test("Admin search via id 'admin-search-input' must filter the vehicle inventory table in real-time and display results in the list with id 'dashboard-car-list'.", async ({ page }) => {
            const searchInput = page.locator('#admin-search-input');
            await searchInput.fill('Mahindra');
            await page.waitForTimeout(500);

            const rows = page.locator('#dashboard-car-list tr');
            const count = await rows.count();
            expect(count).toBeGreaterThan(0);
            for (let i = 0; i < count; i++) {
                await expect(rows.nth(i)).toContainText(/Mahindra/i);
            }
        });

        test("Admin search via id 'admin-search-input' must filter the customer bookings table by customer name, email, or vehicle choice in the active view.", async ({ page }) => {
            await page.locator('#admin-bookings-tab').click();
            const searchInput = page.locator('#admin-search-input');
            await searchInput.fill('Vikram');
            await page.waitForTimeout(500);

            const rows = page.locator('tbody tr');
            const count = await rows.count();
            expect(count).toBeGreaterThan(0);
            for (let i = 0; i < count; i++) {
                await expect(rows.nth(i)).toContainText(/Vikram/i);
            }
        });

        test("The search input with id 'admin-search-input' must be programmatically cleared when switching between dashboard tabs 'Vehicles' (id 'admin-vehicles-tab') and 'Bookings' (id 'admin-bookings-tab').", async ({ page }) => {
            const searchInput = page.locator('#admin-search-input');
            await searchInput.fill('Swift');
            await page.locator('#admin-bookings-tab').click();
            await expect(searchInput).toHaveValue('');
        });
    });

});
