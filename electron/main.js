const { app, BrowserWindow, protocol, net } = require('electron');
const path = require('path');
const fs   = require('fs');

// Must register before app.ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

// Single instance lock — pass deep link to existing instance on Windows
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    const link = argv.find(a => a.startsWith('nextstep://'));
    if (link) broadcast('deep-link', link);
    const win = BrowserWindow.getAllWindows()[0];
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width:   480,
    height:  900,
    minWidth: 390,
    minHeight: 700,
    backgroundColor: '#0a0d1a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadURL('app://./');
  return win;
}

function broadcast(channel, ...args) {
  BrowserWindow.getAllWindows().forEach(w => w.webContents.send(channel, ...args));
}

app.whenReady().then(() => {
  // Serve the Next.js static export via app:// scheme
  protocol.handle('app', (request) => {
    const { pathname } = new URL(request.url);
    const outDir = path.join(__dirname, '../out');

    // Candidate file paths to try in order
    const candidates = [
      path.join(outDir, pathname === '/' ? 'index.html' : pathname.replace(/^\//, '')),
      path.join(outDir, pathname.replace(/^\//, ''), 'index.html'),
      path.join(outDir, 'index.html'), // SPA fallback
    ];

    const file = candidates.find(p => {
      try { return fs.statSync(p).isFile(); } catch { return false; }
    }) ?? candidates[candidates.length - 1];

    return net.fetch('file://' + file);
  });

  // Register nextstep:// deep-link protocol
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('nextstep', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('nextstep');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// macOS: deep link while app is already running
app.on('open-url', (event, url) => {
  event.preventDefault();
  broadcast('deep-link', url);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
