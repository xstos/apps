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
export function log(...items: any[]) {
  console.log(...items)
}
export function proxy(ctor, get, apply) {
  let handler = null
  handler = {
    get(target, key) {
      if (key.startsWith('_')) {
        return target[key]
      }
      const data = target._data
      get(data,key)
      return new Proxy(target, handler)
    },
    /*
    apply(target, thisArg, args) {
      const data = target._data
      data.args = args.map(a => {
        if (a._data) {
          a._data.root = false
        }
        return a._data ? a._data : a
      })
      return new Proxy(target, handler)
    },
    */
  }

  const f = () => { }
  const data = { }
  f._data = data
  ctor(data)
  return new Proxy(f, handler)
}
export function debouncer<T>(timeout: number, callback: (value: T) => void) {
  let lastValue: T, wasSet = false
  const handle = setInterval(() => {
    if (!wasSet) return
    callback(lastValue)
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