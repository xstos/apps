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