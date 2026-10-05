import { setTheme } from "./theme.js";
import { getAllWorkspaces, createWorkspace, deleteWorkspace, switchWorkspace, getProjectName } from "./db.js";

const themeToggle = document.getElementById('Theme');
const fileToggle = document.getElementById('File');
const workspacesToggle = document.getElementById('Workspaces');
const options = document.querySelector(".themeOptions");
const fileOptions = document.querySelector(".fileBtnOptions");
const workspacesOptions = document.querySelector(".workspacesOptions");

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

fileToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  fileOptions.classList.toggle('show');
});

// Load workspaces into dropdown
async function loadWorkspaces() {
  if (!workspacesOptions) return;
  
  const workspaces = await getAllWorkspaces();
  const currentWorkspaceId = new URLSearchParams(window.location.search).get('workspaceId') || 'default';
  
  workspacesOptions.innerHTML = '';
  
  // Add "New Workspace" option
  const newWs = document.createElement('div');
  newWs.className = 'clickable option btn btn--ghost btn--sm';
  newWs.innerHTML = '<i class="codicon codicon-add"></i> New Workspace';
  newWs.addEventListener('click', async () => {
    const name = Prompt('Enter workspace name:');
    if (name) {
      const ws = await createWorkspace(name);
      switchWorkspace(ws.id);
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
    wsEl.dataset.workspaceId = ws.id;
    wsEl.innerHTML = `
      <span>${ws.name}</span>
      <button class="workspace-delete" data-workspace-id="${ws.id}" title="Delete workspace">
        <i class="codicon codicon-trash"></i>
      </button>
    `;
    
    // Click to switch workspace
    wsEl.querySelector('span').addEventListener('click', () => {
      switchWorkspace(ws.id);
    });
    
    // Delete button
    wsEl.querySelector('.workspace-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Delete workspace "${ws.name}"?`)) {
        await deleteWorkspace(ws.id);
        loadWorkspaces();
      }
    });
    
    // Highlight current workspace
    if (ws.id.toString() === currentWorkspaceId) {
      wsEl.classList.add('active');
    }
    
    workspacesOptions.appendChild(wsEl);
  }
}

// Set project name from workspace
document.addEventListener('DOMContentLoaded', () => {
  const projectNameEl = document.getElementById('ProjectName');
  if (projectNameEl) {
    const name = getProjectName();
    projectNameEl.innerHTML = `<p class="text-ghost">Project Name:</p> ${name}`;
  }
});