export function setTheme(theme) {
    if (theme != "dark" && theme != "light") {
      theme = getSystemTheme();
    }
    document.body.className = theme;
    localStorage.setItem("theme", theme);
}

function getSystemTheme() {
  // Returns true if the system theme is dark
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return isDark ? 'dark' : 'light';
}