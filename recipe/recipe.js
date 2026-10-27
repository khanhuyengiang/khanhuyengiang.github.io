// Recipe table maker: the editor page. The table itself is drawn by table.js, ingredient ordering lives in compile.js.
const $ = sel => document.querySelector(sel);

// ---------- editor state: ingredients carry ids so steps survive reordering ----------
let nextId = 1;
const ingredient = (text = "") => ({ id: nextId++, text });
const action = (ids = [], text = "") => ({ ids: new Set(ids), text });
const blank = () => ({ title: "", prep: "", ingredients: [ingredient()], steps: [{ actions: [action()] }], sections: [] });
let state = blank();

function fromRecipe(r) {
  const ingredients = (r.ingredients || []).map(t => ingredient(String(t)));
  // index 0 (used in some saved recipes for the prep row) has no ingredient, so it drops out here
  const ids = list => (list || []).map(i => ingredients[i - 1]?.id).filter(Boolean);
  const byStep = new Map();
  for (const s of r.steps || []) {
    const n = Number(s.step) || 1;
    if (!byStep.has(n)) byStep.set(n, []);
    byStep.get(n).push(action(ids(s.ingredients), String(s.instruction ?? "")));
  }
  const steps = [...byStep.keys()].sort((a, b) => a - b).map(n => ({ actions: byStep.get(n) }));
  return {
    title: String(r.title || ""),
    prep: String(r.prep || ""),
    ingredients: ingredients.length ? ingredients : [ingredient()],
    steps: steps.length ? steps : [{ actions: [action()] }],
    sections: (r.sections || []).map(s => ({ label: String(s.label || ""), ids: new Set(ids(s.ingredients)) })),
  };
}

function toRecipe(st) {
  const index = new Map(st.ingredients.map((g, i) => [g.id, i + 1]));
  const nums = set => [...set].map(id => index.get(id)).filter(Boolean).sort((a, b) => a - b);
  const r = { title: st.title, ingredients: st.ingredients.map(g => g.text), steps: [], prep: st.prep };
  st.steps.forEach((step, i) => step.actions.forEach(a =>
    r.steps.push({ step: i + 1, ingredients: nums(a.ids), instruction: a.text })));
  if (st.sections.length) r.sections = st.sections.map(s => ({ label: s.label, ingredients: nums(s.ids) }));
  return r;
}

// ---------- editor UI ----------
const firstLine = text => text.split("\n")[0].trim();
const chipText = (g, i) => `${i + 1} ${firstLine(g.text) || "…"}`;

function grow(area) { area.style.height = "auto"; area.style.height = area.scrollHeight + "px"; }
// heights depend on line wrapping, which changes once the pixel font loads and when the window resizes
const growAll = () => document.querySelectorAll("#ing-list textarea, #step-list textarea").forEach(grow);
document.fonts?.ready.then(growAll);
addEventListener("resize", growAll);

function textBox(value, placeholder, onInput, rows = 1) {
  const area = Object.assign(document.createElement("textarea"), { value, placeholder, rows });
  area.addEventListener("input", () => { onInput(area.value); grow(area); changed(); });
  requestAnimationFrame(() => grow(area));
  return area;
}

function button(text, title, onClick, cls = "btn small") {
  const b = Object.assign(document.createElement("button"), { type: "button", className: cls, textContent: text });
  if (title) { b.title = title; b.setAttribute("aria-label", title); }
  b.addEventListener("click", onClick);
  return b;
}

function move(list, i, by) {
  const j = i + by;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  rebuild();
}

function remove(list, i, keepOne) {
  list.splice(i, 1);
  if (!list.length && keepOne) list.push(keepOne());
  rebuild();
}

// A row of toggle chips, one per ingredient; shift-click selects a range.
function picker(set) {
  const wrap = document.createElement("div");
  wrap.className = "picker";
  let last = null;
  state.ingredients.forEach((g, i) => {
    const chip = button(chipText(g, i), null, e => {
      const on = !set.has(g.id);
      const range = e.shiftKey && last !== null ? [Math.min(last, i), Math.max(last, i)] : [i, i];
      for (let k = range[0]; k <= range[1]; k++) {
        const id = state.ingredients[k].id;
        on ? set.add(id) : set.delete(id);
      }
      last = i;
      paintPicker(wrap, set);
      changed();
    }, "pick");
    chip.dataset.id = g.id;
    wrap.append(chip);
  });
  const all = button("all", "Select every ingredient", () => {
    state.ingredients.forEach(g => set.add(g.id)); paintPicker(wrap, set); changed();
  }, "pick meta");
  const none = button("none", "Clear the selection", () => { set.clear(); paintPicker(wrap, set); changed(); }, "pick meta");
  wrap.append(all, none);
  paintPicker(wrap, set);
  return wrap;
}

function paintPicker(wrap, set) {
  wrap.querySelectorAll(".pick[data-id]").forEach(c => c.setAttribute("aria-pressed", set.has(Number(c.dataset.id))));
}

// Grab handle for an ingredient row. Pointer events cover mouse and touch; the other rows slide aside to
// show where it will land. Arrow keys move it one place for keyboard users.
function dragHandle(li, i) {
  const handle = button("⠿", "Drag to move, or press ↑ ↓", () => {}, "btn small handle");

  handle.addEventListener("keydown", e => {
    const by = { ArrowUp: -1, ArrowDown: 1 }[e.key];
    if (!by || !state.ingredients[i + by]) return;
    e.preventDefault();
    move(state.ingredients, i, by);
    $(`#ing-list li:nth-child(${i + by + 1}) .handle`).focus();
  });

  handle.addEventListener("pointerdown", e => {
    if (e.button !== 0) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    const rows = [...$("#ing-list").children];
    // row positions in page coordinates, measured once so scrolling and the sliding rows don't move the targets
    const tops = rows.map(r => r.getBoundingClientRect().top + scrollY);
    const heights = rows.map(r => r.offsetHeight);
    const shift = heights[i] + (rows[1] ? tops[1] - tops[0] - heights[0] : 0);
    const startY = e.clientY + scrollY;
    let pointerY = e.clientY, to = i, scrolling = 0;
    li.classList.add("dragging");

    const update = () => {
      const dy = pointerY + scrollY - startY;
      li.style.transform = `translateY(${dy}px)`;
      const center = tops[i] + heights[i] / 2 + dy;
      to = rows.reduce((n, _, k) => (k !== i && tops[k] + heights[k] / 2 < center ? n + 1 : n), 0);
      rows.forEach((r, k) => {
        if (k === i) return;
        const s = k > i && k <= to ? -shift : k < i && k >= to ? shift : 0;
        r.style.transform = s ? `translateY(${s}px)` : "";
      });
    };
    // scroll while held near the top or bottom edge, so long lists can be crossed
    const edgeScroll = () => {
      const edge = 60, speed = pointerY < edge ? -(edge - pointerY) : pointerY > innerHeight - edge ? pointerY - (innerHeight - edge) : 0;
      if (speed) { scrollBy(0, speed / 3); update(); }
      scrolling = requestAnimationFrame(edgeScroll);
    };
    scrolling = requestAnimationFrame(edgeScroll);

    const onMove = ev => { pointerY = ev.clientY; update(); };
    const onUp = () => {
      cancelAnimationFrame(scrolling);
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
      rows.forEach(r => { r.style.transform = ""; });
      li.classList.remove("dragging");
      if (to === i) return;
      state.ingredients.splice(to, 0, ...state.ingredients.splice(i, 1));
      rebuild();
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  });
  return handle;
}

function renderIngredients() {
  const list = $("#ing-list");
  list.replaceChildren();
  state.ingredients.forEach((g, i) => {
    const li = document.createElement("li");
    const box = textBox(g.text, "e.g. 2 cloves of garlic\n(minced)", v => {
      g.text = v;
      document.querySelectorAll(`.pick[data-id="${g.id}"]`).forEach(c => { c.textContent = chipText(g, i); });
    });
    box.setAttribute("aria-label", `Ingredient ${i + 1}`);
    li.append(
      dragHandle(li, i),
      Object.assign(document.createElement("span"), { className: "num", textContent: i + 1 }),
      box,
      button("✕", "Remove ingredient", () => remove(state.ingredients, i, ingredient)),
    );
    list.append(li);
  });
}

function renderSteps() {
  const list = $("#step-list");
  list.replaceChildren();
  state.steps.forEach((step, i) => {
    const card = document.createElement("div");
    card.className = "panel step";
    const head = document.createElement("div");
    head.className = "step-head";
    head.append(
      Object.assign(document.createElement("h3"), { textContent: `Step ${i + 1}` }),
      Object.assign(document.createElement("div"), { className: "tools" }),
    );
    head.lastChild.append(
      button("↑", "Move step earlier", () => move(state.steps, i, -1)),
      button("↓", "Move step later", () => move(state.steps, i, 1)),
      button("✕", "Remove step", () => remove(state.steps, i, () => ({ actions: [action()] }))),
    );
    card.append(head);

    step.actions.forEach((a, k) => {
      const box = document.createElement("div");
      box.className = "action";
      const area = textBox(a.text, "What to do, e.g. Sauté for 5 minutes", v => { a.text = v; }, 2);
      area.setAttribute("aria-label", `Step ${i + 1} instruction`);
      box.append(area, picker(a.ids));
      if (step.actions.length > 1) {
        box.append(button("Remove this action", null, () => { step.actions.splice(k, 1); rebuild(); }, "btn small ghost"));
      }
      card.append(box);
    });

    card.append(button("+ Another action at the same time", null, () => { step.actions.push(action()); rebuild(); }));
    list.append(card);
  });
}

function renderSections() {
  const list = $("#sec-list");
  list.replaceChildren();
  state.sections.forEach((s, i) => {
    const box = document.createElement("div");
    box.className = "action";
    const input = Object.assign(document.createElement("input"), { type: "text", value: s.label, placeholder: "Group name" });
    input.setAttribute("aria-label", "Group name");
    input.addEventListener("input", () => { s.label = input.value; changed(); });
    const head = document.createElement("div");
    head.className = "step-head";
    head.append(input, button("✕", "Remove group", () => remove(state.sections, i)));
    box.append(head, picker(s.ids));
    list.append(box);
  });
}

function rebuild() {
  renderIngredients();
  renderSteps();
  renderSections();
  $("#title").value = state.title;
  $("#prep").value = state.prep;
  changed();
}

// ---------- output ----------
let saveTimer;
function changed() {
  const r = toRecipe(state);
  const empty = !r.ingredients.some(t => t.trim()) && !r.steps.some(s => s.instruction.trim());
  $("#preview").innerHTML = empty
    ? '<p class="muted small empty">Add some ingredients and steps and the table shows up here.</p>'
    : recipeHTML(r);
  $("#warnings").replaceChildren(...warnings().map(text =>
    Object.assign(document.createElement("p"), { className: "note-warn", textContent: text })));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { try { localStorage.setItem("recipe-draft", JSON.stringify(r)); } catch {} }, 300);
}

function warnings() {
  const out = [];
  const pos = new Map(state.ingredients.map((g, i) => [g.id, i]));
  // number of separate runs the picked ingredients fall into in the current order
  const pieces = ids => {
    const p = [...ids].map(id => pos.get(id)).filter(i => i !== undefined).sort((a, b) => a - b);
    return p.filter((x, k) => k === 0 || x !== p[k - 1] + 1).length;
  };
  const quote = text => (firstLine(text).length > 30 ? firstLine(text).slice(0, 30) + "…" : firstLine(text));

  state.steps.forEach((step, i) => {
    const seen = new Set();
    step.actions.forEach(a => a.ids.forEach(id => {
      if (seen.has(id)) {
        out.push(`Step ${i + 1}: ingredient ${pos.get(id) + 1} is picked by two actions, so only the last one shows.`);
      }
      seen.add(id);
    }));
    step.actions.forEach(a => {
      const n = pieces(a.ids);
      if (n > 1) out.push(`Step ${i + 1}${a.text.trim() ? ` (“${quote(a.text)}”)` : ""} is split into ${n} pieces. Try Compile.`);
    });
  });
  state.sections.forEach(s => {
    const n = pieces(s.ids);
    if (n > 1) out.push(`Group${s.label.trim() ? ` “${s.label.trim()}”` : ""} is split into ${n} pieces. Try Compile.`);
  });
  return out;
}

// ---------- compile: reorder ingredients so steps and groups stay in one piece (compile.js) ----------
let undoOrder = null;
const compileNote = text => { $("#compile-note").textContent = text; };
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

function compile() {
  const index = new Map(state.ingredients.map((g, i) => [g.id, i]));
  const idx = ids => [...ids].map(id => index.get(id)).filter(i => i !== undefined);
  const actions = state.steps.flatMap(s => s.actions.map(a => idx(a.ids)));
  const sections = state.sections.map(s => idx(s.ids));
  const firstUse = state.ingredients.map(() => state.steps.length);
  state.steps.forEach((s, k) => s.actions.forEach(a => idx(a.ids).forEach(i => { firstUse[i] = Math.min(firstUse[i], k); })));

  const { order, before, after } = bestOrder(state.ingredients.length, actions, sections, firstUse);
  const was = before.sectionSplits + before.stepSplits, now = after.sectionSplits + after.stepSplits;

  if (order.every((o, i) => o === i)) {
    compileNote(now ? `This is the best order I can find; ${plural(now, "split")} can't be avoided.` : "Already in the best order.");
    return;
  }
  undoOrder = state.ingredients.map(g => g.id);
  state.ingredients = order.map(i => state.ingredients[i]);
  rebuild();
  $("#undo-compile").hidden = false;
  compileNote(
    now === 0 && was > 0 ? `Done: fixed ${plural(was, "split")}, every step is in one piece.`
    : now === 0 ? "Done: nothing was split, ingredients now follow the order of the steps."
    : now < was ? `Done: ${plural(was, "split")} down to ${now}. The rest can't all be joined at once.`
    : `Done: ingredients now follow the order of the steps. ${plural(now, "split")} can't be avoided.`);
}

function undoCompile() {
  // ingredients added since the compile have no old place, so they stay at the end in their current order
  const rank = new Map(undoOrder.map((id, i) => [id, i]));
  state.ingredients.sort((a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9));
  resetCompile("Back to your order.");
  rebuild();
}

function resetCompile(text = "") {
  undoOrder = null;
  $("#undo-compile").hidden = true;
  compileNote(text || "reorders the ingredients so each step and group stays in one piece");
}

function flash(text) {
  $("#status").textContent = text;
  clearTimeout(flash.t);
  flash.t = setTimeout(() => { $("#status").textContent = ""; }, 2500);
}

async function copy(text, done) {
  try { await navigator.clipboard.writeText(text); flash(done); }
  catch { prompt("Copy this:", text); }
}

// accepts one recipe object, a list of them, or JSONL (first recipe wins)
function parseRecipe(text) {
  let data;
  try { data = JSON.parse(text); }
  catch { data = JSON.parse(text.split("\n").find(l => l.trim())); }
  if (Array.isArray(data)) data = data[0];
  if (!data || !Array.isArray(data.ingredients)) throw new Error("no ingredients list");
  return data;
}

function load(r) { state = fromRecipe(r); resetCompile(); rebuild(); }

const hasWork = () => state.ingredients.some(g => g.text.trim()) || state.steps.some(s => s.actions.some(a => a.text.trim()));

// ---------- wiring ----------
$("#title").addEventListener("input", e => { state.title = e.target.value; changed(); });
$("#prep").addEventListener("input", e => { state.prep = e.target.value; changed(); });

$("#add-ing").addEventListener("click", () => {
  state.ingredients.push(ingredient());
  rebuild();
  $("#ing-list li:last-child textarea").focus();
});
$("#add-step").addEventListener("click", () => {
  state.steps.push({ actions: [action()] });
  rebuild();
  $("#step-list .step:last-child textarea").focus();
});
$("#add-sec").addEventListener("click", () => { state.sections.push({ label: "", ids: new Set() }); rebuild(); });

$("#paste-toggle").addEventListener("click", e => {
  const box = $("#paste");
  box.hidden = !box.hidden;
  e.target.setAttribute("aria-expanded", !box.hidden);
  if (!box.hidden) $("#paste-text").focus();
});
$("#paste-add").addEventListener("click", () => {
  const lines = $("#paste-text").value.split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) return;
  // replace the starting empty box instead of leaving it above the pasted list
  state.ingredients = state.ingredients.filter(g => g.text.trim());
  state.ingredients.push(...lines.map(l => ingredient(l)));
  $("#paste-text").value = "";
  $("#paste").hidden = true;
  rebuild();
});

// compile.js is only fetched when it's needed: warmed up when the pointer reaches the button, run on click
let compiler = null;
const loadCompiler = () => compiler || (compiler = new Promise((resolve, reject) => {
  document.head.append(Object.assign(document.createElement("script"), {
    src: "compile.js", onload: resolve, onerror: () => { compiler = null; reject(); },
  }));
}));
$("#compile").addEventListener("pointerenter", () => loadCompiler().catch(() => {}), { once: true });
$("#compile").addEventListener("click", () => loadCompiler().then(compile,
  () => compileNote("Couldn't load the compiler. Check your connection and try again.")));
$("#undo-compile").addEventListener("click", undoCompile);
$("#copy-html").addEventListener("click", () => copy(recipeHTML(toRecipe(state)), "HTML copied"));
$("#copy-link").addEventListener("click", () => {
  const url = location.href.split("#")[0] + "#r=" + encode(toRecipe(state));
  copy(url, "Link copied");
});
$("#download").addEventListener("click", () => {
  const r = toRecipe(state);
  const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(blob),
    download: (r.title.trim() || "recipe").replace(/[^\w\- ]+/g, "").replace(/\s+/g, "-").toLowerCase() + ".json",
  });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$("#print").addEventListener("click", () => print());

$("#import").addEventListener("click", () => $("#import-file").click());
$("#import-file").addEventListener("change", async e => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  try { load(parseRecipe(await file.text())); flash("Imported"); }
  catch { flash("That file doesn't look like a recipe"); }
});

$("#clear").addEventListener("click", () => {
  if (hasWork() && !confirm("Clear this recipe and start over?")) return;
  state = blank();
  history.replaceState(null, "", location.pathname);
  resetCompile();
  rebuild();
});


// start from a share link, else the saved draft, else a blank recipe
(() => {
  if (location.hash.startsWith("#r=")) {
    try { return load(decode(location.hash.slice(3))); } catch { flash("That share link is broken"); }
  }
  try {
    const saved = localStorage.getItem("recipe-draft");
    if (saved) return load(JSON.parse(saved));
  } catch {}
  rebuild();
})();
