// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');

contextBridge.exposeInMainWorld('env', {
  isElectron: true,
  maximize: () => ipcRenderer.invoke('maximize'),
  minimize: () => ipcRenderer.invoke('minimize'),
  close: () => ipcRenderer.invoke('close')
});

contextBridge.exposeInMainWorld('fs', {
  writeFile: (path, content) =>
    ipcRenderer.invoke('save-file', { path, content }),
  readFile: (path) =>
    ipcRenderer.invoke('read-file', path)
});
