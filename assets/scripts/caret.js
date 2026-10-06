import { getWorkspaceName, getWorkspace, saveFile } from './db.js';
import Caret from '/node_modules/@pfmcodes/caret/index.js';

let caretInstance = null;

export async function loadCaret() {
  // Package is installed locally; no CDN load needed
  return;
}

export async function caret(lang, value) {
  const editorEl = document.getElementById('editor');
  if (!editorEl) {
    console.error('Editor element not found!');
    return;
  }
  
  // Previous instance DOM cleared by innerHTML=''; skip delete() to avoid package error
  editorEl.innerHTML = '';
  caretInstance = null;
  
  const isDark = localStorage.getItem('theme') === 'dark';
  
  caretInstance = await Caret.createEditor(editorEl, value || '', {
    id: 'caret-' + Date.now(),
    language: lang || 'javascript',
    dark: isDark,
    shadow: true,
    hlTheme: isDark ? 'atom-one-dark' : 'github'
  });

  window.editorInstance = caretInstance;
  window.setCaretTheme = async (theme) => {
    if (caretInstance && caretInstance.setTheme) {
      await caretInstance.setTheme(theme === 'dark' ? 'atom-one-dark' : 'github');
    }
  };
  
  // Auto-save on change
  caretInstance.onChange((text) => {
    const currentFile = document.querySelector('.selected');
    if (currentFile) {
      const fileName = currentFile.querySelector('.fileName')?.textContent?.trim();
      if (fileName) {
        saveFile(fileName, text, fileName, getWorkspaceName())
      }
    }
  });
  
  return caretInstance;
}

export function prettifyCode() {
  // No-op; caret uses highlight.js for syntax, not Prettier
  console.log('Prettify not available for Caret editor');
}

export function setCaretTheme(theme) {
  if (window.setCaretTheme) {
    window.setCaretTheme(theme);
  }
}

function deleteCaret() {
  caretInstance.delete();
  caretInstance = null;
}

export function getCaretInstance() {
  return caretInstance;
}
