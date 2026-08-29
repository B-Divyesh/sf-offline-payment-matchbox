# Landing copy audit

Audited 29 August 2026 against the rendered home page, direct `?demo=1` page,
and Plus dialog. Counts split at sentence boundaries. No sentence exceeds 22
words and no banned marketing term appears. Claim-bearing copy maps to
`.factory/claims.json`.

| Copy | Words | Result |
|---|---:|---|
| Match downloaded payments to invoices | 5 | Pass |
| Match payments to invoices from two CSVs | 7 | Pass (`csv-match`) |
| For freelancers who reconcile invoices in spreadsheets or offline tools. | 10 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a separate ledger with three invoices. | 7 | Pass (`demo-isolation`) |
| Works offline after the first visit | 6 | Pass (`offline-reload`) |
| Files stay on this device | 5 | Pass (`private-workflow`) |
| Free matcher · Plus costs $19 once | 7 | Pass (`free-core`, `plus-batch`) |
| Your CSV data stays in this browser | 7 | Pass (`private-workflow`) |
| Source CSV text is saved only when you choose it. | 10 | Pass (`source-opt-in`) |
| Invoice and payment rows appear side by side. | 7 | Pass |
| Import your invoice and payment CSVs | 6 | Pass |
| CSV only · nothing leaves this device | 6 | Pass (`private-workflow`) |
| Download sample CSV | 3 | Pass |
| Back up or clear your local workspace | 7 | Pass |
| Export invoices, payments, matches, and notes as one JSON file. | 10 | Pass (`json-backup`) |
| Import it later on this or another device. | 8 | Pass (`json-backup`) |
| The free matcher includes manual review, reports, backups, and offline use. | 11 | Pass (`free-core`) |
| Checkout is hosted by Sociobot. | 5 | Pass (`billing-routing`) |
| Buy or restore Matchbox Plus | 5 | Pass |
| Demo — sample data, nothing is saved to your workspace | 9 | Pass (`demo-isolation`) |

## First-read check

“Match payments to invoices from two CSVs. For freelancers who reconcile
invoices in spreadsheets or offline tools. Try it with sample data.” States the
job, person, and first action in one breath.

## Terminology

| Concept | One term used |
|---|---|
| Unpaid sales record | invoice |
| Downloaded incoming money row | payment |
| Paired invoice and payment | match |
| Combined output | report |
| Portable local copy | backup |
| Isolated sample workspace | demo |
| Paid license tier | Matchbox Plus |

## First-read check

Read aloud: “Match payments to invoices from two CSVs. For freelancers who reconcile invoices in spreadsheets or offline tools. Try it with sample data.” This states the job, user, and first action in one breath.

## Terminology

| Concept | One term used |
|---|---|
| Unpaid sales record | invoice |
| Downloaded incoming money row | payment |
| Paired invoice and payment | match |
| Combined output | report |
| Portable local copy | backup |
| Isolated sample workspace | demo |
| Paid license tier | Matchbox Plus |
