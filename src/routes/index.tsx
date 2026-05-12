import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import casioImg from "@/assets/casio.png";

export const Route = createFileRoute("/")({
  component: Index,
});

type Btn = { v: string; l: number; t: number; w: number; h: number };

// Number pad (5 cols × 4 rows)
const NCOL_W = 13.6;
const NROW_H = 4.5;
const NCOLS = [9.6, 26.5, 43.2, 60.0, 76.6];
const NROWS = [68.3, 75.3, 82.3, 89.4];

// Sci pad (6 cols)
const SCOLS = [9.0, 22.7, 36.7, 50.7, 64.7, 78.5];
const SCOL_W = 11.7;
const SROW_H = 3.9;

// Top round buttons row
const TROW = 35.0;
const TROW_H = 4.5;
const TCOL_W = 8.3;

const NUMBTNS: Btn[] = [
  { v: "7", l: NCOLS[0], t: NROWS[0], w: NCOL_W, h: NROW_H },
  { v: "8", l: NCOLS[1], t: NROWS[0], w: NCOL_W, h: NROW_H },
  { v: "9", l: NCOLS[2], t: NROWS[0], w: NCOL_W, h: NROW_H },
  { v: "DEL", l: NCOLS[3], t: NROWS[0], w: NCOL_W, h: NROW_H },
  { v: "AC", l: NCOLS[4], t: NROWS[0], w: NCOL_W, h: NROW_H },
  { v: "4", l: NCOLS[0], t: NROWS[1], w: NCOL_W, h: NROW_H },
  { v: "5", l: NCOLS[1], t: NROWS[1], w: NCOL_W, h: NROW_H },
  { v: "6", l: NCOLS[2], t: NROWS[1], w: NCOL_W, h: NROW_H },
  { v: "*", l: NCOLS[3], t: NROWS[1], w: NCOL_W, h: NROW_H },
  { v: "/", l: NCOLS[4], t: NROWS[1], w: NCOL_W, h: NROW_H },
  { v: "1", l: NCOLS[0], t: NROWS[2], w: NCOL_W, h: NROW_H },
  { v: "2", l: NCOLS[1], t: NROWS[2], w: NCOL_W, h: NROW_H },
  { v: "3", l: NCOLS[2], t: NROWS[2], w: NCOL_W, h: NROW_H },
  { v: "+", l: NCOLS[3], t: NROWS[2], w: NCOL_W, h: NROW_H },
  { v: "-", l: NCOLS[4], t: NROWS[2], w: NCOL_W, h: NROW_H },
  { v: "0", l: NCOLS[0], t: NROWS[3], w: NCOL_W, h: NROW_H },
  { v: ".", l: NCOLS[1], t: NROWS[3], w: NCOL_W, h: NROW_H },
  { v: "EXP", l: NCOLS[2], t: NROWS[3], w: NCOL_W, h: NROW_H },
  { v: "ANS", l: NCOLS[3], t: NROWS[3], w: NCOL_W, h: NROW_H },
  { v: "=", l: NCOLS[4], t: NROWS[3], w: NCOL_W, h: NROW_H },
];

const SCIBTNS: Btn[] = [
  // Row: √ x² x² x² x³ ln  (~49.8%)
  { v: "SQRT", l: SCOLS[0], t: 49.8, w: SCOL_W, h: SROW_H },
  { v: "SQ", l: SCOLS[1], t: 49.8, w: SCOL_W, h: SROW_H },
  { v: "LOG", l: SCOLS[4], t: 49.8, w: SCOL_W, h: SROW_H },
  { v: "LN", l: SCOLS[5], t: 49.8, w: SCOL_W, h: SROW_H },
  // Row: (-), .., hyp, sin, cos, tan (~55.8%)
  { v: "NEG", l: SCOLS[0], t: 55.8, w: SCOL_W, h: SROW_H },
  { v: "SIN", l: SCOLS[3], t: 55.8, w: SCOL_W, h: SROW_H },
  { v: "COS", l: SCOLS[4], t: 55.8, w: SCOL_W, h: SROW_H },
  { v: "TAN", l: SCOLS[5], t: 55.8, w: SCOL_W, h: SROW_H },
  // Row: RCL, ENG, (, ), S⇔D, M+ (~61.4%)
  { v: "(", l: SCOLS[2], t: 61.4, w: SCOL_W, h: SROW_H },
  { v: ")", l: SCOLS[3], t: 61.4, w: SCOL_W, h: SROW_H },
];

const TOPBTNS: Btn[] = [
  { v: "SHIFT", l: 9.0, t: TROW, w: TCOL_W, h: TROW_H },
  { v: "ALPHA", l: 22.7, t: TROW, w: TCOL_W, h: TROW_H },
  { v: "MODE", l: 64.7, t: TROW, w: TCOL_W, h: TROW_H },
  { v: "ON", l: 78.5, t: TROW, w: TCOL_W, h: TROW_H },
];

function evalExpr(expr: string, mode: "DEG" | "RAD"): string {
  if (!expr) return "0";
  try {
    const s = expr
      .replace(/SIN\(/g, "_sin(")
      .replace(/COS\(/g, "_cos(")
      .replace(/TAN\(/g, "_tan(")
      .replace(/LN\(/g, "_ln(")
      .replace(/LOG\(/g, "_log(")
      .replace(/SQRT\(/g, "_sqrt(");
    if (!/^[\s0-9+\-*/.()_a-zA-Z]+$/.test(s)) return "Syntax ERROR";
    const d = mode === "DEG" ? Math.PI / 180 : 1;
    // eslint-disable-next-line no-new-func
    const fn = Function(
      "_sin", "_cos", "_tan", "_ln", "_log", "_sqrt",
      `"use strict"; return (${s})`
    );
    const result = fn(
      (x: number) => Math.sin(x * d),
      (x: number) => Math.cos(x * d),
      (x: number) => Math.tan(x * d),
      (x: number) => Math.log(x),
      (x: number) => Math.log10(x),
      (x: number) => Math.sqrt(x),
    );
    if (typeof result !== "number" || !isFinite(result)) return "Math ERROR";
    return String(Number(result.toPrecision(12)));
  } catch {
    return "Syntax ERROR";
  }
}

// What gets inserted into the visible expression (display) for each key
const DISP: Record<string, string> = {
  EXP: "×10^", ANS: "Ans", SQRT: "√(", SQ: "²", LN: "ln(", LOG: "log(",
  SIN: "sin(", COS: "cos(", TAN: "tan(", NEG: "-", "(": "(", ")": ")",
};

function displayToEval(disp: string, ans: string): string {
  return disp
    .replace(/Ans/g, `(${ans})`)
    .replace(/×10\^/g, "*10**")
    .replace(/×/g, "*").replace(/÷/g, "/")
    .replace(/√\(/g, "SQRT(")
    .replace(/ln\(/g, "LN(")
    .replace(/log\(/g, "LOG(")
    .replace(/sin\(/g, "SIN(")
    .replace(/cos\(/g, "COS(")
    .replace(/tan\(/g, "TAN(")
    .replace(/²/g, "**2");
}

function Index() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [ans, setAns] = useState("0");
  const [shift, setShift] = useState(false);
  const [alpha, setAlpha] = useState(false);
  const [mode, setMode] = useState<"DEG" | "RAD">("DEG");

  const press = useCallback((v: string) => {
    if (v === "ON" || v === "AC") {
      setExpr(""); setResult(""); setShift(false); setAlpha(false); return;
    }
    if (v === "SHIFT") { setShift((s) => !s); setAlpha(false); return; }
    if (v === "ALPHA") { setAlpha((a) => !a); setShift(false); return; }
    if (v === "MODE") { setMode((m) => (m === "DEG" ? "RAD" : "DEG")); return; }
    if (v === "DEL") {
      if (result) { setResult(""); return; }
      setExpr((e) => e.slice(0, -1));
      return;
    }
    if (v === "=") {
      const r = evalExpr(displayToEval(expr, ans), mode);
      setResult(r);
      if (!r.includes("ERROR")) setAns(r);
      setShift(false); setAlpha(false);
      return;
    }
    const token = DISP[v] ?? v;
    const isOp = "+-*/".includes(v);
    setExpr((e) => {
      if (result && !result.includes("ERROR")) {
        return isOp ? result + token : token;
      }
      return e + token;
    });
    setResult("");
    setShift(false); setAlpha(false);
  }, [ans, mode, result, expr]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) press(k);
      else if ("+-*/.()".includes(k)) press(k);
      else if (k === "Enter" || k === "=") { e.preventDefault(); press("="); }
      else if (k === "Backspace") press("DEL");
      else if (k === "Escape") press("AC");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const ALL = [...NUMBTNS, ...SCIBTNS, ...TOPBTNS];

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <h1 className="sr-only">Casio fx-991ES PLUS Calculator</h1>
      <div
        className="relative select-none mx-auto"
        style={{
          width: "min(92vw, calc(92vh * 710 / 1479), 420px)",
          containerType: "inline-size",
        }}
      >
        <img
          src={casioImg}
          alt="Casio fx-991ES PLUS calculator"
          className="block w-full h-auto pointer-events-none"
          draggable={false}
        />

        {/* LCD overlay — blends with the screen image */}
        <div
          className="absolute font-mono"
          style={{
            left: "8%", top: "14.2%", width: "84%", height: "15.8%",
            color: "#1a1a1a",
            padding: "1.2cqw 2.5cqw 1.5cqw",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* status row */}
          <div
            className="flex items-center justify-between opacity-75"
            style={{ fontSize: "3cqw", letterSpacing: "0.1em", lineHeight: 1 }}
          >
            <span className="flex" style={{ gap: "1.5cqw" }}>
              <span style={{ visibility: shift ? "visible" : "hidden" }}>S</span>
              <span style={{ visibility: alpha ? "visible" : "hidden" }}>A</span>
              <span>M</span>
              <span>STO</span>
            </span>
            <span>{mode}</span>
          </div>

          {/* expression line — left aligned, decent size */}
          <div
            className="truncate"
            style={{ fontSize: "6cqw", lineHeight: 1.15, marginTop: "1.2cqw" }}
          >
            {expr || "\u00A0"}
            {expr && !result && (
              <span className="animate-pulse" style={{ marginLeft: "0.3cqw" }}>▮</span>
            )}
          </div>

          {/* result line — right aligned, big */}
          <div
            className="mt-auto truncate text-right font-semibold tabular-nums"
            style={{ fontSize: "11cqw", lineHeight: 1 }}
          >
            {result || (expr ? "" : "0")}
          </div>
        </div>

        {/* Clickable buttons */}
        {ALL.map((b) => (
          <button
            key={b.v + b.l + b.t}
            onClick={() => press(b.v)}
            aria-label={b.v}
            className="absolute rounded-[10px] transition-all duration-75 active:translate-y-px active:bg-black/30 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            style={{
              left: `${b.l}%`, top: `${b.t}%`,
              width: `${b.w}%`, height: `${b.h}%`,
            }}
          />
        ))}
      </div>
    </main>
  );
}
