const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');

let windows = [];

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

  // 打开开发者工具查看错误
  win.webContents.openDevTools({ mode: 'detach' });

  win.webContents.on('did-fail-load', (e, code, desc) => {
    console.error('[FAIL]', desc, e);
  });

  win.webContents.on('crashed', (e, killed) => {
    console.error('[CRASHED]', killed);
  });

  win.webContents.on('render-process-gone', (e, details) => {
    console.error('[RENDERER GONE]', details);
  });

  win.webContents.on('unresponsive', () => {
    console.error('[UNRESPONSIVE]');
  });

  win.webContents.on('devtools-opened', () => {
    console.log('[DEVTOOLS OPENED]');
  });

  win.webContents.on('console-message', (e, msg) => {
    console.log('[RENDERER CONSOLE]', msg);
  });

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
  console.log('[APP READY]');

  ipcMain.on('min', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    console.log('[IPC] min');
    if (win) win.minimize();
  });

  ipcMain.on('max', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    console.log('[IPC] max');
    if (win) win.isMaximized() ? win.unmaximize() : win.maximize();
  });

  ipcMain.on('close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    console.log('[IPC] close');
    if (win) win.close();
  });

  ipcMain.on('toggle-fullscreen', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    console.log('[IPC] toggle-fullscreen');
    if (win) {
      const willBeFull = !win.isFullScreen();
      win.setFullScreen(willBeFull);
      event.sender.send('fullscreen-changed', willBeFull);
    }
  });

  ipcMain.on('new-window', () => { console.log('[IPC] new-window'); createWindow(false); });
  ipcMain.on('new-private-window', () => { console.log('[IPC] new-private-window'); createWindow(true); });

  ipcMain.on('dev-tools', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    console.log('[IPC] dev-tools');
    if (win) win.webContents.toggleDevTools();
  });

  ipcMain.on('print', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    console.log('[IPC] print');
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

  createWindow(false);
});

app.on('window-all-closed', () => {
  console.log('[ALL WINDOWS CLOSED]');
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow(false);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});
