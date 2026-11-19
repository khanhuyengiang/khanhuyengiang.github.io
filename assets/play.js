// Pixel sprites: each row is a string, each character a colour class from play.css (. = transparent). They are drawn on
// the --u grid (two art pixels), so these little icons keep their size on the fine --px grid.
const SPRITES = {
  // The two cats are Itty Bitty Kitty's own (habit-kitty/src/shared/pixelcat.ts): a white cat's happy face, and the happy
  // mini kitty from the Journal's moods (also the playground's icon). Capital letters are fixed cat colours.
  cat: [
    ".......K.........K.......",
    "......KWK.......KWK......",
    "......KRWK.....KWRK......",
    ".....KKRRWKKKKKWRRKK.....",
    ".....KWWWWWWWWWWWWWK.....",
    "....KWWWWWWWWWWWWWWWK....",
    "....KWWWWWWWWWWWWWWWK....",
    "...KWWWWWWWWWWWWWWWWWK...",
    "..KKKWWWWEWWWWWEWWWWKKK..",
    "...KWWWWEWEWWWEWEWWWWK...",
    "..KKKWWRRWWWCWWWRRWWKKK..",
    "...KWWWWWWKKWKKWWWWWWK...",
    "....KWWWWWWWWWWWWWWWK....",
    ".....KKWWWWWWWWWWWKK.....",
    ".......KKKKKKKKKKK.......",
  ],
  miniCat: [
    "KK.......KK",
    "KRK.....KRK",
    "KRRKKKKKRRK",
    "KRRRRRRRRRK",
    "KRRRRRRRRRK",
    "KRERRRRRERK",
    "KERERCREREK",
    "KRRRKKKRRRK",
    "KRRRRRRRRRK",
    ".KKKKKKKKK.",
  ],
  heart: [
    ".oo.oo.",
    "oppoppo",
    "opppppo",
    ".opppo.",
    "..opo..",
    "...o...",
  ],
  star: [
    "...o...",
    "..oyo..",
    "ooyyyoo",
    "oyyyyyo",
    ".oyyyo.",
    ".oyoyo.",
    ".o...o.",
  ],
  book: [
    "ooooooo",
    "ovvvvvo",
    "ovsssvo",
    "ovvvvvo",
    "ovvvvvo",
    "ovvvvvo",
    "ooooooo",
  ],
  note: [
    "...ooo.",
    "...obo.",
    "...o...",
    "...o...",
    ".ooo...",
    "obbo...",
    ".oo....",
  ],
  sprout: [
    ".mm.mm.",
    "omm.mmo",
    ".oo.oo.",
    "...o...",
    "..ppp..",
    "..ppp..",
    "..ooo..",
  ],
  qubit: [
    "..ooo..",
    ".obbbo.",
    "obbobbo",
    "obooobo",
    "obbobbo",
    ".obbbo.",
    "..ooo..",
  ],
  home: [
    "...o...",
    "..opo..",
    ".opppo.",
    "opppppo",
    ".offfo.",
    ".ofofo.",
    ".ooooo.",
  ],
};

function drawSprite(el) {
  const map = SPRITES[el.dataset.sprite];
  if (!map) return;
  const scale = Number(el.dataset.scale || 1);
  const w = map[0].length, h = map.length;
  let rects = "";
  map.forEach((row, y) => [...row].forEach((c, x) => {
    if (c !== ".") rects += `<rect class="${c}" x="${x}" y="${y}" width="1" height="1"/>`;
  }));
  el.outerHTML = `<svg class="sprite ${el.className}" viewBox="0 0 ${w} ${h}" aria-hidden="true"
    style="width: calc(${w * scale} * var(--u)); height: calc(${h * scale} * var(--u))">${rects}</svg>`;
}
document.querySelectorAll("[data-sprite]").forEach(drawSprite);

// The page background, after Itty Bitty Kitty's fancy backdrop (habit-kitty/src/shared/backdrop.ts): a pixel gradient through
// --bg, --bg2 and --bg3, one canvas pixel per --px, blended by ordered (Bayer) dithering so it stays pixel art, with a dotted
// texture and sparkles, twinkles, hearts, flowers and clouds scattered over it. Redrawn when the theme or window size changes.
const BAYER = (() => {
  let m = [[0]];
  while (m.length < 8) {
    const n = m.length, next = Array.from({ length: n * 2 }, () => Array(n * 2).fill(0));
    m.forEach((row, y) => row.forEach((v, x) => { next[y][x] = 4 * v; next[y][x + n] = 4 * v + 2; next[y + n][x] = 4 * v + 3; next[y + n][x + n] = 4 * v + 1; }));
    m = next;
  }
  return m;
})();
const BAND_EDGE = [0.28, 0.61], BAND_BLEND = 0.11;
const DECOS = [
  ["...a...", "...a...", "..awa..", "aawwwaa", "..awa..", "...a...", "...a..."],
  [".a.", "awa", ".a."],
  [".aa.aa.", "awaaaaa", "aaaaaaa", ".aaaaa.", "..aaa..", "...a..."],
  ["..a..", ".aaa.", "aawaa", ".aaa.", "..a.."],
  ["....oooo....", "..oowwwwo...", ".owwwwwwwoo.", "owwwwwwwwwwo", "owwwwwwwwwwo", ".oooooooooo."],
];
const rgbOf = v => { const h = /^#([0-9a-f]{6})$/i.exec(v.trim())?.[1]; return h ? [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)) : null; };
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const seeded = seed => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
let backdropSize = "";
const backdropCells = () => {
  const px = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--px")) || 2;
  return [px, Math.ceil(document.documentElement.clientWidth / px), Math.ceil(innerHeight / px)];
};
function paintBackdrop() {
  const root = document.documentElement, cs = getComputedStyle(root);
  const stops = ["--bg", "--bg2", "--bg3"].map(k => rgbOf(cs.getPropertyValue(k)));
  if (stops.some(c => !c)) return;   // an unexpected colour format: keep the plain CSS background
  const [px, cols, rows] = backdropCells();
  const canvas = document.createElement("canvas");
  canvas.width = cols; canvas.height = rows;
  const g = canvas.getContext("2d");
  if (!g) return;
  const img = g.createImageData(cols, rows);
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < cols && y < rows) img.data.set([c[0], c[1], c[2], 255], (y * cols + x) * 4); };
  const at = (x, y) => { const i = (y * cols + x) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };
  for (let y = 0; y < rows; y++) {
    const t = rows > 1 ? y / (rows - 1) : 0;
    const lo = t >= BAND_EDGE[1] ? 1 : 0, u = (t - BAND_EDGE[lo]) / BAND_BLEND;
    for (let x = 0; x < cols; x++) set(x, y, stops[u > (BAYER[y % 8][x % 8] + 0.5) / 64 ? lo + 1 : lo]);
  }
  const css = (k, fallback) => rgbOf(cs.getPropertyValue(k)) ?? fallback;
  const edge = css("--edge", [143, 120, 208]), light = css("--surface", [255, 250, 253]);
  const inks = ["--dot1", "--dot2", "--dot3", "--today"].map(k => css(k, [255, 143, 184]));
  for (let y = 3; y < rows; y += 6) for (let x = (y / 6) % 2 ? 0 : 3; x < cols; x += 6) set(x, y, mix(at(x, y), edge, 0.18));
  const r = seeded(7), CELL = 44;
  for (let cy = 0; cy * CELL < rows; cy++) for (let cx = 0; cx * CELL < cols; cx++) {
    if (r() > 0.6) continue;
    const art = DECOS[Math.floor(r() * DECOS.length)], ink = inks[Math.floor(r() * inks.length)];
    const x0 = cx * CELL + Math.floor(r() * (CELL - art[0].length)), y0 = cy * CELL + Math.floor(r() * (CELL - art.length));
    const pal = { a: ink, w: mix(light, [255, 255, 255], 0.5), o: mix(edge, stops[0], 0.35) };
    art.forEach((row, y) => [...row].forEach((ch, x) => { if (pal[ch]) set(x0 + x, y0 + y, pal[ch]); }));
  }
  g.putImageData(img, 0, 0);
  root.style.setProperty("--backdrop", `url("${canvas.toDataURL()}")`);
  root.style.setProperty("--backdrop-size", `${cols * px}px ${rows * px}px`);
  root.dataset.backdrop = "";
  backdropSize = `${cols}x${rows}`;
}
paintBackdrop();
let backdropTimer = 0;
const repaintIfResized = () => { const [, c, r] = backdropCells(); if (backdropSize !== `${c}x${r}`) paintBackdrop(); };
addEventListener("resize", () => { clearTimeout(backdropTimer); backdropTimer = setTimeout(repaintIfResized, 150); });
addEventListener("load", repaintIfResized);   // the viewport can settle after the first paint
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => paintBackdrop());

// Theme toggle: remembers the choice per browser when storage is available.
const root = document.documentElement;
const toggle = document.getElementById("theme");
const isDark = () => root.dataset.theme === "dark" ||
  (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
const label = () => { toggle.textContent = isDark() ? "Light" : "Dark"; };
label();
toggle.addEventListener("click", () => {
  root.dataset.theme = isDark() ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  label();
  paintBackdrop();
});

// Highlight the bottom-nav item for the section in view.
const navLinks = [...document.querySelectorAll(".nav a[href^='#']")];
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle("active", a.hash === "#" + e.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
navLinks.forEach(a => { const s = document.querySelector(a.hash); if (s) observer.observe(s); });
