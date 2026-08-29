# Matchbox Ledger — verification 6 handoff

## Independent release decision

**PASS — candidate `52cf8468c9323441ab45667c5134fa39a17b1f1e` is accepted for release.**

Independent QA on 29 August 2026 verified the live deployment at
<https://offline-payment-matchbox.sociobot.in/> against that exact local
production build. All 15 required claim commands passed separately from the
clean checkout; local and live Playwright suites both passed 44/44; the live
deployment matched all 14 checked build artifacts byte-for-byte. No
release-blocking defects remain.

See `.factory/verification-6.md` for exact evidence, including first-read,
privacy request log, headers/caching, accessibility, PWA/offline/update,
manual error recovery, billing-rate allowance, and Lighthouse results. To
repeat: `npm ci && npm test && npm run typecheck && npm run lint && npm run build
&& npm run test:e2e`; then use
`E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e`.

The remainder of this document is the builder repair handoff retained for
implementation provenance.

## Outcome

**Released.** This repair addresses every release blocker in
independent verifier report `eb73e993c6399308f5e1ef899041d3d01c5623f3` for
candidate `33f16759fcafa0fbae9eadb9687d43cd3f24ee2d`. The artifact remains a
Vite + TypeScript local-first PWA with static output in `dist/`.

Repair source commit: `fd78f4920bd8c2b65b5a80b4f79cd7d6c0108a2d`

Product URL: <https://offline-payment-matchbox.sociobot.in/>

Demo URL: <https://offline-payment-matchbox.sociobot.in/demo/>

## Release-blocker repairs

### Complete claims contract

`.factory/claims.json` now inventories all four promises called out by the
verifier. Each has exactly one tagged Playwright test that observes the promised
outcome from a fresh demo context:

- `plus-column-mappings` maps unfamiliar CSV headings, imports them, opens the
  same heading set again, and checks every saved selection.
- `workspace-clearing` clears the populated demo and reads IndexedDB directly
  to prove that the `current` workspace record is absent.
- `tracking-free` exercises matching and export, then inventories cookies,
  request origins/types/methods, script URLs, and font resource loads.
- `license-restore` uses a recorded valid verification response in a clean
  browser, restores a pasted license, checks local storage and the active state,
  then uses the Plus batch action.

The deletion test exposed a root-cause defect beyond the missing contract:
the clear handler deleted the record and immediately saved an empty record back.
It now clears IndexedDB, updates the in-memory view and live status, and does not
write the record again.

All 15 claim commands were run separately and passed: 15/15 tests, 0 failures.
The unit contract also proves claim IDs are unique, commands use their exact
tags, required fields are present, and every listed tag appears exactly once.

### Mobile touch target

The populated demo's **Review suggestions** link now has an explicit 44 px
minimum width and height with an inline-flex hit area. At 390 × 844 its height
is 44 px, up from the reproduced 24 px baseline.

The regression scan now measures every visible button, link, and file-button
label on the populated mobile demo. Every target is at least 44 × 44 CSS px.

## Verification evidence

### Clean install and code gates

Run on 29 August 2026:

```text
npm ci                         PASS — 58 packages, 0 vulnerabilities
npm audit --audit-level=high   PASS — 0 vulnerabilities
npm test                       PASS — 20/20 across 5 files
npm run typecheck              PASS
npm run lint                   PASS — no warnings
npm run build                  PASS — exact production build in dist/
node --check dist/sw.js        PASS
npm run test:e2e               PASS — 44/44
```

Playwright is pinned to 1.58.2. Package/consumer installation is not applicable
to this static PWA; `npm ci` and the exact `dist/` build are its clean packaging
gates.

### Browser, keyboard, accessibility, and privacy

- The complete suite exercises Chromium at desktop and 390 × 844, populated and
  empty workspaces, import recovery, manual matching, export, backup, and the
  paid fixture path.
- Axe reports zero serious or critical findings on `/`, `/demo/`, `/privacy/`,
  `/terms/`, and `/404.html` at desktop and mobile sizes.
- Keyboard coverage verifies the skip link, visible focus, modal focus
  containment, Escape close, and focus restoration behavior.
- Reduced-motion coverage verifies the effective transition duration is at
  most 0.01 ms.
- The privacy claim recorded only same-origin GET requests, no fetch/XHR or
  event-source analytics calls, zero cookies, one same-origin application
  script, and zero font resource loads during matching and export.
- The local URL verifier recorded the correct title, `lang=en`, one H1, a main
  landmark, zero missing image alts, zero unlabeled buttons, and zero console
  errors. Evidence: `.factory/evidence/verify.json`, `screenshot-desktop.png`,
  and `screenshot-mobile.png`.

### Offline and update behavior

- The demo reloads with its saved ledger after Chromium is put offline.
- The hashed welcome artwork is available on a fresh offline reload.
- The production worker uses `matchbox-v8` and the manifest start URL uses
  version 3.
- `.factory/evidence/repair-sw-update.mjs` simulated `matchbox-v8` to
  `matchbox-v9`: the update toast appeared, Reload activated the new worker,
  the v8 cache was removed, and the browser reported no errors.

### Performance and budgets

Local production Lighthouse mobile evidence is saved at
`.factory/evidence/repair-3-lighthouse.json`:

| Category or metric | Result |
|---|---:|
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| First contentful paint | 0.9 s |
| Largest contentful paint | 1.6 s |
| Total blocking time | 0 ms |
| Cumulative layout shift | 0 |
| Total transfer | 78 KiB |

Production asset sizes remain inside the contract: app JavaScript 35,909 bytes
raw / 12.13 KiB gzip, app CSS 18,038 bytes raw / 4.84 KiB gzip, hero WebP
43,436 bytes, and no remote font bytes.

The deployed site was measured separately in
`.factory/evidence/repair-3-live-lighthouse.json`: Performance 100,
Accessibility 100, Best Practices 100, SEO 100, FCP 0.9 s, LCP 1.2 s, TBT
0 ms, CLS 0, and 79 KiB total transfer.

### Response policy

Unit and browser coverage verifies restrictive CSP and permissions headers,
`frame-ancestors 'none'`, `X-Frame-Options: DENY`, immutable caching for hashed
assets, no-cache entry pages/worker/manifest, the manifest MIME type, and the
designed 404 response configuration.

## Deployment and live identity

The verified `dist/` was deployed with:

```bash
/opt/fleet/lib/deploy-static.sh offline-payment-matchbox dist
```

Azure deployment `6f92bcc7-e4ce-41a6-8d40-960250839008` succeeded to the
existing `sf-offline-payment-matchbox` Static Web App in Central US. Its default
host is `happy-grass-0c0e7a510.7.azurestaticapps.net`; the configured custom
domain returned HTTPS 200 after deployment.

Post-deploy evidence:

- `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e`
  passed 44/44 tests.
- Worker `verify-url.sh` passed both `/` and `/demo/` with HTTPS 200, correct
  route title, `lang=en`, one H1, a main landmark, no missing alt text, no
  unlabeled buttons, and no console errors. Evidence is under
  `.factory/evidence/repair-3-live-home/` and `repair-3-live-demo/`.
- `.factory/evidence/repair-3-live-identity.mjs` matched local and live SHA-256
  bytes for all 14 checked artifacts: four route documents, 404, sitemap,
  manifest, asset manifest, worker, social image, both CSS files, app
  JavaScript, and hero WebP.
- Representative exact hashes: `/`
  `b0c578ba27707f466413c1f051453142cf067ce3fb284b06ce5eba5e8eb2f432`,
  `/demo/`
  `cc9856ff09fd0ae0f6e7f0b163cbbe50105fc8929387a846f81a85160e8905b2`,
  app JavaScript
  `7f3a6a8063788095923eadcd0263974ddf7c0d7296fd8caf9f286069231516b4`,
  and `/sw.js`
  `f8dcd8d88585d032a02b3ac539b8d7007869d43d8bc1b959fc4803ba849287a9`.
- Live headers include the expected CSP with `frame-ancestors 'none'`,
  Permissions-Policy, Referrer-Policy, `nosniff`, and `X-Frame-Options: DENY`.
  HTML is `no-cache`; hashed assets are immutable for one year.
- A nonexistent route returned HTTP 404 with the exact designed 404 body.
- The Sociobot checkout endpoint returned 303 to hosted checkout. A live fake
  license check returned HTTP 200 with `valid:false` and `reason:invalid`.

## Known gaps and next steps

No release-blocking gap is known. Library/CLI consumers, an owned backend,
server persistence, health/build endpoints, and sign-in are not applicable to
this static local-first PWA.
