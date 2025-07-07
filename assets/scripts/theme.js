window.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle");
  const toggleImg = toggleBtn?.querySelector("img"); // optional chaining safety

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");

  const theme = savedTheme || (prefersDark ? "dark" : "light");

  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
  updateToggleIcon(theme);

  // Respond to OS changes if no manual override
  if (!savedTheme) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
      const newTheme = e.matches ? "dark" : "light";
      document.body.classList.remove("light", "dark");
      document.body.classList.add(newTheme);
      updateToggleIcon(newTheme);
    });
  }

  toggleBtn?.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark");
    const newTheme = isDark ? "light" : "dark";
    document.body.classList.remove("dark", "light");
    document.body.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
    updateToggleIcon(newTheme);
  });

  function getRIghtSvgPath(u, name) {
    const url = window.location.href
    if (!url.includes('/langs/')) {
      return "../../assets/images/" + name + ".svg"
    }
  }
  

  function updateToggleIcon(theme) {
    if (!toggleImg) return;
    toggleImg.src = theme === "dark"
      ? getRIghtSvgPath("assets/images/dark.svg", 'dark')
      : getRIghtSvgPath("assets/images/dark.svg", 'light')
    toggleImg.alt = theme === "dark" ? "Light Mode Icon" : "Dark Mode Icon";
  }
});

