import { monaco } from './monaco.js';
import { sendMessage } from './indu.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
import { saveFile, deleteFile, getAllFiles, DB_NAME, STORE_NAME, isIndexedDBEmpty } from './db.js';

// DOM Elements
const toggleBtn = document.getElementById("toggle");
const toggleImg = toggleBtn?.querySelector("img");
const induInput = document.getElementById('activateIndu');
const terminalWindow = document.querySelector('.terminal');
const activateTerminalButton = document.getElementById('activate-terminal');
const filesContainer = document.getElementsByClassName("files")[0];
const filesTab = document.querySelector('.files-tab');
const rightClickMenu = document.getElementById('rightClickMenu');

// Global variables
let clickedFileEl = null;
let isDragging = false;
let startX = 0;
let prevEl, nextEl;
let startPrevWidth, startNextWidth;

// Theme setup
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme");
const theme = savedTheme || (prefersDark ? "dark" : "light");

// Monaco Editor setup
require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
require(['vs/editor/editor.main'], () => {
  window.monacoReady = true;
});

// Initialize theme
document.body.classList.remove("light", "dark");
document.body.classList.add(theme);
updateToggleIcon(theme);

// Indu activation
induInput.addEventListener('click', async () => {
  document.querySelectorAll('.indu').forEach((induWindow) => {
    if (!induWindow) return;
    const induWindowStatus = induWindow.getAttribute('data-status');
    if (induWindowStatus === "open") {
      induWindow.setAttribute('data-status', 'close');
      induWindow.style.display = "none";
    } else {
      induWindow.style.display = 'flex';
      requestAnimationFrame(() => {
        induWindow.setAttribute('data-status', 'open');
        layout();
      });
    }
  });
});

// Initialize default file if database is empty
isIndexedDBEmpty().then((result) => {
  if (result) {
    saveFile('index.js', 'console.log("Hello, World!");');
    window.addEventListener('DOMContentLoaded', () => {
      const indexFile = document.querySelector('#index.js');
      if (indexFile) {
        indexFile.classList.add('selected');
      }
    });
  }
});

// Load files on DOM ready
window.addEventListener('DOMContentLoaded', async () => {
  const allFiles = await getAllFiles();

  for (const { path, content } of allFiles) {
    const file = createFile(path);
    const icon = returnFileIcon(path);

    file.id = path;
    file.querySelector('img').src = icon;
    file.querySelector('img').alt = `Icon for ${path}`;

    if (path === 'index.js') {
      file.classList.add('selected');
    }

    localStorage.setItem(path, content);
  }

  // Ensure at least one file is selected
  if (!document.querySelector('.selected') && allFiles.length > 0) {
    const first = allFiles[0];
    const firstFileEl = document.getElementById(first.path);
    if (firstFileEl) {
      firstFileEl.classList.add('selected');
    }
  }
});

// Main initialization
window.addEventListener('DOMContentLoaded', async () => {
  // Wait for Monaco to be ready
  await new Promise(resolve => {
    const wait = () => window.monacoReady ? resolve() : setTimeout(wait, 50);
    wait();
  });

  lucide.createIcons();

  const induInputField = document.getElementById('induInput');
  const chatDiv = document.getElementById("chat");

  // Chat functionality
  induInputField.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const message = induInputField.value.trim();
      if (!message) return;

      // Hide header and add user message
      const header = document.querySelector('.header');
      if (header) {
        header.style.display = 'none';
      }

      const userMessage = document.createElement('div');
      userMessage.classList.add('message', 'user');
      userMessage.innerText = message;
      chatDiv.appendChild(userMessage);
      induInputField.value = '';

      // Add thinking message
      const thinkingEl = document.createElement('div');
      thinkingEl.classList.add('message', 'indu', 'typing');

      const induProfilePic = document.createElement('div');
      induProfilePic.classList.add('indu-icon');

      const induProfilePicImg = document.createElement('img');
      induProfilePicImg.classList.add('indu-icon-img');
      induProfilePicImg.src = '../../assets/images/indu.png';

      induProfilePic.appendChild(induProfilePicImg);

      const thinkingMessageEl = document.createElement('div');
      thinkingMessageEl.innerHTML = 'Indu is thinking...';

      thinkingEl.appendChild(induProfilePic);
      thinkingEl.appendChild(thinkingMessageEl);
      chatDiv.appendChild(thinkingEl);
      chatDiv.scrollTop = chatDiv.scrollHeight;

      const files = await getAllFiles();

      // Fetch and display response
      try {
        const res = await sendMessage(message, files);
        const cleanedRes = res.replace(/<think>.*?<\/think>/gs, "").replace(/<p><\/p>/, "");
        const html = marked.parse(cleanedRes || "Sorry, I didn't understand that.");
        thinkingMessageEl.innerHTML = html;

        hljs.highlightAll();
        chatDiv.scrollTop = chatDiv.scrollHeight;

        // Add copy button to all code blocks
        thinkingMessageEl.querySelectorAll('pre code').forEach((block) => {
          const pre = block.parentElement;
          pre.style.position = 'relative';

          const copyBtn = document.createElement('button');
          copyBtn.className = 'copy-code-btn';
          copyBtn.innerHTML = '<i data-lucide="copy"></i> copy';

          // Add copy logic
          copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(block.innerText).then(() => {
              copyBtn.innerHTML = '<i data-lucide="check"></i> copied';
              lucide.createIcons();
              setTimeout(() => {
                copyBtn.innerHTML = '<i data-lucide="copy"></i> copy';
                lucide.createIcons();
              }, 2000);
            });
          });

          pre.appendChild(copyBtn);
        });

        lucide.createIcons();
      } catch (err) {
        thinkingMessageEl.innerHTML = err.message;
      }
    }
  });

  // Initialize autosave
  if (localStorage.getItem('autosave') === 'true') {
    const autosaveCheck = document.getElementById('autosave-check');
    if (autosaveCheck) {
      autosaveCheck.classList.add('true');
    }
  }
  if (!localStorage.getItem('autosave')) {
    localStorage.setItem('autosave', 'true');
  }

  document.querySelectorAll('.true').forEach((o) => {
    o.innerHTML = '<i class="codicon codicon-check"></i>';
  });

  // Initialize files tab
  if (filesContainer && filesTab) {
    filesTab.setAttribute('data-status', "open");
  }

  // Initialize layout with delay
  setTimeout(() => {
    const selectedFile = document.querySelector('.selected');
    if (selectedFile) {
      const fileName = selectedFile.innerText;
      const fileType = DetectFileType(fileName);
      const content = localStorage.getItem(fileName);
      const currentTheme = localStorage.getItem('theme');
      layout(fileType, content, currentTheme);
    }
  }, 3000);
});

// Drag and resize functionality
const dragBars = document.querySelectorAll('.drag-bar');

dragBars.forEach(bar => {
  bar.addEventListener('mousedown', (e) => {
    e.preventDefault();

    isDragging = true;
    startX = e.clientX;

    prevEl = bar.previousElementSibling;
    nextEl = bar.nextElementSibling;

    startPrevWidth = prevEl.offsetWidth;
    startNextWidth = nextEl ? nextEl.offsetWidth : 0;

    document.body.style.cursor = 'ew-resize';
  });
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startX;

  // Resize only horizontal layout components (side-by-side)
  if (prevEl && prevEl.classList.contains('resizable')) {
    const newWidth = startPrevWidth + dx;
    prevEl.style.width = `${newWidth}px`;

    // Optional: shrink next sibling if needed
    if (nextEl && nextEl.classList.contains('resizable')) {
      nextEl.style.width = `${startNextWidth - dx}px`;
    }
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.cursor = 'default';
});

// Theme toggle functionality
if (!savedTheme) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
    const newTheme = e.matches ? "dark" : "light";
    document.body.classList.remove("light", "dark");
    document.body.classList.add(newTheme);
    updateToggleIcon(newTheme);
    layout();
  });
}

toggleBtn?.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  document.body.classList.remove("dark", "light");
  document.body.classList.add(newTheme);
  localStorage.setItem("theme", newTheme);
  updateToggleIcon(newTheme);
  layout();
});

function updateToggleIcon(theme) {
  if (!toggleImg) return;
  toggleImg.src = theme === "dark"
    ? "../../assets/images/dark.svg"
    : "../../assets/images/light.svg";
  toggleImg.alt = theme === "dark" ? "Light Mode Icon" : "Dark Mode Icon";
}

// File management event listeners
document.getElementById('closeBtn')?.addEventListener('click', () => {
  if (!filesTab) return;
  const filesTabStatus = filesTab.getAttribute('data-status');
  if (filesTabStatus === "open") {
    filesTab.setAttribute('data-status', 'close');
    filesTab.style.display = "none";
  } else {
    filesTab.style.display = 'block';
    requestAnimationFrame(() => {
      filesTab.setAttribute('data-status', 'open');
      layout();
    });
  }
});

document.getElementById('File')?.addEventListener('click', () => {
  const fileBtnOptions = document.querySelector('.fileBtnOptions');
  if (fileBtnOptions) {
    fileBtnOptions.classList.toggle('active');
  }
});

document.querySelector('.fileBtnOptions')?.addEventListener('mouseleave', () => {
  const fileBtnOptions = document.querySelector('.fileBtnOptions');
  if (fileBtnOptions) {
    fileBtnOptions.classList.remove('active');
  }
});

document.getElementById('autosave')?.addEventListener('click', () => {
  const checkEl = document.getElementById('autosave-check');
  const current = localStorage.getItem('autosave') === 'true';
  localStorage.setItem('autosave', (!current).toString());
  if (checkEl) {
    checkEl.classList.toggle('true', !current);
  }
});

// Auto-save functionality
async function autoSave() {
  const isAutoSaveEnabled = localStorage.getItem("autosave") === "true";
  if (!isAutoSaveEnabled) return;

  const selectedEl = document.getElementsByClassName('selected')[0];
  if (!selectedEl || !window.editorInstance) return;

  const fileName = selectedEl.innerText.trim();
  const value = window.editorInstance.getValue();

  if (value !== localStorage.getItem(fileName)) {
    localStorage.setItem(fileName, value);
    await saveFile(fileName, value);
    console.log(`Auto-saved ${fileName}`);
  }
}

setInterval(autoSave, 2000);

// Layout function
async function layout(lang1, code1, theme1) {
  const selectedFile = document.querySelector('.selected');
  if (!selectedFile) return;

  const fileName = selectedFile.textContent.trim();
  const lang = lang1 ?? DetectFileType(fileName);
  const code = code1 ?? localStorage.getItem(fileName);
  const currentTheme = theme1 ?? localStorage.getItem('theme');

  if (window.editorInstance) {
    window.editorInstance.dispose();
  }

  monaco(lang, code, currentTheme);
  hljs.highlightAll();
}

// Context menu functionality
filesTab?.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const fileEl = e.target.closest('.file');
  if (fileEl) {
    clickedFileEl = fileEl;
    rightClickMenu.style.display = 'block';
    rightClickMenu.style.top = `${e.pageY}px`;
    rightClickMenu.style.left = `${e.pageX}px`;
  }
});

document.addEventListener('click', () => {
  if (rightClickMenu) {
    rightClickMenu.style.display = 'none';
  }
  clickedFileEl = null;
});

// File creation
function createFile(name) {
  const file = document.createElement('div');
  file.classList.add('file');
  file.innerHTML = `
    <div class="fileIcon"><img src="" alt=""></div>
    <div class="fileName">${name}</div>
  `;
  if (filesTab) {
    filesTab.appendChild(file);
  }
  return file;
}

// New file creation
document.getElementById('newFile')?.addEventListener('click', async () => {
  const name = prompt('Enter new file name', '');
  if (name) {
    const newFile = createFile(name);
    const icon = returnFileIcon(name);
    newFile.querySelector('img').src = icon;
    newFile.querySelector('img').alt = `Icon for ${name}`;
    localStorage.setItem(name, '');
    await saveFile(name, '');
  }
});

// File renaming
document.getElementById('renameFile')?.addEventListener('click', async () => {
  if (clickedFileEl) {
    const fileNameEl = clickedFileEl.querySelector('.fileName');
    const oldName = fileNameEl.textContent.trim();

    fileNameEl.innerHTML = `<input type='text' id='fileNameInput' value="${oldName}" />`;

    const input = fileNameEl.querySelector('#fileNameInput');
    input.focus();
    input.select();

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const newName = input.value.trim() || 'Untitled';
        const content = localStorage.getItem(oldName) || '';

        if (newName !== oldName) {
          localStorage.setItem(newName, content);
          localStorage.removeItem(oldName);
          await saveFile(newName, content);
          await deleteFile(oldName);
        }

        fileNameEl.innerHTML = newName;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        fileNameEl.innerHTML = oldName;
      }
    });
  }
});

// File deletion
document.getElementById('deleteFile')?.addEventListener('click', async () => {
  if (clickedFileEl) {
    const name = clickedFileEl.querySelector('.fileName').textContent.trim();
    if (confirm(`Delete "${name}"?`)) {
      localStorage.removeItem(name);
      await deleteFile(name);
      clickedFileEl.remove();
    }
  }
});

// Project name functionality
document.getElementById('projectNameInput')?.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {
    const projectName = document.getElementById('projectNameInput').value;
    window.location.href = `?projectName=${projectName}`;
  }
});

document.getElementById('projectNameButton')?.addEventListener('click', () => {
  const projectName = document.getElementById('projectNameInput').value;
  window.location.href = `?projectName=${projectName}`;
});

// New folder creation
document.getElementById('newFolder')?.addEventListener('click', () => {
  const name = prompt('Enter new folder name', 'NewFolder');
  if (name) {
    const folder = document.createElement('div');
    folder.classList.add('folder', 'close');
    folder.innerHTML = `
      <div class="fileIcon"><i class="codicon codicon-chevron-right"></i></div>
      <div class="fileName">${name}</div>
    `;
    folder.addEventListener('click', () => {
      const icon = folder.querySelector('i');
      const isOpen = folder.classList.toggle('open');
      folder.classList.toggle('close', !isOpen);
      icon.classList.toggle('codicon-chevron-right', !isOpen);
      icon.classList.toggle('codicon-chevron-up', isOpen);
    });
    const filesContainer = filesTab?.querySelector('.files');
    if (filesContainer) {
      filesContainer.appendChild(folder);
    }
  }
});

// File selection
document.querySelector('.files')?.addEventListener('click', (e) => {
  const fileEl = e.target.closest('.file');
  if (!fileEl) return;
  if (fileEl.classList.contains('selected')) return;

  const name = fileEl.querySelector('.fileName')?.textContent?.trim();
  if (!name) return;

  const lang = DetectFileType(name);
  const value = localStorage.getItem(name) || '';

  document.querySelectorAll('.file').forEach(f => f.classList.remove('selected'));
  fileEl.classList.add('selected');

  const editor = document.getElementById('editor');
  if (editor) {
    editor.innerHTML = '';
  }

  const currentTheme = localStorage.getItem('theme');
  monaco(lang, value, currentTheme);
});

// Open file from context menu
document.getElementById('openFile')?.addEventListener('click', () => {
  if (clickedFileEl) {
    const name = clickedFileEl.querySelector('.fileName')?.textContent?.trim();
    if (!name) return;

    const lang = DetectFileType(name);
    const value = localStorage.getItem(name) || '';

    document.querySelectorAll('.file').forEach(f => f.classList.remove('selected'));
    clickedFileEl.classList.add('selected');

    const editor = document.getElementById('editor');
    if (editor) {
      editor.innerHTML = '';
    }

    const currentTheme = localStorage.getItem('theme');
    monaco(lang, value, currentTheme);
  }
});

// Project name handling
const params = new URLSearchParams(window.location.search);
if (params.has('projectName')) {
  const promptEl = document.getElementsByClassName('prompt')[0];
  if (promptEl) {
    promptEl.style.display = 'none';
  }
  const projectNameEl = document.querySelector('.project-name');
  if (projectNameEl) {
    projectNameEl.innerText = params.get('projectName').toUpperCase();
  }
}

// File type detection
function DetectFileType(f) {
  f = f.toLowerCase();

  if (f.endsWith(".js")) return "javascript";
  if (f.endsWith(".ts")) return "typescript";
  if (f.endsWith(".jsx")) return "javascript";
  if (f.endsWith(".tsx")) return "typescript";
  if (f.endsWith(".json")) return "json";
  if (f.endsWith(".html")) return "html";
  if (f.endsWith(".css")) return "css";
  if (f.endsWith(".scss")) return "scss";
  if (f.endsWith(".less")) return "less";
  if (f.endsWith(".md")) return "markdown";
  if (f.endsWith(".mdx")) return "mdx";
  if (f.endsWith(".vue")) return "vue";
  if (f.endsWith(".svelte")) return "svelte";
  if (f.endsWith(".php")) return "php";
  if (f.endsWith(".py")) return "python";
  if (f.endsWith(".java")) return "java";
  if (f.endsWith(".c")) return "c";
  if (f.endsWith(".cpp") || f.endsWith(".cxx") || f.endsWith(".cc")) return "cpp";
  if (f.endsWith(".h")) return "c-header";
  if (f.endsWith(".hpp") || f.endsWith(".hxx") || f.endsWith(".hh")) return "cpp-header";
  if (f.endsWith(".go")) return "go";
  if (f.endsWith(".rb")) return "ruby";
  if (f.endsWith(".swift")) return "swift";
  if (f.endsWith(".kt") || f.endsWith(".kotlin")) return "kotlin";
  if (f.endsWith(".rs")) return "rust";
  if (f.endsWith(".lua")) return "lua";
  if (f.endsWith(".sh") || f.endsWith(".bash")) return "bash";
  if (f.endsWith(".sql")) return "sql";
  if (f.endsWith(".yaml") || f.endsWith(".yml")) return "yaml";
  if (f.endsWith(".xml")) return "xml";
  if (f.endsWith(".txt")) return "plaintext";
  if (f.endsWith(".svg")) return "svg";
  if (f.endsWith(".tsv")) return "tsv";
  if (f.endsWith(".csv")) return "csv";
  if (f.endsWith(".wasm")) return "wasm";
  if (f.endsWith(".jsonc")) return "jsonc";
  if (f.endsWith(".json5")) return "json5";
  if (f.endsWith(".diff") || f.endsWith(".patch")) return "diff";
  if (f.endsWith(".asm") || f.endsWith(".s")) return "assembly";
  if (f.endsWith(".m")) return "objective-c";
  if (f.endsWith(".mm")) return "objective-cpp";
  if (f.endsWith(".dart")) return "dart";
  if (f.endsWith(".scala")) return "scala";
  if (f.endsWith(".clj") || f.endsWith(".cljs") || f.endsWith(".cljc")) return "clojure";
  if (f.endsWith(".elixir")) return "elixir";
  if (f.endsWith(".erl") || f.endsWith(".hrl")) return "erlang";
  if (f.endsWith(".groovy")) return "groovy";
  if (f.endsWith(".hbs") || f.endsWith(".handlebars")) return "handlebars";
  if (f.endsWith(".jinja") || f.endsWith(".j2")) return "jinja";
  if (f.endsWith(".tex")) return "latex";
  if (f.endsWith(".r") || f.endsWith(".rmd")) return "r";
  if (f.endsWith(".pl") || f.endsWith(".pm")) return "perl";
  if (f.endsWith(".cs")) return "csharp";
  if (f.endsWith(".fs")) return "fsharp";
  if (f.endsWith(".vb")) return "visual-basic";
  if (f.endsWith(".nim")) return "nim";
  if (f.endsWith(".hcl")) return "hcl";
  if (f.endsWith(".toml")) return "toml";
  if (f.endsWith(".zig")) return "zig";
  if (f.endsWith(".v")) return "vlang";
  if (f.endsWith(".cshtml") || f.endsWith(".razor")) return "razor";

  return "unknown";
}

// File icon mapping
function returnFileIcon(f) {
  const type = DetectFileType(f);
  const base = "../../assets/images/langs/";
  const map = {
    javascript: "js.svg",
    typescript: "ts.svg",
    react: "jsx.svg",
    json: "json.svg",
    html: "html.svg",
    css: "css.svg",
    scss: "scss.svg",
    less: "less.svg",
    markdown: "markdown.svg",
    mdx: "mdx.svg",
    vue: "vue.svg",
    svelte: "svelte.svg",
    php: "php.svg",
    python: "python.svg",
    java: "java.svg",
    c: "c.svg",
    cpp: "cpp.svg",
    go: "go.svg",
    ruby: "ruby.svg",
    swift: "swift.svg",
    kotlin: "kotlin.svg",
    rust: "rust.svg",
    lua: "lua.svg",
    bash: "bash.svg",
    sql: "sql.svg",
    yaml: "yaml.svg",
    xml: "xml.svg",
    plaintext: "file.svg",
    svg: "svg.svg",
    tsv: "tsv.svg",
    csv: "csv.svg",
    wasm: "wasm.svg",
    jsonc: "jsonc.svg",
    json5: "json5.svg",
    diff: "diff.svg",
    assembly: "assembly.svg",
    "c-header": "h.svg",
    "cpp-header": "hpp.svg",
    "objective-c": "m.svg",
    "objective-cpp": "mpp.svg",
    dart: "dart.svg",
    scala: "scala.svg",
    clojure: "clojure.svg",
    elixir: "elixir.svg",
    erlang: "erlang.svg",
    groovy: "groovy.svg",
    handlebars: "handlebars.svg",
    jinja: "jinja.svg",
    latex: "latex.svg",
    r: "r.svg",
    perl: "perl.svg",
    csharp: "csharp.svg",
    fsharp: "fsharp.svg",
    "visual-basic": "vb.svg",
    nim: "nim.svg",
    hcl: "hcl.svg",
    toml: "toml.svg",
    zig: "zig.svg",
    vlang: "vlang.svg",
    razor: "razor.svg"
  };

  return base + (map[type] || "file.svg");
}

// Cursor pointer styling
document.addEventListener('mouseover', e => {
  const cursor = window.getComputedStyle(e.target).cursor;
  if (cursor === 'pointer') {
    e.target.classList.add('pointer');
  }
});