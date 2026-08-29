# Matchbox Ledger — repair 2 handoff

## Outcome

PASS. Release blockers from independent report commit `c5009d4ae97bccdbaaf0bf1c39b232b4ab827e9e` against candidate `5e139a40afe65548921329e751b39417a9adeef6` are repaired and deployed.

Live: <https://offline-payment-matchbox.sociobot.in/>
Demo: <https://offline-payment-matchbox.sociobot.in/demo/>
Artifact/deployment class: Vite + TypeScript offline PWA, static `dist/`.

## What changed

- Added `.factory/claims.json` with 11 public claims. Each has exactly one `@claim:<id>` Playwright test that starts from `/demo/`.
- Added a one-click demo with three freelancer invoices, three payments, one confirmed match, and two reviewable suggestions.
- Isolated demo data in IndexedDB `demo:matchbox-ledger`; real data remains in `matchbox-ledger`. Reset restores the sample. Leaving demo deletes the demo workspace.
- Rewrote the first screen to name freelancers, state the payment-to-invoice job, show the first action, and list offline/privacy/price facts.
- Added visible three-step “How it works” and $19 one-time Plus sections without changing the existing matcher behavior.
- Preserved the Plus dialog across license-state renders. Invalid results are visible, announced with `role=status`, focused, and cached for one day.
- Added physical `/demo/` and `404.html` entry points, real unknown-route HTTP 404 handling, `sitemap.xml`, canonical/Open Graph/Twitter/Apple metadata, and a reviewed 1200×630 social crop.
- Standardized legal headers/footers and added “Built by Param Factory” plus `v1.0.1 · repair 2` identity.
- Raised the mobile wordmark target from 30px to 44px and contained populated table overflow at 390px while retaining table scrolling.
- Added `.factory/demo.md` and `.factory/copy-audit.md`. No audited landing sentence exceeds 22 words.

## Regression coverage

- `tests/claims.test.ts`: manifest presence, unique IDs, complete fields, and exactly one matching browser tag per claim.
- `tests/e2e/claims.spec.ts`: isolated demo, offline reload, CSV report rows, same-origin privacy, persistence, source-file opt-in, ambiguous matching, JSON round trip, Plus batch action, and manual-note enforcement.
- `tests/e2e/workflow.spec.ts`: invalid license result remains open, visible, announced, focused, and does not reverify after reload.
- `tests/e2e/accessibility.spec.ts`: Axe on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at desktop and 390px; wordmark/touch targets; populated-demo overflow.
- `tests/e2e/site.spec.ts`: route titles, canonicals, social metadata, one H1, standard footer, designed 404, and sitemap.
- `tests/response-policy.test.ts`: no SPA fallback for unknown routes and the 404 response override.

## Clean local verification

Run:

```bash
npm ci
npm audit --audit-level=high
npm test
npm run typecheck
npm run lint
npm run build
node --check dist/sw.js
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers npm run test:e2e
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node .factory/evidence/repair-sw-update.mjs
```

Results on 29 August 2026:

- Clean install: 58 packages; audit: 0 vulnerabilities.
- Vitest: 20/20 across 5 files.
- TypeScript: pass. Oxlint: pass with no warnings.
- Playwright local: 39/39.
- All 11 claim commands are included in that run and pass from fresh demo contexts.
- Build: pass; `dist/index.html`, `/demo/index.html`, legal pages, and `404.html` exist.
- App JS: 35,912 bytes raw / 12.13 KB gzip. App CSS: 17,951 / 4.83 KB gzip. Hero WebP: 43,436 bytes. No remote fonts.
- Service-worker update: `matchbox-v7` → `matchbox-v8`, update toast shown, old cache removed, 0 console errors.
- Local SWA emulation: `/`, `/demo/`, legal routes, and sitemap 200; `/not-a-real-page` 404 with the designed page.

## Browser, accessibility, privacy, and billing evidence

- Live Playwright: 39/39 using `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in`.
- Axe: 0 serious/critical violations across 10 route/viewport combinations.
- 390px populated demo: document width 390px; internal report table remains scrollable. Wordmark is 156.77×44px.
- Keyboard: skip link and both dialogs pass. Escape restores normal modal behavior. Invalid license result receives focus inside the still-open dialog.
- Reduced motion: transition and animation durations reduce to 0.01ms.
- Privacy flow: only the product origin is requested during matching and report export. Demo and real IndexedDB names remain separate.
- Live invalid license: one verify request returned 200/invalid; notice was visible and focused; reload used the daily cache with no second request; 0 console errors.
- Checkout endpoint: HTTP 303 to hosted checkout. No provider is embedded.
- Evidence: `.factory/evidence/repair-live/`, `.factory/evidence/repair-live-demo/`, `.factory/evidence/repair-live-lighthouse.json`, and `.factory/evidence/repair-sw-update.mjs`.

## Performance, response policy, and identity

Live Lighthouse mobile:

- Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- FCP 1.0s, LCP 1.3s, TBT 20ms, CLS 0, total transfer 79 KiB.

Live response checks:

- `/`, `/demo/`, manifest, and service worker use `Cache-Control: no-cache`.
- Hashed JS/CSS/WebP use one-year immutable caching.
- Manifest MIME is `application/manifest+json`.
- CSP, Permissions-Policy, Referrer-Policy, `nosniff`, and frame protection are present.
- `/sitemap.xml` returns 200. `/not-a-real-page` returns HTTP 404 with the designed 404 document.

SHA-256 comparisons matched local `dist/` and live bytes for 13/13 checked artifacts: home, demo, privacy, terms, 404, sitemap, manifest, service worker, social image, both CSS files, JS, and hero WebP. Representative hashes:

- `/`: `fe070e41590cfd5f106ba874a0b1adfa7bb8c39408559c167c7baa736f89c163`
- `/demo/`: `180b89ea9939d2f2b01069d0cce55fac8aaf4f526d9b59fa6703889e6348555a`
- app JS: `319fc20ebead8fd8c03b50b61c570db29c808afdd66eb8d9ed24eed7e6faec78`
- `/sw.js`: `30f59a4f74e7a4b60c811e21cfedfe3be0e2fd5ac0ddf7c583b49922344b4af0`

## Deployment and repository

- Repair commits: `0a408cf`, `5d47456`, `4112969`, `09fc5c3`.
- Branch: `main`; commits pushed to `origin/main`.
- Production uploaded with the work order’s static configuration from `dist/` using Azure Static Web Apps CLI.
- The first upload attempt was rejected before deployment because Azure normalizes `/demo` and `/demo/` as one route. The redundant rule was removed, rebuilt, committed, and the next upload passed.

## Known gaps

None for the researched brief or verifier findings. Package/consumer checks are not applicable to this static PWA. No AI feature is appropriate for deterministic local reconciliation.
