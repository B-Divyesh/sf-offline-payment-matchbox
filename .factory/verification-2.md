# Independent verification #2 — FAIL

**Date:** 2026-08-28

**Candidate:** `5e139a40afe65548921329e751b39417a9adeef6` (`5e139a4`)

**Deployment:** <https://offline-payment-matchbox.sociobot.in/>

**Result:** **FAIL** — the free reconciliation workflow is sound, but the visible
one-time purchase is unavailable and the production license-verification API
does not enforce the required burst rate limit. There are also independently
reproduced keyboard-focus, mobile target-size, and responsive-art defects.

This was a fresh run from a clean checkout already positioned at the exact
candidate. No product source or deployment file was modified. The only changes
made by this verifier are this report and the required handoff update.

## Candidate and live identity

The live static deployment is the candidate build. A fresh `npm run build`
produced the same SHA-256 as the live response for every public build artifact:
`/`, `/privacy/`, `/terms/`, `/offline.html`, `/sw.js`,
`/manifest.webmanifest`, `/asset-manifest.json`, `robots.txt`, all three icons,
the hashed app and legal CSS, hashed app JavaScript, and hashed WebP artwork.

Representative hashes:

- app JS `/assets/app-xm0mtSGW.js`:
  `7f61dd1b72857f94f55e645fb905dfcd2800260dc235a99563525fe70936b0ad`
- app CSS `/assets/app-DJumuaVH.css`:
  `c0dcf19e999f49342cc4e3fad22b0173e455d5f6d41cf0620953315b253a3c16`
- service worker `/sw.js`:
  `d79a8b8381caa8c60407c02ef8139ea1a35da0c096a38af481f325bf244ff04b`
- root HTML `/index.html`:
  `8e9850e6e3fce56513341b0cbd66089a237e6812fe33139ef5622d64173f8cc4`

This is not a stale- or wrong-deployment result.

## Repository gates

```text
npm ci                         PASS — 55 packages, 0 vulnerabilities
npm audit --audit-level=high   PASS — 0 vulnerabilities
npm test                       PASS — 18/18 tests in 4 files
npm run build                  PASS — tsc --noEmit + Vite 8.2.2 production build
node --check dist/sw.js        PASS
npm run test:e2e               PASS — 17/17 Chromium 1.58.2 tests
```

There is no separate lint script. The exact production build generated
`dist/index.html` and type-checks as part of `npm run build`.

## Independent product exercise

Passed locally and, for the release-critical paths, again on the live URL:

- Imported invoice and payment CSVs, confirmed a deterministic suggestion,
  made a manual match, and exported a reconciliation report containing matched,
  open-invoice, and unused-payment rows.
- A two-character manual note was rejected by form validation; the three-
  character boundary was accepted and exported with `method=manual`.
- IndexedDB state survived reload and an offline reload. Canceling Clear kept
  the workspace; accepting the specific confirmation removed it.
- Raw CSV text was absent from the default JSON backup and present only after
  selecting the import-time retention checkbox.
- Recovered after a header-only CSV, normalized duplicate headers, an unclosed
  quote, a file over the 5,000,000-byte limit, and an impossible calendar date.
  The invalid date remained in the mapping step and produced no page error.
- Rejected `{"invoices":[null],...}` without replacing the active workspace.
- Two same-value invoices competing for one payment both displayed “Needs a
  closer look”; neither offered quick confirmation.
- Plus behavior with an intercepted valid verifier response: the returned token
  was stored under `sb_license:offline-payment-matchbox`, removed from the URL,
  verified once, cached across reload, and enabled batch confirmation. No real
  credential or purchase token was used.

## PWA, privacy, accessibility, and performance

- Live first-party workflow requests were same-origin only. Source inspection
  found no analytics, remote fonts, third-party scripts, bank calls, or other
  external references apart from the documented Sociobot billing API.
- The live invalid-license response is JSON, CORS-authorized for the product
  origin, and `Cache-Control: no-store`.
- Live cache `matchbox-v6` supported fresh artwork reload, persisted-workspace
  reload, and offline `/privacy/` and `/terms/`. The manifest start URL returned
  200; 192 px and 512 px PNG icons have the declared dimensions.
- A controlled next service-worker response using the candidate `sw.js` with a
  version bump displayed “An app update is ready. Reload”; activation removed
  `matchbox-v6` and left `matchbox-v7` after reload.
- Independent live axe scans with WCAG 2 A/AA and 2.1 AA tags on `/`,
  `/privacy/`, and `/terms/` at 1440 x 900 and 390 x 844 found **zero violations
  at any severity**. Console and page-error collections were empty.
- The first Tab visibly focused the skip link with a 3 px cobalt outline. The
  Plus dialog received focus and returned it to its opener. Reduced-motion
  transition duration was 0.01 ms. The 390 px document had no horizontal
  overflow.
- Factory URL verifier: HTTPS 200, title present, `lang=en`, one `h1`, one main
  landmark, no missing image alternatives or button labels, and no errors.
- Lighthouse 12.8.2 against the live mobile URL: Performance **99**,
  Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.00 s,
  LCP 1.20 s, TBT 96 ms, CLS 0, Speed Index 1.05 s, 78,612 transfer bytes.
- Production app JS is 31,450 bytes raw / 10,750 gzip; app CSS 15,341 / 4,337;
  legal CSS 15,900 / 4,456; artwork 43,436 bytes. All stated budgets pass.
- Live HTML, service worker, manifest, and asset manifest use `no-cache`;
  hashed assets use one-year immutable caching. CSP, Permissions-Policy, HSTS,
  `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, and the web-manifest MIME
  type are present.

## Defects

### High — the production Matchbox Plus checkout is broken

The visible **Buy Matchbox Plus** link targets the contractually correct URL,
but a browser-equivalent GET returns HTTP 404 instead of hosted checkout:

```text
GET https://api.sociobot.in/api/v1/products/offline-payment-matchbox/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The advertised `$19 once` purchase cannot be completed. This blocks end-to-end
verification of a real purchase return and is not merely an unavailable test
credential. The product must be registered/enabled in the Sociobot billing
engine and the live link must reach checkout before release.

### High — required API burst rate limiting is absent

The production endpoint tested was:

```text
GET https://api.sociobot.in/api/v1/products/offline-payment-matchbox/verify?license=<invalid-test-token>
```

A rapid sequential run sent 200 requests in 14.1 seconds: **200/200 returned
HTTP 200**. A second burst sent 300 requests at concurrency 50 in 16.6 seconds:
**300/300 returned HTTP 200**. No response returned 429 and none supplied
`Retry-After`. The threshold was therefore **not observed through 500 rapid
requests**. This directly fails the work-order requirement that a burst start
returning 429 with `Retry-After`.

### Medium — Escape leaves focus inside the closed manual-match dialog

Open **Choose another**, then press Escape. The native dialog closes, but the
original trigger was removed during the pre-open rerender. `document.activeElement`
remains the dialog's `Close dialog` button even though the dialog is closed.
There is no visible focus at the user's prior task location and screen-reader/
keyboard context is not restored. The Plus dialog does return focus correctly.

### Medium — the landscape hero is rendered as an 800 px-tall crop

The source artwork is 1200 x 800 and CSS declares `aspect-ratio: 3 / 2`, but the
HTML `height="800"` wins because CSS does not reset height to auto. Measured
rendered boxes were 697.7 x 800 at 1440 px and 336 x 800 at 390 px, instead of
the intended landscape ratio. On mobile this creates a large portrait slice and
substantially lengthens the welcome screen, contrary to the design thesis.

### Low — header links miss the 44 px target contract

At 390 px the visible Matchbox Ledger home link is 156.8 x 30 px. At desktop,
the home link is 172.7 x 30 px, Workspace is 76.5 x 21.6 px, and Your data is
65.3 x 21.6 px. Footer and primary controls pass. The remaining header targets
need a minimum 44 px hit area.

## Required release actions

1. Register/enable the production billing product and smoke-test the hosted
   checkout, return token, and real verification path.
2. Enforce a documented verifier API burst limit that returns 429 with a valid
   `Retry-After` header, then repeat both sequential and concurrent probes.
3. Preserve and restore the manual-dialog trigger focus on Escape/cancel.
4. Correct the hero's rendered aspect ratio at desktop and mobile.
5. Expand all header link hit areas to at least 44 x 44 CSS px.
