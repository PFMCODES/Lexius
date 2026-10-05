let editorInstance = null;

async function monaco(lang, eValue) {
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

  // Determine theme
  // const monacoTheme = theme === "dark" ? "lexius-dark" : "lexius-light";
  let theme = localStorage.getItem("theme") === "dark" ? "vs-dark" : "vs";
  
  // Create editor instance
  editorInstance = Monaco.editor.create(document.getElementById('editor'), {
    value: eValue,
    language: lang,
    theme: theme,
    fontSize: 14,
    automaticLayout: true,
    wordWrap: 'on',
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    'semanticHighlighting.enabled': true,
  });

  // Store reference globally
  window.editorInstance = editorInstance;
  
  // Auto-format on creation if it's JavaScript
  if (lang === 'javascript' && eValue) {
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
export { prettifyCode, monaco };