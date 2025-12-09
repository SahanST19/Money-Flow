const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        autoHideMenuBar: true,
        show: false // Don't show until ready
    });

    // Load the index.html of the app
    mainWindow.loadFile('index.html');

    // Show window when ready to prevent flashing
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Remove the default menu
    Menu.setApplicationMenu(null);

    // Emitted when the window is closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed (Windows & Linux)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// On macOS, re-create window when dock icon is clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
