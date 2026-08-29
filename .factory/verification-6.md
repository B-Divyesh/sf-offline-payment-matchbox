# Independent product verification 6 — PASS

**Date:** 29 August 2026
**Tested commit:** `52cf8468c9323441ab45667c5134fa39a17b1f1e`
**Live URL:** <https://offline-payment-matchbox.sociobot.in/>
**Demo URL:** <https://offline-payment-matchbox.sociobot.in/demo/>
**Work order:** `offline-payment-matchbox-verify-6`

## Verdict

**PASS — release candidate accepted.** The live deployment is byte-for-byte the
production build from the tested commit for all 14 checked deployed artifacts.
The earlier deployment-only concern is not reproduced.

No product source was changed during this verification.

## Required first gates

### Claims contract

`.factory/claims.json` exists and declares 15 claims. From the clean checkout,
after `npm ci`, each exact command was run separately against the documented
local `/demo/` entry point. All passed (15/15; no failures):

| Claim | Result |
|---|---|
| `offline-reload` | PASS |
| `csv-report` | PASS |
| `private-workflow` | PASS |
| `demo-isolation` | PASS |
| `local-persistence` | PASS |
| `source-opt-in` | PASS |
| `deterministic-review` | PASS |
| `json-backup` | PASS |
| `plus-batch` | PASS |
| `plus-column-mappings` | PASS |
| `manual-note` | PASS |
| `daily-license-check` | PASS |
| `workspace-clearing` | PASS |
| `tracking-free` | PASS |
| `license-restore` | PASS |

The unit claims-contract test also passed, confirming the IDs are unique and
every declared tag occurs exactly once.

### Cold first read

The live page passes on desktop and 390 px mobile. Its first screen says:

- **What it does:** “Match payments to invoices from two CSVs.”
- **For whom:** “For freelancers who reconcile invoices in spreadsheets or offline tools.”
- **First action:** the visible one-click **Try it with sample data** button,
  with the outcome “Opens a separate ledger with three invoices.”

One click opens the populated, isolated demo. Its persistent banner identifies
it as sample data and exposes both **Reset demo** and **Start for real**.
Screenshots: `evidence/verification-6-cold-desktop.png` and
`evidence/verification-6-cold-mobile.png`.

## Clean local and live gates

| Gate | Result |
|---|---|
| Initial checkout | clean at `52cf8468c9323441ab45667c5134fa39a17b1f1e` |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| `npm test` | PASS — 20/20 tests, 5 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — generated `dist/` |
| `node --check dist/sw.js` | PASS |
| `npm run test:e2e` | PASS — 44/44 |
| `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e` | PASS — 44/44 |

The live root document, demo, privacy, terms, 404 page, sitemap, manifest,
asset manifest, worker, social image, both CSS files, app JavaScript, and hero
WebP all matched the locally built bytes. The root SHA-256 is
`b0c578ba27707f466413c1f051453142cf067ce3fb284b06ce5eba5e8eb2f432` and the
app JS SHA-256 is
`7f3a6a8063788095923eadcd0263974ddf7c0d7296fd8caf9f286069231516b4`.

## Product exercise

Fresh live-browser exercises verified:

- A realistic sample manual match rejects a two-character note, accepts a
  three-character note, shows it in the reconciled record, includes it in the
  CSV report, persists after reload, and remains usable after offline reload.
- A quoted customer name, EUR amount (`€1.250,50`), and leap-day invoice
  imported successfully. An impossible payment date, an unclosed quoted field,
  and a CSV above 5 MB each gave a specific error and left the next import
  attempt recoverable; no console or page errors occurred.
- Equal competing invoices are review-only rather than silently confirmed.
  JSON backup/import, raw-source opt-in, clear-local-workspace, demo isolation,
  Plus batch confirmation, column mappings, and license restore are covered by
  their observable claim tests.
- All discovered product links returned HTTP 200, except the intended Sociobot
  checkout endpoint, which correctly returned HTTP 303 to hosted checkout.

## Privacy, PWA, accessibility, and performance

- The live default and demo reconciliation/export flow made requests only to
  `https://offline-payment-matchbox.sociobot.in`; the tracking claim observed
  zero cookies, zero remote font loads, one same-origin application script, no
  XHR/fetch/event-source analytics, and GET-only resource requests.
- `verify-url.sh` passed live `/` and `/demo/`: HTTPS 200, title, `lang=en`,
  one H1, main landmark, no missing image alt text, no unlabeled buttons, and
  no browser console errors. Evidence is in `evidence/verification-6-home/`
  and `evidence/verification-6-demo/`.
- Axe found **zero serious or critical** violations on `/`, `/demo/`,
  `/privacy/`, `/terms/`, and `/404.html` at desktop and 390 × 844. Keyboard
  checks passed for skip link, visible focus, dialog focus and Escape return;
  mobile had no horizontal overflow and no visible target smaller than 44 px.
  Reduced-motion mode reduces transition and animation duration to `0.00001s`.
- The demo is controlled by `matchbox-v8` and reloads with its saved ledger
  while offline. A simulated `matchbox-v8` → `matchbox-v9` update displayed the
  in-app reload prompt, activated the new worker, removed the old cache, and
  produced no errors.
- Current mobile Lighthouse: **98 performance, 100 accessibility, 100 best
  practices, 100 SEO**; FCP 1.0 s, LCP 1.3 s, TBT 170 ms, CLS 0, transfer
  79 KiB. Report: `evidence/verification-6-lighthouse.json`.
- The exact production build is within static budgets: initial JS 35.90 kB raw
  / 12.13 kB gzip, CSS 18.03 kB raw / 4.84 kB gzip, hero WebP 43.43 kB.
  Live HTML, service worker, manifest, and asset manifest are `no-cache`; the
  hashed app asset is `public, max-age=31536000, immutable`.
- Live response headers include an effective self-only CSP (with the required
  Sociobot billing `connect-src`), `frame-ancestors 'none'`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer
  policy, HSTS, and restrictive permissions policy.

## Product-unlock allowance

This static PWA has no owned server endpoint. Its optional Sociobot license
verification endpoint was checked with a single-client invalid-token burst:
29 requests returned 200 and request 30 returned **429**; subsequent requests
also returned 429, each with `Retry-After: 0`. Thus the observed allowance is
29 rapid verification requests per current short window, with the required
rate-limit response header.

## Defects by severity

**None found.** No sign-in, library/CLI consumer, owned backend persistence,
or health/build endpoint is applicable to this static local-first PWA.
