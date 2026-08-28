# Matchbox Ledger — visual thesis

## Direction: glacial minimal ceramics

Matchbox Ledger should feel like sorting receipts on a cool porcelain worktop: quiet, tactile, exact, and trustworthy. The interface is deliberately single-mode (light) because a consistent pale field makes imported financial rows easy to scan and print; the background is always explicitly painted. Depth comes from overlapping ceramic slabs, hairline blue-grey edges, and small graphite shadows—not generic cards, gradients, or glass effects.

The visual metaphor is a hand-built ceramic match tray: invoices and bank transactions are two irregular stacks that meet in the centre. A matched pair creates one deliberate cobalt “strike” mark. This makes reconciliation feel finite and physical without implying bookkeeping or bank connectivity.

## Palette

- `--ice: #f4f7f5` — explicit page background, like cold daylight on porcelain.
- `--porcelain: #fffefd` — primary working surface.
- `--slip: #e5ece9` — recessed fields and grouped rows.
- `--hairline: #c4d1cd` — borders and separators.
- `--graphite: #17211f` — primary text (contrast > 14:1 on ice).
- `--ash: #52635f` — supporting text (contrast > 5.7:1 on ice).
- `--cobalt: #174f6f` — primary action and focus (contrast > 7:1 on ice).
- `--cobalt-deep: #0e394f` — pressed action.
- `--lichen: #2f6b52` / `--lichen-wash: #e4f1e9` — confirmed/success.
- `--ochre: #8a5a12` / `--ochre-wash: #fff1cf` — ambiguous/review.
- `--oxide: #9a3f35` / `--oxide-wash: #fbe9e6` — errors and destructive actions.

Status always includes an icon or word as well as colour.

## Type

No remote font files. The display face is Georgia (bookish, invoice-like); the utility face is the local system sans stack (`Inter` when installed, then `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif). This pairing keeps the product instantly legible and avoids adding font bytes or exposing requests. Numeric columns use tabular figures.

Scale: 12 / 14 / 16 / 20 / 28 / clamp(36–58) px. Body text never drops below 16 px; 12–14 px is reserved for short labels and metadata. Reading measure caps at 68 characters.

## Spacing and shape

An 8 px base rhythm with 4 px for tight internal alignment. Main intervals are 8, 12, 16, 24, 32, 48, and 72 px. Working surfaces use 18–24 px radii with slightly asymmetric corners to suggest hand-thrown ceramics; controls use 10–14 px radii. Touch targets are at least 44 px. Desktop uses a 12-column grid; at 390 px everything stacks and nonessential descriptive copy shortens or moves below the task.

## Interaction grammar

- The app opens in a compact welcome/workbench state. The primary action is always the next unfinished step: load invoices, load transactions, review suggestions, then export.
- File inputs are large labelled “trays” with keyboard-operable native controls; drag/drop is an enhancement, never the only path.
- Suggested pairs sit adjacent in one ledger row. Exact matches show a solid cobalt strike; ambiguous suggestions use a broken ochre line and require an explicit choice.
- Confirmation is reversible. Every manual match requires a note before it can be saved. Imported data and match decisions persist locally in IndexedDB; source file bytes are stored only when the user opts in.
- Navigation uses real links; actions use buttons. Focus is a 3 px cobalt ring with a porcelain gap.

## Motion

State changes use 180–240 ms ease-out opacity and small (≤8 px) transforms: a row settles into place after confirmation, and the update toast enters from its originating bottom edge. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and updates become instant opacity changes. Meaning and depth remain through outline, scale, and surface contrast.

## Original asset plan and provenance

One generated editorial still-life is used only in the welcome/empty state: two pale ceramic trays holding abstract paper slips, separated by a single cobalt matchstick. It explains “two files become one reconciled record” without depicting a hosted bank product. Product marks and interface icons are hand-authored SVG/CSS.

Prompt sheet:

> Use case: stylized-concept. Asset type: Matchbox Ledger welcome illustration. Scene: an editorial still life on a cold off-white plaster table. Subject: two hand-built matte porcelain sorting trays, each holding a few blank warm-white paper slips; one short cobalt-blue wooden matchstick bridges the gap between the trays; subtle graphite pencil tally marks on one loose slip. Style: refined tactile product photography with gentle ceramic imperfections, quiet Scandinavian-Japanese studio restraint, no visible software interface. Composition: wide landscape crop, objects weighted to the right with calm negative space, slightly elevated 50mm lens. Lighting: soft overcast northern daylight, precise soft shadows, calm and trustworthy. Palette: glacier white, celadon grey, graphite, one restrained cobalt accent. Materials: unglazed porcelain, deckled paper, chalky plaster. Constraints: abstract financial organisation only; no coins, credit cards, people, brands, legible writing, logos, text, watermark, gradients, or saturated colours.

Generated with the factory Azure image deployment (`factory-image`) on 2026-08-28. Original generation output and prompt sidecar are retained in `assets/src/`; production WebP is derived locally. The generated image is original project artwork and is disclosed in the footer.

## Accessibility and performance intent

The pale palette is not low-contrast: all operative text and borders meet WCAG AA, focus is ≥3:1, and states are named. The hero has explicit dimensions and a ≤300 KB responsive WebP; it is eagerly loaded only on the welcome state. Initial JavaScript stays below 200 KB and CSS below 50 KB. The app remains fully usable at 200% zoom and 390 px width.
