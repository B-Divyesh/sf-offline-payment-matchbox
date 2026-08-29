import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const packageMetadata = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as { name: string; version: string };

const routes = [
  { path: '/', title: 'Matchbox Ledger — match payments to invoices', canonical: 'https://offline-payment-matchbox.sociobot.in/' },
  { path: '/demo/', title: 'Demo — Matchbox Ledger', canonical: 'https://offline-payment-matchbox.sociobot.in/demo/' },
  { path: '/privacy/', title: 'Privacy — Matchbox Ledger', canonical: 'https://offline-payment-matchbox.sociobot.in/privacy/' },
  { path: '/terms/', title: 'Terms — Matchbox Ledger', canonical: 'https://offline-payment-matchbox.sociobot.in/terms/' },
];

for (const route of routes) {
  test(`ships complete metadata and one page heading at ${route.path}`, async ({ page }) => {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-matchbox\.png$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByText(/Built by Param Factory/)).toBeVisible();
  });
}

test('publishes one package-derived version and exact build identity on every page', async ({ page, request }) => {
  const response = await request.get('/release.json');
  expect(response.ok()).toBe(true);
  const release = await response.json() as { product: string; version: string; commit: string };
  expect(release).toEqual({
    product: packageMetadata.name,
    version: packageMetadata.version,
    commit: expect.stringMatching(/^[0-9a-f]{40}$/),
  });
  const label = `v${release.version} · build ${release.commit.slice(0, 7)}`;

  for (const path of ['/', '/demo/', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('footer')).toContainText(label);
  }
});

test('provides a designed not-found page and sitemap', async ({ page, request }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Matchbox Ledger');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist');
  await expect(page.getByRole('link', { name: 'Return to Matchbox Ledger' })).toBeVisible();
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-matchbox\.png$/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('/demo/');
});

test('opens the direct demo on a visible realistic sample match at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Matchbox Ledger');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Demo — Matchbox Ledger');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://offline-payment-matchbox.sociobot.in/demo/');
  await expect(page.getByText('INV-105 · Atlas Works', { exact: true })).toBeVisible();
  const preview = page.getByLabel('Sample match preview');
  await expect(preview.getByText('Transfer INV-105 Atlas', { exact: true })).toBeVisible();
  await expect(preview.locator('b')).toHaveCount(2);
  const action = preview.getByRole('button', { name: 'Confirm match' });
  await expect(action).toBeVisible();
  expect((await action.boundingBox())!.y + (await action.boundingBox())!.height).toBeLessThanOrEqual(844);
});

test('states the job, audience, sample workspace, and first action above the mobile fold', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const firstScreen = [
    page.getByRole('heading', { level: 1, name: 'Match payments to invoices from two CSVs' }),
    page.getByText('For freelancers who reconcile invoices in spreadsheets or offline tools.'),
    page.getByRole('link', { name: 'Try it with sample data' }),
    page.getByText('Opens a separate sample workspace with three invoices.'),
    page.getByText('Works offline after the first visit'),
    page.getByText('Files stay on this device'),
    page.getByText('Free matcher · Plus costs $19 once'),
  ];
  for (const item of firstScreen) {
    await expect(item).toBeVisible();
    const box = await item.boundingBox();
    expect(box && box.y + box.height, await item.textContent() ?? 'first-screen item').toBeLessThanOrEqual(844);
  }
  await expect(page.getByRole('heading', { level: 3, name: 'Clear this local workspace' })).toBeVisible();
});

test('resolves cold workspace and demo hashes and moves focus to their destination', async ({ page }) => {
  await page.goto('/#workspace');
  await expect(page.getByRole('heading', { name: 'Import your invoice and payment CSVs' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  await page.goto('/demo/#match-title');
  await expect(page.getByRole('heading', { name: 'Resolve the ledger' })).toBeFocused();
  await page.getByRole('link', { name: 'Demo' }).click();
  await page.waitForURL((url) => url.searchParams.get('demo') === '1');
  await expect(page.getByRole('heading', { name: 'Review the sample payment matches' })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Resolve the ledger' })).toBeFocused();
  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Review the sample payment matches' })).toBeFocused();
});

test('uses the same header navigation on app and legal routes', async ({ page }) => {
  for (const path of ['/', '/?demo=1', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('.site-header nav')).toHaveText(/Demo[\s\S]*Workspace[\s\S]*Privacy/);
  }
});
