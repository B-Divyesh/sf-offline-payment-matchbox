# Matchbox Ledger — repair 4 handoff

## Outcome

**PASS.** Repair 4 resolves every finding in independent verification 7 while
preserving the researched brief, the local-first PWA deployment class, and all
previously passing product behavior.

The verifier's requested candidate
`20fe840e99f5384136ea626c20aa1b5770ecde94` was reproduced as an unavailable
Git object. The intended repository commit was
`20fe84da49e6c0a3402ba0c64bd7dd26e92ade84`; the differing characters made the
original work-order identity impossible to prove. This repair creates a new,
pushed candidate and gives every build a machine-readable identity at
`/release.json`. `npm run verify:identity` now compares the live product,
`package.json`, and the current full Git commit exactly.

The minor metadata defect was also reproduced: `package.json` reported 1.0.2
while four rendered footers reported 1.0.3. Version 1.0.3 is now defined once in
`package.json`; Vite injects it with the current Git commit into the app, demo,
privacy, terms, and 404 footers and emits the same values in `/release.json`.
Hard-coded page versions were removed.

## Root-cause repairs and regression coverage

- `release-metadata.ts` rejects missing/short SHAs and stops a build when an
  injected candidate differs from repository `HEAD`. The exact unavailable
  verifier candidate is a unit regression fixture.
- `vite.config.ts` emits `{ product, version, commit }` to `/release.json` and
  injects one release label into every rendered page.
- The Playwright release regression loads `/release.json`, compares it to
  `package.json`, validates a full 40-character SHA, and checks the same label
  on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`.
- The deployment policy serves `/release.json` as revalidated JSON. The service
  worker bypasses Cache Storage for it, so a prior install cannot report an old
  candidate. The response-policy and update tests cover both rules.
- `scripts/verify-live-identity.mjs` provides the repeatable post-deploy gate.
  README deployment instructions document it.
- The service-worker cache moved from `matchbox-v9` to `matchbox-v10`, ensuring
  installed clients receive this repair through the existing update prompt.
- A final live rerun exposed a 50 ms hash-focus race: rapid keyboard movement
  after activating the skip link could be pulled back to the route heading.
  Route focus now yields to any newer user focus, and the keyboard regression
  waits through the former race window before activating the Plus dialog.

## Verification evidence

Clean repository gates:

```text
npm ci                                               PASS — 58 packages, 0 vulnerabilities
npm audit --audit-level=high                         PASS — 0 vulnerabilities
19/19 exact .factory/claims.json commands            PASS
npm test                                             PASS — 23/23 tests in 6 files
npm run typecheck                                    PASS
npm run lint                                         PASS
npm run build                                        PASS — dist/index.html and release.json emitted
node --check dist/sw.js                              PASS
npm run test:e2e                                     PASS — 52/52 local Chromium 1.58.2
E2E_BASE_URL=<production> npm run test:e2e            PASS — 52/52 live
npm run verify:identity                              PASS — live version and full Git SHA matched
```

The 19 claim commands were run separately from `.factory/claims.json`, not only
as part of the aggregate suite. CSV matching/reporting, ambiguity, required
manual notes, persistence, backups, source opt-in, free and Plus boundaries,
demo isolation, license routing/privacy/cache, clearing, offline use, and
tracking-free behavior all passed.

Browser and accessibility evidence:

- Playwright axe scanned `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`
  at 1440 × 900 and 390 × 844. There were zero serious or critical findings.
- Keyboard tests passed the skip link, Enter activation, modal focus entry,
  rapid post-navigation focus movement, Escape close, and focus return. Every
  measured mobile header, footer, and standalone demo target was at least
  44 × 44 CSS px. The two route/focus tests also passed 20/20 repeated runs.
- The 390 px document had no horizontal overflow; the ledger table retained
  intentional internal scrolling. Reduced-motion transition duration was at
  most 0.00001 seconds.
- Factory URL verification passed production home and demo: HTTP 200, correct
  title and `lang=en`, one H1, one main, complete alt/button names, and no
  console or page errors. Screenshots and JSON are in
  `.factory/evidence/repair-4-live-home/` and `repair-4-live-demo/`.
- The live and local screenshots were visually inspected at desktop and 390 px;
  no clipping, overlap, unreadable text, or broken layout was observed.

PWA, privacy, and response evidence:

- A saved demo decision survived reload and an explicit offline reload. The
  welcome art also loaded from a fresh precache.
- A controlled `matchbox-v10` update displayed **An app update is ready**,
  activated after Reload, removed the old cache, retained the expected heading,
  and logged no errors. `/release.json` was confirmed absent from Cache Storage.
  Evidence: `.factory/evidence/repair-4-sw-update.json`.
- The default reconciliation and export flows made same-origin requests only;
  no cookies, analytics, third-party scripts, or remote fonts were observed.
- Live CSP, Permissions-Policy, HSTS, nosniff, frame denial, referrer policy,
  no-cache entry points, and one-year immutable hashed assets passed. Unknown
  URLs returned the designed 404 with HTTP 404.
- Fifteen local/live artifacts matched byte-for-byte by SHA-256, including
  `/release.json`, HTML routes, manifests, service worker, JS, CSS, art, and
  social image. Evidence: `.factory/evidence/repair-4-live-identity.json`.

Billing and external policy evidence:

- Production checkout returned HTTP 303 to the hosted Dodo checkout.
- A normal invalid-token verification returned HTTP 200 JSON with
  `valid: false`, `Cache-Control: no-store`, and CORS restricted to the product
  origin.
- A fresh sequential burst returned 200 for requests 1–30 and 429 for requests
  31–40. The first 429 supplied `Retry-After: 4`.
- No purchase was submitted and no real license or payment credential was used.
  Evidence: `.factory/evidence/repair-4-billing-policy.json`.

Performance and build size:

```text
Local Lighthouse     100 performance / 100 accessibility / 100 best practices / 100 SEO
Live Lighthouse      100 performance / 100 accessibility / 100 best practices / 100 SEO
Live FCP / LCP        0.9 s / 1.2 s
Live TBT / CLS        0 ms / 0
Live transfer         80 KiB
App JavaScript        38.47 KB raw / 12.78 KB gzip
App CSS               19.03 KB raw / 5.05 KB gzip
Hero artwork          43.43 KB
```

Reports: `.factory/evidence/repair-4-lighthouse.json` and
`.factory/evidence/repair-4-live-lighthouse.json`.

## Deployment

Static Azure deployment used the work-order output directory `dist/` and the
repository's `public/staticwebapp.config.json`. Deployment
`b4c5560a-5c76-45ec-b87e-2498b59960ab` succeeded before the evidence-only
handoff commit; the final committed tree is rebuilt and uploaded with the same
configuration so `/release.json` identifies the final pushed `main` commit.

Live: <https://offline-payment-matchbox.sociobot.in/>

Demo: <https://offline-payment-matchbox.sociobot.in/demo/>

## Known gaps and next steps

No release-blocking gap remains. A real paid purchase was not made because that
would create an external financial transaction; checkout reachability,
routing, return-token handling with fixtures, license restore, verification,
and throttling were all exercised without spending. Package/consumer, owned
backend concurrency, sign-in, AI, and API health checks do not apply to this
static local-first PWA.
