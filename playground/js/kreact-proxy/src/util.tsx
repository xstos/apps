const proxies = new WeakSet();
export function getAllIndexes<T>(arr: T[], predicate: (value: T) => boolean) {
  var indexes = []
  const len = arr.length
  for (let i = 0; i < len; i++) {
    if (predicate(arr[i])) {
      indexes.push(i)
    }
  }
  return indexes;
}
export function filter<T>(o: object, pred: (key: string,value: any) => boolean) {
  const entries = Object.entries(o)
  const filtered = entries.filter(([k,v])=> pred(k,v))
  if (filtered.length===0) return null
  return Object.fromEntries(filtered)
}
let count = 0
export function log(...items: any[]) {
  console.log(count++,...items)
}
export function proxy(ctor, get, apply) {
  let handler = null
  let ret = null
  const f = () => { }
  handler = {
    get(target, key) {
      if (key.startsWith('_')) {
        return target[key]
      }
      const data = target._data
      get(data,key)
      return ret
    },
    apply(target, thisArg, args) {
      const data = target._data
      apply(data,args)
      return ret
    },
  }
  const data = { }
  f._data = data
  ctor(data)
  ret = new Proxy(f, handler)
  proxies.add(ret)
  return ret
}
//https://stackoverflow.com/a/67382561/1618433
export function isProxy(obj) {
  return proxies.has(obj)
}
export function debouncer<T>(timeout: number, callback: (value: T) => void) {
  let lastValue: T, wasSet = false
  const handle = setInterval(() => {
    if (!wasSet) return
    callback(lastValue)
    wasSet = false
  }, timeout)

  function set(value: T) {
    wasSet = true
    lastValue = value
  }
  function off() {
    clearInterval(handle)
  }
  set.off = off
  return set
}
export function numbersBetween(first: number,last: number): Iterable<number> {
  function iter() {
    let i = first;
    return {
      next() {
        if (i>last) return {value: i, done: true}
        return {value: i++, done: false}
      },
    };
  }
  const ret = {
    [Symbol.iterator]: iter,
    map
  }
  function map<T>(mapfn: (v: number, i: number) => T) {
    return Array.from(ret,mapfn)
  }
  return ret
}
export function typename(o) {
  if (o===undefined) return "undefined"
  else if (o===null) return "null"
  if (Array.isArray(o)) return "array"
  if (isProxy(o)) return "proxy"
  const t = typeof o
  return t
}
export function has(o: any,...keys:string[]): boolean {
  if (typeof o !== "object") return false
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (!(key in o)) return false
  }
  return true
}