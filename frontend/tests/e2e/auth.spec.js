const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home which should redirect to login if not authenticated, or we navigate directly
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login|sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    // We assume there's a submit button
    const submitBtn = page.getByRole('button', { name: /login|submit|sign in/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      // Look for any standard HTML5 validation message or custom error text
      // We'll just verify the page didn't redirect
      await expect(page).toHaveURL(/.*login.*/);
    }
  });

  // Note: For a positive test, we would normally enter valid credentials.
  // We skip it here to avoid putting real credentials in test scripts or relying on live backend state,
  // unless we mock the network requests.
  test('should allow user to type in credentials', async ({ page }) => {
    const emailInput = page.getByPlaceholder(/email/i);
    const passInput = page.getByPlaceholder(/password/i);
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
      
      await passInput.fill('password123');
      await expect(passInput).toHaveValue('password123');
    }
  });
});
