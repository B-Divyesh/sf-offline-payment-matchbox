# Adversarial first-read review 6 — Matchbox Ledger

Reviewed: 30 August 2026  
Live URL: <https://offline-payment-matchbox.sociobot.in/>  
Reviewed repository commit: `4c62eb06f6d0bdf8724b7d42a00f9f7e3a79c7ba`

## Verdict: PASS

No findings remain. This review used new Chromium contexts at 390 × 844 and
1440 × 900, without prior cookies, storage, or service-worker state. The
landing page is clear before scrolling; the direct demo is immediate,
realistic, resettable, and isolated; every declared claim test passed from the
clean installed checkout; and no unlisted visitor-reliable claim was found.

## First screen, before scrolling

Both cold loads returned HTTP 200 with no page or console errors.

- **What it does:** “Match payments to invoices from two CSVs.”
- **For whom:** “For freelancers who reconcile invoices in spreadsheets or
  offline tools.”
- **What to click first:** **Try it with sample data**. Its adjacent helper
  says it opens a separate sample workspace with three invoices and three
  payments.

All three answers were visible without scrolling on the phone and desktop
screens. The first-screen gate passes.

## Copy audit

Word counts use visible words (not decorative separators). Every visible
landing sentence, heading, label, and control was checked. No sentence exceeds
22 words; no banned marketing adjective, unexplained jargon, mood heading,
metaphor, inconsistent product term, or non-result-naming control remains.
Claim references below point to `.factory/claims.json`; `—` means plain
descriptive copy rather than a visitor-reliable claim.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Skip to matcher | 3 | — |
| Matchbox Ledger | 2 | — |
| Menu | 1 | Opens the phone navigation |
| Match downloaded payments to invoices | 5 | Concrete eyebrow |
| Match payments to invoices from two CSVs | 7 | `csv-match` |
| For freelancers who reconcile invoices in spreadsheets or offline tools. | 10 | Clear audience |
| Try it with sample data | 5 | Result-naming action |
| Opens a separate sample workspace with three invoices and three payments. | 11 | `demo-sample`, `demo-isolation` |
| Choose your invoice CSV | 4 | Result-naming action |
| Works offline after the first visit | 6 | `offline-reload` |
| Files stay on this device | 5 | `private-workflow` |
| Free matcher · Plus costs $19 once | 6 | `free-core`, `plus-batch` |
| Your CSV data stays in this browser | 7 | `private-workflow` |
| Source CSV text is saved only when you choose it. | 10 | `source-opt-in` |
| Invoice and payment rows appear side by side. | 7 | — |
| Three steps | 2 | Section label |
| How it works | 3 | Section heading |
| Import both CSVs | 3 | Step heading |
| Choose invoice and payment columns before the app saves imported rows. | 11 | `mapping-before-save` |
| Review each suggestion | 3 | Step heading |
| Confirm clear pairs. | 3 | `deterministic-review` |
| Add a note to every manual match. | 7 | `manual-note` |
| Export the record | 3 | Step heading |
| Download matched, open, and unused rows in one report. | 9 | `csv-report` |
| 01 · Prepare | 2 | Section label |
| Import your invoice and payment CSVs | 6 | Task heading |
| CSV only · nothing leaves this device | 6 | `private-workflow` |
| List A | 2 | — |
| Open invoices | 2 | — |
| Invoice number and amount are required | 6 | Import instruction |
| Choose CSV | 2 | Result-naming action |
| Download sample CSV (shown twice) | 3 | Result-naming action |
| List B | 2 | — |
| Bank or payment export | 4 | — |
| Date and amount are required | 5 | Import instruction |
| Local data controls | 3 | Section label |
| Back up or clear your local workspace | 7 | Section heading |
| Back up this workspace | 4 | Subheading |
| Export invoices, payments, matches, and notes as one JSON file. | 10 | `json-backup` |
| Import it later on this or another device. | 8 | `json-backup` |
| Export backup | 2 | Result-naming action |
| Import backup | 2 | Result-naming action |
| Clear this local workspace | 4 | Destructive-action heading |
| Removing a workspace clears Matchbox data from this browser. | 9 | `workspace-clearing` |
| Export a backup first if you may need it. | 9 | Useful warning |
| Clear local workspace | 3 | Result-naming action |
| Paid features | 2 | Section heading |
| Matchbox Plus costs $19 once | 5 | `plus-batch` |
| The free matcher includes manual review, reports, backups, and offline use. | 11 | `free-core` |
| Plus confirms all clear strong suggestions together and remembers repeat column mappings. | 11 | `plus-batch`, `plus-column-mappings` |
| View Plus features (shown twice) | 3 | Result-naming action |
| Match payments to invoices from two CSVs. | 7 | `csv-match` |
| Privacy | 1 | Route link |
| Terms | 1 | Route link |
| Built by Param Factory · v1.0.5 · build 79fc49f · Still-life artwork generated for this product with the factory image model. | 17 | Asset provenance |
| Ready offline | 2 | Status, supported by `offline-reload` |
| Local workspace ready. | 3 | Current-state status |

The direct-demo copy also remains clear: “Demo — sample data, nothing is saved
to your workspace” is covered by `demo-isolation`; the record-count and
freelancer/payment wording are covered by `demo-sample`; and the displayed
amount, currency, reference, customer, and 45-day evidence are covered by
`matching-signals`. **Reset demo**, **Start for real**, and **Confirm match**
name their outcomes. The Plus dialog's $19, free-core, checkout, and restore
statements are respectively covered by `plus-batch`, `free-core`,
`billing-routing`, and `license-restore`.

### README

| Sentence, heading, or label | Words | Check |
| --- | ---: | --- |
| Matchbox Ledger | 2 | Title |
| Match payments to invoices from two CSVs. | 7 | `csv-match` |
| Matchbox Ledger is for freelancers who reconcile downloaded payments in spreadsheets or offline invoice tools. | 15 | Clear audience |
| Parsing and matching stay on this device. | 7 | `private-workflow` |
| The app flags competing matches, requires a note for manual matches, and exports the full report. | 16 | `deterministic-review`, `manual-note`, `csv-report` |
| Live | 1 | Link label |
| Demo | 1 | Link label |
| The sample workspace opens with three freelancer invoices and three downloaded payments in the separate `demo:matchbox-ledger` database. | 17 | `demo-sample`, `demo-isolation` |
| Use **Reset demo** to restore the sample or **Start for real** to discard it. | 14 | `demo-isolation` |
| How it works | 3 | Heading |
| Import an invoice CSV and map its invoice number and amount columns. | 12 | Instruction |
| Import a payment CSV and map its date and amount columns. | 11 | Instruction |
| Review suggestions. | 2 | Instruction |
| Competing matches are flagged and never merged. | 7 | `deterministic-review` |
| Confirm suggestions or choose another payment. | 6 | Instruction |
| Every manual match requires an audit note. | 7 | `manual-note` |
| Export a report CSV containing matched invoices, open invoices, unused payments, evidence method, notes, and timestamps. | 16 | `csv-report` |
| The active workspace persists in browser IndexedDB. | 7 | `local-persistence` |
| Raw source CSV text is stored only after import-time consent. | 10 | `source-opt-in` |
| JSON backup/import carries every local record. | 6 | `json-backup` |
| Matchbox Plus | 2 | Heading |
| Manual review, CSV reports, backups, and offline use are free. | 10 | `free-core` |
| Matchbox Plus costs $19 once. | 5 | `plus-batch` |
| It confirms all clear strong suggestions together and remembers repeat column mappings. | 11 | `plus-batch`, `plus-column-mappings` |
| Checkout and license verification use the Sociobot billing API. | 9 | `billing-routing` |
| Reconciliation rows and totals are not included in license checks. | 10 | `license-request-privacy` |
| Set `VITE_BILLING_BASE` at build time to override the production default, for example when the factory uses its pilot environment. | 18 | Developer instruction |
| Develop | 1 | Heading |
| Playwright is pinned to 1.58.2. | 5 | Developer instruction |
| Its Chromium browser must be available through `PLAYWRIGHT_BROWSERS_PATH`, or install it with `npx playwright install chromium`. | 13 | Developer instruction |
| Deploy | 1 | Heading |
| The exact production command is `npm run build`. | 7 | Developer instruction |
| It creates the static site in `./dist`, with `dist/index.html` at its root and standalone `/privacy/` and `/terms/` pages. | 17 | Developer instruction |
| Serve the directory over HTTPS so service workers and installation work outside localhost. | 13 | Developer instruction |
| Each build writes its package version and full Git commit to `/release.json`. | 13 | Developer instruction |
| After deployment, run `npm run verify:identity` to prove the live files identify the checked-out commit. | 14 | Developer instruction |
| Set `LIVE_BASE_URL` to verify another deployment. | 7 | Developer instruction |
| The service worker caches the application shell. | 7 | `offline-reload` support |
| After the first online visit, saved reconciliation work continues offline. | 10 | `offline-reload`, `local-persistence` |
| Privacy and support | 3 | Heading |
| See the privacy policy and terms. | 6 | Link instruction |
| Product scope and design rationale live in `.factory/brief.json` and `.factory/design.md`. | 10 | Repository navigation |
| License | 1 | Heading |
| MIT. | 1 | License label |
| See `LICENSE`. | 2 | Repository navigation |

No README sentence exceeds 22 words. The terms **invoice**, **payment**,
**match**, **report**, **backup**, **sample workspace**, and **Matchbox Plus**
are used consistently. The complete claim-like copy inventory maps to a
declared claim; no unlisted claim was found.

## Demo, sandbox, privacy, and claims

The landing action reached `/?demo=1` in one click. Its first 390 px screen
already showed `INV-105 · Atlas Works · $425.50`, `Transfer INV-105 Atlas ·
$425.50`, and **Confirm match**. The persistent banner, **Reset demo**, and
**Start for real** were present. Reset restored the sample. After confirming a
sample match and leaving demo, the page returned to `/`, the banner and sample
record were absent, and a seeded real-storage sentinel retained its value.

The observed demo storage database was `demo:matchbox-ledger`; no demo
localStorage key was unprefixed. The direct demo request log contained only
`https://offline-payment-matchbox.sociobot.in` resources. This supports the
privacy boundary independently of the declared suite; `@claim:demo-isolation`
also performs its ten-run real-storage comparison.

After a clean `npm ci`, all 22 test commands declared by
`.factory/claims.json` were run independently with
`E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in`. Every command
passed:

| Declared claims | Result |
| --- | --- |
| `offline-reload`, `demo-sample`, `matching-signals`, `csv-report`, `csv-match`, `private-workflow`, `demo-isolation` | PASS |
| `local-persistence`, `source-opt-in`, `mapping-before-save`, `deterministic-review`, `json-backup`, `plus-batch`, `free-core` | PASS |
| `plus-column-mappings`, `manual-note`, `daily-license-check`, `billing-routing`, `license-request-privacy`, `workspace-clearing`, `tracking-free`, `license-restore` | PASS |

No claim test failed and no claim remained untested.

## Structure, accessibility, and visual identity

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` returned 200. An
  unknown route returned the designed page with HTTP 404.
- The route titles are respectively “Matchbox Ledger — match payments to
  invoices”, “Demo — Matchbox Ledger”, “Privacy — Matchbox Ledger”, “Terms —
  Matchbox Ledger”, and “Page not found — Matchbox Ledger”. Each checked route
  had exactly one H1, one main landmark, description, canonical URL, Open
  Graph/Twitter metadata, favicon, and Apple touch icon.
- The cold phone menu exposes **Demo**, **Workspace**, and **Privacy**. The
  header/footer are consistent; the required legal links are present. Cold
  hash/history focus and back/forward behavior are covered by the passing
  browser suite. Crawled product routes returned 200, with the intended 404
  exception; the checkout endpoint redirects rather than initiating a purchase.
- The live response has a self-only CSP (with the explicit Sociobot billing
  connection), `frame-ancestors` as a response header, `Referrer-Policy`, and
  `X-Content-Type-Options`. No console errors occurred on the inspected pages.
- The pale ceramic-tray system is distinct from a generic SaaS template and
  matches the palette, type, original-art provenance, and reduced-motion
  direction in `.factory/design.md`.
- The brief's obvious leverage—CSV import, deterministic review, manual
  confirmation, report export, backup, and local persistence—is present. An AI
  feature would not improve this private offline-first core workflow; no
  decorative AI path or embedded provider key was found.

## Earlier findings checked again

Every earlier review, polish report, and handoff was read. The following rows
record live and code/test confirmation, rather than relying on a prior “fixed”
label.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Direct demo shows named invoice/payment rows, amounts, and a confirmation action above the 390 px fold. |
| F-1-2 | Demo ledger/settings use `demo:` namespaces; isolation test protects real storage. |
| F-1-3 | Cold hashes, route announcement, and history focus have live regression coverage. |
| F-1-4 | `csv-match` declares and proves the two-CSV workflow. |
| F-1-5 | The prior untested scoring prose is absent; current visible signals have `matching-signals`. |
| F-1-6 | `free-core` proves the stated free workflow. |
| F-1-7 | `billing-routing` proves Sociobot billing routing. |
| F-1-8 | Merchant/refund-handler assertion remains absent. |
| F-1-9 | Refund-revocation assertion remains absent. |
| F-1-10 | `license-request-privacy` proves ledger data is excluded. |
| F-1-11 | Ambiguous repository-secret wording remains absent. |
| F-1-12 | `json-backup` proves complete restore in a clean context. |
| F-1-13 | `daily-license-check` tests the one-day boundary. |
| F-1-14 | `csv-report` asserts schema and sample output records. |
| F-1-15 | `private-workflow` exercises parsing, matching, export, and request capture. |
| F-1-16 | Consistent, usable header navigation is live on application and legal routes. |
| F-1-17 | The designed 404 has canonical, OG, and Twitter metadata. |
| F-1-18 | Privacy H1 is concrete: “How Matchbox Ledger stores your data”. |
| F-1-19 | The landing uses the concrete downloaded-payment task. |
| F-1-20 | The privacy slogan remains replaced by specific device/storage wording. |
| F-1-21 | Artwork caption concretely describes the two row types. |
| F-1-22 | The workspace heading names CSV import. |
| F-1-23 | Sample-download controls name the downloaded result. |
| F-1-24 | “Local data controls” replaces the jargon. |
| F-1-25 | Backup/clear section names the real action. |
| F-1-26 | Paid section is named “Paid features”. |
| F-1-27 | Plus controls name the dialog result. |
| F-1-28 | Plus dialog heading names buying/restoring. |
| F-1-29 | Output term is consistently “report”. |
| F-4-1 | `mapping-before-save` covers the persistence promise. |
| F-4-2 | Destructive section says “Clear this local workspace”. |
| F-4-3 | “Sample workspace” consistently names the demo boundary. |
| F-5-1 | Phone Menu is visible and usable; desktop/mobile target regression coverage is present. |
| F-5-2 | `demo-sample` covers record count and sample type. |
| F-5-3 | `matching-signals` covers every shown reason, including the date boundary. |

## Local verification

The clean checkout passed:

```text
npm ci
npm test              # 23 passed
npm run typecheck
npm run lint
npm run build         # produced dist/
```

The production build's first-load application JavaScript is 13.02 kB gzip and
the primary CSS is 5.26 kB gzip.

## What would make this perfect

No product change is required by this review. Preserve the current practice:
keep every new visitor-reliable statement in `.factory/claims.json` with an
observable demo-path test, and rerun this cold mobile audit after meaningful
copy, routing, storage, or billing changes.
