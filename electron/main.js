const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const PORT = 3000;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'AFM Study Hub',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL(`http://localhost:${PORT}`);
  } else {
    win.loadFile(path.join(__dirname, '../.next/standalone/index.html'));
  }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
