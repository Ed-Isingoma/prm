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
let colorEvent = new Event('altColE')
let delEvent = new Event('delEntry')
function editEntry(timestamp) {
    const origin = [...document.querySelector(`[data-timestamp="${timestamp}"]`).children]
    const destinatn = [...document.querySelectorAll('.inputs textarea')]
    for (let i=0; i<destinatn.length; i++) {
        unBold2(destinatn[i], origin[i].innerHTML)
        //destinatn[i].value = origin[i].innerHTML
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
function unBold(destinatn, OriginHTML) {
    const wrds = OriginHTML.split('<b>')
    const value1 = wrds.reduce((prevVal, currVal)=> prevVal + currVal)
    const wrds2 = value1.split('</b>')
    const value2 = wrds2.reduce((prevVal, currVal)=> prevVal + currVal)
    destinatn.value = value2
}
function unBold2(destinatn, OriginHTML) {
    destinatn.value = ''
    const wrds = OriginHTML.split(' ')
    let chars = [];
    wrds.forEach(e=> chars.push(e.split('')))
    const charrs = chars.flat()
    for (let r=0; r<charrs.length; r++) {
       /* if (charrs[r-2] === '<' && charrs[r-3] === 'b' && charrs[r-4] === '>') {
            console.log('got you')
        } else if (charrs[r-2] === '<' && charrs[r-3] === '/' && charrs[r-4] === 'b' && charrs[r-5] === '>') {
            console.log('you next')
        }*/
        destinatn.value+= charrs[r]
    }
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
ipcRenderer.on('printPath', (e, link)=> {
    document.querySelector('.teller').dataset.message = link
    document.querySelector('.teller').dispatchEvent(new Event('printed'))
})

contextBridge.exposeInMainWorld('theDataPath', {
    renderer: {...ipcRenderer, on: ipcRenderer.on},
    fs: fs
})