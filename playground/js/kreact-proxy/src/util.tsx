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