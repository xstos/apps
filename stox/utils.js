const fs = require('fs')
const Papa = require('papaparse')

const { months, stringIndex, fsread } = require('./common.js')

const path = 'C:\\Users\\user\\Downloads\\eoddata\\'
const data = path+'data\\'
const data_out=path+"data_out\\"
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
    let outHeader
    eoddataPaths.forEach((filePath) => {
        const raw = fsread(filePath)
        const parsed = Papa.parse(raw)
        const [ header, ...rows ] = parsed.data
        outHeader = header
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
            const ret =[null, symbolIndex, date, Number(open), Number(high), Number(low), Number(close), volume ]
            currentRows.push(ret)
        }
        if (allZero) return //exchange was closed
        for (const row of currentRows) {
            const [_,symbol] = row
            const rowsBySymbol = stockDataBySymbol._getOrCreate(symbol,makeEmptyArray)
            rowsBySymbol.push(row)
        }
    })
    outHeader = ['Company Name', ...outHeader]

    function writeDataBySymbol() {
        stockDataBySymbol.forEach((rows, symbolId)=>
        {
            const symbol = symbolMap.get(symbolId)
            const companyName = tsxCompanyNames.get(symbol) || ''
            if (!companyName) {
                console.log("missing company name "+symbol)
                debugger
            }
            for (const row of rows) {
                row[1]=''
                row[0]=''
            }
            outHeader[0]=companyName
            outHeader[1]=symbol
            const content = Papa.unparse([outHeader,...rows])
            let outPath = `${data_out}${symbol.replace(".","_")}.csv`;
            fs.writeFileSync(outPath,content,'utf8')
            // const read = fsread(outPath)
            // if (content!==read) {
            //     debugger
            // }
        })
    }
}
function dateWithinRange(start, end) {
    return (v)=> v>=start && v<=end
}
function between(v, low, high) {
    return v>=low && v<=high
}
function processBySymbol() {
    const bySymbolPaths = fs.readdirSync(data_out)
        .map(file => data_out+file)
        .filter(filePath=>filePath.endsWith('.csv'))
        .sort()
    const crashPerf = []
    const noData = []
    const hasData = []
    bySymbolPaths.forEach((filePath)=>{
        const csv = fsread(filePath)
        let [header, ...rows]  = Papa.parse(csv).data

        const companyName = header[0]
        const symbol = header[1]
        let [lower, upper] = [Date.UTC(2007, 5, 1), Date.UTC(2009,1,1)]
        let before, after
        const crashRange = rows.filter(row=>{
            const [_,__,dstr,o,h,l,c,v] = row
            return between(parseDate(dstr),lower,upper)
        })
        if (crashRange.length>1) {
            hasData.push(companyName+ " "+symbol)
        }


        //perf = after[6] / before[6]
        //crashPerf.push([symbol, companyName, perf])
    })
    //crashPerf.sort((a,b) => b[2]-a[2])
}
//processByYearData()


processBySymbol()

const foo = ""