# Polish round 4 — cumulative finding resolution

Reviewed bases: candidate `5328b4ba58ba66279075d5b596d82b02359ef314`, review `b0b001241667bf0de17f850b74f42d45b466b35b`  
Repaired application commit: `da4aaa102f43ba1572108be1176701782803c47b`  
Live: <https://offline-payment-matchbox.sociobot.in/>

Every finding in `.factory/review-1.md` and `.factory/review-4.md` was checked against current code and the deployed site. Earlier fixes were retained and re-tested; round 4 changes are identified explicitly below.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Retained the 390 px demo preview with a real invoice, customer, payment reference, two amounts, and **Confirm match** above the fold. | `site.spec.ts` “opens the direct demo…”; `.factory/evidence/polish-4-live-demo/screenshot-mobile.png`; live `/?demo=1`. |
| F-1-2 | Retained separate `demo:` IndexedDB, license, verdict, and mapping namespaces; leaving demo clears only demo data. | `@claim:demo-isolation` byte-compares seeded real storage after imports and exit; live `/?demo=1`. |
| F-1-3 | Retained cold hash/Back/Forward heading focus and fixed a delayed hash callback that could override newly moved keyboard focus. | `site.spec.ts` cold hash/history test; `accessibility.spec.ts` delayed hash focus regression; 40/40 repeated live passes. |
| F-1-4 | Retained the `csv-match` contract for two shipped CSV inputs and observable suggestions. | `@claim:csv-match`; live full browser suite. |
| F-1-5 | Kept the unsupported five-signal scoring sentence out of README and landing copy. | `claims.test.ts` inventory; `.factory/copy-audit.md`. |
| F-1-6 | Retained no-license manual review, report, backup, and offline coverage. | `@claim:free-core`; live full browser suite. |
| F-1-7 | Retained explicit Sociobot checkout and verification routing coverage. | `@claim:billing-routing`; live Plus dialog. |
| F-1-8 | Kept merchant/refund-handler assertions out of product and legal copy; buyers are directed to checkout terms. | `.factory/copy-audit.md`; live `/terms/` and Plus dialog. |
| F-1-9 | Kept unproved refund-revocation assertions out of product and legal copy. | Source/copy audit; live `/terms/`. |
| F-1-10 | Retained URL/header/body inspection proving license checks exclude reconciliation values. | `@claim:license-request-privacy`. |
| F-1-11 | Kept the ambiguous repository-secret sentence removed. | README audit and `claims.test.ts`. |
| F-1-12 | Retained field-for-field JSON backup restoration in a second clean browser context. | `@claim:json-backup`. |
| F-1-13 | Retained clock-controlled checks immediately before and after 86,400,000 ms. | `@claim:daily-license-check`. |
| F-1-14 | Retained exact ordered report headers and all sample row identities/content. | `@claim:csv-report`. |
| F-1-15 | Retained request capture across two CSV parses, matching, and report export. | `@claim:private-workflow`. |
| F-1-16 | Retained Demo, Workspace, and Privacy navigation on app, legal, and 404 routes. | `site.spec.ts` shared-header test; live `/`, `/privacy/`, `/terms/`, `/404.html`. |
| F-1-17 | Retained 404-specific canonical, Open Graph, Twitter, favicon, and touch-icon metadata. | `site.spec.ts` designed 404 test; live unknown URL returned the designed page with HTTP 404. |
| F-1-18 | Retained the policy-specific H1 “How Matchbox Ledger stores your data”. | `workflow.spec.ts` legal landmark test; live `/privacy/`. |
| F-1-19 | Kept “Local payment reconciliation” replaced by the concrete downloaded-payment task. | `.factory/copy-audit.md`; `.factory/evidence/polish-4-live-home/screenshot-mobile.png`. |
| F-1-20 | Kept “Private by design” replaced by specific browser-storage wording. | `@claim:private-workflow`; live home screenshot. |
| F-1-21 | Kept the artwork caption as “Invoice and payment rows appear side by side.” | `.factory/copy-audit.md`; live home screenshot. |
| F-1-22 | Kept the workspace heading as “Import your invoice and payment CSVs”. | `site.spec.ts` cold workspace hash test; live `/#workspace`. |
| F-1-23 | Kept both controls as “Download sample CSV”. | `workflow.spec.ts`; live workspace. |
| F-1-24 | Kept “Local custody” replaced by “Local data controls”. | `.factory/copy-audit.md`; live home screenshot. |
| F-1-25 | Kept the data section named “Back up or clear your local workspace”. | `@claim:json-backup`, `@claim:workspace-clearing`; live home screenshot. |
| F-1-26 | Kept the paid section named “Paid features”. | `.factory/copy-audit.md`; live home screenshot. |
| F-1-27 | Kept dialog triggers named “View Plus features”. | `accessibility.spec.ts` keyboard/modal test; live home and footer. |
| F-1-28 | Kept the dialog label “Buy or restore Matchbox Plus”. | `@claim:license-restore`; live Plus dialog. |
| F-1-29 | Kept “report” as the single output term in README and product copy. | `@claim:csv-report`; `.factory/copy-audit.md`. |
| F-4-1 | Rewrote the promise to name imported rows; added `mapping-before-save`. The test byte-compares demo IndexedDB while both mapping forms are open, then verifies only submitted invoice/payment rows replace storage. | `@claim:mapping-before-save`; `claims.test.ts` proves exactly one tag; live How it works section. |
| F-4-2 | Replaced “Start a clean month” with “Clear this local workspace”. | `site.spec.ts` 390 px first-read regression; live home screenshot. |
| F-4-3 | Standardized the demo boundary as a sample **workspace** in the helper, demo metadata, status, and 404 copy. “Ledger” remains only for the reconciliation record. | `site.spec.ts` first-screen test; `.factory/copy-audit.md`; live `/` and `/?demo=1`. |

## Verification evidence

- Clean-clone claim sweep: all 20 exact commands in `.factory/claims.json` passed separately after `npm ci`.
- Local final functional commit: `npm test` 23/23; typecheck and lint passed; `npm run build` produced `dist/`; `npm run test:e2e` 54/54.
- Live repaired deployment: identity matched `da4aaa102f43ba1572108be1176701782803c47b`; repeated focus/history checks passed 40/40; full browser suite passed 54/54.
- Local mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.6 s, CLS 0, TBT 0 ms. Report: `.factory/evidence/polish-4-lighthouse.json`.
- Cold URL checks: home and `?demo=1` returned 200 with zero console/page errors, one H1, `lang=en`, `<main>`, complete image alt text, and labelled buttons. Evidence: `.factory/evidence/polish-4-live-home/` and `.factory/evidence/polish-4-live-demo/`.
- Production bundle: 12.85 KB gzip initial JS and 5.05 KB gzip app CSS. The original ceramic visual system and artwork were unchanged.

No review finding remains open.
