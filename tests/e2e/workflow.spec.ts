import { expect, test } from '@playwright/test';

const invoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-104,Northstar Studio,2026-08-01,850.00,USD\nINV-105,Atlas Works,2026-08-03,425.50,USD';
const payments = 'date,amount,description,currency\n2026-08-08,850.00,Payment INV-104 Northstar,USD\n2026-08-11,425.50,Transfer INV-105 Atlas,USD';

test('imports both files, confirms a match, and exports a report', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Bring two CSVs');

  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(invoices) });
  await expect(page.getByRole('heading', { name: 'invoices.csv' })).toBeVisible();
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('2 rows loaded locally').first()).toBeVisible();

  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'payments.csv', mimeType: 'text/csv', buffer: Buffer.from(payments) });
  await page.getByRole('button', { name: 'Import payments' }).click();
  await expect(page.getByText('Strong suggestion').first()).toBeVisible();

  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  await expect(page.getByRole('heading', { name: 'Confirmed matches' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  expect((await download).suggestedFilename()).toMatch(/^matchbox-report-.*\.csv$/);
});

test('requires an audit note for a manual match and survives an offline reload', async ({ page, context }) => {
  await page.goto('/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(invoices) });
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'payments.csv', mimeType: 'text/csv', buffer: Buffer.from(payments) });
  await page.getByRole('button', { name: 'Import payments' }).click();

  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-/ });
  await dialog.getByLabel('Payment').selectOption({ index: 1 });
  await expect(dialog.getByRole('button', { name: 'Save manual match' })).toBeVisible();
  await dialog.getByLabel('Why this is the right match').fill('Verified against the client remittance note');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  await expect(page.getByText('Verified against the client remittance note')).toBeVisible();

  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('You are offline — matching still works')).toBeVisible();
  await expect(page.getByText('Verified against the client remittance note')).toBeVisible();
});

test('legal pages and mobile layout retain landmarks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/privacy/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy, kept simple.');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use.');
});
