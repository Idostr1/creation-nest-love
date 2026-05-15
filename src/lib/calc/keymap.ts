// Single source of truth for every button on the calculator face.
// Coordinates are percentages of the calculator image (l=left, t=top, w/h).
// Image: 500 x 500 px (user-supplied Casio fx-991ES PLUS 2nd edition photo).

export type KeyDef = {
  id: string;
  base: string;
  shift?: string;
  alpha?: string;
  l: number; t: number; w: number; h: number;
};

const px = (x: number) => +(x / 500 * 100).toFixed(2);
const py = (y: number) => +(y / 500 * 100).toFixed(2);

// Round-button row Y
const RB_T = py(158), RB_H = py(22);

// Sci pad rows (4-wide row A; 6-wide rows B/C/D)
const SA_T = py(212), SA_H = py(20);     // CALC ∫dx x⁻¹ log□
const SB_T = py(240), SB_H = py(20);     // frac √ x² xⁿ log ln
const SC_T = py(269), SC_H = py(20);     // (-) °'" hyp sin cos tan
const SD_T = py(298), SD_H = py(20);     // RCL ENG ( ) S⇔D M+

// Numpad rows
const NP_H = py(28);
const NP_T = [346, 382, 418, 452].map(py);

// 4-col centers (row A)
const C4 = [150, 220, 290, 355].map(px);
const W4 = px(60);
// 6-col centers (rows B/C/D)
const C6 = [135, 182, 229, 275, 322, 368].map(px);
const W6 = px(42);
// 5-col centers (numpad)
const C5 = [148, 205, 258, 308, 358].map(px);
const W5 = px(46);

const cell = (cx: number, cy: number, w: number, h: number) => ({
  l: +(cx - w / 2).toFixed(2),
  t: +(cy - h / 2).toFixed(2),
  w, h,
});

export const KEYS: KeyDef[] = [
  // ── Top round buttons + D-pad ─────────────────────────────
  { id: "SHIFT", base: "SHIFT", ...cell(px(140), py(168), px(34), RB_H) },
  { id: "ALPHA", base: "ALPHA", ...cell(px(184), py(168), px(34), RB_H) },
  { id: "UP",    base: "UP",    ...cell(px(248), py(155), px(24), py(14)) },
  { id: "DOWN",  base: "DOWN",  ...cell(px(248), py(195), px(24), py(14)) },
  { id: "LEFT",  base: "LEFT",  ...cell(px(225), py(175), px(16), py(22)) },
  { id: "RIGHT", base: "RIGHT", ...cell(px(271), py(175), px(16), py(22)) },
  { id: "MODE",  base: "MODE",  shift: "SETUP", ...cell(px(316), py(168), px(34), RB_H) },
  { id: "ON",    base: "ON",                    ...cell(px(360), py(168), px(34), RB_H) },

  // ── Sci row A (4 wide): CALC  ∫dx  x⁻¹  log_a(b) ─────────
  { id: "CALC",  base: "CALC", shift: "SOLVE",  ...cell(C4[0], py(222), W4, SA_H) },
  { id: "INTG",  base: "INTG", shift: "DIFF",   alpha: "SUM", ...cell(C4[1], py(222), W4, SA_H) },
  { id: "INV",   base: "INV",  shift: "FACT",   ...cell(C4[2], py(222), W4, SA_H) },
  { id: "LOGAB", base: "LOGAB",                  ...cell(C4[3], py(222), W4, SA_H) },

  // ── Sci row B (6): frac  √x  x²  xⁿ  log  ln ─────────────
  { id: "FRAC", base: "FRAC", shift: "MIXFRAC",        ...cell(C6[0], SB_T, W6, SB_H) },
  { id: "SQRT", base: "SQRT", shift: "CBRT",           ...cell(C6[1], SB_T, W6, SB_H) },
  { id: "SQ",   base: "SQ",   shift: "CUBE",  alpha: "DEC", ...cell(C6[2], SB_T, W6, SB_H) },
  { id: "POW",  base: "POW",  shift: "NTHRT", alpha: "HEX", ...cell(C6[3], SB_T, W6, SB_H) },
  { id: "LOG",  base: "LOG",  shift: "POW10", alpha: "BIN", ...cell(C6[4], SB_T, W6, SB_H) },
  { id: "LN",   base: "LN",   shift: "POWE",  alpha: "OCT", ...cell(C6[5], SB_T, W6, SB_H) },

  // ── Sci row C (6): (-)  °'"  hyp  sin  cos  tan ──────────
  { id: "NEG",  base: "NEG",                            alpha: "VAR_A", ...cell(C6[0], SC_T, W6, SC_H) },
  { id: "DMS",  base: "DMS",                            alpha: "VAR_B", ...cell(C6[1], SC_T, W6, SC_H) },
  { id: "HYP",  base: "HYP", shift: "ABS",              alpha: "VAR_C", ...cell(C6[2], SC_T, W6, SC_H) },
  { id: "SIN",  base: "SIN", shift: "ASIN",             alpha: "VAR_D", ...cell(C6[3], SC_T, W6, SC_H) },
  { id: "COS",  base: "COS", shift: "ACOS",             alpha: "VAR_E", ...cell(C6[4], SC_T, W6, SC_H) },
  { id: "TAN",  base: "TAN", shift: "ATAN",             alpha: "VAR_F", ...cell(C6[5], SC_T, W6, SC_H) },

  // ── Sci row D (6): RCL  ENG  (  )  S⇔D  M+ ──────────────
  { id: "RCL",   base: "RCL",   shift: "STO",                       ...cell(C6[0], SD_T, W6, SD_H) },
  { id: "ENG",   base: "ENG",                       alpha: "VAR_Y", ...cell(C6[1], SD_T, W6, SD_H) },
  { id: "LP",    base: "LP",    shift: "PCT",                       ...cell(C6[2], SD_T, W6, SD_H) },
  { id: "RP",    base: "RP",    shift: "COMMA",     alpha: "VAR_X", ...cell(C6[3], SD_T, W6, SD_H) },
  { id: "SD",    base: "SD",                                         ...cell(C6[4], SD_T, W6, SD_H) },
  { id: "MPLUS", base: "MPLUS", shift: "MMINUS",    alpha: "VAR_M", ...cell(C6[5], SD_T, W6, SD_H) },

  // ── Numpad row 1: 7  8  9  DEL  AC ───────────────────────
  { id: "D7",  base: "D7",                          ...cell(C5[0], NP_T[0], W5, NP_H) },
  { id: "D8",  base: "D8",                          ...cell(C5[1], NP_T[0], W5, NP_H) },
  { id: "D9",  base: "D9",                          ...cell(C5[2], NP_T[0], W5, NP_H) },
  { id: "DEL", base: "DEL", shift: "INS",           ...cell(C5[3], NP_T[0], W5, NP_H) },
  { id: "AC",  base: "AC",  shift: "OFF",           ...cell(C5[4], NP_T[0], W5, NP_H) },

  // ── Numpad row 2: 4  5  6  ×  ÷ ──────────────────────────
  { id: "D4",  base: "D4",                          ...cell(C5[0], NP_T[1], W5, NP_H) },
  { id: "D5",  base: "D5",                          ...cell(C5[1], NP_T[1], W5, NP_H) },
  { id: "D6",  base: "D6",                          ...cell(C5[2], NP_T[1], W5, NP_H) },
  { id: "MUL", base: "MUL", shift: "NPR",           ...cell(C5[3], NP_T[1], W5, NP_H) },
  { id: "DIV", base: "DIV", shift: "NCR",           ...cell(C5[4], NP_T[1], W5, NP_H) },

  // ── Numpad row 3: 1  2  3  +  − ──────────────────────────
  { id: "D1",  base: "D1",                          ...cell(C5[0], NP_T[2], W5, NP_H) },
  { id: "D2",  base: "D2",                          ...cell(C5[1], NP_T[2], W5, NP_H) },
  { id: "D3",  base: "D3",                          ...cell(C5[2], NP_T[2], W5, NP_H) },
  { id: "ADD", base: "ADD", shift: "POL",           ...cell(C5[3], NP_T[2], W5, NP_H) },
  { id: "SUB", base: "SUB", shift: "REC",           ...cell(C5[4], NP_T[2], W5, NP_H) },

  // ── Numpad row 4: 0  .  ×10ⁿ  Ans  = ─────────────────────
  { id: "D0",  base: "D0",                          ...cell(C5[0], NP_T[3], W5, NP_H) },
  { id: "DOT", base: "DOT",                         ...cell(C5[1], NP_T[3], W5, NP_H) },
  { id: "EXP", base: "EXP", shift: "PI", alpha: "EULER", ...cell(C5[2], NP_T[3], W5, NP_H) },
  { id: "ANS", base: "ANS",                         ...cell(C5[3], NP_T[3], W5, NP_H) },
  { id: "EQ",  base: "EQ",                          ...cell(C5[4], NP_T[3], W5, NP_H) },
];

// What text to insert for each action id.
export const INSERT: Record<string, string> = {
  D0: "0", D1: "1", D2: "2", D3: "3", D4: "4",
  D5: "5", D6: "6", D7: "7", D8: "8", D9: "9",
  DOT: ".", ADD: "+", SUB: "-", MUL: "×", DIV: "÷",
  LP: "(", RP: ")", COMMA: ",",
  EXP: "×10^", PI: "π", EULER: "e", ANS: "Ans", NEG: "(-",
  SQRT: "√(", CBRT: "∛(", SQ: "²", CUBE: "³", INV: "⁻¹",
  POW: "^", NTHRT: "^(1/",
  LOG: "log(", LN: "ln(", POW10: "10^(", POWE: "e^(", LOGAB: "log(",
  SIN: "sin(", COS: "cos(", TAN: "tan(",
  ASIN: "asin(", ACOS: "acos(", ATAN: "atan(",
  SINH: "sinh(", COSH: "cosh(", TANH: "tanh(",
  ASINH: "asinh(", ACOSH: "acosh(", ATANH: "atanh(",
  ABS: "abs(", FACT: "!", PCT: "%",
  FRAC: "÷", MIXFRAC: "÷",
  VAR_A: "A", VAR_B: "B", VAR_C: "C", VAR_D: "D", VAR_E: "E",
  VAR_F: "F", VAR_X: "X", VAR_Y: "Y", VAR_M: "M",
};

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

export function displayToEval(disp: string): string {
  let s = disp
    .replace(/×10\^/g, "*10^")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/π/g, "pi")
    .replace(/√\(/g, "sqrt(")
    .replace(/∛\(/g, "cbrt(");
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
