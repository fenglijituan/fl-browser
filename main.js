const { app, BrowserWindow, ipcMain, Menu, dialog, session } = require('electron');
const path = require('path');
const fs = require('fs');

let windows = [];
let loadedExtensions = {};
let updater = null;

let EXTENSIONS_DATA_FILE;

function loadExtensionsData() {
  try {
    if (fs.existsSync(EXTENSIONS_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(EXTENSIONS_DATA_FILE, 'utf8'));
    }
  } catch (e) { console.error('Failed to load extensions data:', e); }
  return [];
}

function saveExtensionsData(data) {
  try {
    fs.writeFileSync(EXTENSIONS_DATA_FILE, JSON.stringify(data, null, 2));
  } catch (e) { console.error('Failed to save extensions data:', e); }
}

async function loadExtensionForAllWindows(extPath, extId) {
  try {
    const ext = await session.defaultSession.extensions.loadExtension(extPath, { allowFileAccess: true });
    loadedExtensions[extId || ext.id] = { id: ext.id, name: ext.name, version: ext.version, path: extPath, enabled: true };
    saveExtensionsData(Object.values(loadedExtensions));
    return ext;
  } catch (e) { console.error('Failed to load extension:', e); throw e; }
}

function createWindow(isPrivate = false) {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    title: isPrivate ? 'FL Browser - InPrivate' : 'FL Browser',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      devTools: true
    },
    show: false,
    frame: false,
    backgroundColor: isPrivate ? '#121212' : '#202124'
  });

  win.loadFile('index.html');
  win.webContents.openDevTools({ mode: 'detach' });

  win.once('ready-to-show', () => {
    win.show();
    if (isPrivate) {
      win.webContents.send('private-mode', true);
    }
  });

  win.on('maximize', () => win.webContents.send('maximize-changed', true));
  win.on('unmaximize', () => win.webContents.send('maximize-changed', false));

  win.on('closed', () => {
    windows = windows.filter(w => w !== win);
  });

  windows.push(win);
  return win;
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  ipcMain.on('min', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.minimize();
  });

  ipcMain.on('max', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.on('close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.close();
  });

  ipcMain.on('toggle-fullscreen', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const willBeFull = !win.isFullScreen();
      win.setFullScreen(willBeFull);
      event.sender.send('fullscreen-changed', willBeFull);
    }
  });

  ipcMain.on('new-window', () => createWindow(false));
  ipcMain.on('new-private-window', () => createWindow(true));

  ipcMain.on('dev-tools', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.webContents.toggleDevTools();
  });

  ipcMain.on('print', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) win.webContents.print({ printBackground: true });
  });

  ipcMain.handle('show-open-dialog', async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) return dialog.showOpenDialog(win, options);
    return { canceled: true, filePaths: [] };
  });

  ipcMain.handle('show-save-dialog', async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) return dialog.showSaveDialog(win, options);
    return { canceled: true, filePath: '' };
  });

  ipcMain.handle('load-extension', async (event, extPath) => {
    try {
      const ext = await loadExtensionForAllWindows(extPath);
      return { success: true, id: ext.id, name: ext.name, version: ext.version };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('remove-extension', async (event, extId) => {
    try {
      session.defaultSession.extensions.removeExtension(extId);
      delete loadedExtensions[extId];
      saveExtensionsData(Object.values(loadedExtensions));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('get-all-extensions', async () => {
    const all = session.defaultSession.getAllExtensions();
    return all.map(e => ({ id: e.id, name: e.name, version: e.version, path: e.path }));
  });

  ipcMain.handle('toggle-extension', async (event, extId) => {
    if (loadedExtensions[extId]) {
      if (loadedExtensions[extId].enabled) {
        session.defaultSession.extensions.removeExtension(extId);
        loadedExtensions[extId].enabled = false;
      } else {
        await loadExtensionForAllWindows(loadedExtensions[extId].path, extId);
      }
      saveExtensionsData(Object.values(loadedExtensions));
      return { success: true, enabled: loadedExtensions[extId].enabled };
    }
    return { success: false, error: 'Extension not found' };
  });

  createWindow(false);

  EXTENSIONS_DATA_FILE = path.join(app.getPath('userData'), 'extensions.json');

  const savedExts = loadExtensionsData();
  for (const ext of savedExts) {
    if (ext.enabled && fs.existsSync(ext.path)) {
      loadExtensionForAllWindows(ext.path, ext.id).catch(e => console.error('Auto-load ext failed:', ext.name, e));
    }
  }

  try {
    const AutoUpdater = require('./updater');
    updater = new AutoUpdater();
    
    ipcMain.handle('check-for-updates', async () => {
      return updater.checkForUpdates(true);
    });

    ipcMain.handle('download-update', async (event, info) => {
      return updater.downloadAndInstall(info);
    });

    updater.checkForUpdates(false).catch(() => {});
  } catch(e) {
    console.log('Updater not available');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow(false);
});
