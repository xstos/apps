import '../../App.global.css'
import { forEach } from 'ramda'
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { bindkeys } from './keybindings'

const { log } = console
const json = JSON.stringify
const state = p({
  jumpMenuOpen: false,
  children: ['/cursor'],
})

const onKey = {
  '`': () => {
    return (state.jumpMenuOpen = !state.jumpMenuOpen)
  },
  abcdefghijklmnopqrstuvwxyz: () => {},
}

export function App2() {
  bindkeys(({ key }) => {
    if (onKey[key]) {
      return onKey[key]()
    }
    const c = Object.keys(onKey).filter((onkey) => onkey.contains(key))
    if (c.length > 0) {
      c[0]()
    }
  })
  // state.jumpMenuOpen.changed(() => {
  //   if (state.jumpMenuOpen) {
  //   }
  // })
  const root = document.getElementById('root')
}
function tail(array) {
  return [_.initial(array), _.last(array)]
}

//https://gist.github.com/tushariscoolster/567c1d22ca8d5498cbc0
function traverse(obj) {
  _.forIn(obj, function (val, key) {
    log(key, val)
    if (_.isArray(val)) {
      val.forEach(function (el) {
        if (_.isObject(el)) {
          traverse(el)
        }
      })
    }
    if (_.isObject(key)) {
      traverse(obj[key])
    }
  })
}
function proxyCtor(target, args) {
  return {}
}

function proxySet(obj, prop, value) {
  log('set', { obj, prop, value })
  return true
}
//traverse({ foo: 'hi' })

const data = {}

function getCreateCell(path: string) {
  let cell = data[path]
  if (!cell) {
    cell = {
      valueType: undefined,
      value: undefined,
      dependents: {},
    }
    data[path] = cell
  }
  return cell
}
function p() {
  let pathStack = []
  const opStack = []
  function proxyGet(target, prop, receiver) {
    pathStack.push(prop)
    log('get', { target, prop, receiver })
    return receiver
  }
  function proxyApply(target, thisArg, argumentsList) {
    log('apply', { target, thisArg, argumentsList })
    log('')
    const [rest, last] = tail(pathStack)
    const path = rest.join('/')
    const [arg] = argumentsList
    function handleSet() {
      const cell = getCreateCell(path)
      if (!_.isObject(arg)) {
        cell.valueType = 'primitive'
        cell.value = arg
      } else if (arg.isProxy()) {
        const value = arg.getValue()
        cell.valueType = 'formula'
        cell.value = value

        value.forEach((f) => {
          const { lhsType, lhs, op, rhsType, rhs } = f
        })
      }
    }
    function handleConcat() {
      //const cell = getCreateCell(path, '')
      if (_.isString(arg)) {
        opStack.push({
          lhsType: 'cell',
          lhs: path,
          op: 'concat',
          rhsType: 'primitive',
          rhs: arg,
        })
        pathStack = []
      }
    }
    if (last === 'set') {
      handleSet()
    } else if (last === 'concat') {
      handleConcat()
    } else if (last === 'isProxy') {
      pathStack = []
      return true
    } else if (last === 'getValue') {
      pathStack = []
      return opStack
    }
    return thisArg
  }
  const handler = {
    construct: proxyCtor,
    get: proxyGet,
    set: proxySet,
    apply: proxyApply,
  }
  function ProxyFunction() {
    return null
  }
  return new Proxy(ProxyFunction, handler)
}

console.clear()

p().foo.bar.set('hello ')
p().foo.baz.set(p().foo.bar.concat('world'))
