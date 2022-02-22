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

Array.prototype._toMap = function() {
    return new Map(this)
}

const months = 'jan feb mar apr may jun jul aug sep oct nov dec'
    .split(' ')
    .map((str,index) => [str,index] )
    ._pipe(Object.fromEntries)

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
module.exports = { months, stringIndex,fsread, fswrite }