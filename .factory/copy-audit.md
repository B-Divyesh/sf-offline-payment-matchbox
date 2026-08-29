# Landing copy audit

Audited 29 August 2026 against the home page, direct `?demo=1` page, and Plus dialog. Counts use whitespace-separated words. Repeated controls are listed once. No sentence exceeds 22 words, and no banned term appears.

| Copy | Words | Claim or result |
|---|---:|---|
| Match downloaded payments to invoices | 5 | Pass |
| Match payments to invoices from two CSVs | 7 | `csv-match` |
| For freelancers who reconcile invoices in spreadsheets or offline tools. | 10 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a separate sample workspace with three invoices. | 8 | `demo-isolation` |
| Choose your invoice CSV | 4 | Pass |
| Works offline after the first visit | 6 | `offline-reload` |
| Files stay on this device | 5 | `private-workflow` |
| Free matcher · Plus costs $19 once | 7 | `free-core`, `plus-batch` |
| Your CSV data stays in this browser | 7 | `private-workflow` |
| Source CSV text is saved only when you choose it. | 10 | `source-opt-in` |
| Invoice and payment rows appear side by side. | 7 | Pass |
| Three steps | 2 | Pass |
| How it works | 3 | Pass |
| Import both CSVs | 3 | Pass |
| Choose invoice and payment columns before the app saves imported rows. | 11 | `mapping-before-save` |
| Review each suggestion | 3 | Pass |
| Confirm clear pairs. | 3 | `deterministic-review` |
| Add a note to every manual match. | 7 | `manual-note` |
| Export the record | 3 | Pass |
| Download matched, open, and unused rows in one report. | 9 | `csv-report` |
| Import your invoice and payment CSVs | 6 | Pass |
| CSV only · nothing leaves this device | 6 | `private-workflow` |
| Open invoices | 2 | Pass |
| Invoice number and amount are required | 6 | Pass |
| Bank or payment export | 4 | Pass |
| Date and amount are required | 5 | Pass |
| Choose CSV | 2 | Pass |
| Download sample CSV | 3 | Pass |
| Local data controls | 3 | Pass |
| Back up or clear your local workspace | 7 | Pass |
| Back up this workspace | 4 | Pass |
| Export invoices, payments, matches, and notes as one JSON file. | 10 | `json-backup` |
| Import it later on this or another device. | 8 | `json-backup` |
| Export backup | 2 | Pass |
| Import backup | 2 | Pass |
| Clear this local workspace | 4 | Pass |
| Removing a workspace clears Matchbox data from this browser. | 9 | `workspace-clearing` |
| Export a backup first if you may need it. | 9 | Pass |
| Clear local workspace | 3 | Pass |
| Paid features | 2 | Pass |
| Matchbox Plus costs $19 once | 5 | `plus-batch` |
| The free matcher includes manual review, reports, backups, and offline use. | 11 | `free-core` |
| Plus confirms all clear strong suggestions together and remembers repeat column mappings. | 11 | `plus-batch`, `plus-column-mappings` |
| View Plus features | 3 | Pass |
| Demo — sample data, nothing is saved to your workspace | 9 | `demo-isolation` |
| Reset demo | 2 | Pass |
| Start for real | 3 | Pass |
| Sample payment matches | 3 | Pass |
| Review the sample payment matches | 5 | Pass |
| Explore three freelancer invoices and their downloaded payments. | 8 | Pass |
| Demo changes stay separate from your workspace. | 7 | `demo-isolation` |
| Confirm match | 2 | Pass |
| Resolve the ledger | 3 | Pass; ledger names the reconciliation record, not the storage boundary |
| Buy or restore Matchbox Plus | 5 | Pass |
| $19 once · no subscription | 4 | `plus-batch` |
| The complete matcher, manual review, reports, backups, and offline use are free. | 12 | `free-core` |
| Plus confirms clear strong suggestions together. | 6 | `plus-batch` |
| It also remembers column mappings. | 5 | `plus-column-mappings` |
| Buy Matchbox Plus | 3 | Pass |
| Checkout is hosted by Sociobot. | 5 | `billing-routing` |
| See the checkout page for merchant and refund terms. | 9 | Pass; directs buyers to current terms |
| Restore purchase | 2 | `license-restore` |

## First-read check

“Match payments to invoices from two CSVs. For freelancers who reconcile invoices in spreadsheets or offline tools. Try it with sample data.” The job, user, and first action fit in one breath and remain above the 390 × 844 fold.

## Terminology

| Concept | One term used |
|---|---|
| Unpaid sales record | invoice |
| Downloaded incoming money row | payment |
| Paired invoice and payment | match |
| Combined output | report |
| Portable local copy | backup |
| Isolated sample storage boundary | workspace |
| Reconciliation record | ledger |
| Paid license tier | Matchbox Plus |
