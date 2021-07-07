import '../../App.global.css'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { connect as rrconnect, Provider } from 'react-redux'
import { createStore } from 'redux'
import { stringify } from 'javascript-stringify'
import * as R from 'ramda'
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import cloneDeep from 'clone-deep'
import { bindkeys } from './keybindings'
import { rpath, flatten, swap, setter } from '../../util'
import { ExampleComponentUsage } from '../../components/reactPromise'

const json = JSON.stringify
const store = createStore(Reducer, getInitialState())
function dispatch(type, payload) {
  const d = { type, payload }
  console.log('dispatch', stringify(d))
  store.dispatch(d)
}

function el(type, props = {}) {
  return (...children) => ({
    type,
    props,
    children,
  })
}


function getInitialState() {

  return div({ k_focused: 1, k_root: 1 })(
    span({ k_cursor: 1 })('█')
  )
}
function div(props) {
  setter(props)
    .style.border('1px solid red')
    .style.margin(3)

  return el('div', props)
}
function span(props) {
  return el('span', props)
}
function HandleKeyReducer(action, state) {
  const { key } = action.payload
  const all = flatten(state, (item) => item.type)
  const focused = all.filter((path) =>
    rpath(path, 'value', 'props', 'k_focused')
  )[0]
  const fch = focused.value.children

  const cursorIndex = fch.findIndex((item) => item.props.k_cursor)
  const cursor = fch[cursorIndex]
  if (key === '`') {
    focused.value.props.k_focused=0
    const jumpMenu = div({ k_jumpmenu: 1 })(
      div({ k_jumpmenusearchbox:1, k_focused: 1 })(cursor),
      div({ k_jumpmenuitem:1 })('item1'),
      div({ k_jumpmenuitem:1 })('item2'),
    )
    fch[cursorIndex] = jumpMenu
  } else if (key === 'backspace') {
    cursorIndex > 0 && fch.splice(cursorIndex - 1, 1)
  } else if (key === 'arrowleft') {
    cursorIndex > 0 && swap(fch, cursorIndex - 1, cursorIndex)
  } else if (key === 'arrowright') {
    cursorIndex < fch.length - 1 && swap(fch, cursorIndex + 1, cursorIndex)
  } else if (key === 'delete') {
    fch.splice(cursorIndex + 1, 1)
  } else {
    const keyEl = el('span', { k_key: 1 })(key)
    fch.splice(cursorIndex, 0, keyEl)
  }
}

function Reducer(oldState, action) {
  const state = cloneDeep(oldState)
  if (action.type === 'key') {
    HandleKeyReducer(action, state)
  }
  return state
}

function Render(o) {
  const { type } = o
  if (!type) return o
  const children = o.children.map(Render)
  return React.createElement(type, o.props, children)
}

function App(props) {
  return <ExampleComponentUsage></ExampleComponentUsage>
  const state = store.getState()

  return Render(state)
}

const ConnectedApp = rrconnect((state) => state, {})(App)

export function App7() {
  bindkeys((e) => dispatch('key', e))
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedApp />
    </Provider>,
    document.getElementById('root')
  )
}

// const old = React.createElement
// let log = null
// React.createElement = (type,props, children, ...items) => {
//   log && log({type, props, children, items})
//   return old(type,props,children)
// }
//
// log = console.log
// const foo = <div>
//   foo
//   <span>yo<pre>derp</pre></span>
// </div>
//
// ReactDOM.render(foo,document.createElement('div'))
// log=null
