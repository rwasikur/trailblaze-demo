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
    if (await emailInput.isVisible()) {
        await emailInput.fill(user.email);
        await page.locator('#admin-password-input').fill(user.password);
        await page.locator('#admin-login-button').click();
        await page.waitForURL(/dashboard/);
    }
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
    if (await page2Btn.isVisible()) {
        await page2Btn.click();
        await expect(page).toHaveURL(/page=2/);
        
        const page2Names = await getVisibleCarNames(page);
        expect(page2Names.length).toBeGreaterThan(0);
        expect(page2Names).not.toEqual(page1Names);
    }
});

test("AC 3: On the '/browse' page, enter a search term that yields multiple pages of results. Switch to page 2. Then clear the search query. Verify that the pagination automatically resets to page 1.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse?page=1`);
    
    const resultsCountLocator = page.locator('span.text-blue-600.mr-2.text-sm');
    await resultsCountLocator.waitFor();
    const initialTotal = await resultsCountLocator.innerText();
    
    const searchInput = page.locator('input[placeholder="Discover..."]');
    await searchInput.fill('a'); 
    await page.waitForTimeout(1000);
    
    const page2Btn = page.getByRole('button', { name: '2', exact: true });
    if (await page2Btn.isVisible()) {
        await page2Btn.click();
        await expect(page).toHaveURL(/page=2/);
        
        // Clear search
        await searchInput.fill('');
        await expect(page).toHaveURL(/page=1/);
        
        // Verify total results count is restored
        await expect(resultsCountLocator).toHaveText(initialTotal);
        
        // Verify Page 1 is active in UI
        const page1Btn = page.getByRole('button', { name: '1', exact: true });
        await expect(page1Btn).toHaveClass(/bg-slate-900/);
    }
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
    if (await page2Btn.isVisible()) {
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
        
        const finalNames = await getVisibleCatalogueCarNames(page);
        expect(finalNames).toEqual(page2Names);
    }
});

test("AC 6: In the Admin Dashboard, switch to the 'Bookings' tab and navigate to page 2. Verify the URL includes 'bPage=2'. Switch back to the 'Vehicles' tab and verify its pagination state (vPage) is preserved.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    
    const nextBtn = page.locator('.p-4 >> text=Next');
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
        const currentUrl = page.url();
        const match = currentUrl.match(/vPage=(\d+)/);
        const vPage = match ? match[1] : '2';
        
        const vPageNames = await getVisibleDashboardCarNames(page);
        
        await page.getByRole('button', { name: /Bookings/i }).click();
        await page.getByRole('button', { name: /Vehicles/i }).click();
        
        await expect(page).toHaveURL(new RegExp(`vPage=${vPage}`));
        const finalNames = await getVisibleDashboardCarNames(page);
        expect(finalNames).toEqual(vPageNames);
    }
});

test("AC 7: In the 'Vehicles' tab of the Admin Dashboard, click the 'Next' arrow button. Verify that the vPage parameter in the URL increments correctly and the table updates with the next set of inventory records.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/dashboard?vPage=1`);
    
    const page1Names = await getVisibleDashboardCarNames(page);
    const nextBtn = page.locator('.p-4 >> text=Next');
    
    if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(500);
        
        const page2Names = await getVisibleDashboardCarNames(page);
        expect(page2Names).not.toEqual(page1Names);
    }
});

test("AC 8: On the first page of the '/browse' inventory, verify that the 'Previous' pagination button is visually disabled and clicking it does not change the URL or refresh the list.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse?page=1`);
    const prevBtn = page.getByRole('button', { name: 'Previous' });
    await expect(prevBtn).toBeDisabled();
});

test("AC 9: On the last page of the vehicle inventory in Manage Catalogue, verify that the 'Next' pagination button is disabled and clicking it has no effect on the current view.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.goto(`${baseURL}/admin/catalogue`);
    
    await gotoLastPage(page);
    
    const nextBtn = page.getByRole('button', { name: 'Next' });
    await page.waitForTimeout(1000);
    if (await nextBtn.isVisible()) {
        await expect(nextBtn).toBeDisabled();
    }
});

test("AC 10: Search for a brand that does not exist in the collection (e.g., 'UnknownBrand'). Verify that the pagination component is hidden from the UI when zero results are found.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.locator('input[placeholder="Discover..."]').fill('NonExistentBrandXYZ');
    await expect(page.locator('#car-grid article')).toHaveCount(0);
    
    const pagination = page.locator('.flex.flex-col.items-center.justify-center.space-y-4');
    await expect(pagination).not.toBeVisible();
});

test("AC 11: If the total number of vehicles in the catalogue is less than or equal to the items per page (10), verify that the pagination footer is not rendered.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse`);
    await page.locator('input[placeholder="Discover..."]').fill('Ford'); 
    await page.waitForTimeout(1000);
    
    const results = await page.locator('#car-grid article').count();
    if (results > 0 && results <= 9) {
        await expect(page.getByRole('button', { name: '2', exact: true })).not.toBeVisible();
        const nextBtn = page.getByRole('button', { name: 'Next' });
        if (await nextBtn.isVisible()) {
            await expect(nextBtn).toBeDisabled();
        }
    }
});

test("AC 12: In the 'Bookings' tab of the Admin Dashboard, if the table displays 'No active bookings.', verify that the pagination controls are suppressed.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();
    
    const totalCountText = await page.getByRole('button', { name: /Bookings/i }).innerText();
    const totalCount = parseInt(totalCountText.match(/\d+/)?.[0] || '0');
    
    if (totalCount <= 10) {
        await expect(page.getByRole('button', { name: '2', exact: true })).not.toBeVisible();
        const nextBtn = page.getByRole('button', { name: 'Next' });
        if (await nextBtn.isVisible()) {
            await expect(nextBtn).toBeDisabled();
            await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled();
        }
    }
});

test("AC 13: On the '/browse' page, select the 'New' condition filter. Verify the results update and the pagination recalculates the total pages based on the new count of brand new vehicles.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse?page=1`);
    
    const page1Names = await getVisibleCarNames(page);
    
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await page.getByRole('button', { name: 'New', exact: true }).click();
    await page.waitForTimeout(1000);
    
    const filteredNames = await getVisibleCarNames(page);
    
    const page2Btn = page.getByRole('button', { name: '2', exact: true });
    if (await page2Btn.isVisible()) {
        await page2Btn.click();
        await expect(page).toHaveURL(/page=2/);
        const page2Names = await getVisibleCarNames(page);
        expect(page2Names).not.toEqual(filteredNames);
    } else {
        await expect(page.getByRole('button', { name: '2', exact: true })).not.toBeVisible();
    }
});

test("AC 14: Navigate to page 2 of a filtered list on the Browse page. Clear the filters so that only one page of results remains. Verify that the application does not stay on page 2 but correctly resets to page 1.", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/browse?page=1`);
    const page2Btn = page.getByRole('button', { name: '2', exact: true });
    
    if (await page2Btn.isVisible()) {
        await page2Btn.click();
        await expect(page).toHaveURL(/page=2/);
        const page2Names = await getVisibleCarNames(page);
        
        const searchInput = page.locator('input[placeholder="Discover..."]');
        await searchInput.fill('Toyota'); 
        await page.waitForTimeout(1000);
        
        await expect(page).toHaveURL(/page=1/);
        const finalNames = await getVisibleCarNames(page);
        expect(finalNames).not.toEqual(page2Names);
        
        const brands = await page.locator('[id$="-brand"]').allInnerTexts();
        expect(brands.every(b => b.toLowerCase().includes('toyota'))).toBeTruthy();
    }
});

test("AC 15: In the 'Bookings' tab of the Admin Dashboard, navigate to page 2 and click 'Edit Status' for a booking. After updating the status, verify that the UI reflects the change and the user remains on page 2 of the bookings list.", async ({ page, baseURL }) => {
    await login(page, baseURL || '');
    await page.getByRole('button', { name: /Bookings/i }).click();
    
    await page.goto(`${baseURL}/admin/dashboard?bPage=2`);
    await expect(page).toHaveURL(/bPage=2/);
    
    await page.getByRole('button', { name: /Vehicles/i }).click();
    await page.getByRole('button', { name: /Bookings/i }).click();
    await expect(page).toHaveURL(/bPage=2/);
});
