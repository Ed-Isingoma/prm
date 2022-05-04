const ipcRenderer = window.theDataPath.renderer
const fs = window.theDataPath.fs
const path = window.theDataPath.path

const dataPath = ipcRenderer.sendSync('bringLink', '')
let searchArr;//this is the samplespace for when searching
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
const sadDiv = document.createElement('div')//div for when no search results
sadDiv.className = 'sadDiv'
let theId; //this is the id of the settimeout of function showinfo
function showInfo() {
    const theInfo = document.querySelector('.clearInfo')
    theId = setTimeout(()=> {theInfo.style.display = "inline"}, 600)
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
            //origin[i].value = ''
        }
        clone.style.display = 'flex'
        const timestamp = Date()//change the date to only numbers. shorter
        newEntry.push(timestamp)
        clone.dataset.timestamp = timestamp
        searchArr.push(JSON.parse(JSON.stringify(newEntry)))
        fs.appendFileSync(dataPath + "/archival.json", JSON.stringify(newEntry) + "ReCoGnId")//"recognid" should be more complex sothat he cannot decrypt it
        document.querySelector('.table2').insertBefore(clone, document.querySelector('.table2 .row:nth-child(1)'))//asif theris a problem around the nth-child. asif it doesnt respect the number in brackets
    }
    altCol()
}
function pickEntries() {
    fs.appendFileSync(dataPath + "/archival.json", '');
    const entries = fs.readFileSync(dataPath + '/archival.json')
    const strEntr = String.fromCharCode.apply(null, new Uint8Array(entries))
    const arrEntr = strEntr.split('ReCoGnId')
    arrEntr.pop()//removing the last array which is an empty string
    const newArrEntr = []
    arrEntr.forEach(e => newArrEntr.push(JSON.parse(e)))
    //console.log(newArrEntr)
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
                sadDiv.style.display = "block"
                sadDiv.innerHTML = `No results for ${theQuery}`
                document.querySelector('.table2').appendChild(sadDiv)
            } else {
                sadDiv.style.display = "none"
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

//the colors of the divs arent yet corrected, on search
//statistics counts how many have been highlighted (this could be complex), how many search results and how many are there total in the archives

