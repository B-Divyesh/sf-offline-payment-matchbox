# Matchbox Ledger — polish 5 handoff

## Outcome: PASS

This repair closes all blocking and minor findings from adversarial reviews 1,
4, and 5. The PWA remains a local-first, static Vite deployment with the
existing ceramic-tray identity and original artwork.

## What changed

- Phone navigation now has a native 44 px **Menu** disclosure with Demo,
  Workspace, and Privacy. Desktop links use 44 px targets. The same header
  works on app, legal, and 404 routes.
- The one-click sample now consistently says it opens three freelancer invoices
  and three downloaded payments. `demo-sample` proves the isolated data set,
  including named records.
- `matching-signals` proves the exact visible evidence line for amount,
  currency, invoice reference, customer reference, and the 45-day date rule.
  Its demo-only fixtures also prove the 46-day fallback line.
- The service-worker cache version is `matchbox-v13`, so installed clients can
  receive the repaired shell. The catalog description is verb-first and 65
  characters long.

See [polish-5.md](polish-5.md) for every finding-to-change-to-evidence map.

## Verification

From a fresh clone of the repair commit:

```bash
npm ci
# Each of the 22 commands in .factory/claims.json was then run separately.
npm test                         # 23 passed
npm run typecheck                # passed
npm run lint                     # passed
npm run build                    # passed; dist/ created
npm run test:e2e                 # 56 passed
npm audit --audit-level=high     # 0 vulnerabilities
```

Local cold checks passed:

```bash
/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ .factory/evidence/polish-5-local-home
/opt/fleet/lib/verify-url.sh 'http://127.0.0.1:4173/?demo=1' .factory/evidence/polish-5-local-demo
```

Both URLs returned HTTP 200 with no console/page errors, one H1, `lang=en`, a
main landmark, zero missing image alt attributes, and zero unlabeled buttons.
The mobile screenshots confirm the first screen and direct demo content. Local
Lighthouse results are Performance 99, Accessibility 100, Best Practices 100,
and SEO 100 (`.factory/evidence/polish-5-lighthouse.json`).

The Playwright AxeBuilder integration scanned `/`, `/demo/`, `/privacy/`,
`/terms/`, and `/404.html` at desktop and phone widths with zero serious or
critical violations. A direct axe CLI run was attempted but cannot launch in
this image because its ChromeDriver targets Chrome 152 while the installed
Playwright Chromium is 145; the full browser integration scan passed.

## Production verification

The work-order static deployment completed successfully. `npm run
verify:identity` passed for the released commit. Cold live checks also passed:

```bash
/opt/fleet/lib/verify-url.sh https://offline-payment-matchbox.sociobot.in/ .factory/evidence/polish-5-live-home
/opt/fleet/lib/verify-url.sh 'https://offline-payment-matchbox.sociobot.in/?demo=1' .factory/evidence/polish-5-live-demo
E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e
```

The live root loaded in 876 ms and direct demo in 724 ms. Both returned 200,
with zero console/page errors, one H1, `lang=en`, a main landmark, zero missing
image alt attributes, and zero unlabeled buttons. The full live browser suite
passed all 56 tests. The cold live screenshots are in
`.factory/evidence/polish-5-live-home/` and
`.factory/evidence/polish-5-live-demo/`.

An unknown live URL returned the designed HTTP 404. Its response included the
expected CSP, `Permissions-Policy`, `Referrer-Policy`, and `X-Content-Type-
Options` headers.

## Run and deploy

```bash
npm ci
npm run dev
npm test
npm run test:e2e
npm run build
/opt/fleet/lib/deploy-static.sh offline-payment-matchbox dist
LIVE_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run verify:identity
```

## Known gaps and next steps

None. No user data leaves the browser during reconciliation. License checks are
the documented optional Sociobot request and are covered by the privacy claim.
