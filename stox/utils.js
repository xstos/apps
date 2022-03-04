const fs = require('fs')
const Papa = require('papaparse')
const smoothish = require('smoothish')
const regression = require('regression')
const { months, stringIndex, fsread, fswrite, daysBetween } = require('./common.js')

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
    return [year,month,day]
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
            // if (symbol==="FLX.TO") {
            //     console.log(date)
            // }
            if (!date) continue
            if (close==="0") {
                continue
            }

            const symbolIndex = symbolMap.get(symbol)
            date = parseDate(date)

            volume = Number(volume)
            // if (volume>0) {
            //     allZero = false
            // }
            const ret =[symbolIndex, date, Number(open), Number(high), Number(low), Number(close), volume ]
            currentRows.push(ret)
        }
        //if (allZero) return //exchange was closed
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
            writeCsv()
            writeJson()
        })
    }
    writeDataBySymbol()
}

function runReport() {
    const bySymbolPaths = fs.readdirSync(data_out_json)
        .map(file => data_out_json+file)
        .filter(filePath=>filePath.endsWith('.json'))
        .sort()

    const noData = []
    const hasData = []
    const [dateColumnIndex, openCol, highCol, lowCol, closeColumnIndex, volumeCol, daysElapsedCol] = [0,1,2,3,4,5,6]
    const perf = bySymbolPaths.map(processFile).filter(r=>r)

    function processFile(filePath,i, inputArray) {
        const json = fsread(filePath)
        let {
            symbol,
            companyName,
            header,
            rows
        } = JSON.parse(json)
        // if (symbol!=="DFY.TO") {
        //     return
        // }

        let filteredRows = rows
        // filteredRows = rows.filter(row=>{
        //     return between(row[dateColumnIndex],lower,upper)
        // })
        if (filteredRows.length < 2) return
        const [first, last] = [filteredRows[0], filteredRows._last()]
        const firstDate = makeDateFromArray(first[dateColumnIndex])

        const daysElapsed = readColumn(filteredRows,dateColumnIndex).map((d)=>daysBetween(firstDate, makeDateFromArray(d)))
        writeColumn(filteredRows,daysElapsed,daysElapsedCol)
        let totalPeriod = daysBetween(firstDate, makeDateFromArray(last[dateColumnIndex]))
        totalPeriod = totalPeriod / 365.25
        let totalReturn = last[closeColumnIndex] / first[closeColumnIndex]
        if (totalPeriod<0.2) {
            return [symbol, companyName, "insufficient data", "totalPeriod", totalPeriod]
        }
        if (totalReturn < 1) {
            return [symbol, companyName, -(1-totalReturn), 'N/A', 'N/A']
        }
        const bigGap = getPairs(filteredRows).filter(([a,b]) => {
            const [ad,bd] = [makeDateFromArray(a[dateColumnIndex]),makeDateFromArray(b[dateColumnIndex])]
            const ret = daysBetween(ad,bd)>10
            // if (ret) {
            //     debugger
            // }
            return ret
        })
        if (bigGap.length>0) {
            return [symbol,companyName,"big gap",bigGap[0], 'N/A']
        }
        totalReturn -= 1

        const yearlyReturn = totalReturn / totalPeriod
        if (yearlyReturn===0) {

        } else if (!yearlyReturn) {
            debugger
        }

        const close = readColumn(filteredRows, closeColumnIndex)
        const dc = readColumn(filteredRows, dateColumnIndex)
        const smoothed = close //smoothish(close, {radius: 1})
        const max = Math.max(...smoothed)
        const min = Math.min(...smoothed)
        const delta = max-min
        const pv = peakdet(smoothed,0.01)
        const peaks = pv.peaks.map(o=>({...o,type: 'peak'}))
        const valleys = pv.valleys.map(o=>({...o,type: 'valley'}))
        let mixed = [...peaks,...valleys].sort((a,b)=>a.position-b.position).map(({position, value, type})=>[position,value,type])
        mixed = [[0,smoothed[0],''],...mixed,[smoothed.length-1,smoothed._last(),'']]
        console.log(symbol,companyName,mixed.length, i/(inputArray.length-1))
        function auditPeakFinder() {
            const zipped = zip(indexes(close), dc, daysElapsed, close, smoothed)
            const derp = Papa.unparse([["index", "date", "day", "close", "smoothed"],... zipped])
            fswrite(path+"example.csv",derp)
        }
        //auditPeakFinder()
        let [down,up] = [0,0]

        getPairs(mixed).forEach(([first, second]) => {
            const ret = second[1] - first[1]
            if (ret < 0) {
                down += -ret
            } else {
                up += ret
            }
        })
        return [symbol, companyName, yearlyReturn, down/delta, up/delta, totalPeriod]
    }

    const perfCsv = Papa.unparse([["Symbol", "Company Name", "Return", "Losses", "Gains", "#Years"],... perf])
    fswrite(path+"report.csv",perfCsv)
}

//processByYearData();
runReport()
function indexes(arr) {
    return Array(arr.length).fill(0).map((n, i) => i)
}
function makeDateFromArray(arr) {
    const [year,month,day] = arr
    return new Date(Date.UTC(year,month,day))
}
function writeColumn(rows, series, columnIndex) {
    const l = rows.length
    for (let i = 0; i < l; i++) {
        rows[i][columnIndex]=series[i]
    }
}
function readColumn(rows, index) {
    return rows.map(r => r[index])
}
function zip(...arrays) {
    return arrays[0].map((r, i) => arrays.map(a => a[i]))
}
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

//https://github.com/tlocke/peakdet/blob/gh-pages/peakdet.js
function peakdet(data, delta){
    //console.log("data is " + data)
    //console.log("delta is " + delta)

    var peaks = [];
    var valleys = [];

    var min = Infinity;
    var max = -Infinity;
    var minPosition = Number.NaN;
    var maxPosition = Number.NaN;

    var lookForMax = true;

    var current;
    // var dbg = [];
    for(var i=0; i < data.length; i++){
        current = parseFloat(data[i]);
        if (isNaN(current) || !isFinite(current)) {
            console.log("Item that's not a number!");
            break;
        }
        if (current > max){
            max = current;
            maxPosition = i;
        }
        if (current < min){
            min = current;
            minPosition = i;
        }
        /*
        dbg.push(
          "looking for max," + lookForMax + ",current," + current + ",pos," +
          i + ",min," + min + ",max," + max + ",delta," + delta + "<br>")
        */

        if (lookForMax){
            if (current < max - delta){
                peaks.push({ "position" : maxPosition, "value" : max});
                min = current;
                minPosition = i;
                lookForMax = false;
            }
        }
        else {
            if (current > min + delta) {
                valleys.push({"position" : minPosition, "value" : min});
                max = current;
                maxPosition = i;
                lookForMax = true;
            }
        }
    }
    return {"peaks" : peaks, "valleys" : valleys};
}

const foo = ""