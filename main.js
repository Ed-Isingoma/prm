const { app, BrowserWindow, ipcMain, Menu} = require('electron')
const fs = require('fs')
const path = require('path')

const thePath = app.getPath('userData')
ipcMain.on('bringLink', (ee, argu)=> {
    ee.returnValue = thePath
})
//initialising main browserWindow
let mainWin;
function createWindow() {
    mainWin = new BrowserWindow({
        width: 1100,
        height: 700,
        backgroundColor: 'rgb(185, 184, 255)',
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload.js')
        }
    })
    //mainWin.removeMenu()
    mainWin.maximize()
    mainWin.loadFile('xIndex.html')
}
app.on('ready', () => {createWindow()})
app.on('window-all-closed', ()=> {
    if (process.platform !== "darwin") app.quit();});
app.on('activate', ()=> {
    if (BrowserWindow.getAllWindows().length === 0) loadMainWindow();})
ipcMain.on('quit', ()=> {app.quit()})
//concerning the second browserwindow
let strungArr;
let printWin;
ipcMain.on('printThis', (e, thePage, strArr)=> {
    strungArr = strArr;
    fs.writeFileSync(thePath + '/printable.html', thePage)
    printWin = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload.js'),
        }
    })
    printWin.removeMenu()
    printWin.loadFile(thePath + '/printable.html')
})
ipcMain.on('doneLoading', (e, filename)=> {
    printWin.webContents.printToPDF({
        printBackground: true,
        landscape: true
    }).then(data => {
        fs.appendFileSync(path.join(app.getPath('documents'), filename + '.pdf'), data)
        mainWin.webContents.send('printPath', path.join(app.getPath('documents'), filename + '.pdf'))
        e.sender.send('printInfo', 'Finished writeFileSync')
    }).then(()=> {printWin.close()}).then(()=>{fs.unlinkSync(thePath + '/printable.html')}).catch(err =>e.sender.send('printInfo', err))
})
ipcMain.on('databases',(e, arg1, arg2)=> {
    e.sender.send('databases', arg1, arg2)
})
let readResult = ''//the results of a read on the database
ipcMain.on('readResultIn', (e, res)=> {
    readResult = res
})
ipcMain.on('getReadResult', (e)=> {
    e.returnValue = readResult
})

ipcMain.on('bringArr', (e, arg)=> {
    e.returnValue = strungArr
})
//now the contextmenus
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