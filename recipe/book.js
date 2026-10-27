// Recipe book: lists every recipe in recipes.jsonl as a chip and draws the chosen one as a table (table.js).
// Only one table is drawn at a time, so the book stays quick with hundreds of recipes.
// The chosen recipe lives in the URL hash (#lemon-bars), so links and the back button work.
const DEFAULT_RECIPE = "lemon-bars";
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "recipe";
const chipColours = ["rose", "yellow", "blue", "mint", "violet"];
let recipes = [];

function recipeCard(r) {
  const steps = new Set(r.steps.map(s => s.step)).size;
  const card = document.createElement("section");
  card.className = "panel book-recipe";
  // the title sits in the card heading, so the table is drawn without its caption
  card.innerHTML = `
    <div class="book-head">
      <h3>${esc(r.title)}</h3>
      <div class="chips">
        <span class="chip rose">${r.ingredients.length} ingredients</span>
        <span class="chip violet">${steps} steps</span>
      </div>
    </div>
    <div class="preview">${recipeHTML({ ...r, title: "" })}</div>
    <div class="row-btns"><a class="btn small" href="./#r=${encode(r)}">Open in the maker</a></div>`;
  return card;
}

function show() {
  const wanted = decodeURIComponent(location.hash.slice(1));
  const r = recipes.find(x => x.slug === wanted) || recipes.find(x => x.slug === DEFAULT_RECIPE) || recipes[0];
  document.getElementById("book").replaceChildren(recipeCard(r));
  const toc = document.getElementById("toc");
  toc.querySelectorAll("a").forEach(a => {
    if (a.dataset.slug !== r.slug) return a.removeAttribute("aria-current");
    a.setAttribute("aria-current", "true");
    // keep the chosen chip visible inside the scrolling chip box, without scrolling the page
    if (a.offsetTop < toc.scrollTop || a.offsetTop + a.offsetHeight > toc.scrollTop + toc.clientHeight) {
      toc.scrollTop = a.offsetTop - toc.clientHeight / 2;
    }
  });
  document.title = `${r.title} · Kay's Recipe Book`;
}

function filter() {
  const words = document.getElementById("find").value.toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  document.querySelectorAll("#toc a").forEach(a => {
    a.hidden = !words.every(w => a.textContent.toLowerCase().includes(w));
    if (!a.hidden) shown++;
  });
  document.getElementById("find-none").hidden = shown > 0;
}

fetch("recipes.jsonl")
  .then(res => (res.ok ? res.text() : Promise.reject(res.status)))
  .then(text => {
    recipes = text.split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(r => r && Array.isArray(r.ingredients) && Array.isArray(r.steps));
    if (!recipes.length) throw new Error("empty");
    // two recipes with the same title get -2, -3… so every chip has its own link
    const seen = new Map();
    recipes.forEach(r => {
      const base = slug(String(r.title || ""));
      seen.set(base, (seen.get(base) || 0) + 1);
      r.slug = seen.get(base) > 1 ? `${base}-${seen.get(base)}` : base;
    });
    recipes.sort((a, b) => String(a.title).localeCompare(String(b.title), undefined, { numeric: true, sensitivity: "base" }));
    document.getElementById("toc").replaceChildren(...recipes.map((r, i) => Object.assign(document.createElement("a"), {
      className: `chip ${chipColours[i % chipColours.length]}`, href: "#" + r.slug, textContent: r.title,
    })));
    document.querySelectorAll("#toc a").forEach((a, i) => { a.dataset.slug = recipes[i].slug; });
    show();
    addEventListener("hashchange", show);
    const find = document.getElementById("find");
    find.addEventListener("input", filter);
    // Enter opens the first recipe that matches
    find.addEventListener("keydown", e => {
      const first = [...document.querySelectorAll("#toc a")].find(a => !a.hidden);
      if (e.key === "Enter" && first) location.hash = first.dataset.slug;
    });
  })
  .catch(() => {
    document.getElementById("book").innerHTML = '<p class="note-warn">The recipes didn’t load. Try refreshing the page.</p>';
  });
