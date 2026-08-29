# Matchbox Ledger

Match payments to invoices from two CSVs. Matchbox Ledger is for freelancers who reconcile downloaded payments in spreadsheets or offline invoice tools.

Parsing and matching stay on this device. The app flags competing matches, requires a note for manual matches, and exports the full report.

Live: <https://offline-payment-matchbox.sociobot.in>

Demo: <https://offline-payment-matchbox.sociobot.in/?demo=1>. It opens three invoices and three payments in the separate `demo:matchbox-ledger` database. Use **Reset demo** to restore the sample or **Start for real** to discard it.

## How it works

1. Import an invoice CSV and map its invoice number and amount columns.
2. Import a payment CSV and map its date and amount columns.
3. Review suggestions. Competing matches are flagged and never merged.
4. Confirm suggestions or choose another payment. Every manual match requires an audit note.
5. Export a report CSV containing matched invoices, open invoices, unused payments, evidence method, notes, and timestamps.

The active workspace persists in browser IndexedDB. Raw source CSV text is stored only after import-time consent. JSON backup/import carries every local record.

## Matchbox Plus

Manual review, CSV reports, backups, and offline use are free. Matchbox Plus costs $19 once. It confirms all clear strong suggestions together and remembers repeat column mappings.

Checkout and license verification use the Sociobot billing API. Reconciliation rows and totals are not included in license checks.

Set `VITE_BILLING_BASE` at build time to override the production default (`https://api.sociobot.in`), for example when the factory uses its pilot environment.

## Develop

```bash
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run test:e2e
npm run build
```

Playwright is pinned to 1.58.2. Its Chromium browser must be available through `PLAYWRIGHT_BROWSERS_PATH`, or install it with `npx playwright install chromium`.

## Deploy

The exact production command is `npm run build`. It creates the static site in `./dist`, with `dist/index.html` at its root and standalone `/privacy/` and `/terms/` pages. Serve the directory over HTTPS so service workers and installation work outside localhost.

Each build writes its package version and full Git commit to `/release.json`. After deployment, run `npm run verify:identity` to prove the live files identify the checked-out commit. Set `LIVE_BASE_URL` to verify another deployment.

The service worker caches the application shell. After the first online visit, saved reconciliation work continues offline.

## Privacy and support

See [the privacy policy](https://offline-payment-matchbox.sociobot.in/privacy/) and [terms](https://offline-payment-matchbox.sociobot.in/terms/). Product scope and design rationale live in [`.factory/brief.json`](.factory/brief.json) and [`.factory/design.md`](.factory/design.md).

## License

MIT. See `LICENSE`.
