const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');

let win;
const isElectron = !!process.versions.electron;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
    },
    icon: 'assets/images/lexius.png',
    autoHideMenuBar: true
  });

  win.loadFile('index.html');
});

ipcMain.handle('writeFile', async (_, { path, content }) => {
  await fs.promises.writeFile(path, content, 'utf8');
  return true;
});
ipcMain.handle('readFile', async (_, path) => {
  const content = await fs.promises.readFile(path, 'utf8');
  return content;
});

ipcMain.handle('minimize', () => {
  if (win) {
    win.minimize();
  }
});

ipcMain.handle('maximize', () => {
  if (win) {
    if (!win.isMaximized()) {
      win.maximize();   // fills screen, keeps taskbar & window chrome
    } else {
      win.unmaximize(); // optional: toggle back
    }
  }
});


ipcMain.handle('close', () => {
  if (win) {
    win.close();
  }
});

if (!app.isPackaged) {
  require("electron-reload")(__dirname, {
    ignored: /node_modules|\.git|dist|build/,
  });
}

// the minimize, fullscreen, and close are written by vs code's ai asistant