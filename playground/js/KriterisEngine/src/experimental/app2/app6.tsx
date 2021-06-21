import '../../App.global.css'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { connect as rrconnect, Provider } from 'react-redux'
import { createStore } from 'redux'
import cloneDeep from 'clone-deep'
import { stringify } from 'javascript-stringify'
import * as R from 'ramda'
import { Subject } from 'rxjs'
import { bindkeys } from './keybindings'

const ev = {
  kb: '',
}
Object.keys(ev).map(key=>ev[key]=key)

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

function getInitialState() {
  return {
    children: [],
  }
}

function handle(map, action) {
  const f = map[action.type]
  f && f()
}

function Reducer(oldState, action) {
  const { type, payload } = action
  const state = cloneDeep(oldState)
  handle(
    {
      [ev.kb]() {
        state.children.push(payload.key)
      },
    },
    action
  )
  return state
}

function App(props) {
  const { children } = getState()
  return (
    <div>
      {children.map((c) => (
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
