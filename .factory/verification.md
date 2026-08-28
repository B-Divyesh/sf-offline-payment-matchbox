# Independent verification — FAIL

**Date:** 2026-08-28  
**Candidate:** `73428f91153c0ebaa4f6fd1a1dda9875ce3bf3a1` (`73428f9`)  
**Deployment:** https://offline-payment-matchbox.sociobot.in/  
**Result:** **FAIL** — core reconciliation correctness and invalid-input recovery do not meet the researched brief.

## Scope and environment

This was a fresh independent verification from a clean checkout at the candidate
commit. `npm ci` completed with 0 vulnerabilities. No product source, build, or
deployment files were changed during verification.

The live deployment is the candidate, not a deployment-only failure: SHA-256 of
the local production build and the live response matched for `/`, `/privacy/`,
`/terms/`, `/assets/app.js`, `/assets/app.css`, `/assets/legal.css`, `/sw.js`,
`/manifest.webmanifest`, `/offline.html`, and `/assets/matchbox-trays.webp`.

## Quality gates passed

- `npm test`: **8/8** unit tests passed.
- `npm run build`: passed (`tsc --noEmit && vite build`), producing `dist/`.
- `npm run test:e2e`: **6/6** Playwright tests passed.
- Independent axe scan, WCAG 2 A/AA/2.1 AA tags, at 1440 px and 390 px, on
  `/`, `/privacy/`, and `/terms/`: **0 serious/critical findings** (and no
  lower-severity findings).
- Independent normal flow: invoice CSV + payment CSV import, deterministic
  suggestion confirmation, audit-note manual match, CSV report export, reload
  persistence, and offline reload all worked. The report contained matched,
  open, and unused-payment rows as expected.
- Keyboard smoke test: the first Tab reaches the visible 3 px focus-ring skip
  link; Enter moves to `#main`; the Plus dialog receives focus and Escape
  closes it. At a fresh 390 x 844 context, the document was 390 px wide with
  no horizontal overflow. Reduced-motion style resolves transitions to 0.01 ms.
- PWA: a fresh install obtained a controller and `matchbox-v5` cache; offline
  reload retained the manual note. A controlled synthetic next service-worker
  response (`matchbox-v6`) produced the in-app “An app update is ready. Reload”
  toast and switched cache versions.
- Default browser session made only same-origin requests for `/`, app JS/CSS,
  and the local WebP; no analytics, fonts, bank, or other third-party request
  was observed. Source inspection confirms the only remote URL is the optional
  Sociobot license API, used only when a license token is present.
- Production budgets: app JS 28,182 bytes raw / 9,767 gzip; app CSS 15,232 /
  4,308; legal CSS 15,791 / 4,426; welcome WebP 43,436. All are within the
  stated static/PWA budgets. Lighthouse (local production build): Performance
  **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s,
  LCP 1.5 s, TBT 140 ms, CLS 0, 76 KiB transfer.

## Defects

### High — invalid ISO-shaped dates cause an uncaught page error and failed import recovery

**Reproduction:** import a valid invoice such as `INV-9,100`, then import this
payment CSV and accept the suggested mapping:

```csv
date,amount,description
2026-99-99,100,test
```

The parser accepts `2026-99-99` because it only checks the date shape. During
rendering the suggested transaction, `Intl.DateTimeFormat` throws
`RangeError: Invalid time value`. The app leaves the import-mapping panel on
screen, gives no actionable error, and the browser records a page error. This
violates the required invalid-input/recovery behavior and makes a malformed
bank export capable of breaking the normal reconciliation flow.

### High — one payment can be quick-confirmed against multiple invoices without being flagged ambiguous

**Reproduction:** import:

```csv
invoice_id,customer,invoice_date,amount,currency
INV-201,Alpha,2026-08-01,100.00,USD
INV-202,Beta,2026-08-01,100.00,USD
```

and:

```csv
date,amount,description,currency
2026-08-08,100.00,Payment received,USD
```

The review screen renders two “Possible match” rows, each pointing at the same
payment and each with an enabled **Confirm match** button. It renders zero
“Needs a closer look” warnings. The matcher only compares alternative payments
for one invoice; it does not detect the reverse ambiguity of multiple invoices
competing for one payment. The brief explicitly requires ambiguous matches to
be flagged and never silently merged. This is a financial-data correctness
failure: the user is invited to confirm an arbitrary invoice/payment pairing
without the required ambiguity warning.

### Medium — malformed backup structures can throw a page error instead of being rejected

**Reproduction:** use Import backup with:

```json
{"invoices":[null],"transactions":[],"matches":[]}
```

The shallow array-only validation accepts it and rendering throws
`TypeError: Cannot read properties of null (reading 'id')`; no recovery message
is shown. Imported backup records need schema/type validation before replacing
the active workspace.

### Medium — live response policy/caching is below the PWA contract

Live HTML, JS, CSS, manifest, offline page, and `sw.js` all return
`Cache-Control: public, must-revalidate, max-age=30`; asset names are also not
content-hashed. The host sends HSTS, `Referrer-Policy`, and `X-Content-Type-
Options`, but no Content-Security-Policy, Permissions-Policy, or frame-ancestor
protection. This does not explain the functional failure above, but it misses
the stated immutable-asset caching policy and leaves a sensitive local-finance
application without CSP defense in depth. The manifest is served as
`application/octet-stream` rather than a manifest MIME type.

### Low — several visible footer links have sub-44 px touch heights at 390 px

At 390 px, Privacy is 52 x 24 px, Terms 44 x 24 px, and Matchbox Plus is
109 x 36 px. They remain keyboard accessible and axe-clean, but do not meet
the product’s stated 44 x 44 CSS-pixel touch-target rule.

## Required resolution before release

1. Validate actual calendar dates at CSV import time; reject invalid dates with
   the row-specific error pattern already used for invalid amounts.
2. Detect and visibly block/review both directions of candidate ambiguity: one
   invoice to many payments **and** one payment to many invoices. Add regression
   tests for the reproduction above.
3. Validate full backup record schemas before assigning the new ledger, retaining
   the current workspace and reporting an actionable error on failure.
4. Have the deployment layer serve a restrictive CSP/Permissions-Policy and
   appropriate MIME/cache headers (immutable hashes for assets, no-cache for
   HTML/service worker), then re-verify headers.

