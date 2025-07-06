let editorInstance = null;

export function monaco(lang, eValue, theme) {
  // Load Monaco paths
  require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } });

  require(['vs/editor/editor.main'], function () {
    const Monaco = window.monaco;

    // Define custom theme
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

    // Create editor
    editorInstance = Monaco.editor.create(document.getElementById('editor'), {
      value: eValue,
      language: lang,
      theme: document.body.classList.contains('dark') ? 'lexius-dark' : 'lexius-light',
      fontSize: 14,
      automaticLayout: true,
    });

    // Expose instance globally
    window.editorInstance = editorInstance;
  });
}