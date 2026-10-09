export function setTheme(theme) {
    if (theme != "dark" && theme != "light") {
      theme = getSystemTheme();
    }
    document.body.className = theme;
    localStorage.setItem("theme", theme);
    
    // Update editor theme if editor exists
    if (window.editorInstance && window.setCaretTheme) {
      window.setCaretTheme(theme);
    }
    if (window.editorInstance && window.monaco) {
      const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';
      window.editorInstance.updateOptions({ theme: monacoTheme });
    }
}

function getSystemTheme() {
  // Returns true if the system theme is dark
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  return isDark ? 'dark' : 'light';
}

// Theme setup
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme") || "light";
const theme = savedTheme || (prefersDark ? "dark" : "light");

// Initialize theme
document.body.classList.remove("light", "dark");
document.body.classList.add(theme);

window.onload = () => {
  Welcome();
}