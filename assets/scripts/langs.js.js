import { monaco } from './monaco.js';
import { loadMonaco } from './monacoLoader.js';
import { sendMessage } from './indu.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';
import { saveFile, deleteFile, getAllFiles, isIndexedDBEmpty } from './db.js';

// from database or indexed DB
const noFiles = isIndexedDBEmpty();
let isAutoSaveEnabled = localStorage.getItem("autosave") === "true";

// Electron
export const isElectron = window.env?.isElectron === true;
export class fs {
  static writeFile(path, content) {
    if (isElectron) {
      return window.fs.writeFile(path, content);
    }
  }
  static readFile(path) {
    if (isElectron) {
      return window.fs.readFile(path);
      }
    }
  }

// DOM Elements
const toggleBtn = document.getElementById("toggle");
const toggleImg = toggleBtn?.querySelector("img");
const induInput = document.getElementById('activateIndu');
const filesContainer = document.getElementsByClassName("files")[0];
const filesTab = document.querySelector('.files-tab');
const rightClickMenu = document.getElementById('rightClickMenu');
const editor = document.getElementById("editor");
const terminalDisplay = document.getElementById("terminal-display");

// Global variables
const supportedLangs = [
  "python",
  "javascript", 
  "typescript",
  "html",
  "markdown",
  "svg"
]
let clickedFileEl = null;
let isDragging = false;
let startX = 0;
let prevEl, nextEl;
let startPrevWidth, startNextWidth;
let isWelcomeMessageActive;
let autosaveTimer;
let idLimit = 999;
let min = 0;
let runIds = [];
let htmlDisplayExists = false;

// Theme setup
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const savedTheme = localStorage.getItem("theme") || "light";
const theme = savedTheme || (prefersDark ? "dark" : "light");

// Monaco Editor setup
require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@latest/min/vs' } });
require(['vs/editor/editor.main'], () => {
  window.monacoReady = true;
});

// Initialize theme
document.body.classList.remove("light", "dark");
document.body.classList.add(theme);
updateToggleIcon(null, null, theme);

window.onload = () => {
  Welcome();
}

// Indu activation
induInput.addEventListener('click', async () => {
  document.querySelectorAll('.indu').forEach((induWindow) => {
    if (!induWindow) return;
    const induWindowStatus = induWindow.getAttribute('data-status');
    if (induWindowStatus === "open") {
      induWindow.setAttribute('data-status', 'close');
      induWindow.style.display = "none";
       document.getElementById('editor').style.minWidth = 'calc(100% - (15% + 20px))';
    } else {
      induWindow.style.display = 'flex';
      document.getElementById('editor').style.minWidth = 'calc(100% - (15% + 20px) - 300px)';
      requestAnimationFrame(() => {
        induWindow.setAttribute('data-status', 'open');
        requestAnimationFrame(() => {
          layout();
        });
      });
    }
  });
});

filesContainer.addEventListener('click', (e) => {
    const fileEl = e.target.closest('.file');
    if (!fileEl) return;

    openSelectedFile(fileEl);
});

// Load files on DOM ready
window.addEventListener('DOMContentLoaded', async () => {
  if (editor.innerHTML !== "" && editor.innerHTML !== `
  <div class="welcome-message" id="welcomeMessage">
      <h1>Welcome to Lexius!</h1>
      <p>Create or open a file to get started.</p>
  </div>
  `) {
    document.querySelector(".language").style.display = "block";
  }
  else {
    document.querySelector(".language").style.display = "none";
  }
  navbar()
  setInterval(async () => {
  if (window.monacoReady === true && window.editorInstance) {
    window.editorInstance.onDidChangeModelContent(() => {
    if (!isAutoSaveEnabled) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout( async () => {
      await autoSave();
      
      console.log(runIds.length);
      if (runIds.length !== 0) {
        console.log(runIds.length);
        run(window.editorInstance.getValue(), document.querySelector('#language').textContent.trim());
    }
    }, 2000); // 2s debounce AFTER last change
    });
  }}, 50);
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
  // // Wait for Monaco to be ready
  // await new Promise(resolve => {
  //   const wait = () => window.monacoReady ? resolve() : setTimeout(wait, 50);
  //   wait();
  // });

  // lucide.createIcons();

  // const induInputField = document.getElementById('induInput');
  // const chatDiv = document.getElementById("chat");

  // // Chat functionality
  // induInputField.addEventListener('keydown', async (e) => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault();
  //     const message = induInputField.value.trim();
  //     if (!message) return;

  //     // Hide header and add user message
  //     const header = document.querySelector('.header');
  //     if (header) {
  //       header.style.display = 'none';
  //     }

  //     const userMessage = document.createElement('div');
  //     userMessage.classList.add('message', 'user');
  //     userMessage.innerText = message;
  //     chatDiv.appendChild(userMessage);
  //     induInputField.value = '';

  //     // Add thinking message
  //     const thinkingEl = document.createElement('div');
  //     thinkingEl.classList.add('message', 'indu', 'typing');

  //     const induProfilePic = document.createElement('div');
  //     induProfilePic.classList.add('indu-icon');

  //     const induProfilePicImg = document.createElement('img');
  //     induProfilePicImg.classList.add('indu-icon-img');
  //     induProfilePicImg.src = '../../assets/images/indu.png';

  //     induProfilePic.appendChild(induProfilePicImg);

  //     const thinkingMessageEl = document.createElement('div');
  //     thinkingMessageEl.innerHTML = 'Indu is thinking...';

  //     thinkingEl.appendChild(induProfilePic);
  //     thinkingEl.appendChild(thinkingMessageEl);
  //     chatDiv.appendChild(thinkingEl);
  //     chatDiv.scrollTop = chatDiv.scrollHeight;

  //     const files = await getAllFiles();

  //     // Fetch and display response
  //     try {
  //       const res = await sendMessage(message, files);
  //       const cleanedRes = res.replace(/<think>.*?<\/think>/gs, "").replace(/<p><\/p>/, "");
  //       const html = marked.parse(cleanedRes || "Sorry, I didn't understand that.");
  //       thinkingMessageEl.innerHTML = html;

  //       hljs.highlightAll();
  //       chatDiv.scrollTop = chatDiv.scrollHeight;

  //       // Add copy button to all code blocks
  //       thinkingMessageEl.querySelectorAll('pre code').forEach((block) => {
  //         const pre = block.parentElement;
  //         pre.style.position = 'relative';

  //         const copyBtn = document.createElement('button');
  //         copyBtn.className = 'copy-code-btn';
  //         copyBtn.innerHTML = '<i data-lucide="copy"></i> copy';

  //         // Add copy logic
  //         copyBtn.addEventListener('click', () => {
  //           navigator.clipboard.writeText(block.innerText).then(() => {
  //             copyBtn.innerHTML = '<i data-lucide="check"></i> copied';
  //             lucide.createIcons();
  //             setTimeout(() => {
  //               copyBtn.innerHTML = '<i data-lucide="copy"></i> copy';
  //               lucide.createIcons();
  //             }, 2000);
  //           });
  //         });

  //         pre.appendChild(copyBtn);
  //       });

  //       lucide.createIcons();
  //     } catch (err) {
  //       thinkingMessageEl.innerHTML = err.message;
  //     }
  //   }
  // });

  // Initialize autosave
  if (localStorage.getItem('autosave') === 'true') {
    const autosaveCheck = document.getElementById('autosave-check');
    if (autosaveCheck) {
      if (isElectron === true && filePermission === true) {
        autosaveCheck.classList.add('false');
        autosaveCheck.addEventListener('click', () => {
          localStorage.setItem('autosave', 'true');
          autosaveCheck.classList.remove('false');
          autosaveCheck.classList.add('true');
        });
      }
      else {
        autosaveCheck.classList.add('true');
      }
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
  setTimeout(async () => {
    const selectedFile = document.querySelector('.selected');
    if (selectedFile) {
      const fileName = selectedFile.innerText;
      deleteFile(fileName);
    }
  }, 3000);
  openFile();
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

document.getElementById('activateTerminal').addEventListener('click', () => {
  if (!document.querySelector('.terminal')) return;
  if (document.querySelector('.terminal').style.display === 'none') {
    document.querySelector('.terminal').style.display = 'block';
  } else {
    document.querySelector('.terminal').style.display = 'none';
  }
});

document.getElementById("runCode").addEventListener("click", () => {
  if (!window.editorInstance) return;
  if (!window.editorInstance.getValue) return;
  console.log(window.editorInstance.getValue(), document.querySelector('#language').textContent.trim());
  run(window.editorInstance.getValue(), document.querySelector('#language').textContent.trim());
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
    updateToggleIcon(null, null, newTheme);
    requestAnimationFrame(() => {
      layout();
    });
  });
}

toggleBtn?.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  document.body.classList.remove("dark", "light");
  document.body.classList.add(newTheme);
  localStorage.setItem("theme", newTheme);
  updateToggleIcon(null, null, newTheme);
  requestAnimationFrame(() => {
    layout();
  });
});



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
      requestAnimationFrame(() => {
        layout();
      });
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
    editor.style.width = 'calc(100% - 58px)';
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

// New file creation
document.getElementById('newFileCtx')?.addEventListener('click', async () => {
  const name = Prompt('Enter new file name', '');
  if (name) {
    const newFile = createFile(name);
    const icon = returnFileIcon(name);
    newFile.querySelector('img').src = icon;
    newFile.querySelector('img').alt = `Icon for ${name}`;
    localStorage.setItem(name, '');
    await saveFile(name, '');
  }
});

// New file creation
document.getElementById('newFile')?.addEventListener('click', async () => {
  const name = Prompt('Enter new file name', '');
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
  if (!clickedFileEl) return;

  const fileNameEl = clickedFileEl.querySelector('.fileName');
  const oldName = fileNameEl.textContent.trim();

  fileNameEl.innerHTML = `<input type="text" class="rename-input" value="${oldName}" />`;

  const input = fileNameEl.querySelector('input');
  input.focus();
  input.select();

  function outsideClickHandler(event) {
    if (!fileNameEl.contains(event.target)) {
      cleanup(oldName);
    }
  }

  function cleanup(nameToRestore) {
    document.removeEventListener('mousedown', outsideClickHandler);
    fileNameEl.textContent = nameToRestore;
  }

  document.addEventListener('mousedown', outsideClickHandler);

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const files = await getAllFiles()
      if (files.some(f => f.path === input.value.trim())) {
        warn('error', 'A file with that name already exists.');
      }
      const newName = input.value.trim() || 'Untitled';
      const content = localStorage.getItem(oldName) || '';

      if (newName !== oldName) {
        localStorage.setItem(newName, content);
        localStorage.removeItem(oldName);
        await saveFile(newName, content);
        await deleteFile(oldName);
      }

      document.removeEventListener('mousedown', outsideClickHandler);
      fileNameEl.textContent = newName;
      const img = filesContainer.querySelector('.file .fileIcon img');
      if (img) {
        img.src = returnFileIcon(newName);
      }
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      cleanup(oldName);
    }
  });
});

// File deletion
document.getElementById('deleteFile')?.addEventListener('click', async () => {
  if (clickedFileEl) {
    if (isAutoSaveEnabled === true) {
      isAutoSaveEnabled = false
      const name = clickedFileEl.querySelector('.fileName').textContent.trim();
      if (confirm(`Delete "${name}"?`)) {
        localStorage.removeItem(name);
        deleteFile(name);
        if (window.editorInstance) window.editorInstance.dispose();
        clickedFileEl.style.display = 'none';
        isAutoSaveEnabled = true
      }
    }
    else {
      const name = clickedFileEl.querySelector('.fileName').textContent.trim();
      if (confirm(`Delete "${name}"?`)) {
        localStorage.removeItem(name);
        deleteFile(name);
        window.editorInstance.dispose();
        clickedFileEl.style.display = 'none';
        isAutoSaveEnabled = true
      }
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
  const name = Prompt('Enter new folder name', 'NewFolder');
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

// New folder creation
document.getElementById('newFolderCtx')?.addEventListener('click', () => {
  const name = Prompt('Enter new folder name', 'NewFolder');
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
  if (editor || isWelcomeMessageActive === false && editor) {
    editor.innerHTML = '';
    const currentTheme = localStorage.getItem('theme');
    initEditor(lang, value, currentTheme);
  }
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
    if (editor || isWelcomeMessageActive === false && editor) {
      editor.innerHTML = '';
      const currentTheme = localStorage.getItem('theme');
      initEditor(lang, value, currentTheme);
    }
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

/* @Functions  */

async function run(code, lang) {
  saveFile(document.querySelector('.selected').textContent.trim(), code)
  function generateId() {
    return Math.floor(Math.random() * (idLimit - min + 1)) + min;
  }
  let id;
  do {
    id = generateId();
  } while (runIds.includes(id));

  runIds.push(id);
  console.log(`run id: ${id}`)
  if (!Array.isArray(supportedLangs)) return;

  if (!supportedLangs.includes(lang)) {
    warn("language not supported yet, download the desktop version");
    return;
  }

  if (lang !== 'html' && lang !== 'svg' && lang !== 'markdown') {
    try {
      const res = await fetch(
        "https://lexius-transpiler.onrender.com/run",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code, lang }),
        }
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log(data, res);

      const exec = data.result ?? {};

      const stdout = exec.stdout ?? "";
      const stderr = exec.stderr ?? "";
      const result =
        exec.result !== undefined && exec.result !== null
          ? String(exec.result)
          : "";

      const output = [stdout, stderr, result]
        .filter(Boolean)
        .join("\n");

      terminalDisplay.innerHTML += `lexius ${document.getElementsByClassName("selected")[0].textContent}<p id="run-${id}"></p> $`;
      document.querySelector(`#run-${id}`).textContent = output;
    } catch (err) {
      terminalDisplay.textContent =
        "Error: " + (err.message || err);
    }
  } else {
    try {
      const htmlDisplay = document.querySelector(".codeWindow");
      if (lang === 'markdown') {
        code = marked.parse(code);
      }
      if (!htmlDisplayExists) {
        htmlDisplayExists = true
        const iframe = document.createElement('iframe');
        iframe.id = 'iframe';
        iframe.style.height = "100%";
        iframe.style.width = "100%";
        iframe.setAttribute("sandbox", "allow-scripts");
        htmlDisplay.style.display = 'flex';
        iframe.srcdoc = code;
        htmlDisplay.appendChild(iframe);
      } else {
         let iframe = document.getElementById("iframe");
         iframe.remove();
        const NewIframe = document.createElement('iframe');
        NewIframe.id = 'iframe';
        NewIframe.style.height = "100%";
        NewIframe.style.width = "100%";
        NewIframe.setAttribute("sandbox", "allow-scripts");
        htmlDisplay.style.display = 'flex';
        NewIframe.srcdoc = code;
        htmlDisplay.appendChild(iframe);
       }
    } catch (err) {
        console.error(err)
    }
  }
}

async function navbar() { 
  if (!isElectron) console.warn('Not running in Electron');
  const windowBtns = document.getElementById('windowBtns');
  if (!windowBtns) console.warn('No window buttons container found');
  windowBtns.style.display = 'block';
  const minimize = document.getElementById("minimize");
  const maximize = document.getElementById("maximize");
  const close = document.getElementById("close");
  maximize.addEventListener('click', () => {
    window.env.maximize();
  });
  minimize.addEventListener('click', () => {
    window.env.minimize();
  });
  close.addEventListener('click', () => {
    window.env.close();
  });
}

function Welcome() {
  if (!editor) return;
  if (noFiles) return;
  if (getAllFiles().length > 0) return;
  if (document.getElementById('welcomeMessage')) return;
  if (editor.children.length > 0) return;

  // Remove existing welcome message if any
  const oldWelcome = document.getElementById('welcomeMessage');
  if (oldWelcome) oldWelcome.remove();

  editor.innerHTML = `
  <div class="welcome-message" id="welcomeMessage">
      <h1>Welcome to Lexius!</h1>
      <p>Create or open a file to get started.</p>
  </div>
  `

  // // Create welcome message
  // const welcomeEl = document.createElement('div');
  // welcomeEl.id = 'welcomeMessage';
  // welcomeEl.className = 'welcome-message';
  // welcomeEl.innerHTML = `
  //   <h1>Welcome to Lexius!</h1>
  //   <p>Create or open a file to get started.</p>
  // `;

  // Apply theme color
  const theme = localStorage.getItem('theme') === 'dark' ? '#fff' : '#fff';
  welcomeEl.style.color = theme;

  // Append instead of replacing
  editor.appendChild(welcomeEl);
  isWelcomeMessageActive = true;
}

function warn(type, message) {
  const messageBox = document.getElementById('prompt');
  const messageBoxMessage = document.createElement('div');
  const messageBoxIcon = document.createElement('div');
  const messageBoxIconImage = document.createElement('img');

  if (!messageBox) return;
  if (messageBox) {
    messageBox.style.display = 'block';

    messageBox.appendChild(messageBoxMessage);
    messageBox.appendChild(messageBoxIcon);
    messageBoxIcon.appendChild(messageBoxIconImage);

    messageBoxMessage.textContent = message;
    switch (type) {
      case 'error':
        messageBoxIconImage.src = './assets/images/error.svg';
      case 'info':
        messageBoxIconImage.src = './assets/images/info.svg';
      case 'warn':
        messageBoxIconImage.src = './assets/images/warn.svg';
    }
  }
}

function Prompt() {
  const promptInputEl = document.createElement("div");
  const promptInputIcon = document.createElement("div");
  const promptInputIconImage = document.createElement("img");
  const promptInputElement = document.createElement("div");
  const input = document.createElement("input");

  promptInputEl.className = "file";
  promptInputIcon.className = "fileIcon";
  promptInputElement.className = "fileName";

  filesContainer.appendChild(promptInputEl);
  promptInputEl.appendChild(promptInputIcon);
  promptInputEl.appendChild(promptInputElement);
  promptInputElement.appendChild(input);
  promptInputIcon.appendChild(promptInputIconImage);

  input.focus();

  function cleanup() {
    document.removeEventListener("mousedown", outsideClickHandler);
    promptInputEl.remove();
  }

  function outsideClickHandler(e) {
    if (!promptInputEl.contains(e.target)) {
      cleanup();
    }
  }

  document.addEventListener("mousedown", outsideClickHandler);

  input.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const fileName = input.value.trim() || "Untitled";

      const files = await getAllFiles(); // ✅ await here

      const exists = files.some(f => f.path === fileName);

      if (exists) {
        console.warn("error", "A file with that name already exists.");
        return;
      }

      document.removeEventListener("mousedown", outsideClickHandler);

      saveFile(fileName, "");
      promptInputIconImage.src = returnFileIcon(fileName);

      promptInputElement.textContent = fileName;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      cleanup();
    }
  });
}

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

  initEditor(lang, code, currentTheme);
  hljs.highlightAll();
}

// Auto-save functionality
async function autoSave() {
  if (isAutoSaveEnabled === false) return;

  const selectedEl = document.getElementsByClassName('selected')[0];
  if (!selectedEl || !window.editorInstance) return;

  const fileName = selectedEl.innerText.trim();
  const value = window.editorInstance.getValue();

  const files = await getAllFiles()

  if (value !== files.some(f => f.path === fileName) && null !== files.some(f => f.path === fileName)) {
    localStorage.setItem(fileName, value);
    if (isElectron) {
      await saveFile(fileName, value, filePath);
      console.log(`Auto-saved ${fileName}`);
    }
    await saveFile(fileName, value);
    console.log(`Auto-saved ${fileName}`);
  }
}

function updateToggleIcon(lang, value, theme) {
  if (!toggleImg) return;
  toggleImg.src = theme === "dark"
    ? "./assets/images/dark.svg"
    : "./assets/images/light.svg";
  toggleImg.alt = theme === "dark" ? "Light Mode Icon" : "Dark Mode Icon";
  if (window?.editorInstance) {
    layout(lang, value, theme);
  }
}

function openSelectedFile(fileEl) {
  const name = fileEl.querySelector('.fileName')?.textContent?.trim();
  if (!fileEl) {
      Welcome();
  }
    else {
      if (!name) return;

      document.querySelectorAll('.file').forEach(f => f.classList.remove('selected'));
      fileEl.classList.add('selected');

      const lang = DetectFileType(name);
      const value = localStorage.getItem(name) || '';

      const editor = document.getElementById('editor');
      if (editor) editor.innerHTML = '';

      const theme = localStorage.getItem('theme');
      initEditor(lang, value, theme);
     }
}

function openFile() {
  const fileEl = document.querySelector('.file.selected');
  if (!fileEl) {
      Welcome();
  }
  else {
    const name = fileEl.querySelector('.fileName')?.textContent?.trim();
    if (!name) return;

    const lang = DetectFileType(name);
    const value = localStorage.getItem(name) || '';

    const editor = document.getElementById('editor');
    if (editor) editor.innerHTML = '';

    const currentTheme = localStorage.getItem('theme');
    initEditor(lang, value, currentTheme);
  }
}



async function initEditor(lang, value, theme) {
  await loadMonaco();

  const editorEl = document.getElementById('editor');
  document.querySelector(".language").style.display = "block";
  document.querySelector("#language").innerText = lang;
  if (!editorEl) {
    console.error('Editor element not found!');
    return;
  }

  monaco(lang, value);
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
  const base = "./assets/images/langs/";
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