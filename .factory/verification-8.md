# Independent verification 8 — PASS

**Verified:** 2026-08-29  
**Candidate:** `5328b4ba58ba66279075d5b596d82b02359ef314`  
**Live URL:** <https://offline-payment-matchbox.sociobot.in/>  
**Result:** **PASS** — the deployed PWA is the requested candidate and meets the researched brief's local-first reconciliation job.

## Cold first read

Cold desktop load gave the title **“Matchbox Ledger — match payments to invoices”** and the single H1 **“Match payments to invoices from two CSVs.”** The next sentence says it is **“For freelancers who reconcile invoices in spreadsheets or offline tools.”** The first prominent action is **“Try it with sample data,”** immediately explained as opening a separate ledger with three invoices. The first screen therefore plainly states the job, user, and first click. It also displays the required offline, on-device, and $19-once facts. `/demo/` opens directly on a realistic sample and displays **“Demo — sample data, nothing is saved to your workspace,”** Reset demo, and Start for real.

## Required claims gate

From the clean checkout, `npm ci` completed with 0 vulnerabilities. Every command listed in `.factory/claims.json` was run as `npm run test:e2e -- --grep @claim:<id>` against the shipped demo entry point. The aggregate fresh `@claim` run reported **19 expected, 19 passed, 0 unexpected, 0 flaky** in 38.9 s.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS |
| `csv-report` | PASS |
| `csv-match` | PASS |
| `private-workflow` | PASS |
| `demo-isolation` | PASS |
| `local-persistence` | PASS |
| `source-opt-in` | PASS |
| `deterministic-review` | PASS |
| `json-backup` | PASS |
| `plus-batch` | PASS |
| `free-core` | PASS |
| `plus-column-mappings` | PASS |
| `manual-note` | PASS |
| `daily-license-check` | PASS |
| `billing-routing` | PASS |
| `license-request-privacy` | PASS |
| `workspace-clearing` | PASS |
| `tracking-free` | PASS |
| `license-restore` | PASS |

## Clean-checkout and deployment evidence

| Check | Evidence |
| --- | --- |
| Unit tests | `npm test` — 23/23 passed in 6 files |
| Type/lint | `npm run typecheck` and `npm run lint` — passed |
| Production build | `npm run build` — passed and produced `dist/` |
| Full local browser suite | `npm run test:e2e` — 52/52 passed; no flaky/unexpected tests |
| Full production browser suite | `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e` — 52/52 passed; no flaky/unexpected tests |
| Build identity | `npm run verify:identity` — live reports v1.0.3 at the exact requested 40-character SHA |
| File identity | SHA-256 comparison of 17 local production files and live responses, including routes, release JSON, worker, manifest, hashed JS/CSS/art, found 0 mismatches |
| Dependency audit | `npm audit --audit-level=high` — 0 vulnerabilities |

The representative reconciliation flow passed in the full browser suite: invoice/payment CSV import, mapping, deterministic suggestion, confirmation, audit-note manual confirmation, CSV report export, JSON backup/import, local persistence, and offline reload. Fresh production negative-path checks also passed: impossible `2026-99-99` payment date is rejected with a recoverable row-specific alert and no page error; two invoices competing for one payment show two **Needs a closer look** warnings, zero quick-confirm buttons, and two manual-review controls; malformed `{"invoices":[null],...}` backup is rejected while the prior workspace remains intact. These three live checks passed again in 9.2 s.

## Browser, privacy, accessibility, and PWA

- Independent axe scans of `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at 1440×900 and 390×844 returned **zero serious or critical** violations. Each route had exactly one H1 and one main landmark.
- At 390 px the populated demo document was exactly 390 px wide with no horizontal overflow. Reduced-motion transition duration was `0.00001s`. Keyboard-only testing reached the visible solid-outline skip link, activated it, put focus into the Plus dialog, closed it with Escape, and returned focus to its trigger.
- A cold live default/demo flow recorded only `https://offline-payment-matchbox.sociobot.in` requests, no cookies, no page errors, and no console errors. The landing cold-load request log contained only same-origin HTML, JS, CSS, and the self-hosted WebP.
- The live service worker controlled the app, used cache `matchbox-v11`, and reloaded `/demo/` offline with **“You are offline — matching still works.”** A fresh production-build local serving test changed only the worker response version and verified the actual in-app update signal **“An app update is ready. Reload”**; old/new versioned caches were present during activation. No product source was changed for this test.
- Live headers were verified on entry points, hashed assets, worker, manifest, and release JSON: restrictive CSP with `frame-ancestors 'none'`, Permissions-Policy, HSTS, nosniff, and Referrer-Policy are present; HTML/worker/manifest/release are `no-cache`; hashed JS/CSS are `public, max-age=31536000, immutable`; manifest is `application/manifest+json`. Unknown paths return the designed HTTP 404.

## Billing, performance, and scope

- A no-purchase checkout request returned HTTP 303 to the Sociobot/Dodo hosted checkout. Invalid license verification returned no-store JSON with product-origin CORS. One sequential client received HTTP 200 on requests 1–30 and HTTP 429 with `Retry-After: 4` on requests 31–40: observed allowance **30 requests per window**.
- Production Lighthouse: **92 performance / 100 accessibility / 100 best practices / 100 SEO**; FCP 1.0 s, LCP 1.3 s, TBT 360 ms, CLS 0, transfer 80 KiB. Production build sizes: app JS 38,571 B raw / 12,750 B gzip; main CSS 19,033 B raw / 5,043 B gzip; welcome art 43,436 B. All are within the stated static/PWA budgets.
- There is no sign-in, owned backend, CLI/library consumer API, bank connection, or AI feature in scope for this local-first PWA. No external financial transaction or real license was created.

## Defects by severity

No release-blocking, high, medium, or low defects found in this verification.

