# Polish round 5 — complete review finding resolution

Reviewed candidate: `656816bab710f3c4d88a153bf7eee7ed6704438d`  
Review source: `b078c1b7c1a9b8167503277221775687eec6e7cd`  
Release URL: <https://offline-payment-matchbox.sociobot.in/>

Every finding in `.factory/review-1.md`, `.factory/review-4.md`, and
`.factory/review-5.md` was checked against the repaired source and regression
suite. Evidence paths named below are produced by the local and cold-live
verification steps recorded in the handoff.

| Finding | Change made | Evidence |
|---|---|---|
| F-1-1 | Kept the direct demo preview above the 390 px fold with an invoice, customer, payment reference, both amounts, and **Confirm match**. | `site.spec.ts` direct-demo fold test; `polish-5-local-demo/screenshot-mobile.png`; live `/?demo=1`. |
| F-1-2 | Kept all demo ledger, license, verdict, and mapping writes inside `demo:` namespaces; exit deletes only demo data. | `@claim:demo-isolation`; live `/?demo=1`. |
| F-1-3 | Kept post-render hash resolution, heading focus, announcement, and Back/Forward focus protection. | `site.spec.ts` cold hash/history test; live `/#workspace` and `/demo/#match-title`. |
| F-1-4 | Kept the declared, observable two-CSV matching contract. | `@claim:csv-match`; live `/?demo=1`. |
| F-1-5 | Removed unsupported scoring prose and added an observable contract for the reasons actually shown in the sample. | `@claim:matching-signals`; demo screenshot and live `/?demo=1`. |
| F-1-6 | Kept no-license manual review, CSV export, backup, and offline use available. | `@claim:free-core`. |
| F-1-7 | Kept Sociobot checkout and verify endpoints explicit and tested. | `@claim:billing-routing`. |
| F-1-8 | Kept unsupported merchant/refund-handler statements out of product and legal copy. | `.factory/copy-audit.md`; live Plus dialog and `/terms/`. |
| F-1-9 | Kept unsupported refund-revocation statements out of product and legal copy. | `.factory/copy-audit.md`; live Plus dialog and `/terms/`. |
| F-1-10 | Kept full request URL/header/body inspection proving license checks omit ledger data. | `@claim:license-request-privacy`. |
| F-1-11 | Kept the ambiguous repository-secret sentence removed. | README and copy audit review. |
| F-1-12 | Kept field-for-field backup restoration in a second clean browser context. | `@claim:json-backup`. |
| F-1-13 | Kept the exact 86,400,000 ms license-cache boundary test. | `@claim:daily-license-check`. |
| F-1-14 | Kept ordered report headers and every sample row assertion. | `@claim:csv-report`. |
| F-1-15 | Kept request capture across CSV parse, matching, and export. | `@claim:private-workflow`. |
| F-1-16 | Replaced hidden phone links with a 44 px native **Menu** disclosure containing Demo, Workspace, and Privacy; desktop links are now 44 px targets too. | `site.spec.ts` header-target test on all five routes; `polish-5-local-home/screenshot-mobile.png`; live `/`, `/privacy/`, `/terms/`, `/404.html`. |
| F-1-17 | Kept 404 canonical, Open Graph, Twitter, favicon, and touch-icon metadata. | `site.spec.ts` designed-404 test; live `/404.html`. |
| F-1-18 | Kept the policy-specific privacy heading. | `workflow.spec.ts` legal landmark test; live `/privacy/`. |
| F-1-19 | Kept the concrete downloaded-payment task wording. | `.factory/copy-audit.md`; live home. |
| F-1-20 | Kept specific browser-storage wording instead of the privacy slogan. | `@claim:private-workflow`; live home. |
| F-1-21 | Kept the concrete side-by-side artwork caption. | `.factory/copy-audit.md`; live home. |
| F-1-22 | Kept the literal CSV-import workspace heading. | `site.spec.ts` cold workspace hash test; live `/#workspace`. |
| F-1-23 | Kept both download controls result-named. | `workflow.spec.ts`; live workspace. |
| F-1-24 | Kept the local-data section label in plain words. | `.factory/copy-audit.md`; live home. |
| F-1-25 | Kept the backup/clear section heading in plain words. | `@claim:json-backup`, `@claim:workspace-clearing`; live home. |
| F-1-26 | Kept the paid section named **Paid features**. | `.factory/copy-audit.md`; live home. |
| F-1-27 | Kept Plus dialog triggers result-named. | `accessibility.spec.ts` modal test; live home/footer. |
| F-1-28 | Kept the purchase/restore dialog label in plain words. | `@claim:license-restore`; live home. |
| F-1-29 | Kept **report** as the consistent export term. | `@claim:csv-report`; README audit. |
| F-4-1 | Kept the mapping-before-save contract and its IndexedDB byte-comparison test. | `@claim:mapping-before-save`; live home. |
| F-4-2 | Kept the destructive section named **Clear this local workspace**. | `site.spec.ts` mobile first-read test; live home. |
| F-4-3 | Kept **sample workspace** as the one demo-storage term. | `.factory/copy-audit.md`; live `/?demo=1`. |
| F-5-1 | Added the accessible mobile disclosure menu and enforced 44 px desktop/mobile target tests across app, legal, and 404 routes. | `site.spec.ts` header-target test; `polish-5-local-home/screenshot-mobile.png`; live route checks above. |
| F-5-2 | Added `demo-sample`: landing, metadata, README, and the claim now say three freelancer invoices and three downloaded payments; the test asserts both three-row trays and named records. | `@claim:demo-sample`; `polish-5-local-demo/screenshot-mobile.png`; live `/demo/`. |
| F-5-3 | Added `matching-signals`: six isolated demo-only fixtures verify the visible amount, currency, invoice-reference, customer-reference, and 45-day reasons, including the 46-day boundary. | `@claim:matching-signals`; live `/?demo=1`. |

## Release verification

- Fresh clone: `npm ci`, then every one of the 22 commands listed in
  `.factory/claims.json` separately, passed.
- Local: `npm test` (23), `npm run typecheck`, `npm run lint`, `npm run build`,
  and `npm run test:e2e` (56) passed.
- Cold local URL checks passed for `/` and `/?demo=1` with no console/page
  errors, exactly one H1, `lang=en`, a main landmark, labelled buttons, and
  complete image alt attributes. Screenshots and JSON are in
  `.factory/evidence/polish-5-local-home/` and
  `.factory/evidence/polish-5-local-demo/`.
- Playwright AxeBuilder scans in the full suite found zero serious or critical
  findings on every public route at desktop and phone widths. The standalone
  axe CLI was also attempted, but its bundled ChromeDriver only supports Chrome
  152 while the preinstalled Playwright Chromium is 145; the integration scan
  is the accepted accessible-browser evidence.
- Local Lighthouse: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.0 s, LCP 1.6 s, CLS 0, TBT 80 ms. Report:
  `.factory/evidence/polish-5-lighthouse.json`.
