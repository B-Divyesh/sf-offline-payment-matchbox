# Matchbox Ledger — review 5 handoff

## Outcome: FAIL

No product code was modified. The committed review is `.factory/review-5.md`.

## What was verified

- Fresh live browser contexts at 390 × 844 and 1440 × 900.
- One-click demo, reset/start-for-real boundary, request origins, localStorage,
  IndexedDB namespace, direct offline claim coverage, routes, metadata, links,
  checkout redirect, and prior-finding history.
- Clean `npm ci`; `npm test` (23), typecheck, lint, build, and the live 54-test
  Playwright suite passed.
- Every one of the 20 declared claim commands passed separately against
  `https://offline-payment-matchbox.sociobot.in`.

## Findings left

1. At phone width the header hides all navigation links without a replacement;
   desktop header links are 22 px high rather than 44 px.
2. The advertised three-invoice/three-payment demo contents are not declared
   and tested as a claim.
3. The demo displays exact matching-signal and 45-day-rule assertions without a
   declared test.

See `.factory/review-5.md` for exact quotes, evidence, and fixes.

## How to reproduce

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e
```
