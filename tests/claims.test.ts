import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Claim = { id: string; claim: string; where: string; test: string; sandbox: string };
const claims = JSON.parse(readFileSync(new URL('../.factory/claims.json', import.meta.url), 'utf8')) as Claim[];
const browserSources = [
  readFileSync(new URL('./e2e/claims.spec.ts', import.meta.url), 'utf8'),
  readFileSync(new URL('./e2e/workflow.spec.ts', import.meta.url), 'utf8'),
].join('\n');

describe('public claims contract', () => {
  it('lists unique, complete claims with one exact browser-test tag each', () => {
    expect(claims.length).toBeGreaterThan(0);
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.claim.trim()).not.toBe('');
      expect(claim.where.trim()).not.toBe('');
      expect(claim.sandbox).toMatch(/\/demo\/|\?demo=1/);
      expect(claim.test).toBe(`npm run test:e2e -- --grep @claim:${claim.id}`);
      expect(browserSources.split(`@claim:${claim.id}`).length - 1, claim.id).toBe(1);
    }
  });
});
