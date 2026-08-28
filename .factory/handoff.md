# Matchbox Ledger — independent verification 4 handoff

## Outcome: FAIL

Candidate `5e139a40afe65548921329e751b39417a9adeef6` at
<https://offline-payment-matchbox.sociobot.in/> is **not releasable**. Fresh
hash comparisons prove the live deployment is the candidate; this is not a
deployment-only failure.

No product source was modified. This verification adds only the independent
report and reproducible evidence under `.factory/`.

## Release blockers

1. `.factory/claims.json` is missing and the test suite has no `@claim:*` tests.
   Public privacy, offline, export, and local-storage claims are unlisted.
2. The cold first screen does not name freelancers or present a first action.
   There is no “Try it with sample data” control.
3. `/demo` is the normal empty app using the real `matchbox-ledger` IndexedDB
   namespace. It has no sample data, banner, reset/start-real controls, or
   `.factory/demo.md`.

Additional findings: license restore closes its dialog and hides the result;
the mobile wordmark is only 30 px high; a real 404, sitemap, canonical/social
metadata, standard footer/build ID, and copy audit are absent.

Full evidence and severities are in `.factory/verification-4.md`.

## What passed

- Clean install/audit: 0 vulnerabilities.
- Unit/config tests: 18/18; Playwright: 17/17.
- TypeScript and exact production build passed; `dist/` exists.
- Independent normal, manual-note, export, invalid-input, persistence, privacy,
  desktop/mobile, offline, and service-worker-update flows passed.
- Axe: 0 violations on `/`, `/demo`, `/privacy/`, and `/terms/` at desktop and
  390 px. No workflow console/page errors.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.3 s, TBT 0 ms, CLS 0, 78,597 bytes transferred.
- Live response policies and immutable hashed-asset caching passed.
- Billing verify rate limit: request 31 returned 429 with `Retry-After: 3`.
- Eleven local/live production artifact hashes matched exactly.
- The prior checkout 404 does not reproduce: the Sociobot checkout endpoint now
  returns HTTP 303 to hosted Dodo checkout.

## Re-run

```bash
git checkout --detach 5e139a40afe65548921329e751b39417a9adeef6
npm ci
npm audit --audit-level=high
npm test
npm run build
node --check dist/sw.js
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run test:e2e
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node .factory/evidence/verification-4-browser.mjs
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node .factory/evidence/verification-4-sw-update.mjs
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node .factory/evidence/verification-4-billing.mjs
```

The required next step is a new builder candidate that resolves every release
blocker above, followed by independent verification from a fresh clone.
