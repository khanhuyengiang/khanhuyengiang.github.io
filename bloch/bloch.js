/* Bloch sphere playground. No dependencies: complex arithmetic, an expression parser and a canvas renderer. */
"use strict";

/* ===================== complex numbers ===================== */
const C = (re, im = 0) => ({ re, im });
const cadd = (a, b) => C(a.re + b.re, a.im + b.im);
const csub = (a, b) => C(a.re - b.re, a.im - b.im);
const cmul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const cdiv = (a, b) => {
  const d = b.re * b.re + b.im * b.im;
  if (d === 0) throw new Error("Division by zero");
  return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d);
};
const cconj = a => C(a.re, -a.im);
const cabs2 = a => a.re * a.re + a.im * a.im;
const cscale = (a, s) => C(a.re * s, a.im * s);
const cexp = a => cscale(C(Math.cos(a.im), Math.sin(a.im)), Math.exp(a.re));
const clog = a => C(Math.log(Math.hypot(a.re, a.im)), Math.atan2(a.im, a.re));
const csqrt = a => {
  const r = Math.hypot(a.re, a.im);
  const re = Math.sqrt((r + a.re) / 2);
  const im = Math.sqrt(Math.max(0, (r - a.re) / 2)) * (a.im < 0 ? -1 : 1);
  return C(re, im);
};
const cpow = (a, b) => (a.re === 0 && a.im === 0) ? C(0) : cexp(cmul(b, clog(a)));
const ccos = a => cscale(cadd(cexp(C(-a.im, a.re)), cexp(C(a.im, -a.re))), 0.5);
const csin = a => cdiv(csub(cexp(C(-a.im, a.re)), cexp(C(a.im, -a.re))), C(0, 2));

/* ===================== expression parser ===================== */
// Grammar: expr = term (± term)* ; term = unary ((*|/) unary | implicit unary)* ;
// unary = ± unary | power ; power = atom (^ unary)? ; atom = number | const | func(expr) | (expr) | √atom
const FUNCS = { sqrt: csqrt, exp: cexp, cos: ccos, sin: csin, conj: cconj };
const CONSTS = { i: C(0, 1), pi: C(Math.PI), "π": C(Math.PI), e: C(Math.E) };

function tokenize(src) {
  const s = src.replace(/−/g, "-").replace(/[×·]/g, "*");
  const re = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-zπ]+)|(√)|([-+*/^(),]))/y;
  const toks = [];
  let m;
  re.lastIndex = 0;
  while (re.lastIndex < s.length) {
    const at = re.lastIndex;
    m = re.exec(s);
    if (!m) {
      if (/^\s*$/.test(s.slice(at))) break;
      throw new Error(`Unexpected "${s.slice(at).trim()[0]}"`);
    }
    if (m[1]) toks.push({ t: "num", v: parseFloat(m[1]) });
    else if (m[2]) toks.push({ t: "id", v: m[2] });
    else if (m[3]) toks.push({ t: "sqrt" });
    else toks.push({ t: m[4] });
  }
  return toks;
}

function evalExpr(src) {
  if (!src || !src.trim()) throw new Error("Empty expression");
  const toks = tokenize(src);
  let k = 0;
  const peek = () => toks[k];
  const eat = t => {
    const tok = toks[k];
    if (!tok || tok.t !== t) throw new Error(`Expected "${t}"`);
    k++;
    return tok;
  };
  const startsAtom = tok => tok && (tok.t === "num" || tok.t === "id" || tok.t === "(" || tok.t === "sqrt");

  function expr() {
    let v = term();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = toks[k++].t;
      const r = term();
      v = op === "+" ? cadd(v, r) : csub(v, r);
    }
    return v;
  }
  function term() {
    let v = unary();
    for (;;) {
      const tok = peek();
      if (tok && tok.t === "*") { k++; v = cmul(v, unary()); }
      else if (tok && tok.t === "/") { k++; v = cdiv(v, unary()); }
      else if (startsAtom(tok)) v = cmul(v, power());
      else return v;
    }
  }
  function unary() {
    const tok = peek();
    if (tok && tok.t === "-") { k++; return cscale(unary(), -1); }
    if (tok && tok.t === "+") { k++; return unary(); }
    return power();
  }
  function power() {
    const base = atom();
    if (peek() && peek().t === "^") { k++; return cpow(base, unary()); }
    return base;
  }
  function atom() {
    const tok = toks[k++];
    if (!tok) throw new Error("Unexpected end");
    if (tok.t === "num") return C(tok.v);
    if (tok.t === "sqrt") return csqrt(power());
    if (tok.t === "(") { const v = expr(); eat(")"); return v; }
    if (tok.t === "id") {
      const name = tok.v;
      if (FUNCS[name]) { eat("("); const v = expr(); eat(")"); return FUNCS[name](v); }
      if (CONSTS[name]) return CONSTS[name];
      throw new Error(`Unknown name "${name}"`);
    }
    throw new Error(`Unexpected "${tok.t}"`);
  }

  const v = expr();
  if (k < toks.length) throw new Error(`Unexpected "${toks[k].v ?? toks[k].t}"`);
  if (!isFinite(v.re) || !isFinite(v.im)) throw new Error("Not a finite number");
  return v;
}

function evalReal(src) {
  const v = evalExpr(src);
  if (Math.abs(v.im) > 1e-9) throw new Error("Must be a real number");
  return v.re;
}

/* ===================== 2x2 matrices: [u00, u01, u10, u11] ===================== */
const mat = (a, b, c, d) => [a, b, c, d];
const mmul = (A, B) => [
  cadd(cmul(A[0], B[0]), cmul(A[1], B[2])), cadd(cmul(A[0], B[1]), cmul(A[1], B[3])),
  cadd(cmul(A[2], B[0]), cmul(A[3], B[2])), cadd(cmul(A[2], B[1]), cmul(A[3], B[3])),
];
const dag = A => [cconj(A[0]), cconj(A[2]), cconj(A[1]), cconj(A[3])];
const mvec = (A, v) => [cadd(cmul(A[0], v[0]), cmul(A[1], v[1])), cadd(cmul(A[2], v[0]), cmul(A[3], v[1]))];
const ID = mat(C(1), C(0), C(0), C(1));

function isUnitary(U, tol = 1e-6) {
  const P = mmul(dag(U), U);
  return cabs2(csub(P[0], C(1))) < tol && cabs2(P[1]) < tol && cabs2(P[2]) < tol && cabs2(csub(P[3], C(1))) < tol;
}

// R_n(θ) = cos(θ/2) I − i sin(θ/2) n·σ
function rotMatrix(n, theta) {
  const c = Math.cos(theta / 2), s = Math.sin(theta / 2);
  return mat(C(c, -s * n[2]), C(-s * n[1], -s * n[0]), C(s * n[1], -s * n[0]), C(c, s * n[2]));
}

// Write U (up to global phase) as R_n(θ) with θ in [0, π].
function toRotation(U) {
  const sd = csqrt(csub(cmul(U[0], U[3]), cmul(U[1], U[2])));
  let V = U.map(z => cdiv(z, sd));
  let c = (V[0].re + V[3].re) / 2;
  let n = [-(V[1].im + V[2].im) / 2, (V[2].re - V[1].re) / 2, (V[3].im - V[0].im) / 2];
  if (c < 0) { c = -c; n = n.map(x => -x); }
  const s = Math.hypot(...n);
  if (s < 1e-12) return { axis: [0, 0, 1], angle: 0 };
  return { axis: n.map(x => x / s), angle: 2 * Math.atan2(s, c) };
}

// |tr(A†B)|/2 = 1 iff A and B agree up to a global phase.
const samePhase = (A, B) => {
  const P = mmul(dag(A), B);
  return Math.abs(Math.hypot(P[0].re + P[3].re, P[0].im + P[3].im) / 2 - 1) < 1e-9;
};

/* ===================== gates and states ===================== */
const r2 = Math.SQRT1_2;
const h = 0.5;
const SX = mat(C(h, h), C(h, -h), C(h, -h), C(h, h));
const SY = mat(C(h, h), C(-h, -h), C(h, h), C(h, h));
// name: plain text (sequence copy, tooltips); tex: how it is typeset.
// Laid out in rows of four: Paulis and H, square roots and phase gates, their inverses.
const BUILTIN = [
  { name: "X", tex: "X", U: mat(C(0), C(1), C(1), C(0)), desc: "Pauli X" },
  { name: "Y", tex: "Y", U: mat(C(0), C(0, -1), C(0, 1), C(0)), desc: "Pauli Y" },
  { name: "Z", tex: "Z", U: mat(C(1), C(0), C(0), C(-1)), desc: "Pauli Z" },
  { name: "H", tex: "H", U: mat(C(r2), C(r2), C(r2), C(-r2)), desc: "Hadamard" },
  { name: "Sx", tex: "S_x", U: SX, desc: "√X" },
  { name: "Sy", tex: "S_y", U: SY, desc: "√Y" },
  { name: "S", tex: "S", U: mat(C(1), C(0), C(0), C(0, 1)), desc: "√Z" },
  { name: "T", tex: "T", U: mat(C(1), C(0), C(0), C(r2, r2)), desc: "π/8 gate, √S" },
  { name: "Sx†", tex: "S_x^\\dagger", U: dag(SX), desc: "√X dagger" },
  { name: "Sy†", tex: "S_y^\\dagger", U: dag(SY), desc: "√Y dagger" },
  { name: "S†", tex: "S^\\dagger", U: mat(C(1), C(0), C(0), C(0, -1)), desc: "S dagger" },
  { name: "T†", tex: "T^\\dagger", U: mat(C(1), C(0), C(0), C(r2, -r2)), desc: "T dagger" },
];

const STATES = [
  { id: "0", label: "|0⟩", tex: "\\lvert 0\\rangle", psi: [C(1), C(0)], b: [0, 0, 1] },
  { id: "1", label: "|1⟩", tex: "\\lvert 1\\rangle", psi: [C(0), C(1)], b: [0, 0, -1] },
  { id: "+", label: "|+⟩", tex: "\\lvert {+}\\rangle", psi: [C(r2), C(r2)], b: [1, 0, 0] },
  { id: "-", label: "|−⟩", tex: "\\lvert {-}\\rangle", psi: [C(r2), C(-r2)], b: [-1, 0, 0] },
  { id: "+i", label: "|+i⟩", tex: "\\lvert {+i}\\rangle", psi: [C(r2), C(0, r2)], b: [0, 1, 0] },
  { id: "-i", label: "|−i⟩", tex: "\\lvert {-i}\\rangle", psi: [C(r2), C(0, -r2)], b: [0, -1, 0] },
];
const BASES = {
  X: { plus: STATES[2], minus: STATES[3] },
  Y: { plus: STATES[4], minus: STATES[5] },
  Z: { plus: STATES[0], minus: STATES[1] },
};

// Custom gate names: letters/digits, an optional _subscript and an optional trailing †.
const NAME_RE = /^([A-Za-z][A-Za-z0-9]*)(?:_([A-Za-z0-9]+))?(†?)$/;
function nameTex(name) {
  const m = NAME_RE.exec(name);
  if (!m) return `\\text{${name.replace(/[^A-Za-z0-9 ]/g, "")}}`;
  const base = m[1].length > 1 ? `\\mathrm{${m[1]}}` : m[1];
  return base + (m[2] ? `_{${m[2]}}` : "") + (m[3] ? "^\\dagger" : "");
}

function bloch(psi) {
  const [a, b] = psi;
  const ab = cmul(cconj(a), b);
  return [2 * ab.re, 2 * ab.im, cabs2(a) - cabs2(b)];
}
function normalize(psi) {
  const n = Math.sqrt(cabs2(psi[0]) + cabs2(psi[1]));
  return psi.map(z => cscale(z, 1 / n));
}
const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
const cross = (u, v) => [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
function rodrigues(v, n, a) {
  const c = Math.cos(a), s = Math.sin(a), k = dot(n, v) * (1 - c), x = cross(n, v);
  return [v[0] * c + x[0] * s + n[0] * k, v[1] * c + x[1] * s + n[1] * k, v[2] * c + x[2] * s + n[2] * k];
}

/* ===================== formatting ===================== */
const strip = x => {
  const s = (Math.abs(x) < 5e-4 ? 0 : x).toFixed(3).replace(/\.?0+$/, "");
  return s.replace(/^-/, "−");
};
function fmtC(z) {
  const re = Math.abs(z.re) < 5e-4 ? 0 : z.re, im = Math.abs(z.im) < 5e-4 ? 0 : z.im;
  if (im === 0) return strip(re);
  const ims = (Math.abs(Math.abs(im) - 1) < 5e-4 ? "" : strip(Math.abs(im))) + "i";
  if (re === 0) return (im < 0 ? "−" : "") + ims;
  return `${strip(re)} ${im < 0 ? "−" : "+"} ${ims}`;
}
// Show an angle as a rational multiple of π when it is one.
function fmtAngle(x) {
  if (Math.abs(x) < 1e-9) return "0";
  for (const d of [1, 2, 3, 4, 6, 8, 12, 16]) {
    const k = x / Math.PI * d;
    if (Math.abs(k - Math.round(k)) < 1e-9) {
      const n = Math.round(k), g = gcd(Math.abs(n), d), nn = n / g, dd = d / g;
      const num = nn === 1 ? "π" : nn === -1 ? "−π" : `${strip(nn)}π`;
      return dd === 1 ? num : `${num}/${dd}`;
    }
  }
  return strip(x);
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
const fmtVec = v => `(${v.map(strip).join(", ")})`;
const matTitle = U => `[[${fmtC(U[0])}, ${fmtC(U[1])}], [${fmtC(U[2])}, ${fmtC(U[3])}]]`;

/* ---------- TeX versions (typeset with KaTeX) ---------- */
const tnum = x => strip(x).replace("−", "-");
function texC(z) {
  const re = Math.abs(z.re) < 5e-4 ? 0 : z.re, im = Math.abs(z.im) < 5e-4 ? 0 : z.im;
  if (im === 0) return tnum(re);
  const ims = (Math.abs(Math.abs(im) - 1) < 5e-4 ? "" : tnum(Math.abs(im))) + "i";
  if (re === 0) return (im < 0 ? "-" : "") + ims;
  return `${tnum(re)} ${im < 0 ? "-" : "+"} ${ims}`;
}
// Rational multiples of π as fractions (or with a slash when inline=true, e.g. inside R_x(π/4)).
function texAngle(x, inline = false) {
  if (Math.abs(x) < 1e-9) return "0";
  for (const d of [1, 2, 3, 4, 6, 8, 12, 16]) {
    const k = x / Math.PI * d;
    if (Math.abs(k - Math.round(k)) < 1e-9) {
      const n = Math.round(k), g = gcd(Math.abs(n), d), nn = Math.abs(n / g), dd = d / g;
      const sgn = n < 0 ? "-" : "";
      const num = nn === 1 ? "\\pi" : `${nn}\\pi`;
      if (dd === 1) return sgn + num;
      return inline ? `${sgn}${num}/${dd}` : `${sgn}\\tfrac{${num}}{${dd}}`;
    }
  }
  return tnum(x);
}
const texVec = v => `(${v.map(tnum).join(",\\ ")})`;

// Render TeX to HTML. KaTeX is self-hosted; if it failed to load, show the source.
const M = (t, display = false) => window.katex
  ? katex.renderToString(t, { throwOnError: false, displayMode: display })
  : `<code>${t.replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</code>`;

/* ===================== custom gates (localStorage) ===================== */
const STORE_KEY = "bloch-custom-gates-v1";
function loadCustom() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    return raw.filter(g => g && typeof g.name === "string" && Array.isArray(g.U) && g.U.length === 4)
      .map(g => ({ ...g, U: g.U.map(([re, im]) => C(re, im)) }));
  } catch { return []; }
}
function saveCustom() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(custom.map(g => ({ ...g, U: g.U.map(z => [z.re, z.im]) }))));
    return true;
  } catch { return false; }
}
let custom = loadCustom();

/* ===================== app state ===================== */
const $ = id => document.getElementById(id);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const app = {
  init: STATES[0],
  psi: STATES[0].psi,
  seq: [],          // [{label, tex, kind: 'gate'|'meas'}]
  history: [],      // snapshots for undo
  arcs: [],         // path on the sphere: one rotation arc {v0, axis, angle} per gate
  net: ID,          // product of gates since start or last measurement
  anim: null,       // running gate animation
  queue: [],
};

function snapshot() {
  return { psi: app.psi, seqLen: app.seq.length, arcsLen: app.arcs.length, net: app.net };
}

function resetTo(state) {
  finishAll();
  app.init = state;
  app.psi = state.psi;
  app.seq = [];
  app.history = [];
  app.arcs = [];
  app.net = ID;
  $("counts").innerHTML = "";
  render();
}

// op: {label, tex, U, axis?, angle?}. Gates given as axis and angle (rotations, axis-angle custom gates)
// trace exactly that rotation; other gates trace the shortest rotation that implements them.
function applyGate(op) {
  app.queue.push(op);
  if (!app.anim) startNext();
}

function begin(op) {
  app.history.push(snapshot());
  app.seq.push({ label: op.label, tex: op.tex, kind: "gate" });
  const rot = op.axis ? { axis: op.axis, angle: op.angle } : toRotation(op.U);
  const arc = { v0: bloch(app.psi), axis: rot.axis, angle: rot.angle };
  if (Math.abs(rot.angle) > 1e-9) app.arcs.push(arc);
  const after = normalize(mvec(op.U, app.psi));
  const finish = () => { app.psi = after; app.net = mmul(op.U, app.net); app.anim = null; };
  return { arc, finish };
}

function startNext() {
  const op = app.queue.shift();
  if (!op) return;
  const { arc, finish } = begin(op);
  const done = () => { finish(); render(); startNext(); };
  if (reduceMotion.matches || Math.abs(arc.angle) < 1e-9) { done(); return; }
  const dur = Math.min(1600, 300 + 380 * Math.abs(arc.angle) / Math.PI);
  const anim = { arc, frac: 0, t0: performance.now(), dur, done, finish };
  app.anim = anim;
  renderText();
  requestAnimationFrame(now => tick(now, anim));
}

function tick(now, a) {
  if (app.anim !== a) return;   // finished early by undo/reset/measure
  const t = Math.min(1, (now - a.t0) / a.dur);
  a.frac = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  if (t >= 1) { a.done(); return; }
  draw();
  requestAnimationFrame(next => tick(next, a));
}

// Complete the running animation and any queued gates immediately.
function finishAll() {
  if (app.anim) app.anim.finish();
  while (app.queue.length) begin(app.queue.shift()).finish();
}

function undo() {
  finishAll();
  const s = app.history.pop();
  if (!s) return;
  app.psi = s.psi;
  app.seq.length = s.seqLen;
  app.arcs.length = s.arcsLen;
  app.net = s.net;
  $("counts").innerHTML = "";
  render();
}

function probs(basis) {
  const e = BASES[basis].plus.psi;
  const p = cabs2(cadd(cmul(cconj(e[0]), app.psi[0]), cmul(cconj(e[1]), app.psi[1])));
  return Math.min(1, Math.max(0, p));
}

function measureOnce() {
  finishAll();
  const basis = currentBasis();
  const p = probs(basis);
  const plus = Math.random() < p;
  const out = plus ? BASES[basis].plus : BASES[basis].minus;
  app.history.push(snapshot());
  const b = basis.toLowerCase();
  app.seq.push({ label: `M${b}→${out.label}`, tex: `M_${b}{\\to}${out.tex}`, kind: "meas" });
  app.psi = out.psi;
  app.net = ID;
  $("counts").innerHTML = `<p class="outcome">Outcome ${M(out.tex)} with probability ${M(tnum(plus ? p : 1 - p))}. The state has collapsed.</p>`;
  render();
}

function sampleShots() {
  finishAll();
  const n = Math.round(Number($("shots").value));
  if (!(n >= 1 && n <= 100000)) { $("counts").innerHTML = `<p class="err">Shots must be between 1 and 100000.</p>`; return; }
  const basis = currentBasis();
  const p = probs(basis);
  let k = 0;
  for (let j = 0; j < n; j++) if (Math.random() < p) k++;
  const B = BASES[basis];
  $("counts").innerHTML =
    `<p class="outcome">${n} shots in the ${M(basis)} basis (the state is not changed):</p>` +
    probRow(B.plus.tex, k / n, `${k}`) + probRow(B.minus.tex, (n - k) / n, `${n - k}`, true);
}

const currentBasis = () => document.querySelector("input[name=basis]:checked").value;
const probRow = (tex, p, text, alt) =>
  `<div class="prob"><span>${M(tex)}</span><span class="bar${alt ? " alt" : ""}"><i style="width:${(p * 100).toFixed(1)}%"></i></span><span class="v">${text}</span></div>`;

/* ===================== text rendering ===================== */
function renderText() {
  // sequence
  const toks = app.seq.map(s => `<span class="tok${s.kind === "meas" ? " meas" : ""}">${M(s.tex)}</span>`);
  $("seq").innerHTML = `<span class="tok init">${M(app.init.tex)}</span><span class="arrow" aria-hidden="true">▸</span>` +
    (toks.length ? toks.join("") : `<span class="empty">no gates yet</span>`);
  $("seq").setAttribute("aria-label", `${app.init.label}: ${app.seq.map(s => s.label).join(" ") || "no gates yet"}`);
  $("undo").disabled = app.history.length === 0 && !app.anim;

  // readout (global phase fixed so the |0⟩ amplitude is real and non-negative)
  const psi = app.psi;
  const ph = cabs2(psi[0]) > 1e-12 ? cscale(cconj(psi[0]), 1 / Math.sqrt(cabs2(psi[0]))) : cscale(cconj(psi[1]), 1 / Math.sqrt(cabs2(psi[1])));
  const a = cmul(psi[0], ph), b = cmul(psi[1], ph);
  const v = bloch(psi);
  const theta = Math.acos(Math.max(-1, Math.min(1, v[2])));
  const phi = Math.hypot(v[0], v[1]) < 1e-9 ? 0 : (Math.atan2(v[1], v[0]) + 2 * Math.PI) % (2 * Math.PI);
  const named = STATES.find(s => Math.hypot(s.b[0] - v[0], s.b[1] - v[1], s.b[2] - v[2]) < 1e-6);
  const ket = ketTex(a, b);
  const showNamed = named && named !== STATES[0] && named !== STATES[1];
  $("readout").innerHTML =
    `<dt>State</dt><dd>${showNamed
      ? `${M(`\\lvert\\psi\\rangle = ${named.tex}`)} <span class="expand">${M(`(= ${ket})`)}</span>`
      : M(`\\lvert\\psi\\rangle = ${ket}`)}</dd>` +
    `<dt>Bloch vector</dt><dd>${M(`\\vec r = ${texVec(v)}`)}</dd>` +
    `<dt>Angles</dt><dd>${M(`\\theta = ${texAngle(theta)},\\quad \\varphi = ${texAngle(phi)}`)}</dd>`;

  // net operation since the last reset or measurement
  const r = toRotation(app.net);
  let net;
  if (r.angle < 1e-9) net = `the identity ${M("I")}`;
  else {
    net = `${M(`R_{\\hat n}\\big(${texAngle(r.angle)}\\big)`)} with ${M(`\\hat n = ${texVec(r.axis)}`)}`;
    const same = [...BUILTIN, ...custom].find(g => samePhase(g.U, app.net));
    if (same) net += `, the same as ${M(same.tex || nameTex(same.name))}`;
  }
  const lastMeas = app.seq.map(s => s.kind).lastIndexOf("meas");
  $("net").innerHTML = `Net gate since ${lastMeas >= 0 ? "the last measurement" : "the start"}, up to global phase: ${net}`;

  // probabilities
  const basis = currentBasis();
  const p = probs(basis);
  $("basis-now").innerHTML = `the ${M(basis)} basis`;
  $("probs").innerHTML = probRow(BASES[basis].plus.tex, p, strip(p)) + probRow(BASES[basis].minus.tex, 1 - p, strip(1 - p), true);
}
// a|0⟩ + b|1⟩ with zero terms dropped and unit coefficients omitted (a is real and ≥ 0).
function ketTex(a, b) {
  const tiny = z => cabs2(z) < 2.5e-7;
  const k0 = "\\lvert 0\\rangle", k1 = "\\lvert 1\\rangle";
  const coef = z => {
    const re = Math.abs(z.re) < 5e-4 ? 0 : z.re, im = Math.abs(z.im) < 5e-4 ? 0 : z.im;
    const t = texC(z);
    if (t === "1") return "";
    return (re !== 0 && im !== 0) ? `(${t})\\,` : `${t}\\,`;
  };
  const neg = z => {
    const re = Math.abs(z.re) < 5e-4 ? 0 : z.re, im = Math.abs(z.im) < 5e-4 ? 0 : z.im;
    return re < 0 || (re === 0 && im < 0);
  };
  if (tiny(b)) return k0;
  if (tiny(a)) return `${neg(b) ? "-" : ""}${coef(neg(b) ? cscale(b, -1) : b)}${k1}`;
  return `${coef(a)}${k0} ${neg(b) ? "-" : "+"} ${coef(neg(b) ? cscale(b, -1) : b)}${k1}`;
}
const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function render() { renderText(); draw(); }

/* ===================== canvas ===================== */
const canvas = $("sphere");
const ctx = canvas.getContext("2d");
const VIEW0 = { az: 0.78, el: 0.36 };
const view = { ...VIEW0 };
let W = 0, colors = {};

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const g = n => cs.getPropertyValue(n).trim();
  colors = {
    ink: g("--ink"), bg: g("--bg"), muted: g("--muted"), faint: g("--faint"), line: g("--line"), surface: g("--surface"),
    lav: g("--lavender"), accent: g("--accent"), accent2: g("--accent-2"),
    x: g("--pink-strong") || "#ff8fb8", y: g("--blue-strong") || "#8fd0fa", z: g("--lavender-strong") || "#b9a3f0",
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
  };
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  W = rect.width;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function basisVecs() {
  const { az, el } = view;
  const R = [-Math.sin(az), Math.cos(az), 0];
  const D = [Math.cos(el) * Math.cos(az), Math.cos(el) * Math.sin(az), Math.sin(el)];
  const U = [-Math.sin(el) * Math.cos(az), -Math.sin(el) * Math.sin(az), Math.cos(el)];
  return { R, D, U };
}

// Points along a rotation arc, about one per degree so the trace is a smooth piece of circle.
function arcPoints(arc, frac = 1) {
  const ang = arc.angle * frac;
  const n = Math.max(2, Math.ceil(Math.abs(ang) / (Math.PI / 180)) + 1);
  const pts = [];
  for (let j = 0; j < n; j++) pts.push(rodrigues(arc.v0, arc.axis, ang * j / (n - 1)));
  return pts;
}

function currentVector() {
  const a = app.anim;
  return a ? rodrigues(a.arc.v0, a.arc.axis, a.arc.angle * a.frac) : bloch(app.psi);
}

// Ket and axis labels are typeset HTML laid over the canvas; draw() only moves them.
const labelEls = { states: [], axes: [] };
function buildLabels() {
  const box = document.createElement("div");
  box.className = "sphere-labels";
  box.setAttribute("aria-hidden", "true");
  for (const s of STATES) {
    const el = document.createElement("span");
    el.className = "slabel"; el.innerHTML = M(s.tex);
    box.appendChild(el); labelEls.states.push(el);
  }
  for (const n of ["x", "y", "z"]) {
    const el = document.createElement("span");
    el.className = "alabel"; el.innerHTML = M(n);
    box.appendChild(el); labelEls.axes.push(el);
  }
  $("sphere-wrap").appendChild(box);
}
const place = (el, x, y) => { el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`; };

function draw() {
  if (!W) return;
  const { R, D, U } = basisVecs();
  const cx = W / 2, cy = W / 2, r = W * (W < 460 ? 0.3 : 0.34);
  const P = p => ({ x: cx + r * dot(p, R), y: cy - r * dot(p, U), d: dot(p, D) });
  ctx.clearRect(0, 0, W, W);

  const circles = [[[1, 0, 0], [0, 1, 0]], [[1, 0, 0], [0, 0, 1]], [[0, 1, 0], [0, 0, 1]]]
    .map(([a, b]) => arcPoints({ v0: a, axis: cross(a, b), angle: 2 * Math.PI }));
  const axes = [
    { e: [1, 0, 0], col: colors.x },
    { e: [0, 1, 0], col: colors.y },
    { e: [0, 0, 1], col: colors.z },
  ];
  const cur = currentVector();
  const arcs = app.arcs.map((arc, j) => ({
    pts: arcPoints(arc, app.anim && arc === app.anim.arc ? app.anim.frac : 1),
    latest: j === app.arcs.length - 1,
  }));

  // Stroke the front (or back) part of a polyline, splitting where it crosses the silhouette.
  const polyline = (pts, front) => {
    ctx.beginPath();
    let drawing = false;
    for (let j = 0; j < pts.length - 1; j++) {
      const mid = [(pts[j][0] + pts[j + 1][0]) / 2, (pts[j][1] + pts[j + 1][1]) / 2, (pts[j][2] + pts[j + 1][2]) / 2];
      if ((dot(mid, D) >= 0) === front) {
        const a = P(pts[j]), b = P(pts[j + 1]);
        if (!drawing) { ctx.moveTo(a.x, a.y); drawing = true; }
        ctx.lineTo(b.x, b.y);
      } else drawing = false;
    }
    ctx.stroke();
  };

  const layer = front => {
    ctx.save();
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const fade = front ? 1 : 0.35;

    // great circles
    ctx.globalAlpha = fade; ctx.setLineDash(front ? [] : [4, 4]);
    ctx.strokeStyle = colors.faint; ctx.lineWidth = 1;
    for (const c of circles) polyline(c, front);

    // half-axes
    for (const a of axes) for (const sgn of [1, -1]) {
      const end = a.e.map(x => x * sgn * (sgn > 0 ? 1.18 : 1));
      if ((dot(end, D) >= 0) !== front) continue;
      const p0 = P([0, 0, 0]), p1 = P(end);
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y);
      ctx.strokeStyle = a.col; ctx.lineWidth = sgn > 0 ? 1.6 : 1; ctx.stroke();
    }

    // path traced by the gates: older arcs fainter, the latest one bold
    ctx.setLineDash(front ? [] : [3, 4]);
    ctx.strokeStyle = colors.accent;
    for (const a of arcs) {
      ctx.globalAlpha = (a.latest ? 0.9 : 0.4) * fade;
      ctx.lineWidth = a.latest ? 2.5 : 1.8;
      polyline(a.pts, front);
    }
    ctx.setLineDash([]);

    // six cardinal states
    ctx.globalAlpha = fade;
    STATES.forEach(s => {
      const p = P(s.b);
      if ((p.d >= -1e-9) !== front) return;
      const here = Math.hypot(cur[0] - s.b[0], cur[1] - s.b[1], cur[2] - s.b[2]) < 1e-6;
      const isInit = s === app.init;
      ctx.beginPath(); ctx.arc(p.x, p.y, here ? 7.5 : 5.5, 0, 2 * Math.PI);
      ctx.fillStyle = s.b[0] ? colors.x : s.b[1] ? colors.y : colors.z; ctx.fill();
      ctx.lineWidth = isInit ? 2.5 : 1.5; ctx.strokeStyle = isInit ? colors.ink : colors.surface; ctx.stroke();
    });

    // state vector
    if ((dot(cur, D) >= 0) === front) {
      const p0 = P([0, 0, 0]), p1 = P(cur);
      ctx.globalAlpha = front ? 1 : 0.5;
      ctx.strokeStyle = colors.accent; ctx.fillStyle = colors.accent; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x), len = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      if (len > 6) {
        const hs = 12;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p1.x - hs * Math.cos(ang - 0.4), p1.y - hs * Math.sin(ang - 0.4));
        ctx.lineTo(p1.x - hs * Math.cos(ang + 0.4), p1.y - hs * Math.sin(ang + 0.4));
        ctx.closePath(); ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(p1.x, p1.y, 5, 0, 2 * Math.PI); ctx.fill();
      }
    }
    ctx.restore();
  };

  layer(false);

  // sphere body
  ctx.save();
  const grad = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
  grad.addColorStop(0, colors.dark ? "rgba(197,180,255,0.16)" : "rgba(255,255,255,0.55)");
  grad.addColorStop(1, colors.dark ? "rgba(44,37,82,0.55)" : "rgba(236,230,252,0.6)");
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = colors.faint; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();

  layer(true);

  // labels
  STATES.forEach((s, j) => {
    const p = P(s.b), el = labelEls.states[j];
    const dx = p.x - cx, dy = p.y - cy, L = Math.hypot(dx, dy), off = 24;
    place(el, L > 4 ? p.x + dx / L * off : p.x + off, L > 4 ? p.y + dy / L * off : p.y - off);
    el.classList.toggle("back", p.d < -1e-9);
    el.classList.toggle("here", Math.hypot(cur[0] - s.b[0], cur[1] - s.b[1], cur[2] - s.b[2]) < 1e-6);
    el.classList.toggle("init", s === app.init);
  });
  axes.forEach((a, j) => {
    const p = P(a.e.map(x => x * 1.42));
    place(labelEls.axes[j], p.x, p.y);
    labelEls.axes[j].classList.toggle("back", p.d < 0);
  });
}

// drag to rotate the view
let drag = null;
canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, az: view.az, el: view.el }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", e => {
  if (!drag) return;
  view.az = drag.az - (e.clientX - drag.x) * 0.01;
  view.el = Math.max(-1.45, Math.min(1.45, drag.el + (e.clientY - drag.y) * 0.01));
  draw();
});
const endDrag = () => { drag = null; };
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);
canvas.addEventListener("dblclick", () => { Object.assign(view, VIEW0); draw(); });

/* ===================== controls ===================== */
function buildInit() {
  $("init").innerHTML = STATES.map(s =>
    `<label class="chip"><input type="radio" name="init" value="${s.id}"${s === app.init ? " checked" : ""}><span>${M(s.tex)}</span></label>`).join("");
  $("init").addEventListener("change", e => resetTo(STATES.find(s => s.id === e.target.value)));
}

function gateButton(g, mine) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "gate" + (mine ? " mine" : "");
  const tex = g.tex || nameTex(g.name);
  b.innerHTML = M(tex);
  b.title = `${g.name}${g.desc ? " (" + g.desc + ")" : ""}\n${matTitle(g.U)}`;
  b.setAttribute("aria-label", `Apply ${g.name}`);
  b.addEventListener("click", () => applyGate({ label: g.name, tex, U: g.U, axis: g.axis, angle: g.angle }));
  if (mine) {
    const d = document.createElement("span");
    d.className = "del"; d.textContent = "×"; d.title = `Delete ${g.name}`; d.setAttribute("role", "button");
    d.setAttribute("aria-label", `Delete gate ${g.name}`);
    d.addEventListener("click", e => {
      e.stopPropagation();
      if (!confirm(`Delete gate "${g.name}"?`)) return;
      custom = custom.filter(x => x !== g);
      saveCustom();
      buildMine();
      renderText();
    });
    b.appendChild(d);
  }
  return b;
}

function buildGates() {
  const box = $("gates");
  for (const g of BUILTIN) box.appendChild(gateButton(g, false));
}
function buildMine() {
  const box = $("my-gates");
  box.innerHTML = "";
  for (const g of custom) box.appendChild(gateButton(g, true));
  $("my-gates-wrap").hidden = custom.length === 0;
}

function buildRots() {
  const box = $("rots");
  const defs = [["RX", "x", [1, 0, 0], "pi/2"], ["RY", "y", [0, 1, 0], "pi/2"], ["RZ", "z", [0, 0, 1], "pi/4"]];
  for (const [name, ax, axis, def] of defs) {
    const row = document.createElement("div");
    row.className = "rot";
    row.innerHTML = `<span class="name">${M(`R_${ax}`)}</span><input value="${def}" aria-label="${name} angle in radians"><button class="btn small" type="button">Apply</button>`;
    const input = row.querySelector("input");
    const go = () => {
      try {
        const th = evalReal(input.value);
        input.classList.remove("bad"); $("rot-err").textContent = "";
        applyGate({ label: `${name}(${fmtAngle(th)})`, tex: `R_${ax}(${texAngle(th, true)})`, U: rotMatrix(axis, th), axis, angle: th });
      } catch (err) {
        input.classList.add("bad"); $("rot-err").textContent = `${name}: ${err.message}`;
      }
    };
    row.querySelector("button").addEventListener("click", go);
    input.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    box.appendChild(row);
  }
}

function readGateForm() {
  const mode = document.querySelector("input[name=g-mode]:checked").value;
  const field = id => {
    const el = $(id);
    try { const v = evalExpr(el.value); el.classList.remove("bad"); return v; }
    catch (err) { el.classList.add("bad"); throw new Error(`${el.getAttribute("aria-label") || id}: ${err.message}`); }
  };
  if (mode === "matrix") {
    const U = ["m00", "m01", "m10", "m11"].map(field);
    if (!isUnitary(U)) throw new Error("That matrix is not unitary (U†U ≠ I). Check the entries, including normalisation.");
    return { U };
  }
  const n = ["nx", "ny", "nz"].map(id => {
    const v = field(id);
    if (Math.abs(v.im) > 1e-9) { $(id).classList.add("bad"); throw new Error("Axis components must be real."); }
    return v.re;
  });
  const L = Math.hypot(...n);
  if (L < 1e-12) throw new Error("The axis cannot be the zero vector.");
  const th = field("ang");
  if (Math.abs(th.im) > 1e-9) throw new Error("The angle must be real.");
  const axis = n.map(x => x / L);
  return { U: rotMatrix(axis, th.re), axis, angle: th.re };
}

function setupDefine() {
  const err = $("g-err");
  document.querySelectorAll("input[name=g-mode]").forEach(r => r.addEventListener("change", () => {
    const rot = document.querySelector("input[name=g-mode]:checked").value === "rot";
    $("g-matrix").hidden = rot; $("g-rot").hidden = !rot; err.textContent = "";
  }));
  $("g-try").addEventListener("click", () => {
    try {
      const g = readGateForm();
      const name = $("g-name").value.trim();
      const label = NAME_RE.test(name) ? name : "U";
      err.textContent = "";
      applyGate({ label, tex: nameTex(label), ...g });
    } catch (e) { err.textContent = e.message; }
  });
  $("g-save").addEventListener("click", () => {
    const name = $("g-name").value.trim();
    try {
      if (!name) throw new Error("Give the gate a name.");
      if (!NAME_RE.test(name)) throw new Error("Use letters and digits, optionally a subscript after _ and a trailing †, e.g. U2, R_a or V†.");
      if (BUILTIN.some(g => g.name === name) || /^R[XYZ]$/i.test(name)) throw new Error(`"${name}" is a built-in gate.`);
      const g = readGateForm();
      const i = custom.findIndex(c => c.name === name);
      if (i >= 0 && !confirm(`Replace your gate "${name}"?`)) return;
      const entry = { name, tex: nameTex(name), desc: "Your gate", ...g };
      if (i >= 0) custom[i] = entry; else custom.push(entry);
      err.textContent = saveCustom() ? "" : "Saved for this visit only: this browser blocks local storage.";
      buildMine();
      renderText();
    } catch (e) { err.textContent = e.message; }
  });
}

function setupMisc() {
  $("undo").addEventListener("click", undo);
  $("reset").addEventListener("click", () => resetTo(app.init));
  $("copy").addEventListener("click", async () => {
    const text = `${app.init.label} : ${app.seq.map(s => s.label).join(" ")}`;
    try { await navigator.clipboard.writeText(text); flash($("copy"), "Copied"); }
    catch { flash($("copy"), "Copy failed"); }
  });
  $("measure").addEventListener("click", measureOnce);
  $("sample").addEventListener("click", sampleShots);
  document.querySelectorAll("input[name=basis]").forEach(r => r.addEventListener("change", () => { $("counts").innerHTML = ""; renderText(); }));
}
function flash(btn, text) {
  const old = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = old; }, 1200);
}

/* ===================== boot ===================== */
readColors();
buildLabels();
buildInit();
buildGates();
buildMine();
buildRots();
setupDefine();
setupMisc();
new ResizeObserver(resize).observe($("sphere-wrap"));
// Typeset the static math in the page (hints, field labels).
document.querySelectorAll("[data-tex]").forEach(el => { el.innerHTML = M(el.dataset.tex); });
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { readColors(); draw(); });
render();
