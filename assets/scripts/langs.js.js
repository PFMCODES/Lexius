import { monaco } from './monaco.js';
import { saveFile, deleteFile, getAllFiles, DB_NAME, STORE_NAME, isIndexedDBEmpty } from './db.js';

require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
require(['vs/editor/editor.main'], () => {
  window.monacoReady = true;
});

window.addEventListener('DOMContentLoaded', async () => {
  await new Promise(resolve => {
    const wait = () => window.monacoReady ? resolve() : setTimeout(wait, 50);
    wait();
  });

  if (isIndexedDBEmpty) {
    saveFile('index.js', 'console.log("Hello, World!")')
    monaco('javascript',  'console.log("Hello, World!")', localStorage.getItem('theme'))
  }

  const allFiles = await getAllFiles();
  for (const { path, content } of allFiles) {
    const file = createFile(path);
    const icon = returnFileIcon(path);
    file.querySelector('img').src = icon;
    file.querySelector('img').alt = `Icon for ${path}`;
    if (file.innerText === 'index.js') file.classList.add('selected')
    localStorage.setItem(path, content);
  }

  layout(DetectFileType(document.querySelector('.selected').innerText) ,localStorage.getItem(document.querySelector('.selected').innerText), localStorage.getItem('theme'));

  const toggleBtn = document.getElementById("toggle");
  const toggleImg = toggleBtn?.querySelector("img");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme");
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);
  updateToggleIcon(theme);

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

  if (localStorage.getItem('autosave') === 'true') {
    document.getElementById('autosave-check').classList.add('true');
  }
  if (!localStorage.getItem('autosave')) {
    localStorage.setItem('autosave', 'true');
  }

  document.querySelectorAll('.true').forEach((o) => {
    o.innerHTML = '<i class="codicon codicon-check"></i>';
  });

  if (!filesContainer) return;
  filesTab.setAttribute('data-status', "open");
  const fileElements = filesContainer.getElementsByClassName("file");
  for (let i = 0; i < fileElements.length; i++) {
    const file = fileElements[i];
    const fileNameEl = file.getElementsByClassName("fileName")[0];
    const iconImg = file.getElementsByClassName("fileIcon")[0]?.getElementsByTagName("img")[0];
    if (fileNameEl && iconImg) {
      const fileName = fileNameEl.textContent.trim();
      const iconUrl = returnFileIcon(fileName);
      iconImg.src = iconUrl;
      iconImg.alt = `Icon for ${fileName}`;
    }
  }
});

document.getElementById('closeBtn').addEventListener('click', () => {
  if (!filesTab) return;
  const filesTabStatus = filesTab.getAttribute('data-status');
  if (filesTabStatus == "open") {
    filesTab.setAttribute('data-status', 'close');
    filesTab.style.display = "none";
  } else {
    filesTab.style.display = 'block';
    requestAnimationFrame(() => {
      filesTab.setAttribute('data-status', 'open');
      document.getElementById('editor').innerHTML = '';
      const el = document.getElementsByClassName('selected')[0].innerText;
      const lang = DetectFileType(el);
      monaco(lang, localStorage.getItem(el));
    });
  }
});

document.getElementById('File').addEventListener('click', () => {
  document.querySelector('.fileBtnOptions').classList.toggle('active');
});

document.querySelector('.fileBtnOptions').addEventListener('mouseleave', () => {
  document.querySelector('.fileBtnOptions').classList.remove('active');
});

document.getElementById('autosave').addEventListener('click', () => {
  const checkEl = document.getElementById('autosave-check');
  const current = localStorage.getItem('autosave') === 'true';
  localStorage.setItem('autosave', (!current).toString());
  checkEl.classList.toggle('true', !current);
});

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

async function layout(lang1, code1, theme1) {
  const selectedFile = document.querySelector('.selected');
  if (!selectedFile) return;
  const fileName = selectedFile.textContent.trim();
  const lang = lang1 || DetectFileType(fileName);
  const code = code1 ?? localStorage.getItem(fileName);
  const theme = theme1 || localStorage.getItem('theme');
  if (window.editorInstance?.layout) {
    window.editorInstance.layout();
  }
}

const filesContainer = document.getElementsByClassName("files")[0];
const filesTab = document.querySelector('#files-tab');
const rightClickMenu = document.getElementById('rightClickMenu');
let clickedFileEl = null;

filesTab.addEventListener('contextmenu', (e) => {
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
  rightClickMenu.style.display = 'none';
  clickedFileEl = null;
});

function createFile(name) {
  const file = document.createElement('div');
  file.classList.add('file');
  file.innerHTML = `
    <div class="fileIcon"><img src="" alt=""></div>
    <div class="fileName">${name}</div>
  `;
  filesTab.querySelector('.files').appendChild(file);
  return file;
}

document.getElementById('newFile').addEventListener('click', async () => {
  const name = prompt('Enter new file name', 'newfile.js');
  if (name) {
    const newFile = createFile(name);
    const icon = returnFileIcon(name);
    newFile.querySelector('img').src = icon;
    newFile.querySelector('img').alt = `Icon for ${name}`;
    localStorage.setItem(name, '');
    await saveFile(name, '');
  }
});

document.getElementById('renameFile').addEventListener('click', async () => {
  if (clickedFileEl) {
    const oldName = clickedFileEl.querySelector('.fileName').textContent.trim();
    const newName = prompt('Rename file to:', oldName);
    if (newName && newName !== oldName) {
      clickedFileEl.querySelector('.fileName').textContent = newName;
      clickedFileEl.querySelector('img').src = returnFileIcon(newName);
      const content = localStorage.getItem(oldName) || '';
      localStorage.setItem(newName, content);
      localStorage.removeItem(oldName);
      await saveFile(newName, content);
      await deleteFile(oldName);
    }
  }
});

document.getElementById('deleteFile').addEventListener('click', async () => {
  if (clickedFileEl) {
    const name = clickedFileEl.querySelector('.fileName').textContent.trim();
    if (confirm(`Delete "${name}"?`)) {
      localStorage.removeItem(name);
      await deleteFile(name);
      clickedFileEl.remove();
    }
  }
});

document.getElementById('newFolder').addEventListener('click', () => {
  const name = prompt('Enter new folder name', 'NewFolder');
  if (name) {
    const folder = document.createElement('div');
    folder.classList.add('file', 'close');
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
    filesTab.querySelector('.files').appendChild(folder);
  }
});

document.querySelector('.files').addEventListener('click', (e) => {
  const fileEl = e.target.closest('.file');
  if (!fileEl) return;
  const name = fileEl.querySelector('.fileName')?.textContent?.trim();
  if (!name) return;
  const lang = DetectFileType(name);
  const value = localStorage.getItem(name) || '';
  document.querySelectorAll('.file').forEach(f => f.classList.remove('selected'));
  fileEl.classList.add('selected');
  document.getElementById('editor').innerHTML = '';
  const theme = localStorage.getItem('theme');
  monaco(lang, value, theme);
});

document.getElementById('openFile').addEventListener('click', () => {
  if (clickedFileEl) {
    const name = clickedFileEl.querySelector('.fileName')?.textContent?.trim();
    if (!name) return;
    const lang = DetectFileType(name);
    const value = localStorage.getItem(name) || '';
    document.querySelectorAll('.file').forEach(f => f.classList.remove('selected'));
    clickedFileEl.classList.add('selected');
    document.getElementById('editor').innerHTML = '';
    const theme = localStorage.getItem('theme');
    monaco(lang, value, theme);
  }
});

const params = new URLSearchParams(window.location.search);
if (params.has('projectName')) {
  document.getElementsByClassName('prompt')[0].style.display = 'none';
  document.querySelector('.project-name').innerText = params.get('projectName').toUpperCase();
}

import { exportAsZip } from "./zip-export.js";
document.getElementById('downloadProject').addEventListener('click', () => {
  exportAsZip();
});

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