# Matchbox Ledger demo

- URL: `https://offline-payment-matchbox.sociobot.in/?demo=1` (local: `http://127.0.0.1:4173/?demo=1`). `/demo/` is an equivalent direct route.
- Sample: three freelancer invoices, three downloaded payments, one confirmed match, and two strong suggestions.
- Storage: demo data uses IndexedDB database `demo:matchbox-ledger`. Demo license, verdict, and mapping preferences use `demo:` localStorage keys. Real work uses unprefixed keys; the app never reads or writes them while demo mode is active.
- Reset: choose **Reset demo** in the persistent banner to restore the original sample.
- Leave: choose **Start for real**. This deletes the demo database before opening the empty real workspace.
- Direct query: `/?demo=1` also enables the isolated demo code path. The canonical catalog URL is `/demo/`.

All tests listed in `.factory/claims.json` start from `/demo/` in a fresh browser context.
