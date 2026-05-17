
# Plan — Make every key land on its real button, center the menus, fix the math

Three focused passes, all in existing files. No new architecture.

## 1. Re-calibrate every hit-zone against `casio.png`

Current `keymap.ts` uses guessed pixel offsets; the arrow pad and several rows are visibly off. Fix by measuring the real image once and rewriting only the coordinate constants.

Steps:
- Open the preview with `?debug=1` (already supported) so every hit-zone shows as a translucent box.
- Take a screenshot and crop/zoom each region (D-pad, SHIFT/ALPHA row, sci pad rows A/B/C, numpad rows 1–4) to read true pixel positions on the 717×1488 source.
- Update only the constants in `src/lib/calc/keymap.ts`:
  - `R1_T`, `R1_H`, `R1_W` (top row)
  - `DP_CX`, `DP_CY`, `DP_W`, `DP_H` (D-pad — the most broken)
  - `SP_COL[]`, `SP_ROW[]`, `SP_W`, `SP_H` (sci pad)
  - `NP_COL[]`, `NP_ROW[]`, `NP_W`, `NP_H` (numpad)
- Verify by re-screenshotting with `?debug=1` and confirming each colored box sits on its physical key (especially ▲ ▼ ◄ ►, MODE, ON, REPLAY).

No structural changes to the `KEYS` array — same ids, just better geometry.

## 2. Center the LCD menus and prompts

In `src/routes/index.tsx` the `MenuView` / prompt / result blocks are top-left aligned inside the LCD box, so MODE / SETUP / EQN / TABLE prompts sit in the corner instead of filling the screen.

Changes (all in `renderLcd` and `MenuView`, no logic changes):
- Wrap each menu render in a flex container with `justifyContent: center`, `alignItems: stretch`, and a small inner grid for the 2-column option lists.
- For `MAIN` / `SETUP` / `EQN`: render as a 2-column grid centered horizontally, options vertically centered, with a small title row.
- For `PROMPT`: center the title; right-align the input value with proper baseline; keep the cursor.
- For `RESULT`: center the block vertically, keep monospace lines left-aligned within a centered column.
- Sizes: bump font to fill the LCD evenly (use `cqw` as today, just rebalanced).

## 3. Fix broken math in the engine and display→eval translation

Real bugs in `src/lib/calc/engine.ts` + `src/lib/calc/keymap.ts`:

- `√(` works but **closing paren is optional on real units** like `√9` typed without `)`. Auto-close trailing open parens before evaluation.
- `²` and `³` are translated to `^2` / `^3`, but they bind to the *next* token, not the previous one. e.g. `3² ` becomes `3^2` ✓ but `(1+2)²` becomes `(1+2)^2` ✓ — however `sin(30)²` currently breaks. Replace the regex translation with a small token walk that wraps the *previous* number/parenthesised group: `X²` → `(X)^2`, `X³` → `(X)^3`, `X⁻¹` → `(X)^(-1)`.
- `INV` (`x⁻¹`) currently inserts the literal `⁻¹` character; with the fix above it will evaluate correctly.
- `CBRT` inserts `∛(` and `displayToEval` maps it to `cbrt(` ✓ — keep, but also auto-close.
- `POW_PROMPT` (SHIFT+x²) inserts `^(` — fine, just confirm it evaluates after auto-close.
- `EXP` inserts `×10^` → eval becomes `*10^`; needs implicit parens so `2×10^3+1` parses as `2*10^(3)+1` not `2*10^3+1` (which JS handles, but precedence around unary `-` breaks `×10^-3`). Translate `×10^` to `*1e` only when followed by a signed integer; otherwise `*10**`.
- `NEG` inserts `-`; this collides with subtraction. Switch `NEG` to insert `(-` so `(-3)²` works and `-` stays as binary subtraction.
- Factorial postfix scan in `engine.ts` only handles trailing `)` or digits — extend to also wrap a preceding variable letter (e.g. `A!`).
- `decimalToFraction` is referenced by `SD` but not defined in the file — add a small continued-fraction implementation so S⇔D actually toggles.
- Result chaining: when an operator is pressed after a result, current code does `replaceAll(result + text)` — fine, but `Ans` should be inserted instead so further edits remain symbolic. Change to insert `Ans` + operator.

After these patches, sanity-check by typing in the preview:
- `√9 =` → 3
- `sin(30) =` (DEG) → 0.5
- `(2+3)² =` → 25
- `5! =` → 120
- `2×10^3 =` → 2000
- `-3² =` → -9 (matches calculator convention via `NEG` = `(-`)
- `1÷4` then `S⇔D` toggles between `0.25` and `1/4`

## Out of scope

- Natural-display fraction/√ rendering (pretty math layout)
- Persisting variables across reloads
- Matrix/Vector/Stat/Base-N modes (still stubbed)

## Files touched

- `src/lib/calc/keymap.ts` — coordinate constants + small `INSERT` tweaks (`NEG`)
- `src/lib/calc/engine.ts` — auto-close parens, postfix superscript handling, factorial on letters, `decimalToFraction` helper
- `src/routes/index.tsx` — `renderLcd` / `MenuView` centering only
