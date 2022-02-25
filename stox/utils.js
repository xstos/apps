const fs = require('fs')
const Papa = require('papaparse')

const { months, stringIndex, fsread, fswrite } = require('./common.js')

const path = 'C:\\Users\\user\\Downloads\\eoddata\\'
const data = path+'data\\'
const data_out=path+"data_out\\"
const data_out_json=path+"data_out_json\\"
const makeEmptyArray = ()=>[]
const symbolMap = stringIndex()

const tsxCompanyNames = Papa.parse(fsread(path+"tsx_company_names.csv")).data
    .filter(([a])=>a)
    ._toMap()

const eoddataPaths = fs.readdirSync(data)
    .map(file => data+file)
    .filter(filePath=>filePath.endsWith('.csv'))
    .sort()

function parseDate(dateString) {
    let [d,m,y] = dateString.replaceAll(' ','-').split('-')

    if (!d || !m || !y) {
        throw new Error("bad date str")
    }

    let day = Number(d)
    if (day<1 || day>31) {
        throw new Error("bad day")
    }
    let month = months[m.toLowerCase()]

    if (month === null || month === undefined) {
        throw new Error("bad month")
    }

    let year = Number(y)
    if (year<2000 || year > 2025) {
        throw new Error("bad year")
    }
    return Date.UTC(year,month,day)
}

function processByYearData() {
    const stockDataBySymbol = new Map()
    let header
    eoddataPaths.forEach((filePath) => {
        const raw = fsread(filePath)
        const parsed = Papa.parse(raw)
        const [ h, ...rows ] = parsed.data
        header=h
        let allZero = true
        const currentRows = []
        for (const row of rows) {
            let [ symbol, date,open,high,low,close,volume ] = row
            if (!date) continue
            if (close==="0") {
                continue
            }

            const symbolIndex = symbolMap.get(symbol)
            date = parseDate(date)

            volume = Number(volume)
            if (volume!==0) {
                allZero = false
            }
            const ret =[symbolIndex, date, Number(open), Number(high), Number(low), Number(close), volume ]
            currentRows.push(ret)
        }
        if (allZero) return //exchange was closed
        for (const row of currentRows) {
            const [symbol,d,o,h,l,c,v] = row
            const rowsBySymbol = stockDataBySymbol._getOrCreate(symbol,makeEmptyArray)
            rowsBySymbol.push([d,o,h,l,c,v])
        }
    })

    function writeDataBySymbol() {
        let [_,...restOfHeader] = header
        header = restOfHeader
        stockDataBySymbol.forEach((rows, symbolId)=>
        {
            const symbol = symbolMap.get(symbolId)
            const companyName = tsxCompanyNames.get(symbol) || ''
            if (!companyName) {
                console.log("missing company name "+symbol)
                debugger
            }
            function writeCsv() {
                const table = [[symbol,companyName],header,...rows]
                const content = Papa.unparse(table)
                let outPath = `${data_out}${symbol.replace(".","_")}.csv`;
                fs.writeFileSync(outPath,content,'utf8')
                // const read = fsread(outPath)
                // if (content!==read) {
                //     debugger
                // }
            }
            function writeJson() {
                const data = {
                    symbol,
                    companyName,
                    header,
                    rows
                }
                const outPath = `${data_out_json}${symbol.replace(".","_")}.json`;
                fs.writeFileSync(outPath,JSON.stringify(data),'utf8')
            }
            //writeCsv()
            writeJson()
        })
    }
    writeDataBySymbol()
}
const year = Date.UTC(2008,0,1) - Date.UTC(2007,0,1)


function runReport() {
    const bySymbolPaths = fs.readdirSync(data_out_json)
        .map(file => data_out_json+file)
        .filter(filePath=>filePath.endsWith('.json'))
        .sort()
    const perf = []
    const noData = []
    const hasData = []
    const [dateColumnIndex, openCol, highCol, lowCol, closeColumnIndex, volumeCol] = [0,1,2,3,4,5]
    bySymbolPaths.forEach((filePath)=>{
        const json = fsread(filePath)
        let {
            symbol,
            companyName,
            header,
            rows
        }  = JSON.parse(json)
        if (symbol==="CLML.U.TO") {
            debugger
        }
        //let [lower, upper] = [Date.UTC(2007, months.sep, 1), Date.UTC(2009,months.feb,1)]
        let filteredRows = rows
        // filteredRows = rows.filter(row=>{
        //     return between(row[dateColumnIndex],lower,upper)
        // })
        if (filteredRows.length<2) return
        const [first,last] = [filteredRows[0],filteredRows._last()]

        let totalReturn = last[closeColumnIndex] / first[closeColumnIndex]
        if (totalReturn<1) return
        totalReturn-=1
        const totalPeriod = (last[dateColumnIndex] - first[dateColumnIndex])/year
        const yearlyReturn = totalReturn/totalPeriod
        let drawDown=0
        getPairs(filteredRows).forEach(([previousDayRow, currentDayRow]) => {
            const ret = currentDayRow[closeColumnIndex] / previousDayRow[closeColumnIndex]
            if (ret<1) {
                drawDown+=1-ret
            }
        })

        perf.push([symbol, companyName, yearlyReturn, drawDown])
    })
    const perfCsv = Papa.unparse([["Symbol", "Company Name", "Return"],... perf])
    fswrite(path+"report.csv",perfCsv)
}

//processByYearData()
runReport()

function getPairs(arr) {
    const l = arr.length
    const ret =[]
    for (let i = 1; i < l; i++) {
        ret.push([arr[i-1], arr[i]])
    }
    //fswrite(path+"pairs.csv",Papa.unparse(ret))
    return ret
}

function dateWithinRange(start, end) {
    return (v)=> v>=start && v<=end
}
function between(v, low, high) {
    return v>=low && v<=high
}



const foo = ""