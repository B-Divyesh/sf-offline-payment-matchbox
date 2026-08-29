# Independent product verification 5 — FAIL

**Date:** 29 August 2026

**Acceptance candidate:** `33f16759fcafa0fbae9eadb9687d43cd3f24ee2d`

**Live URL:** <https://offline-payment-matchbox.sociobot.in/>

**Demo URL:** <https://offline-payment-matchbox.sociobot.in/demo/>

**Work order:** `offline-payment-matchbox-verify-5`
**Verdict:** **FAIL — do not release.** The live deployment exactly matches the candidate. This is not a deployment-only failure.

No product source was changed during verification.

## Release-blocking findings

### High — public promises are missing from the claims contract

All 11 entries that exist in `.factory/claims.json` pass. However, the public
product and documentation make additional promises that are not listed in that
file and have no exact `@claim:<id>` sandbox test:

- Matchbox Plus “remembers repeat column mappings” (`src/main.ts:131` and
  `src/main.ts:199`, `README.md:23`, `terms/index.html:32`). The `plus-batch`
  claim and test cover the price and batch confirmation only.
- “Clear local workspace” removes the browser workspace (`src/main.ts:127`,
  `privacy/index.html:32`). No claim or browser test exercises the destructive
  action and confirms IndexedDB is empty.
- The product includes no advertising cookies, behavioral analytics,
  third-party fonts, or tracking scripts (`privacy/index.html:36`). The
  `private-workflow` claim records request origins during one reconciliation
  flow; it does not inventory cookies, loaded scripts/fonts, or same-origin
  analytics, and its claim text does not include this broader promise.
- Buyers may restore a license on another device (`terms/index.html:32`). The
  `daily-license-check` claim covers an invalid fixture and daily caching, not a
  valid restored license unlocking Plus in a clean browser.

The attached claims contract says every visitor-reliable statement must be in
`.factory/claims.json` with exactly one observable sandbox test. It explicitly
makes unlisted claims a failed review, so the candidate cannot pass even though
the existing entries are green.

### Medium — standalone demo action misses the 44 px touch target

At 390 × 844, the visible **Review suggestions** link on `/demo/` measures
153.83 × 24 CSS px. It is a standalone primary navigation action, not an inline
prose link. The supplied accessibility and design contracts require interactive
targets to be at least 44 × 44 px.

The existing touch-target tests only scan the mobile header and footer, so they
miss this control. The populated demo has no page-level horizontal overflow,
and the rest of its tested task controls meet the target size.

## Mandatory first gates

### Claims listed in `.factory/claims.json`

Each command was run separately from the clean candidate checkout through the
documented `/demo/` entry point before general QA.

| Claim | Result | Observable check |
|---|---|---|
| `offline-reload` | PASS — 1 test | Service worker controlled a fresh demo; the sample reloaded offline. |
| `csv-report` | PASS — 1 test | Download had the header plus all matched, open, and unused sample rows. |
| `private-workflow` | PASS — 1 test | Confirm/export flow requested only the product origin. |
| `demo-isolation` | PASS — 1 test | Demo change did not enter the real workspace. |
| `local-persistence` | PASS — 1 test | Confirmed decision remained after reload. |
| `source-opt-in` | PASS — 1 test | Backups excluded source text by default and included it after consent. |
| `deterministic-review` | PASS — 1 test | Equal competing matches required review and had no quick-confirm action. |
| `json-backup` | PASS — 1 test | Export/reset/import restored all sample records and decisions. |
| `plus-batch` | PASS — 1 test | Fixture license showed $19 and batch-confirmed all clear suggestions. |
| `manual-note` | PASS — 1 test | Submission remained blocked until a note was entered. |
| `daily-license-check` | PASS — 1 test | Invalid result remained visible; reload made no second verification request. |

Aggregate result: **11/11 claim commands passed, 0 failed**. The release blocker
is the incomplete inventory described above, not a failure of an existing test.

### Cold first-read

The first-read gate passes on both desktop and 390 px mobile:

- What it does: **“Match payments to invoices from two CSVs.”**
- For whom: **“For freelancers who reconcile invoices in spreadsheets or offline tools.”**
- First action: **“Try it with sample data.”** It is visible without scrolling.
- One click opens `/demo/` with three invoices, three payments, one confirmed
  match, and two suggestions already visible.
- The persistent banner says the sample is separate and provides **Reset demo**
  and **Start for real**.

Evidence: `verification-5-cold-desktop.png`, `verification-5-mobile.png`,
`verification-5-demo-desktop.png`, and `verification-5-demo-mobile.png` in
`.factory/evidence/`.

## Clean local gates

| Gate | Result |
|---|---|
| Candidate and tree before QA | PASS — clean `33f16759fcafa0fbae9eadb9687d43cd3f24ee2d` |
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| `npm audit --audit-level=high` | PASS — 0 vulnerabilities |
| `npm test` | PASS — 20/20 across 5 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, no warnings |
| `npm run build` | PASS; exact Vite production build created `dist/` |
| `node --check dist/sw.js` | PASS |
| `npm run test:e2e` | PASS — 39/39 locally |
| Live `E2E_BASE_URL=... npm run test:e2e` | PASS — 39/39 |

## Independent end-to-end exercise

A fresh live `/demo/` context opened with tallies of 1 matched, 2 open, and 2
unused. A two-character manual note was rejected by native validation. A
three-character boundary note saved, appeared in the confirmed table, exported
in the CSV, persisted after reload, and remained available after an offline
reload. The report contained one header, two matched invoices, one open invoice,
and one unused payment. All requests during this flow were same-origin; there
were no console warnings, console errors, or page errors.

A separate fresh real workspace accepted a quoted customer containing a comma,
a leap-day date, and a European-formatted `€1.250,50` amount. It rejected an
impossible date with its source row, accepted a corrected payment immediately,
rejected an unclosed quoted field with a recovery instruction, and rejected a
5,000,001-byte file with the documented 5 MB message. No uncaught error occurred.

The repository tests additionally covered duplicate invoice IDs, currency and
amount mismatch, reverse contention for one payment, invalid backup retention,
source-file opt-in, report export, and JSON round trips.

Harness: `.factory/evidence/verification-5-live-independent.mjs`.

## Live deployment identity

Fresh SHA-256 comparisons matched local `dist/` and live bytes for all 14
checked artifacts: `/`, `/demo/`, `/privacy/`, `/terms/`, `404.html`, sitemap,
manifest, asset manifest, service worker, social image, both CSS bundles, app
JavaScript, and the hero WebP.

Representative exact matches:

- `/`: `fe070e41590cfd5f106ba874a0b1adfa7bb8c39408559c167c7baa736f89c163`
- `/demo/`: `180b89ea9939d2f2b01069d0cce55fac8aaf4f526d9b59fa6703889e6348555a`
- app JS: `319fc20ebead8fd8c03b50b61c570db29c808afdd66eb8d9ed24eed7e6faec78`
- `/sw.js`: `30f59a4f74e7a4b60c811e21cfedfe3be0e2fd5ac0ddf7c583b49922344b4af0`

## Accessibility, keyboard, mobile, and motion

- Worker `verify-url.sh` passed `/` and `/demo/`: HTTPS 200, correct title,
  `lang=en`, one H1, a main landmark, zero missing image alts, zero unlabeled
  buttons, and zero console errors.
- Live Playwright Axe checks passed five routes at desktop and 390 px with zero
  serious/critical findings. The independent home scan found zero Axe findings
  of any severity.
- Keyboard-only traversal reached the skip link, wordmark, navigation, Get Plus,
  and sample action in logical order. Focus used a visible 3 px cobalt outline.
  The Plus dialog trapped focus, closed with Escape, and restored focus to its
  trigger.
- Reduced-motion computed transition and animation durations were 0.01 ms.
- Both empty home and populated demo had document width 390 at a 390 px viewport;
  the confirmed-record table remained locally scrollable.
- The 24 px demo action is the outstanding touch-target defect.

## Privacy, network, and response policy

- The cold page requested only its document, same-origin JS, CSS, and hero WebP.
- The full matching/export/offline flow used only
  `https://offline-payment-matchbox.sociobot.in`.
- No remote font, analytics, bank, advertising, or third-party script request was
  observed. License verification sent only the fake token to the documented
  Sociobot endpoint.
- Live response headers include restrictive CSP, Permissions-Policy,
  `Referrer-Policy`, HSTS, `nosniff`, and both CSP `frame-ancestors 'none'` and
  `X-Frame-Options: DENY`.
- Entry HTML, manifest, and worker use `Cache-Control: no-cache`. Hashed JS, CSS,
  and WebP use `public, max-age=31536000, immutable`.
- `/not-a-real-page` returns HTTP 404 with the designed page. All crawled internal
  links return 200.

## Billing and request allowance

- The buy link is exactly the Sociobot checkout endpoint. A fresh HEAD request
  returned HTTP 303 to the hosted Dodo checkout; no provider is embedded.
- A real invalid-license browser check returned HTTP 200 with
  `valid:false/reason:invalid`; the visible status received focus. Reload used
  the daily cache, with request count remaining 1. No browser error occurred.
- A fresh same-client burst to the product verify endpoint returned 200 for
  requests 1–30. Request **31** returned **429** with **`Retry-After: 2`**.
  Observed allowance: 30 requests in the active window.
- Sign-in is not used, so Entra authority verification is not applicable.

Evidence: `.factory/evidence/verification-5-invalid-license.png`.

## PWA, performance, and budgets

- The live app installed `/sw.js`, was controlled by it, and used cache
  `matchbox-v7`. The demo opened only `demo:matchbox-ledger` in a fresh context.
- A production-build update simulation changed v7 to v8. The app displayed its
  update toast, Reload activated v8, and v7 was deleted. There were no errors.
- Fresh Lighthouse mobile: Performance 99, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.3 s, TBT 120 ms, CLS 0, total transfer 79 KiB.
- App JavaScript: 35,912 bytes raw / 12.13 KiB gzip. App CSS: 17,951 bytes raw /
  4.83 KiB gzip. Hero WebP: 43,436 bytes. Remote font bytes: 0.

Evidence: `.factory/evidence/verification-5-lighthouse.json` and the existing
candidate update harness `.factory/evidence/repair-sw-update.mjs`.

## Applicability

This is a static local-first PWA. Library/CLI consumer installation, owned
backend concurrency, server persistence, health/build endpoints, and sign-in
are not applicable. The only server-side product interaction is the Sociobot
billing service, whose request allowance was checked above.

## Required before another release candidate

1. Inventory every public promise in `.factory/claims.json`. At minimum, add
   isolated tagged tests for remembered column mappings, clearing IndexedDB,
   the tracking/cookie/font statement, and restoring a valid license in a clean
   browser—or remove/narrow those statements.
2. Give the standalone mobile **Review suggestions** link a minimum 44 × 44 px
   hit area and extend the touch-target regression test to all visible standalone
   controls on the populated demo.
