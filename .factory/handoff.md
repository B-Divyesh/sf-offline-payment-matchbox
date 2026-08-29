# Matchbox Ledger — independent verification 5 handoff

## Outcome

**FAIL — do not release candidate `33f16759fcafa0fbae9eadb9687d43cd3f24ee2d`.**

Tested live URL: <https://offline-payment-matchbox.sociobot.in/>

Demo: <https://offline-payment-matchbox.sociobot.in/demo/>
Date: 29 August 2026

The live deployment matches the candidate byte-for-byte across all 14 checked
build artifacts. This is not a deployment-only failure. No product source was
modified during verification.

## Release blockers

1. **High — incomplete claims contract.** All 11 listed claim tests pass, but
   visitor-facing promises have no `.factory/claims.json` entry or exact tagged
   sandbox test: remembered Plus column mappings, clearing the local IndexedDB
   workspace, the no-cookie/no-analytics/no-remote-font/no-tracking statement,
   and restoring a valid license on another device.
2. **Medium — mobile touch target.** The standalone **Review suggestions** link
   on the populated `/demo/` is 153.83 × 24 CSS px at 390 × 844, below the
   required 44 px height. Existing target tests do not scan this action.

Full evidence and required repairs are in `.factory/verification-5.md`.

## What passed

- Mandatory cold first read and one-click isolated demo.
- Every one of the 11 existing claims commands, run separately before general QA.
- `npm ci`, audit, 20/20 unit/integration tests, typecheck, lint, exact build,
  service-worker syntax, 39/39 local browser tests, and 39/39 live browser tests.
- Representative normal flow, boundary values, invalid-input recovery, manual
  note enforcement, persistence, CSV report, backup, demo isolation, and offline
  reload.
- Worker URL verification; Axe serious/critical checks on desktop and 390 px;
  keyboard focus/dialog behavior; reduced motion; responsive overflow.
- Same-origin reconciliation request log, security headers, caching, designed
  404, internal-link crawl, checkout redirect, and live invalid-license UI.
- Billing verify rate limit: requests 1–30 returned 200; request 31 returned 429
  with `Retry-After: 2`.
- Service-worker v7→v8 update simulation and old-cache removal.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.3 s, TBT 120 ms, CLS 0, total transfer 79 KiB.
- Budgets: app JS 35,912 bytes raw, app CSS 17,951 bytes raw, hero 43,436 bytes,
  no remote fonts.

## Reproduce

```bash
npm ci
npm audit --audit-level=high
npm test
npm run typecheck
npm run lint
npm run build
node --check dist/sw.js
npm run test:e2e
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e
node .factory/evidence/verification-5-live-independent.mjs
node .factory/evidence/repair-sw-update.mjs
```

Evidence files are prefixed `verification-5-` in `.factory/evidence/`.
