<<<<<<< HEAD
let lang;
=======
let lang = 'html'
>>>>>>> 28133a1ac12fc724306bb64912f1e7e5068bc2a5

// Initialize Monaco Editor
require.config({
    paths: {
        'vs': 'https://unpkg.com/monaco-editor@0.39.0/min/vs'
    }
});

require(['vs/editor/editor.main'], function () {
    const editor = monaco.editor.create(document.getElementById('editor'), {
        value: ``,
        language: lang,
<<<<<<< HEAD
        theme: 'MyCustomtheme'
=======
        theme: 'MyCustomtheme',
        placeholder: "Type '!' for HTML boilerplate", // ✅ Built-in support
        automaticLayout: true,
>>>>>>> 28133a1ac12fc724306bb64912f1e7e5068bc2a5
    });

    

    // Define custom theme
    monaco.editor.defineTheme('myCustomTheme', {
        base: 'vs-dark', // or 'vs', 'hc-black'
        inherit: true, // set to false if you don’t want to inherit anything
        rules: [
          { token: '', foreground: 'F8F8F8', background: '1E1E1E' },
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
          // Add more token styles here...
        ],
        colors: {
          'editor.background': '#1E1E1E',
          'editor.foreground': '#F8F8F8',
          'editor.lineHighlightBackground': '#2B2B2B',
          'editorCursor.foreground': '#7C56C1',
          'editorIndentGuide.background': '#404040',
          'editor.selectionBackground': '#264F78',
          // Add more editor colors here...
        }
      });
      
      monaco.editor.setTheme('myCustomTheme');

    // Add ! abbreviation trigger
    editor.onDidChangeModelContent(() => {
        const model = editor.getModel();
        const content = model.getValue();

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

            // Set content and place cursor at "Document"
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
    });
});

<<<<<<< HEAD
function langu() {
    try {
        lang = prompt("what language would you like to code in")
    } catch (err) {
        lang = showPropt()
    }
}

document.onload(
    langu()
)
=======
// App's internal virtual storage
const appStorage = {
    "user": {
        "index.html": ""
    }
};

async function Run() {
    const html = editor.value
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
    const content = editor.value || editor.innerText;
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
  
window.addEventListener("DOMContentLoaded", () => {
    editor.layout();
});

const langhtm = 'html'; // or whatever language you want to display
const langPath = document.getElementById('lang-path');
const langEl = document.createElement("div");
const icon = document.createElement("i");
icon.classList.add("codicon", "codicon-json");
icon.style.fontSize = '20px'
const textNode = document.createTextNode(langhtm);
langEl.appendChild(icon);
langEl.appendChild(textNode);
langPath.appendChild(langEl);
>>>>>>> 28133a1ac12fc724306bb64912f1e7e5068bc2a5
