# Matchbox Ledger — repair handoff

## Outcome

Release-blocking findings from verifier report commit
`e6b2e04b0f2ff35d7e6677c0eb2b07bdcdbea032` for candidate
`73428f91153c0ebaa4f6fd1a1dda9875ce3bf3a1` are repaired. The researched
brief, static PWA artifact class, local-first storage, free workflow, and Plus
license behavior are unchanged.

## Repairs

- CSV dates are normalized only when they represent a real calendar date.
  Impossible payment dates such as `2026-99-99` now produce the existing
  row-specific, actionable import error without mutating the ledger or throwing
  a page error. Invalid mapped invoice and due dates are rejected as well.
- Matching now checks contention in both directions. Similar payments competing
  for one invoice and similarly plausible invoices competing for one payment are
  marked “Needs a closer look,” have no quick-confirm action, and require the
  auditable manual path. If one invoice has materially stronger reference
  evidence, only that invoice remains eligible for quick confirmation; weaker
  contenders are blocked.
- Backup import validates complete invoice, payment, match, retained-source, and
  timestamp schemas, actual dates, uniqueness, and match references before
  replacing the active workspace. Invalid JSON structures retain current data
  and explain that nothing changed.
- Production JS, CSS, and artwork now use content-hashed names. The `matchbox-v6`
  service worker reads the generated asset manifest so the entire hashed shell,
  including welcome artwork and legal styles, remains available offline.
- Azure Static Web Apps configuration now sends a restrictive CSP,
  Permissions-Policy, frame protection, and `nosniff`; hashed assets receive a
  one-year immutable policy; HTML, the service worker, and manifests revalidate;
  the web manifest is declared as `application/manifest+json`.
- Footer Privacy, Terms, and Matchbox Plus controls are at least 44 × 44 CSS px
  on the 390 px layout.

## Regression coverage

- Unit tests reproduce impossible ISO-shaped payment and invoice dates.
- Matcher tests cover equal reverse contention and the strong-reference/weak-
  contender case.
- Backup tests cover the verifier's `[null]` payload, impossible dates, full
  valid records, and broken references.
- Response-policy tests lock CSP, Permissions-Policy, immutable asset caching,
  no-cache entry points, and manifest MIME configuration.
- Playwright reproduces all three functional verifier cases and asserts no page
  errors, workspace retention, visible ambiguity warnings, absent quick-confirm
  actions, and 390 px touch target dimensions.
- Browser coverage also retains the complete reconciliation/export flow, manual
  audit-note flow, persistence, legal routes, keyboard dialog behavior, reduced
  motion, desktop/mobile axe scans, default same-origin privacy, and fresh
  offline artwork reload.

## Verification evidence (2026-08-28)

```bash
npm ci
npm audit --audit-level=high
npm test
npm run build
node --check dist/sw.js
npm run test:e2e
```

- Clean install: 55 packages; audit: 0 vulnerabilities.
- Unit/config: 18/18 passed across 4 files.
- Type/build: `tsc --noEmit` and Vite production build passed; `dist/index.html`
  exists at the required root.
- Browser: 17/17 Playwright checks passed in Chromium 1.58.2 at desktop and
  390 × 844 mobile sizes.
- Axe: zero serious/critical WCAG 2 A/AA/2.1 AA findings on `/`, `/privacy/`,
  and `/terms/` at both desktop and mobile sizes.
- Factory URL verifier: title present, `lang=en`, one `h1`, main landmark,
  complete image alt text and button names, and zero console/page errors.
- Keyboard: skip link is first and visibly focused; Enter reaches `#main`; the
  Plus dialog receives focus and closes with Escape. Reduced-motion duration is
  at most 0.01 ms.
- Privacy: the default workflow made only same-origin requests; no analytics,
  remote fonts, bank calls, or billing calls occurred without a license.
- PWA: persisted reconciliation survives offline reload; a fresh welcome screen
  reloads offline with its hashed artwork; a synthetic `matchbox-v7` update
  displayed “An app update is ready.” over the active `matchbox-v6` controller.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.0 s, LCP 1.3 s, TBT 0 ms, CLS 0.
- Production payload: app JS 31,450 bytes raw / 10,835 gzip; app CSS 15,341 /
  4,321; legal CSS 15,900 / 4,435; artwork 43,436 bytes. Budgets remain well
  below 200/50/300 KB.
- Current screenshots, Lighthouse JSON, and factory verification output are in
  `.factory/evidence/`.

## Deployment and live identity

- Repair commits `54e47560962ce91805b5cb6d8d0367309c67ccc8` and
  `72f35dc97d07fe83a83917082bdf824323988440` were pushed to `origin/main`.
- `/opt/fleet/lib/deploy-static.sh offline-payment-matchbox /work/repo/dist`
  completed against the existing Central US Azure Static Web App. Final
  deployment ID: `b355568f-fced-4de6-9279-9ae7955fe895`.
- Custom-domain verification returned HTTPS 200 at
  <https://offline-payment-matchbox.sociobot.in/>. The factory verifier found
  zero browser console/page errors and the expected title, language, single
  `h1`, main landmark, image alternatives, and named buttons.
- Live reproductions pass: impossible dates show the row-2 error and retain the
  mapping panel with zero page errors; the shared payment shows two ambiguity
  warnings and zero Confirm match buttons; malformed `[null]` backup data is
  rejected while the existing workspace remains; fresh offline reload includes
  the 1200 px artwork.
- Live 390 px footer control boxes are Privacy 52.45 × 44, Terms 44 × 44, and
  Matchbox Plus 108.94 × 44 CSS px.
- Live HTML, service worker, and manifests send `Cache-Control: no-cache`.
  Hashed JS, CSS, and WebP send `public, max-age=31536000, immutable`. The web
  manifest sends `application/manifest+json`. CSP, Permissions-Policy,
  `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff` are present.
- SHA-256 identity matched local `dist/` for `/`, `/privacy/`, `/terms/`, the
  hashed app JS/CSS/artwork, `/sw.js`, `/manifest.webmanifest`, and
  `/asset-manifest.json`.

## Known product-scope gaps

- CSV remains the only financial import format in v1. OFX, QIF, PDF, live bank
  feeds, currency conversion, split payments, and partial payments are out of
  scope.
- The app keeps one active workspace. Export a JSON backup before starting a new
  month.
- Production license checkout still requires a real Sociobot-issued token for a
  purchase-path smoke test; automated tests intentionally contain no token or
  payment credentials.
