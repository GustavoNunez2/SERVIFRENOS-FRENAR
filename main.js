const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    title: "NovaPOS - Sistema de Repuestos",
    backgroundColor: '#020617',
    // EL ICONO: Asegúrate de que el archivo favicon.ico esté en la carpeta /public
    icon: path.join(__dirname, 'public', 'favicon.ico'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Ruta a los archivos compilados de Vite
  const startUrl = path.join(__dirname, 'dist', 'index.html');

  mainWindow.loadFile(startUrl).catch((err) => {
    console.error("Error al cargar el archivo:", err);
  });

  // Quitar la barra de herramientas (File, Edit, etc) para que parezca una app nativa
  mainWindow.setMenuBarVisibility(false);
  
  // Maximizar al abrir (opcional, muy cómodo para el negocio)
  // mainWindow.maximize(); 
}

// Solución para que los datos de IndexedDB sean persistentes en Windows
app.setAppLogsPath(); 

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});