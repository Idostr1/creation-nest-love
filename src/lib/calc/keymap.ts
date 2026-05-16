// Single source of truth for every button on the calculator face.
// Coordinates are percentages of the calculator image (l=left, t=top, w/h).
// Image: 1024 x 1024 (AI-generated Casio fx-991ES PLUS, layout matches the
// physical reference spec in Casio_Physical_Layout_Reference.xlsx).

export type KeyDef = {
  id: string;
  base: string;
  shift?: string;
  alpha?: string;
  l: number; t: number; w: number; h: number;
};

const px = (x: number) => +(x / 1024 * 100).toFixed(2);
const py = (y: number) => +(y / 1024 * 100).toFixed(2);

// Row Y centers (in original 1024px image coords)
const RB_CY = py(305);   // round buttons: SHIFT / ALPHA / D-pad / MODE / ON
const RB_H  = py(60);    // round-button hit height

// Sci rows
const R_CALC = py(393);  // Row 2: CALC ∫dx x⁻¹ log□  (4 wide)
const R_FRAC = py(462);  // Row 3: a/b √ x² xⁿ        (4 wide)
const R_LOG  = py(531);  // Row 4: log ln              (2 wide, left)
const R_TRIG = py(612);  // Row 5: (-) °'" hyp sin cos tan  (6 wide)
const R_RCL  = py(682);  // Row 6: RCL ENG ( ) S⇔D M+      (6 wide)
const SCI_H  = py(48);

// Numpad rows
const NP_CY = [760, 826, 892, 962].map(py);
const NP_H  = py(55);

// 4-col centers (rows 2 & 3)
const C4 = [320, 442, 580, 700].map(px);
const W4 = px(105);
// 6-col centers (rows 5 & 6)
const C6 = [290, 378, 466, 552, 640, 725].map(px);
const W6 = px(78);
// 5-col centers (numpad)
const C5 = [305, 408, 512, 614, 720].map(px);
const W5 = px(88);

const cell = (cx: number, cy: number, w: number, h: number) => ({
  l: +(cx - w / 2).toFixed(2),
  t: +(cy - h / 2).toFixed(2),
  w, h,
});

export const KEYS: KeyDef[] = [
  // ── Top round buttons + D-pad ─────────────────────────────
  { id: "SHIFT", base: "SHIFT", ...cell(px(308), RB_CY, px(60), RB_H) },
  { id: "ALPHA", base: "ALPHA", ...cell(px(395), RB_CY, px(60), RB_H) },
  { id: "UP",    base: "UP",    ...cell(px(513), py(275), px(48), py(28)) },
  { id: "DOWN",  base: "DOWN",  ...cell(px(513), py(338), px(48), py(28)) },
  { id: "LEFT",  base: "LEFT",  ...cell(px(478), py(306), px(32), py(40)) },
  { id: "RIGHT", base: "RIGHT", ...cell(px(548), py(306), px(32), py(40)) },
  { id: "MODE",  base: "MODE",  shift: "SETUP", ...cell(px(629), RB_CY, px(60), RB_H) },
  { id: "ON",    base: "ON",                    ...cell(px(716), RB_CY, px(60), RB_H) },

  // ── Row 2 (4 wide): CALC  ∫dx  x⁻¹  log_a(b) ─────────────
  { id: "CALC",  base: "CALC", shift: "SOLVE",                 ...cell(C4[0], R_CALC, W4, SCI_H) },
  { id: "INTG",  base: "INTG", shift: "DIFF", alpha: "SUM",    ...cell(C4[1], R_CALC, W4, SCI_H) },
  { id: "INV",   base: "INV",  shift: "FACT",                  ...cell(C4[2], R_CALC, W4, SCI_H) },
  { id: "LOGAB", base: "LOGAB",                                ...cell(C4[3], R_CALC, W4, SCI_H) },

  // ── Row 3 (4 wide): a/b  √  x²  xⁿ ───────────────────────
  { id: "FRAC", base: "FRAC", shift: "MIXFRAC",                ...cell(C4[0], R_FRAC, W4, SCI_H) },
  { id: "SQRT", base: "SQRT", shift: "CBRT",                   ...cell(C4[1], R_FRAC, W4, SCI_H) },
  { id: "SQ",   base: "SQ",   shift: "CUBE",  alpha: "DEC",    ...cell(C4[2], R_FRAC, W4, SCI_H) },
  { id: "POW",  base: "POW",  shift: "NTHRT", alpha: "HEX",    ...cell(C4[3], R_FRAC, W4, SCI_H) },

  // ── Row 4 (2 wide, left): log  ln ────────────────────────
  { id: "LOG",  base: "LOG",  shift: "POW10", alpha: "BIN",    ...cell(C4[0], R_LOG, W4, SCI_H) },
  { id: "LN",   base: "LN",   shift: "POWE",  alpha: "OCT",    ...cell(C4[1], R_LOG, W4, SCI_H) },

  // ── Row 5 (6): (-)  °'"  hyp  sin  cos  tan ──────────────
  { id: "NEG",  base: "NEG",                  alpha: "VAR_A",  ...cell(C6[0], R_TRIG, W6, SCI_H) },
  { id: "DMS",  base: "DMS",                  alpha: "VAR_B",  ...cell(C6[1], R_TRIG, W6, SCI_H) },
  { id: "HYP",  base: "HYP", shift: "ABS",    alpha: "VAR_C",  ...cell(C6[2], R_TRIG, W6, SCI_H) },
  { id: "SIN",  base: "SIN", shift: "ASIN",   alpha: "VAR_D",  ...cell(C6[3], R_TRIG, W6, SCI_H) },
  { id: "COS",  base: "COS", shift: "ACOS",   alpha: "VAR_E",  ...cell(C6[4], R_TRIG, W6, SCI_H) },
  { id: "TAN",  base: "TAN", shift: "ATAN",   alpha: "VAR_F",  ...cell(C6[5], R_TRIG, W6, SCI_H) },

  // ── Row 6 (6): RCL  ENG  (  )  S⇔D  M+ ──────────────────
  { id: "RCL",   base: "RCL",   shift: "STO",                   ...cell(C6[0], R_RCL, W6, SCI_H) },
  { id: "ENG",   base: "ENG",                   alpha: "VAR_Y", ...cell(C6[1], R_RCL, W6, SCI_H) },
  { id: "LP",    base: "LP",    shift: "PCT",                   ...cell(C6[2], R_RCL, W6, SCI_H) },
  { id: "RP",    base: "RP",    shift: "COMMA", alpha: "VAR_X", ...cell(C6[3], R_RCL, W6, SCI_H) },
  { id: "SD",    base: "SD",                                    ...cell(C6[4], R_RCL, W6, SCI_H) },
  { id: "MPLUS", base: "MPLUS", shift: "MMINUS", alpha: "VAR_M",...cell(C6[5], R_RCL, W6, SCI_H) },

  // ── Numpad row 7: 7  8  9  DEL  AC ───────────────────────
  { id: "D7",  base: "D7",                  ...cell(C5[0], NP_CY[0], W5, NP_H) },
  { id: "D8",  base: "D8",                  ...cell(C5[1], NP_CY[0], W5, NP_H) },
  { id: "D9",  base: "D9",                  ...cell(C5[2], NP_CY[0], W5, NP_H) },
  { id: "DEL", base: "DEL", shift: "INS",   ...cell(C5[3], NP_CY[0], W5, NP_H) },
  { id: "AC",  base: "AC",  shift: "OFF",   ...cell(C5[4], NP_CY[0], W5, NP_H) },

  // ── Numpad row 8: 4  5  6  ×  ÷ ──────────────────────────
  { id: "D4",  base: "D4",                  ...cell(C5[0], NP_CY[1], W5, NP_H) },
  { id: "D5",  base: "D5",                  ...cell(C5[1], NP_CY[1], W5, NP_H) },
  { id: "D6",  base: "D6",                  ...cell(C5[2], NP_CY[1], W5, NP_H) },
  { id: "MUL", base: "MUL", shift: "NPR",   ...cell(C5[3], NP_CY[1], W5, NP_H) },
  { id: "DIV", base: "DIV", shift: "NCR",   ...cell(C5[4], NP_CY[1], W5, NP_H) },

  // ── Numpad row 9: 1  2  3  +  − ──────────────────────────
  { id: "D1",  base: "D1",                  ...cell(C5[0], NP_CY[2], W5, NP_H) },
  { id: "D2",  base: "D2",                  ...cell(C5[1], NP_CY[2], W5, NP_H) },
  { id: "D3",  base: "D3",                  ...cell(C5[2], NP_CY[2], W5, NP_H) },
  { id: "ADD", base: "ADD", shift: "POL",   ...cell(C5[3], NP_CY[2], W5, NP_H) },
  { id: "SUB", base: "SUB", shift: "REC",   ...cell(C5[4], NP_CY[2], W5, NP_H) },

  // ── Numpad row 10: 0  .  ×10ⁿ  Ans  = ────────────────────
  { id: "D0",  base: "D0",                  ...cell(C5[0], NP_CY[3], W5, NP_H) },
  { id: "DOT", base: "DOT",                 ...cell(C5[1], NP_CY[3], W5, NP_H) },
  { id: "EXP", base: "EXP", shift: "PI", alpha: "EULER", ...cell(C5[2], NP_CY[3], W5, NP_H) },
  { id: "ANS", base: "ANS",                 ...cell(C5[3], NP_CY[3], W5, NP_H) },
  { id: "EQ",  base: "EQ",                  ...cell(C5[4], NP_CY[3], W5, NP_H) },
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
