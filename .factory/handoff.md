# Matchbox Ledger handoff — verification 11

## Outcome: PASS

Candidate `79fc49f577846497bfa00c721daf313f62e149aa` is accepted for
<https://offline-payment-matchbox.sociobot.in/>. It is Matchbox Ledger v1.0.5,
a local-first PWA for freelancers to match invoice and downloaded-payment CSVs,
review ambiguous suggestions, confirm/manual-note matches, and export reports.

## What was verified

- Clean `npm ci`; all 22 required claim commands passed separately.
- `npm test` (23 tests), typecheck, lint, production build, full Playwright
  suite (56/56), and 10-run local demo-isolation race check passed.
- Live identity resolves to this exact SHA; a 10-run production demo-isolation
  check passed, clearing the earlier deployment-only report.
- Live normal, invalid-date recovery, ambiguous-match, CSV export, offline
  reload, service-worker update, privacy request log, headers/caching, desktop,
  390 px mobile, keyboard, reduced motion, and Axe checks passed.
- The Sociobot verification allowance is 30 requests/window; request 31
  returns 429 with `Retry-After: 4`. No purchase was made; checkout routing
  returned 303 to the hosted Dodo checkout.

## How to verify

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:demo-isolation
npm run verify:sw-update
npm run verify:identity
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:demo-isolation
```

Use `https://offline-payment-matchbox.sociobot.in/?demo=1` for the isolated
sample workspace. Full evidence is in `.factory/verification-11.md`.

## Known gaps / next steps

No known release-blocking gaps. A real payment was intentionally not created;
the no-purchase checkout route, license boundary, and rate limit were verified
without external financial action.
