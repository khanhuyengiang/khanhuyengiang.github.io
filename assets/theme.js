// Light/dark switch for the academic pages. No saved choice = follow the device setting.
(function () {
  var root = document.documentElement, KEY = "theme";
  var mq = matchMedia("(prefers-color-scheme: dark)");
  try { var t = localStorage.getItem(KEY); if (t === "light" || t === "dark") root.dataset.theme = t; } catch (e) {}

  function isDark() { return root.dataset.theme ? root.dataset.theme === "dark" : mq.matches; }
  window.isDarkTheme = isDark;
  function sync(notify) {
    root.dataset.resolved = isDark() ? "dark" : "light";
    var b = document.querySelector(".theme-toggle");
    if (b) {
      b.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
      b.title = b.getAttribute("aria-label");
    }
    if (notify) document.dispatchEvent(new Event("themechange"));
  }
  sync();
  mq.addEventListener("change", function () { sync(true); });

  document.addEventListener("DOMContentLoaded", function () {
    var b = document.createElement("button");
    b.type = "button"; b.className = "theme-toggle";
    b.innerHTML =
      '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
      '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    b.addEventListener("click", function () {
      root.dataset.theme = isDark() ? "light" : "dark";
      try { localStorage.setItem(KEY, root.dataset.theme); } catch (e) {}
      sync(true);
    });
    var nav = document.querySelector(".topnav");
    if (nav) nav.appendChild(b); else { b.classList.add("floating"); document.body.appendChild(b); }
    sync();
  });
})();
