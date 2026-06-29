const { test, expect } = require('@playwright/test');

test.describe('Booking Flow (Mocked)', () => {
  test('should browse properties and see details', async ({ page }) => {
    // Mock the properties API
    await page.route('**/api/properties', async route => {
      const json = [{
        _id: 'mock_prop_1',
        name: 'Mock Beautiful Villa',
        location: { city: 'Test City', address: '123 Beach Rd' },
        basePrice: 200,
        platformPrice: 220,
        images: ['https://via.placeholder.com/400'],
        description: 'A beautiful mocked villa for E2E testing.'
      }];
      await route.fulfill({ json });
    });

    await page.goto('/');

    // Verify the mock property is displayed
    await expect(page.getByText('Mock Beautiful Villa')).toBeVisible();
    
    // Check price
    await expect(page.getByText('220')).toBeVisible();
  });
});
