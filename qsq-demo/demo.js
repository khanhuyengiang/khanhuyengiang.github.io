// Gate characterisation demo: picks a precomputed noise draw from data.json and plots it.
// data.json is written by qsq's scripts/examples/web_demo_data.py.

"use strict";

const $ = (id) => document.getElementById(id);
const SVG = "http://www.w3.org/2000/svg";

/** Protocol key (as in data.json) -> [display name, short label line 1, line 2]. */
const NAMES = {
  "RB (per gate)": ["RB, per gate", "RB", "per gate"],
  "IRB (sx)": ["Interleaved RB", "IRB", "√X"],
  "QSQ greedy 8": ["QSQ greedy 8", "QSQ", "greedy 8"],
  "QSQ greedy 15": ["QSQ greedy 15", "QSQ", "greedy 15"],
  "QSQ greedy short 8": ["QSQ greedy short 8", "QSQ", "greedy short 8"],
  "QSQ ladder m=10": ["QSQ ladder m=10", "QSQ", "ladder m=10"],
  "QSQ 26 (task 4)": ["QSQ baseline 26", "QSQ", "baseline 26"],
  "QPT": ["QPT", "QPT", "standard"],
  "QPT, long": ["QPT, long sequence", "QPT", "long sequence"],
  "GST": ["GST", "GST", "long"],
  "GST, short": ["GST, short (L=1)", "GST", "short"],
};
const name = (key) => (NAMES[key] || [key])[0];

const state = {
  data: null,
  draw: -1,
  mode: "per",
  shots: { per: 1000, total: 50000 },
  enabled: new Set(),
  showFid: false,
  showPtm: false,
  ptmView: "ptm",  // "ptm" or "residual"
};

// ---------- formatting ----------

const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
/** 1.34 × 10⁻³ (digits after the point). */
function sci(v, digits = 2) {
  if (v === null || !isFinite(v)) return "–";
  if (v === 0) return "0";
  const [m, e] = v.toExponential(digits).split("e");
  const exp = parseInt(e, 10);
  if (exp === 0) return m;
  return `${m} × 10${String(exp).replace(/./g, (c) => SUP[c] || c)}`;
}
const signed = (v, d = 1) => (v >= 0 ? "+" : "−") + sci(Math.abs(v), d);
const int = (n) => n.toLocaleString("en-US");
/** Relative error of *est* against *truth*, e.g. "+12%" or "−3%". */
function pct(est, truth) {
  const p = (100 * (est - truth)) / truth;
  return `${p >= 0 ? "+" : "−"}${int(Math.round(Math.abs(p)))}%`;
}
const fixed = (v, d) => (v === null ? "∞" : v.toFixed(d));

function el(tag, attrs = {}, ...children) {
  const e = tag.startsWith("svg:") ? document.createElementNS(SVG, tag.slice(4)) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") e.textContent = v;
    else if (k === "html") e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) if (c != null) e.append(c);
  return e;
}
const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// ---------- data ----------

const setting = () => state.data.draws[state.draw].settings[state.mode + state.shots[state.mode]];
const visible = () => state.data.protocols.filter((p) => state.enabled.has(p));

async function load() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error(res.status);
    state.data = await res.json();
  } catch (err) {
    $("draw").textContent = "Could not load the data";
    return;
  }
  state.data.protocols.forEach((p) => state.enabled.add(p));
  buildControls();
  $("draw").disabled = false;
  $("draw").textContent = "Draw random noise";
}

// ---------- step 1: noise ----------

function drawNoise() {
  const n = state.data.draws.length;
  let i = Math.floor(Math.random() * n);
  if (n > 1 && i === state.draw) i = (i + 1) % n;
  state.draw = i;
  state.showFid = state.showPtm = false;
  $("draw").textContent = "Draw another";
  $("draw-id").textContent = `draw ${i + 1} of ${n}`;
  $("run-fid").disabled = $("run-ptm").disabled = false;
  renderNoise();
  render();
}

function renderNoise() {
  const d = state.data.draws[state.draw];
  const r = d.reported;
  const rows = [
    ["1q gate duration", `${r.t_gate_ns.toFixed(0)} ns`],
    ["T₁", `${fixed(r.T1_us, 1)} µs`],
    ["T₂", `${fixed(r.T2_us, 1)} µs`, `T_φ = ${fixed(r.Tphi_us, 1)} µs`],
    ["Readout P(1|0)", r.p1_given_0.toFixed(4)],
    ["Readout P(0|1)", r.p0_given_1.toFixed(4)],
    ["Assignment fidelity", r.assignment.toFixed(4), "1 − (P(1|0) + P(0|1))/2"],
    ["T₁/T₂-limited infidelity", sci(r.r_coherence)],
  ];
  $("reported").replaceChildren(
    ...rows.flatMap(([k, v, note]) => [el("dt", { text: k }), el("dd", { text: v }, note ? el("small", { text: note }) : null)])
  );

  const items = d.gate_noise.filter((g) => g.p !== 0).map((g) => {
    if (g.kind === "over_rotation") {
      const gate = { sx: "√X", sy: "√Y", h: "H" }[g.gate] || g.gate;
      const role = g.gate === "sx" ? "the gate under test" : "an auxiliary gate (used by QSQ and QPT), not √X itself";
      const sign = g.deg >= 0 ? "+" : "−";
      const frac = Math.abs(g.deg) / 180;  // the angle as a fraction of π
      return el("li", {}, `Over-rotation of ${gate} by ${sign}${(frac * Math.PI).toFixed(4)} rad (${sign}${frac.toFixed(4)}π rad)`,
        el("span", { class: "role", text: role }));
    }
    return el("li", {}, `Depolarising noise, p = ${sci(g.p)}`,
      el("span", { class: "role", text: `on every physical gate; adds ${sci(g.error)} to each gate's error` }));
  });
  if (!items.length) items.push(el("li", { text: "None: the gate-noise channel is off in this draw." }));
  $("hidden").replaceChildren(...items);

  const beyond = d.r_true > 0 ? (d.r_true - r.r_coherence) / d.r_true : 0;
  $("truth").replaceChildren(
    el("div", { class: "draw-id", text: "True √X infidelity" }),
    el("div", { class: "big", text: sci(d.r_true) }),
    el("dl", { class: "params", style: "margin-top:6px" },
      el("dt", { text: "Average gate fidelity" }), el("dd", { text: (1 - d.r_true).toFixed(6) }),
      el("dt", { text: "Eigenvalue infidelity" }), el("dd", { text: sci(d.r_true_eig) }, el("small", { text: "what QSQ is trained on" })),
      el("dt", { text: "Share beyond T₁/T₂" }), el("dd", { text: `${Math.round(100 * beyond)}%` })),
  );
  $("noise-cards").hidden = false;
}

// ---------- step 2: controls ----------

function buildControls() {
  $("protocols").replaceChildren(...state.data.protocols.map((p) => {
    const input = el("input", { type: "checkbox", value: p });
    input.checked = true;
    input.addEventListener("change", () => {
      input.checked ? state.enabled.add(p) : state.enabled.delete(p);
      render();
    });
    return el("label", { class: "chip" }, input, el("span", { text: name(p) }));
  }));
  const setAll = (on) => {
    document.querySelectorAll("#protocols input").forEach((i) => (i.checked = on));
    state.enabled = new Set(on ? state.data.protocols : []);
    render();
  };
  $("all").addEventListener("click", () => setAll(true));
  $("none").addEventListener("click", () => setAll(false));

  $("seqs").replaceChildren(...Object.entries(state.data.qsq_sequences).map(([k, seqs]) =>
    el("p", {}, el("strong", { text: `${name(k)} (${seqs.length}): ` }), el("code", { text: seqs.join(", ") }))));

  document.querySelectorAll("input[name=mode]").forEach((r) => r.addEventListener("change", () => {
    state.mode = r.value;
    document.querySelectorAll(".seg[data-mode]").forEach((s) => s.classList.toggle("off", s.dataset.mode !== state.mode));
    render();
  }));
  document.querySelectorAll(".seg[data-mode] button").forEach((b) => b.addEventListener("click", (ev) => {
    ev.preventDefault();
    const mode = b.closest(".seg").dataset.mode;
    state.shots[mode] = +b.dataset.shots;
    b.parentElement.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    state.mode = mode;
    document.querySelector(`input[name=mode][value=${mode}]`).checked = true;
    document.querySelectorAll(".seg[data-mode]").forEach((s) => s.classList.toggle("off", s.dataset.mode !== mode));
    render();
  }));

  $("run-fid").addEventListener("click", () => { state.showFid = true; render(); $("fidelity").scrollIntoView({ behavior: "smooth" }); });
  $("run-ptm").addEventListener("click", () => { state.showPtm = true; render(); $("ptm").scrollIntoView({ behavior: "smooth" }); });
  document.querySelectorAll("#ptm-view button").forEach((b) => b.addEventListener("click", () => {
    state.ptmView = b.dataset.view;
    document.querySelectorAll("#ptm-view button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    render();
  }));
  $("errorbars").addEventListener("change", render);
  $("logscale").addEventListener("change", render);
  window.addEventListener("resize", () => state.showFid && renderFidelity());
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
}

function render() {
  if (state.draw < 0) return;
  $("fidelity").hidden = !state.showFid;
  $("ptm").hidden = !state.showPtm;
  if (state.showFid) renderFidelity();
  if (state.showPtm) renderPtm();
}

// ---------- step 3: fidelity chart ----------

function niceTicks(lo, hi, count = 6) {
  const step0 = (hi - lo) / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0);
  const ticks = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + step * 1e-9; t += step) ticks.push(Math.abs(t) < step * 1e-9 ? 0 : t);
  return ticks;
}

function logTicks(lo, hi) {
  const ticks = [];
  const decades = Math.log10(hi / lo);
  const mults = decades < 2 ? [1, 2, 5] : [1];
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++)
    for (const m of mults) { const t = m * 10 ** e; if (t >= lo && t <= hi) ticks.push(t); }
  return ticks;
}

function renderFidelity() {
  const d = state.data.draws[state.draw];
  const s = setting();
  const keys = visible();
  const errs = $("errorbars").checked;
  const log = $("logscale").checked;
  const truth = d.r_true;
  const under = css("--under"), over = css("--over"), ink = css("--truth");

  $("fid-legend").replaceChildren(
    el("span", {}, el("i", { class: "line", style: `background:${ink}` }), `true infidelity ${sci(truth)}`),
    el("span", {}, el("i", { style: `background:${over}` }), "overestimates the error"),
    el("span", {}, el("i", { style: `background:${under}` }), "underestimates the error"),
  );
  renderTable(keys, s, truth);
  if (!keys.length) {
    $("fid-chart").replaceChildren(el("p", { class: "empty", text: "No protocol selected." }));
    return;
  }

  // Y range from what is drawn: the truth, every estimate and (if shown) its error bar.
  const floor = truth / 20;  // log scale: estimates at or below this are drawn at the bottom edge
  const vals = [truth];
  for (const k of keys) {
    const { r, sigma } = s[k];
    vals.push(log ? Math.max(r, floor) : r);
    if (errs && sigma != null) {
      vals.push(r + sigma);
      vals.push(log ? Math.max(r - sigma, floor) : r - sigma);
    }
  }
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (log) { lo = Math.max(lo, floor) / 1.4; hi *= 1.4; }
  else { const pad = (hi - lo || Math.abs(hi) || 1e-4) * 0.08; lo -= pad; hi += pad; }

  const container = $("fid-chart").parentElement;
  const band = 80;
  const m = { top: 14, right: 16, bottom: 58, left: 78 };
  const W = Math.max(container.clientWidth, m.left + m.right + band * keys.length);
  const H = 420;
  const iw = W - m.left - m.right, ih = H - m.top - m.bottom;
  const bw = iw / keys.length;
  const y = log
    ? (v) => m.top + ih * (1 - (Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo)))
    : (v) => m.top + ih * (1 - (v - lo) / (hi - lo));
  const clampY = (v) => (log ? y(Math.max(v, lo)) : y(v));

  const svg = el("svg:svg", { class: "chart", width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: "img",
    "aria-label": "Estimated infidelity of each protocol against the true infidelity" });

  const grid = el("svg:g", { class: "grid" }), axis = el("svg:g", { class: "axis" });
  for (const t of log ? logTicks(lo, hi) : niceTicks(lo, hi)) {
    grid.append(el("svg:line", { x1: m.left, x2: W - m.right, y1: y(t), y2: y(t) }));
    axis.append(el("svg:text", { x: m.left - 8, y: y(t) + 4, "text-anchor": "end", text: sci(t, log ? 0 : 1) }));
  }
  axis.append(el("svg:text", { x: 14, y: m.top + ih / 2, transform: `rotate(-90 14 ${m.top + ih / 2})`,
    "text-anchor": "middle", text: `√X infidelity${log ? " (log scale)" : ""}` }));
  svg.append(grid, axis);

  keys.forEach((k, i) => {
    const e = s[k];
    const cx = m.left + bw * (i + 0.5);
    const w = Math.min(36, bw * 0.42);
    const atFloor = log && e.r <= floor;
    const top = log ? Math.max(e.r, floor) : e.r;
    const color = e.r < truth ? under : over;
    const y0 = y(truth), y1 = y(top);
    const g = el("svg:g");
    g.append(el("svg:rect", { class: "hit", x: cx - bw / 2 + 2, y: m.top, width: bw - 4, height: ih, rx: 6 }));
    g.append(el("svg:rect", { x: cx - w / 2, y: Math.min(y0, y1), width: w, height: Math.max(Math.abs(y1 - y0), 1.5),
      rx: 3, fill: color, "pointer-events": "none" }));
    if (errs && e.sigma != null) {
      const a = clampY(e.r + e.sigma), b = clampY(log ? Math.max(e.r - e.sigma, floor) : e.r - e.sigma);
      const pe = { stroke: ink, "stroke-width": 1.3, "pointer-events": "none" };
      g.append(el("svg:line", { x1: cx, x2: cx, y1: a, y2: b, ...pe }));
      g.append(el("svg:line", { x1: cx - 5, x2: cx + 5, y1: a, y2: a, ...pe }));
      g.append(el("svg:line", { x1: cx - 5, x2: cx + 5, y1: b, y2: b, ...pe }));
    }
    g.append(el("svg:text", { class: "res", x: cx + w / 2 + 4, y: y1 + 4, "pointer-events": "none",
      text: (atFloor ? "≤ " : "") + signed(e.r - truth) }));
    const [, l1, l2] = NAMES[k] || [k, k, ""];
    const label = el("svg:text", { class: "xlab", x: cx, y: H - m.bottom + 18, "text-anchor": "middle" });
    label.append(el("svg:tspan", { x: cx, dy: 0, text: l1 }), el("svg:tspan", { x: cx, dy: 14, text: l2 }),
      el("svg:tspan", { class: "sub", x: cx, dy: 15, text: `${e.circuits} × ${int(e.shots)}` }));
    g.append(label);
    g.addEventListener("mousemove", (ev) => tip(ev, k, e, truth));
    g.addEventListener("mouseleave", hideTip);
    svg.append(g);
  });
  svg.append(el("svg:line", { x1: m.left, x2: W - m.right, y1: y(truth), y2: y(truth), stroke: ink, "stroke-width": 2 }));
  $("fid-chart").replaceChildren(svg);
}

function tip(ev, k, e, truth) {
  const t = $("tip");
  t.innerHTML = "";
  t.append(el("b", { text: name(k) }), el("br"),
    el("span", { class: "k", text: "estimate " }), `${sci(e.r)}${e.sigma != null ? " ± " + sci(e.sigma, 1) : ""}`, el("br"),
    el("span", { class: "k", text: "true " }), sci(truth), el("br"),
    el("span", { class: "k", text: "error " }), `${signed(e.r - truth, 2)} (${pct(e.r, truth)})`, el("br"),
    el("span", { class: "k", text: "shots " }), `${e.circuits} × ${int(e.shots)} = ${int(e.circuits * e.shots)}`);
  t.style.display = "block";
  const x = Math.min(ev.clientX + 14, innerWidth - t.offsetWidth - 8);
  t.style.left = `${x}px`;
  t.style.top = `${ev.clientY + 14}px`;
}
const hideTip = () => ($("tip").style.display = "none");

function renderTable(keys, s, truth) {
  const head = el("tr", {}, ...["Protocol", "Infidelity", "± σ", "Error", "Relative error", "Circuits × shots"].map((h) => el("th", { text: h })));
  const rows = keys.map((k) => {
    const e = s[k];
    return el("tr", {}, el("td", { text: name(k) }), el("td", { text: sci(e.r) }), el("td", { text: e.sigma == null ? "–" : sci(e.sigma, 1) }),
      el("td", { text: signed(e.r - truth) }), el("td", { text: pct(e.r, truth) }),
      el("td", { text: `${e.circuits} × ${int(e.shots)}` }));
  });
  rows.push(el("tr", {}, el("td", { text: "True" }), el("td", { text: sci(truth) }), el("td"), el("td"), el("td"), el("td")));
  $("fid-table").replaceChildren(el("thead", {}, head), el("tbody", {}, ...rows));
}

// ---------- step 4: PTMs ----------

function hexToRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
const PTM_NEG = "#184f95", PTM_POS = "#b3261e";
function cellColor(v, vmax) {
  const t = Math.max(-1, Math.min(1, v / (vmax || 1)));
  const mid = hexToRgb(css("--mid")), end = hexToRgb(t < 0 ? PTM_NEG : PTM_POS);
  const a = Math.abs(t);
  return `rgb(${mid.map((c, i) => Math.round(c + (end[i] - c) * a)).join(",")})`;
}

function matrix(M, vmax, fmt) {
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  const L = ["I", "X", "Y", "Z"];
  const g = el("div", { class: "mat" }, el("span"), ...L.map((l) => el("span", { class: "ax", text: l })));
  M.forEach((row, i) => {
    g.append(el("span", { class: "ax", text: L[i] }));
    row.forEach((v) => {
      const strong = Math.abs(v) > 0.6 * vmax;
      g.append(el("span", { class: "c", text: fmt(v), title: v.toPrecision(5),
        style: `background:${cellColor(v, vmax)};color:${strong || dark ? "#fff" : "#1b1b1b"}` }));
    });
  });
  return g;
}

function renderPtm() {
  const d = state.data.draws[state.draw];
  const s = setting();
  const keys = visible().filter((k) => s[k].ptm);
  const isQsq = (k) => k.startsWith("QSQ");
  const diffs = Object.fromEntries(keys.map((k) => {
    const ref = isQsq(k) ? d.ptm_true_folded || d.ptm_true : d.ptm_true;
    return [k, s[k].ptm.map((row, i) => row.map((v, j) => v - ref[i][j]))];
  }));
  const dmax = Math.max(1e-6, ...Object.values(diffs).flat(2).map(Math.abs));

  const f2 = (v) => (Math.abs(v) < 0.005 ? "0" : v.toFixed(2));
  const f3 = (v) => (Math.abs(v) < 0.0005 ? "0" : (v > 0 ? "+" : "") + v.toFixed(3));
  const residual = state.ptmView === "residual";
  const panel = (title, sub, M, vmax, fmt) => el("div", { class: "ptm" },
    el("h4", { text: title }), el("div", { class: "sub", text: sub }), matrix(M, vmax, fmt));
  const title = (k) => (isQsq(k) ? `${name(k)} (|a|)` : name(k));
  const shots = (k) => `${s[k].circuits} × ${int(s[k].shots)} shots`;

  // Same slots in both views, so every estimate stays put when the view switches:
  // the two references (empty outlines in the residual view, which has nothing to show for them), then each estimate.
  const ghost = (t) => el("div", { class: "ptm ghost" }, el("h4", { text: t }), el("div", { class: "sub", text: "reference" }),
    matrix([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 1, () => ""));
  const panels = residual
    ? [ghost("Ideal"), ghost("True"), ...keys.map((k) => panel(title(k), shots(k), diffs[k], dmax, f3))]
    : [panel("Ideal", "target", state.data.ptm_ideal, 1, f2), panel("True", "exact, from the channel", d.ptm_true, 1, f2),
       ...keys.map((k) => panel(title(k), shots(k), s[k].ptm, 1, f2))];
  $("ptm-grid").replaceChildren(...panels);
  if (!keys.length) $("ptm-grid").append(el("p", { class: "empty", text: "No protocol with a PTM selected." }));

  const grad = (vmax) => `background:linear-gradient(90deg, ${cellColor(-vmax, vmax)}, ${cellColor(0, vmax)}, ${cellColor(vmax, vmax)})`;
  $("ptm-scale").replaceChildren(residual
    ? el("span", {}, `estimate − true:  −${dmax.toFixed(3)}`, el("span", { class: "bar", style: grad(dmax) }), `+${dmax.toFixed(3)}`)
    : el("span", {}, "−1", el("span", { class: "bar", style: grad(1) }), "+1"));
}

$("draw").addEventListener("click", drawNoise);
load();
