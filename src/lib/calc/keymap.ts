// Single source of truth for every button on the calculator face.
// Coordinates are percentages of the calculator image (l=left, t=top, w/h).
// Each key has a base action and optional SHIFT / ALPHA secondary actions.

export type KeyDef = {
  id: string;
  base: string;          // primary action id
  shift?: string;        // SHIFT secondary action id
  alpha?: string;        // ALPHA secondary action id (usually a variable letter)
  l: number; t: number; w: number; h: number;
};

// ---- numpad geometry (5 cols x 4 rows) ----
const NW = 13.6;
const NH = 4.5;
const NCOL = [9.6, 26.5, 43.2, 60.0, 76.6];
const NROW = [68.3, 75.3, 82.3, 89.4];

// ---- sci pad geometry (6 cols x 3 rows) ----
const SW = 11.7;
const SH = 3.9;
const SCOL = [9.0, 22.7, 36.7, 50.7, 64.7, 78.5];

// ---- top row geometry ----
const TW = 8.3;
const TH = 4.5;

// ---- replay pad ----
const RPL = { l: 43.5, t: 33.5, w: 6.5, h: 3.0 }; // up
const RPD = { l: 43.5, t: 38.5, w: 6.5, h: 3.0 }; // down
const RPLL = { l: 37.0, t: 36.0, w: 6.5, h: 3.0 }; // left
const RPLR = { l: 50.0, t: 36.0, w: 6.5, h: 3.0 }; // right

export const KEYS: KeyDef[] = [
  // ---- top row ----
  { id: "SHIFT", base: "SHIFT",  l: 9.0,  t: 35.0, w: TW, h: TH },
  { id: "ALPHA", base: "ALPHA",  l: 22.7, t: 35.0, w: TW, h: TH },
  { id: "UP",    base: "UP",     ...RPL },
  { id: "DOWN",  base: "DOWN",   ...RPD },
  { id: "LEFT",  base: "LEFT",   ...RPLL },
  { id: "RIGHT", base: "RIGHT",  ...RPLR },
  { id: "MODE",  base: "MODE",   shift: "SETUP", l: 64.7, t: 35.0, w: TW, h: TH },
  { id: "ON",    base: "ON",                     l: 78.5, t: 35.0, w: TW, h: TH },

  // ---- sci row 1 (t=49.8) : √  x²  x⁻¹  x³  log  ln ----
  { id: "SQRT", base: "SQRT",  shift: "CBRT",        l: SCOL[0], t: 49.8, w: SW, h: SH },
  { id: "SQ",   base: "SQ",    shift: "POW_PROMPT",  l: SCOL[1], t: 49.8, w: SW, h: SH },
  { id: "INV",  base: "INV",   shift: "FACT",        l: SCOL[2], t: 49.8, w: SW, h: SH },
  { id: "CUBE", base: "CUBE",  shift: "POW",         l: SCOL[3], t: 49.8, w: SW, h: SH },
  { id: "LOG",  base: "LOG",   shift: "POW10",       l: SCOL[4], t: 49.8, w: SW, h: SH },
  { id: "LN",   base: "LN",    shift: "POWE",        l: SCOL[5], t: 49.8, w: SW, h: SH },

  // ---- sci row 2 (t=55.8) : (-)  ° ' "   hyp  sin  cos  tan ----
  { id: "NEG", base: "NEG",                              alpha: "VAR_A", l: SCOL[0], t: 55.8, w: SW, h: SH },
  { id: "DMS", base: "DMS",                              alpha: "VAR_B", l: SCOL[1], t: 55.8, w: SW, h: SH },
  { id: "HYP", base: "HYP",                                              l: SCOL[2], t: 55.8, w: SW, h: SH },
  { id: "SIN", base: "SIN",   shift: "ASIN",            alpha: "VAR_C", l: SCOL[3], t: 55.8, w: SW, h: SH },
  { id: "COS", base: "COS",   shift: "ACOS",            alpha: "VAR_D", l: SCOL[4], t: 55.8, w: SW, h: SH },
  { id: "TAN", base: "TAN",   shift: "ATAN",            alpha: "VAR_E", l: SCOL[5], t: 55.8, w: SW, h: SH },

  // ---- sci row 3 (t=61.4) : RCL  ENG  (  )  S⇔D  M+ ----
  { id: "RCL",  base: "RCL", shift: "STO",   l: SCOL[0], t: 61.4, w: SW, h: SH },
  { id: "ENG",  base: "ENG",                 l: SCOL[1], t: 61.4, w: SW, h: SH },
  { id: "LP",   base: "LP",  shift: "PCT",   l: SCOL[2], t: 61.4, w: SW, h: SH },
  { id: "RP",   base: "RP",  shift: "COMMA", l: SCOL[3], t: 61.4, w: SW, h: SH },
  { id: "SD",   base: "SD",                  l: SCOL[4], t: 61.4, w: SW, h: SH },
  { id: "MPLUS",base: "MPLUS", shift: "MMINUS", alpha: "VAR_M", l: SCOL[5], t: 61.4, w: SW, h: SH },

  // ---- numpad row 1 (t=68.3) : 7 8 9 DEL AC ----
  { id: "D7",  base: "D7",  shift: "NPR",        l: NCOL[0], t: NROW[0], w: NW, h: NH },
  { id: "D8",  base: "D8",  shift: "NCR",        l: NCOL[1], t: NROW[0], w: NW, h: NH },
  { id: "D9",  base: "D9",                       l: NCOL[2], t: NROW[0], w: NW, h: NH },
  { id: "DEL", base: "DEL", shift: "INS",        l: NCOL[3], t: NROW[0], w: NW, h: NH },
  { id: "AC",  base: "AC",  shift: "OFF",        l: NCOL[4], t: NROW[0], w: NW, h: NH },

  // ---- numpad row 2 (t=75.3) : 4 5 6 × ÷ ----
  { id: "D4",  base: "D4",                                       l: NCOL[0], t: NROW[1], w: NW, h: NH },
  { id: "D5",  base: "D5",                                       l: NCOL[1], t: NROW[1], w: NW, h: NH },
  { id: "D6",  base: "D6",                                       l: NCOL[2], t: NROW[1], w: NW, h: NH },
  { id: "MUL", base: "MUL",                                      l: NCOL[3], t: NROW[1], w: NW, h: NH },
  { id: "DIV", base: "DIV", alpha: "VAR_F",                      l: NCOL[4], t: NROW[1], w: NW, h: NH },

  // ---- numpad row 3 (t=82.3) : 1 2 3 + - ----
  { id: "D1",  base: "D1",                       l: NCOL[0], t: NROW[2], w: NW, h: NH },
  { id: "D2",  base: "D2",                       l: NCOL[1], t: NROW[2], w: NW, h: NH },
  { id: "D3",  base: "D3",                       l: NCOL[2], t: NROW[2], w: NW, h: NH },
  { id: "ADD", base: "ADD", shift: "ABS",        l: NCOL[3], t: NROW[2], w: NW, h: NH },
  { id: "SUB", base: "SUB",                      l: NCOL[4], t: NROW[2], w: NW, h: NH },

  // ---- numpad row 4 (t=89.4) : 0 . EXP Ans = ----
  { id: "D0",  base: "D0",                       l: NCOL[0], t: NROW[3], w: NW, h: NH },
  { id: "DOT", base: "DOT",                      l: NCOL[1], t: NROW[3], w: NW, h: NH },
  { id: "EXP", base: "EXP", shift: "PI",         l: NCOL[2], t: NROW[3], w: NW, h: NH },
  { id: "ANS", base: "ANS", shift: "EULER",      alpha: "VAR_X", l: NCOL[3], t: NROW[3], w: NW, h: NH },
  { id: "EQ",  base: "EQ",                       alpha: "VAR_Y", l: NCOL[4], t: NROW[3], w: NW, h: NH },
];

// What text to insert into the visible expression for each action id.
// Empty = handled specially (modifiers, =, AC, navigation, menu, etc.)
export const INSERT: Record<string, string> = {
  D0: "0", D1: "1", D2: "2", D3: "3", D4: "4",
  D5: "5", D6: "6", D7: "7", D8: "8", D9: "9",
  DOT: ".", ADD: "+", SUB: "-", MUL: "×", DIV: "÷",
  LP: "(", RP: ")", COMMA: ",",
  EXP: "×10^", PI: "π", EULER: "e", ANS: "Ans", NEG: "-",
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
