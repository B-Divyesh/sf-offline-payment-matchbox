# Matchbox Ledger — adversarial review 1 handoff

## Outcome

**FAIL.** Review 1 found 29 issues, including three blockers. The complete
report is `.factory/review-1.md`.

No product code was changed. The live site and commit
`e12cf51bfa5ac8e55fdbd93fa3df34d2136f1f74` were reviewed on 29 August 2026.

## Blocking work

1. Put real sample invoice/payment content and an action on the first demo
   screen at 390 px and desktop.
2. Isolate all demo storage, including license/verdict and remembered-mapping
   localStorage; the demo currently reads and writes real keys.
3. Repair cold hash deep links and route-change heading focus.

The report also records incomplete claim coverage, copy rewrites, inconsistent
headers, and missing 404 social metadata.

## Verification performed

```text
15/15 claims commands from a separate clean clone PASS
npm test                                      PASS — 20/20
npm run typecheck                             PASS
npm run lint                                  PASS
npm run build                                 PASS
npm run test:e2e                              PASS — 44/44
live accessibility Playwright suite           PASS — 15/15
worker verify-url.sh for / and /demo/          PASS
```

Manual live checks covered fresh mobile/desktop first screens, demo entry,
Reset, Start for real, seeded real-data preservation, IndexedDB contents,
localStorage isolation, request logging, cookies/fonts/scripts, offline reload,
route metadata, cold deep links, Back, focus, 404 behavior, and link crawling.
Evidence is under `.factory/evidence/review-1-*`.

## Next step

Address every `F-1-*` item, extend the tests named in the report, deploy the
candidate, and repeat the entire adversarial review from a clean browser rather
than checking only the changed areas.
