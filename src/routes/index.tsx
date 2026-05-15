import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import casioImg from "@/assets/casio.png";
import { KEYS, INSERT, displayToEval } from "@/lib/calc/keymap";
import {
  evalExpr,
  solveQuadratic,
  solveCubic,
  solve2x2,
  solve3x3,
  type AngleMode,
  type Vars,
} from "@/lib/calc/engine";

// Multi-char tokens that should behave as a single unit for cursor & DEL.
// Order matters: longer first.
const MULTI_TOKENS = [
  "asinh(", "acosh(", "atanh(",
  "sinh(", "cosh(", "tanh(",
  "asin(", "acos(", "atan(",
  "sqrt(", "cbrt(",
  "sin(", "cos(", "tan(", "log(", "abs(", "exp(",
  "10^(", "e^(",
  "ln(",
  "×10^", "Ans", "(-", "⁻¹",
  "√(", "∛(",
];

function tokenize(s: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    let matched = "";
    for (const t of MULTI_TOKENS) {
      if (s.startsWith(t, i)) { matched = t; break; }
    }
    if (matched) { out.push(matched); i += matched.length; }
    else { out.push(s[i]); i++; }
  }
  return out;
}

// Snap a character index to the nearest token boundary at-or-before it.
function snapBoundary(s: string, charIdx: number): number {
  const toks = tokenize(s);
  let pos = 0;
  for (const t of toks) {
    if (pos + t.length > charIdx) return pos;
    pos += t.length;
  }
  return pos;
}

function prevBoundary(s: string, charIdx: number): number {
  const snap = snapBoundary(s, charIdx);
  if (snap < charIdx) return snap; // mid-token → snap left
  // already at boundary → step one token left
  const toks = tokenize(s);
  let pos = 0, prev = 0;
  for (const t of toks) {
    if (pos >= charIdx) return prev;
    prev = pos;
    pos += t.length;
  }
  return prev;
}

function nextBoundary(s: string, charIdx: number): number {
  const toks = tokenize(s);
  let pos = 0;
  for (const t of toks) {
    if (pos >= charIdx) return Math.min(s.length, pos + t.length);
    pos += t.length;
  }
  return s.length;
}

export const Route = createFileRoute("/")({
  component: Index,
});

type CalcMode =
  | "COMP"
  | "CMPLX"
  | "STAT"
  | "BASE"
  | "EQN"
  | "MATRIX"
  | "TABLE"
  | "VECTOR";

type Menu =
  | { kind: "MAIN" }
  | { kind: "SETUP" }
  | { kind: "EQN" }
  // active multi-step prompt (e.g. EQN coefficients, TABLE settings)
  | { kind: "PROMPT"; title: string; steps: string[]; idx: number; values: string[]; onDone: (vals: string[]) => void }
  // a result page that just shows lines until AC
  | { kind: "RESULT"; lines: string[] }
  | null;

const MAIN_OPTS = [
  "1:COMP", "2:CMPLX", "3:STAT", "4:BASE-N",
  "5:EQN", "6:MATRIX", "7:TABLE", "8:VECTOR",
];
const SETUP_OPTS = [
  "1:Deg", "2:Rad", "3:Gra",
  "4:Fix", "5:Sci", "6:Norm",
  "7:Disp", "8:Reset",
];
const EQN_OPTS = [
  "1:aX+bY=c (2)",
  "2:aX+bY+cZ=d (3)",
  "3:aX²+bX+c=0",
  "4:aX³+bX²+cX+d=0",
];

function Index() {
  // ---- core state ----
  const [expr, setExpr] = useState("");
  const [cursor, setCursor] = useState(0);
  const [result, setResult] = useState("");
  const [ans, setAns] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);

  // modifiers
  const [shift, setShift] = useState(false);
  const [alpha, setAlpha] = useState(false);
  const [hyp, setHyp] = useState(false);
  const [stoMode, setStoMode] = useState<"none" | "store" | "recall">("none");

  // angle / mode
  const [angle, setAngle] = useState<AngleMode>("DEG");
  const [calcMode, setCalcMode] = useState<CalcMode>("COMP");
  const [vars, setVars] = useState<Vars>({
    A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, X: 0, Y: 0, M: 0,
  });

  // menu / prompt
  const [menu, setMenu] = useState<Menu>(null);

  // debug overlay (?debug=1)
  const debug = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("debug") === "1";
  }, []);

  // ---- helpers ----
  const insert = (text: string) => {
    setExpr((e) => e.slice(0, cursor) + text + e.slice(cursor));
    setCursor((c) => c + text.length);
    setResult("");
  };

  const replaceAll = (text: string) => {
    setExpr(text);
    setCursor(text.length);
    setResult("");
  };

  const angleLabel = angle === "DEG" ? "D" : angle === "RAD" ? "R" : "G";

  // ---- menu helpers ----
  const startPrompt = (title: string, steps: string[], onDone: (vals: string[]) => void) => {
    setMenu({ kind: "PROMPT", title, steps, idx: 0, values: [], onDone });
    setExpr("");
    setCursor(0);
    setResult("");
  };

  const showResult = (lines: string[]) => setMenu({ kind: "RESULT", lines });

  const runEqn = (which: string) => {
    if (which === "1") {
      // 2x2 linear
      startPrompt("aX+bY=c", ["a?", "b?", "c?", "d?", "e?", "f?"], (v) => {
        const [a, b, c, d, e, f] = v.map(Number);
        const r = solve2x2(a, b, c, d, e, f);
        showResult(r ? [`X = ${r.x}`, `Y = ${r.y}`] : ["No unique solution"]);
      });
    } else if (which === "2") {
      startPrompt(
        "aX+bY+cZ=d",
        ["a1?", "b1?", "c1?", "d1?", "a2?", "b2?", "c2?", "d2?", "a3?", "b3?", "c3?", "d3?"],
        (v) => {
          const n = v.map(Number);
          const m = [n.slice(0, 4), n.slice(4, 8), n.slice(8, 12)];
          const r = solve3x3(m);
          showResult(r ? [`X = ${r.x}`, `Y = ${r.y}`, `Z = ${r.z}`] : ["No unique solution"]);
        },
      );
    } else if (which === "3") {
      startPrompt("aX²+bX+c=0", ["a?", "b?", "c?"], (v) => {
        const [a, b, c] = v.map(Number);
        const r = solveQuadratic(a, b, c);
        if (!r) return showResult(["a cannot be 0"]);
        if (r.complex) {
          showResult([
            `X1 = ${r.x1.re}+${r.x1.im}i`,
            `X2 = ${r.x2.re}${r.x2.im < 0 ? "" : "+"}${r.x2.im}i`,
          ]);
        } else {
          showResult([`X1 = ${r.x1}`, `X2 = ${r.x2}`]);
        }
      });
    } else if (which === "4") {
      startPrompt("aX³+bX²+cX+d", ["a?", "b?", "c?", "d?"], (v) => {
        const [a, b, c, d] = v.map(Number);
        const roots = solveCubic(a, b, c, d);
        if (!roots) return showResult(["No solutions"]);
        const arr = Array.isArray(roots) ? roots : [roots.x1, roots.x2];
        showResult(arr.map((x, i) => `X${i + 1} = ${x}`));
      });
    }
  };

  const runTable = () => {
    startPrompt("TABLE", ["f(X)=", "Start?", "End?", "Step?"], (v) => {
      const [fxs, sStart, sEnd, sStep] = v;
      const start = Number(sStart), end = Number(sEnd), step = Number(sStep);
      if (!step || step === 0 || !isFinite(start) || !isFinite(end)) {
        return showResult(["Invalid input"]);
      }
      const out: string[] = ["X       f(X)"];
      let count = 0;
      for (let x = start; (step > 0 ? x <= end : x >= end) && count < 30; x += step, count++) {
        const r = evalExpr(displayToEval(fxs), { angle, ans, vars: { ...vars, X: x } });
        out.push(`${x.toString().padEnd(7)} ${r.ok ? r.value : r.error}`);
      }
      showResult(out);
    });
  };

  // ---- the big dispatch ----
  const runAction = useCallback((rawAction: string) => {
    // Resolve effective action through modifier state (shift/alpha consume after one press)
    let action = rawAction;
    const def = KEYS.find((k) => k.base === rawAction || k.id === rawAction);
    if (def) {
      if (shift && def.shift) action = def.shift;
      else if (alpha && def.alpha) action = def.alpha;
    }
    // hyp augments trig
    if (hyp) {
      if (action === "SIN") action = "SINH";
      else if (action === "COS") action = "COSH";
      else if (action === "TAN") action = "TANH";
      else if (action === "ASIN") action = "ASINH";
      else if (action === "ACOS") action = "ACOSH";
      else if (action === "ATAN") action = "ATANH";
    }

    const consume = () => { setShift(false); setAlpha(false); setHyp(false); };

    // ---- menu handling first ----
    if (menu?.kind === "MAIN") {
      const map: Record<string, CalcMode> = {
        D1: "COMP", D2: "CMPLX", D3: "STAT", D4: "BASE",
        D5: "EQN", D6: "MATRIX", D7: "TABLE", D8: "VECTOR",
      };
      if (map[action]) {
        const picked = map[action];
        setMenu(null);
        replaceAll("");
        // EQN and TABLE are one-shot flows — don't latch them as the
        // persistent mode (real calc returns to COMP after the flow).
        if (picked === "EQN") {
          setCalcMode("COMP");
          setMenu({ kind: "EQN" });
        } else if (picked === "TABLE") {
          setCalcMode("COMP");
          runTable();
        } else {
          setCalcMode(picked);
        }
      }
      if (action === "AC") setMenu(null);
      consume(); return;
    }
    if (menu?.kind === "SETUP") {
      const ang: Record<string, AngleMode> = { D1: "DEG", D2: "RAD", D3: "GRA" };
      if (ang[action]) { setAngle(ang[action]); setMenu(null); }
      else if (action === "D8") {
        setExpr(""); setCursor(0); setResult(""); setAns(0);
        setVars({ A:0,B:0,C:0,D:0,E:0,F:0,X:0,Y:0,M:0 });
        setHistory([]); setMenu(null);
      } else if (action === "AC") setMenu(null);
      consume(); return;
    }
    if (menu?.kind === "EQN") {
      if (["D1","D2","D3","D4"].includes(action)) {
        const which = action.slice(1);
        setMenu(null);
        runEqn(which);
      } else if (action === "AC") setMenu(null);
      consume(); return;
    }
    if (menu?.kind === "PROMPT") {
      // editing happens in expr; EQ submits current step
      if (action === "EQ") {
        const value = expr;
        const newValues = [...menu.values, value];
        if (newValues.length >= menu.steps.length) {
          const done = menu.onDone;
          setMenu(null);
          setExpr(""); setCursor(0); setResult("");
          done(newValues);
        } else {
          setMenu({ ...menu, idx: menu.idx + 1, values: newValues });
          setExpr(""); setCursor(0); setResult("");
        }
        consume(); return;
      }
      if (action === "AC") {
        setMenu(null); setExpr(""); setCursor(0); setResult(""); consume(); return;
      }
      // fall through so digits/operators feed expr
    }
    if (menu?.kind === "RESULT") {
      if (action === "AC") setMenu(null);
      consume(); return;
    }

    // ---- modifier toggles ----
    if (action === "SHIFT") { setShift((s) => !s); setAlpha(false); setHyp(false); return; }
    if (action === "ALPHA") { setAlpha((a) => !a); setShift(false); setHyp(false); return; }
    if (action === "HYP")   { setHyp((h) => !h); return; }

    // ---- mode/setup ----
    if (action === "MODE")  { setMenu({ kind: "MAIN" }); consume(); return; }
    if (action === "SETUP") { setMenu({ kind: "SETUP" }); consume(); return; }

    // ---- power / clear ----
    if (action === "ON" || action === "AC") {
      setExpr(""); setCursor(0); setResult(""); setMenu(null);
      setStoMode("none");
      if (action === "ON") {
        // Hard reset back to default COMP mode.
        setCalcMode("COMP");
        setShift(false); setAlpha(false); setHyp(false);
      }
      consume(); return;
    }
    if (action === "OFF") { /* no-op visual */ consume(); return; }

    // ---- navigation ----
    if (action === "LEFT")  { setCursor((c) => prevBoundary(expr, c)); consume(); return; }
    if (action === "RIGHT") { setCursor((c) => nextBoundary(expr, c)); consume(); return; }
    if (action === "UP") {
      if (history.length) {
        const i = Math.min(history.length - 1, hIdx + 1);
        setHIdx(i);
        replaceAll(history[history.length - 1 - i]);
      }
      consume(); return;
    }
    if (action === "DOWN") {
      if (hIdx > 0) {
        const i = hIdx - 1;
        setHIdx(i);
        replaceAll(history[history.length - 1 - i]);
      } else if (hIdx === 0) {
        setHIdx(-1); replaceAll("");
      }
      consume(); return;
    }
    if (action === "DEL") {
      if (result) { setResult(""); consume(); return; }
      if (cursor > 0) {
        const start = prevBoundary(expr, cursor);
        setExpr((e) => e.slice(0, start) + e.slice(cursor));
        setCursor(start);
      }
      consume(); return;
    }
    if (action === "INS") { /* toggle insert mode — no-op for now */ consume(); return; }

    // ---- STO / RCL ----
    if (action === "STO") { setStoMode("store"); consume(); return; }
    if (action === "RCL") { setStoMode("recall"); consume(); return; }
    if (action.startsWith("VAR_")) {
      const name = action.slice(4);
      if (stoMode === "store") {
        // store current ans (or evaluate expr) into variable
        let v = ans;
        if (expr) {
          const r = evalExpr(displayToEval(expr), { angle, ans, vars });
          if (r.ok) v = r.value;
        }
        setVars((vs) => ({ ...vs, [name]: v }));
        setStoMode("none");
        setResult(`${name} = ${v}`);
      } else if (stoMode === "recall") {
        insert(name);
        setStoMode("none");
      } else {
        insert(name);
      }
      consume(); return;
    }

    // ---- equals ----
    if (action === "EQ") {
      const r = evalExpr(displayToEval(expr), { angle, ans, vars });
      if (r.ok) {
        setResult(String(r.value));
        setAns(r.value);
        setHistory((h) => (h[h.length - 1] === expr ? h : [...h, expr]).slice(-30));
        setHIdx(-1);
      } else {
        setResult(r.error);
      }
      consume(); return;
    }

    // ---- M+ / M- ----
    if (action === "MPLUS" || action === "MMINUS") {
      const r = expr ? evalExpr(displayToEval(expr), { angle, ans, vars }) : { ok: true as const, value: ans };
      if (r.ok) {
        const delta = action === "MPLUS" ? r.value : -r.value;
        setVars((vs) => ({ ...vs, M: vs.M + delta }));
        setResult(String(r.value));
        setAns(r.value);
      } else {
        setResult(r.error);
      }
      consume(); return;
    }

    // ---- S⇔D — toggle decimal/fraction display ----
    if (action === "SD") {
      if (result && /^-?\d+\.\d+$/.test(result)) {
        // very simple: try to render as fraction
        const n = Number(result);
        const frac = decimalToFraction(n);
        if (frac) setResult(`${frac.num}/${frac.den}`);
      } else if (result && result.includes("/")) {
        const [n, d] = result.split("/").map(Number);
        if (d) setResult(String(n / d));
      }
      consume(); return;
    }

    // ---- ENG, DMS — visual no-op for now ----
    if (action === "ENG" || action === "DMS") { consume(); return; }

    // ---- POW_PROMPT becomes "^(" ----
    // ---- Ordinary insertions via INSERT table ----
    const text = INSERT[action];
    if (text != null) {
      // Operators and result chaining
      const isOp = ["+", "-", "*", "/", "×", "÷"].includes(text);
      if (result && !result.includes("ERROR")) {
        if (isOp) {
          replaceAll(result + text);
        } else {
          replaceAll(text);
        }
      } else {
        insert(text);
      }
      consume(); return;
    }

    // unknown action -> ignore
    consume();
  }, [shift, alpha, hyp, stoMode, expr, cursor, result, ans, vars, angle, history, hIdx, menu]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9]$/.test(k)) runAction("D" + k);
      else if (k === "+") runAction("ADD");
      else if (k === "-") runAction("SUB");
      else if (k === "*") runAction("MUL");
      else if (k === "/") runAction("DIV");
      else if (k === ".") runAction("DOT");
      else if (k === "(") runAction("LP");
      else if (k === ")") runAction("RP");
      else if (k === "^") runAction("POW");
      else if (k === ",") runAction("COMMA");
      else if (k === "Enter" || k === "=") { e.preventDefault(); runAction("EQ"); }
      else if (k === "Backspace") runAction("DEL");
      else if (k === "Escape") runAction("AC");
      else if (k === "ArrowLeft")  runAction("LEFT");
      else if (k === "ArrowRight") runAction("RIGHT");
      else if (k === "ArrowUp")    runAction("UP");
      else if (k === "ArrowDown")  runAction("DOWN");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runAction]);

  // ---- LCD content ----
  const renderLcd = () => {
    if (menu?.kind === "MAIN") {
      return <MenuView title="" opts={MAIN_OPTS} />;
    }
    if (menu?.kind === "SETUP") {
      return <MenuView title="SETUP" opts={SETUP_OPTS} />;
    }
    if (menu?.kind === "EQN") {
      return <MenuView title="EQN" opts={EQN_OPTS} />;
    }
    if (menu?.kind === "PROMPT") {
      return (
        <>
          <div style={{ fontSize: "3.4cqw", lineHeight: 1.2, opacity: 0.8 }}>
            {menu.title}  ({menu.idx + 1}/{menu.steps.length})
          </div>
          <div style={{ fontSize: "5cqw", lineHeight: 1.2, marginTop: "0.6cqw" }}>
            {menu.steps[menu.idx]}
          </div>
          <div className="mt-auto truncate text-right tabular-nums" style={{ fontSize: "9cqw", lineHeight: 1 }}>
            {expr || "0"}
          </div>
        </>
      );
    }
    if (menu?.kind === "RESULT") {
      return (
        <div style={{ fontSize: "3.4cqw", lineHeight: 1.25, overflow: "hidden" }}>
          {menu.lines.slice(0, 5).map((l, i) => (
            <div key={i} className="font-mono whitespace-pre">{l}</div>
          ))}
          <div className="opacity-60" style={{ fontSize: "2.6cqw" }}>AC to exit</div>
        </div>
      );
    }
    // default COMP-style
    const before = expr.slice(0, cursor);
    const after = expr.slice(cursor);
    return (
      <>
        <div className="truncate" style={{ fontSize: "5.6cqw", lineHeight: 1.15, marginTop: "0.6cqw" }}>
          {before}
          {!result && <span className="animate-pulse">▮</span>}
          {after || (!expr && !result ? "\u00A0" : "")}
        </div>
        <div
          className="mt-auto truncate text-right tabular-nums font-semibold"
          style={{ fontSize: "10cqw", lineHeight: 1 }}
        >
          {result || (expr ? "" : "0")}
        </div>
      </>
    );
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <h1 className="sr-only">Casio fx-991ES PLUS Calculator</h1>
      <div
        className="relative select-none mx-auto"
        style={{
          width: "min(92vw, calc(92vh * 717 / 1488), 420px)",
          containerType: "inline-size",
        }}
      >
        <img
          src={casioImg}
          alt="Casio fx-991ES PLUS calculator"
          className="block w-full h-auto pointer-events-none"
          draggable={false}
        />

        {/* LCD overlay */}
        <div
          className="absolute font-mono"
          style={{
            left: "10.6%", top: "15.35%", width: "78.8%", height: "14.25%",
            color: "#1a1a1a",
            padding: "0.9cqw 1.8cqw 1.2cqw",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* status row */}
          <div
            className="flex items-center justify-between opacity-75"
            style={{ fontSize: "2.35cqw", letterSpacing: "0.08em", lineHeight: 1 }}
          >
            <span className="flex" style={{ gap: "1.15cqw" }}>
              <span style={{ visibility: shift ? "visible" : "hidden" }}>S</span>
              <span style={{ visibility: alpha ? "visible" : "hidden" }}>A</span>
              <span style={{ visibility: hyp ? "visible" : "hidden" }}>HYP</span>
              <span style={{ visibility: stoMode === "store" ? "visible" : "hidden" }}>STO</span>
              <span style={{ visibility: stoMode === "recall" ? "visible" : "hidden" }}>RCL</span>
              <span>{calcMode}</span>
            </span>
            <span>{angleLabel}</span>
          </div>
          {renderLcd()}
        </div>

        {/* Buttons */}
        {KEYS.map((b) => (
          <button
            key={b.id}
            onClick={() => runAction(b.base)}
            aria-label={b.id}
            className={
              "absolute rounded-[10px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 " +
              (debug
                ? "bg-fuchsia-500/20 outline outline-1 outline-fuchsia-500/70"
                : "bg-transparent")
            }
            style={{
              left: `${b.l}%`, top: `${b.t}%`,
              width: `${b.w}%`, height: `${b.h}%`,
            }}
            title={debug ? `${b.id} ${b.base}${b.shift ? " · S:" + b.shift : ""}${b.alpha ? " · A:" + b.alpha : ""}` : undefined}
          />
        ))}
      </div>
    </main>
  );
}

function MenuView({ title, opts }: { title: string; opts: string[] }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      {title && <div className="text-center" style={{ fontSize: "3cqw", opacity: 0.7, marginBottom: "0.6cqw" }}>{title}</div>}
      <div
        className="grid grid-cols-2 mx-auto"
        style={{ fontSize: "4cqw", lineHeight: 1.4, columnGap: "4cqw", rowGap: "0.2cqw" }}
      >
        {opts.map((o) => (
          <div key={o} className="font-mono">{o}</div>
        ))}
      </div>
    </div>
  );
}

// quick decimal→fraction (continued fractions)
function decimalToFraction(x: number): { num: number; den: number } | null {
  if (!isFinite(x)) return null;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const tol = 1e-9;
  let h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
  for (let i = 0; i < 30; i++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (Math.abs(x - h2 / k2) < tol) {
      if (k2 > 1e6) return null;
      return { num: sign * h2, den: k2 };
    }
    h0 = h1; h1 = h2;
    k0 = k1; k1 = k2;
    b = 1 / (b - a);
    if (!isFinite(b)) break;
  }
  return null;
}
