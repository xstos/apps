/* eslint-disable @typescript-eslint/no-unused-vars,no-debugger,@typescript-eslint/no-use-before-define,no-plusplus */
import * as _ from 'lodash'
import * as R from 'ramda'
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

export function isFunction(thing: any) {
  return typeof thing === 'function' && thing?.call
}

const tostr = {}.toString

export function toType(obj) {
  return tostr
    .call(obj)
    .match(/\s([a-zA-Z]+)/)[1]
    .toLowerCase()
}

export function last(array, valueIfNotFound = undefined) {
  const len = array.length
  if (len === 0) return valueIfNotFound
  return array[len - 1]
}
function entries2(o) {
  if (_.isArray(o)) {
    return o.map((value, key) => [key, value])
  }
  if (_.isObject(o)) {
    return Object.entries(o)
  }
  return []
}

/**
 * recursively loops through obj to build a property list
 * @param obj
 * @returns {Array<*>|Array<void>}
 * @see https://stackoverflow.com/questions/15690706/recursively-looping-through-an-object-to-build-a-property-list
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield
 */
export function flatten(obj, predicate=(()=>true)) {
  const ret2 = []
  //todo unit test
  function iter(
    o,
    currentPath = [],
    currentAncestors = [],
    cachedEntries = null
  ) {
    const entries = cachedEntries || entries2(o)
    for (const [key, value] of entries) {
      const path = [...currentPath, key]
      const ancestors = [...currentAncestors, o]
      const childEntries = entries2(value)
      const ret = {
        value,
        parent: o,
        path,
        ancestors,
        isLeaf: childEntries.length < 1,
      }
      predicate(value) && ret2.push(ret)
      iter(value, path, ancestors, childEntries)
    }
  }
  ret2.push({
    value:obj,
    parent: null,
    path: [],
    ancestors: [],
    isLeaf: entries2(obj).length < 1,
  })
  iter(obj)
  return ret2
}

export function rpath(o, ...items) {
  return R.path(items, o)
}

export function swap(array, index1, index2) {
  const first = array[index1]
  const second = array[index2]
  array[index1] = second
  array[index2] = first
}

export function setter(o) {
  const props = []
  function get(target, prop, proxy) {
    props.push(prop)
    return proxy
  }
  function apply(target, proxy, argumentsList) {
    props.reduce((accum, currentValue, currentIndex)=>{
      if (currentIndex===props.length-1) {
        accum[currentValue]=argumentsList[0]
        return
      }
      let ret = accum[currentValue]
      if (!ret) {
        ret = {}
        accum[currentValue] = ret
      }
      return ret
    },o)
    props.length =0
    return proxy
  }
  return new Proxy(()=>{}, {
    get,
    apply,
  })
}

