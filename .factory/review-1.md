# Adversarial first-read review 1 — Matchbox Ledger

Date: 29 August 2026

Reviewed commit: `e12cf51bfa5ac8e55fdbd93fa3df34d2136f1f74`

Live URL: <https://offline-payment-matchbox.sociobot.in/>

Verdict: **FAIL**

Three blocking findings remain. The landing page passes the cold first-read
test, all 15 listed claim commands pass from a clean clone, and the main
workflow works offline. The demo does not show realistic rows on its first
screen, demo mode reads and writes non-demo localStorage, and cold hash deep
links do not reach their target.

## First screen, before scrolling

Fresh Chromium contexts were used at 390 × 844 and 1440 × 900. No storage,
cookies, or service worker state was reused. Both loads returned 200 with no
console or page errors.

The same answer was available on both first screens:

- What it does: matches downloaded payment rows to invoice rows from two CSVs.
- For whom: freelancers using spreadsheets or offline invoice tools.
- What to click first: **Try it with sample data**.

The exact copy that made this clear was “Match payments to invoices from two
CSVs”, “For freelancers who reconcile invoices in spreadsheets or offline
tools”, and “Try it with sample data”. This check passes. Evidence:
`evidence/review-1-cold-mobile.png`, `evidence/review-1-cold-desktop.png`, and
`evidence/review-1-first-read.json`.

## Findings

### Blocking

#### F-1-1 — The demo's first screen does not show realistic sample records

- Location/quote: `/demo/`, first 390 px and desktop screens: “1 matched”, “2
  invoices to review”, and “Review suggestions”.
- Verification: after the one-click demo action, neither screen shows an
  invoice number, customer, payment reference, amount, suggested pair, or
  confirmed row. Those appear only after the visitor passes the hero, “How it
  works”, and both import trays. See `evidence/review-1-demo-mobile.png` and
  `evidence/review-1-demo-desktop.png`.
- Impact: counts do not show the product being used with realistic sample data.
  The attached demo contract requires the first post-click screen to do so.
- Fix: place a compact live sample row directly below the demo heading, showing
  for example `INV-105 · Atlas Works · $425.50` beside `Transfer INV-105 Atlas`,
  with **Confirm match** visible at 390 px. Alternatively enter `/demo/` focused
  at the live ledger, while keeping the banner visible. Add a 390 px test that
  asserts a customer, invoice ID, payment reference, amount, and match action
  are all visible without scrolling.

#### F-1-2 — Demo mode reads and writes real localStorage keys

- Location: `src/license.ts:1-73` and `src/main.ts:217,244`.
- Verification: a real `sb_license:offline-payment-matchbox` sentinel made the
  live demo show **Plus active**. Importing a custom CSV in the demo then wrote
  `matchbox:mapping:invoice:record|total|client|issued`. That key remained after
  **Start for real**. Only the ledger uses `demo:matchbox-ledger`; license,
  verdict, and mapping keys are shared. Evidence:
  `evidence/review-1-demo-storage.json`.
- Impact: the banner is visible while demo code reads real settings and writes a
  mapping that affects the real workspace. This violates the required rule that
  demo mode never reads or writes real storage. The listed `demo-isolation`
  test checks only whether ledger rows enter an initially empty real workspace,
  so it misses this breach.
- Fix: give every demo-side storage key a `demo:` namespace, or disable license
  restoration and remembered mappings in demo mode. Extend the claim test to
  seed real IndexedDB and every real localStorage key, exercise all demo writes,
  leave the demo, and compare the complete real-storage snapshot byte for byte.

#### F-1-3 — Cold hash deep links and route-change focus are broken

- Location: `https://offline-payment-matchbox.sociobot.in/#workspace` and the
  home-to-demo navigation.
- Verification: a cold `/#workspace` load left `#workspace` 2,258 px below the
  viewport because the target is inserted after the browser's initial hash
  scroll. After following **Try it with sample data**, `document.activeElement`
  was `<body>`, not the demo `<h1>`. Browser Back did return to `/`.
- Impact: shared workspace links do not reach the workspace, and screen-reader
  users receive no focused route heading. Broken routing is explicitly blocking
  in this review.
- Fix: after the first render, resolve `location.hash`, scroll the target into
  view, and focus its heading or the target with `tabindex="-1"`. On every full
  route load, focus the page `<h1>` and announce it. Add tests for a cold
  `/#workspace`, `/demo/#match-title`, link navigation, Back, and Forward.

### Major — claim contract

#### F-1-4 — The primary matching claim is unlisted

- Quote/location: landing and README, “Match payments to invoices from two
  CSVs.”
- Why: no `.factory/claims.json` entry names and tests the core two-file import
  and matching outcome.
- Fix: add a `csv-match` claim and tagged test that imports both shipped sample
  files and verifies the expected suggested pairs, or narrow the copy to an
  existing tested claim.

#### F-1-5 — The five scoring inputs are an unlisted claim

- Quote/location: README, “Matchbox scores amount, currency, references, names,
  and dates.”
- Why: `deterministic-review` tests competition for one equal-amount payment; it
  does not prove that all five named signals affect scoring.
- Fix: add a claim entry and fixtures that isolate each signal, or replace the
  sentence with the narrower tested behavior.

#### F-1-6 — Free feature availability is an unlisted claim

- Quotes/locations: landing “Free matcher · Plus costs $19 once”; landing and
  README “The free matcher includes manual review, reports, backups, and offline
  use”; Plus dialog “The complete matcher, manual review, reports, backups, and
  offline use are free”; terms “The core matcher, manual review, exports,
  backups, and offline use are free.”
- Why: the `plus-batch` entry tests price and paid batch confirmation, not that
  every named core feature remains available with no license.
- Fix: add one `free-core` claim whose clean no-license test performs manual
  review, CSV export, JSON backup, and offline reload.

#### F-1-7 — Sociobot billing routing is an unlisted claim

- Quotes/locations: README “Checkout and license verification use the Sociobot
  billing API”; Plus dialog “Checkout is hosted by Sociobot.”
- Why: no claim entry verifies the checkout origin and verification origin.
- Fix: add a billing-routing claim that asserts checkout redirects from the
  Sociobot endpoint and verification requests go only to the documented
  Sociobot endpoint, using recorded responses in routine tests.

#### F-1-8 — Merchant and refund handling is an unlisted claim

- Quotes/locations: Plus dialog “Sociobot/Dodo is the merchant of record and
  handles refunds”; terms “It handles checkout, receipts, taxes, and refunds.”
- Why: this is purchase information a visitor can rely on, but it has no claim
  entry or test.
- Fix: add a billing-contract fixture/test for the returned merchant and policy
  metadata, or remove the operational assertion from pre-purchase copy.

#### F-1-9 — Refund revocation is an unlisted claim

- Quotes/locations: Plus dialog “A refund revokes the license”; terms
  “Refunded, expired, revoked, or wrong-product licenses stop Plus access.”
- Why: no tagged test covers any of these verdicts.
- Fix: add recorded verdict fixtures and a tagged claim test for each stated
  state, or state only the behavior already tested.

#### F-1-10 — The license-request privacy promise is unlisted and untested

- Quotes/locations: README “Reconciliation rows and totals are not included in
  license checks”; privacy page “The app sends only that token to Sociobot for
  daily verification. Reconciliation files and totals are never included.”
- Why: `private-workflow` never performs a license check, while
  `daily-license-check` does not inspect the full request fields/body.
- Fix: add a claim that intercepts a restore and scheduled verification, then
  asserts the only user value sent is the license token and that no invoice,
  payment, match, note, or total appears in URL, headers, or body.

#### F-1-11 — The repository-secret sentence is unlisted and ambiguous

- Quote/location: README, “No product ID or secret is stored in this
  repository.”
- Why: the public product slug is visibly stored in source and endpoint paths,
  so “No product ID” is literally unclear. No claim entry verifies the absence
  of billing-provider IDs or secrets.
- Fix: write “The repository contains the public Sociobot product slug, but no
  billing-provider product ID or secret.” Add a secret/static-config scan if the
  sentence remains.

#### F-1-12 — The backup test does not prove “all records” or another-device import

- Quotes/locations: README/landing, “JSON backup/import carries every local
  record” and “Import it later on this or another device.”
- Why: `@claim:json-backup` checks array lengths before import and only a table
  row count afterward. It does not compare every restored invoice, payment,
  match, note, timestamp, or opted-in source file, and it reuses one context.
- Fix: export from one context, import into a second clean context, and deep
  compare every stored field against the source ledger.

#### F-1-13 — The one-day cache duration is not tested

- Quote/location: `daily-license-check`, “License verification is cached for one
  day and its result stays visible.”
- Why: its test reloads immediately and confirms no second request. It never
  checks the numeric 86,400,000 ms boundary or that an older result revalidates.
- Fix: control the clock and assert no request immediately before 24 hours, then
  exactly one request immediately after 24 hours.

#### F-1-14 — The CSV report test omits its promised header assertion

- Location: `.factory/claims.json` `csv-report` sandbox says “assert header row
  and one output row per sample record”; `tests/e2e/claims.spec.ts` checks line
  and status counts only.
- Why: a six-line file with a wrong or missing schema can pass.
- Fix: assert the exact ordered header and the identity/content of all three
  invoice rows and all applicable unused-payment rows.

#### F-1-15 — The privacy test does not exercise parsing

- Quote/location: `private-workflow`, “Parsing, matching, and report export keep
  reconciliation data on this device.”
- Why: the test opens an already parsed demo, confirms a match, and exports. It
  does not import or parse either CSV while recording requests.
- Fix: attach request logging before navigation, import both sample CSVs, map
  them, match, and export before asserting the complete request inventory.

### Minor — structure and metadata

#### F-1-16 — Headers are not consistent across routes

- Location: home/demo header is “Demo · Workspace · Get Plus”; privacy, terms,
  and 404 use “Demo · Privacy · Terms”.
- Why: Privacy is absent from the app header, while Workspace and Plus disappear
  on legal routes. The required shared skeleton calls for a consistent header
  with Privacy.
- Fix: use one header component/navigation set on every route, with Home via the
  wordmark plus Demo, Workspace, and Privacy; put the Plus action consistently
  if it remains in the header.

#### F-1-17 — The designed 404 has no Open Graph or Twitter metadata

- Location: `/404.html`; `og:title`, `og:description`, `og:image`, and
  `twitter:card` are absent.
- Why: every other route has the required route metadata; the 404 is an
  exception to the stated per-route contract.
- Fix: add 404-specific OG/Twitter title and description and reuse the product's
  1200 × 630 image.

#### F-1-18 — The privacy H1 is a mood heading

- Quote/location: `/privacy/`, “Privacy, kept simple.”
- Why: “kept simple” carries no policy information and the heading does not say
  what the page explains.
- Fix: use “How Matchbox Ledger stores your data.”

### Minor — copy

#### F-1-19 — “Local payment reconciliation” is jargon

- Location: landing eyebrow.
- Fix: “Match downloaded payments to invoices”.

#### F-1-20 — “Private by design” is a slogan

- Location: landing privacy stamp.
- Fix: “Your CSV data stays in this browser”. Remove the now-duplicated line
  below it or use that line for the opt-in source-file detail.

#### F-1-21 — “Two lists, one deliberate match” is a mood caption

- Location: landing artwork caption.
- Fix: “Invoice and payment rows appear side by side.”

#### F-1-22 — “Set your files on the bench” is a metaphor heading

- Location: landing workspace H2.
- Fix: “Import your invoice and payment CSVs”.

#### F-1-23 — “Sample CSV” buttons do not name the result

- Location: both import trays.
- Why: the controls download files; the noun label does not say that.
- Fix: “Download sample CSV”.

#### F-1-24 — “Local custody” is jargon

- Location: landing data-section label.
- Fix: “Local data controls”.

#### F-1-25 — “Your data, in your hands” is a slogan heading

- Location: landing data-section H2.
- Fix: “Back up or clear your local workspace”.

#### F-1-26 — “Optional supporter tier” does not name the section

- Location: landing Plus-section label.
- Fix: “Paid features”.

#### F-1-27 — Two Plus buttons do not name their result

- Locations: header **Get Plus** and footer **Matchbox Plus**. Both open an
  information/purchase dialog rather than getting Plus immediately.
- Fix: label both **View Plus features**.

#### F-1-28 — “One-time supporter unlock” is an unclear dialog heading

- Location: Plus dialog eyebrow.
- Fix: “Buy or restore Matchbox Plus”.

#### F-1-29 — README uses a different, less concrete output term

- Quote/location: “exports the full reconciliation record”. The rest of the
  product calls this output a “report”.
- Fix: “The app flags payments that fit more than one invoice, requires a note
  for manual matches, and exports the full report.”

## Complete landing copy audit

Counts treat hyphenated terms, versions, and dollar amounts as one word and do
not count separator punctuation. The audit includes headings, labels, controls,
status text, footer text, and the Plus dialog because each affects the landing
experience. No item exceeds 22 words and no banned marketing adjective appears.

| # | Exact copy | Words | Result |
|---:|---|---:|---|
| 1 | Skip to matcher | 3 | Pass |
| 2 | Matchbox Ledger | 2 | Pass |
| 3 | Get Plus | 2 | F-1-27 |
| 4 | Local payment reconciliation | 3 | F-1-19 |
| 5 | Match payments to invoices from two CSVs | 7 | F-1-4 |
| 6 | For freelancers who reconcile invoices in spreadsheets or offline tools. | 10 | Pass |
| 7 | Try it with sample data | 5 | Pass |
| 8 | Opens a separate ledger with three invoices. | 7 | Pass (`demo-isolation`) |
| 9 | Choose your invoice CSV | 4 | Pass |
| 10 | Works offline after the first visit | 6 | Pass (`offline-reload`) |
| 11 | Files stay on this device | 5 | Pass (`private-workflow`, `source-opt-in`) |
| 12 | Free matcher · Plus costs $19 once | 6 | F-1-6 |
| 13 | Private by design | 3 | F-1-20 |
| 14 | Parsing and matching stay in this browser | 7 | F-1-15 |
| 15 | Two lists, one deliberate match. | 5 | F-1-21 |
| 16 | Three steps | 2 | Pass |
| 17 | How it works | 3 | Pass |
| 18 | Import both CSVs | 3 | F-1-4 |
| 19 | Choose invoice and payment columns before anything is saved. | 9 | Pass (`source-opt-in`) |
| 20 | Review each suggestion | 3 | Pass |
| 21 | Confirm clear pairs. | 3 | Pass |
| 22 | Add a note to every manual match. | 7 | Pass (`manual-note`) |
| 23 | Export the record | 3 | Pass |
| 24 | Download matched, open, and unused rows in one report. | 9 | F-1-14 |
| 25 | 01 · Prepare | 2 | Pass |
| 26 | Set your files on the bench | 6 | F-1-22 |
| 27 | CSV only · nothing leaves this device | 6 | F-1-15 |
| 28 | List A | 2 | Pass with the adjacent “Open invoices” heading |
| 29 | Open invoices | 2 | Pass |
| 30 | Invoice number and amount are required | 6 | Pass |
| 31 | Choose CSV | 2 | Pass |
| 32 | Sample CSV | 2 | F-1-23 |
| 33 | List B | 2 | Pass with the adjacent export heading |
| 34 | Bank or payment export | 4 | Pass |
| 35 | Date and amount are required | 5 | Pass |
| 36 | Choose CSV | 2 | Pass |
| 37 | Sample CSV | 2 | F-1-23 |
| 38 | Local custody | 2 | F-1-24 |
| 39 | Your data, in your hands | 5 | F-1-25 |
| 40 | Back up this workspace | 4 | Pass |
| 41 | Export invoices, payments, matches, and notes as one JSON file. | 10 | F-1-12 |
| 42 | Import it later on this or another device. | 8 | F-1-12 |
| 43 | Export backup | 2 | Pass |
| 44 | Import backup | 2 | Pass |
| 45 | Start a clean month | 4 | Pass |
| 46 | Removing a workspace clears Matchbox data from this browser. | 9 | Pass (`workspace-clearing`) |
| 47 | Export a backup first if you may need it. | 9 | Pass |
| 48 | Clear local workspace | 3 | Pass |
| 49 | Optional supporter tier | 3 | F-1-26 |
| 50 | Matchbox Plus costs $19 once | 5 | Pass (`plus-batch`) |
| 51 | The free matcher includes manual review, reports, backups, and offline use. | 11 | F-1-6 |
| 52 | Plus confirms all clear strong suggestions together and remembers repeat column mappings. | 12 | Pass (`plus-batch`, `plus-column-mappings`) |
| 53 | View Matchbox Plus | 3 | Pass |
| 54 | Match payments to invoices from two CSVs. | 7 | F-1-4 |
| 55 | Privacy | 1 | Pass |
| 56 | Terms | 1 | Pass |
| 57 | Matchbox Plus | 2 | F-1-27 |
| 58 | Built by Param Factory · v1.0.2 · repair 3 | 7 | Pass |
| 59 | Still-life artwork generated for this product with the factory image model. | 11 | Pass; provenance is documented in `.factory/design.md` |
| 60 | Ready offline | 2 | Pass (`offline-reload`) |
| 61 | Local workspace ready. | 3 | Pass |
| 62 | One-time supporter unlock | 3 | F-1-28 |
| 63 | Matchbox Plus | 2 | Pass |
| 64 | Close dialog | 2 | Pass |
| 65 | $19 once · no subscription | 4 | Pass (`plus-batch`) |
| 66 | The complete matcher, manual review, reports, backups, and offline use are free. | 12 | F-1-6 |
| 67 | Plus confirms clear strong suggestions together. | 6 | Pass (`plus-batch`) |
| 68 | It also remembers column mappings. | 5 | Pass (`plus-column-mappings`) |
| 69 | Buy Matchbox Plus | 3 | Pass |
| 70 | Checkout is hosted by Sociobot. | 5 | F-1-7 |
| 71 | Sociobot/Dodo is the merchant of record and handles refunds. | 9 | F-1-8 |
| 72 | A refund revokes the license. | 5 | F-1-9 |
| 73 | Have a license? | 3 | Pass |
| 74 | Paste it here | 3 | Pass with its visible label |
| 75 | Restore purchase | 2 | Pass |
| 76 | Privacy | 1 | Pass |
| 77 | Terms | 1 | Pass |

## Complete README copy audit

Code blocks and bare URLs are not sentences. Headings are included. No item
exceeds 22 words and no banned marketing adjective appears.

| # | Exact copy | Words | Result |
|---:|---|---:|---|
| 1 | Matchbox Ledger | 2 | Pass |
| 2 | Match payments to invoices from two CSVs. | 7 | F-1-4 |
| 3 | Matchbox Ledger is for freelancers who reconcile downloaded payments in spreadsheets or offline invoice tools. | 15 | Pass |
| 4 | Parsing and matching stay on this device. | 7 | F-1-15 |
| 5 | The app flags competing matches, requires a note for manual matches, and exports the full reconciliation record. | 17 | F-1-29 |
| 6 | Live | 1 | Pass |
| 7 | Demo | 1 | Pass |
| 8 | It opens three invoices and three payments in the separate `demo:matchbox-ledger` database. | 12 | Pass (`demo-isolation`) |
| 9 | Use Reset demo to restore the sample or Start for real to discard it. | 14 | Pass |
| 10 | How it works | 3 | Pass |
| 11 | Import an invoice CSV and map its invoice number and amount columns. | 12 | F-1-4 |
| 12 | Customer, dates, and currency are optional evidence. | 7 | Pass |
| 13 | Import a payment CSV and map its date and amount columns. | 11 | F-1-4 |
| 14 | Reference and currency are optional evidence. | 6 | Pass |
| 15 | Review suggestions. | 2 | Pass |
| 16 | Matchbox scores amount, currency, references, names, and dates. | 8 | F-1-5 |
| 17 | Competing matches are flagged and never merged. | 7 | Pass (`deterministic-review`) |
| 18 | Confirm suggestions or choose another payment. | 6 | Pass |
| 19 | Every manual match requires an audit note. | 7 | Pass (`manual-note`) |
| 20 | Export a report CSV containing matched invoices, open invoices, unused payments, evidence method, notes, and timestamps. | 16 | F-1-14 |
| 21 | The active workspace persists in browser IndexedDB. | 7 | Pass (`local-persistence`) |
| 22 | Raw source CSV text is stored only after import-time consent. | 10 | Pass (`source-opt-in`) |
| 23 | JSON backup/import carries every local record. | 6 | F-1-12 |
| 24 | Matchbox Plus | 2 | Pass |
| 25 | Manual review, CSV reports, backups, and offline use are free. | 10 | F-1-6 |
| 26 | Matchbox Plus costs $19 once. | 5 | Pass (`plus-batch`) |
| 27 | It confirms all clear strong suggestions together and remembers repeat column mappings. | 12 | Pass (`plus-batch`, `plus-column-mappings`) |
| 28 | Checkout and license verification use the Sociobot billing API. | 9 | F-1-7 |
| 29 | Reconciliation rows and totals are not included in license checks. | 10 | F-1-10 |
| 30 | Set `VITE_BILLING_BASE` at build time to override the production default, for example when the factory uses its pilot environment. | 21 | Pass as developer instruction |
| 31 | No product ID or secret is stored in this repository. | 10 | F-1-11 |
| 32 | Develop | 1 | Pass |
| 33 | Playwright is pinned to 1.58.2. | 5 | Pass |
| 34 | Its Chromium browser must be available through `PLAYWRIGHT_BROWSERS_PATH`, or install it with `npx playwright install chromium`. | 18 | Pass |
| 35 | Deploy | 1 | Pass |
| 36 | The exact production command is `npm run build`. | 8 | Pass; command verified |
| 37 | It creates the static site in `./dist`, with `dist/index.html` at its root and standalone `/privacy/` and `/terms/` pages. | 18 | Pass; build verified |
| 38 | Serve the directory over HTTPS so service workers and installation work outside localhost. | 13 | Pass as deployment instruction |
| 39 | The service worker caches the application shell. | 7 | Pass (`offline-reload`) |
| 40 | After the first online visit, saved reconciliation work continues offline. | 10 | Pass (`offline-reload`) |
| 41 | Privacy and support | 3 | Pass |
| 42 | See the privacy policy and terms. | 6 | Pass; links return 200 |
| 43 | Product scope and design rationale live in `.factory/brief.json` and `.factory/design.md`. | 10 | Pass |
| 44 | License | 1 | Pass |
| 45 | MIT. | 1 | Pass |
| 46 | See `LICENSE`. | 2 | Pass |

## Claims execution

Every command in `.factory/claims.json` was run separately from a fresh local
clone after `npm ci`. All commands exited 0.

| Claim ID | Result |
|---|---|
| `offline-reload` | Pass |
| `csv-report` | Pass; test scope finding F-1-14 |
| `private-workflow` | Pass; test scope finding F-1-15 |
| `demo-isolation` | Pass; ledger-only coverage misses F-1-2 |
| `local-persistence` | Pass |
| `source-opt-in` | Pass |
| `deterministic-review` | Pass |
| `json-backup` | Pass; test scope finding F-1-12 |
| `plus-batch` | Pass |
| `plus-column-mappings` | Pass |
| `manual-note` | Pass |
| `daily-license-check` | Pass; duration finding F-1-13 |
| `workspace-clearing` | Pass |
| `tracking-free` | Pass |
| `license-restore` | Pass |

No listed command failed. Findings F-1-4 through F-1-11 are unlisted claims;
F-1-12 through F-1-15 are assertions not fully covered by their named tests.

## Demo and privacy behavior

- Entry is one click from `/` and `/demo/` works directly.
- The persistent banner, **Reset demo**, and **Start for real** are present.
- Reset changed the live count from 2 matched back to 1 matched and 2 open.
- A seeded real IndexedDB record survived demo edits and Reset unchanged.
- Start for real removed the demo `current` record.
- During live demo load, confirm, CSV export, and offline reload, requests were
  same-origin GETs only. There were no cookies, fetch/XHR/event-source calls,
  remote fonts, or console errors. The saved match survived an offline reload.
- The localStorage exception is blocking F-1-2.

Evidence: `evidence/review-1-demo-live.json` and
`evidence/review-1-live-privacy-offline.json`.

## History check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The prior `.factory/handoff.md` described four earlier claim gaps and one mobile
touch-target defect:

- `plus-column-mappings`, `workspace-clearing`, `tracking-free`, and
  `license-restore` entries and tests exist and pass independently.
- Clearing the demo leaves no `current` IndexedDB record.
- The live mobile **Review suggestions** control passes the repository's 44 px
  target test; the live accessibility suite passed all 15 tests.

Those earlier repairs are confirmed. The handoff's broader statement that no
release-blocking defects remain is contradicted by F-1-1 through F-1-3.

## Structure, links, accessibility, and identity

- Titles, `lang`, one H1, main landmarks, descriptions, canonicals, favicon,
  Apple icon, and social metadata pass on `/`, `/demo/`, `/privacy/`, and
  `/terms/`.
- An unknown route returns HTTP 404 with the designed Matchbox page and links
  home/demo. F-1-17 records its metadata omission.
- All legitimate internal links returned 200. The Sociobot checkout endpoint
  returned 303 to hosted checkout. Both `mailto:` links are explicit. The test
  unknown URL is the only crawled 404 and is expected.
- The worker URL verifier passed `/` and `/demo/` with no console errors. The
  live Playwright axe suite passed 15/15 at desktop and 390 px. Keyboard focus
  within the Plus dialog, reduced motion, visible focus, landmarks, alt text,
  and mobile target tests pass. F-1-3 remains outside those checks.
- The glacial ceramic styling, asymmetrical porcelain surfaces, cobalt strike,
  original still life, and serif/system type pairing are distinct and match
  `.factory/design.md`; this is not a generic SaaS template.
- Footer content is complete on every route. Header consistency fails F-1-16.

## Other quality gates

Run in the review checkout:

```text
npm test          PASS — 20/20
npm run typecheck PASS
npm run lint      PASS
npm run build     PASS — dist/ created; main JS 12.13 KiB gzip
npm run test:e2e  PASS — 44/44
```

`E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e --
tests/e2e/accessibility.spec.ts` passed 15/15.

## Missed leverage

No additional feature finding is raised. The brief calls for CSV import,
deterministic suggestions, manual confirmation, local persistence, and export;
all are present. JSON backup/import supplies the useful portability step. Sync
would weaken the local-only premise, and generative AI would add network cost
and privacy exposure without improving this deterministic reconciliation job.

## What would make this perfect

Resolve every finding above, then rerun this review from a new browser profile.
The decisive acceptance evidence should show real invoice/payment rows and an
action above the fold at 390 px, prove that demo mode cannot observe or mutate
any real storage key, and prove cold hash links plus route focus. The revised
claim inventory must cover every remaining commercial, privacy, and core-job
sentence with tests that assert the full wording. After the copy, header, and
404 metadata fixes, the target is zero findings rather than a reduced list.
