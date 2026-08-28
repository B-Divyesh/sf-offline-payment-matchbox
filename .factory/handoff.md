# Matchbox Ledger — build handoff

## What shipped

- A production Vite + TypeScript PWA for reconciling open-invoice and bank/payment CSV exports entirely in the browser.
- Quote-aware CSV parsing, common-heading detection, explicit column mapping, locale-style amount parsing, input validation, duplicate invoice detection, and downloadable sample files.
- Deterministic suggestions using exact amount, currency, invoice reference, customer reference, and date distance. Close-scoring alternatives are marked ambiguous and cannot use the quick-confirm path.
- Manual payment selection with a required audit note; all matches are reversible.
- CSV reports covering confirmed matches, open invoices, and unused payments. JSON workspace backup/import is also available.
- IndexedDB persistence for structured records. Raw CSV source text is retained only with an import-time opt-in.
- A complete free workflow plus a $19 one-time Matchbox Plus license contract: Sociobot checkout, return-token capture, daily verification cache, offline optimistic access, restore-by-token, and quiet invalid/offline states. Plus adds batch confirmation and reusable mappings; exports and accessibility are never gated.
- Installable manifest, 192/512 maskable icons, versioned service worker, update toast, and verified offline refresh with persisted work.
- Responsive 390 px layout, keyboard-native controls/dialogs, visible focus, reduced-motion handling, status announcements, and standalone privacy/terms pages.
- Original generated ceramic still-life artwork with prompt sidecar and provenance in `.factory/design.md`; production WebP is 43 KB.

## Run and verify

```bash
npm ci
npm test
npm run build
npm run test:e2e
```

Build output is exactly `./dist`, with `dist/index.html` at its root.

Verification completed on 2026-08-28:

- Unit tests: 8/8 passed (CSV parsing/validation and deterministic matcher).
- Playwright: 6/6 passed (complete import → match → CSV export flow, required manual note, IndexedDB persistence, offline reload, 390 px legal routes).
- Axe via Playwright: 0 serious or critical WCAG 2 A/AA/2.1 AA violations on `/`, `/privacy/`, and `/terms/`.
- Factory `verify-url.sh`: title present, `lang=en`, one `h1`, main landmark present, zero missing image alts, zero unlabeled buttons, zero console/page errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.6 s, total blocking time 0 ms, CLS 0.
- Production payload: app JavaScript 28.2 KB raw / 9.9 KB gzip; app CSS 15.2 KB raw / 4.3 KB gzip; hero WebP 43.4 KB. All are comfortably inside the 200/50/300 KB budgets.
- Desktop and 390 × 844 screenshots plus machine-readable reports are in `.factory/evidence/`.
- `npm audit`: 0 vulnerabilities after upgrading the Vite/Vitest toolchain.

## Known gaps and next steps

- CSV is the only financial import format in v1; OFX, QIF, PDF, live bank feeds, currency conversion, split payments, and partial payments are intentionally out of scope.
- The app keeps one current workspace. Users should export a JSON backup before starting another month.
- Date parsing supports ISO, `DD/MM/YYYY`, `DD-MM-YYYY`, and browser-recognized textual dates. Ambiguous numeric dates are treated day-first and should be confirmed in the mapping/review flow.
- The production license endpoints are implemented, but no real purchase token is committed or used in automated tests. The factory should verify checkout/return URLs after registering the product.
- The static host should set long immutable caching for `/assets/*` and `no-cache` for `/sw.js` and HTML. The service worker itself remains sufficient for offline use.
