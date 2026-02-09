const { app, BrowserWindow } = require('electron'); const path = require('path');

function createWindow() { const mainWindow = new BrowserWindow({ width: 1366, height: 768, title: "NovaPOS - Sistema de Repuestos", backgroundColor: '#020617', webPreferences: { nodeIntegration: true, contextIsolation: false, }, });

const startUrl = path.join(__dirname, 'dist', 'index.html');

mainWindow.loadFile(startUrl).catch((err) => { console.error("Error al cargar el archivo:", err); });

mainWindow.setMenuBarVisibility(false); }

app.whenReady().then(() => { createWindow();

app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); }); });

app.on('window-all-closed', () => { if (process.platform !== 'darwin') { app.quit(); } });