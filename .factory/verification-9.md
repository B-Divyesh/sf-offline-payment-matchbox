# Independent verification 9 — PASS

**Verified:** 2026-08-29  
**Candidate:** `656816bab710f3c4d88a153bf7eee7ed6704438d`  
**Live URL:** <https://offline-payment-matchbox.sociobot.in/>  
**Decision:** **PASS**

The deployment identifies itself as `offline-payment-matchbox` v1.0.4 at the exact candidate SHA. Fresh evidence supersedes the earlier deployment-only concern: the deployed PWA matches the candidate and passes the acceptance contract.

## Cold first read

On a cache-free desktop load, the title was **“Matchbox Ledger — match payments to invoices.”** The first screen says **“Match payments to invoices from two CSVs”**, **“For freelancers who reconcile invoices in spreadsheets or offline tools”**, and offers **“Try it with sample data”** with the explanation **“Opens a separate sample workspace with three invoices.”** It plainly answers what it does, for whom, and what to click first. The required single-click sample action was present.

The direct demo URL `/demo/` shows the realistic three-invoice/three-payment sample and the persistent **“Demo — sample data, nothing is saved to your workspace”** banner with **Reset demo** and **Start for real**.

## Mandatory claims gate

From the clean candidate checkout, `npm ci` completed with 0 vulnerabilities. I ran every command in `.factory/claims.json` separately, exactly as declared, against the product’s Playwright demo entry point. Playwright’s final run status was `passed` with no failed tests.

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS |
| `csv-report` | PASS |
| `csv-match` | PASS |
| `private-workflow` | PASS |
| `demo-isolation` | PASS |
| `local-persistence` | PASS |
| `source-opt-in` | PASS |
| `mapping-before-save` | PASS |
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

## Clean checkout, product flow, and deployment

| Check | Fresh evidence |
| --- | --- |
| Unit tests | `npm test`: 23/23 passed in 6 files |
| Type and lint | `npm run typecheck` and `npm run lint`: passed |
| Production build | `npm run build`: passed and created `dist/` |
| Local full browser suite | `npm run test:e2e`: 54 tests, final status passed |
| Live full browser suite | `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e`: 54 tests, final status passed |
| Build identity | `npm run verify:identity`: exact product, v1.0.4, and requested 40-character SHA |
| Dependency audit | `npm audit --audit-level=high`: 0 vulnerabilities |

The browser suites and claims exercise the actual job: invoice/payment CSV imports and column mapping, deterministic date/amount/reference suggestions, quick and manual confirmation, required manual audit notes, CSV reconciliation report, JSON backup/import, persistence, demo isolation, clear-workspace recovery, invalid dates, malformed backups, and ambiguous competing payments. Ambiguous equal candidates have no quick-confirm action and require manual review.

## Privacy, accessibility, PWA, mobile, and headers

- Fresh cold default/demo flow recorded only `https://offline-payment-matchbox.sociobot.in` requests, no cookies, and no console or page errors. Confirming a sample match and exporting `matchbox-report-2026-08-29.csv` did not add another origin.
- The live page is controlled by `sw.js` with cache `matchbox-v12`. After the first online visit, `/demo/` reloaded offline and displayed **“You are offline — matching still works.”** A fresh local production-build update simulation changed only the worker cache version (`v12` → `v13`), displayed **“An app update is ready. Reload”**, then activated the new cache and removed the old cache. No product code was changed.
- Axe-core, injected through Playwright so the live CSP remained intact, found **zero serious or critical violations** on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at 1440px, plus `/` and `/demo/` at 390px. Every scan had `lang=en`, exactly one H1, and one main landmark; no console/page errors occurred.
- The worker `verify-url.sh` passed on `/` and `/demo/`: HTTP 200, title, `lang`, one H1, main landmark, zero missing image alt attributes, zero unlabeled buttons, and zero console/page errors. Evidence is in `.factory/evidence/verification-9-home/` and `.factory/evidence/verification-9-demo/`.
- The shipped accessibility/browser tests cover skip-link focus, keyboard modal operation and Escape focus return, visible focus styling, 44px mobile controls, 390px overflow, and reduced motion. Both local and live 54-test suites passed these checks.
- Live HTML, worker, manifest, and hashed JS headers are correct: CSP restricts execution to self and `connect-src` to self plus the documented Sociobot API; `frame-ancestors 'none'`, HSTS, nosniff, referrer policy, and Permissions-Policy are present. HTML/worker/manifest use `no-cache`; hashed JS uses `public, max-age=31536000, immutable`; an unknown URL returns the designed HTTP 404.

## Performance and billing boundary

- Production build sizes: JavaScript 38.75 kB raw / 12.85 kB gzip; primary CSS 19.03 kB raw / 5.05 kB gzip; welcome WebP 43.43 kB. These are within the static/PWA JS, CSS, and image budgets. I attempted a fresh Lighthouse CLI run, but its launcher could not connect to the preinstalled Chromium; this environment limitation did not affect the tested bundle, accessibility, or runtime checks.
- The product has no sign-in or owned backend. Its only server-side product call is the documented Sociobot billing verification endpoint. From one client and an invalid test token, requests 1–30 returned HTTP 200; request 31 and later returned HTTP 429 with `Retry-After: 3`. Observed allowance: **30 requests per window**. No checkout or real transaction was created.

## Defects by severity

No release-blocking, high, medium, or low product defects found.
