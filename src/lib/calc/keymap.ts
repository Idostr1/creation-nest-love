// Single source of truth for every button on the calculator face.
// Coordinates are percentages of the calculator image (l=left, t=top, w/h).
// Each key has a base action and optional SHIFT / ALPHA secondary actions.
//
// Image size: 717 x 1488 px.
// All percentages: l/w are % of 717px width, t/h are % of 1488px height.

export type KeyDef = {
  id: string;
  base: string;          // primary action id
  shift?: string;        // SHIFT secondary action id
  alpha?: string;        // ALPHA secondary action id (usually a variable letter)
  l: number; t: number; w: number; h: number;
};

// Helper: pixel coords → percentage
const px = (x: number) => +(x / 717 * 100).toFixed(2);
const py = (y: number) => +(y / 1488 * 100).toFixed(2);

// ============================================================
// ROW 1: SHIFT  ALPHA  [D-pad]  MODE  ON  (round buttons just below screen)
// ============================================================
const R1_T  = py(540);
const R1_H  = py(70);
const R1_W  = px(90);

// D-pad center
const DP_CX = px(358);
const DP_CY = py(620);
const DP_W  = px(62);
const DP_H  = py(42);

// SCI PAD: 6 cols × 3 rows (rectangular buttons)
const SP_W = px(95);
const SP_H = py(60);
const SP_COL = [50, 152, 253, 355, 457, 558].map(px);
const SP_ROW = [740, 815, 890].map(py);

// NUMPAD: 5 cols × 4 rows
const NP_W = px(115);
const NP_H = py(82);
const NP_COL = [48, 183, 318, 453, 588].map(px);
const NP_ROW = [985, 1075, 1163, 1250].map(py);

export const KEYS: KeyDef[] = [
  // ── Row 1 ───────────────────────────────────────────────────
  { id: "SHIFT", base: "SHIFT",          l: px(60),  t: R1_T, w: R1_W, h: R1_H },
  { id: "ALPHA", base: "ALPHA",          l: px(170), t: R1_T, w: R1_W, h: R1_H },
  // D-pad arrows
  { id: "UP",    base: "UP",    l: DP_CX - DP_W/2, t: DP_CY - DP_H*2.1, w: DP_W, h: DP_H },
  { id: "DOWN",  base: "DOWN",  l: DP_CX - DP_W/2, t: DP_CY + DP_H*1.1, w: DP_W, h: DP_H },
  { id: "LEFT",  base: "LEFT",  l: DP_CX - DP_W*2.1, t: DP_CY - DP_H/2, w: DP_W, h: DP_H },
  { id: "RIGHT", base: "RIGHT", l: DP_CX + DP_W*1.1, t: DP_CY - DP_H/2, w: DP_W, h: DP_H },
  { id: "MODE",  base: "MODE",  shift: "SETUP", l: px(478), t: R1_T, w: R1_W, h: R1_H },
  { id: "ON",    base: "ON",                    l: px(585), t: R1_T, w: R1_W, h: R1_H },

  // ── Sci row A : √x  x²  x⁻¹  10^x  log  ln ─────────────────
  { id: "SQRT", base: "SQRT",  shift: "CBRT",        l: SP_COL[0], t: SP_ROW[0], w: SP_W, h: SP_H },
  { id: "SQ",   base: "SQ",    shift: "POW_PROMPT",  l: SP_COL[1], t: SP_ROW[0], w: SP_W, h: SP_H },
  { id: "INV",  base: "INV",   shift: "FACT",         l: SP_COL[2], t: SP_ROW[0], w: SP_W, h: SP_H },
  { id: "CUBE", base: "CUBE",  shift: "POW",          l: SP_COL[3], t: SP_ROW[0], w: SP_W, h: SP_H },
  { id: "LOG",  base: "LOG",   shift: "POW10",        l: SP_COL[4], t: SP_ROW[0], w: SP_W, h: SP_H },
  { id: "LN",   base: "LN",    shift: "POWE",         l: SP_COL[5], t: SP_ROW[0], w: SP_W, h: SP_H },

  // ── Sci row B : (-)  °'"  hyp  sin  cos  tan ────────────────
  { id: "NEG",  base: "NEG",                           alpha: "VAR_A", l: SP_COL[0], t: SP_ROW[1], w: SP_W, h: SP_H },
  { id: "DMS",  base: "DMS",                           alpha: "VAR_B", l: SP_COL[1], t: SP_ROW[1], w: SP_W, h: SP_H },
  { id: "HYP",  base: "HYP",                                           l: SP_COL[2], t: SP_ROW[1], w: SP_W, h: SP_H },
  { id: "SIN",  base: "SIN",   shift: "ASIN",          alpha: "VAR_C", l: SP_COL[3], t: SP_ROW[1], w: SP_W, h: SP_H },
  { id: "COS",  base: "COS",   shift: "ACOS",          alpha: "VAR_D", l: SP_COL[4], t: SP_ROW[1], w: SP_W, h: SP_H },
  { id: "TAN",  base: "TAN",   shift: "ATAN",          alpha: "VAR_E", l: SP_COL[5], t: SP_ROW[1], w: SP_W, h: SP_H },

  // ── Sci row C : RCL  ENG  (  )  S⇔D  M+ ────────────────────
  { id: "RCL",   base: "RCL",   shift: "STO",                     l: SP_COL[0], t: SP_ROW[2], w: SP_W, h: SP_H },
  { id: "ENG",   base: "ENG",                                      l: SP_COL[1], t: SP_ROW[2], w: SP_W, h: SP_H },
  { id: "LP",    base: "LP",    shift: "PCT",                      l: SP_COL[2], t: SP_ROW[2], w: SP_W, h: SP_H },
  { id: "RP",    base: "RP",    shift: "COMMA",                    l: SP_COL[3], t: SP_ROW[2], w: SP_W, h: SP_H },
  { id: "SD",    base: "SD",                                       l: SP_COL[4], t: SP_ROW[2], w: SP_W, h: SP_H },
  { id: "MPLUS", base: "MPLUS", shift: "MMINUS", alpha: "VAR_M",  l: SP_COL[5], t: SP_ROW[2], w: SP_W, h: SP_H },

  // ── Numpad row 1 : 7  8  9  DEL  AC ────────────────────────
  { id: "D7",  base: "D7",  shift: "NPR",  l: NP_COL[0], t: NP_ROW[0], w: NP_W, h: NP_H },
  { id: "D8",  base: "D8",  shift: "NCR",  l: NP_COL[1], t: NP_ROW[0], w: NP_W, h: NP_H },
  { id: "D9",  base: "D9",                 l: NP_COL[2], t: NP_ROW[0], w: NP_W, h: NP_H },
  { id: "DEL", base: "DEL", shift: "INS",  l: NP_COL[3], t: NP_ROW[0], w: NP_W, h: NP_H },
  { id: "AC",  base: "AC",  shift: "OFF",  l: NP_COL[4], t: NP_ROW[0], w: NP_W, h: NP_H },

  // ── Numpad row 2 : 4  5  6  ×  ÷ ───────────────────────────
  { id: "D4",  base: "D4",                  l: NP_COL[0], t: NP_ROW[1], w: NP_W, h: NP_H },
  { id: "D5",  base: "D5",                  l: NP_COL[1], t: NP_ROW[1], w: NP_W, h: NP_H },
  { id: "D6",  base: "D6",                  l: NP_COL[2], t: NP_ROW[1], w: NP_W, h: NP_H },
  { id: "MUL", base: "MUL",                 l: NP_COL[3], t: NP_ROW[1], w: NP_W, h: NP_H },
  { id: "DIV", base: "DIV", alpha: "VAR_F", l: NP_COL[4], t: NP_ROW[1], w: NP_W, h: NP_H },

  // ── Numpad row 3 : 1  2  3  +  − ───────────────────────────
  { id: "D1",  base: "D1",                l: NP_COL[0], t: NP_ROW[2], w: NP_W, h: NP_H },
  { id: "D2",  base: "D2",                l: NP_COL[1], t: NP_ROW[2], w: NP_W, h: NP_H },
  { id: "D3",  base: "D3",                l: NP_COL[2], t: NP_ROW[2], w: NP_W, h: NP_H },
  { id: "ADD", base: "ADD", shift: "ABS", l: NP_COL[3], t: NP_ROW[2], w: NP_W, h: NP_H },
  { id: "SUB", base: "SUB",               l: NP_COL[4], t: NP_ROW[2], w: NP_W, h: NP_H },

  // ── Numpad row 4 : 0  .  ×10^  Ans  = ──────────────────────
  { id: "D0",  base: "D0",                              l: NP_COL[0], t: NP_ROW[3], w: NP_W, h: NP_H },
  { id: "DOT", base: "DOT",                             l: NP_COL[1], t: NP_ROW[3], w: NP_W, h: NP_H },
  { id: "EXP", base: "EXP", shift: "PI",                l: NP_COL[2], t: NP_ROW[3], w: NP_W, h: NP_H },
  { id: "ANS", base: "ANS", shift: "EULER", alpha: "VAR_X", l: NP_COL[3], t: NP_ROW[3], w: NP_W, h: NP_H },
  { id: "EQ",  base: "EQ",                 alpha: "VAR_Y", l: NP_COL[4], t: NP_ROW[3], w: NP_W, h: NP_H },
];

// What text to insert into the visible expression for each action id.
export const INSERT: Record<string, string> = {
  D0: "0", D1: "1", D2: "2", D3: "3", D4: "4",
  D5: "5", D6: "6", D7: "7", D8: "8", D9: "9",
  DOT: ".", ADD: "+", SUB: "-", MUL: "×", DIV: "÷",
  LP: "(", RP: ")", COMMA: ",",
  EXP: "×10^", PI: "π", EULER: "e", ANS: "Ans", NEG: "(-",
  SQRT: "√(", CBRT: "∛(", SQ: "²", CUBE: "³", INV: "⁻¹",
  POW: "^", POW_PROMPT: "^(",
  LOG: "log(", LN: "ln(", POW10: "10^(", POWE: "e^(",
  SIN: "sin(", COS: "cos(", TAN: "tan(",
  ASIN: "asin(", ACOS: "acos(", ATAN: "atan(",
  SINH: "sinh(", COSH: "cosh(", TANH: "tanh(",
  ASINH: "asinh(", ACOSH: "acosh(", ATANH: "atanh(",
  ABS: "abs(", FACT: "!", PCT: "%",
  VAR_A: "A", VAR_B: "B", VAR_C: "C", VAR_D: "D", VAR_E: "E",
  VAR_F: "F", VAR_X: "X", VAR_Y: "Y", VAR_M: "M",
};

// Convert visible-expression token stream to engine-evaluable string.
export function displayToEval(disp: string): string {
  return disp
    .replace(/×10\^/g, "*10^")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/√\(/g, "sqrt(")
    .replace(/∛\(/g, "cbrt(")
    .replace(/⁻¹/g, "^(-1)")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3");
}
