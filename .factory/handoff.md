# Matchbox Ledger — review 4 handoff

## Outcome

Completed the adversarial first-read review only; no product code or deployment files were changed.

`.factory/review-4.md` records a **FAIL** with three findings:

- `F-4-1` (blocking): the landing promise about choosing columns before data is saved has no claims entry or observable sandbox test.
- `F-4-2` (minor): “Start a clean month” does not name its destructive local-workspace section.
- `F-4-3` (minor): the demo boundary is called both a ledger and a workspace.

## How verified

- Fresh live Chromium sessions at 390 × 844 and 1440 × 900 confirmed the first-read content, direct demo, Reset demo, Start for real, routing/focus, metadata, 404, links, and same-origin request behavior.
- A separate clean clone ran `npm ci`, every exact command from `.factory/claims.json`, and the aggregate tagged run: 19/19 claims passed.
- The clean clone also passed `npm test` (23 tests), `npm run typecheck`, `npm run lint`, and `npm run build`, which created `dist/`.
- Earlier `review-1`, `polish-1`, and handoff findings were rechecked live and in current source/tests; all F-1 findings remain fixed.

## Next steps

Implement the three review findings, especially the new `mapping-before-save` claim/test or a narrower copy rewrite. Then repeat the full claims inventory and cold mobile copy audit. The review itself is committed separately from product changes.
