# Matchbox Ledger

Matchbox Ledger is a private, offline-first reconciliation utility for freelancers. It pairs an open-invoice CSV with a downloaded bank or payment CSV, explains deterministic match suggestions, requires notes on manual matches, and exports an auditable reconciliation report. There are no bank logins, accounts, hosted financial records, bookkeeping features, or trackers.

Live: <https://offline-payment-matchbox.sociobot.in>

## How it works

1. Import an invoice CSV and map its invoice number and amount columns. Customer, dates, and currency are optional evidence.
2. Import a payment CSV and map its date and amount columns. Reference and currency are optional evidence.
3. Review suggestions. Matchbox scores equal amounts, matching currencies, invoice references, customer names, and nearby dates. Close alternatives are explicitly marked ambiguous and never auto-merged.
4. Confirm suggestions or choose another payment. Every manual match requires an audit note.
5. Export a report CSV containing matched invoices, open invoices, unused payments, evidence method, notes, and timestamps.

The active workspace persists in browser IndexedDB. Raw source CSV text is retained only when the import-time opt-in is checked. JSON backup/import gives the user a portable copy of all local records.

## Matchbox Plus

The full manual workflow, CSV report, backups, and offline use are free. Matchbox Plus is a $19 one-time supporter unlock that adds one-click confirmation of all strong, unambiguous suggestions and remembers column mappings for repeated imports. Checkout and license verification use the Sociobot billing API; no payment provider is embedded.

Set `VITE_BILLING_BASE` at build time to override the production default (`https://api.sociobot.in`), for example when the factory uses its pilot environment. No product ID or secret is stored in this repository.

## Develop

```bash
npm ci
npm run dev
npm test
npm run test:e2e
npm run build
```

Playwright is pinned to 1.58.2. Its Chromium browser must be available through `PLAYWRIGHT_BROWSERS_PATH`, or install it with `npx playwright install chromium`.

## Deploy

The exact production command is `npm run build`. It creates the static site in `./dist`, with `dist/index.html` at its root and standalone `/privacy/` and `/terms/` pages. Serve the directory over HTTPS so service workers and installation work outside localhost.

The service worker pre-caches the application shell and uses a versioned cache. The first online visit installs the offline experience; later visits and saved reconciliation work continue without a network connection.

## Privacy and support

See [the privacy policy](https://offline-payment-matchbox.sociobot.in/privacy/) and [terms](https://offline-payment-matchbox.sociobot.in/terms/). Product scope and design rationale live in [`.factory/brief.json`](.factory/brief.json) and [`.factory/design.md`](.factory/design.md).

## License

MIT. See `LICENSE`.
