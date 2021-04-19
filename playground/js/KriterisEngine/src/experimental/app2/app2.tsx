import '../../App.global.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { connect as rrconnect, Provider } from 'react-redux'
import { createStore } from 'redux'
import cloneDeep from 'clone-deep'
import { stringify } from 'javascript-stringify'
import * as R from 'ramda'
import { bindkeys } from './keybindings'
import { last, toType } from '../../util'

const json = JSON.stringify
const store = createStore(Reducer, getInitialState())
function dispatch(type, payload) {
  const d = { type, payload }
  console.log('dispatch', JSON.stringify(d))
  store.dispatch(d)
}

function getInitialState() {
  //our initial redux state store
  return {
    number: 0,
  }
}

function stateTransitionReducer(oldState, action) {
  const { current, input, next } = action
  const state = cloneDeep(oldState)
}

function Reducer(state, action) {
  const { type } = action
  if (type === 'state_transition') {
    return stateTransitionReducer(state, action)
  }
  return state
}

function App(props) {
  return <div>hi</div>
}

const transitions = [
  ['start', { key: '`' }, 'menu'],
  ['menu', { key: 'escape' }, 'start'],
]

function makeMachine(initialState, transitions, dispatch) {
  const machine = {
    currentState: initialState,
  }
  transitions.forEach(([currentState, input, nextState]) => {
    const key = `${currentState}.${JSON.stringify(input)}`
    machine[key] = nextState
  })
  function sendKey(o) {
    const input = JSON.stringify(o)
    const next = machine[`${machine.currentState}.${input}`]
    if (!next) {
      //console.log(`no transition from ${machine.currentState} by ${input}`)
      return
    }
    dispatch('state_transition', {
      current: machine.currentState,
      input: o,
      next,
    })
    machine.currentState = next
  }
  return {
    sendKey,
  }
}

const ConnectedApp = rrconnect((state) => state, {})(App)

export function App2() {
  const stateMachine = makeMachine('start', transitions, dispatch)
  bindkeys(stateMachine)
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedApp />
    </Provider>,
    document.getElementById('root')
  )
}
const immutable = {
  array: {
    push(...args) {
      const clone = [...this]
      clone.push(...args)
      return clone
    },
  },
  number: {
    divide(...args) {
      return this / args.reduce((acc, item) => acc * item)
    },
  },
}

function getImmutable(type, prop) {
  const proto = immutable[type]
  if (!proto) return false
  const method = proto[prop]
  return method
}

function getMember(o, prop) {
  return o[prop] || R.path([toType(o), prop], immutable)
}
const handler = {
  get(target, name, proxy) {
    const { value, stack, mode } = target
    if (!value) return proxy
    const valueType = toType(value)
    stack.push({ name })

    const apply =
      value[name] || (mode === 'each' && getMember(last(value), name))

    if (!apply) {
      switch (name) {
        case 'each':
          target.mode = 'each'
          return proxy
      }
    }

    const memberType = toType(apply)
    if (memberType === 'function') {
      const immut = getImmutable(valueType, name)
      target.method = { name, apply, immut }
    }
    return proxy
  },
  set(target, prop, value, proxy) {
    return true
  },
  apply(target, proxy, argumentsList) {
    const { value, method, mode, stack } = target
    //console.log({ value, method, mode, stack })
    const lastProp = last(stack)
    if (lastProp.name === 'each') {
      return proxy //nothing to apply
    }
    const valueType = toType(value)
    if (method) {
      const { name, apply, immut } = method
      const arity = apply.length
      const stringifiedArgs = argumentsList
        .map((arg) => stringify(arg))
        .join(',')
      const code = `${stringify(value)}.${name}(${stringifiedArgs})`
      if (!mode) {
        const ret = (immut || apply).call(value, ...argumentsList)
        console.log(code, stringify(ret))
        target.method = undefined
        target.value = ret
      }

      if (mode === 'each') {
        if (valueType === 'array') {
          const ret = value.map((item) =>
            (immut || apply).call(item, ...argumentsList)
          )
          console.log(code, stringify(ret))
          target.method = undefined
        }
      }
    }
    return proxy
  },
}

function p(value = undefined) {
  const target = () => {}
  target.stack = []
  target.value = value
  console.log(json(value))
  const ret = new Proxy(target, handler)
  return ret
}

p([1, 2, 3]).push(4).each().divide(2)

function next() {
  p(`
 hello (1)
  goodbye (2)
 derp (3)

`)
    .trim()
    .split('\r\n')
    .each()
    .trim()
    .replace()
    .do((i) => `(${i + 1})`)
    .spread(p().get('fruits'))

  p(`
apple
banana
pear
`)
    .trim()
    .split('\r\n')
    .trim()
    .set('fruits')
}
