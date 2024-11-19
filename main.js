const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Remove the default menu bar
  Menu.setApplicationMenu(null); // This will hide the top bar options (e.g., File, Help, etc.)

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('open-admin-panel', () => {
  mainWindow.loadFile('admin.html');
});

ipcMain.on('open-receptionist-panel', () => {
  mainWindow.loadFile('receptionist.html');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

let userSession = null;

ipcMain.handle('set-session', (event, user) => {
  userSession = user;
});

ipcMain.handle('get-session', () => {
  return userSession;
});

