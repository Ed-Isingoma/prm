const {ipcRenderer, contextBridge} = require('electron')
const fs = require('fs')

ipcRenderer.on('clicked', (e, message)=> {
        const details = message.split(' ')
        if (details[0] === 'editEntry') {
            editEntry(details[1])
        } else if (details[0] === 'deleteEntry') {
            deleteEntry(details[1])
        } else if (details[0] === 'printSelection') {
            const theTxt = window.getSelection()
            theTxt.anchorNode.dispatchEvent(new Event('anchStamp', {bubbles: true}))
            theTxt.focusNode.dispatchEvent(new Event('focusStamp', {bubbles: true}))
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
let colorEvent = new Event('altColE')
let delEvent = new Event('delEntry')
function editEntry(timestamp) {
    const origin = [...document.querySelector(`[data-timestamp="${timestamp}"]`).children]
    const destinatn = [...document.querySelectorAll('.inputs textarea')]
    for (let i=0; i<destinatn.length; i++) {
        destinatn[i].value = origin[i].innerHTML
    }
    document.querySelector(`[data-timestamp="${timestamp}"]`).style.display = 'none';
    document.querySelector('.table2').dispatchEvent(colorEvent)
    window.scrollTo({top: 0})
    document.querySelector('.saveInput').style.display = 'none'
    document.querySelector('.saveEdited').style.display = 'inline'
    document.querySelector('.saveEdited').dataset.stamp = timestamp
    document.querySelector('.clearAll').style.display = 'none'
    document.querySelector('.cutEdit').style.display = 'inline'
}
function deleteEntry(timestamp) {
    const verify = confirm("Confirm deletion of entry")
    if (verify) {
        document.querySelector('.table2').dataset.stamp = timestamp
        document.querySelector('.table2').dispatchEvent(delEvent)
    }
}
ipcRenderer.on('miniMenu', (e, msg)=> {
    document.querySelector('.table1 .inputs').dataset.menuSlct = msg
    document.querySelector('.table1 .inputs').dispatchEvent(new Event('miniMenu'))
})

contextBridge.exposeInMainWorld('theDataPath', {
    renderer: {...ipcRenderer, on: ipcRenderer.on},
    fs: fs
})