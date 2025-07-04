const web = document.getElementById('web');
const js = document.getElementById('js');
const ts = document.getElementById('ts');
const php = document.getElementById('php');
const rust = document.getElementById('rust');

web.addEventListener('click', () => {
    window.location.href = './langs/web/';
});

js.addEventListener('click', () => {
    window.location.href = './langs/js/';
});

ts.addEventListener('click', () => {
    window.location.href = './langs/ts/';
});

php.addEventListener('click', () => {
    window.location.href = './langs/php/';
});

rust.addEventListener('click', () => {
    window.location.href = './langs/rust/';
});

window.addEventListener("DOMContentLoaded", () => {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = prefersDark ? "dark" : "light";
  document.body.classList.add(theme);

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