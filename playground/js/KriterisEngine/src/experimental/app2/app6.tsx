import '../../App.global.css'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { connect as rrconnect, Provider } from 'react-redux'
import { createStore } from 'redux'
import cloneDeep from 'clone-deep'
import { stringify } from 'javascript-stringify'
import * as R from 'ramda'
import * as lodash from 'lodash'
import { Subject } from 'rxjs'
import { bindkeys } from './keybindings'

const objects = new WeakMap()

const state = {
  values: []
}

let idseed = 0
Object.defineProperty(Array.prototype, '$', {
  get() {
    const that = this
    console.log(this)
    let ret = null
    const stack = []
    let f = null

    if (!that.$id) {
      that.$id = ++idseed
    }
    function get(target, prop, receiver) {
      log('get', { target, prop, receiver })
      switch (prop) {
        case 'push':
          f=prop
          break
      }
      return receiver
    }
    function apply(target, thisArg, argumentsList) {

    }
    ret = new Proxy(() => {}, {
      get,
      apply,
    })
    return ret
  },
})

const test = [].$
test.push(1)

const ev = {
  kb: '',
}
const keys = {
  tilde: '`',
}

Object.keys(ev).map((key) => (ev[key] = key))

const bus = new Subject()
bus.subscribe((evt) => {
  console.log(evt)
})

const store = createStore(Reducer, getInitialState())
const { getState } = store
const ConnectedApp = rrconnect((state) => state, {})(App)

function dispatch(type, payload) {
  const d = { type, payload }
  console.log('dispatch', stringify(d))
  store.dispatch(d)
}

function enumdefInit(o) {
  const { is, set } = o
  o.values.forEach((value) => {
    Object.defineProperty(is, value, {
      get() {
        return o.value === value
      },
    })
    Object.defineProperty(set, value, {
      get() {
        return (o.value = value)
      },
    })
  })
  return o
}

function $enum(...values) {
  const o = {
    $type: 'enum',
    is: {},
    set: {},
    value: values[0],
    values,
  }
  return enumdefInit(o)
}

const e = $enum('true', 'false')

function getInitialState() {
  return {
    cmd: $enum('false', 'true'),
    root: {
      id: 0,
      type: 'div',
      props: {
        children: [],
      },
    },
  }
}
const _ = ''
function match(on, map) {
  let f = map[on]
  if (f) {
    f()
  } else {
    f = map[_]
    f && f()
  }
}
function Reducer(oldState, action) {
  const { type, payload } = action
  const state = cloneDeep(oldState)

  match(action.type, {
    [ev.kb]() {
      const { key } = payload
      match(key, {
        ['`']() {
          state.cmd = !state.cmd
        },
        [_]() {
          match(state.cmd, {
            ['true']() {
              match(key, {
                ['backspace']() {
                  state.root.props.children.pop()
                },
                [_]() {
                  state.root.props.children.push(key)
                },
              })
            },
          })
        },
      })
    },
  })
  return state
}

function App(props) {
  const state = getState()
  return (
    <div>
      {state.root.props.children.map((c) => (
        <span>{c}</span>
      ))}
    </div>
  )
}

export function App6() {
  bindkeys((evt) => {
    dispatch(ev.kb, evt)
  })
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedApp />
    </Provider>,
    document.getElementById('root')
  )
}

class X extends React.Component {
  constructor(props) {
    super(props)
    this.componentDidMount = () => {}
    this.componentWillUnmount = () => {}
    this.render = () => {}
  }
}
