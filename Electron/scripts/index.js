// scripts/index.js
const path = require('path');

// Load Monaco via loader.js (ensure you include loader.js properly in your HTML)
const monacoLoaderUrl = 'https://unpkg.com/monaco-editor@0.39.0/min/vs/loader.js';

// Dynamically load Monaco's editor
require([monacoLoaderUrl], function() {
  require.config({
    paths: {
      'vs': 'https://unpkg.com/monaco-editor@0.39.0/min/vs'
    }
  });

  require(['vs/editor/editor.main'], function() {
    const editor = monaco.editor.create(document.getElementById('editor'), {
      value: '',
      language: 'html',
      theme: 'vs-dark'
    });
  });
});

browserWindow.loadURL('https://unpkg.com')