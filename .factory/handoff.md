# Matchbox Ledger — independent verification 10 handoff

## Outcome: FAIL

Candidate `1b7eb438a59618924011dbe8cefc9a7bd011affd` was independently tested at
<https://offline-payment-matchbox.sociobot.in/> on 2026-08-29. Production
identifies itself as the exact candidate, and all 21 served build artifacts
match the local production build byte-for-byte.

Release is blocked by the mandatory `@claim:demo-isolation` test. The full live
suite failed it once (55 passed, 1 failed), and a ten-run isolated repetition
failed 5/10. After **Start for real**, asynchronous verification can update the
real license-verdict key before the claim takes its snapshot. The real ledger
and mapping remain unchanged, so no sample financial rows were observed
leaking; the mandatory claim test is nevertheless nondeterministic on the
deployed product. The acceptance contract makes any failing claim test a FAIL.

## What was verified

```bash
npm ci
# Every one of the 22 .factory/claims.json commands, separately
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in \
  npm run test:e2e -- --grep @claim:demo-isolation --repeat-each=10
LIVE_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run verify:identity
npm audit --audit-level=high
```

- Clean claim commands: 22/22 passed locally.
- Unit/integration: 23/23 passed; typecheck, lint, and build passed.
- Complete local browser suite: 56/56 passed.
- Complete live browser suite: **55/56 passed**.
- Repeated live `demo-isolation`: **5/10 failed**.
- Independent live accessibility/site subset: 25/25 passed with zero
  serious/critical axe findings.
- Cold first read and one-click sample demo passed on desktop and 390 px.
- Normal flow, invalid-date recovery, malformed-backup recovery, competing
  match review, manual note, report/backup export, privacy request log,
  keyboard/focus, reduced motion, touch targets, and link crawl passed.
- Offline demo reload and a controlled service-worker update passed.
- Billing verification limit: 30 successful requests; request 31 returned 429
  with `Retry-After: 4`.
- Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO;
  LCP 1.3 s, TBT 130 ms, CLS 0, transfer 80 KiB.

## Required next step

Make the live `demo-isolation` claim deterministic by handling the expected
real-license refresh explicitly, then rerun every claim command and the full
suite against production. Do not treat an isolated passing rerun as resolution;
the ten-run result must be stable.

Full evidence and defect detail are in
[`verification-10.md`](verification-10.md). Generated evidence is under
`.factory/evidence/verification-10/`.
