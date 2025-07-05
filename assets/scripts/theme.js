const toggleBtn = document.getElementById("toggle");
const toggleImg = toggleBtn.querySelector("img");

window.addEventListener("DOMContentLoaded", () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = prefersDark ? "dark" : "light";
  document.body.classList.add(theme);
  updateToggleIcon(theme);

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(e.matches ? "dark" : "light");
});

  // Theme toggle button
  document.getElementById("toggle").addEventListener("click", () => {
    const current = document.body.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.body.classList.remove(current);
    document.body.classList.add(next);
    localStorage.setItem("theme", next);
  });
});

window.addEventListener("DOMContentLoaded", () => {

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = localStorage.getItem("theme");

  const theme = saved || (prefersDark ? "dark" : "light");
  document.body.classList.add(theme);

  updateToggleIcon(theme);

  toggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "dark" : "light";
    localStorage.setItem("theme", newTheme);

    updateToggleIcon(newTheme);
  });
});

function updateToggleIcon(theme) {
  toggleImg.src = theme === "dark" ? "https://lexius.onrender.com/assets/images/dark.svg" : "https://lexius.onrender.com/assets/images/light.svg";
  toggleImg.alt = theme === "dark" ? "Light Mode Icon" : "Dark Mode Icon";
}

if (localStorage.getItem("theme")) {
  document.body.classList.add(localStorage.getItem("theme"));
}

if (localStorage.getItem("theme") === "dark" && document.body.classList.contains("dark")) {
  toggleImg.src = "https://lexius.onrender.com/assets/images/light.svg";
  toggleImg.alt = "Dark Mode Icon";
}