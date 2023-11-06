const ipcRenderer = window.theDataPath.renderer
const fs = window.theDataPath.fs

const dataPath = ipcRenderer.sendSync('bringLink', '')
let searchArr;//this is the samplespace for when searching
let delID; //this is the id of the settimeout for undoing a deleted entry
document.querySelector('.table2').addEventListener('altColE', () => { altCol() })
document.querySelector('.table2').addEventListener('delEntry', () => { remEntry() })
//now, making the table2 divs alter colors
function altCol() {
    const selection = document.querySelectorAll('.table2 > .row')
    const xSelection = []
    selection.forEach(e => {
        if (e.style.display === "flex") xSelection.push(e)
    })
    for (let r = 0; r < xSelection.length; r += 2) {
        xSelection[r].querySelectorAll('div').forEach(s => s.style.backgroundColor = "rgb(241, 241, 243)")
        if (xSelection[r + 1]) xSelection[r + 1].querySelectorAll('div').forEach(s => s.style.backgroundColor = "lightgrey");
    }
}
//concerning the database
ipcRenderer.send('databases', 'connect', '')
const makedb = 'create database if not exists prmdb'
ipcRenderer.send('databases', 'jstQuery', makedb)
const useDB = 'use prmdb'
ipcRenderer.send('databases', 'jstQuery', useDB)
const maketbl = 'create table if not exists themrecords (sn varchar(255), sdref varchar(255), complainant varchar(255), suspect varchar(255), offence varchar(255), reference varchar(255), remarks varchar(255), finaldisp varchar(255), timestamp varchar(255) primary key)'
ipcRenderer.send('databases', 'jstQuery', maketbl)
function readDB() {
    const getRecords = 'select * from themrecords'
    ipcRenderer.send('databases', 'resultQuery', getRecords)
}
function addenDB(arr) {
    const insert = `insert into themrecords values ("${arr[0]}", "${arr[1]}", "${arr[2]}", "${arr[3]}", "${arr[4]}", "${arr[5]}", "${arr[6]}", "${arr[7]}", "${arr[8]}")`
    ipcRenderer.send('databases', 'jstQuery', insert)
}
function scoopDB(timestamp) {
    const toDel = `delete from themrecords where timestamp="${timestamp}"`
    ipcRenderer.send('databases', 'jstQuery', toDel)
}
function changeRec(timestamp, newArr) {
    scoopDB(timestamp)
    addenDB(newArr)
}
pickEntries()
//the UI teller
document.querySelector('.teller').addEventListener('printed', () => {
    document.querySelector('.teller').innerHTML = 'Printed successfully to ' + document.querySelector('.teller').dataset.message
    document.querySelector('.teller').style.display = 'flex'
    setTimeout(() => { document.querySelector('.teller').style.display = 'none' }, 3000)
})
document.querySelector('.teller').addEventListener('dontPrint', () => {
    document.querySelector('.teller').innerHTML = "Please highlight within entries' region to print"
    document.querySelector('.teller').style.display = 'flex'
    setTimeout(() => { document.querySelector('.teller').style.display = 'none' }, 3000)
})
document.querySelector('.teller').addEventListener('savedEdited', () => {
    document.querySelector('.teller').innerHTML = 'Overwritten'
    document.querySelector('.teller').style.display = 'flex'
    setTimeout(() => { document.querySelector('.teller').style.display = 'none' }, 2000)
})
document.querySelector('.teller').addEventListener('cutEdit', () => {
    document.querySelector('.teller').innerHTML = 'Cancelled editing'
    document.querySelector('.teller').style.display = 'flex'
    setTimeout(() => { document.querySelector('.teller').style.display = 'none' }, 2000)
})
document.querySelector('.teller').addEventListener('fieldsEmpty', () => {
    document.querySelector('.teller').innerHTML = 'Not saved. Atleast one major field is empty'
    document.querySelector('.teller').style.display = 'flex'
    setTimeout(() => { document.querySelector('.teller').style.display = 'none' }, 3000)
})
document.querySelector('.teller').addEventListener('cutDel', () => {
    const undoBtn = '<button class="cutDelBtn" onclick="cutDelNow()">Undo</button>'
    document.querySelector('.teller').innerHTML = 'Entry has been deleted. ' + undoBtn
    document.querySelector('.teller').style.display = 'flex'
    setTimeout(() => { document.querySelector('.teller').style.display = 'none' }, 4000)
})
//concerning the context menus
function contextMenuDivs(e) {
    e.preventDefault()
    const msg = e.currentTarget.dataset.timestamp
    ipcRenderer.send('showMenu', msg)
}
document.querySelectorAll('.row > textarea').forEach(el => {
    el.oncontextmenu = (e) => {
        const msg = e.currentTarget.id
        ipcRenderer.send('miniMenu', msg)
    }
})
document.querySelector('.table1 .inputs').addEventListener('miniMenu', () => {
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
    selection.forEach(e => {
        if (e.style.display === "flex") xSelection.push(e)
    })
    popThem()
    shiftThem()
    function popThem() {
        for (let i = xSelection.length; i > 0; i--) {
            if (xSelection[i - 1].dataset.timestamp !== printEnds[0] && xSelection[i - 1].dataset.timestamp !== printEnds[1]) {
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
    xSelection.forEach(e => {
        const vals = []
        e.querySelectorAll('div').forEach(r => {
            vals.push(r.innerHTML)
        })
        contentArr.push(vals)
    })
    let strungArr = JSON.stringify(contentArr)
    const thePage = `<!DOCTYPE html>
    <html lang="en"><head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Print document</title>
        <style>* {box-sizing: border-box; word-break: break-word;} .printBody{min-height: 595px;} .printBody .headers {width: 96%; margin: 20px auto 0 auto;}  .headers > div {background-color: rgb(79, 92, 114); color: rgb(228, 226, 226); padding: 7px 7px 4px 7px; font-weight: bold; text-align: center; user-select: none;}   .row > * {
            width: calc(84%/6);
            font-family: Helvetica, sans-serif;
            border-left: 1px solid rgb(179, 179, 179);
            border-right: 1px solid rgb(179, 179, 179);
            padding-left: 2px;
            padding-right: 2px;
        }   .row > *:nth-child(1) {
            width: 6%;
        }   .row > *:nth-child(2) {
            width: 10%;
        }   .row {
            display: flex;
            flex-direction: row;
            border-left: 1px solid rgb(179, 179, 179);
            border-right: 1px solid rgb(179, 179, 179);
        }   .divs {
            min-height: 30px;
            display: none;
        }   .divs > div {
            padding: 8px 2px;
            background-color: lightgrey;
        }   .pgTable {
            width: 96%;
            margin-left: auto;
            margin-right: auto;
            border-bottom: 2px solid rgb(179, 179, 179);
        }   .pgTable > div:nth-child(even) > div {
            background-color: lightgray;
        }   .pgTable > div:nth-child(odd) > div {
            background-color: rgb(241, 241, 243);
        }
        </style>
    </head>
    <body class="printBody">
        <div class="row headers"><div>S/N</div><div>SD REF/CRB</div><div>Complainant</div><div>Suspect</div><div>Offence</div><div>Reference</div><div>Remarks</div><div>Final disposal</div></div>
        <div class="row divs"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        <div class="pgTable"></div>
        <script>
        const ipcRenderer = window.theDataPath.renderer
        const strungArr = ipcRenderer.sendSync('bringArr')
        const contentArr = JSON.parse(strungArr)
        contentArr.forEach(arr => {
            const clone = document.querySelector('.divs').cloneNode(true)
            const destinatn = [...clone.children]
            for (let i=0; i<destinatn.length; i++) {
                destinatn[i].innerHTML = arr[i]
            }
            clone.style.display = "flex"
            document.querySelector('.pgTable').appendChild(clone)
        })
        const dateArr = Date().toString().split(' ')
        dateArr.splice(-4, 4)
        let filename = ''
        for (let i=0; i<dateArr.length;i++) {
            filename+=dateArr[i]
        }
        ipcRenderer.send('doneLoading', filename)
        </script>   
    </body></html>`
    //in case there's more than one page, we see how to put headers on each page. Quite complex. PrintDiv with maximum height?    
    ipcRenderer.send('printThis', thePage, strungArr)
}
document.querySelectorAll('[data-timestamp]').forEach(e => {
    e.addEventListener('anchStamp', () => {
        printEnds[0] = e.dataset.timestamp
    })
    e.addEventListener('focusStamp', () => {
        printEnds[1] = e.dataset.timestamp
        printDocBe()
    })
})

const noSearch = document.createElement('div')//div for when no search results
noSearch.className = 'noSearch'
let theId; //this is the id of the settimeout of function showinfo
function showInfo() {
    const theInfo = document.querySelector('.clearInfo')
    theId = setTimeout(() => { theInfo.style.display = "inline" }, 500)
}
function removeInfo() {
    const theInfo = document.querySelector('.clearInfo')
    theInfo.style.display = "none"
    clearTimeout(theId)
}
function charByChar(divVal, targDiv) {
    targDiv.innerHTML = ''
    const wrds = divVal.split(' ')
    let chars = [];
    wrds.forEach(e => chars.push(e.split('')))
    chars.forEach(e => e.push(' '))
    const charrs = chars.flat()
    let startingPt = 0
    addNoBold()
    function addNoBold() {
        for (let r = startingPt; r < charrs.length; r++) {
            if (charrs[r] === '<' && charrs[r + 1] === 'b' && charrs[r + 2] === '>') {
                charrs.splice(r, 3)
                startingPt = r
                addBold()
                break;
            } else {
                targDiv.innerHTML += charrs[r]
            }
        }
    }
    function addBold() {
        for (let x = startingPt; x < charrs.length; x++) {
            if (charrs[x] === '<' && charrs[x + 1] === '/' && charrs[x + 2] === 'b' && charrs[x + 3] === '>') {
                charrs.splice(x, 4)
                startingPt = x
                addNoBold()
                break;
            } else {
                targDiv.innerHTML += '<b>' + charrs[x] + '</b>'
            }
        }
    }
}
function saveInput() {
    const clone = document.querySelector('.table2').lastElementChild.cloneNode(true)
    const destinatn = [...clone.children]
    const origin = [...document.querySelectorAll('.inputs textarea')]
    const newEntry = []
    if (origin[0].value !== '' && origin[1].value !== '' && origin[2].value !== '') {
        for (let i = 0; i < destinatn.length; i++) {
            charByChar(origin[i].value, destinatn[i])//adding input value character by character to prevent malicious code
            newEntry.push(origin[i].value)
            origin[i].value = ''
        }
        clone.style.display = 'flex'
        const dateArr = Date().toString().split(' ')
        dateArr.splice(-4, 4)
        let timestamp = ""
        for (let i = 0; i < dateArr.length; i++) {
            timestamp += dateArr[i]
        }
        newEntry.push(timestamp)
        clone.dataset.timestamp = timestamp
        searchArr.push(JSON.parse(JSON.stringify(newEntry)))
        addenDB(newEntry)
        clone.addEventListener('anchStamp', () => {
            printEnds[0] = clone.dataset.timestamp
        })
        clone.addEventListener('focusStamp', () => {
            printEnds[1] = clone.dataset.timestamp
            printDocBe()
        })
        document.querySelector('.table2').insertBefore(clone, document.querySelector('.table2 .row:nth-child(1)'))
    } else {
        document.querySelector('.teller').dispatchEvent(new Event('fieldsEmpty'))
    }
    altCol()
    statser()
}
document.querySelector('.saveEdited').addEventListener('editEntry', () => {
    const timestamp = document.querySelector('.saveEdited').dataset.stamp
    let origin;
    for (let i = searchArr.length; i > 0; i--) {
        if (searchArr[i - 1][8] === timestamp) {
            origin = searchArr[i - 1]
        }
    }
    const destinatn = [...document.querySelectorAll('.inputs textarea')]
    for (let i = 0; i < destinatn.length; i++) {
        destinatn[i].value = origin[i]
    }
    document.querySelector(`[data-timestamp="${timestamp}"]`).style.display = 'none';
    document.querySelector('.table2').dispatchEvent(new Event('altColE'))
    window.scrollTo({ top: 0 })
    document.querySelector('.saveInput').style.display = 'none'
    document.querySelector('.saveEdited').style.display = 'inline'
    document.querySelector('.clearAll').style.display = 'none'
    document.querySelector('.cutEdit').style.display = 'inline'
})
function saveEdited() {
    const timestamp = document.querySelector('.saveEdited').dataset.stamp
    const destinatn = [...document.querySelector(`[data-timestamp="${timestamp}"]`).children]
    const origin = [...document.querySelectorAll('.inputs textarea')]
    const newEntry = []
    if (origin[0].value !== '' && origin[1].value !== '' && origin[2].value !== '') {
        for (let i = 0; i < destinatn.length; i++) {
            charByChar(origin[i].value, destinatn[i])
            newEntry.push(origin[i].value)
            origin[i].value = ''
        }
        newEntry.push(timestamp)
        changeRec(timestamp, newEntry)
        for (let i = searchArr.length; i > 0; i--) {
            if (searchArr[i - 1][8] === timestamp) {
                searchArr[i - 1] = JSON.parse(JSON.stringify(newEntry))
            }
        }
        document.querySelector(`[data-timestamp="${timestamp}"]`).style.display = 'flex'
        document.querySelector('.teller').dispatchEvent(new Event('savedEdited'))
        altCol()
        document.querySelector('.saveEdited').style.display = 'none'
        document.querySelector('.saveInput').style.display = 'inline'
        document.querySelector('.saveEdited').dataset.stamp = ''
        document.querySelector('.clearAll').style.display = 'inline'
        document.querySelector('.cutEdit').style.display = 'none'
    } else {
        document.querySelector('.teller').dispatchEvent(new Event('fieldsEmpty'))
    }
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
    document.querySelector('.teller').dispatchEvent(new Event('cutEdit'))
}
function remEntry() {
    const timestamp = document.querySelector('.table2').dataset.stamp
    document.querySelector(`[data-timestamp="${timestamp}"]`).style.display = "none"
    altCol()
    document.querySelector('.teller').dispatchEvent(new Event('cutDel'))
    delID = setTimeout(() => {
        document.querySelector('.table2').removeChild(document.querySelector(`[data-timestamp="${timestamp}"]`))
        for (let i = searchArr.length; i > 0; i--) {
            if (searchArr[i - 1][8] === timestamp) {
                searchArr.splice(i - 1, 1)
            }
        }
        document.querySelector('.table2').dataset.stamp = 'removed'
        statser()
        scoopDB(timestamp)
    }, 4500)
}
function cutDelNow() {
    clearTimeout(delID)
    const timestamp = document.querySelector('.table2').dataset.stamp
    document.querySelector(`[data-timestamp="${timestamp}"]`).style.display = "flex"
    altCol()
    document.querySelector('.table2').dataset.stamp = 'removed'
    document.querySelector('.teller').style.display = 'none'
}
function pickEntries(arrIsReady = 0) {
    if (!arrIsReady) {
        readDB()
        return
    } else {
        //console.log('now DB ready')
        let newArrEntr = []
        const dbRead = JSON.parse(ipcRenderer.sendSync('getReadResult'))
        dbRead.forEach(obj => {
            const innerArr = [...Object.values(obj)] //because obj is actually not an iterable object. it even came from unscrupulous places.
            newArrEntr.push(innerArr)
        })
        searchArr = JSON.parse(JSON.stringify(newArrEntr))
        newArrEntr.forEach(arr => {
            const clone = document.querySelector('.table2').lastElementChild.cloneNode(true)
            const destinatn = [...clone.children]
            const theTime = arr.pop()
            for (let i = 0; i < destinatn.length; i++) {
                charByChar(arr[i], destinatn[i])
            }
            clone.style.display = "flex"
            clone.dataset.timestamp = theTime
            document.querySelector('.table2').insertBefore(clone, document.querySelector('.table2 .row:nth-child(1)'))
        })
        altCol()
        statser()
    }
}
function clearAll() {
    const fields = [...document.querySelectorAll('.inputs textarea')]
    for (let i = 0; i < fields.length; i++) {
        fields[i].value = ''
    }
}
//Dealing with the search button
function searcher() {
    const theQuery = document.querySelector('#searcher').value.toLowerCase()
    if (theQuery) {
        let isThereSrch = false;
        checkIsThereSrch()
        document.querySelectorAll('.table2 .divs').forEach(e => {
            e.style.display = "none"
            e.querySelectorAll('div').forEach(e => e.style.color = "black")
        })
        let counter = 0
        const theQueries = ['', '', '']
        const theueries = theQuery.split(' ')
        theueries.forEach(e => theQueries.unshift(e))
        for (let i = searchArr.length; i > 0; i--) {
            for (let r = 0; r < searchArr[i - 1].length - 1; r++) {
                if (searchArr[i - 1][r].toLowerCase().includes(theQueries[0]) && searchArr[i - 1][r].toLowerCase().includes(theQueries[1]) && searchArr[i - 1][r].toLowerCase().includes(theQueries[2]) && searchArr[i - 1][r].toLowerCase().includes(theQueries[3])) {//this algorithm only matches the first four words. Any words placed at the beginning of the search query after this matching arent considered. Dono why
                    const theDiv = document.querySelector(`[data-timestamp="${searchArr[i - 1][searchArr[i - 1].length - 1]}"]`)
                    theDiv.style.display = "flex"
                    counter++
                    theDiv.querySelector(`div:nth-child(${r + 1})`).style.color = "orange"
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
        document.querySelector('.srchStat').innerHTML = 'Matching search results found: ' + counter
        document.querySelector('.srchStat').style.display = 'inline'
    } else {
        document.querySelectorAll('[data-timestamp]').forEach(e => {
            e.style.display = "flex"
            e.querySelectorAll('div').forEach(e => e.style.color = "black")
        })
        document.querySelector('.srchStat').style.display = 'none'
    }
    altCol()
}
function exitWork() {
    const theA = document.createElement('a')
    theA.href = "logoff.html"
    const ev = new MouseEvent('click')
    theA.dispatchEvent(ev)
}
cN()
function cN(name = 0) {//changeName. cN makes it look cryptic
    if (name) {
        fs.writeFileSync(dataPath + '/name.json', name)
        document.querySelector('.name').innerHTML = 'NAME: ' + name
    } else {
        fs.readFile(dataPath + '/name.json', (err, data) => {
            if (err) {
                document.querySelector('.name').innerHTML = 'NAME:'
            } else {
                const strEntry = String.fromCharCode.apply(null, new Uint8Array(data))
                document.querySelector('.name').innerHTML = 'NAME: ' + strEntry
            }
        })
    }
}
function statser() {
    document.querySelector('.stats').innerHTML = ''
    if (searchArr.length) {
        document.querySelector('.stats').innerHTML = 'Total entries: ' + searchArr.length
    }
}