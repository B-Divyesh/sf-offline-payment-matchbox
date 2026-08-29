# Adversarial first-read review 5 — Matchbox Ledger

Reviewed: 2026-08-29  
Live URL: <https://offline-payment-matchbox.sociobot.in/>  
Reviewed commit: `b99db13297b916d293411132517da0fc69f40e73`

## Verdict: FAIL

Three findings remain: the site removes its header navigation on a phone, and
the live copy makes two groups of unlisted, untested promises. A PASS requires
zero findings.

## First screen, before scrolling

Fresh Chromium contexts at 390 × 844 and 1440 × 900 returned HTTP 200 with no
console or page errors. The job, audience, and first action are clear:

- **What it does:** “Match payments to invoices from two CSVs.”
- **For whom:** “For freelancers who reconcile invoices in spreadsheets or offline tools.”
- **What to click first:** “Try it with sample data.”

At 390 px all three are visible before scrolling. This gate passes.

## Findings

### Blocking

#### F-5-1 — Phone header navigation is absent, and desktop header links miss the touch target

- **Location/evidence:** At 390 px, each `.site-header nav a` on `/`, `/demo/`,
  `/privacy/`, `/terms/`, and `/404.html` has `display: none` and a `0 × 0` box.
  `src/style.css:212-214` deliberately applies `.site-header nav a { display:
  none; }` at widths up to 900 px, without a menu or replacement navigation.
  At 1440 px, the visible **Demo**, **Workspace**, and **Privacy** links measure
  40 × 22, 77 × 22, and 51 × 22 CSS px.
- **Why a first-time visitor is lost:** On the required phone view there is no
  header path to the demo, workspace, or privacy policy; on desktop those
  navigation targets do not meet the 44 px interaction contract. This regresses
  the earlier header/touch-target findings in substance, even though the link
  markup remains in the DOM.
- **Concrete fix:** Keep a visible 44 × 44-or-larger navigation control at
  mobile widths, with an accessible menu containing Demo, Workspace, and
  Privacy. Give desktop navigation links a 44 px minimum hit area. Extend the
  browser test to assert the three header destinations are visible and at least
  44 px in both 390 px and desktop contexts.

#### F-5-2 — The advertised sample contents are not in the claims contract

- **Quote/location:** landing helper, “Opens a separate sample workspace with
  three invoices.” Direct demo lead, “Explore three freelancer invoices and
  their downloaded payments.” README repeats that the demo opens “three
  invoices and three payments”.
- **Why this fails:** These are observable promises about the one-click sample,
  but no `.factory/claims.json` entry states them. `demo-isolation` proves the
  storage boundary, not the number or kind of records. The untagged
  `site.spec.ts` visual regression is not the required declared claim test.
- **Concrete fix:** Add a declared `demo-sample` claim, e.g. “The sample
  workspace opens with three freelancer invoices and three downloaded
  payments,” and one `@claim:demo-sample` test from `/demo/` that asserts the
  counts and the named invoice/payment records. Alternatively remove the
  numerical and data-kind promises from landing and README.

#### F-5-3 — The demo states exact matching signals without a listed test

- **Quote/location:** direct demo suggestion reason: “same amount · same USD
  currency · invoice number in reference · customer name in reference · date is
  within 45 days”.
- **Why this fails:** A freelancer can reasonably rely on those reasons when
  deciding whether to confirm a financial match. `csv-match` only proves two
  CSVs yield suggestions, and `deterministic-review` only proves competing
  candidates are held for review. Neither claim nor test proves that each named
  signal is calculated correctly, or that the displayed reason matches the
  calculation. This reintroduces the class of unlisted scoring assertion raised
  as F-1-5, now in the live demo rather than README.
- **Concrete fix:** Add a `matching-signals` claim and a tagged fixture suite
  that isolates amount, currency, invoice reference, customer reference, and
  the 45-day date rule, asserting both the suggestion result and its displayed
  reason. If those details are not to be supported as a contract, replace the
  line with the already-tested “Strong suggestion”.

## Demo, sandbox, and privacy checks

The one-click action enters `/?demo=1`. The first 390 px screen already shows
`INV-105 · Atlas Works`, `Transfer INV-105 Atlas`, both $425.50 amounts, and
**Confirm match**. The persistent banner says “Demo — sample data, nothing is
saved to your workspace” and provides **Reset demo** and **Start for real**.

The declared `demo-isolation` test passes. Manual fresh-context inspection
found no unprefixed localStorage keys while in direct demo; the demo ledger is
in `demo:matchbox-ledger`. A prior non-demo landing visit had created the empty
real `matchbox-ledger` database before demo was entered, as expected; this was
not accessed by the demo flow. The direct-demo request log contained only
`https://offline-payment-matchbox.sociobot.in` requests. No cookie, remote
font, analytics, or tracking-script request was observed. Offline reload is
separately covered by the passing `offline-reload` claim.

## Claims execution

After a clean `npm ci`, every command declared in `.factory/claims.json` was
run separately against the deployed URL. All 20 passed:

| Claims | Result |
| --- | --- |
| `offline-reload`, `csv-report`, `csv-match`, `private-workflow`, `demo-isolation` | PASS |
| `local-persistence`, `source-opt-in`, `mapping-before-save`, `deterministic-review`, `json-backup` | PASS |
| `plus-batch`, `free-core`, `plus-column-mappings`, `manual-note`, `daily-license-check` | PASS |
| `billing-routing`, `license-request-privacy`, `workspace-clearing`, `tracking-free`, `license-restore` | PASS |

No declared command failed. F-5-2 and F-5-3 are inventory omissions, which the
claims contract treats as blocking.

## Copy audit

Counts use whitespace-separated words. The audit includes visible landing-page
labels, headings, controls, helper text, footer text, and README sentences.
No audited sentence exceeds 22 words or contains a banned marketing adjective.
Buttons use result-naming verbs. Flags identify the two unlisted claim groups
above; all other entries pass this copy check.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to matcher | 3 | Pass |
| Matchbox Ledger | 2 | Pass |
| Demo / Workspace / Privacy | 1 each | F-5-1: hidden on phone |
| Match downloaded payments to invoices | 5 | Pass |
| Match payments to invoices from two CSVs | 7 | `csv-match` |
| For freelancers who reconcile invoices in spreadsheets or offline tools. | 10 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a separate sample workspace with three invoices. | 8 | F-5-2 |
| Choose your invoice CSV | 4 | Pass |
| Works offline after the first visit | 6 | `offline-reload` |
| Files stay on this device | 5 | `private-workflow` |
| Free matcher · Plus costs $19 once | 7 | `free-core`, `plus-batch` |
| Your CSV data stays in this browser | 7 | `private-workflow` |
| Source CSV text is saved only when you choose it. | 10 | `source-opt-in` |
| Invoice and payment rows appear side by side. | 7 | Pass |
| Three steps / How it works | 2 / 3 | Pass |
| Import both CSVs | 3 | Pass |
| Choose invoice and payment columns before the app saves imported rows. | 11 | `mapping-before-save` |
| Review each suggestion | 3 | Pass |
| Confirm clear pairs. | 3 | `deterministic-review` |
| Add a note to every manual match. | 7 | `manual-note` |
| Export the record | 3 | Pass |
| Download matched, open, and unused rows in one report. | 9 | `csv-report` |
| 01 · Prepare / Import your invoice and payment CSVs | 2 / 6 | Pass |
| CSV only · nothing leaves this device | 6 | `private-workflow` |
| List A / Open invoices / Invoice number and amount are required | 2 / 2 / 6 | Pass |
| Choose CSV / Download sample CSV | 2 / 3 | Pass |
| List B / Bank or payment export / Date and amount are required | 2 / 4 / 6 | Pass |
| Local data controls / Back up or clear your local workspace | 3 / 7 | Pass |
| Back up this workspace | 4 | Pass |
| Export invoices, payments, matches, and notes as one JSON file. | 10 | `json-backup` |
| Import it later on this or another device. | 8 | `json-backup` |
| Export backup / Import backup | 2 / 2 | Pass |
| Clear this local workspace | 4 | Pass |
| Removing a workspace clears Matchbox data from this browser. | 9 | `workspace-clearing` |
| Export a backup first if you may need it. | 9 | Pass |
| Clear local workspace | 3 | Pass |
| Paid features / Matchbox Plus costs $19 once | 2 / 5 | `plus-batch` |
| The free matcher includes manual review, reports, backups, and offline use. | 11 | `free-core` |
| Plus confirms all clear strong suggestions together and remembers repeat column mappings. | 11 | `plus-batch`, `plus-column-mappings` |
| View Plus features | 3 | Pass |
| Match payments to invoices from two CSVs. | 7 | `csv-match` |
| Terms / Privacy | 1 each | Pass |
| Built by Param Factory · v1.0.4 · build b99db13 · Still-life artwork generated for this product with the factory image model. | 17 | Provenance |
| Ready offline | 2 | Pass |

### README

| Sentence or label | Words | Result |
| --- | ---: | --- |
| Matchbox Ledger | 2 | Pass |
| Match payments to invoices from two CSVs. | 7 | `csv-match` |
| Matchbox Ledger is for freelancers who reconcile downloaded payments in spreadsheets or offline invoice tools. | 15 | Pass |
| Parsing and matching stay on this device. | 7 | `private-workflow` |
| The app flags competing matches, requires a note for manual matches, and exports the full report. | 16 | Listed claims |
| Live: URL | 2 | Pass |
| Demo: URL | 2 | Pass |
| It opens three invoices and three payments in the separate `demo:matchbox-ledger` database. | 12 | F-5-2 |
| Use Reset demo to restore the sample or Start for real to discard it. | 14 | `demo-isolation` |
| How it works | 3 | Pass |
| Import an invoice CSV and map its invoice number and amount columns. | 12 | Pass |
| Import a payment CSV and map its date and amount columns. | 11 | Pass |
| Review suggestions. | 2 | Pass |
| Competing matches are flagged and never merged. | 7 | `deterministic-review` |
| Confirm suggestions or choose another payment. | 6 | Pass |
| Every manual match requires an audit note. | 7 | `manual-note` |
| Export a report CSV containing matched invoices, open invoices, unused payments, evidence method, notes, and timestamps. | 16 | `csv-report` |
| The active workspace persists in browser IndexedDB. | 7 | `local-persistence` |
| Raw source CSV text is stored only after import-time consent. | 10 | `source-opt-in` |
| JSON backup/import carries every local record. | 6 | `json-backup` |
| Matchbox Plus | 2 | Pass |
| Manual review, CSV reports, backups, and offline use are free. | 10 | `free-core` |
| Matchbox Plus costs $19 once. | 5 | `plus-batch` |
| It confirms all clear strong suggestions together and remembers repeat column mappings. | 11 | Listed claims |
| Checkout and license verification use the Sociobot billing API. | 9 | `billing-routing` |
| Reconciliation rows and totals are not included in license checks. | 10 | `license-request-privacy` |
| Build-time billing-base override sentence | 18 | Developer instruction |
| Develop / Deploy / Privacy and support / License | 1 / 1 / 3 / 1 | Pass |
| Playwright/browser-install sentences | 5 / 13 | Developer instruction |
| Build, release identity, HTTPS, and identity-check sentences | 7 / 17 / 13 / 13 / 14 / 7 | Developer instruction |
| The service worker caches the application shell. | 7 | Supports `offline-reload` |
| After the first online visit, saved reconciliation work continues offline. | 10 | `offline-reload`, `local-persistence` |
| See the privacy policy and terms. | 6 | Pass |
| Product scope and design rationale live in `.factory/brief.json` and `.factory/design.md`. | 10 | Repository navigation |
| MIT. See `LICENSE`. | 1 / 2 | Pass |

## Structure, routing, and visual identity

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` have the expected
  titles, one H1, one main landmark, meta description, canonical, Open Graph,
  Twitter card, favicon, and apple-touch icon. An unknown URL returns the
  designed HTTP 404. `robots.txt`, sitemap, CSP, and response headers are live.
- All crawled same-origin links returned 200. The authenticated purchase entry
  point returned HTTP 303 to Sociobot-hosted Dodo checkout. Deep links and
  back/forward focus are covered by the live 54-test suite.
- The ceramic-tray identity is distinct, uses self-hosted/original artwork, and
  aligns with `.factory/design.md`; it is not a generic SaaS template.
- The responsive header failure is recorded as F-5-1.

## History verification

Every earlier review, polish, verification, and handoff file was read. The
following checks were made against live behavior and current source/tests, not
prior status labels. All rows are confirmed fixed except where F-5-1 and F-5-3
explicitly reopen an equivalent concern.

| Earlier finding(s) | Current confirmation |
| --- | --- |
| F-1-1 | Direct demo shows a realistic invoice/payment pair and action above the 390 px fold. |
| F-1-2 | Demo ledger, license, verdict, and mappings are `demo:`-scoped; isolation test byte-compares real storage. |
| F-1-3 | Cold hashes and Back/Forward focus the destination headings in current live tests. |
| F-1-4, F-1-6, F-1-7, F-1-10, F-1-12–F-1-15 | Corresponding `csv-match`, `free-core`, billing/privacy, backup, cache, CSV, and parsing claims are declared and passed. |
| F-1-5 | The README scoring sentence remains removed; F-5-3 identifies a new live-demo version. |
| F-1-8, F-1-9, F-1-11 | Unsupported merchant/refund/repository-secret assertions remain absent. |
| F-1-16 | Same DOM header links remain on all routes, but F-5-1 finds their responsive implementation unusable on phone. |
| F-1-17, F-1-18 | 404 OG/Twitter metadata and the privacy H1 are correct. |
| F-1-19–F-1-29 | The previous jargon, slogan, metaphor, terminology, and non-result-button issues remain removed. |
| F-4-1 | `mapping-before-save` is declared and passed. |
| F-4-2, F-4-3 | “Clear this local workspace” and “sample workspace” remain in live copy. |
| Verification: invalid dates, reverse ambiguity, malformed backup | Current CSV/backup validation and matcher tests cover these cases; live full suite passes. |
| Verification: headers/cache/manifest | Live headers include CSP/Permissions-Policy and correct no-cache/immutable policy; manifest route is configured. |
| Verification: prior footer/header targets | Footer targets pass. Header targets are still defective as F-5-1. |
| Verification 2–3: checkout, rate limit, Escape focus, hero crop | Checkout now returns 303; current tests cover rate behavior/focus and the hero is landscape. |
| Verification 4: claims, first read/demo, license notice, routes | Claims exist and execute; first read/demo/license focus/routes are now covered and pass. |
| Verification 5: mapping memory and demo target | Mapping-memory claim passes; standalone demo controls pass 44 px mobile checks. |
| Verification 7 candidate identity | Live release metadata identifies `b99db13297b916d293411132517da0fc69f40e73`. |

## Verification run

`npm ci`, `npm test` (23 passed), `npm run typecheck`, `npm run lint`, and
`npm run build` all passed. The production build emitted `dist/` with 12.85 kB
gzip JavaScript. The live full Playwright suite completed with 54 passed tests.

## What would make this perfect

Ship a phone-accessible 44 px header menu (and desktop 44 px navigation hit
areas), then declare and test the advertised demo record set and every displayed
matching signal. Rerun the cold 390 px audit and all claim commands. With those
three findings resolved, no further first-read, sandbox, privacy, route, or
visual-system objection remains.
