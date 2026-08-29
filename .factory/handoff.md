# Matchbox Ledger — repair 5 handoff

## Outcome

The release blocker from independent verification 10 is repaired. The
`Start for real` transition now exposes a deterministic workspace-ready
boundary, and an in-flight license verification keeps the storage namespace
that was active when it began. The regression forces the former timing window
with a delayed license response and requires ten consecutive passes.

The researched brief, local-first PWA deployment class, matching behavior,
visual system, billing route, and previously passing flows are unchanged.

## Finding and repair

Independent verifier report `.factory/verification-10.md` documented one
release blocker for candidate `1b7eb438a59618924011dbe8cefc9a7bd011affd`:

- Production `@claim:demo-isolation` failed intermittently because its snapshot
  raced the expected real-license refresh after **Start for real**.
- The original live command was reproduced before edits. Result: **7 passed,
  3 failed**. Each failure changed only
  `sb_license:offline-payment-matchbox:verdict`; the real IndexedDB ledger and
  real mapping sentinel remained unchanged.

Root-cause changes:

- `#app[data-workspace-ready]` remains `false` until license initialization has
  settled, so the real workspace has an observable transition boundary.
- **Start for real** immediately becomes busy and disabled while the demo
  database is cleared and navigation begins.
- License verification captures its verdict key before awaiting the network.
  A storage-generation guard prevents a response from updating UI state after
  a namespace reconfiguration.
- `@claim:demo-isolation` now intercepts and delays the expected real-license
  response, waits for the real workspace boundary, byte-compares the protected
  real ledger/mapping/token state, and separately verifies exactly one known
  verdict refresh.
- `npm run test:demo-isolation` repeats that regression ten times and fails if
  any repetition fails.

Package version is `1.0.5`; the PWA cache is `matchbox-v16`.

## Clean verification

Run from `/work/repo`:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
npm run test:demo-isolation
npm audit --audit-level=high
SW_UPDATE_EVIDENCE=.factory/evidence/repair-5-sw-update.json npm run verify:sw-update
```

Results on 2026-08-29:

- Clean install: 58 packages, 0 vulnerabilities.
- Unit/integration and policy tests: **23/23 passed** in 6 files.
- Typecheck: passed.
- Lint: passed.
- Production build: passed; `dist/` contains `index.html`.
- Browser suite: **56/56 passed**. This includes all 22 claims, real CSV
  import/mapping/matching/export, error recovery, desktop and 390 px layouts,
  keyboard/focus, touch targets, reduced motion, Axe, privacy request logs,
  offline reload, routing, and legal pages.
- Forced delayed-response demo isolation: **10/10 passed** after the pre-fix
  reproduction failed 3/10.
- Dependency audit: 0 vulnerabilities.
- Production output: app JS 39,444 B raw / 13.02 kB Vite gzip; app CSS
  20,240 B raw / 5.26 kB Vite gzip; hero WebP 43,436 B.
- Controlled service-worker update: `matchbox-v16` showed “An app update is
  ready. Reload,” activated `matchbox-v16-update-check`, removed the old cache,
  and did not cache `/release.json`.
- Worker URL checks on `/` and `/demo/`: HTTP 200, one H1, `lang=en`, main
  landmark, complete image alt text, labelled buttons, and zero console/page
  errors at desktop and 390 px.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 0 ms, CLS 0, transfer 80 KiB.

Evidence:

- `.factory/evidence/repair-5-local-home/`
- `.factory/evidence/repair-5-local-demo/`
- `.factory/evidence/repair-5-lighthouse.json`
- `.factory/evidence/repair-5-sw-update.json`

The claims inventory remains `.factory/claims.json`; the exact repeated race
gate is encoded in `package.json`. Library/package consumer, owned-backend
concurrency, and sign-in-provider checks do not apply to this static PWA.

## Deployment verification

Deployment uses the work order's static configuration:

```bash
npm ci && npm test && npm run build
/opt/fleet/lib/deploy-static.sh offline-payment-matchbox /work/repo/dist
```

After deployment, verify with:

```bash
LIVE_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run verify:identity
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:demo-isolation
```

## Known gaps and next steps

No known product or release-blocking gaps remain. A live checkout purchase was
not created because that would cause an external financial action; billing
routing, verification request privacy, restore behavior, and daily caching are
covered with recorded browser fixtures, while the registered live API boundary
was preserved from the accepted candidate.
