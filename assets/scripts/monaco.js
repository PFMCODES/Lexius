let editorInstance = null;

export function monaco(lang, eValue, theme) {
  const Monaco = window.monaco;
  if (!Monaco || !window.monacoReady) {
    console.warn("Monaco is not ready yet");
    return;
  }

  // Dispose previous instance (important!)
  if (editorInstance) {
    editorInstance.dispose();
    editorInstance = null;
  }

  // Define themes (only once)
  if (!window.__lexiusThemesDefined) {
    Monaco.editor.defineTheme("lexius-dark", {
      base: "vs-dark",
      inherit: true,
      semanticHighlighting: true,
      rules: [
        { token: "identifier", foreground: "82AAFF" },
        { token: "string", foreground: "FF9E64" },
        { token: "number", foreground: "F78C6C" },
        { token: "comment", foreground: "546E7A", fontStyle: "italic" },
        { token: "keyword", foreground: "82AAFF" },
      ],
      colors: {
        "editor.background": "#272626",
        "editorLineNumber.foreground": "#4B526D",
        "editorCursor.foreground": "#FFCC00",
        "editor.selectionBackground": "#7e56c280",
      }
    });

    Monaco.editor.defineTheme("lexius-light", {
      base: "vs",
      inherit: true,
      semanticHighlighting: true,
      rules: [
        { token: "identifier", foreground: "#CF9831" },
        { token: "string", foreground: "#4CBBD1" },
        { token: "number", foreground: "#4CBBD1" },
        { token: "comment", foreground: "#999999", fontStyle: "italic" },
        { token: "keyword", foreground: "#CF9831" }
      ],
      colors: {
        "editorLineNumber.foreground": "#4B526D",
        "editorCursor.foreground": "#FFCC00",
        "editor.selectionBackground": "#7e56c2"
      }
    });

    window.__lexiusThemesDefined = true;
  }

  // Determine theme
  // const monacoTheme = theme === "dark" ? "lexius-dark" : "lexius-light";
  theme = theme === "dark" ? "vs-dark" : "vs";
  
  // Create editor instance
  editorInstance = Monaco.editor.create(document.getElementById('editor'), {
    value: eValue,
    language: lang,
    theme: theme,
    fontSize: 14,
    automaticLayout: true,
    wordWrap: 'on',
    minimap: { enabled: false },
    scrollBeyondLastLine: false
  });

  // Store reference globally
  window.editorInstance = editorInstance;
  
  // Auto-format on creation if it's JavaScript
  if (lang === 'javascript' && eValue.trim()) {
    setTimeout(() => {
      prettifyCode();
    }, 500); // Increased timeout to ensure prettier loads
  }
}

const prettierParsers = {
  javascript: "babel",
  js: "babel",
  html: "html",
  typescript: "typescript",
  ts: "typescript",
  css: "css",
};

function prettifyCode() {
  if (!editorInstance) return;
  
  const code = editorInstance.getValue();
  const lang = editorInstance.getModel().getLanguageId();

  if (!code.trim()) return;
  if (lang !== 'javascript') return;

  try {
    // Check if prettier is available
    if (typeof prettier === 'undefined') {
      console.warn("Prettier not loaded");
      return;
    }

    // Use prettier with parser directly - no plugins needed for v2.8.8
    const formatted = prettier.format(code, {
      parser: 'babel',
      semi: true,
      singleQuote: true,
      tabWidth: 2,
      trailingComma: 'es5'
    });

    editorInstance.setValue(formatted);
  } catch (err) {
    console.warn("Prettier failed:", err.message);
  }
}

// Export prettifyCode function for external use
export { prettifyCode };