# Independent verification #3 — FAIL

**Date:** 2026-08-28  
**Candidate:** `5e139a40afe65548921329e751b39417a9adeef6` (`5e139a4`)  
**Deployment:** <https://offline-payment-matchbox.sociobot.in/>  
**Result:** **FAIL** — the advertised Matchbox Plus one-time purchase cannot reach checkout. The free, local-first reconciliation workflow passes the functional, privacy, PWA, accessibility, response-policy, and performance checks below.

This was a new detached worktree at the exact candidate. `npm ci` ran before all checks. No product source, build output, deployment, billing state, or infrastructure was changed; this report and the handoff update are the only repository changes by this verifier.

## Candidate and live identity

A fresh exact production build byte-matches all 16 application resources served by the live deployment: root, privacy and terms pages, offline page, service worker, manifest, asset manifest, robots file, three icons, hashed JS, both hashed CSS files, and WebP artwork. The deployment configuration file is intentionally not a public route.

Representative SHA-256 values:

- /assets/app-xm0mtSGW.js: `7f61dd1b72857f94f55e645fb905dfcd2800260dc235a99563525fe70936b0ad`
- /assets/app-DJumuaVH.css: `c0dcf19e999f49342cc4e3fad22b0173e455d5f6d41cf0620953315b253a3c16`
- /sw.js: `d79a8b8381caa8c60407c02ef8139ea1a35da0c096a38af481f325bf244ff04b`
- /: `8e9850e6e3fce56513341b0cbd66089a237e6812fe33139ef5622d64173f8cc4`

The live static app is therefore the candidate, not a stale/deployment-only variant. The billing service was tested separately as an external dependency.

## Local gates

```text
npm ci                         PASS — 55 packages, 0 vulnerabilities
npm audit --audit-level=high   PASS — 0 vulnerabilities
npm test                       PASS — 18/18 tests in 4 files
npm run build                  PASS — TypeScript check and Vite production build
node --check dist/sw.js        PASS
npm run test:e2e               PASS — 17/17 Chromium 1.58.2 tests
```

There is no lint script in package.json; the available TypeScript check is part of the production build. Bundle output: app JS 31,450 bytes raw / 10,750 gzip; app CSS 15,341 / 4,337; legal CSS 15,900 / 4,456; artwork 43,436. All pass the stated static/PWA budgets.

## End-to-end, recovery, and privacy evidence

Normal reconciliation passed: import invoice and payment CSVs, review deterministic suggestions, confirm a suggestion, save a manual match with its audit note, export a report, refresh persisted IndexedDB state, and reload offline. The report covers matched invoices, open invoices, and unused payments.

Representative boundaries/recovery paths passed: quoted European-formatted currency, negative and thousands-formatted values, duplicate invoice IDs, impossible dates, equal-value reverse ambiguity, malformed backup data, minimum manual note, source-file opt-in, clear cancellation, and persistence. Specifically, an impossible payment date (`2026-99-99`) is rejected without a page error; two invoices competing for one payment show “Needs a closer look” and no quick-confirm; and `{"invoices":[null],"transactions":[],"matches":[]}` is rejected while the prior workspace remains.

A fresh live browser session made requests only to https://offline-payment-matchbox.sociobot.in. No analytics, remote fonts, bank calls, third-party scripts, or license API request occurred in the default workflow. The optional Sociobot license API is only used after a supplied token. Raw CSV text is absent from the default backup and retained locally only when the import opt-in is selected.

## PWA, accessibility, response policy, and performance

- Live Chromium acquired matchbox-v6. With networking disabled, live reload displayed the offline notice, heading, and 1200-pixel pre-cached artwork with no page error.
- A controlled update test against the exact built dist (only service-worker cache version synthetically changed from matchbox-v6 to matchbox-v7) displayed “An app update is ready. Reload” and, after reload, retired v6 and left matchbox-v7.
- Independent axe scans at 1440 x 900 and 390 x 844 on /, /privacy/, and /terms/, using WCAG 2 A/AA and 2.1 AA tags, found **zero serious or critical findings** (zero findings at any severity). Every page returned 200 with lang=en, one h1, one main, an appropriate title, and no console/page errors.
- First Tab visibly focuses “Skip to matcher” with a solid outline; Enter reaches main. Reduced-motion transition duration is 1e-05s. At 390 px, document clientWidth and scrollWidth are both 390.
- Entry points, manifest, service worker, offline page, and asset manifest are no-cache; hashed assets are one-year immutable. Live responses include HSTS, CSP with frame-ancestors 'none', Permissions-Policy, X-Frame-Options: DENY, nosniff, strict-origin Referrer-Policy, and manifest MIME application/manifest+json.
- Live mobile Lighthouse: Performance **98**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.2 s, TBT 180 ms, CLS 0, 77 KiB transfer.

## Current billing probes

The earlier absence of verifier throttling is **not reproduced**. An invalid-token 200-request sequential burst produced 32 HTTP 200 and 168 HTTP 429 responses; the first 429 was request 31. A subsequent 300-request burst at concurrency 50 produced 3 HTTP 200 and 297 HTTP 429. A 429 included Retry-After: 2 (and x-ratelimit-after: 2). The observed verifier threshold is 31 rapid requests, with required retry guidance.

The purchase path remains unavailable:

```text
GET https://api.sociobot.in/api/v1/products/offline-payment-matchbox/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The invalid-license verifier response is JSON and Cache-Control: no-store. No real license credential or payment token was used.

## Defects

### High — Matchbox Plus checkout is unavailable

The visible “Buy Matchbox Plus” control targets the required Sociobot checkout URL, but it returns the 404 above instead of hosted checkout. A user cannot buy the advertised $19 one-time unlock, so the purchase return and real verification path cannot be completed. Register/enable the production product in the Sociobot billing engine, then smoke-test checkout and return-token handling before release.

### Medium — Escape loses keyboard focus after closing manual match

After importing both files, choose “Choose another,” then press Escape. The dialog closes but document.activeElement becomes BODY rather than a useful matching control. The render that opens the dialog removes its trigger, so native focus restoration has nowhere suitable to return. This loses keyboard/screen-reader task context. Preserve a stable opener or restore focus to the corresponding replacement control.

### Medium — welcome artwork is fixed at 800 px tall rather than landscape

The 1200 x 800 artwork has width: 100% but no height reset from its HTML height=800. Its measured live box is **697.7 x 800 px** at desktop and **336 x 800 px** at 390 px mobile. It becomes a tall cropped portrait panel, materially contrary to the intended wide editorial still life. Render at 3:2 (for example, height: auto) and re-test both views.

### Low — header links are below the 44 x 44 target contract

Measured live boxes: desktop Home **172.7 x 30 px**, Workspace **76.5 x 21.6 px**, Your data **65.3 x 21.6 px**; mobile Home **156.8 x 30 px**. Footer controls pass. Give header links a 44 px minimum hit area.

## Release decision

Do not release this candidate as a paid product until checkout returns hosted checkout. The verifier rate-limit requirement now passes and must not be carried forward as a failure without new evidence. After checkout is enabled, repair dialog focus, artwork sizing, and header target size, then repeat live purchase and accessibility checks.
