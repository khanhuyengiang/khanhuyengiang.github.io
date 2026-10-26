// Pixel sprites: each row is a string, each character a colour class from play.css (. = transparent).
const SPRITES = {
cat: [
    ".......o.........o.......",
    "......ofo.......ofo......",
    "......opfo.....ofpo......",
    ".....ooppfooooofppoo.....",
    ".....offfffffffffffo.....",
    "....offfffffffffffffo....",
    "....offfffffffffffffo....",
    "...offfffffffffffffffo...",
    "..ooofffnofffffobfffooo..",
    "...offffnofffffobffffo...",
    "..oooffppfffpfffppffooo..",
    "...offfffffofofffffffo...",
    "....offfffffffffffffo....",
    ".....oofffffffffffoo.....",
    ".......ooooooooooo.......",
  ],
  miniCat: [
    "oo.......oo.",
    "ofo.....ofo.",
    "offoooooffo.",
    "offfffffffo.",
    "ofnfffffbfo.",
    "ofnffpffbfo.",
    "opffofoffpo.",
    "offfffffffo.",
    ".ooooooooo..",
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
    style="width: calc(${w * scale} * var(--px)); height: calc(${h * scale} * var(--px))">${rects}</svg>`;
}
document.querySelectorAll("[data-sprite]").forEach(drawSprite);

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
