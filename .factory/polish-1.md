# Polish round 1 — review finding resolution

Reviewed base: `62d33e05f031adf904f94ae285bae4f3e08671b4`  
Repair source: `75e98e9`, `1cc9475`, and `0f949f9`  
Live: <https://offline-payment-matchbox.sociobot.in/?demo=1>

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Added an above-the-fold sample invoice/payment pair and **Confirm match** to direct demo. | `site.spec.ts` direct-demo 390 px check; `.factory/evidence/polish-1-live/demo/screenshot-mobile.png` |
| F-1-2 | Scoped demo ledger, license, verdict, and mappings under `demo:`; Start for real clears only demo data. | `@claim:demo-isolation` byte-compares seeded real IndexedDB/localStorage before and after demo writes. |
| F-1-3 | Added post-render hash resolution, heading focus, live announcement, and Back/Forward focus handling. | `site.spec.ts` cold workspace/demo hash test, live 51-test run. |
| F-1-4 | Added the `csv-match` claim and observable two-file matching test. | `@claim:csv-match` |
| F-1-5 | Removed the unproven five-signal scoring sentence from README. | README copy audit; `npm test` claims contract. |
| F-1-6 | Added `free-core`, which completes manual review, CSV report, JSON backup, and offline reload without a license. | `@claim:free-core` |
| F-1-7 | Added `billing-routing` to inspect the checkout and recorded verification endpoints. | `@claim:billing-routing` |
| F-1-8 | Removed merchant-of-record/refund-handler assertions from product and legal copy. | copy audit and source search; live dialog check. |
| F-1-9 | Removed refund-revocation and enumerated license-state assertions from pre-purchase copy. | copy audit and live dialog check. |
| F-1-10 | Added `license-request-privacy`, which records URL, headers, and body while sample data is present. | `@claim:license-request-privacy` |
| F-1-11 | Removed the ambiguous repository-secret sentence. | README audit and `npm test` |
| F-1-12 | Rebuilt backup coverage around export in one context, import in a clean second context, and deep comparison of invoices, payments, matches, and source files. | `@claim:json-backup` |
| F-1-13 | Controlled `Date.now()` to test the exact 86,400,000 ms verification-cache boundary. | `@claim:daily-license-check` |
| F-1-14 | CSV report coverage now asserts its exact ordered schema and all sample row identities/content. | `@claim:csv-report` |
| F-1-15 | Privacy coverage now records requests before loading and performs both CSV imports, matching, and export. | `@claim:private-workflow` |
| F-1-16 | Standardised app, privacy, terms, and 404 headers on Home, Demo, Workspace, and Privacy. | `site.spec.ts` shared-header test; live URLs above |
| F-1-17 | Added 404 Open Graph and Twitter metadata. | `site.spec.ts` 404 metadata test; <https://offline-payment-matchbox.sociobot.in/404.html> |
| F-1-18 | Replaced the privacy mood H1 with “How Matchbox Ledger stores your data”. | `workflow.spec.ts` legal landmark test; live privacy URL |
| F-1-19 | Replaced “Local payment reconciliation” with “Match downloaded payments to invoices”. | `.factory/copy-audit.md`; live home screenshot |
| F-1-20 | Replaced “Private by design” with the specific browser-storage statement. | `.factory/copy-audit.md`; `@claim:private-workflow` |
| F-1-21 | Replaced the artwork mood caption with the row-side-by-side description. | `.factory/copy-audit.md`; live home screenshot |
| F-1-22 | Replaced the workspace metaphor heading with “Import your invoice and payment CSVs”. | `.factory/copy-audit.md`; cold-hash test |
| F-1-23 | Renamed both sample-download controls to “Download sample CSV”. | `.factory/copy-audit.md`; browser suites |
| F-1-24 | Replaced “Local custody” with “Local data controls”. | `.factory/copy-audit.md`; live home screenshot |
| F-1-25 | Replaced the data slogan with “Back up or clear your local workspace”. | `.factory/copy-audit.md`; live home screenshot |
| F-1-26 | Renamed the Plus label to “Paid features”. | `.factory/copy-audit.md`; live home screenshot |
| F-1-27 | Renamed header/footer dialog triggers to “View Plus features”. | keyboard/modal test and live 51-test run |
| F-1-28 | Renamed the dialog eyebrow to “Buy or restore Matchbox Plus”. | `.factory/copy-audit.md`; live dialog test |
| F-1-29 | Replaced README “reconciliation record” with the product term “report”. | README audit |

## Verification summary

- Fresh-clone claim sweep: all **19/19** commands in `.factory/claims.json` passed after `npm ci`.
- Local: `npm test` (20/20), `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:e2e` (51/51) passed.
- Live: `E2E_BASE_URL=https://offline-payment-matchbox.sociobot.in npm run test:e2e` passed **51/51** before the final metadata-only commit; the final live metadata/deep-link suite passed **6/6** after deployment `03791d24-286c-4f91-84e8-758a4998eb67`.
- `verify-url.sh` passed home and `?demo=1` with zero console/page errors, one H1, `<main>`, `lang=en`, and no missing image alt text. Live screenshots: `.factory/evidence/polish-1-live/home/screenshot-desktop.png` and `.factory/evidence/polish-1-live/demo/screenshot-mobile.png`.
- Lighthouse local production build: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.5 s, CLS 0. Report: `.factory/evidence/polish-1-local/lighthouse.json`.
