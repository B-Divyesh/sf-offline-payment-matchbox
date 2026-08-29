# Adversarial first-read review 4 — Matchbox Ledger

Reviewed: 2026-08-29  
Live URL: <https://offline-payment-matchbox.sociobot.in/>  
Method: fresh Chromium contexts at 390 × 844 and 1440 × 900; clean local clone for all declared tests.

## Verdict: FAIL

The job, audience, and first click are clear. The sample demo is genuinely usable and isolated, and all 19 declared claim tests pass. This is still a FAIL because the landing page makes one unlisted data-handling promise, and two small copy issues remain. A PASS requires zero findings.

## First screen, before scrolling

Both cold screens returned HTTP 200 with no page or console errors.

- **What it does:** “Match payments to invoices from two CSVs.”
- **For whom:** “For freelancers who reconcile invoices in spreadsheets or offline tools.”
- **First click:** “Try it with sample data,” explained by “Opens a separate ledger with three invoices.”

This gate passes. The 390 px screen presents all three answers without scrolling; the desktop screen does the same alongside the original ceramic-tray image.

## Findings

### Blocking

#### F-4-1 — A data-saving promise is not in the claims contract

- **Quote/location:** landing page, **How it works** step one: “Choose invoice and payment columns before anything is saved.”
- **Why this fails:** this is a visitor-reliable statement about when imported data is persisted. `.factory/claims.json` has no claim for it. `source-opt-in` proves whether raw CSV text is included in a backup; it does not prove that no imported records are stored before the mapping form is submitted. The claims contract requires either a listed observable test or removal/narrowing of the promise.
- **Concrete fix:** replace it with “Choose invoice and payment columns before the app saves imported rows.” Add `mapping-before-save` to `.factory/claims.json` and a tagged browser test that opens the mapping form from `/demo/`, checks the demo IndexedDB record is unchanged before **Import invoices** or **Import payments**, then checks records appear only after submission.

### Minor

#### F-4-2 — A destructive section uses a mood/action heading rather than naming the section

- **Quote/location:** landing page, local-data panel heading: “Start a clean month”.
- **Why this is weak:** a first-time visitor cannot tell from the heading that it removes stored work. The supporting paragraph and button are clear, but the heading itself fails the plain-words requirement that headings name their section without relying on nearby copy.
- **Concrete fix:** replace the heading with “Clear this local workspace”.

#### F-4-3 — Demo storage uses two names for the same boundary

- **Quote/location:** hero helper: “Opens a separate ledger with three invoices.” Demo banner and demo lead: “nothing is saved to your workspace” and “Demo changes stay separate from your workspace.”
- **Why this is weak:** “ledger” can mean a financial record, while “workspace” is the storage boundary the banner is trying to explain. Switching terms makes the demo boundary less immediate on a 30-second first read.
- **Concrete fix:** rewrite the hero helper as “Opens a separate sample workspace with three invoices.” Keep **workspace** for that boundary everywhere.

## Copy audit

Counts use whitespace-separated words. Controls, labels, headings, and repeated visible copy are included because they are read by a first-time visitor. `—` means no copy flag; duplicate **Download sample CSV** and footer/legal links are counted once and noted as repeated.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to matcher | 3 | — |
| Matchbox Ledger | 2 | — |
| Demo | 1 | — |
| Workspace | 1 | — |
| Privacy | 1 | — |
| Match downloaded payments to invoices | 5 | — |
| Match payments to invoices from two CSVs | 7 | — |
| For freelancers who reconcile invoices in spreadsheets or offline tools. | 10 | — |
| Try it with sample data | 5 | result-naming action |
| Opens a separate ledger with three invoices. | 7 | F-4-3 |
| Choose your invoice CSV | 4 | result-naming action |
| Works offline after the first visit | 6 | listed `offline-reload` claim |
| Files stay on this device | 5 | listed `private-workflow` claim |
| Free matcher · Plus costs $19 once | 7 | listed `free-core` / `plus-batch` claims |
| Your CSV data stays in this browser | 7 | listed `private-workflow` claim |
| Source CSV text is saved only when you choose it. | 10 | listed `source-opt-in` claim |
| Invoice and payment rows appear side by side. | 7 | — |
| Three steps | 2 | — |
| How it works | 3 | — |
| Import both CSVs | 3 | — |
| Choose invoice and payment columns before anything is saved. | 10 | F-4-1 |
| Review each suggestion | 3 | — |
| Confirm clear pairs. | 3 | listed `deterministic-review` claim |
| Add a note to every manual match. | 7 | listed `manual-note` claim |
| Export the record | 3 | — |
| Download matched, open, and unused rows in one report. | 9 | listed `csv-report` claim |
| 01 · Prepare | 2 | — |
| Import your invoice and payment CSVs | 6 | — |
| CSV only · nothing leaves this device | 6 | listed `private-workflow` claim |
| List A | 2 | — |
| Open invoices | 2 | — |
| Invoice number and amount are required | 6 | — |
| Choose CSV | 2 | result-naming action |
| Download sample CSV (twice) | 3 | result-naming action |
| List B | 2 | — |
| Bank or payment export | 4 | — |
| Date and amount are required | 6 | — |
| Local data controls | 3 | — |
| Back up or clear your local workspace | 7 | — |
| Back up this workspace | 4 | — |
| Export invoices, payments, matches, and notes as one JSON file. | 10 | listed `json-backup` claim |
| Import it later on this or another device. | 8 | listed `json-backup` claim |
| Export backup | 2 | result-naming action |
| Import backup | 2 | result-naming action |
| Start a clean month | 4 | F-4-2 |
| Removing a workspace clears Matchbox data from this browser. | 9 | listed `workspace-clearing` claim |
| Export a backup first if you may need it. | 10 | — |
| Clear local workspace | 3 | result-naming action |
| Paid features | 2 | — |
| Matchbox Plus costs $19 once | 5 | listed `plus-batch` claim |
| The free matcher includes manual review, reports, backups, and offline use. | 11 | listed `free-core` claim |
| Plus confirms all clear strong suggestions together and remembers repeat column mappings. | 11 | listed `plus-batch` / `plus-column-mappings` claims |
| View Plus features | 3 | result-naming action |
| Match payments to invoices from two CSVs. | 7 | — |
| Terms | 1 | — |
| Built by Param Factory · v1.0.3 · build 5328b4b · Still-life artwork generated for this product with the factory image model. | 17 | provenance, not a product claim |
| Ready offline | 2 | status text |

No landing sentence exceeds 22 words. No banned marketing adjective appears. Apart from F-4-2 and F-4-3, the headings name their sections and the buttons name their outcomes.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Matchbox Ledger | 2 | title |
| Match payments to invoices from two CSVs. | 7 | listed `csv-match` claim |
| Matchbox Ledger is for freelancers who reconcile downloaded payments in spreadsheets or offline invoice tools. | 15 | — |
| Parsing and matching stay on this device. | 7 | listed `private-workflow` claim |
| The app flags competing matches, requires a note for manual matches, and exports the full report. | 16 | listed `deterministic-review` / `manual-note` / `csv-report` claims |
| Live: URL | 2 | link label |
| Demo: URL | 2 | link label |
| It opens three invoices and three payments in the separate `demo:matchbox-ledger` database. | 12 | listed demo behavior |
| Use Reset demo to restore the sample or Start for real to discard it. | 14 | listed `demo-isolation` claim |
| How it works | 3 | heading |
| Import an invoice CSV and map its invoice number and amount columns. | 12 | — |
| Import a payment CSV and map its date and amount columns. | 11 | — |
| Review suggestions. | 2 | — |
| Competing matches are flagged and never merged. | 7 | listed `deterministic-review` claim |
| Confirm suggestions or choose another payment. | 6 | — |
| Every manual match requires an audit note. | 7 | listed `manual-note` claim |
| Export a report CSV containing matched invoices, open invoices, unused payments, evidence method, notes, and timestamps. | 16 | listed `csv-report` claim |
| The active workspace persists in browser IndexedDB. | 7 | listed `local-persistence` claim |
| Raw source CSV text is stored only after import-time consent. | 10 | listed `source-opt-in` claim |
| JSON backup/import carries every local record. | 6 | listed `json-backup` claim |
| Matchbox Plus | 2 | heading |
| Manual review, CSV reports, backups, and offline use are free. | 10 | listed `free-core` claim |
| Matchbox Plus costs $19 once. | 5 | listed `plus-batch` claim |
| It confirms all clear strong suggestions together and remembers repeat column mappings. | 11 | listed `plus-batch` / `plus-column-mappings` claims |
| Checkout and license verification use the Sociobot billing API. | 9 | listed `billing-routing` claim |
| Reconciliation rows and totals are not included in license checks. | 10 | listed `license-request-privacy` claim |
| Set `VITE_BILLING_BASE` at build time to override the production default, for example when the factory uses its pilot environment. | 18 | developer instruction |
| Develop | 1 | heading |
| Playwright is pinned to 1.58.2. | 5 | developer instruction |
| Its Chromium browser must be available through `PLAYWRIGHT_BROWSERS_PATH`, or install it with `npx playwright install chromium`. | 13 | developer instruction |
| Deploy | 1 | heading |
| The exact production command is `npm run build`. | 7 | developer instruction |
| It creates the static site in `./dist`, with `dist/index.html` at its root and standalone `/privacy/` and `/terms/` pages. | 17 | developer instruction |
| Serve the directory over HTTPS so service workers and installation work outside localhost. | 13 | developer instruction |
| Each build writes its package version and full Git commit to `/release.json`. | 13 | developer instruction |
| After deployment, run `npm run verify:identity` to prove the live files identify the checked-out commit. | 14 | developer instruction |
| Set `LIVE_BASE_URL` to verify another deployment. | 7 | developer instruction |
| The service worker caches the application shell. | 7 | supports listed `offline-reload` claim |
| After the first online visit, saved reconciliation work continues offline. | 10 | listed `offline-reload` / `local-persistence` claims |
| Privacy and support | 3 | heading |
| See the privacy policy and terms. | 6 | links |
| Product scope and design rationale live in `.factory/brief.json` and `.factory/design.md`. | 10 | repository navigation |
| License | 1 | heading |
| MIT. | 1 | license label |
| See `LICENSE`. | 2 | repository navigation |

No README sentence exceeds 22 words or uses a banned marketing adjective. Terminology is otherwise consistent: **invoice**, **payment**, **match**, **report**, **backup**, **demo**, and **Matchbox Plus**.

## Demo, privacy, and claims

One click from the landing action entered `/?demo=1`. Its first mobile screen already showed the realistic pair `INV-105 · Atlas Works · $425.50` and `Transfer INV-105 Atlas · $425.50`, with **Confirm match** visible. The persistent banner read “Demo — sample data, nothing is saved to your workspace” and exposed **Reset demo** and **Start for real**. Reset restored the sample. Start for real navigated to `/` with no demo banner and no rows in the real workspace.

The full direct-demo confirmation/export request log contained only `https://offline-payment-matchbox.sociobot.in` resources. No analytics, remote font, or third-party script request appeared. The declared demo-isolation test independently seeds real IndexedDB and real localStorage sentinels, exercises demo writes, leaves demo, and byte-compares real storage; it passed.

All commands listed in `.factory/claims.json` were run separately in a clean clone after `npm ci`; all passed. The aggregate `npm run test:e2e -- --grep @claim` run also reported **19 passed**.

| Claims | Result |
| --- | --- |
| offline-reload, csv-report, csv-match, private-workflow, demo-isolation | PASS |
| local-persistence, source-opt-in, deterministic-review, json-backup, plus-batch | PASS |
| free-core, plus-column-mappings, manual-note, daily-license-check, billing-routing | PASS |
| license-request-privacy, workspace-clearing, tracking-free, license-restore | PASS |

No declared claim test failed. F-4-1 is an inventory omission, not a failed declared test.

## Structure, accessibility, and history

- Route checks passed for `/`, `/demo/`, `/privacy/`, `/terms/`, `/404.html`, and an unknown URL. The unknown URL returned the designed 404 with HTTP 404.
- Titles follow the required route pattern; each checked route had one H1, one main landmark, a meta description, canonical URL, OG/Twitter metadata, favicon, and apple-touch icon. The sitemap lists the four public routes.
- Header/footer navigation is consistent. Crawling all discovered same-origin links returned 200; `mailto:` links remained mail links and checkout returned HTTP 303 to the hosted Sociobot/Dodo checkout.
- Cold `/#workspace` and `/demo/#match-title` both scrolled to and focused their destination heading, with a live announcement. The live request log and restrictive CSP support the local-first privacy claim.
- The product has a distinct, product-specific ceramic-tray visual system rather than a generic SaaS template. The original artwork provenance matches `.factory/design.md`.
- The brief calls for local CSV import, deterministic matching, manual confirmation, report export, and local persistence. Those are present. AI would not improve this private offline-first workflow, and import/export already cover the obvious leverage; no decorative AI or embedded provider key was found.

Earlier history was read in full: `.factory/review-1.md`, `.factory/polish-1.md`, and `.factory/handoff.md`. The following confirmations are based on the live site and current source/tests, not the prior “fixed” labels.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Direct demo visibly shows customer, invoice ID, payment reference, amount, and action above the 390 px fold. |
| F-1-2 | `demo:` scopes demo ledger, license/verdict, and mapping storage; the isolation claim byte-compares real sentinels. |
| F-1-3 | Cold hash scroll/focus and Back/Forward focus have live code and regression coverage. |
| F-1-4 | `csv-match` is declared and imports two CSVs to observable suggestions. |
| F-1-5 | The unsupported five-signal README claim is absent. |
| F-1-6 | `free-core` proves manual review, CSV, backup, and offline use without a license. |
| F-1-7 | `billing-routing` proves the documented Sociobot checkout and verification endpoints. |
| F-1-8 | Merchant/refund-handler assertions are absent from current product copy. |
| F-1-9 | Refund-revocation assertion is absent from current product copy. |
| F-1-10 | `license-request-privacy` records the request and excludes ledger values. |
| F-1-11 | The ambiguous repository-secret statement is absent. |
| F-1-12 | `json-backup` deep-compares invoice, payment, match, and source-file fields in a second browser context. |
| F-1-13 | `daily-license-check` exercises the exact 86,400,000 ms boundary. |
| F-1-14 | `csv-report` asserts the ordered schema and all sample rows. |
| F-1-15 | `private-workflow` imports, maps, confirms, exports, and records requests. |
| F-1-16 | The same Demo / Workspace / Privacy navigation is present on app, legal, and 404 routes. |
| F-1-17 | The designed 404 includes canonical, OG, and Twitter metadata. |
| F-1-18 | Privacy H1 is “How Matchbox Ledger stores your data”. |
| F-1-19 | “Local payment reconciliation” is absent; the landing leads with the concrete CSV task. |
| F-1-20 | “Private by design” is absent; local-device wording is specific. |
| F-1-21 | The former mood caption is replaced by the concrete row-side-by-side caption. |
| F-1-22 | The workspace heading names CSV import rather than using the bench metaphor. |
| F-1-23 | Both controls say “Download sample CSV”. |
| F-1-24 | “Local custody” is absent; the section says “Local data controls”. |
| F-1-25 | The former data slogan is replaced by “Back up or clear your local workspace”. |
| F-1-26 | The paid section is named “Paid features”. |
| F-1-27 | The Plus controls say “View Plus features”. |
| F-1-28 | The dialog label says “Buy or restore Matchbox Plus”. |
| F-1-29 | README consistently calls the output a “report”. |

## Verification run

The clean clone completed `npm ci`, all 19 exact claim commands, `npm test` (23 passed), `npm run typecheck`, `npm run lint`, and `npm run build` (including `dist/`). The complete local browser suite completed after the claim run. No product code was modified for this review.

## What would make this perfect

Add and test the mapping-before-save claim, rename the destructive section and demo helper as specified, then rerun the claim inventory and cold 390 px copy audit. At that point this review has no remaining functional, privacy, route, demo, or first-read objection.
