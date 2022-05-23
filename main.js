const { app, BrowserWindow, ipcMain, Menu} = require('electron')
const fs = require('fs')
const path = require('path')

const thePath = app.getPath('userData')
ipcMain.on('bringLink', (ee, argu)=> {
    ee.returnValue = thePath
})

//concerning the second browserwindow
let strungArr;
ipcMain.on('printThis', (e, thePage, strArr, timestamp)=> {
    strungArr = strArr;
    fs.writeFileSync(__dirname + '/printable.html', thePage)
    const win = new BrowserWindow({
        width: 942,
        height: 595,
        show: false,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload.js'),
        }
    })
    win.loadFile('printable.html')
    win.webContents.on('did-finish-load', ()=> {
        win.webContents.printToPDF({
            printBackground: true,
            landscape: true
        }).then(data => {
            fs.writeFileSync(__dirname + '/' + timestamp + '.pdf', data)
            e.sender.send('printPath', __dirname + '/' + timestamp + '.pdf')
        }).then(()=> {win.close()}).catch(err => console.log('Failed to write pdf: ' + err))
    })

})
ipcMain.on('bringArr', (e, arg)=> {
    e.returnValue = strungArr
})

ipcMain.on('miniMenu', (e, id)=>{
    const template = [{
        label: 'Cut',
        click() {
            e.sender.send('miniMenu', 'cut ' + id)
        }
    }, {
        label: 'Copy',
        click(){
            e.sender.send('miniMenu', 'copy ' + id)
        }
    }, {
        label: 'Bold',
        click(){
            e.sender.send('miniMenu', 'bold ' + id)
        }
    }, {
        label: 'Select All',
        click() {
            e.sender.send('miniMenu', 'selectAll ' + id)
        }
    }, /*{
        label: 'Paste',
        click() {
            e.sender.send('miniMenu', 'paste ' + id)

        }
    }*/]
    const smallMenu = Menu.buildFromTemplate(template)
    smallMenu.popup(BrowserWindow.fromWebContents(e.sender))
})
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
        label: 'Copy',
        click() {
            e.sender.send('clicked', 'copy')
        }
    }, {
        label: 'Select all',
        click() {
            e.sender.send('clicked', 'selectAll')
        }
    }, {
        label: 'Print selection',
        click() {
            e.sender.send('clicked', 'printSelection')
        }
    }, /*{
        label: 'Settings',
        click() {
            e.sender.send('clicked', 'settings')
        }
    }*/]
    const theMenu = Menu.buildFromTemplate(template)
    theMenu.popup(BrowserWindow.fromWebContents(e.sender))
})

//initialising main browserWindow
let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1400,
        height: 680,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    })
    win.loadFile('xIndex.html')
    console.log('')
}
app.on('ready', () => {createWindow()})
app.on('window-all-closed', ()=> {
    if (process.platform !== "darwin") app.quit();
});
app.on('activate', ()=> {
    if (BrowserWindow.getAllWindows().length === 0) loadMainWindow();
})
ipcMain.on('quit', ()=> {app.quit()})
