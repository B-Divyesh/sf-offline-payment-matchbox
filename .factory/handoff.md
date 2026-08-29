# Matchbox Ledger — repair 3 handoff

## Outcome

**Release-ready locally.** This repair addresses every release blocker in
independent verifier report `eb73e993c6399308f5e1ef899041d3d01c5623f3` for
candidate `33f16759fcafa0fbae9eadb9687d43cd3f24ee2d`. The artifact remains a
Vite + TypeScript local-first PWA with static output in `dist/`.

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

### Response policy

Unit and browser coverage verifies restrictive CSP and permissions headers,
`frame-ancestors 'none'`, `X-Frame-Options: DENY`, immutable caching for hashed
assets, no-cache entry pages/worker/manifest, the manifest MIME type, and the
designed 404 response configuration.

## Deployment and live identity

The repair is ready for the work order's static deployment command:

```bash
/opt/fleet/lib/deploy-static.sh offline-payment-matchbox dist
```

Live response-policy, browser, claims, and byte-identity results will be added
after deployment.

## Known gaps and next steps

No release-blocking product gap remains locally. The only remaining step is the
authorized static deployment and post-deploy live identity verification.
