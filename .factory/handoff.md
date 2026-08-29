# Matchbox Ledger — polish round 4 handoff

## Outcome

All 32 findings across `.factory/review-1.md` and `.factory/review-4.md` are resolved. The released PWA keeps its glacial ceramic visual identity and static/offline deployment class.

Round 4 adds a real `mapping-before-save` claim and browser test for both import forms, names the destructive section directly, and uses **workspace** consistently for demo isolation. A live-only delayed hash-focus race found during verification was also fixed and regression-tested.

The first 390 × 844 screen states the job, audience, first action, sample-workspace outcome, and three facts without scrolling. `?demo=1` opens realistic isolated data in one click with a persistent banner, **Reset demo**, and **Start for real**.

## Exact verification

- `npm ci` in a new clone of the repaired application commit.
- Every one of the 20 `.factory/claims.json` commands run separately: 20/20 passed.
- `npm test`: 23/23 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and created `dist/index.html` plus real demo, privacy, terms, offline, and 404 pages.
- `npm run test:e2e`: 54/54 passed locally.
- `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e`: 54/54 passed after redeployment.
- Focus/history stress run on production: 40/40 passed across the keyboard-modal and cold hash/Back/Forward cases.
- `npm run verify:identity`: production identified v1.0.4 at repaired app commit `da4aaa102f43ba1572108be1176701782803c47b` before this documentation-only handoff commit.
- Real unknown URL: returned the designed 404 page with HTTP 404.
- `verify-url.sh` on `/` and `/?demo=1`: HTTP 200, zero console/page errors, `lang=en`, one H1, `<main>`, zero missing alt text, and zero unlabelled buttons.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.6 s, CLS 0, TBT 0 ms.
- Built assets: initial JS 38.75 KB raw / 12.85 KB gzip; app CSS 19.03 KB raw / 5.05 KB gzip; hero WebP 43.43 KB.
- Repaired application deployment ID: `f4310990-3453-446f-8e19-e413ee2b0fa5`.

Evidence is in `.factory/polish-4.md`, `.factory/evidence/polish-4-lighthouse.json`, `.factory/evidence/polish-4-local-home/`, `.factory/evidence/polish-4-local-demo/`, `.factory/evidence/polish-4-live-home/`, and `.factory/evidence/polish-4-live-demo/`.

## Run and verify

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
LIVE_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run verify:identity
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e
```

## Known gaps and next steps

None for this work order. No finding, stub, TODO, or deferred minor item remains.
