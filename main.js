const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const fs = require('fs');
const path = require('path');

let win;
const isElectron = () => {
  if (process.versions.electron) {
    return true;
  }
};

protocol.registerSchemesAsPrivileged([
  { 
    scheme: 'lexius', 
    privileges: { 
      standard: true,     // Gives it a standard network-like structure
      secure: true,       // Bypasses certain mixed-content warnings
      corsEnabled: true,  // Fixes the exact CORS issue you are seeing
      supportFetchAPI: true 
    } 
  }
]);

app.commandLine.appendSwitch("ignore-certificate-errors");

app.whenReady().then(() => {

  protocol.registerFileProtocol("lexius", (request, callback) => {
    const parsed = new URL(request.url);

    let filePath = decodeURIComponent(parsed.pathname);

    if (filePath === "/") {
      filePath = "/index.html";
    }

    const root = path.resolve(__dirname);
    const target = path.resolve(root, `.${filePath}`);

    if (!target.startsWith(root + path.sep) && target !== root) {
      callback({ error: -6 });
      return;
    }
    callback({ path: target });
  });

  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: !app.isPackaged,
      preload: path.join(__dirname, "assets", "scripts", "preload.js")
    },
    icon: 'assets/images/lexius.png',
    autoHideMenuBar: true,
    frame: false,
  });
  win.loadURL("lexius://app/");;
  win.webContents.openDevTools();

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