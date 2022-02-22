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
    let day = dateString.substring(0,2);
    day = Number(day)
    let month = dateString.substring(3,6).toLowerCase();
    month = months[month]
    if (month === null || month === undefined) {
        throw new Error("bad month")
    }
    month = Number(month)
    let year = dateString.substring(7)
    year = Number(year)

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
        let [s,...restOfHeader] = header
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
            //writeJson()
        })
    }
    //writeDataBySymbol()
}
function dateWithinRange(start, end) {
    return (v)=> v>=start && v<=end
}
function between(v, low, high) {
    return v>=low && v<=high
}
function processBySymbol() {
    const bySymbolPaths = fs.readdirSync(data_out_json)
        .map(file => data_out_json+file)
        .filter(filePath=>filePath.endsWith('.json'))
        .sort()
    const crashPerf = []
    const noData = []
    const hasData = []
    bySymbolPaths.forEach((filePath)=>{
        const json = fsread(filePath)
        let {
            symbol,
            companyName,
            header,
            rows
        }  = JSON.parse(json)

        let [lower, upper] = [Date.UTC(2007, 5, 1), Date.UTC(2009,1,1)]

        const crashRange = rows.filter(row=>{
            return between(row[0],lower,upper)
        })
        if (crashRange.length<2) return

        let rangeReturn=1
        crashRange.forEach(row=>{
            const [date,o,h,l,c,v] = row
            rangeReturn*= c/o
        })
        crashPerf.push([symbol, companyName, rangeReturn])
    })
    const crashResults = Papa.unparse(crashPerf)
    fswrite(data+"2008crash_perf.csv",crashResults)
}

//processByYearData()


processBySymbol()

const foo = ""