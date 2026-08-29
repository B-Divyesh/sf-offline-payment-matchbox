import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseUrl = (process.env.LIVE_BASE_URL ?? process.argv[2] ?? 'https://offline-payment-matchbox.sociobot.in').replace(/\/$/, '');
const packageMetadata = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const expectedCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim().toLowerCase();
const response = await fetch(`${baseUrl}/release.json`, { cache: 'no-store' });

if (!response.ok) throw new Error(`GET ${baseUrl}/release.json returned ${response.status}.`);

const release = await response.json();
const expected = {
  product: packageMetadata.name,
  version: packageMetadata.version,
  commit: expectedCommit,
};

for (const [field, value] of Object.entries(expected)) {
  if (release[field] !== value) throw new Error(`Live ${field} is ${JSON.stringify(release[field])}; expected ${JSON.stringify(value)}.`);
}

console.log(`PASS ${baseUrl} identifies ${release.product} v${release.version} at ${release.commit}`);
