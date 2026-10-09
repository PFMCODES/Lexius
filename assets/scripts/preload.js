// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('env', {
  isElectron: true,
  maximize: () => ipcRenderer.invoke('maximize'),
  minimize: () => ipcRenderer.invoke('minimize'),
  close: () => ipcRenderer.invoke('close')
});

// FS DISABLED
// contextBridge.exposeInMainWorld('fs', {
//   writeFile: (path, content) => ipcRenderer.invoke('writeFile', { path, content }),
//   readFile: (path) => ipcRenderer.invoke('readFile', path)
// });
