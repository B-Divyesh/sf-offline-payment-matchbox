# Independent product verification 4 — FAIL

**Date:** 2026-08-28

**Acceptance candidate:** `5e139a40afe65548921329e751b39417a9adeef6`

**Live URL:** <https://offline-payment-matchbox.sociobot.in/>

**Work order:** `offline-payment-matchbox-verify-4`
**Verdict:** **FAIL — do not release.** The live deployment is the candidate, so this is not a deployment-only failure.

## Release-blocking acceptance gates

### Critical — the required claims contract is absent

`.factory/claims.json` does not exist at the exact candidate commit. This was
checked before installation or general test execution. There are also no
`@claim:*` tests anywhere in the test suite. Therefore no claim tests could be
enumerated or run through the demo entry point. The work order explicitly makes
a missing claims file release-blocking.

Claim-like copy is nevertheless shipped without entries or sandbox tests,
including:

- “Parsing and matching stay in this browser” and “CSV only · nothing leaves this device.”
- “Ready offline” and “You are offline — matching still works.”
- README claims for offline continuation, report export, local persistence,
  opt-in-only source retention, deterministic suggestions, and absence of trackers.

These observations do not substitute for the mandatory tests. Every one is an
unlisted claim under the acceptance contract.

### Critical — first-read and one-click demo gates fail

Cold first screen at 1440 × 1000:

- **What it does:** the sentence explains that downloaded payments are matched
  to open invoices, although the headline “Bring two CSVs. Leave with
  certainty.” does not state that job directly.
- **Who it is for:** not stated. The researched user is a freelancer using an
  offline invoice tool or spreadsheet; “freelancer” does not appear.
- **What to click first:** not stated or visible. The only first-screen actions
  were the wordmark, Workspace, Your data, and Get Plus.
- **Sample demo:** there is no “Try it with sample data” action. Two “Sample
  CSV” controls lower on the page download separate files; they do not load a
  working ledger and still require manual re-upload and mapping.

`/demo` returns HTTP 200 but is only the normal empty workspace. It has no
sample records, persistent demo banner, Reset demo, or Start for real control.
It opens the same `matchbox-ledger` IndexedDB namespace as real use. There is no
demo code path, `?demo=1` handling, `.factory/demo.md`, or storage isolation.

Evidence:

- `.factory/evidence/verification-4-cold-desktop.png`
- `.factory/evidence/verification-4-mobile.png`
- `.factory/evidence/verification-4-browser.mjs`

## Other defects

### High — restoring a license hides the result and loses focus

In a fresh live context, opening Matchbox Plus, pasting
`qa-invalid-license-verification-4`, and selecting Restore purchase sent exactly
one request to the Sociobot verify endpoint. The endpoint correctly returned
HTTP 200 with `{"valid":false,"reason":"invalid","expires_at":null}`.

The license-state emissions then re-render the entire app. The open dialog is
replaced by a closed dialog, focus falls to the document body, and the text
“This license is no longer active.” exists only inside the hidden dialog. No
visible or live-region result tells the keyboard or screen-reader user what
happened. Reload correctly used the daily cached verdict and made no second
verify request, but the restore interaction itself is not usable.

Evidence: `.factory/evidence/verification-4-billing.mjs`.

### Medium — required site routes and metadata are incomplete

- `/not-a-real-page` returns the normal application with HTTP 200; there is no
  designed 404 route or way to distinguish an invalid URL.
- `/sitemap.xml` returns HTTP 404.
- `/`, `/privacy/`, and `/terms/` omit canonical links, Open Graph metadata,
  Twitter card metadata, apple-touch metadata, and a 1200 × 630 social image.
- `/demo` keeps the home title instead of “Demo — Matchbox Ledger.”
- Legal pages do not use the standard full header/footer skeleton. The product
  footer omits “Built by Param Factory” and a version/build identifier.
- The landing page does not present the required three plain facts or a visible
  three-step “How it works” section on the initial empty state.
- `.factory/copy-audit.md` is absent.

### Medium — one mobile link misses the touch-target contract

At 390 × 844 the home wordmark link measured 156.77 × 30 CSS px. Every other
visible interactive target passed the 44 × 44 scan, but this link does not meet
the product contract.

## Fresh quality-gate evidence

The checkout began from a clean detached candidate tree. No product source was
changed.

| Gate | Result |
|---|---|
| `npm ci` | PASS — 55 packages, 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 18/18 tests across 4 files |
| Type check | PASS — `tsc --noEmit` runs inside the build |
| Lint | N/A — no lint script or linter is present |
| `npm run build` | PASS — exact production build created `dist/` |
| `node --check dist/sw.js` | PASS |
| `npm run test:e2e` | PASS — 17/17 Playwright tests |

The repository tests passing cannot waive the missing claims and demo gates;
they contain no claim-tagged demo tests.

## End-to-end product exercise

Fresh live data used three invoices and three payments. The verifier confirmed
one strong suggestion, manually matched a second with the required note
“Checked against the client remittance email,” left one invoice open, and left
one payment unused. The downloaded report contained the header plus exactly:

- two `matched` rows with the correct suggested/manual methods and note;
- one `open` invoice row;
- one `unused_payment` row.

The note and ledger persisted across reload and offline reload. The default
import retained zero source files. A separate opt-in import retained exactly the
selected filename and CSV text in IndexedDB. Invalid `2026-99-99` input showed
the row-specific error, retained the mapping form, and accepted a corrected file
without a page error. A 5,000,001-byte input showed the 5 MB recovery message.
Repository regression tests also freshly covered ambiguous reverse contention,
malformed backup rejection, and manual-note enforcement.

No console error or uncaught page error occurred in these reconciliation,
invalid-input, mobile, legal, offline, or accessibility runs.

## Accessibility, mobile, and motion

- Independent Axe checks with WCAG 2 A/AA/2.1 AA tags on `/`, `/demo`,
  `/privacy/`, and `/terms/`, at 1440 px and 390 px: **0 violations**, including
  0 serious/critical.
- All tested pages had `lang=en`, one `<h1>`, and a `<main>` landmark.
- The first Tab exposed “Skip to matcher” with a 3 px cobalt focus outline;
  activation bypassed header navigation to the first workspace control.
- Normal Matchbox Plus dialog focus and Escape return worked. The restore-time
  re-render defect is separately reported above.
- Reduced-motion styles resolved transitions and animations to 0.01 ms.
- At 390 px the document width was exactly 390 px with no horizontal overflow;
  body text was 16 px. The wordmark touch-height defect is reported above.
- Evidence: `.factory/evidence/verification-4-focus.png` and browser harness.

## Privacy and outbound requests

- A complete default reconciliation flow made requests only to
  `https://offline-payment-matchbox.sociobot.in`.
- No analytics, remote fonts, bank calls, advertising, or third-party scripts
  were observed. No source CSV bytes were retained unless the opt-in was checked.
- License restore contacted only
  `https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify` with
  the fake license token; no reconciliation rows or totals were sent.
- The cached invalid verdict suppressed a second verification on reload.
- The buy link uses the required Sociobot endpoint. A HEAD smoke test returned
  HTTP 303 to hosted Dodo checkout; no provider is embedded in the app.
- This fresh 303 result supersedes the checkout 404 recorded in verification 3;
  that earlier billing/deployment failure no longer reproduces.
- Sign-in and product-owned server persistence/concurrency are not applicable.

The observed privacy behavior is good, but its public privacy claims still fail
the mandatory claims-manifest requirement.

## Billing endpoint rate limit

The public verify endpoint was exercised with a rapid invalid-token burst. The
first 30 requests in the measured burst returned 200. Request **31** returned
**429** with `Retry-After: 3`. A later request recovered to HTTP 200 with
`{"valid":false,"reason":"invalid","expires_at":null}`. This requirement passes.

## PWA, response policy, and caching

- Fresh online load installed `/sw.js`, controlled the page, and created
  `matchbox-v6`; persisted reconciliation survived an offline reload.
- A local production-build harness served an altered `matchbox-v7` worker.
  The app displayed “An app update is ready. Reload”; Reload activated v7 and
  removed v6. No console/page error occurred.
- Evidence: `.factory/evidence/verification-4-sw-update.mjs`.
- Live HTML, service worker, manifest, and asset manifest use `no-cache` on their
  configured routes. Hashed JS/CSS/WebP use one-year immutable caching. The
  manifest has `application/manifest+json`.
- HSTS, restrictive CSP, Permissions-Policy, Referrer-Policy, `nosniff`, and
  clickjacking protection are present. `/demo` and unknown navigation fallback
  routes receive the host default 30-second cache policy because no such routes
  are configured.

## Performance and bundle budgets

Fresh live Lighthouse mobile:

- Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**
- FCP **0.9 s**, LCP **1.3 s**, TBT **0 ms**, CLS **0**, Speed Index **0.9 s**
- Total transfer **78,597 bytes**

Production artifacts:

- App JS: 31,450 bytes raw / 10,750 gzip (budget 200 KB)
- App CSS: 15,341 / 4,337 gzip (budget 50 KB)
- Legal CSS: 15,900 / 4,456 gzip
- Hero WebP: 43,436 bytes (budget 300 KB)
- Remote font bytes: 0

Evidence: `.factory/evidence/verification-4-lighthouse.json`.

## Live deployment identity

Fresh SHA-256 comparisons matched local `dist/` and live responses for all 11
checked artifacts: `/`, `/privacy/`, `/terms/`, app JS, app CSS, legal CSS,
artwork, `/sw.js`, `/manifest.webmanifest`, `/asset-manifest.json`, and
`/offline.html`.

Representative exact matches:

- `/`: `8e9850e6e3fce56513341b0cbd66089a237e6812fe33139ef5622d64173f8cc4`
- app JS: `7f61dd1b72857f94f55e645fb905dfcd2800260dc235a99563525fe70936b0ad`
- `/sw.js`: `d79a8b8381caa8c60407c02ef8139ea1a35da0c096a38af481f325bf244ff04b`
- manifest: `50d34becc8ca7770c33d9fd1d4ec7a75d38354319ed74ab25cb4861de66d32fa`

The candidate failure is therefore present in the live product and is not a
stale or failed deployment.

## Required before another release candidate

1. Add `.factory/claims.json`; inventory every public/README claim; add exactly
   one observable `@claim:<id>` test for each, run only through isolated demo data.
2. Put plain first-screen copy and a visible “Try it with sample data” action on
   both desktop and mobile. Name freelancers and state the next action.
3. Implement a real `/demo` or `?demo=1` sandbox with realistic seeded records,
   separate storage, persistent banner, Reset demo, Start for real, and
   `.factory/demo.md`.
4. Preserve the open license dialog and announce the verify result; retain focus
   in the dialog until the user closes it.
5. Complete the 404, sitemap, metadata/social image, standard footer/build ID,
   copy audit, and mobile wordmark touch target.
