# Independent verification 10 — FAIL

**Verified:** 2026-08-29  
**Candidate:** `1b7eb438a59618924011dbe8cefc9a7bd011affd`  
**Live URL:** <https://offline-payment-matchbox.sociobot.in/>  
**Decision:** **FAIL**

The deployed files are byte-for-byte the candidate, and the product itself is
functional, private, accessible, offline-capable, and fast. Release is still
blocked because a mandatory claim test is not reliable on production. The live
full suite failed `@claim:demo-isolation`; a ten-run live repetition failed
5/10. The acceptance contract says any failing claim test blocks release.

## Cold first read

A new 1440 × 900 context with no stored state showed:

- **What:** “Match payments to invoices from two CSVs.”
- **For whom:** “For freelancers who reconcile invoices in spreadsheets or
  offline tools.”
- **First click:** “Try it with sample data,” immediately followed by “Opens a
  separate sample workspace with three invoices and three payments.”

The action was in the first viewport. One click opened `/?demo=1`, whose H1 was
“Review the sample payment matches.” The page immediately showed named sample
invoice/payment records and the persistent “Demo — sample data, nothing is
saved to your workspace” banner with **Reset demo** and **Start for real**.
There were no console or page errors. The first-read gate passes. Evidence:
`.factory/evidence/verification-10/live/first-read-desktop.png` and
`after-one-click-demo.png`.

The live mobile first-screen assertions also passed at 390 × 844: job,
audience, sample action, click explanation, and all three privacy/offline/price
facts were above the fold.

## Mandatory claims gate

After `npm ci` in the clean candidate checkout, I ran every `test` command in
`.factory/claims.json` separately and exactly as declared. All 22 local demo
commands passed. Individual logs and exit codes are in
`.factory/evidence/verification-10/claims/`.

| Claim | Clean candidate result |
| --- | --- |
| `offline-reload` | PASS |
| `demo-sample` | PASS |
| `matching-signals` | PASS |
| `csv-report` | PASS |
| `csv-match` | PASS |
| `private-workflow` | PASS |
| `demo-isolation` | PASS locally; **FAIL intermittently live** |
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

The complete local suite passed 56/56. Against production, the same complete
suite passed 55/56 and failed `@claim:demo-isolation`. An immediate isolated
rerun passed, but `--repeat-each=10` then produced 5 passes and 5 failures,
confirming a race rather than clearing the failure.

On each failure, the real workspace IndexedDB record and real saved mapping
were unchanged, but the real license verdict changed from the seeded valid
sentinel to an invalid verdict with a new `checkedAt`. After **Start for real**
navigates away from demo, real-page initialization starts an asynchronous live
Sociobot license check. Depending on response timing, that real verdict is
rewritten before or after the claim snapshot. This is not evidence that sample
invoice/payment data leaked into the real ledger, but it makes the required
claim test nondeterministic on the actual deployment.

## Clean checkout and end-to-end checks

| Check | Fresh result |
| --- | --- |
| Install | `npm ci` passed; 58 packages installed; 0 vulnerabilities |
| Unit/integration | `npm test`: 23/23 passed in 6 files |
| Type | `npm run typecheck`: passed |
| Lint | `npm run lint`: passed |
| Production build | `npm run build`: passed; `dist/` created |
| Complete local browser suite | 56/56 passed |
| Complete live browser suite | **55/56 passed; 1 claim failure** |
| Live accessibility/site subset | 25/25 passed |
| Dependency audit | `npm audit --audit-level=high`: 0 vulnerabilities |

The passing live scenarios exercised the actual job: importing invoice and
payment CSVs, mapping columns before save, deterministic suggestions, quick
confirmation, manual selection with a required audit note, report CSV export,
JSON backup/restore, local persistence, undo/clear behavior, and offline
reload. Invalid `2026-99-99` dates and malformed backup records were rejected
without page errors and left the current workspace recoverable. Two invoices
competing for one payment were flagged for review with no quick-confirm
button. The 45-day matching boundary and 46-day fallback both passed.

## Deployment identity, privacy, and server boundary

- `npm run verify:identity` reported product `offline-payment-matchbox`, version
  1.0.4, and the exact candidate SHA. SHA-256 comparison matched all 21 served
  build files, including HTML routes, hashed JS/CSS/art, worker, manifest,
  release metadata, icons, legal pages, and social image.
- The cold page and the complete confirm/export demo flow requested only
  `offline-payment-matchbox.sociobot.in`. No cookies, analytics, remote fonts,
  tracking scripts, or console/page errors were observed. License checks are
  the separately documented optional Sociobot request.
- Root, demo, privacy, and terms return 200 with restrictive CSP,
  `frame-ancestors 'none'`, Permissions-Policy, HSTS, nosniff, referrer policy,
  and no-cache HTML. Hashed JS/CSS use one-year immutable caching. The worker,
  manifest, and release JSON use no-cache; the manifest MIME is correct. A
  missing route returned the designed HTTP 404. All same-origin links returned
  200.
- The product has no owned backend or sign-in. The Sociobot verification API
  allowed 30 sequential requests from one client; requests 31–40 returned 429
  with `Retry-After: 4`. No checkout or real purchase was created.

## Accessibility, mobile, PWA, and performance

- Playwright AxeBuilder found zero serious/critical findings on `/`, `/demo/`,
  `/privacy/`, `/terms/`, and `/404.html` at desktop and 390 px mobile widths.
  Every route had one H1, `lang=en`, a main landmark, and no console/page
  errors. The worker `verify-url.sh` passed root and demo; JSON and screenshots
  are in `.factory/evidence/verification-10/verify-home/` and `verify-demo/`.
- Keyboard-only checks passed for the visible skip link, hash destination
  focus, modal entry, Escape close, and focus return. Mobile controls met the
  44 px target tests; the populated 390 px page had no horizontal overflow.
  Reduced-motion transition duration was effectively zero.
- The live worker controlled the app with `matchbox-v15`; the populated demo
  reloaded offline at 390 px with its records, banner, and offline status.
  A controlled production-build `v15 → v16` update displayed “An app update is
  ready. Reload,” activated the new cache, and removed the old cache.
- Production output: app JS 39,187 B raw / 12,769 B gzip; app CSS 20,240 B raw /
  5,277 B gzip; hero WebP 43,436 B. Fresh mobile Lighthouse: Performance 99,
  Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.3 s, TBT
  130 ms, CLS 0, total transfer 80 KiB. Evidence:
  `.factory/evidence/verification-10/lighthouse.json`.

Library/CLI packaging, backend concurrency/persistence, and sign-in-provider
checks do not apply to this static PWA.

## Defects by severity

### Release-blocking — live `demo-isolation` claim test is nondeterministic

**Reproduction**

```bash
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in \
  npm run test:e2e -- --grep @claim:demo-isolation --repeat-each=10
```

Observed: 5 passed, 5 failed. The failing assertion shows only
`sb_license:offline-payment-matchbox:verdict` changing from the pre-seeded
value to the real invalid verification response; the real ledger and saved
mapping remain unchanged. The full live suite independently failed the same
claim once (55 passed, 1 failed).

The test must isolate, await, or explicitly exclude the expected real-license
refresh after leaving demo, and then pass reliably against production. Until
that happens, this candidate cannot satisfy the claims acceptance gate.

No additional high, medium, or low product defects were found.
