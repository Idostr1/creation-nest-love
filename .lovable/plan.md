
# Plan: Full Casio fx-991ES PLUS Calculator

Goal: turn the current partial overlay into a complete, working scientific calculator with menu modes, SHIFT/ALPHA secondary functions, arrow navigation, and pixel-accurate button hit-zones.

## Phase 1 — Complete the keypad (every physical button)

Add the missing buttons so all 47 keys exist as click zones. Each key gets a primary value, a SHIFT value (yellow label), and an ALPHA value (red label), driven by current modifier state.

Keys to add that are currently missing:
- Top row: REPLAY pad (▲ ▼ ◄ ►), ON
- Function rows: x⁻¹, x³, RCL, ENG, S⇔D, M+, hyp, °'″, comma
- All SHIFT secondaries (x!, nPr, nCr, %, π, e, Pol, Rec, ∫, d/dx, Σ, Π, abs, etc.)
- All ALPHA letters (A–F, X, Y, M, etc.) for variable storage

## Phase 2 — Modifier-aware press handler

Refactor `press(v)` so each button looks up its action from a table:
```
{ base: "7", shift: "nPr", alpha: "D" }
```
The active label is chosen by `shift`/`alpha` state, then consumed (modifier resets after one press, matching real hardware).

Status row on LCD shows `S` / `A` indicators when active.

## Phase 3 — Mode / Setup menus

Pressing **MODE** opens an overlay menu rendered inside the LCD area:
```
1:COMP  2:CMPLX
3:STAT  4:BASE-N
5:EQN   6:MATRIX
7:TABLE 8:VECTOR
```
Pressing **SHIFT → MODE** (SETUP) opens:
```
1:MthIO 2:LineIO
3:Deg   4:Rad   5:Gra
6:Fix   7:Sci   8:Norm
…
```
A number key while a menu is open selects that entry; AC closes it.

EQN submenu offers quadratic/cubic and 2/3-var linear systems. TABLE prompts for f(X), Start, End, Step. Each mode sets a `currentMode` state that changes how the engine evaluates input.

## Phase 4 — Arrow keys & cursor

Track a `cursorPos` integer inside `expr`. ◄ / ► move it; DEL removes the char left of the cursor; new tokens insert at the cursor. ▲ / ▼ scroll through a small history stack of previous entries (replay).

In menu mode, arrows move the menu highlight instead.

## Phase 5 — Engine upgrades

Extend `evalExpr` to support: `^`, `!`, `nPr`, `nCr`, `π`, `e`, `Ans`, `%`, `°'″`, hyperbolic (`sinh/cosh/tanh`), `x⁻¹`, `x³`, fractions (`a b/c`), and variable storage (A–F, X, Y, M). Add Pol/Rec, integral and derivative (numeric), Σ and Π (loop sums).

Per-mode evaluators:
- COMP: current behaviour
- CMPLX: complex arithmetic via `{re,im}` pairs
- BASE-N: integer math in bin/oct/dec/hex with base toggle keys
- STAT: sample list + 1-Var / 2-Var statistics
- EQN: solve quadratic/cubic + 2×2 / 3×3 linear systems
- TABLE: produce table of f(X) values
- MATRIX / VECTOR: small matrix & vector ops

## Phase 6 — Hit-zone alignment

Re-measure every button on the actual `casio.png` using a one-time calibration pass:
1. Render the image at full size
2. Click-test each zone in dev with a translucent debug overlay (toggled by `?debug=1`)
3. Update the `BTN` table coordinates until each invisible zone sits exactly on its physical key

Switch from the current ad-hoc column arrays to a single `BTNS: { v, shift, alpha, l, t, w, h }[]` array so coordinates and behaviour live together.

## Phase 7 — LCD polish

- Render expression with the cursor caret at `cursorPos`
- Auto-scroll horizontally when expression exceeds line width
- Show small mode tag (`COMP`, `CMPLX`, `STAT`, `TABLE`…) in status row
- Show `D`/`R`/`G` for angle, `FIX`/`SCI` when set
- Render menu overlays as a 2-column grid styled like the real screen

## Technical notes

- All work stays in `src/routes/index.tsx` plus new helpers in `src/lib/calc/` (engine, modes, menus, keymap)
- Suggested files:
  - `src/lib/calc/keymap.ts` — single source of truth for keys (label, shift, alpha, geometry)
  - `src/lib/calc/engine.ts` — evaluator + per-mode handlers
  - `src/lib/calc/menus.ts` — MODE / SETUP / EQN definitions
  - `src/lib/calc/state.ts` — `useCalculator()` hook (expr, cursor, mode, vars, history, menu)
- Debug overlay: when `?debug=1`, render each hit-zone with `outline: 1px dashed magenta` to make calibration visible
- No backend needed; everything is client-side

## Out of scope (can add later if wanted)

- Natural-display fraction/√ rendering (pretty-printed math) — would need a mini layout engine
- Saving variables across reloads
- Complex matrix inversion beyond 3×3
