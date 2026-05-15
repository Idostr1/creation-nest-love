
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
