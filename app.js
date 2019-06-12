const electron = require('electron');
const {app, BrowserWindow} = electron;
const path = require('path')

let mainWindow;

function startElectron() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'gui', 'preload.js') // this has node access
        }
    });
    
    mainWindow.loadFile(path.join(__dirname, 'gui', 'index.html'));
}

app.on('ready', startElectron);

app.on('window-all-closed', function () {
    app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
  })