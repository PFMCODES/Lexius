let lang = 'html';
let editor; // outside of require()

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
    editor = monaco.editor.create(document.getElementById('editor'), {
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
            if (editor.getValue() != "!") {
                console.log('Hmm')
            }
            if (content === "!") {
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
    });

    // App storage etc. (no changes here, but fix .value usage later)
});

// Also: Make sure your editor DIV has a height!

async function Run() {
    const html = editor.getValue()
    const user = localStorage.getItem('user')
    if (!user) {
        const username = prompt('Enter a user name');
        const pass = prompt('Enter a password');
        localStorage.setItem('user', username)
    }
    else {
        // create a new handle
        const newHandle = await window.showSaveFilePicker();

        // create a FileSystemWritableFileStream to write to
        const writableStream = await newHandle.createWritable();

        // write our file
        await writableStream.write(html);

        // close the file and write the contents to disk.
        await writableStream.close();
    }
}

function search(query) {
    const content = editor.getValue() || editor.innerText;
    const matches = [];
    const regex = new RegExp(query, 'gi');
    let match;

    while ((match = regex.exec(content)) !== null) {
        matches.push({ index: match.index, text: match[0] });
    }

    return matches;
}

window.addEventListener("resize", () => {
    editor.layout();
});
const langPath = document.getElementById('lang-path');
const langEl = document.createElement("div");
const icon = document.createElement("i");
icon.classList.add("codicon", "codicon-json");
icon.style.fontSize = '20px'
const textNode = document.createTextNode(lang);
langEl.appendChild(icon);
langEl.appendChild(textNode);
langPath.appendChild(langEl);
