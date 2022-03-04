const fs = require("fs");

Array.prototype._pipe = _pipe

function _pipe(...functions) {
    return functions.reduce((value, func) => {
        return func(value)
    }, this);
}

Map.prototype._getOrCreate = function(key, valueFactory) {
    let val = this.get(key)
    if (val) return val;
    val=valueFactory()
    this.set(key,val)
    return val
}
function _chunk (arr, len) {
    var chunks = [],
        i = 0,
        n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}
Array.prototype._chunk = _chunk
Array.prototype._toMap = function() {
    return new Map(this)
}
Array.prototype._last = function() {
    return this[this.length-1]
}
const months = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
}

function stringIndex() {
    const map = new Map()
    let id = 0
    function get(key) {
        if (typeof key === 'number') {
            return map.get(key)
        }
        const value = map.get(key)
        if (value!==null && value!==undefined) {
            return value
        }
        let index = id++
        map.set(key, index)
        map.set(index, key)
        return index
    }
    return {
        get,
        map
    }
}
function fsread(filePath) {
    return fs.readFileSync(filePath, { encoding: 'utf8' })
}
function fswrite(filePath, data) {
    return fs.writeFileSync(filePath,data, { encoding: 'utf8' })
}
const ticksPerDayInv = 1/(1000 * 3600 * 24)
function daysBetween(date1, date2) {
    return (date2.getTime() - date1.getTime()) * ticksPerDayInv
}

module.exports = { months, stringIndex,fsread, fswrite, daysBetween}