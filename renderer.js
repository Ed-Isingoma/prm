const ipcRenderer = window.theDataPath.renderer
const fs = window.theDataPath.fs
//const path = window.theDataPath.path
//const {jsPDF} = window.theDataPath.jsPdf

const dataPath = ipcRenderer.sendSync('bringLink', '')
let searchArr;//this is the samplespace for when searching
document.querySelector('.table2').addEventListener('altColE', ()=> {altCol()})
document.querySelector('.table2').addEventListener('delEntry', ()=> {remEntry()})
//now, making the table2 divs alter colors
function altCol() {
    const selection = document.querySelectorAll('.table2 > .row')
    const xSelection = []
    selection.forEach(e=> {
        if (e.style.display === "flex") xSelection.push(e)
    })
        for(let r=0; r<xSelection.length; r+=2) {
            xSelection[r].querySelectorAll('div').forEach(s=> s.style.backgroundColor = "rgb(241, 241, 243)")
            if (xSelection[r+1]) xSelection[r+1].querySelectorAll('div').forEach(s=> s.style.backgroundColor = "lightgrey");
        }
}
pickEntries()
//concerning the context menus
function contextMenuDivs(e) {
    e.preventDefault()
    const msg = e.currentTarget.dataset.timestamp
    ipcRenderer.send('showMenu', msg)
}
document.querySelectorAll('.row > textarea').forEach(el=> {
    el.oncontextmenu = (e)=> {
        const msg = e.currentTarget.id
        ipcRenderer.send('miniMenu', msg)
    }
})
document.querySelector('.table1 .inputs').addEventListener('miniMenu', ()=> {
    const slctd = document.querySelector('.table1 .inputs').dataset.menuSlct.split(' ')
    if (slctd[0] === 'cut') {
        const theTxt = window.getSelection()
        navigator.clipboard.writeText(theTxt)
        document.querySelector('#' + slctd[1]).setRangeText('')
    } else if (slctd[0] === 'copy') {
        const theTxt = window.getSelection()
        navigator.clipboard.writeText(theTxt)
    } else if (slctd[0] === 'selectAll') {
        document.querySelector('#' + slctd[1]).select()
    } else if (slctd[0] === 'bold') {
        const theInput = document.querySelector('#' + slctd[1])
        if (theInput.selectionStart !== theInput.selectionEnd) {
            const theTxt = window.getSelection()
            theInput.setRangeText('<b>' + theTxt + '</b>')
        }
    }
})
const printEnds = []//these are the anchornode and focusnode for printing selection
function printDocBe() {
    const selection = document.querySelectorAll('.table2 > .row')
    const xSelection = [] //contains each of the divs going to printery
    selection.forEach(e=> {
        if (e.style.display === "flex") xSelection.push(e)
    })
    popThem()
    shiftThem()
    function popThem() {
        for (let i=xSelection.length; i>0; i--) {
            if (xSelection[i-1].dataset.timestamp !== printEnds[0] && xSelection[i-1].dataset.timestamp !== printEnds[1]) {
                xSelection.pop()
            } else {
                break
            }
        }
    }
    function shiftThem() {
        let stamp = xSelection[0].dataset.timestamp
        do {
            if (stamp !== printEnds[0] && stamp !== printEnds[1]) xSelection.shift();
            stamp = xSelection[0].dataset.timestamp
        } while (stamp !== printEnds[0] && stamp !== printEnds[1])
    }
    const contentArr = []
    xSelection.forEach(e=> {
        const vals = []
        e.querySelectorAll('div').forEach(r=> {
            vals.push(r.innerHTML)
        })
        contentArr.push(vals)
    })
    console.log(xSelection)
    //fs.unlinkSync(dataPath + "/contentArr.json")
    fs.writeFileSync(dataPath + '/contentArr.json', JSON.stringify(contentArr))
    const thePage = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Print document</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body class="printBody">
        <div class="row headers">
            <div>S/N</div>
            <div>SD REF/CRB</div>
            <div>Complaint</div>
            <div>Suspect</div>
            <div>Offence</div>
            <div>Reference</div>
            <div>Remarks</div>
            <div>Final disposal</div>
        </div>
        <div class="row divs">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        <script>
        const ipcRenderer = window.theDataPath.renderer
        const fs = window.theDataPath.fs
        const dataPath = ipcRenderer.sendSync('bringLink', '')
        const entries = fs.readFileSync(dataPath + '/contentArr.json')       
        const strEntr = String.fromCharCode.apply(null, new Uint8Array(entries))
        console.log(strEntr)        
        const contentArr = []
        strEntr.forEach(e => contentArr.push(JSON.parse(e)))
        console.log(contentArr)
        contentArr.forEach(arr => {
            const clone = document.querySelector('.divs').cloneNode(true)
            const destinatn = [...clone.children]
            for (let i=0; i<destinatn.length; i++) {
                destinatn[i].innerHTML = arr[i]
            }
            clone.style.display = "flex"
            document.querySelector('.printBody').appendChild(clone)
        })     
        </script>   
    </body>
    </html>`
    //in case there's more than one page, we see how to put headers on each page. Quite complex. PrintDiv with maximum height?
    ipcRenderer.send('printThis', thePage)
}
document.querySelectorAll('[data-timestamp]').forEach(e=> {
    e.addEventListener('anchStamp', ()=> {
        printEnds[0] = e.dataset.timestamp
    })
    e.addEventListener('focusStamp', ()=> {
        printEnds[1] = e.dataset.timestamp
        printDocBe()
    })
})

const noSearch = document.createElement('div')//div for when no search results
noSearch.className = 'noSearch'
let theId; //this is the id of the settimeout of function showinfo
function showInfo() {
    const theInfo = document.querySelector('.clearInfo')
    theId = setTimeout(()=> {theInfo.style.display = "inline"}, 500)
}
function removeInfo() {
    const theInfo = document.querySelector('.clearInfo')
    theInfo.style.display = "none"
    clearTimeout(theId)
}
function charByChar(divVal, targDiv) {
    const wrds = divVal.split(' ')
    let chars = []; 
    wrds.forEach(e=> chars.push(e.split('')))
    chars.forEach(e=> e.push(' '))
    const charrs = chars.flat()
    let startingPt = 0
    addNoBold()
    function addNoBold () {
        for (let r=startingPt; r<charrs.length; r++) {
            if (charrs[r] === '<' && charrs[r+1] === 'b' && charrs[r+2] === '>') {
                    charrs.splice(r, 3)
                    startingPt = r
                    addBold()
                    break;
            } else {
                targDiv.innerHTML+= charrs[r]
            }
        }
    }
    function addBold() {
        for (let x=startingPt; x<charrs.length; x++) {
            if (charrs[x] === '<' && charrs[x+1] === '/' && charrs[x+2] === 'b' && charrs[x+3] === '>') {
                charrs.splice(x, 4)
                startingPt = x
                addNoBold()
                break;
            } else {
                targDiv.innerHTML+= '<b>' + charrs[x] + '</b>'
            }
        }
    }
}
function saveInput() {
    const clone = document.querySelector('.table2').lastElementChild.cloneNode(true)
    const destinatn = [...clone.children]
    const origin = [...document.querySelectorAll('.inputs textarea')]
    const newEntry = []
    if (origin[0].value !== '' && origin [2].value !== '') {
        for (let i=0; i<destinatn.length; i++) {
            charByChar(origin[i].value, destinatn[i])//adding input value character by character to prevent malicious code
            newEntry.push(origin[i].value)
            //origin[i].value = ''  And remember to uncomment this
        }
        clone.style.display = 'flex'
        const dateArr = Date().toString().split(' ')
        let timestamp = ''
        for (let i=0; i<dateArr.length;i++) {
            timestamp+=dateArr[i]
        }
        newEntry.push(timestamp)
        clone.dataset.timestamp = timestamp
        searchArr.push(JSON.parse(JSON.stringify(newEntry)))
        fs.appendFileSync(dataPath + "/archival.json", JSON.stringify(newEntry) + "ReCoGnId")
        clone.addEventListener('anchStamp', ()=> {
            printEnds[0] = clone.dataset.timestamp
        })
        clone.addEventListener('focusStamp', ()=> {
            printEnds[1] = clone.dataset.timestamp
            printDocBe()
        })
        document.querySelector('.table2').insertBefore(clone, document.querySelector('[data-timestamp]:nth-child(1)'))
        console.log(document.querySelector('[data-timestamp]:nth-child(1)'))//the computer is just lazy to respond to insertBefore
    } else {
        //say that most fields are empty
    }
    altCol()
}
function saveEdited() {
    const timestamp = document.querySelector('.saveEdited').dataset.stamp
    const destinatn = [...document.querySelector(`[data-timestamp="${timestamp}"]`).children]
    const origin = [...document.querySelectorAll('.inputs textarea')]
    const newEntry = []
    for (let i=0; i<destinatn.length; i++) {
        charByChar(origin[i].value, destinatn[i])
        newEntry.push(origin[i].value)
        origin[i].value = ''

    }
    newEntry.push(timestamp)
    for (let i=searchArr.length; i>0; i--) {
        if (searchArr[i-1][8] === timestamp) {
            searchArr[i-1] = JSON.parse(JSON.stringify(newEntry))
        }
    }
    document.querySelector(`[data-timestamp="${timestamp}"]`).style.display = 'flex'
    altCol()
    document.querySelector('.saveEdited').style.display = 'none'
    document.querySelector('.saveInput').style.display = 'inline'
    document.querySelector('.saveEdited').dataset.stamp = ''
    document.querySelector('.clearAll').style.display = 'inline'
    document.querySelector('.cutEdit').style.display = 'none'
    reArchive()
    //tell user that we have saved

}
function cutEdit() {
    clearAll()
    const timestamp = document.querySelector('.saveEdited').dataset.stamp
    document.querySelector(`[data-timestamp="${timestamp}"]`).style.display = 'flex'
    altCol()
    document.querySelector('.saveEdited').style.display = 'none'
    document.querySelector('.saveInput').style.display = 'inline'
    document.querySelector('.saveEdited').dataset.stamp = ''
    document.querySelector('.cutEdit').style.display = 'none'
    document.querySelector('.clearAll').style.display = 'inline'
    //tell user that we have canceled
}
function remEntry() {
    const timestamp = document.querySelector('.table2').dataset.stamp
    document.querySelector('.table2').removeChild(document.querySelector(`[data-timestamp="${timestamp}"]`))
    altCol()
    for (let i=searchArr.length; i>0; i--) {
        if (searchArr[i-1][8] === timestamp) {
            searchArr.splice(i-1, 1)
        }
    }
    //console.log(searchArr)
    document.querySelector('.table2').dataset.stamp = ''
    reArchive()
}
function reArchive() {
    fs.unlinkSync(dataPath + "/archival.json")
    searchArr.forEach(newEntry => {
        fs.appendFileSync(dataPath + "/archival.json", JSON.stringify(newEntry) + "ReCoGnId")//"recognid" should be more complex sothat he cannot decrypt it

    })
}
function pickEntries() {
    fs.appendFileSync(dataPath + "/archival.json", '');
    const entries = fs.readFileSync(dataPath + '/archival.json')
    const strEntr = String.fromCharCode.apply(null, new Uint8Array(entries))
    const arrEntr = strEntr.split('ReCoGnId')
    arrEntr.pop()//removing the last array which is an empty string
    const newArrEntr = []
    arrEntr.forEach(e => newArrEntr.push(JSON.parse(e)))
    //console.log(newArrEntr[0], newArrEntr, newArrEntr[5])
    searchArr = JSON.parse(JSON.stringify(newArrEntr))
    newArrEntr.forEach(arr => {
        const clone = document.querySelector('.table2').lastElementChild.cloneNode(true)
        const destinatn = [...clone.children]
        const theTime = arr.pop()
        for (let i=0; i<destinatn.length; i++) {
            charByChar(arr[i], destinatn[i])
        }
        clone.style.display = "flex"
        clone.dataset.timestamp = theTime
        document.querySelector('.table2').insertBefore(clone, document.querySelector('.table2 .row:nth-child(1)'))
    })     
    altCol()   
} 
function clearAll() {
    const fields = [...document.querySelectorAll('.inputs textarea')]
    for (let i=0; i<fields.length; i++) {
        fields[i].value = ''
    }
}
//Dealing with the search button
function searcher() {
    const theQuery = document.querySelector('#searcher').value.toLowerCase()
    if (theQuery) {
        let isThereSrch = false;
        checkIsThereSrch()
        document.querySelectorAll('.table2 .divs').forEach(e=> {
            e.style.display = "none"
            e.querySelectorAll('div').forEach(e=> e.style.color = "black")
        })
        const theQueries = ['', '', '']
        const theueries = theQuery.split(' ')
        theueries.forEach(e=> theQueries.unshift(e))
        for (let i=searchArr.length; i>0; i--) {
            for (let r=0; r<searchArr[i-1].length-1; r++) {
                if (searchArr[i-1][r].toLowerCase().includes(theQueries[0]) && searchArr[i-1][r].toLowerCase().includes(theQueries[1]) && searchArr[i-1][r].toLowerCase().includes(theQueries[2]) && searchArr[i-1][r].toLowerCase().includes(theQueries[3])) {//this algorithm only matches the first four words. Any words placed at the beginning of the search query after this matching arent considered. Dono why
                    const theDiv = document.querySelector(`[data-timestamp="${searchArr[i-1][searchArr[i-1].length-1]}"]`)
                    theDiv.style.display = "flex"
                    theDiv.querySelector(`div:nth-child(${r+1})`).style.color = "orange"
                    isThereSrch = true
                }
            }
        }
        checkIsThereSrch()
        function checkIsThereSrch() {
            if (!isThereSrch) {
                noSearch.style.display = "block"
                noSearch.innerHTML = `No results for ${theQuery}`
                document.querySelector('.table2').appendChild(noSearch)
            } else {
                const lastChld = document.querySelector('.table2').lastElementChild
                if (lastChld.className === 'noSearch') {
                    document.querySelector('.table2').removeChild(lastChld)
                }
                noSearch.style.display = "none"
            }
        }
    } else {
        document.querySelectorAll('[data-timestamp]').forEach(e=> {
            e.style.display = "flex"
            e.querySelectorAll('div').forEach(e=> e.style.color = "black")
        })
    }
    altCol()
}
function exitWork(){
    const theA = document.createElement('a')
    theA.href = "logoff.html"
    const ev = new MouseEvent('click')
    theA.dispatchEvent(ev)
}

//statistics counts how many have been highlighted (this could be complex), how many search results and how many are there total in the archives

/*
statistics and batch delete and print.
The words on the logoff screen should come in in style
Pushing to github
Lastly, settings; 'your name here', font size, whether to sign in with pin?
*/
//"if it's missing any one of the first three textarea values, don't save"

//remember to remove settings from the contextmenu
//Very Long Words Must Wrap
//we were also supposed to undo bold

//theDataPath is not recognised in printable.html. ContentArr is also waiting for you. It has null values only in .config
