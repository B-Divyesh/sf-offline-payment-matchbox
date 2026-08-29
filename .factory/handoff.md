# Matchbox Ledger — polish round 1 handoff

## Outcome

**PASS.** Every `F-1-1` through `F-1-29` finding in `.factory/review-1.md` is
resolved and mapped in `.factory/polish-1.md`. The product repair is
`75e98e9`; the portable claim-test follow-up is `1cc9475`.

The static deployment completed as Azure deployment
`cd4d3367-8039-463b-b9a0-80ebff815316`. Live asset identity was checked at
<https://offline-payment-matchbox.sociobot.in/> (`main-C8kK6qhi.js`).

## What changed

- Direct `?demo=1` opens an isolated sample ledger with a realistic visible
  payment/invoice pair, persistent banner, reset, and start-real exit.
- Demo localStorage settings now share the `demo:` namespace with demo
  IndexedDB; real storage is not read or written in demo mode.
- Claims, tests, plain-language copy, shared headers, focus/deep-link routing,
  legal headings, and 404 social metadata were completed.
- PWA release cache advanced to `matchbox-v9` and manifest startup version 4.

## Exact verification

```text
Fresh clone: npm ci                              PASS
Fresh clone: 19/19 claim commands                PASS
npm test                                         PASS — 20/20
npm run typecheck                                PASS
npm run lint                                     PASS
npm run build                                    PASS — dist/index.html created
npm run test:e2e                                 PASS — 51/51 local
E2E_BASE_URL=<live> npm run test:e2e             PASS — 51/51 live
verify-url.sh home and ?demo=1                   PASS — no console errors
```

The Playwright axe suite covers desktop and 390 px home, demo, privacy, terms,
and 404 routes with no serious or critical findings. Lighthouse against the
production build measured 100 performance, 100 accessibility, 100 best
practices, and 100 SEO (FCP 0.9 s, LCP 1.5 s, CLS 0).

Evidence is in `.factory/evidence/polish-1-local/` and
`.factory/evidence/polish-1-live/`; the finding-by-finding evidence is in
`.factory/polish-1.md`.

## Run and deploy

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Deploy static output with `/opt/fleet/lib/deploy-static.sh
offline-payment-matchbox dist`.

## Known gaps

None.
