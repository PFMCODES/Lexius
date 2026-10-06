import { setTheme } from "./theme.js";
import { getAllWorkspaces, createWorkspace, deleteWorkspace, switchWorkspace, getProjectName, getWorkspace, getWorkspaceName } from "./db.js";

const themeToggle = document.getElementById('Theme');
const fileToggle = document.getElementById('File');
const workspacesToggle = document.getElementById('Workspaces');
const personalizationToggle = document.getElementById('Personalization');
const options = document.querySelector(".themeOptions");
const fileOptions = document.querySelector(".fileBtnOptions");
const workspacesOptions = document.querySelector(".workspacesOptions");
const personalizationOptions = document.querySelector(".personalizationOptions");

document.addEventListener('mousemove', (event) => {
  if (!themeToggle.contains(event.target) && !options.contains(event.target)) {
    options.classList.remove('show');
  }
  if (!fileToggle.contains(event.target) && !fileOptions.contains(event.target)) {
    fileOptions.classList.remove('show');
  }
  if (!workspacesToggle.contains(event.target) && !workspacesOptions.contains(event.target)) {
    workspacesOptions.classList.remove('show');
  }
  if (!personalizationToggle.contains(event.target) && !personalizationOptions.contains(event.target)) {
    personalizationOptions.classList.remove('show');
  }
});

themeToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  options.classList.toggle('show');
});

const kl = document.querySelector(".themeOptions.Options");
kl.querySelectorAll(".clickable.option").forEach((c) => {
  c.addEventListener("click", () => {
    const theme = c.textContent.trim().toLowerCase();
    setTheme(theme === "system default" ? "system" : theme);
  });
});

workspacesToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  workspacesOptions.classList.toggle('show');
  loadWorkspaces();
});

personalizationToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  personalizationOptions.classList.toggle('show');
  loadEditorPreference();
});

fileToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  fileOptions.classList.toggle('show');
});

// Load workspaces into dropdown
async function loadWorkspaces() {
  if (!workspacesOptions) return;
  
  const workspaces = await getAllWorkspaces();
  const currentWorkspaceName = new URLSearchParams(window.location.search).get('workspaceName') || 'default';
  
  workspacesOptions.innerHTML = '';
  
  // Add "New Workspace" option
  const newWs = document.createElement('div');
  newWs.className = 'clickable option btn btn--ghost btn--sm';
  newWs.innerHTML = '<i class="codicon codicon-add"></i> New Workspace';
  newWs.addEventListener('click', async () => {
    const name = prompt('Enter workspace name:');
    if (name) {
      const ws = await createWorkspace(name);
      switchWorkspace(ws.name);
    }
  });
  workspacesOptions.appendChild(newWs);
  
  // Add separator
  const sep = document.createElement('div');
  sep.className = 'seperator';
  workspacesOptions.appendChild(sep);
  
  // Add existing workspaces
  for (const ws of workspaces) {
    const wsEl = document.createElement('div');
    wsEl.className = 'clickable option btn btn--ghost btn--sm workspace-item';
    wsEl.dataset.workspaceName = ws.name;
    wsEl.innerHTML = `
      <span>${ws.name}</span>
      <button class="workspace-delete" data-workspace-id="${ws.name}" title="Delete workspace">
        <i class="codicon codicon-trash"></i>
      </button>
    `;
    
    // Click to switch workspace
    wsEl.querySelector('span').addEventListener('click', () => {
      switchWorkspace(ws.name);
    });
    
    // Delete button
    wsEl.querySelector('.workspace-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Delete workspace "${ws.name}"?`)) {
        await deleteWorkspace(ws.name);
        loadWorkspaces();
      }
    });
    
    // Highlight current workspace
    if ((ws.name) === currentWorkspaceName) {
      wsEl.classList.add('active');
    }
    
    workspacesOptions.appendChild(wsEl);
  }
}

// Load editor preference into dropdown
function loadEditorPreference() {
  if (!personalizationOptions) return;
  
  const savedEditor = localStorage.getItem('editor') || 'caret';
  
  const options = personalizationOptions.querySelectorAll('.clickable.option[data-editor]');
  options.forEach(opt => {
    const isActive = opt.dataset.editor === savedEditor;
    opt.classList.toggle('active', isActive);

  });
  if (window.lucide) lucide.createIcons();
}

// Handle editor selection
personalizationOptions?.querySelectorAll('.clickable.option[data-editor]').forEach(opt => {
  opt.addEventListener('click', async () => {
    const editor = opt.dataset.editor;
    localStorage.setItem('editor', editor);
    
  personalizationOptions?.querySelectorAll('.clickable.option[data-editor]').forEach(o => {
    o.addEventListener('click', async () => {
      const editor = o.dataset.editor;
      localStorage.setItem('editor', editor);
      // Remove all old checkmarks first
      personalizationOptions.querySelectorAll('.clickable.option[data-editor] [data-lucide="check"]').forEach(i => i.remove());
      personalizationOptions.querySelectorAll('.clickable.option[data-editor]').forEach(opt => {
        const active = opt.dataset.editor === editor;
        opt.classList.toggle('active', active);
        if (active) {
          const i = document.createElement('i');
          i.setAttribute('data-lucide', 'check');
          i.style.cssText = 'margin-left:6px;width:14px;height:14px;display:inline-block;vertical-align:middle;';
          opt.appendChild(i);
        }
      });
      if (window.lucide) lucide.createIcons();
      const selectedFile = document.querySelector('.selected');
      if (selectedFile) {
        const fileName = selectedFile.querySelector('.fileName')?.textContent?.trim();
        const lang = window.DetectFileType ? window.DetectFileType(fileName || 'new.js') : 'javascript';
        const value = fileName ? (localStorage.getItem(fileName) || '') : '';
        const theme = localStorage.getItem('theme') || 'light';
        if (window.initEditor) await window.initEditor(lang, value, theme);
      }
    });
  });
    // Reinitialize editor with new choice
    if (window.initEditor) {
      const selectedFile = document.querySelector('.selected');
      if (selectedFile) {
        const fileName = selectedFile.querySelector('.fileName')?.textContent?.trim();
        if (fileName) {
          const lang = window.DetectFileType ? window.DetectFileType(fileName) : 'javascript';
          const value = localStorage.getItem(fileName) || '';
          const theme = localStorage.getItem('theme') || 'light';
          await window.initEditor(lang, value, theme);
        }
      }
    }
    
    // Close dropdown
    personalizationOptions.classList.remove('show');
  });
});

// Set project name from workspace
document.addEventListener('DOMContentLoaded', async () => {
  const projectNameEl = document.getElementById('ProjectName');
  if (projectNameEl) {
    const workspaceName = getWorkspaceName();
    projectNameEl.innerHTML = `<p class="text-ghost">Project Name:</p> ${workspaceName || 'Untitled'}`;
  }
  
  // Load initial editor preference
  loadEditorPreference();
});

// Export for use in other modules
export function getCurrentEditor() {
  return localStorage.getItem('editor') || 'caret';
}
