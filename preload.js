const {ipcRenderer, contextBridge} = require('electron')
const fs = require('fs')
const path = require('path')

contextBridge.exposeInMainWorld('theDataPath', {
    renderer: ipcRenderer,
    fs: fs,
    path: path
})
