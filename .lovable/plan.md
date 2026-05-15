
# Plan — Real reference image, token-aware cursor, mode-state fix

Three focused passes addressing the three issues you raised.

## 1. Replace the calculator image with a real photo

The current `src/assets/casio.png` is an AI-generated render and the button
positions don't match a real fx-991ES PLUS, which is why every recalibration
pass leaves something off. We'll swap it for an actual product photo and then
re-measure once against the truth.

Steps:
- Download a high-resolution Casio fx-991ES PLUS product photo from a public
  source (e.g. Casio's product page or Wikimedia) using `curl`. No image
  generation.
- Save to `src/assets/casio.png` (overwrite). Keep the same import path so no
  other files need to change.
- Re-open the preview with `?debug=1`, screenshot it, and rewrite ONLY the
  pixel constants in `src/lib/calc/keymap.ts`:
  - `R1_T`, `R1_H`, `R1_W` (SHIFT/ALPHA/MODE/ON row)
  - D-pad absolute coords for `UP` / `DOWN` / `LEFT` / `RIGHT`
  - `SP_COL[]`, `SP_ROW[]`, `SP_W`, `SP_H` (sci pad — 6×3)
  - `NP_COL[]`, `NP_ROW[]`, `NP_W`, `NP_H` (numpad — 5×4, including the `=` key)
- Verify by re-screenshotting with `?debug=1`.

## 2. Token-aware cursor / DEL

Right now `expr` is a raw string and `LEFT` / `RIGHT` / `DEL` move or delete
one *character* at a time. Tokens like `Ans`, `sin(`, `log(`, `√(`, `×10^`,
`π` should behave as single units — pressing ► on `Ans` should jump 3 chars,
and DEL should remove the whole token.

Changes (logic-only, in `src/routes/index.tsx`):
- Add a small `tokenize(expr)` helper that returns the list of token strings
  in order. The token alphabet is the set of strings produced by `INSERT`
  (multi-char tokens) plus single digits / operators / parens / letters.
  Implementation: longest-match scan against a fixed list of multi-char
  tokens (`Ans`, `sin(`, `cos(`, `tan(`, `asin(`, ..., `log(`, `ln(`,
  `10^(`, `e^(`, `sqrt(`, equivalent display forms like `√(`, `∛(`, `×10^`,
  `(-`, `⁻¹`, etc.), then fall through to a single character.
- Convert character-cursor `cursor` into a token-aware step:
  - `LEFT`: find the token boundary at-or-before `cursor` and jump to the
    previous boundary.
  - `RIGHT`: jump to the next boundary.
  - `DEL`: delete the token ending at `cursor` (whole token, not one char).
- Keep `cursor` as a character index internally so insertion math doesn't
  change; the helper just snaps it to token boundaries.
- Ensure new `insert()` calls land at a clean boundary (cursor already at end
  of inserted text — no change needed).

## 3. Fix the "mode sticks visually but reverts" bug

Right now `AC` and `ON` reset `expr` / `cursor` / `result` / `menu` but do
NOT touch `calcMode`. So if you pick `5:EQN` from MODE, finish or cancel,
then press AC, the status indicator still says `EQN` but the next operations
behave like `COMP` (because EQN-only flows are gated by the menu, not by
`calcMode`).

Two related bugs to fix together:
- When `MAIN` menu picks `EQN` or `TABLE`, current code sets `calcMode` to
  `EQN`/`TABLE` AND opens the sub-menu. After the sub-flow ends, `calcMode`
  is left dangling. Fix: do NOT change `calcMode` for `EQN`/`TABLE` —
  these are one-shot flows. Only `COMP`, `CMPLX`, `STAT`, `BASE`,
  `MATRIX`, `VECTOR` should set `calcMode` from the MAIN menu.
- `ON` should also reset `calcMode` to `COMP` (real calc behaviour: ON
  returns to default COMP). `AC` should NOT change `calcMode` (it just
  clears the entry).

Files: `src/routes/index.tsx` (MAIN menu handler, `ON` branch).

## Sanity-check after the three passes

- D-pad arrows, MODE, ON, and `=` all hit their physical buttons in the new
  photo.
- Type `Ans+1`, place cursor at the end, press ◄ once → cursor jumps to
  before `+1` (not into the middle of `Ans`). DEL once removes `Ans`
  whole.
- MODE → 5 (EQN) → 1 → fill in coefficients → results show. Press AC. Status
  indicator no longer shows EQN; calculator is in COMP. Press ON; same.

## Out of scope

- Natural-display fraction/√ rendering.
- Persisting variables across reloads.
- Matrix/Vector/Stat/Base-N modes (still stubbed).

## Files touched

- `src/assets/casio.png` — replaced with real photo
- `src/lib/calc/keymap.ts` — coordinate constants only
- `src/routes/index.tsx` — token-aware cursor/DEL, MAIN menu + ON fix

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
