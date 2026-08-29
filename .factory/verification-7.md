# Independent product verification 7 — FAIL

**Date:** 29 August 2026

**Requested candidate:** `20fe840e99f5384136ea626c20aa1b5770ecde94`

**Available and functionally tested commit:** `20fe84da49e6c0a3402ba0c64bd7dd26e92ade84`

**Live URL:** <https://offline-payment-matchbox.sociobot.in/>

**Demo URL:** <https://offline-payment-matchbox.sociobot.in/?demo=1>

**Work order:** `offline-payment-matchbox-verify-7`

## Verdict

**FAIL — release candidate identity cannot be established.** The requested
candidate does not exist in this clone or on the named GitHub remote. GitHub's
commit API returns HTTP 422, “No commit found for SHA,” and fetching that exact
object returns `upload-pack: not our ref`. Remote `main` instead resolves to
`20fe84da49e6c0a3402ba0c64bd7dd26e92ade84`.

The deployed site is healthy and matches all 14 checked build artifacts from
that available remote tip byte-for-byte. That does not prove that the live site
matches the different candidate named by the work order. This provenance defect
is release-blocking even though no functional product defect was reproduced.

No product source was changed during verification. Only this report, handoff,
and independent evidence files were added.

## Mandatory first gates

### Claims contract

`.factory/claims.json` exists. After `npm ci`, all 19 exact `test` commands were
run separately from the clean available tip before the broader QA. All passed:

| Claim | Result |
|---|---|
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

The unit contract check also confirms unique claim IDs and exactly one matching
browser-test tag for every claim. Landing and README claim-bearing copy maps to
the declared tests.

### Cold first read

The live page passes at desktop and 390 px:

- **What it does:** “Match payments to invoices from two CSVs.”
- **For whom:** “For freelancers who reconcile invoices in spreadsheets or offline tools.”
- **What to click first:** visible **Try it with sample data**, followed by
  “Opens a separate ledger with three invoices.”
- The same first screen shows offline, on-device privacy, and price facts.

One click opens a populated ledger. The persistent banner says “Demo — sample
data, nothing is saved to your workspace” and provides **Reset demo** and
**Start for real**. Screenshots are under
`.factory/evidence/verification-7-home/` and
`.factory/evidence/verification-7-demo/`.

## Candidate and deployment identity

| Check | Evidence |
|---|---|
| Requested Git object | FAIL — `git cat-file` cannot resolve it |
| Exact fetch | FAIL — remote says `upload-pack: not our ref` |
| GitHub commit API | HTTP 422 — no commit found for requested SHA |
| Remote `main` | `20fe84da49e6c0a3402ba0c64bd7dd26e92ade84` |
| Live versus available build | PASS — 14/14 compared artifacts match SHA-256 |

The matching artifacts include root, demo, privacy, terms, 404, sitemap,
manifest, asset manifest, service worker, social image, both CSS entries, app
JavaScript, and hero artwork. The live root SHA-256 is
`4864486faff2a0264fcaa37a4a6fa50f3e41c9d2e896a23b9299f09e0fc84b4f`;
the live app JavaScript SHA-256 is
`a154e79eb8d726a9d6924c982687fb5b35e2c0bd1077b93726f3fd39bc49b6cd`.

## Clean local and browser gates

| Gate | Result |
|---|---|
| `npm ci` | PASS — 58 packages, 0 vulnerabilities |
| `npm test` | PASS — 20/20, 5 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — exact production build created `dist/` |
| `node --check dist/sw.js` | PASS |
| `npm run test:e2e` | PASS — 51/51 local |
| `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e` | PASS — 51/51 live |
| `verify-url.sh` root and demo | PASS — HTTPS 200, semantics, no console errors |

## End-to-end product exercise

- The sample immediately showed three realistic invoices and three payments.
- A two-character manual note was rejected. A clear audit note saved, appeared
  in the CSV report, persisted after reload, and remained visible offline.
- CSV export contained matched, open, and unused records. JSON round-trip,
  source-file opt-in, workspace clearing, undo, demo isolation, free use, Plus
  batch confirmation, repeat mappings, and license restore passed observable
  browser tests.
- A leap-day invoice, quoted customer, and European-formatted EUR amount
  imported correctly.
- An impossible payment date, unclosed quoted field, malformed backup, and a
  file over 5 MB each produced a specific error without a page failure. A valid
  replacement import worked immediately afterward.
- Equal competing matches were labelled for review and had no quick-confirm
  action, so ambiguity was not silently merged.
- Every discovered internal HTTP link returned 200. The intended checkout link
  returned 303 to the hosted payment page. Mail links were left as mail links.

Independent workflow output is in
`.factory/evidence/verification-7-live.json`.

## Privacy, headers, accessibility, PWA, and performance

- The full demo confirmation/export path made requests only to
  `offline-payment-matchbox.sociobot.in`; there were no cookies, remote fonts,
  analytics calls, or console/page errors.
- License checks use only the documented Sociobot verification URL and send no
  ledger rows or totals. Checkout uses the documented Sociobot endpoint.
- Live headers include self-only CSP with the documented billing connection,
  `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, HSTS, strict
  referrer policy, and a restrictive permissions policy.
- HTML, service worker, manifest, and asset manifest use `no-cache`; hashed
  assets use `public, max-age=31536000, immutable`.
- Axe found zero serious/critical findings on root, demo, privacy, terms, and
  404 at desktop and 390 px. Keyboard skip-link, dialog focus/return, visible
  focus, headings, landmarks, labels, alt text, and 44 px touch targets passed.
  The mobile document width was exactly 390 px. Reduced-motion transition
  duration was `0.00001s`.
- Offline reload retained the sample and manual decision. A simulated
  `matchbox-v9` to `matchbox-v10` worker update displayed “An app update is
  ready,” activated after reload, removed the old cache, and logged no errors.
- Fresh mobile Lighthouse: **97 performance, 100 accessibility, 100 best
  practices, 100 SEO**; FCP 0.90 s, LCP 1.20 s, TBT 205.5 ms, CLS 0, total
  transfer 81,469 bytes. Evidence:
  `.factory/evidence/verification-7-lighthouse.json`.
- Production assets remain within the contract: app JS 38.38 KB raw / 12.76 KB
  gzip, app CSS 19.03 KB raw / 5.05 KB gzip, hero WebP 43.44 KB.

The manifest has 192 px and 512 px icons, a maskable purpose, standalone
display, scoped start URL, and matching theme/background colours.

## Request allowance

This static PWA has no owned backend. For the external product-unlock endpoint,
a fresh single-client burst received 200 for requests 1–30. Request 31 returned
**429** with `Retry-After: 4`. The observed short-window allowance is therefore
30 successful rapid requests before throttling.

No sign-in, CLI/library consumer, owned persistence service, concurrency test,
or health endpoint applies.

## Defects by severity

### Release-blocking

1. **The specified candidate commit is unavailable and cannot be verified or
   matched to production.** Expected:
   `20fe840e99f5384136ea626c20aa1b5770ecde94`. Actual remote tip and tested
   build: `20fe84da49e6c0a3402ba0c64bd7dd26e92ade84`.

### Minor

1. The package metadata reports version `1.0.2`, while the rendered footer
   reports `v1.0.3 · polish 1`. This does not affect behavior, but weakens build
   identity clarity.

No functional, privacy, accessibility, PWA, or performance release blocker was
found in the available build.
