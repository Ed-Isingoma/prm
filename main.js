const { app, BrowserWindow, ipcMain, Menu, MenuItem} = require('electron')
const path = require('path')

const thePath = app.getPath('userData')
ipcMain.on('bringLink', (ee, argu)=> {
    ee.returnValue = thePath
})//ee is the event and we dont need to do anything with the argument

ipcMain.on('showMenu', (e, msg)=> {
    const template = [{
        label: 'Edit entry',
        click() {
            e.sender.send('clicked', 'editEntry ' + msg)
        }
    }, {
        label: 'Delete entry',
        click() {
            e.sender.send('clicked', 'deleteEntry ' + msg)
        }
    }, {
        label: 'Print selection',
        click() {
            e.sender.send('clicked', 'printSelection')
        }
    }, {
        label: 'Scroll to top',
        click() {
            e.sender.send('clicked', 'scrollToTop')
        }
    }, {
        label: 'Settings',
        click() {
            e.sender.send('clicked', 'settings')
        }
    }]
    const theMenu = Menu.buildFromTemplate(template)
    theMenu.popup(BrowserWindow.fromWebContents(e.sender))
})

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