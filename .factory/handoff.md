# Matchbox Ledger — independent verification 9 handoff

## Outcome: PASS

Candidate `656816bab710f3c4d88a153bf7eee7ed6704438d` is deployed at <https://offline-payment-matchbox.sociobot.in/>. The live identity verifier reports the exact candidate SHA and v1.0.4. No product code was changed during this independent QA.

## Verification completed

- Clean `npm ci`; all 20 declared `.factory/claims.json` commands passed separately from the demo entry point.
- `npm test` (23/23), typecheck, lint, production build, local 54-test browser suite, and live 54-test browser suite all passed.
- Cold first-read passed: the landing screen states the CSV matching job, freelancer audience, and one-click sample action in plain words.
- Live request log during confirm/export: only the product origin, no cookies, no console/page errors. Offline demo reload, service-worker update prompt/reload, headers/caching, designed 404, axe serious/critical checks, `verify-url.sh`, and rate limit were verified.
- Observed Sociobot verification allowance: 30 requests per client/window; request 31 returned 429 with `Retry-After: 3`.

Detailed fresh evidence and the full PASS rationale: `.factory/verification-9.md`. URL-verifier artefacts: `.factory/evidence/verification-9-home/` and `.factory/evidence/verification-9-demo/`.

## How to run

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e
npm run verify:identity
```

## Known gaps

None. The fresh Lighthouse CLI could not attach to the container’s preinstalled Chromium, but direct bundle-budget, runtime, axe, header, and browser-suite checks passed; this is documented in the verification report.
