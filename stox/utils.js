const fs = require('fs')
const { months, stringIndex, fsread } = require('./common.js')
const Papa = require('papaparse')
const path = 'C:\\Users\\user\\Downloads\\eoddata\\'
const data = path+'data\\'

const eoddataPaths = fs.readdirSync(data)
    .map(file => data+file)
    .filter(filePath=>filePath.endsWith('.csv'))
    .sort()

const tsxCompanyNames = Papa.parse(fsread(path+"tsx_company_names.csv")).data
    .filter(([a])=>a)
    ._toMap()

const stockDataBySymbol = new Map()
const symbolMap = stringIndex()

const makeEmptyArray = ()=>[]
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
        let day = date.substring(0,2);
        day = Number(day)
        let month = date.substring(3,6).toLowerCase();
        month = months[month]
        if (month === null || month === undefined) {
            throw new Error("bad month")
        }
        month = Number(month)
        let year = date.substring(7)
        year = Number(year)

        const dateValue = Date.UTC(year,month,day)
        volume = Number(volume)
        if (volume!==0) {
            allZero = false
        }
        const ret =[null, symbolIndex, dateValue, Number(open), Number(high), Number(low), Number(close), volume ]
        currentRows.push(ret)
    }
    if (allZero) return //exchange was closed
    for (const row of currentRows) {
        const [_,symbol] = row
        const rowsForSymbol = stockDataBySymbol._getOrCreate(symbol,makeEmptyArray)
        rowsForSymbol.push(row)
    }
})
outHeader = ['Company Name', ...outHeader]
stockDataBySymbol.forEach((rows, symbolId)=>
{
    const symbol = symbolMap.get(symbolId)
    const companyName = tsxCompanyNames.get(symbol) || ''
    if (!companyName) {
        console.log("missing company name "+symbol)
    }
    for (const row of rows) {
        row[1]=''
        row[0]=''
    }
    outHeader[0]=companyName
    outHeader[1]=symbol
    fs.writeFileSync(`${path}cleaned\\${symbol}.csv`,Papa.unparse([outHeader,...rows]))
})

const foo = ""