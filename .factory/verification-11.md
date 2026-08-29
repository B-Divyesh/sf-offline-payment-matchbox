# Independent verification 11 — PASS

**Verified:** 2026-08-29  
**Candidate:** `79fc49f577846497bfa00c721daf313f62e149aa`  
**Live URL:** <https://offline-payment-matchbox.sociobot.in/>  
**Decision:** **PASS**

This is an independent clean-install verification of the deployed PWA against
the researched brief and factory acceptance contract. No product source,
deployment, billing state, or infrastructure was changed. The only resulting
repository changes are this report and the handoff update.

## First read and demo gate

A fresh 1440 × 960 browser context opened the live home page cold. Its single
H1 says **“Match payments to invoices from two CSVs”**; the next sentence says
**“For freelancers who reconcile invoices in spreadsheets or offline tools.”**
The first primary action is **“Try it with sample data”**, immediately explained
as opening a separate workspace with three invoices and three payments. This
plainly states the job, intended user, and first click.

One click/direct `/?demo=1` opens the realistic three-invoice/three-payment
sample with the persistent **“Demo — sample data, nothing is saved to your
workspace”** banner, **Reset demo**, and **Start for real**. The first-read and
one-click sandbox gates pass.

## Mandatory claims gate

From the clean candidate checkout, `npm ci` succeeded (58 packages; audit
reported 0 vulnerabilities). I then ran every one of the 22 exact commands in
`.factory/claims.json` separately through the declared Playwright demo entry
point. Every command exited 0:

| Claim IDs | Result |
| --- | --- |
| `offline-reload`, `demo-sample`, `matching-signals`, `csv-report`, `csv-match` | PASS |
| `private-workflow`, `demo-isolation`, `local-persistence`, `source-opt-in`, `mapping-before-save` | PASS |
| `deterministic-review`, `json-backup`, `plus-batch`, `free-core`, `plus-column-mappings` | PASS |
| `manual-note`, `daily-license-check`, `billing-routing`, `license-request-privacy` | PASS |
| `workspace-clearing`, `tracking-free`, `license-restore` | PASS |

The locally served complete Playwright suite also passed **56/56**, and the
purpose-built race regression `npm run test:demo-isolation` passed **10/10**.
The preceding report's deployment-only concern does not reproduce on this
candidate: `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run
test:demo-isolation` passed **10/10** against production.

## Local quality gates

| Check | Fresh result |
| --- | --- |
| `npm test` | PASS — 23 tests in 6 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — produced `dist/` |
| `npm run test:e2e` | PASS — 56/56 |
| `npm run verify:sw-update` | PASS — update prompt, replacement cache, no page errors |
| `npm run verify:identity` | PASS — live v1.0.5 identifies exact candidate SHA |

The production build's initial app JavaScript is 39.44 kB raw / 13.02 kB gzip;
primary CSS is 20.24 kB raw / 5.26 kB gzip; the welcome WebP is 43.43 kB. These
are within the applicable static-PWA budgets.

## End-to-end, privacy, and deployment evidence

- Fresh live demo flow: two suggestions displayed; a confirmation created the
  confirmed-match record; report export downloaded a six-row CSV with the
  documented header; no console or page errors occurred.
- An invalid `2026-99-99` payment showed “Payment row 2 needs a valid date and
  amount.” The corrected replacement then imported successfully. Two equal
  invoices competing for one payment showed two “Needs a closer look” states
  and zero quick-confirm controls.
- The full live demo request log (load, confirmation, and export) contained
  only `https://offline-payment-matchbox.sociobot.in`; no cookies, analytics,
  remote fonts, or tracking requests were observed. The isolated claim suite
  separately verifies the documented optional license-token-only request.
- `release.json` identifies `offline-payment-matchbox` v1.0.5 at
  `79fc49f577846497bfa00c721daf313f62e149aa`, so the public deployment matches
  the candidate.
- Root HTML is `no-cache`; hashed JS is `public, max-age=31536000, immutable`.
  CSP limits execution to self and permits only the documented Sociobot billing
  connection; HSTS, `nosniff`, `frame-ancestors 'none'`, referrer policy, and
  Permissions-Policy are present.
- The live PWA has an active `/sw.js` registration, a valid standalone
  manifest, and successfully reloaded the populated sample offline after its
  first visit. The controlled update check moved from `matchbox-v16` to
  `matchbox-v16-update-check`, exposed “An app update is ready. Reload”, and
  replaced the old cache.

## Accessibility and responsive checks

Live AxeBuilder scans found **zero serious or critical findings** on `/`,
`/demo/`, `/privacy/`, `/terms/`, and `/404.html` at 1440 px and 390 px. Cold
home had `lang=en`, a title, exactly one H1, and a main landmark. Keyboard-only
testing verified the visible focused skip link, hash destination, modal focus,
Escape close, and focus return. At 390 px the demo had no page horizontal
overflow (390 px document width); its horizontally scrollable table remained
usable, and all visible controls were at least 44 px. Reduced-motion transition
duration was effectively zero.

## Billing/server boundary

There is no owned backend or sign-in; library/CLI packaging and backend
concurrency checks do not apply. The no-purchase checkout request returned
HTTP 303 to the hosted Dodo checkout. A fresh single-client invalid-license
burst to the documented Sociobot verification endpoint returned HTTP 200 for
requests 1–30 and HTTP 429 for requests 31–40, each with `Retry-After: 4`.
Observed allowance: **30 requests per window**.

## Defects by severity

None found. No release-blocking, high, medium, or low defects remain from this
verification.
