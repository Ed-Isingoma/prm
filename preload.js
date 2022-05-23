const {ipcRenderer, contextBridge} = require('electron')
const fs = require('fs')

ipcRenderer.on('clicked', (e, message)=> {
    const details = message.split(' ')
    if (details[0] === 'editEntry') {
        document.querySelector('.saveEdited').dataset.stamp = details[1]
        document.querySelector('.saveEdited').dispatchEvent(new Event('editEntry'))
    } else if (details[0] === 'deleteEntry') {
        deleteEntry(details[1])
    } else if (details[0] === 'printSelection') {
        const theTxt = window.getSelection()
        if (document.querySelector('.table2').contains(theTxt.anchorNode.parentElement) && document.querySelector('.table2').contains(theTxt.focusNode.parentElement)) {
            theTxt.anchorNode.dispatchEvent(new Event('anchStamp', {bubbles: true}))
            theTxt.focusNode.dispatchEvent(new Event('focusStamp', {bubbles: true}))
        } else {
            document.querySelector('.teller').dispatchEvent(new Event('dontPrint'))
        }
    } else if (details[0] === 'copy') {
        const theTxt = window.getSelection()
        navigator.clipboard.writeText(theTxt)
    } else if (details[0] === 'selectAll') {
        const selectn = document.querySelectorAll('.table2 > .row')
        const xSelectn = []
        selectn.forEach(e=> {
            if (e.style.display === "flex") xSelectn.push(e)
        })
        window.getSelection().setBaseAndExtent(xSelectn[0], 0, xSelectn[xSelectn.length-1].lastChild, 0)
    }
})

function deleteEntry(timestamp) {
    const verify = confirm("Confirm deletion of entry")
    if (verify) {
        document.querySelector('.table2').dataset.stamp = timestamp
        document.querySelector('.table2').dispatchEvent(new Event('delEntry'))
    }
}
ipcRenderer.on('miniMenu', (e, msg)=> {
    document.querySelector('.table1 .inputs').dataset.menuSlct = msg
    document.querySelector('.table1 .inputs').dispatchEvent(new Event('miniMenu'))
})
ipcRenderer.on('printPath', (e, link)=> {
    document.querySelector('.teller').dataset.message = link
    document.querySelector('.teller').dispatchEvent(new Event('printed'))
})

contextBridge.exposeInMainWorld('theDataPath', {
    renderer: {...ipcRenderer, on: ipcRenderer.on},
    fs: fs
})