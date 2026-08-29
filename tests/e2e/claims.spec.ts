import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const replacementInvoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-201,Harbor Type,2026-08-20,300.00,USD';
const waitForImport = async (page: Page, kind: 'invoices' | 'payments') => {
  await expect(page.locator('#app')).not.toHaveAttribute('aria-busy', 'true');
  await expect(page.locator('#live-status')).toHaveText(new RegExp(`\\d+ ${kind} imported\\.`));
};
const storedDemoWorkspace = (page: Page) => page.evaluate(async () => new Promise<unknown>((resolve, reject) => {
  const open = indexedDB.open('demo:matchbox-ledger', 1);
  open.onerror = () => reject(open.error);
  open.onsuccess = () => {
    const request = open.result.transaction('workspace', 'readonly').objectStore('workspace').get('current');
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  };
}));

async function seedDemoSignalFixture(page: Page, fixture: { id: string; customer: string; invoiceDate: string; amount: number; currency: string; reference: string; paymentDate: string; paymentCurrency: string }): Promise<void> {
  await page.evaluate(async (data) => {
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('demo:matchbox-ledger', 1);
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const transaction = open.result.transaction('workspace', 'readwrite');
        transaction.objectStore('workspace').put({
          invoices: [{ id: data.id, customer: data.customer, date: data.invoiceDate, dueDate: '', amount: data.amount, currency: data.currency, sourceRow: 2 }],
          transactions: [{ id: 'signal-payment', date: data.paymentDate, amount: data.amount, reference: data.reference, currency: data.paymentCurrency, sourceRow: 2 }],
          matches: [],
          updatedAt: '2026-08-29T00:00:00.000Z',
        }, 'current');
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, fixture);
  await page.reload();
}

test('@claim:offline-reload keeps the sample ledger usable without a network', async ({ page, context }) => {
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved to your workspace')).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Review the sample payment matches' })).toBeVisible();
  await expect(page.getByText('2 invoices to review')).toBeVisible();
});

test('@claim:demo-sample opens three freelancer invoices and three downloaded payments', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByRole('heading', { name: 'Review the sample payment matches' })).toBeVisible();
  const trays = page.locator('.import-tray');
  await expect(trays).toHaveCount(2);
  await expect(trays.nth(0).getByText('3 rows loaded locally')).toBeVisible();
  await expect(trays.nth(1).getByText('3 rows loaded locally')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'INV-104 Northstar Studio' })).toBeVisible();
  await expect(page.locator('.match-row').filter({ hasText: 'INV-105' })).toContainText('Atlas Works');
  await expect(page.locator('.match-row').filter({ hasText: 'INV-106' })).toContainText('Cedar & Finch');
  await expect(page.getByLabel('Sample match preview')).toContainText('Transfer INV-105 Atlas');
  await expect(page.locator('.match-row').filter({ hasText: 'INV-106' })).toContainText('Cedar invoice 106');
});

test('@claim:matching-signals shows the exact matching evidence for each sample rule', async ({ page }) => {
  await page.goto('/demo/');
  const fixtures = [
    {
      id: 'INV-AMOUNT',
      customer: '', invoiceDate: '', amount: 100, currency: '', reference: 'Unlabelled payment', paymentDate: '2026-08-01', paymentCurrency: '',
      reason: 'same amount',
      label: 'Possible match',
    },
    {
      id: 'INV-CURRENCY',
      customer: '', invoiceDate: '', amount: 101, currency: 'USD', reference: 'Unlabelled payment', paymentDate: '2026-08-01', paymentCurrency: 'USD',
      reason: 'same amount · same USD currency',
      label: 'Possible match',
    },
    {
      id: 'INV-REFERENCE',
      customer: '', invoiceDate: '', amount: 102, currency: '', reference: 'Transfer INV-REFERENCE', paymentDate: '2026-08-01', paymentCurrency: '',
      reason: 'same amount · invoice number in reference',
      label: 'Strong suggestion',
    },
    {
      id: 'INV-CUSTOMER',
      customer: 'Atlas Works', invoiceDate: '', amount: 103, currency: '', reference: 'Atlas payment', paymentDate: '2026-08-01', paymentCurrency: '',
      reason: 'same amount · customer name in reference',
      label: 'Possible match',
    },
    {
      id: 'INV-DATE-45',
      customer: '', invoiceDate: '2026-01-01', amount: 104, currency: '', reference: 'Unlabelled payment', paymentDate: '2026-02-15', paymentCurrency: '',
      reason: 'same amount · date is within 45 days',
      label: 'Possible match',
    },
    {
      id: 'INV-DATE-46',
      customer: '', invoiceDate: '2026-01-01', amount: 105, currency: '', reference: 'Unlabelled payment', paymentDate: '2026-02-16', paymentCurrency: '',
      reason: 'same amount · date is within 120 days',
      label: 'Possible match',
    },
  ];

  for (const fixture of fixtures) {
    await seedDemoSignalFixture(page, fixture);
    const row = page.locator('.match-row').filter({ hasText: fixture.id });
    await expect(row).toBeVisible();
    await expect(row.getByText(fixture.label)).toBeVisible();
    await expect(row.locator('.reason')).toHaveText(fixture.reason);
  }
});

test('@claim:csv-report exports every sample invoice and unused payment', async ({ page }) => {
  await page.goto('/?demo=1');
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export current report' }).click();
  const path = await (await pending).path();
  expect(path).not.toBeNull();
  const csv = await readFile(path!, 'utf8');
  const rows = csv.trim().split('\n').map((line) => line.split(','));
  expect(rows).toHaveLength(6);
  expect(rows[0]).toEqual(['status', 'invoice_number', 'customer', 'invoice_date', 'invoice_amount', 'currency', 'payment_date', 'payment_amount', 'payment_reference', 'match_method', 'note', 'matched_at']);
  expect(rows.slice(1).map((row) => row.slice(0, 10))).toEqual([
    ['matched', 'INV-104', 'Northstar Studio', '2026-08-01', '850', 'USD', '2026-08-08', '850', 'Payment INV-104 Northstar', 'suggested'],
    ['open', 'INV-105', 'Atlas Works', '2026-08-03', '425.5', 'USD', '', '', '', ''],
    ['open', 'INV-106', 'Cedar & Finch', '2026-08-05', '1200', 'USD', '', '', '', ''],
    ['unused_payment', '', '', '', '', 'USD', '2026-08-11', '425.5', 'Transfer INV-105 Atlas', ''],
    ['unused_payment', '', '', '', '', 'USD', '2026-08-12', '1200', 'Cedar invoice 106', ''],
  ]);
  expect(rows[1]?.[11]).toBe('2026-08-12T09:00:00.000Z');
});

test('@claim:csv-match imports two CSVs and offers the matching payment rows', async ({ page }) => {
  const invoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-104,Northstar Studio,2026-08-01,850.00,USD\nINV-105,Atlas Works,2026-08-03,425.50,USD';
  const payments = 'date,amount,description,currency\n2026-08-08,850.00,Payment INV-104 Northstar,USD\n2026-08-11,425.50,Transfer INV-105 Atlas,USD';
  await page.goto('/?demo=1');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(invoices) });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await waitForImport(page, 'invoices');
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'payments.csv', mimeType: 'text/csv', buffer: Buffer.from(payments) });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import payments' }).click();
  await waitForImport(page, 'payments');
  await expect(page.getByText('INV-104', { exact: true })).toBeVisible();
  await expect(page.locator('.invoice-cell small').first()).toContainText('Northstar Studio');
  await expect(page.locator('.suggestion-cell small').first()).toContainText('Payment INV-104 Northstar');
  await expect(page.locator('.suggestion-list button[data-confirm]')).toHaveCount(2);
  await page.locator('.suggestion-list button[data-confirm]').first().click();
  await expect(page.getByRole('cell', { name: 'INV-104 Northstar Studio' })).toBeVisible();
});

test('@claim:private-workflow sends no ledger data to another origin', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/?demo=1', { waitUntil: 'networkidle' });
  const productOrigin = new URL(page.url()).origin;
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'sample-invoices.csv', mimeType: 'text/csv', buffer: Buffer.from('invoice_id,customer,invoice_date,amount,currency\nINV-104,Northstar Studio,2026-08-01,850.00,USD\nINV-105,Atlas Works,2026-08-03,425.50,USD') });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await waitForImport(page, 'invoices');
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'sample-payments.csv', mimeType: 'text/csv', buffer: Buffer.from('date,amount,description,currency\n2026-08-08,850.00,Payment INV-104 Northstar,USD\n2026-08-11,425.50,Transfer INV-105 Atlas,USD') });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import payments' }).click();
  await waitForImport(page, 'payments');
  await page.locator('.suggestion-list button[data-confirm]').first().click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  await pending;
  expect([...origins]).toEqual([productOrigin]);
});

test('@claim:demo-isolation never writes sample changes into the real workspace', async ({ page }) => {
  await page.goto('/');
  const before = await page.evaluate(async () => {
    localStorage.setItem('sb_license:offline-payment-matchbox', 'real-license-sentinel');
    localStorage.setItem('sb_license:offline-payment-matchbox:verdict', JSON.stringify({ valid: true, checkedAt: 1 }));
    localStorage.setItem('matchbox:mapping:invoice:record|total|client|issued', 'real-mapping-sentinel');
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('matchbox-ledger', 1);
      open.onerror = () => reject(open.error);
      open.onsuccess = () => { const tx = open.result.transaction('workspace', 'readwrite'); tx.objectStore('workspace').put({ invoices: [{ id: 'REAL-1' }], transactions: [], matches: [], updatedAt: '2000-01-01T00:00:00.000Z' }, 'current'); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); };
    });
    return JSON.stringify({ storage: Object.keys(localStorage).filter((key) => !key.startsWith('demo:')).sort().map((key) => [key, localStorage.getItem(key)]), db: await new Promise<unknown>((resolve, reject) => { const open = indexedDB.open('matchbox-ledger', 1); open.onerror = () => reject(open.error); open.onsuccess = () => { const request = open.result.transaction('workspace', 'readonly').objectStore('workspace').get('current'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }; }) });
  });
  await page.goto('/?demo=1');
  await page.evaluate(() => {
    localStorage.setItem('demo:sb_license:offline-payment-matchbox', 'demo-license');
    localStorage.setItem('demo:sb_license:offline-payment-matchbox:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  await expect(page.locator('#live-status')).toHaveText('Match confirmed for INV-105.');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'custom.csv', mimeType: 'text/csv', buffer: Buffer.from('record,total,client,issued\nDEMO-1,125,Demo Client,2026-08-24') });
  await expect(page.locator('#mapping-form')).toBeVisible();
  await page.locator('#mapping-form select[name="id"]').selectOption('record');
  await page.locator('#mapping-form select[name="date"]').selectOption('issued');
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await waitForImport(page, 'invoices');
  await page.getByRole('button', { name: 'Start for real' }).click();
  await page.waitForURL((url) => url.pathname === '/' && !url.searchParams.has('demo'));
  const after = await page.evaluate(async () => JSON.stringify({ storage: Object.keys(localStorage).filter((key) => !key.startsWith('demo:')).sort().map((key) => [key, localStorage.getItem(key)]), db: await new Promise<unknown>((resolve, reject) => { const open = indexedDB.open('matchbox-ledger', 1); open.onerror = () => reject(open.error); open.onsuccess = () => { const request = open.result.transaction('workspace', 'readonly').objectStore('workspace').get('current'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }; }) }));
  expect(after).toBe(before);
});

test('@claim:local-persistence keeps a confirmed sample match after reload', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Confirmed matches' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'INV-105 Atlas Works' })).toBeVisible();
});

test('@claim:source-opt-in excludes CSV text by default and includes it after consent', async ({ page }) => {
  await page.goto('/demo/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'replacement.csv', mimeType: 'text/csv', buffer: Buffer.from(replacementInvoices) });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await waitForImport(page, 'invoices');
  let pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  let path = await (await pending).path();
  let backup = JSON.parse(await readFile(path!, 'utf8')) as { sourceFiles?: unknown[] };
  expect(backup.sourceFiles ?? []).toEqual([]);

  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'replacement.csv', mimeType: 'text/csv', buffer: Buffer.from(replacementInvoices) });
  await page.getByRole('checkbox', { name: /Keep a copy/ }).check();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await waitForImport(page, 'invoices');
  pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  path = await (await pending).path();
  backup = JSON.parse(await readFile(path!, 'utf8')) as { sourceFiles?: Array<{ name: string; text: string }> };
  expect(backup.sourceFiles).toEqual([expect.objectContaining({ name: 'replacement.csv', text: replacementInvoices })]);
});

test('@claim:mapping-before-save keeps imported rows out of IndexedDB until each mapping is submitted', async ({ page }) => {
  const invoiceCsv = 'record,total,client,issued\nMAPPED-1,275.00,Juniper Press,2026-08-25';
  const paymentCsv = 'paid_on,value,memo,money\n2026-08-27,275.00,Transfer MAPPED-1 Juniper,USD';
  await page.goto('/demo/');
  await expect(page.getByText('3 rows loaded locally').first()).toBeVisible();

  const initial = await storedDemoWorkspace(page);
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'mapped-invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(invoiceCsv) });
  const invoiceMapping = page.locator('#mapping-form');
  await invoiceMapping.locator('select[name="id"]').selectOption('record');
  await invoiceMapping.locator('select[name="amount"]').selectOption('total');
  await invoiceMapping.locator('select[name="customer"]').selectOption('client');
  await invoiceMapping.locator('select[name="date"]').selectOption('issued');
  expect(await storedDemoWorkspace(page)).toEqual(initial);

  page.once('dialog', (dialog) => void dialog.accept());
  await invoiceMapping.getByRole('button', { name: 'Import invoices' }).click();
  await waitForImport(page, 'invoices');
  const afterInvoices = await storedDemoWorkspace(page) as { invoices: Array<{ id: string }>; transactions: Array<{ id: string }> };
  expect(afterInvoices.invoices.map((invoice) => invoice.id)).toEqual(['MAPPED-1']);

  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'mapped-payments.csv', mimeType: 'text/csv', buffer: Buffer.from(paymentCsv) });
  const paymentMapping = page.locator('#mapping-form');
  await paymentMapping.locator('select[name="date"]').selectOption('paid_on');
  await paymentMapping.locator('select[name="amount"]').selectOption('value');
  await paymentMapping.locator('select[name="reference"]').selectOption('memo');
  await paymentMapping.locator('select[name="currency"]').selectOption('money');
  expect(await storedDemoWorkspace(page)).toEqual(afterInvoices);

  page.once('dialog', (dialog) => void dialog.accept());
  await paymentMapping.getByRole('button', { name: 'Import payments' }).click();
  await waitForImport(page, 'payments');
  const afterPayments = await storedDemoWorkspace(page) as { invoices: Array<{ id: string }>; transactions: Array<{ reference: string }> };
  expect(afterPayments.invoices.map((invoice) => invoice.id)).toEqual(['MAPPED-1']);
  expect(afterPayments.transactions.map((payment) => payment.reference)).toEqual(['Transfer MAPPED-1 Juniper']);
});

test('@claim:deterministic-review flags competing equal matches instead of confirming them', async ({ page }) => {
  const invoices = 'invoice_id,customer,invoice_date,amount,currency\nINV-301,Alpha,2026-08-01,100.00,USD\nINV-302,Beta,2026-08-01,100.00,USD';
  const payment = 'date,amount,description,currency\n2026-08-08,100.00,Payment received,USD';
  await page.goto('/demo/');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'competing.csv', mimeType: 'text/csv', buffer: Buffer.from(invoices) });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await waitForImport(page, 'invoices');
  await page.locator('input[data-file-kind="transaction"]').setInputFiles({ name: 'shared.csv', mimeType: 'text/csv', buffer: Buffer.from(payment) });
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import payments' }).click();
  await waitForImport(page, 'payments');
  await expect(page.getByText('Needs a closer look')).toHaveCount(2);
  await expect(page.locator('.suggestion-list button[data-confirm]')).toHaveCount(0);
});

test('@claim:json-backup restores every stored field in a separate browser context', async ({ page, browser }) => {
  const source = 'invoice_id,customer,invoice_date,amount,currency\nINV-104,Northstar Studio,2026-08-01,850.00,USD\nINV-105,Atlas Works,2026-08-03,425.50,USD\nINV-106,Cedar & Finch,2026-08-05,1200.00,USD';
  await page.goto('/?demo=1');
  await page.locator('input[data-file-kind="invoice"]').setInputFiles({ name: 'month.csv', mimeType: 'text/csv', buffer: Buffer.from(source) });
  await page.getByRole('checkbox', { name: /Keep a copy/ }).check();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Import invoices' }).click();
  await waitForImport(page, 'invoices');
  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-/ });
  await dialog.getByLabel('Payment').selectOption({ index: 1 });
  await dialog.getByLabel('Why this is the right match').fill('Imported remittance evidence');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const path = await (await pending).path();
  const expected = JSON.parse(await readFile(path!, 'utf8')) as Record<string, unknown>;

  const secondContext = await browser.newContext();
  const secondPage = await secondContext.newPage();
  try {
    await secondPage.goto(`${new URL(page.url()).origin}/?demo=1`);
    await secondPage.locator('#backup-input').setInputFiles(path!);
    const restoredDownload = secondPage.waitForEvent('download');
    await secondPage.getByRole('button', { name: 'Export backup' }).click();
    const restoredPath = await (await restoredDownload).path();
    const restored = JSON.parse(await readFile(restoredPath!, 'utf8')) as Record<string, unknown>;
    expect(restored.invoices).toEqual(expected.invoices);
    expect(restored.transactions).toEqual(expected.transactions);
    expect(restored.matches).toEqual(expected.matches);
    expect(restored.sourceFiles).toEqual(expected.sourceFiles);
  } finally {
    await secondContext.close();
  }
});

test('@claim:plus-batch confirms all clear sample suggestions together', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('demo:sb_license:offline-payment-matchbox', 'demo-license');
    localStorage.setItem('demo:sb_license:offline-payment-matchbox:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  await page.goto('/demo/');
  await expect(page.getByRole('heading', { name: 'Matchbox Plus costs $19 once' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm all strong matches' }).click();
  await expect(page.getByText('3', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Every invoice has a match' })).toBeVisible();
});

test('@claim:plus-column-mappings restores every saved selection for repeat headings', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('demo:sb_license:offline-payment-matchbox', 'mapping-fixture-license');
    localStorage.setItem('demo:sb_license:offline-payment-matchbox:verdict', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  const customInvoices = 'record,total,client,issued\nCUSTOM-1,125.00,Paper Kite Studio,2026-08-24';
  await page.goto('/demo/');
  const invoiceInput = page.locator('input[data-file-kind="invoice"]');
  await invoiceInput.setInputFiles({ name: 'custom-invoices.csv', mimeType: 'text/csv', buffer: Buffer.from(customInvoices) });
  const mapping = page.locator('#mapping-form');
  await mapping.locator('select[name="id"]').selectOption('record');
  await mapping.locator('select[name="amount"]').selectOption('total');
  await mapping.locator('select[name="customer"]').selectOption('client');
  await mapping.locator('select[name="date"]').selectOption('issued');
  page.once('dialog', (dialog) => void dialog.accept());
  await mapping.getByRole('button', { name: 'Import invoices' }).click();
  await expect(page.getByText('1 row loaded locally').first()).toBeVisible();

  await invoiceInput.setInputFiles({ name: 'next-month.csv', mimeType: 'text/csv', buffer: Buffer.from(customInvoices.replace('CUSTOM-1', 'CUSTOM-2')) });
  await expect(mapping.locator('select[name="id"]')).toHaveValue('record');
  await expect(mapping.locator('select[name="amount"]')).toHaveValue('total');
  await expect(mapping.locator('select[name="customer"]')).toHaveValue('client');
  await expect(mapping.locator('select[name="date"]')).toHaveValue('issued');
});

test('@claim:manual-note blocks a manual match until its audit note is present', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-/ });
  await dialog.getByLabel('Payment').selectOption({ index: 1 });
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Why this is the right match').fill('Checked against the client remittance email');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  await expect(page.getByText('Checked against the client remittance email')).toBeVisible();
});

test('@claim:free-core keeps manual review, reports, backups, and offline use available without a license', async ({ page, context }) => {
  await page.goto('/?demo=1');
  await expect(page.getByRole('button', { name: 'Confirm all strong matches' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Choose another' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Match INV-/ });
  await dialog.getByLabel('Payment').selectOption({ index: 1 });
  await dialog.getByLabel('Why this is the right match').fill('Verified against the remittance note');
  await dialog.getByRole('button', { name: 'Save manual match' }).click();
  await expect(page.getByText('Verified against the remittance note')).toBeVisible();
  const report = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  expect((await report).suggestedFilename()).toMatch(/\.csv$/);
  const backup = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  expect((await backup).suggestedFilename()).toMatch(/\.json$/);
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Verified against the remittance note')).toBeVisible();
});

test('@claim:workspace-clearing removes the current record from demo IndexedDB', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('3 rows loaded locally').first()).toBeVisible();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Clear local workspace' }).click();
  await expect(page.getByText(/rows loaded locally/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Confirmed matches' })).toHaveCount(0);

  const stored = await page.evaluate(async () => new Promise<unknown>((resolve, reject) => {
    const open = indexedDB.open('demo:matchbox-ledger', 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const request = open.result.transaction('workspace', 'readonly').objectStore('workspace').get('current');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    };
  }));
  expect(stored).toBeUndefined();
});

test('@claim:tracking-free uses no cookies, analytics requests, remote fonts, or tracking scripts', async ({ page, context }) => {
  const requests: Array<{ method: string; origin: string; resourceType: string }> = [];
  page.on('request', (request) => requests.push({
    method: request.method(),
    origin: new URL(request.url()).origin,
    resourceType: request.resourceType(),
  }));
  await page.goto('/demo/', { waitUntil: 'networkidle' });
  const productOrigin = new URL(page.url()).origin;
  await page.getByRole('button', { name: 'Confirm match' }).first().click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export report CSV' }).click();
  await pending;

  const resources = await page.evaluate(() => ({
    fonts: performance.getEntriesByType('resource')
      .filter((entry) => (entry as PerformanceResourceTiming).initiatorType === 'font')
      .map((entry) => entry.name),
    scripts: [...document.scripts].map((script) => script.src),
  }));
  expect(await context.cookies()).toEqual([]);
  expect(new Set(requests.map((request) => request.origin))).toEqual(new Set([productOrigin]));
  expect(requests.filter((request) => ['fetch', 'xhr', 'eventsource'].includes(request.resourceType))).toEqual([]);
  expect(requests.every((request) => request.method === 'GET')).toBe(true);
  expect(resources.fonts).toEqual([]);
  expect(resources.scripts).toHaveLength(1);
  expect(new URL(resources.scripts[0]!).origin).toBe(productOrigin);
  expect(new URL(resources.scripts[0]!).pathname).toMatch(/^\/assets\/main-[\w-]+\.js$/);
});

test('@claim:license-restore activates Plus from a valid license in a clean browser', async ({ page }) => {
  let verifiedToken = '';
  await page.route('https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify?**', async (route) => {
    verifiedToken = new URL(route.request().url()).searchParams.get('license') ?? '';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'View Plus features' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Matchbox Plus' });
  await dialog.getByLabel('Have a license? Paste it here').fill('valid-license-from-another-device');
  await dialog.getByRole('button', { name: 'Restore purchase' }).click();

  await expect(dialog.getByText('Plus is active', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Matchbox Plus is active on this device.')).toBeVisible();
  expect(verifiedToken).toBe('valid-license-from-another-device');
  expect(await page.evaluate(() => localStorage.getItem('demo:sb_license:offline-payment-matchbox'))).toBe('valid-license-from-another-device');
  await dialog.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Confirm all strong matches' }).click();
  await expect(page.getByRole('heading', { name: 'Every invoice has a match' })).toBeVisible();
});

test('@claim:billing-routing uses only the documented Sociobot checkout and verification endpoints', async ({ page }) => {
  let verificationUrl = '';
  await page.route('https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify?**', async (route) => {
    verificationUrl = route.request().url();
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) });
  });
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'View Plus features' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Matchbox Plus' });
  await expect(dialog.getByRole('link', { name: 'Buy Matchbox Plus' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/offline-payment-matchbox/checkout');
  await dialog.getByLabel('Have a license? Paste it here').fill('routing-fixture');
  await dialog.getByRole('button', { name: 'Restore purchase' }).click();
  expect(verificationUrl).toBe('https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify?license=routing-fixture');
});

test('@claim:license-request-privacy sends no reconciliation fields with a license check', async ({ page }) => {
  let requestDetails: { url: string; headers: Record<string, string>; body: string | null } | null = null;
  await page.route('https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify?**', async (route) => {
    requestDetails = { url: route.request().url(), headers: route.request().headers(), body: route.request().postData() };
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/?demo=1');
  await page.getByRole('button', { name: 'View Plus features' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Matchbox Plus' });
  await dialog.getByLabel('Have a license? Paste it here').fill('privacy-fixture-token');
  await dialog.getByRole('button', { name: 'Restore purchase' }).click();
  expect(requestDetails).not.toBeNull();
  const serialized = JSON.stringify(requestDetails).toLowerCase();
  expect(serialized).toContain('privacy-fixture-token');
  for (const privateValue of ['inv-104', 'northstar', '850', 'transfer', 'matched_at', 'matchbox-report']) expect(serialized).not.toContain(privateValue);
  expect(requestDetails?.body).toBeNull();
});
