import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const origin = 'https://offline-payment-matchbox.sociobot.in';
const manifest = JSON.parse(await readFile('dist/asset-manifest.json', 'utf8'));
const app = Object.values(manifest).find((entry) => entry.name === 'main');
if (!app) throw new Error('The app entry is missing from the asset manifest.');
const legalCss = Object.values(manifest).find((entry) => entry.file?.includes('/legal-') && entry.file.endsWith('.css'))?.file;
if (!legalCss) throw new Error('The legal CSS entry is missing from the asset manifest.');

const pairs = [
  ['/', 'dist/index.html'],
  ['/demo/', 'dist/demo/index.html'],
  ['/privacy/', 'dist/privacy/index.html'],
  ['/terms/', 'dist/terms/index.html'],
  ['/404.html', 'dist/404.html'],
  ['/sitemap.xml', 'dist/sitemap.xml'],
  ['/manifest.webmanifest', 'dist/manifest.webmanifest'],
  ['/asset-manifest.json', 'dist/asset-manifest.json'],
  ['/sw.js', 'dist/sw.js'],
  ['/social-matchbox.png', 'dist/social-matchbox.png'],
  [`/${legalCss}`, `dist/${legalCss}`],
  ...[app.file, ...(app.css ?? []), ...(app.assets ?? [])].map((path) => [`/${path}`, `dist/${path}`]),
];
const hash = (value) => createHash('sha256').update(value).digest('hex');
const identity = [];

for (const [path, file] of pairs) {
  const local = await readFile(file);
  const response = await fetch(`${origin}${path}?identity=repair-3`, { cache: 'no-store' });
  const live = Buffer.from(await response.arrayBuffer());
  identity.push({ path, status: response.status, sha256: hash(live), match: response.ok && hash(live) === hash(local) });
}

const home = await fetch(`${origin}/?policy=repair-3`, { cache: 'no-store' });
const asset = await fetch(`${origin}/${app.file}?policy=repair-3`, { cache: 'no-store' });
const missing = await fetch(`${origin}/not-a-real-page-repair-3`, { cache: 'no-store' });
const missingBody = Buffer.from(await missing.arrayBuffer());
const checkout = await fetch('https://api.sociobot.in/api/v1/products/offline-payment-matchbox/checkout', { method: 'HEAD', redirect: 'manual' });
const invalidLicense = await fetch('https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify?license=repair-3-invalid-fixture');
const invalidBody = await invalidLicense.json();
const policy = {
  csp: home.headers.get('content-security-policy'),
  permissions: home.headers.get('permissions-policy'),
  referrer: home.headers.get('referrer-policy'),
  nosniff: home.headers.get('x-content-type-options'),
  frameOptions: home.headers.get('x-frame-options'),
  htmlCache: home.headers.get('cache-control'),
  assetCache: asset.headers.get('cache-control'),
  missing: { status: missing.status, designedBody: hash(missingBody) === hash(await readFile('dist/404.html')) },
  checkout: { status: checkout.status, location: checkout.headers.get('location') },
  invalidLicense: { status: invalidLicense.status, body: invalidBody },
};

const failed = identity.filter((entry) => !entry.match);
const policyPass = policy.csp?.includes("frame-ancestors 'none'")
  && policy.permissions?.includes('camera=()')
  && policy.referrer === 'strict-origin-when-cross-origin'
  && policy.nosniff === 'nosniff'
  && policy.frameOptions === 'DENY'
  && policy.htmlCache === 'no-cache'
  && policy.assetCache?.includes('immutable')
  && policy.missing.status === 404
  && policy.missing.designedBody
  && checkout.status >= 300 && checkout.status < 400
  && invalidLicense.status === 200
  && invalidBody.valid === false;

console.log(JSON.stringify({ identity, policy, policyPass }, null, 2));
if (failed.length || !policyPass) process.exitCode = 1;
