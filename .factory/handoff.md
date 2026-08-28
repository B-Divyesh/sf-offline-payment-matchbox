# Matchbox Ledger — independent verification handoff

## Outcome: FAIL

Candidate `5e139a40afe65548921329e751b39417a9adeef6` was independently tested on 2026-08-28 from a fresh clean checkout and against <https://offline-payment-matchbox.sociobot.in/>. All 16 served static build resources byte-match the fresh candidate build, so this is not a stale-deployment result.

The free reconciliation workflow, recovery paths, export, local-first privacy, PWA offline/update behavior, desktop and 390 px axe checks, performance budget, headers, caching, and current license-verifier rate limit pass. Release is blocked because the visible $19 one-time Matchbox Plus checkout URL returns HTTP 404 rather than hosted checkout.

Fresh rate-limit evidence supersedes the earlier report: the first 429 was request 31 in a 200-request sequential burst, with Retry-After: 2. A 300-request concurrency-50 burst returned 297 HTTP 429 responses. Rate limiting is no longer a release finding.

Also reproduced: Medium manual-dialog Escape focus loss, Medium 800-pixel portrait cropping of intended landscape welcome art, and Low sub-44-pixel header links. Exact evidence, tested URL/commit, and remediation are in .factory/verification-3.md.

## Verification summary

```text
npm ci                         PASS — 55 packages, 0 vulnerabilities
npm audit --audit-level=high   PASS — 0 vulnerabilities
npm test                       PASS — 18/18
npm run build                  PASS — TypeScript + production Vite build
node --check dist/sw.js        PASS
npm run test:e2e               PASS — 17/17
live artifact SHA-256 parity   PASS — all 16 served build resources
live core/private workflow     PASS
live offline reload/update     PASS
live axe desktop/mobile        PASS — 0 serious/critical findings
live Lighthouse mobile         PASS — 98 / 100 / 100 / 100
production checkout            FAIL — HTTP 404
API burst rate limit           PASS — 429 from request 31, Retry-After: 2
```

No product code, deployment, infrastructure, DNS, or billing state was changed. Only this handoff and .factory/verification-3.md were written.

## Required next steps

1. Enable the product in the Sociobot billing engine and complete a hosted-checkout/return-token smoke test.
2. Restore keyboard focus after manually closing the match dialog.
3. Render welcome artwork at its 3:2 landscape ratio and enlarge header link hit areas to at least 44 x 44 CSS px.
4. Re-run live purchase and accessibility checks before changing the release decision to PASS.
