import type * as React from "react";

// Per-button display label and visual style for the rendered calculator keys.
// The image still provides the printed yellow (SHIFT) and red (ALPHA) labels
// ABOVE each physical key — we only render the base label on the button face.

export const LABELS: Record<string, React.ReactNode | string> = {
  // digits
  D0: "0", D1: "1", D2: "2", D3: "3", D4: "4",
  D5: "5", D6: "6", D7: "7", D8: "8", D9: "9",
  DOT: ".",
  // operators
  ADD: "+", SUB: "−", MUL: "×", DIV: "÷", EQ: "=",
  LP: "(", RP: ")",
  EXP: "×10ˣ", ANS: "Ans",
  // top row
  SHIFT: "SHIFT", ALPHA: "ALPHA", MODE: "MODE", ON: "ON",
  UP: "▲", DOWN: "▼", LEFT: "◄", RIGHT: "►",
  // sci row A
  SQRT: "√▫", SQ: "x²", INV: "x⁻¹", CUBE: "x³", LOG: "log", LN: "ln",
  // sci row B
  NEG: "(−)", DMS: "° ’ ”", HYP: "hyp", SIN: "sin", COS: "cos", TAN: "tan",
  // sci row C
  RCL: "RCL", ENG: "ENG", SD: "S⇔D", MPLUS: "M+",
  // numpad row 1
  DEL: "DEL", AC: "AC",
};

type StyleKind = "dark" | "light" | "shift" | "alpha" | "red" | "dpad" | "mode";

const KIND: Record<string, StyleKind> = {
  SHIFT: "shift",
  ALPHA: "alpha",
  ON: "red",
  AC: "red",
  MODE: "mode",
  UP: "dpad", DOWN: "dpad", LEFT: "dpad", RIGHT: "dpad",
  D0: "light", D1: "light", D2: "light", D3: "light", D4: "light",
  D5: "light", D6: "light", D7: "light", D8: "light", D9: "light",
  DOT: "light",
  ADD: "light", SUB: "light", MUL: "light", DIV: "light", EQ: "light",
};

// Returns Tailwind classes + inline style for a given key id.
export function keyStyle(id: string): { className: string; style: React.CSSProperties } {
  const kind: StyleKind = KIND[id] ?? "dark";
  const base =
    "absolute flex items-center justify-center font-semibold select-none " +
    "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 " +
    "transition-[transform,box-shadow] duration-75 ease-out " +
    "active:translate-y-[2px] active:shadow-[0_0_0_1px_rgba(0,0,0,0.5)_inset]";
  let palette = "";
  let textColor = "#f3f3f0";
  let bg = "linear-gradient(180deg,#3a3a3c 0%,#202022 100%)";
  let border = "1px solid #0a0a0a";
  let shadow =
    "0 1.5px 0 #0a0a0a, 0 2.5px 3px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)";
  let radius = "8px";
  const ROUND = new Set(["SHIFT", "ALPHA", "MODE", "ON"]);
  if (ROUND.has(id)) radius = "50%";
  let fontSize = "2.2cqw";

  switch (kind) {
    case "shift":
      bg = "linear-gradient(180deg,#e7b341 0%,#b07a14 100%)";
      textColor = "#1a1208";
      fontSize = "1.9cqw";
      break;
    case "alpha":
      bg = "linear-gradient(180deg,#c34a6d 0%,#7a1f3a 100%)";
      textColor = "#fdf2f5";
      fontSize = "1.9cqw";
      break;
    case "red":
      bg = "linear-gradient(180deg,#c0392b 0%,#6c1b13 100%)";
      textColor = "#fff";
      fontSize = "2cqw";
      break;
    case "mode":
      bg = "linear-gradient(180deg,#4a4a4d 0%,#26262a 100%)";
      fontSize = "1.9cqw";
      break;
    case "dpad":
      bg = "linear-gradient(180deg,#3d3d40 0%,#1a1a1c 100%)";
      textColor = "#f3f3f0";
      fontSize = "2.6cqw";
      radius = "6px";
      break;
    case "light":
      bg = "linear-gradient(180deg,#f4f1ea 0%,#bdb8ad 100%)";
      textColor = "#111";
      fontSize = "3cqw";
      shadow =
        "0 1.5px 0 #4a4640, 0 2.5px 3px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.55)";
      break;
    case "dark":
    default:
      // already set
      break;
  }
  return {
    className: base + " " + palette,
    style: {
      background: bg,
      color: textColor,
      border,
      borderRadius: radius,
      boxShadow: shadow,
      fontSize,
      lineHeight: 1,
      padding: 0,
    },
  };
}