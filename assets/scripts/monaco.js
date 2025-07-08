let editorInstance = null;

export function monaco(lang, eValue, theme) {
  const Monaco = window.monaco;
  if (!Monaco || !window.monacoReady) {
    console.warn("Monaco is not ready yet");
    return;
  }

  // Dispose previous instance (important!)
  if (window.editorInstance) {
    window.editorInstance.dispose();
    document.getElementById('editor').innerHTML = ''; // clear container
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
        { token: "identifier", foreground: "82AAFF" },
        { token: "string", foreground: "FF9E64" },
        { token: "number", foreground: "F78C6C" },
        { token: "comment", foreground: "546E7A", fontStyle: "italic" },
        { token: "keyword", foreground: "82AAFF" },
      ],
      colors: {
        "editorLineNumber.foreground": "#4B526D",
        "editorCursor.foreground": "#FFCC00",
        "editor.selectionBackground": "#7e56c2",
      }
    });

    window.__lexiusThemesDefined = true;
  }

  // Always set the theme before creation (not just inside config)
  const monacoTheme = theme === "dark" ? "lexius-dark" : "lexius-light";
  Monaco.editor.setTheme(monacoTheme); // must be before create

  // Create editor instance
  editorInstance = Monaco.editor.create(document.getElementById('editor'), {
    value: eValue,
    language: lang,
    theme: monacoTheme,
    fontSize: 14,
    automaticLayout: true,
  });

  window.editorInstance = editorInstance;
}