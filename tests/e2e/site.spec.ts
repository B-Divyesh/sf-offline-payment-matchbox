import { expect, test } from '@playwright/test';

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

test('provides a designed not-found page and sitemap', async ({ page, request }) => {
  await page.goto('/404.html');
  await expect(page).toHaveTitle('Page not found — Matchbox Ledger');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist');
  await expect(page.getByRole('link', { name: 'Return to Matchbox Ledger' })).toBeVisible();
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('/demo/');
});
