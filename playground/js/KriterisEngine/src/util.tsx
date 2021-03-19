/* eslint-disable @typescript-eslint/no-unused-vars,no-debugger,@typescript-eslint/no-use-before-define,no-plusplus */
import { TNodeId } from './types'

export function Load() {}
Array.prototype.insertArray = function insertArray(index: number, ...items) {
  const pre = this.slice(0, index)
  const post = this.slice(index + 1)
  return pre.concat(items, post)
}
Array.prototype.findIndex2 = function (value) {
  return this.findIndex((v) => v === value)
}
Array.prototype.last = function last() {
  return this.slice(-1)[0]
}
Array.prototype.equals = function equals(other: []) {
  return arrayEqual(this, other)
}
function arrayEqual(a: any[], b: any[]) {
  return a.every((value, i) => value === b[i])
}

export type TAccessor = { get: () => any; set: (value: any) => void }
export function accessor(target: any, prop: string | number): TAccessor {
  return {
    get() {
      return target[prop]
    },
    set(value: any) {
      target[prop] = value
      return value
    },
  }
}

export function renderTracker() {
  const map = new Map()
  return {
    set(key, value = undefined) {
      map.set(key, value)
      return key
    },
    has(key) {
      return map.has(key)
    },
  }
}

export function idGen() {
  let id: TNodeId = 0
  function getId(): TNodeId {
    return id++
  }
  return getId
}
