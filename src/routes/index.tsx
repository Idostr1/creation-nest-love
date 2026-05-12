import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import casioImg from "@/assets/casio.png";

export const Route = createFileRoute("/")({
  component: Index,
});

// Button positions are percentages of the calculator image (1024x1536).
// Each entry: [label, value, leftPct, topPct, widthPct, heightPct]
type Btn = {
  v: string;
  l: number; t: number; w: number; h: number;
  kind?: "num" | "op" | "eq" | "ac" | "del" | "dot";
};

const COL_W = 10;
const ROW_H = 4.5;
const COLS = [19.9, 32.1, 44.4, 56.5, 68.8];
const ROWS = [64.8, 71.6, 78.3, 85.1];

const BTNS: Btn[] = [
  // Row 0: 7 8 9 DEL AC
  { v: "7", l: COLS[0], t: ROWS[0], w: COL_W, h: ROW_H, kind: "num" },
  { v: "8", l: COLS[1], t: ROWS[0], w: COL_W, h: ROW_H, kind: "num" },
  { v: "9", l: COLS[2], t: ROWS[0], w: COL_W, h: ROW_H, kind: "num" },
  { v: "DEL", l: COLS[3], t: ROWS[0], w: COL_W, h: ROW_H, kind: "del" },
  { v: "AC", l: COLS[4], t: ROWS[0], w: COL_W, h: ROW_H, kind: "ac" },
  // Row 1: 4 5 6 × ÷
  { v: "4", l: COLS[0], t: ROWS[1], w: COL_W, h: ROW_H, kind: "num" },
  { v: "5", l: COLS[1], t: ROWS[1], w: COL_W, h: ROW_H, kind: "num" },
  { v: "6", l: COLS[2], t: ROWS[1], w: COL_W, h: ROW_H, kind: "num" },
  { v: "*", l: COLS[3], t: ROWS[1], w: COL_W, h: ROW_H, kind: "op" },
  { v: "/", l: COLS[4], t: ROWS[1], w: COL_W, h: ROW_H, kind: "op" },
  // Row 2: 1 2 3 + -
  { v: "1", l: COLS[0], t: ROWS[2], w: COL_W, h: ROW_H, kind: "num" },
  { v: "2", l: COLS[1], t: ROWS[2], w: COL_W, h: ROW_H, kind: "num" },
  { v: "3", l: COLS[2], t: ROWS[2], w: COL_W, h: ROW_H, kind: "num" },
  { v: "+", l: COLS[3], t: ROWS[2], w: COL_W, h: ROW_H, kind: "op" },
  { v: "-", l: COLS[4], t: ROWS[2], w: COL_W, h: ROW_H, kind: "op" },
  // Row 3: 0 . ×10ˣ Ans =
  { v: "0", l: COLS[0], t: ROWS[3], w: COL_W, h: ROW_H, kind: "num" },
  { v: ".", l: COLS[1], t: ROWS[3], w: COL_W, h: ROW_H, kind: "dot" },
  { v: "E", l: COLS[2], t: ROWS[3], w: COL_W, h: ROW_H, kind: "num" },
  { v: "ANS", l: COLS[3], t: ROWS[3], w: COL_W, h: ROW_H, kind: "num" },
  { v: "=", l: COLS[4], t: ROWS[3], w: COL_W, h: ROW_H, kind: "eq" },
];

function evalExpr(expr: string): string {
  if (!expr) return "0";
  try {
    const sanitized = expr.replace(/[^0-9+\-*/.()e ]/gi, "");
    if (!sanitized) return "0";
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized})`)();
    if (typeof result !== "number" || !isFinite(result)) return "Math ERROR";
    return String(Number(result.toPrecision(12)));
  } catch {
    return "Syntax ERROR";
  }
}

function Index() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [ans, setAns] = useState("0");

  const press = (v: string) => {
    if (v === "AC") { setExpr(""); setResult(""); return; }
    if (v === "DEL") {
      if (result) { setResult(""); return; }
      setExpr((e) => e.slice(0, -1));
      return;
    }
    if (v === "=") {
      const r = evalExpr(expr);
      setResult(r);
      if (!r.includes("ERROR")) setAns(r);
      return;
    }
    const token = v === "ANS" ? ans : v === "E" ? "*10**" : v;
    const isOp = "+-*/".includes(v);
    setExpr((e) => {
      if (result && !result.includes("ERROR")) {
        return isOp ? result + token : token;
      }
      return e + token;
    });
    setResult("");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) press(k);
      else if ("+-*/.".includes(k)) press(k);
      else if (k === "Enter" || k === "=") { e.preventDefault(); press("="); }
      else if (k === "Backspace") press("DEL");
      else if (k === "Escape") press("AC");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr, result, ans]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <h1 className="sr-only">Casio fx-991ES PLUS Calculator</h1>
      <div
        className="relative select-none"
        style={{
          width: "min(420px, 95vh * 1024 / 1536)",
          aspectRatio: "1024 / 1536",
          containerType: "inline-size",
        }}
      >
        <img
          src={casioImg}
          alt="Casio fx-991ES PLUS calculator"
          className="absolute inset-0 h-full w-full object-contain pointer-events-none"
          draggable={false}
        />

        {/* LCD overlay */}
        <div
          className="absolute flex flex-col justify-between font-mono text-right"
          style={{
            left: "9.3%", top: "14%", width: "82%", height: "16.5%",
            padding: "1.5cqw 2.5cqw",
            color: "#1a1a1a",
          }}
        >
          <div
            className="truncate opacity-80"
            style={{ fontSize: "3.6cqw", lineHeight: 1.1, letterSpacing: "0.02em" }}
          >
            {expr || "\u00A0"}
          </div>
          <div
            className="truncate font-semibold tabular-nums"
            style={{ fontSize: "7cqw", lineHeight: 1 }}
          >
            {result || (expr ? "" : "0")}
          </div>
        </div>

        {/* Clickable buttons */}
        {BTNS.map((b) => (
          <button
            key={b.v + b.l + b.t}
            onClick={() => press(b.v)}
            aria-label={b.v}
            className="absolute rounded-[10px] transition-all duration-75 active:translate-y-px active:bg-black/30 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
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
