import * as R from 'ramda'
//
//
// cell().set(12,3,42).ref("credits")
//
// cell().set(square).ref('sqr')
//
// pipe(ref("credits"), sum)
Array.prototype.pipe = function () {
  pipe(...this)
}
export function pipe(...xs) {
  const byType = R.groupBy((item) => item?.type || typeof item)(xs)
}
const _ = { type: 'undefined', value: undefined }
function plus(...xs) {
  let ret = 0
  const len = xs.length
  for (let i = 0; i < len; i++) {
    ret += xs[i]
  }
  return ret
}
function getMyName() {
  const e = new Error('dummy')
  const stack = e.stack
    .split('\n')[2]
    // " at functionName ( ..." => "functionName"
    .replace(/^\s+at\s+(.+?)\s.+/g, '$1')
    .split('.')[1]
  return stack
}
const funBase = {
  params: [],
  type: 'fun',
}
const string = {
  split: {
    ...funBase,
    value: String.prototype.split,
    separator(value) {
      return param(this, 0, getMyName(), value)
    },
  },
  replace2: {
    ...funBase,
    value: String.prototype.replace,
    searchValue(value) {
      return param(this, 0, getMyName(), value)
    },
    replaceValue(value) {
      return param(this, 1, getMyName(), value)
    },
  },
  trim: fun(String.prototype.trim),
  replace: fun(String.prototype.replace, params({ search: _, replace: _ })),
  concat: fun(String.prototype.concat),
}
function param(o, index, name, value) {
  const ret = R.merge({}, o)
  ret.params[index] = { name, value }
  return ret
}

const numStr = `
1
2
3
4
5
6
`
const foo = string.replace2.replaceValue('replace').searchValue('search')
debugger
const parse = [
  params({ inputStr: _, separator: '\n' }),
  string.trim,
  string.split.separator(ref('separator')),
  map,
  string.concat.curry(' hi there'),
  string.replace.curry({ search: '1', replace: 'one' }),
].pipe()

pipe(numStr, parse)

function fun(f, ...xs) {
  return {
    f,
    curry(...params: any[]) {},
  }
}
function map(...items) {}
function params(args) {
  R.toPairs(args)
}
function paramDecl(name, value: any = undefined) {
  return {
    type: 'param',
    name,
    value,
  }
}
function ref(name) {
  return {
    type: 'paramref',
    name,
  }
}
