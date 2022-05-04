const { app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')

const thePath = app.getPath('userData')
ipcMain.on('bringLink', (ee, argu)=> {
    ee.returnValue = thePath
})//ee is the event and we dont need to do anything with the argument

//initialising the app
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 650,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload.js'),
            enableRemoteModule: false //remove it and see what happens
        }
    })
    win.loadFile('index.html')
    console.log('')
}
app.on('ready', () => {createWindow()})
app.on('window-all-closed', ()=> {
    if (process.platform !== "darwin") app.quit();
});
app.on('activate', ()=> {
    if (BrowserWindow.getAllWindows().length === 0) loadMainWindow();
})