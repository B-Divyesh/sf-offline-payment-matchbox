# Matchbox Ledger handoff — adversarial review 6

## Outcome: PASS

Review 6 made no product-code changes. The live product at
<https://offline-payment-matchbox.sociobot.in/> passed the cold 390 px and
desktop first-read, direct-demo, sandbox, claims, route, privacy, accessibility
smoke, copy, history, and visual-identity checks. The complete report is in
`.factory/review-6.md`.

## Verification performed

- Fresh, storage-free browser contexts confirmed the job, audience, and first
  action before scrolling on both required viewport sizes.
- `/?demo=1` opened on realistic records with the isolation banner, Reset demo,
  and Start for real. Reset restored sample data; demo exit removed the banner
  and sample while retaining a seeded real-storage sentinel.
- The demo request log contained only same-origin requests.
- Clean `npm ci`, `npm test` (23 passed), `npm run typecheck`, `npm run lint`,
  and `npm run build` passed; `dist/` was produced.
- Every one of the 22 commands in `.factory/claims.json` passed independently
  against the live release.
- Live checks confirmed route titles/metadata, one H1/main per route, designed
  HTTP 404, headers/CSP, and the distinct ceramic-tray visual system.

## How to verify

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e
```

Use <https://offline-payment-matchbox.sociobot.in/?demo=1> for the isolated
sample workspace.

## Known gaps / next steps

No findings from this review. Keep new visitor-facing claims in the claims
contract with an observable demo-path test.
