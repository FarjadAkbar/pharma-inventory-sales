/**
 * E2E: Login and perform the pharma flow step-wise. Verifies logged-in state,
 * list pages load (data or empty), and create + show data where applicable.
 *
 * Prerequisites: Backend/API and DB running; seeder run (admin@pharma.local / Admin@123).
 */

import { test, expect } from '@playwright/test';

const LOGIN = {
  email: 'admin@pharma.local',
  password: 'Admin@123',
};

/** Wait for login form and sign in; assert redirect to dashboard. */
async function login(page: import('@playwright/test').Page) {
  await page.goto('/auth/login');
  const emailInput = page.getByPlaceholder(/Enter your email|email address/i);
  await emailInput.waitFor({ state: 'visible', timeout: 15_000 });
  await emailInput.fill(LOGIN.email);
  await page.getByPlaceholder(/Enter your password/i).fill(LOGIN.password);
  await page.getByRole('button', { name: /Sign In/i }).click();

  try {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
  } catch {
    if (page.url().includes('/auth/login')) {
      const alertText = await page.getByRole('alert').textContent().catch(() => '');
      throw new Error(
        `Login did not redirect to dashboard (still on login page). ` +
          (alertText ? `Page message: ${alertText.trim()}` : 'Check that identity-service/API is running and seeder has been run (admin@pharma.local / Admin@123).')
      );
    }
    throw new Error(`Login did not redirect to dashboard. Current URL: ${page.url()}`);
  }
}

/** Assert list page is ready: has Add/New/Create button or a table. */
async function expectListPageReady(page: import('@playwright/test').Page, addButtonName?: RegExp | string) {
  const add = addButtonName ?? /Add|New|Create/;
  const addButton = page.getByRole('button', { name: add });
  const table = page.getByRole('table');
  await expect(addButton.or(table).first()).toBeVisible({ timeout: 15_000 });
}

test.describe('Pharma flow – login and step-wise tasks', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Step 1: Identity – Permissions: create and show data', async ({ page }) => {
    await page.goto('/dashboard/permissions');
    await expectListPageReady(page, /Add Permission/);

    const permissionName = `e2e.permission.${Date.now()}`;
    await page.getByRole('button', { name: /Add Permission/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
    await page.getByLabel(/Permission Name/i).fill(permissionName);
    await page.getByRole('dialog').getByRole('button', { name: /Create Permission/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText(permissionName)).toBeVisible({ timeout: 10_000 });
  });

  test('Step 1: Identity – Roles list shows data or add action', async ({ page }) => {
    await page.goto('/dashboard/roles');
    await expectListPageReady(page, /Add Role|Add/);
  });

  test('Step 1: Identity – Users list shows data or add action', async ({ page }) => {
    await page.goto('/dashboard/users');
    await expectListPageReady(page, /Add User|Add/);
  });

  test('Step 2: Master data – Sites: create and show data', async ({ page }) => {
    await page.goto('/dashboard/sites');
    await expectListPageReady(page, /Add Site/);

    const siteName = `E2E Site ${Date.now()}`;
    await page.getByRole('button', { name: /Add Site/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 });
    await page.getByRole('dialog').getByLabel(/Site Name/i).fill(siteName);
    await page.getByRole('dialog').getByRole('button', { name: /Save/i }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText(siteName)).toBeVisible({ timeout: 10_000 });
  });

  test('Step 2: Master data – Units, Categories: list ready', async ({ page }) => {
    await page.goto('/dashboard/units');
    await expectListPageReady(page);

    await page.goto('/dashboard/categories');
    await expectListPageReady(page);
  });

  test('Step 3: Master data – Suppliers, Drugs: list ready', async ({ page }) => {
    await page.goto('/dashboard/suppliers');
    await expectListPageReady(page);

    await page.goto('/dashboard/drugs');
    await expectListPageReady(page);
  });

  test('Step 4: Raw materials – list ready', async ({ page }) => {
    await page.goto('/dashboard/raw-materials');
    await expectListPageReady(page);
  });

  test('Step 5: Warehouse – Warehouses and Storage locations: list ready', async ({ page }) => {
    await page.goto('/dashboard/warehouse/warehouses');
    await expectListPageReady(page);

    await page.goto('/dashboard/warehouse/locations');
    await expectListPageReady(page);
  });

  test('Step 6: Procurement – Purchase orders and Goods receipts: list or form ready', async ({ page }) => {
    await page.goto('/dashboard/procurement/purchase-orders');
    await expectListPageReady(page);

    await page.goto('/dashboard/procurement/purchase-orders/new');
    await expect(
      page.getByRole('button', { name: /Save|Submit|Create/i }).or(page.getByRole('link', { name: /Back|Cancel/i })).first()
    ).toBeVisible({ timeout: 10_000 });

    await page.goto('/dashboard/procurement/goods-receipts');
    await expectListPageReady(page);
  });

  test('Step 7: Quality – QC tests, Samples, QC results: list or form ready', async ({ page }) => {
    await page.goto('/dashboard/quality/qc-tests');
    await expectListPageReady(page);

    await page.goto('/dashboard/quality/qc-tests/new');
    await expect(
      page.getByRole('button', { name: /Create Test Method|Save|Cancel/i }).first()
    ).toBeVisible({ timeout: 10_000 });

    await page.goto('/dashboard/quality/samples');
    await expectListPageReady(page);

    await page.goto('/dashboard/quality/qc-results');
    await expectListPageReady(page);
  });

  test('Step 8: Quality – QA releases, Deviations: list ready', async ({ page }) => {
    await page.goto('/dashboard/quality/qa-releases');
    await expectListPageReady(page);

    await page.goto('/dashboard/quality/deviations');
    await expectListPageReady(page);
  });

  test('Step 9: Manufacturing – BOMs, Work orders, Batches: list or form ready', async ({ page }) => {
    await page.goto('/dashboard/manufacturing/boms');
    await expectListPageReady(page);

    await page.goto('/dashboard/manufacturing/boms/new');
    await expect(
      page.getByRole('button', { name: /Create BOM|Save|Cancel/i }).first()
    ).toBeVisible({ timeout: 10_000 });

    await page.goto('/dashboard/manufacturing/work-orders');
    await expectListPageReady(page);

    await page.goto('/dashboard/manufacturing/batches');
    await expectListPageReady(page);
  });

  test('Full flow – login then visit all list pages in order', async ({ page }) => {
    const listUrls = [
      '/dashboard/permissions',
      '/dashboard/roles',
      '/dashboard/users',
      '/dashboard/units',
      '/dashboard/categories',
      '/dashboard/sites',
      '/dashboard/suppliers',
      '/dashboard/drugs',
      '/dashboard/raw-materials',
      '/dashboard/warehouse/warehouses',
      '/dashboard/warehouse/locations',
      '/dashboard/procurement/purchase-orders',
      '/dashboard/procurement/goods-receipts',
      '/dashboard/quality/qc-tests',
      '/dashboard/quality/samples',
      '/dashboard/quality/qc-results',
      '/dashboard/quality/qa-releases',
      '/dashboard/quality/deviations',
      '/dashboard/manufacturing/boms',
      '/dashboard/manufacturing/work-orders',
      '/dashboard/manufacturing/batches',
    ];

    for (const url of listUrls) {
      await page.goto(url);
      await expect(
        page.getByRole('button', { name: /Add|New|Create/i }).or(page.getByRole('table')).first()
      ).toBeVisible({ timeout: 15_000 });
    }
  });
});
