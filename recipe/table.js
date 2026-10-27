// Recipe tables: a browser port of html_helper.py's generate_recipe_html, shared by the maker (index.html) and the book (book.html).
// Recipes are stored in the same shape as recipes.jsonl:
// { title, prep, ingredients: [text], steps: [{ step, ingredients: [1-based], instruction }], sections?: [{ label, ingredients }] }

const esc = text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[c])
  .replace(/\n/g, "<br>");

// For each column, find contiguous ingredient runs that share a value: (col:start) -> [value, rowspan].
function findRegions(cols, count, get) {
  const start = new Map(), covered = new Set();
  for (const c of cols) {
    let i = 1;
    while (i <= count) {
      const v = get(c, i);
      if (v === undefined) { i++; continue; }
      const s = i;
      while (i <= count && get(c, i) === v) i++;
      start.set(`${c}:${s}`, [v, i - s]);
      for (let j = s + 1; j < i; j++) covered.add(`${c}:${j}`);
    }
  }
  return { start, covered };
}

function recipeHTML(r) {
  const count = r.ingredients.length;
  const stepNumbers = [...new Set(r.steps.map(s => s.step))].sort((a, b) => a - b);

  // later entries win when two actions in one step claim the same ingredient, as in the Python version
  const grid = new Map();
  r.steps.forEach(s => s.ingredients.forEach(i => grid.set(`${s.step}:${i}`, s.instruction)));
  const steps = findRegions(stepNumbers, count, (sn, i) => grid.get(`${sn}:${i}`));

  const hasSections = (r.sections || []).length > 0;
  const sectionGrid = new Map();
  (r.sections || []).forEach(s => s.ingredients.forEach(i => sectionGrid.set(i, s.label)));
  const sections = findRegions([0], count, (_, i) => sectionGrid.get(i));

  const colspan = 1 + stepNumbers.length + (hasSections ? 1 : 0);
  const rows = [];

  if (r.prep) {
    rows.push(`<tr><td colspan="${colspan}" class="prep-step" style="text-align:center;">` +
      `<strong>Preparation:</strong> ${esc(r.prep)}</td></tr>`);
  }

  const header = stepNumbers.map(sn => `<th>Step ${sn}</th>`).join("");
  rows.push(`<tr>${hasSections ? "<th></th>" : ""}<th>Ingredient</th>${header}</tr>`);

  r.ingredients.forEach((text, k) => {
    const idx = k + 1;
    const cells = [];

    if (hasSections && !sections.covered.has(`0:${idx}`)) {
      const hit = sections.start.get(`0:${idx}`);
      if (hit) {
        const [label, span] = hit;
        cells.push(`<td${span > 1 ? ` rowspan="${span}"` : ""} class="section-label" ` +
          `style="text-align:center;vertical-align:middle;">` +
          `<div style="writing-mode:vertical-rl;transform:rotate(180deg);white-space:nowrap;` +
          `display:inline-block;">${esc(label)}</div></td>`);
      } else {
        cells.push("<td></td>");
      }
    }

    cells.push(`<td style="white-space:nowrap;">${esc(text)}</td>`);

    for (const sn of stepNumbers) {
      if (steps.covered.has(`${sn}:${idx}`)) continue;
      const hit = steps.start.get(`${sn}:${idx}`);
      if (hit) {
        const [instr, span] = hit;
        cells.push(`<td${span > 1 ? ` rowspan="${span}"` : ""}>${esc(instr)}</td>`);
      } else {
        cells.push("<td></td>");
      }
    }
    rows.push(`<tr>${cells.join("")}</tr>`);
  });

  const caption = r.title ? `<caption style="font-weight:bold;">${esc(r.title)}</caption>` : "";
  return `<table class="recipe-table">${caption}${rows.join("")}</table>`;
}

// share links carry the whole recipe as base64url JSON in the hash, so nothing is stored on a server
function encode(r) {
  const bytes = new TextEncoder().encode(JSON.stringify(r));
  let bin = "";
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decode(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
}
