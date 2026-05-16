# Plan — AI-generate a spec-matched calculator + realign buttons

## Goal

Generate a calculator image whose physical layout exactly matches the
attached spec, then rewrite the keymap so every button hitbox lines up
with the new image.

## The spec (from the uploaded XLSX)

The reference defines 10 physical rows:

```text
Row 1 (top):  SHIFT  ALPHA   [D-pad]   MODE   ON          (5 slots)
Row 2:        CALC   ∫dx     x⁻¹       log_a(b)            (4 wide)
Row 3:        Frac   √       x²        xⁿ                  (4 wide)
Row 4:        log    ln                                    (2 wide, left)
Row 5:        (-)    °'"     hyp       sin   cos   tan     (6 wide)
Row 6:        RCL    ENG     (         )     S⇔D   M+      (6 wide)
Row 7:        7      8       9         DEL   AC            (5 wide)
Row 8:        4      5       6         ×     ÷             (5 wide)
Row 9:        1      2       3         +     −             (5 wide)
Row 10:       0      .       ×10ⁿ      Ans   =             (5 wide)
```

Note this differs from what's currently coded: rows 3 and 4 are split
(frac/√/x²/xⁿ on row 3, then log/ln alone on row 4) instead of one
6-wide row.

## Pass 1 — Generate the image

Use `imagegen--generate_image` (premium quality, transparent background
off) to produce a clean, top-down Casio fx-991ES PLUS render at 1024x1024
with the exact row structure above. The prompt will pin:

- 1:1 framing, calculator centered, no perspective tilt
- LCD screen in the upper third
- Round black SHIFT/ALPHA/MODE/ON buttons + circular D-pad in row 1
- Grey scientific keys in rows 2–6 (with row 4 only half-filled)
- Light-grey number/operator keys in rows 7–9
- Bottom row 7–10 with the `=` key on the far right

Save to `src/assets/casio.png` (overwrite the current photo).

If the first generation has the wrong layout, regenerate up to 2 more
times with a tightened prompt rather than trying to recalibrate against
a wrong image.

## Pass 2 — Recalibrate `src/lib/calc/keymap.ts`

With the image at `?debug=1`, screenshot once and rewrite ONLY the
coordinate constants:

- `RB_T/RB_H` for the top round-button row
- D-pad cell coords (UP/DOWN/LEFT/RIGHT) centered on the REPLAY pad
- 6 new row-Y constants: `R2..R7` for sci rows, plus existing numpad rows
- Re-split row B (currently 6-wide) into:
  - **Row 3 (4 wide)**: FRAC, SQRT, SQ, POW — using the same 4-col
    centers as row 2
  - **Row 4 (2 wide, left)**: LOG, LN — first two of the 4-col centers
- Move the LOG/LN `alpha` Base-N labels (BIN/OCT) onto the new row 4
  (no logic change, just position)
- Keep rows 5/6 6-wide as before
- Keep numpad 5-wide as before

Logic in `INSERT` / `displayToEval` stays untouched — only the `KEYS[]`
positions change.

## Pass 3 — Verify

- Screenshot with `?debug=1` and visually confirm every magenta hitzone
  sits on its physical button.
- Type a quick `2+3=` to confirm numpad mapping survived.
- Confirm LCD overlay still aligns (it may need a small `top:` nudge if
  the new image has a slightly different screen position).

## Out of scope

- Changing any calculator logic, mode handling, or token navigation.
- LCD natural-display rendering.

## Files touched

- `src/assets/casio.png` (regenerated)
- `src/lib/calc/keymap.ts` (coordinates + row 3/4 split)
- `src/routes/index.tsx` (only if LCD overlay needs nudging)
