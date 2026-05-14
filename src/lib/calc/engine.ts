// Scientific expression engine for the calculator.
// Tokens used in the *internal* expression string (what we evaluate):
//   numbers, + - * / ^ ( ) , .
//   pi  e  ans
//   sin( cos( tan( asin( acos( atan(
//   sinh( cosh( tanh( asinh( acosh( atanh(
//   ln(  log( exp(  sqrt( cbrt( abs(
//   FACT(x)  NPR(n,r)  NCR(n,r)  PCT(x)
// Variables: A B C D E F X Y M (single uppercase letters)

export type AngleMode = "DEG" | "RAD" | "GRA";
export type Vars = Record<string, number>;

const factorial = (n: number): number => {
  if (n < 0 || !Number.isFinite(n) || Math.floor(n) !== n) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

const nPr = (n: number, r: number) => factorial(n) / factorial(n - r);
const nCr = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));

export function evalExpr(
  raw: string,
  opts: { angle: AngleMode; ans: number; vars: Vars },
): { ok: true; value: number } | { ok: false; error: string } {
  if (!raw.trim()) return { ok: true, value: 0 };

  const angleFactor =
    opts.angle === "DEG" ? Math.PI / 180 : opts.angle === "GRA" ? Math.PI / 200 : 1;
  const invAngle = 1 / angleFactor;

  // Replace constants & variables with their numeric values, then translate ^ to **.
  let s = raw;
  s = s.replace(/\bpi\b/g, `(${Math.PI})`);
  s = s.replace(/\be\b(?!xp|\d)/g, `(${Math.E})`);
  s = s.replace(/\bans\b/gi, `(${opts.ans})`);
  for (const [k, v] of Object.entries(opts.vars)) {
    s = s.replace(new RegExp(`\\b${k}\\b`, "g"), `(${v})`);
  }


  // Postfix ! → FACT(...): wrap the preceding number/group.
  // Simple approach: repeatedly find "<token>!" and rewrite.
  for (let i = 0; i < 50; i++) {
    const m = s.match(/(\)|\d+(?:\.\d+)?|[A-Za-z]+)!/);
    if (!m) break;
    const idx = s.indexOf(m[0]);
    if (m[1] === ")") {
      // find matching open paren
      let depth = 1, j = idx - 1;
      while (j >= 0 && depth > 0) {
        if (s[j] === ")") depth++;
        else if (s[j] === "(") depth--;
        if (depth === 0) break;
        j--;
      }
      s = s.slice(0, j) + "FACT" + s.slice(j, idx + 1) + s.slice(idx + 2);
    } else {
      s = s.slice(0, idx) + "FACT(" + m[1] + ")" + s.slice(idx + m[0].length);
    }
  }

  // Percent: convert "x%" to "(x/100)" — same scan idea
  for (let i = 0; i < 50; i++) {
    const m = s.match(/(\)|\d+(?:\.\d+)?)%/);
    if (!m) break;
    const idx = s.indexOf(m[0]);
    if (m[1] === ")") {
      let depth = 1, j = idx - 1;
      while (j >= 0 && depth > 0) {
        if (s[j] === ")") depth++;
        else if (s[j] === "(") depth--;
        if (depth === 0) break;
        j--;
      }
      s = s.slice(0, j) + "(" + s.slice(j, idx + 1) + "/100)" + s.slice(idx + 2);
    } else {
      s = s.slice(0, idx) + "(" + m[1] + "/100)" + s.slice(idx + m[0].length);
    }
  }

  // ^ → **
  s = s.replace(/\^/g, "**");

  // Implicit multiplication: a number or ) followed by ( → insert *
  s = s.replace(/(\d|\))(\()/g, "$1*$2");

  // Auto-close any unmatched open parens (so √9 typed as "sqrt(9" still works).
  let opens = 0;
  for (const ch of s) {
    if (ch === "(") opens++;
    else if (ch === ")") opens = Math.max(0, opens - 1);
  }
  if (opens > 0) s += ")".repeat(opens);

  // Whitelist
  if (!/^[\s0-9+\-*/().,a-zA-Z_]+$/.test(s)) return { ok: false, error: "Syntax ERROR" };

  try {
    // eslint-disable-next-line no-new-func
    const fn = Function(
      "sin", "cos", "tan", "asin", "acos", "atan",
      "sinh", "cosh", "tanh", "asinh", "acosh", "atanh",
      "ln", "log", "exp", "sqrt", "cbrt", "abs",
      "FACT", "NPR", "NCR",
      `"use strict"; return (${s});`,
    );
    const result = fn(
      (x: number) => Math.sin(x * angleFactor),
      (x: number) => Math.cos(x * angleFactor),
      (x: number) => Math.tan(x * angleFactor),
      (x: number) => Math.asin(x) * invAngle,
      (x: number) => Math.acos(x) * invAngle,
      (x: number) => Math.atan(x) * invAngle,
      Math.sinh, Math.cosh, Math.tanh, Math.asinh, Math.acosh, Math.atanh,
      Math.log, Math.log10, Math.exp, Math.sqrt, Math.cbrt, Math.abs,
      factorial, nPr, nCr,
    );
    if (typeof result !== "number" || !isFinite(result)) {
      return { ok: false, error: "Math ERROR" };
    }
    return { ok: true, value: Number(result.toPrecision(12)) };
  } catch {
    return { ok: false, error: "Syntax ERROR" };
  }
}

// Solve quadratic ax² + bx + c = 0
export type QuadResult =
  | { complex: false; x1: number; x2: number }
  | { complex: true; x1: { re: number; im: number }; x2: { re: number; im: number } };

export function solveQuadratic(a: number, b: number, c: number): QuadResult | null {
  if (a === 0) return null;
  const d = b * b - 4 * a * c;
  if (d < 0) {
    const re = -b / (2 * a);
    const im = Math.sqrt(-d) / (2 * a);
    return { complex: true, x1: { re, im }, x2: { re, im: -im } };
  }
  const r = Math.sqrt(d);
  return { complex: false, x1: (-b + r) / (2 * a), x2: (-b - r) / (2 * a) };
}

// Solve cubic ax³+bx²+cx+d=0 (real roots only, via Cardano)
export function solveCubic(a: number, b: number, c: number, d: number) {
  if (a === 0) return solveQuadratic(b, c, d);
  // normalize
  const A = b / a, B = c / a, C = d / a;
  const p = B - (A * A) / 3;
  const q = (2 * A ** 3) / 27 - (A * B) / 3 + C;
  const disc = (q * q) / 4 + (p ** 3) / 27;
  const shift = -A / 3;
  if (disc > 0) {
    const sq = Math.sqrt(disc);
    const u = Math.cbrt(-q / 2 + sq);
    const v = Math.cbrt(-q / 2 - sq);
    return [u + v + shift];
  }
  if (disc === 0) {
    const u = Math.cbrt(-q / 2);
    return [2 * u + shift, -u + shift];
  }
  const r = Math.sqrt(-(p ** 3) / 27);
  const phi = Math.acos(-q / (2 * r));
  const t = 2 * Math.cbrt(r);
  return [
    t * Math.cos(phi / 3) + shift,
    t * Math.cos((phi + 2 * Math.PI) / 3) + shift,
    t * Math.cos((phi + 4 * Math.PI) / 3) + shift,
  ];
}

// Solve 2x2 system: [[a,b],[c,d]] * [x,y] = [e,f]
export function solve2x2(a: number, b: number, e: number, c: number, d: number, f: number) {
  const det = a * d - b * c;
  if (det === 0) return null;
  return { x: (e * d - b * f) / det, y: (a * f - e * c) / det };
}

// Solve 3x3 via Cramer's rule
export function solve3x3(m: number[][]) {
  const det3 = (M: number[][]) =>
    M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
    M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
    M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
  const A = [
    [m[0][0], m[0][1], m[0][2]],
    [m[1][0], m[1][1], m[1][2]],
    [m[2][0], m[2][1], m[2][2]],
  ];
  const rhs = [m[0][3], m[1][3], m[2][3]];
  const D = det3(A);
  if (D === 0) return null;
  const col = (k: number) => A.map((row, i) => row.map((v, j) => (j === k ? rhs[i] : v)));
  return {
    x: det3(col(0)) / D,
    y: det3(col(1)) / D,
    z: det3(col(2)) / D,
  };
}
