interface Array<T> {
  findIndex2(value: T): number
  insertArray(atIndex: number, ...items: number[]): T[]
  last(): T
  equals(b: any[]): boolean
}
