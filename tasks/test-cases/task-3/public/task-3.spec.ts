import { test, expect, request as playwrightRequest, Page } from '@playwright/test';

const USERS = {
    admin1: { email: 'admin1@pub.com', password: 'pub123' }
};

// Helpers
async function getVisibleCarNames(page: Page) {
    const nameLocators = page.locator('[id$="-name"]');
    await nameLocators.first().waitFor();
    const names = await nameLocators.allInnerTexts();
    return names.map(n => n.trim());
}

async function getVisibleCatalogueCarNames(page: Page) {
    const nameLocators = page.locator('tbody tr td:nth-child(2)');
    await nameLocators.first().waitFor();
    return await nameLocators.allInnerTexts();
}

async function getVisibleDashboardCarNames(page: Page) {
    const nameLocators = page.locator('#dashboard-car-list tr td:nth-child(1) .font-black');
    await nameLocators.first().waitFor();
    return await nameLocators.allInnerTexts();
}

async function login(page: Page, baseURL: string, user = USERS.admin1) {
    await page.goto(`${baseURL}/admin`);
    const emailInput = page.locator('#admin-email-input');
    await expect(emailInput).toBeVisible();
    await emailInput.fill(user.email);
    await page.locator('#admin-password-input').fill(user.password);
    await page.locator('#admin-login-button').click();
    await page.waitForURL(/dashboard/);
}

async function gotoLastPage(page: Page) {
    while (true) {
        await page.waitForSelector(':has-text("Loading")', { state: 'hidden', timeout: 5000 }).catch(() => {});
        
        const nextBtn = page.getByRole('button', { name: 'Next' });
        const isVisible = await nextBtn.isVisible();
        if (!isVisible) {
            await page.waitForTimeout(1000);
            if (!(await nextBtn.isVisible())) break;
        }
        
        if (!(await nextBtn.isEnabled())) break;
        
        const oldUrl = page.url();
        await nextBtn.click();
        await page.waitForURL((url) => url.toString() !== oldUrl, { timeout: 3000 }).catch(() => {});
    }
}

// PUBLIC TEST SUITE - TASK 3 (Pagination & State Persistence)

test("AC 1: Navigate to the public browse page ('/browse?page=1'). Verify that the vehicle grid correctly displays the first 9 vehicles from the inventory.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse?page=1`);
    await expect(page.locator('#car-grid article')).toHaveCount(9);
    const page1Btn = page.getByRole('button', { name: '1', exact: true });
    await expect(page1Btn).toHaveClass(/bg-slate-900/);
});

test("AC 2: On the '/browse' page, click the '2' button in the pagination footer. Verify that the URL updates to '/browse?page=2' and the second set of vehicles is rendered in the grid.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse?page=1`);
    const page1Names = await getVisibleCarNames(page);
    
    const page2Btn = page.getByRole('button', { name: '2', exact: true });
    await page2Btn.click();
    await expect(page).toHaveURL(/page=2/);
    
    const page2Names = await getVisibleCarNames(page);
    expect(page2Names.length).toBeGreaterThan(0);
    expect(page2Names).not.toEqual(page1Names);
});

test("AC 3: On the '/browse' page, select a filter option that yields multiple pages of results. Switch to page 2. Then reset the filter to 'All'. Verify that the pagination automatically resets to page 1.", async ({ page, baseURL }) => {
    await page.route('**/api/cars', async route => {
        const dummyCars = [
            ...Array.from({ length: 11 }, (_, idx) => ({
                _id: `new-car-${idx}`,
                name: `New Car ${idx}`,
                brand: 'Brand',
                condition: 'New',
                availability_status: 'Available',
                price: 20000
            })),
            ...Array.from({ length: 2 }, (_, idx) => ({
                _id: `used-car-${idx}`,
                name: `Used Car ${idx}`,
                brand: 'Brand',
                condition: 'Used',
                availability_status: 'Available',
                price: 15000
            }))
        ];
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ cars: dummyCars })
        });
    });

    await page.goto(`${baseURL}/browse?page=1`);
    
    const resultsCountLocator = page.locator('span.text-blue-600.mr-2.text-sm');
    await resultsCountLocator.waitFor();
    const initialTotal = await resultsCountLocator.innerText();
    
    // Select "New" filter -> 11 items (multiple pages)
    await page.locator('#filter-new').click();
    await page.waitForTimeout(500);
    
    const page2Btn = page.getByRole('button', { name: '2', exact: true });
    await page2Btn.click();
    await expect(page).toHaveURL(/page=2/);
    
    // Reset filter to All
    await page.locator('#filter-all').click();
    await expect(page).toHaveURL(/page=1/);
    
    // Verify total results count is restored
    await expect(resultsCountLocator).toHaveText(initialTotal);
    
    // Verify pagination recalculates correctly: Page 2 button must be visible again (13 items = 2 pages)
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible();
    
    // Verify Page 1 is active in UI
    const page1Btn = page.getByRole('button', { name: '1', exact: true });
    await expect(page1Btn).toHaveClass(/bg-slate-900/);
});

test("AC 4: Navigate to the Manage Catalogue page at '/admin/catalogue?page=1'. Verify the vehicle table lists the first 10 records and the pagination highlights the first page.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/catalogue?page=1`);
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await expect(page.getByRole('button', { name: '1', exact: true })).toHaveClass(/bg-slate-900/);
});

test("AC 5: On the Manage Catalogue page (Page 2), click 'Options' -> 'Edit Vehicle' for a specific car. Verify the URL contains 'fromPage=2'. Modify any detail and click 'Save Changes'. Verify the application redirects back to '/admin/catalogue?page=2'.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/catalogue?page=1`);
    
    const page2Btn = page.getByRole('button', { name: '2', exact: true });
    await page2Btn.click();
    await page.waitForTimeout(500);
    
    const page2Names = await getVisibleCatalogueCarNames(page);
    
    await page.locator('button:has-text("Options")').first().click();
    await page.getByText('Edit Vehicle').click();
    await expect(page).toHaveURL(/fromPage=2/);
    
    await page.locator('#car-price-input').fill('1234567');
    await page.getByRole('button', { name: /Save Changes/i }).click();
    
    await expect(page).toHaveURL(/admin\/catalogue\?page=2/);
    await expect(page.getByText(/Vehicle updated successfully!/i)).toBeVisible();
    
    // Confirm the updated data is actually persisted and reflected in the UI
    await expect(page.getByText('$1,234,567').or(page.getByText('$1234567'))).toBeVisible();
    
    const finalNames = await getVisibleCatalogueCarNames(page);
    expect(finalNames).toEqual(page2Names);
});

test("AC 6: In the Admin Dashboard, switch to the 'Bookings' tab and navigate to page 2. Verify the URL includes 'bPage=2'. Switch back to the 'Vehicles' tab and verify its pagination state (vPage) is preserved.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    
    // Ensure we are on vPage=2
    await page.goto(`${baseURL}/admin/dashboard?vPage=2`);
    await expect(page).toHaveURL(/vPage=2/);
    
    // Switch to Bookings tab
    await page.locator('#admin-bookings-tab').click();
    
    // Actively click Next on Bookings tab to go to bPage=2
    const nextBtn = page.locator('button:has-text("Next")');
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();
    await expect(page).toHaveURL(/bPage=2/);
    
    // Switch back to Vehicles tab
    await page.locator('#admin-vehicles-tab').click();
    
    // Verify Vehicles pagination state vPage=2 is fully preserved
    await expect(page).toHaveURL(/vPage=2/);
});

test("AC 7: In the 'Vehicles' tab of the Admin Dashboard, click the 'Next' arrow button. Verify that the vPage parameter in the URL increments correctly and the table updates with the next set of inventory records.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/dashboard?vPage=1`);
    
    const page1Names = await getVisibleDashboardCarNames(page);
    const nextBtn = page.locator('.p-4 >> text=Next');
    
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();
    await page.waitForTimeout(500);
    
    // Explicitly verify vPage URL parameter increments correctly
    await expect(page).toHaveURL(/vPage=2/);
    
    const page2Names = await getVisibleDashboardCarNames(page);
    expect(page2Names).not.toEqual(page1Names);
});

test("AC 8: On the first page of the '/browse' inventory, verify that the 'Previous' pagination button is visually disabled and clicking it does not change the URL or refresh the list.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse?page=1`);
    
    const page1Names = await getVisibleCarNames(page);
    const prevBtn = page.getByRole('button', { name: 'Previous' });
    await expect(prevBtn).toBeDisabled();
    
    // Clicking the disabled button should have no effect on URL or displayed data
    await prevBtn.click({ force: true });
    await expect(page).toHaveURL(/page=1/);
    const finalNames = await getVisibleCarNames(page);
    expect(finalNames).toEqual(page1Names);
});

test("AC 9: On the last page of the vehicle inventory in Manage Catalogue, verify that the 'Next' pagination button is disabled and clicking it has no effect on the current view.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/catalogue`);
    
    await gotoLastPage(page);
    
    const initialUrl = page.url();
    const pageNames = await getVisibleCatalogueCarNames(page);
    const nextBtn = page.getByRole('button', { name: 'Next' });
    
    await page.waitForTimeout(1000);
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeDisabled();
    
    // Clicking disabled button should have no effect
    await nextBtn.click({ force: true });
    expect(page.url()).toBe(initialUrl);
    const finalNames = await getVisibleCatalogueCarNames(page);
    expect(finalNames).toEqual(pageNames);
});

test("AC 10: Verify that the pagination component is hidden from the UI when zero results are found.", async ({ page, baseURL }) => {
    await page.route('**/api/cars', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ cars: [] })
        });
    });
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator('#car-grid article')).toHaveCount(0);
    
    const pagination = page.locator('.flex.flex-col.items-center.justify-center.space-y-4');
    await expect(pagination).not.toBeVisible();
});

test("AC 11: If the total number of vehicles in the catalogue is less than or equal to the items per page (9), verify that the pagination footer is not rendered.", async ({ page, baseURL }) => {
    await page.route('**/api/cars', async route => {
        const dummyCars = Array.from({ length: 5 }, (_, idx) => ({
            _id: `car-${idx}`,
            name: `Car ${idx}`,
            brand: 'Brand',
            condition: 'New',
            availability_status: 'Available',
            price: 20000
        }));
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ cars: dummyCars })
        });
    });
    await page.goto(`${baseURL}/browse`);
    await expect(page.locator('#car-grid article')).toHaveCount(5);
    const pagination = page.locator('.flex.flex-col.items-center.justify-center.space-y-4');
    await expect(pagination).not.toBeVisible();
});

test("AC 12: In the 'Bookings' tab of the Admin Dashboard, if the table displays 'No active bookings.', verify that the pagination controls are suppressed.", async ({ page, baseURL }) => {
    await page.route('**/api/bookings/admin/all', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([])
        });
    });

    await login(page, baseURL || '');
    await page.locator('#admin-bookings-tab').click();
    
    await expect(page.getByText(/No .* bookings found\./i)).toBeVisible();
    const pagination = page.locator('.flex.flex-col.items-center.justify-center.space-y-4').nth(1);
    await expect(pagination).not.toBeVisible();
});

test("AC 13: On the '/browse' page, select the 'New' condition filter. Verify the results update and the pagination recalculates the total pages based on the new count of brand new vehicles.", async ({ page, baseURL }) => {
    await page.route('**/api/cars', async route => {
        const dummyCars = [
            ...Array.from({ length: 10 }, (_, idx) => ({
                _id: `new-car-${idx}`,
                name: `New Car ${idx}`,
                brand: 'Brand',
                condition: 'New',
                availability_status: 'Available',
                price: 20000
            })),
            ...Array.from({ length: 2 }, (_, idx) => ({
                _id: `used-car-${idx}`,
                name: `Used Car ${idx}`,
                brand: 'Brand',
                condition: 'Used',
                availability_status: 'Available',
                price: 15000
            }))
        ];
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ cars: dummyCars })
        });
    });

    await page.goto(`${baseURL}/browse?page=1`);
    
    // In "All" view (12 cars -> 2 pages), page 2 button is visible
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible();
    
    // Select "New" filter (10 cars -> 2 pages), page 2 button is visible
    await page.locator('#filter-new').click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible();
    
    // Select "Pre-Owned" filter (2 cars -> 1 page), page 2 button is suppressed
    await page.locator('#filter-pre-owned').click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: '2', exact: true })).not.toBeVisible();
});

test("AC 14: Navigate to page 2 of a filtered list on the Browse page. Clear the filters so that only one page of results remains. Verify that the application does not stay on page 2 but correctly resets to page 1.", async ({ page, baseURL }) => {
    await page.route('**/api/cars', async route => {
        const dummyCars = [
            ...Array.from({ length: 10 }, (_, idx) => ({
                _id: `new-car-${idx}`,
                name: `New Car ${idx}`,
                brand: 'Brand',
                condition: 'New',
                availability_status: 'Available',
                price: 20000
            })),
            ...Array.from({ length: 2 }, (_, idx) => ({
                _id: `used-car-${idx}`,
                name: `Used Car ${idx}`,
                brand: 'Brand',
                condition: 'Used',
                availability_status: 'Available',
                price: 15000
            }))
        ];
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ cars: dummyCars })
        });
    });

    await page.goto(`${baseURL}/browse?page=1`);
    
    // Select "New" filter -> 10 items (Page 1 has 9, Page 2 has 1)
    await page.locator('#filter-new').click();
    await page.waitForTimeout(500);
    
    const page2Btn = page.getByRole('button', { name: '2', exact: true });
    await expect(page2Btn).toBeVisible();
    await page2Btn.click();
    await expect(page).toHaveURL(/page=2/);
    
    // Select "Pre-Owned" filter -> only 2 items (resets to page 1)
    await page.locator('#filter-pre-owned').click();
    await expect(page).toHaveURL(/page=1/);
});

test("AC 15: In the 'Bookings' tab of the Admin Dashboard, navigate to page 2 and click 'Edit Status' for a booking. After updating the status, verify that the UI reflects the change and the user remains on page 2 of the bookings list.", async ({ page, baseURL }) => {
    // Mock 11 bookings so page 2 has exactly 1 booking (booking-10) with initial status 'Accepted'
    const dummyBookings = Array.from({ length: 11 }, (_, idx) => ({
        _id: `booking-${idx}`,
        user_name: `User ${idx}`,
        user_email: `user${idx}@example.com`,
        car_name: `Car ${idx}`,
        status: idx === 10 ? 'Accepted' : 'Pending',
        booking_date: new Date().toISOString()
    }));
    
    await page.route('**/api/bookings/admin/all', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(dummyBookings)
        });
    });
    
    // Intercept status update and mock updated response
    await page.route('**/api/bookings/admin/booking-10/status', async route => {
        dummyBookings[10].status = 'Rejected';
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true })
        });
    });

    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/dashboard?bPage=2`);
    await page.locator('#admin-bookings-tab').click();
    await expect(page).toHaveURL(/bPage=2/);
    
    // Click "Edit Status" on page 2 (booking-10) which is rendered since status is 'Accepted'
    await page.locator('#booking-row-booking-10-edit-status').click();
    
    // Select option "Rejected" from the dropdown
    await page.locator('#booking-row-booking-10 select').selectOption('Rejected');
    
    // Verify toast or success feedback
    await expect(page.getByText(/booking rejected!/i)).toBeVisible();
    
    // Explicitly verify that the booking status displayed in the UI actually changes from Accepted to Rejected
    await expect(page.locator('#booking-row-booking-10')).toContainText('Rejected');
    
    // Verify we remain on page 2
    await expect(page).toHaveURL(/bPage=2/);
});
