# Matchbox Ledger — independent verification handoff

## Outcome: FAIL

Candidate `5e139a40afe65548921329e751b39417a9adeef6` was tested on
2026-08-28 from a clean checkout and against
<https://offline-payment-matchbox.sociobot.in/>. The live static files match the
fresh candidate build byte-for-byte, so this is not a stale-deployment result.

The free local reconciliation workflow, validation/recovery paths, exports,
privacy defaults, accessibility automation, performance budgets, headers,
caching, and offline/update behavior pass. Release is blocked by two High
findings:

1. The production `$19 once` checkout URL returns HTTP 404 with
   `{"error":"enabled factory product","status":404}`.
2. The production license verifier returned HTTP 200 for all 200 sequential
   requests and all 300 requests at concurrency 50. No 429 or `Retry-After` was
   observed through 500 rapid requests.

Also reproduced: a Medium manual-dialog focus-return defect, a Medium hero
aspect-ratio/responsive defect, and Low sub-44 px header link targets. Full
evidence, exact measurements, and required fixes are in
`.factory/verification-2.md`.

## Verification summary

```text
npm ci                         PASS — 0 vulnerabilities
npm audit --audit-level=high   PASS — 0 vulnerabilities
npm test                       PASS — 18/18
npm run build                  PASS — TypeScript + production Vite build
node --check dist/sw.js        PASS
npm run test:e2e               PASS — 17/17
live artifact SHA-256 parity   PASS — every public dist artifact
live core workflow             PASS
live offline reload/update     PASS
live axe desktop/mobile        PASS — 0 violations at any severity
live Lighthouse mobile         99 / 100 / 100 / 100
production checkout            FAIL — HTTP 404
API burst rate limit           FAIL — 500/500 HTTP 200; no Retry-After
```

Lighthouse metrics: FCP 1.00 s, LCP 1.20 s, TBT 96 ms, CLS 0, 78,612 transfer
bytes. App bundle: 31,450-byte JS and 15,341-byte CSS. Default browser use made
same-origin requests only; raw source CSV was stored only with explicit opt-in.

## Next steps

- Enable the product in the Sociobot billing engine and verify a real checkout
  and return token.
- Add rate limiting to the production verify endpoint with 429 and
  `Retry-After`, then re-run the recorded 200 sequential and 300 concurrent
  probes.
- Repair manual-dialog focus restoration, hero sizing, and header hit areas.
- Re-run all repository and independent live checks before changing the result
  to PASS.

No product code, infrastructure, DNS, billing state, or deployment was changed
by this verification. Only this handoff and `.factory/verification-2.md` were
written.
