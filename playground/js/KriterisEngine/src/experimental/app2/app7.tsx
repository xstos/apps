import '../../App.global.css'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { connect as rrconnect, Provider } from 'react-redux'
import { createStore } from 'redux'
import { stringify } from 'javascript-stringify'
import * as R from 'ramda'
import * as _ from 'lodash'
import cloneDeep from 'clone-deep'
import { bindkeys } from './keybindings'
import { getPath, getPaths } from '../../util'

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
  return el('div', { k_focused: 1, k_root: 1 })(
    el('span', { k_cursor: 1 })('█')
  )
}

function Reducer(oldState, action) {
  const state = cloneDeep(oldState)
  if (action.type === 'key') {
    const key = action.payload.key
    const all = getPaths(state, (item) => item.type)
    const focused = all.filter((path) =>
      getPath(path, 'value', 'props', 'k_focused')
    )[0]
    const cursorIndex = focused.value.children.findIndex(
      (item) => item.props.k_cursor
    )

    if (key === '`') {

    } else if (key === 'backspace') {
      cursorIndex > 0 && focused.value.children.splice(cursorIndex - 1, 1)
    } else if (key === 'arrowleft') {
      
    } else if (key === 'arrowright') {

    }
    else {
      const keyEl = el('span', { k_key: 1 })(key)
      focused.value.children.splice(cursorIndex, 0, keyEl)
    }
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
