const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    icon: path.join(__dirname, '../build/icons/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Large enough to show phone mockup + map editor
    resizable: true,
    backgroundColor: '#000000'
  });

  // In development, load from Vite dev server
  // In production, load from built files
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Set dock icon on macOS
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, '../build/icons/icon.png'));
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
