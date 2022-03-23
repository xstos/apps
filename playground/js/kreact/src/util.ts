
declare global {
    interface Object {

    }
    interface Array<T> {
        _insertItemsAtMut(index:Number, ...items: T[]) : T[]
        _findItem(predicate: TPredicate<T>, valueIfNotFound: TPosition<T>) : TPosition<T>
        _findIndexes(predicate: TPredicate<T>): number[]
        _removeItem(item:T): T[]
    }

}
export type TPosition<T> = [number, T]
export function isNum(v: any) {
    return typeof v === "number"
}
Array.prototype._removeItem = function<T>(item:T) {
    const ix = this.findIndex((o)=>item===o)
    if (ix===-1) return this
    this.splice(ix,1)
    return this
}
Array.prototype._insertItemsAtMut = function<T>(index: number, ...items: T[]): T[] {
    this.splice(index,0,...items)
    return this
}
Array.prototype._findIndexes = function<T>(predicate: TPredicate<T>): number[] {
    const l = this.length
    const ret = []
    let temp
    for (let i = 0; i < l; i++) {
        temp=this[i]
        if (predicate(temp, i, this)) ret.push(temp)
    }
    return ret
}
export type TPredicate<T> = (value: T, index: number, obj: T[]) => unknown

Array.prototype._findItem = function<T>(predicate: TPredicate<T>, valueIfNotFound: TPosition<T>): TPosition<T> {
    const ret = this.findIndex(predicate)
    if (ret===-1) return valueIfNotFound
    return [ret,this[ret]]
}

export function setStyles() {

    const html = document.documentElement.style
    const body = document.body.style
    const root = document.getElementById('root').style
    const zero = "0px"
    html.margin=zero
    html.padding=zero
    body.margin=zero
    body.padding=zero
    html.width=body.width="100vw"
    html.minHeight=body.minHeight="100vh"
    root.width="100%"
    root.margin=zero
    root.padding=zero
    html.backgroundColor = "black"
    html.color = "white"
}


export function isPrimitive(arg) {
    const type = typeof arg;
    return arg == null || (type != "object" && type != "function") ? [type, null] : [null, Array.isArray(arg) ? "array" : type];
}

//https://stackoverflow.com/questions/10464844/is-there-a-way-to-auto-expand-objects-in-chrome-dev-tools/27610197#27610197
export function expandedLog(item, maxDepth = 100, depth = 0) {
    if (depth > maxDepth) {
        console.log(item);
        return;
    }
    if (typeof item === 'object' && item !== null) {
        Object.entries(item).forEach(([key, value]) => {
            const [primType, nonPrimType] = isPrimitive(value)

            if (primType) {
                console.log(key + ": " + value)
                return;
            }
            console.group(key + ' : ' + nonPrimType);
            expandedLog(value, maxDepth, depth + 1);
            console.groupEnd();
        });
    } else {
        console.log(item);
    }
}

export function logj(o) {
    return console.log(JSON.stringify(o,null,2))
}
export function equals(a,b) {
    return a===b
}
export function equalsAny(value,...args) {
    return args.find((arg)=>equals(value,arg))
}

export function swapIndexes<T>(array: T[], first: number, second:number): T[] {
    const old = array[first]
    array[first]=array[second]
    array[second]=old
    return array
}