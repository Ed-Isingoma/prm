const ipcRenderer = window.theDataPath.renderer
const fs = window.theDataPath.fs
const path = window.theDataPath.path
//const renderOn = window.theDataPath.renderOn

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
function contextMenuDivs(e) {
    e.preventDefault()
    const msg = e.currentTarget.dataset.timestamp
    ipcRenderer.send('showMenu', msg)
}

//renderOn()
pickEntries()
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
function saveInput() {
    const clone = document.querySelector('.divs').cloneNode(true)
    const destinatn = [...clone.children]
    const origin = [...document.querySelectorAll('.inputs textarea')]
    const newEntry = []
    if (origin[0].value !== '' && origin [2].value !== '') {
        for (let i=0; i<destinatn.length; i++) {
            destinatn[i].innerHTML = origin[i].value
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
        fs.appendFileSync(dataPath + "/archival.json", JSON.stringify(newEntry) + "ReCoGnId")//"recognid" should be more complex (e.g encarta) sothat he cannot decrypt it
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
        destinatn[i].innerHTML = origin[i].value
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
    //here, arrange them in order of timestamp, if necessary 
    searchArr = JSON.parse(JSON.stringify(newArrEntr))
    newArrEntr.forEach(arr => {
        const clone = document.querySelector('.divs').cloneNode(true)
        const destinatn = [...clone.children]
        const theTime = arr.pop()
        for (let i=0; i<destinatn.length; i++) {
            destinatn[i].innerHTML = arr[i]
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
        let isSearch = false;
        checkIsSearch()
        document.querySelectorAll('.table2 .divs').forEach(e=> {
            e.style.display = "none"
            e.querySelectorAll('div').forEach(e=> e.style.color = "black")
        })
        for (let i=searchArr.length; i>0; i--) {
            for (let r=0; r<searchArr[i-1].length-1; r++) {
                if (searchArr[i-1][r].toLowerCase().includes(theQuery)) {
                    const theDiv = document.querySelector(`[data-timestamp="${searchArr[i-1][searchArr[i-1].length-1]}"]`)
                    theDiv.style.display = "flex"
                    theDiv.querySelector(`div:nth-child(${r+1})`).style.color = "orange"
                    isSearch = true
                }
            }
        }
        checkIsSearch()
        function checkIsSearch() {
            if (!isSearch) {
                noSearch.style.display = "block"
                noSearch.innerHTML = `No results for ${theQuery}`
                document.querySelector('.table2').appendChild(noSearch)
            } else {
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
italics and bold and copy. I have to firstly know how to access what has been highlighted
statistics and batch delete and print. The highlighted thing also helps here
The words on the logoff screen should come in in style
Pushing to github
Lastly, settings; 'your name here', font size, whether to sign in with pin?
*/
//208 first. Then print