let lang = 'html';

// Initialize Monaco Editor
require.config({
    paths: {
        'vs': 'https://unpkg.com/monaco-editor@0.39.0/min/vs'
    }
});

require(['vs/editor/editor.main'], function () {
    // Define custom theme first
    monaco.editor.defineTheme('myCustomTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: '', foreground: 'F8F8F8', background: '1E1E1E' },
            { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        ],
        colors: {
            'editor.background': '#1E1E1E',
            'editor.foreground': '#F8F8F8',
            'editor.lineHighlightBackground': '#2B2B2B',
            'editorCursor.foreground': '#7C56C1',
            'editorIndentGuide.background': '#404040',
            'editor.selectionBackground': '#264F78',
        }
    });

    // Now create editor
    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: '',
        language: lang,
        theme: 'myCustomTheme', // Correct spelling
        placeholder: "Type '!' for HTML boilerplate",
    });

    // Now editor will have placeholder correctly!

    editor.onDidChangeModelContent(() => {
        const model = editor.getModel();
        const content = model.getValue();

        if (lang === 'html') {
            while (true) {
                if (content.trim() === "!") {
                    const html5Template = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <body>
    
    </body>
    </html>`;
    
                    model.setValue(html5Template);
    
                    const index = html5Template.indexOf("Document");
                    const position = model.getPositionAt(index);
    
                    editor.setPosition(position);
                    editor.setSelection({
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column + "Document".length
                    });
    
                    editor.focus();
                }
            }
        }
    });

    // App storage etc. (no changes here, but fix .value usage later)
});

// Also: Make sure your editor DIV has a height!
