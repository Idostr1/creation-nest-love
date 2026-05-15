// Single source of truth for every button on the calculator face.
// Coordinates are percentages of the calculator image (l=left, t=top, w/h).
// Each key has a base action and optional SHIFT / ALPHA secondary actions.
//
// Image size: 900 x 1695 px (real fx-991ES product photo).
// All percentages: l/w are % of 900px width, t/h are % of 1695px height.

export type KeyDef = {
  id: string;
  base: string;          // primary action id
  shift?: string;        // SHIFT secondary action id
  alpha?: string;        // ALPHA secondary action id (usually a variable letter)
  l: number; t: number; w: number; h: number;
};

// Helper: pixel coords → percentage
const px = (x: number) => +(x / 900 * 100).toFixed(2);
const py = (y: number) => +(y / 1695 * 100).toFixed(2);

// ============================================================
// ROW 1: SHIFT  ALPHA  [D-pad]  MODE  ON  (round buttons below screen)
// ============================================================
const R1_T  = py(595);
const R1_H  = py(55);
const R1_W  = px(85);

// SCI PAD: 6 cols × 3 rows (rectangular buttons)
const SP_W = px(85);
const SP_H = py(60);
const SP_COL = [155, 252, 348, 446, 545, 645].map(px);
const SP_ROW = [810, 895, 985].map(py);

// NUMPAD: 5 cols × 4 rows (larger keys)
const NP_W = px(105);
const NP_H = py(90);
const NP_COL = [148, 268, 388, 510, 635].map(px);
const NP_ROW = [1100, 1210, 1320, 1435].map(py);

export const KEYS: KeyDef[] = [
  // ── Row 1 (round buttons) ───────────────────────────────────
  { id: "SHIFT", base: "SHIFT",                l: px(165), t: R1_T, w: R1_W, h: R1_H },
  { id: "ALPHA", base: "ALPHA",                l: px(270), t: R1_T, w: R1_W, h: R1_H },
  // D-pad arrows around REPLAY (absolute positions on the image)
  { id: "UP",    base: "UP",    l: px(420), t: py(595), w: px(70), h: py(45) },
  { id: "DOWN",  base: "DOWN",  l: px(420), t: py(745), w: px(70), h: py(45) },
  { id: "LEFT",  base: "LEFT",  l: px(355), t: py(665), w: px(50), h: py(60) },
  { id: "RIGHT", base: "RIGHT", l: px(505), t: py(665), w: px(50), h: py(60) },
  { id: "MODE",  base: "MODE",  shift: "SETUP", l: px(560), t: R1_T, w: R1_W, h: R1_H },
  { id: "ON",    base: "ON",                    l: px(670), t: R1_T, w: R1_W, h: R1_H },

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

// Wrap the operand directly preceding `idx` in parens, then append `suffix`.
// Walks backward over a number, identifier, or balanced parenthesised group.
function wrapPreceding(s: string, idx: number, suffix: string): string {
  let j = idx - 1;
  if (j < 0) return s.slice(0, idx) + suffix + s.slice(idx + 1);
  if (s[j] === ")") {
    let depth = 1; j--;
    while (j >= 0 && depth > 0) {
      if (s[j] === ")") depth++;
      else if (s[j] === "(") depth--;
      if (depth === 0) break;
      j--;
    }
    // include any function name immediately before the (
    let k = j - 1;
    while (k >= 0 && /[A-Za-z]/.test(s[k])) k--;
    j = k + 1;
  } else {
    while (j >= 0 && /[A-Za-z0-9_.]/.test(s[j])) j--;
    j++;
  }
  const operand = s.slice(j, idx);
  return s.slice(0, j) + "(" + operand + ")" + suffix + s.slice(idx + 1);
}

// Convert visible-expression token stream to engine-evaluable string.
export function displayToEval(disp: string): string {
  let s = disp
    .replace(/×10\^/g, "*10^")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/√\(/g, "sqrt(")
    .replace(/∛\(/g, "cbrt(");
  // Postfix superscripts: scan left→right and wrap the preceding operand.
  // Each pass handles one occurrence; the wrap consumes the marker so we
  // don't re-match it.
  const handle = (marker: string, suffix: string) => {
    while (true) {
      const i = s.indexOf(marker);
      if (i < 0) return;
      s = wrapPreceding(s, i, suffix);
    }
  };
  handle("⁻¹", "^(-1)");
  handle("²", "^2");
  handle("³", "^3");
  return s;
}
