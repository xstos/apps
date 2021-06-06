import '../../App.global.css'
import React, { useEffect } from 'react'
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
  console.log('dispatch', stringify(d))
  store.dispatch(d)
}

function getInitialState() {
  //our initial redux state store
  return {
    number: 0,
  }
}
const [tilde, is, keydown] = ['`', 'is', 'keydown']

function Reducer(state, action) {
  return state
}

function App(props) {
  return (
    <X div>
      one
      <X button>two</X>
    </X>
  )
}

const ConnectedApp = rrconnect((state) => state, {})(App)

export function App3() {
  bindkeys(dispatch)
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedApp />
    </Provider>,
    document.getElementById('root')
  )
}

// function XX(props) {
//   const type = R.intersection(Object.keys(props), ['div', 'button'])[0]
//   useEffect(() => {}, [])
//   return React.createElement(
//     type,
//     {
//       ref: (el) => console.log(el),
//     },
//     props.children
//   )
// }
let idSeed = 1
function X(props) {
  const { children } = props
  function constructor(instance) {
    instance.id = idSeed++
  }
  function componentDidMount(instance) {
    console.log(instance.id)
  }
  function render(instance) {
    const chi =
      (children && Array.isArray(children) && children.map(derp))

    function derp(child) {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { id: instance.id }, child.props.children)
      }
      return child
    }

    return (
      <div>
        {instance.id}
        {chi || children}
      </div>
    )
  }

  return <XBase {...{ constructor, componentDidMount, render }} />
}

class XBase extends React.Component {
  constructor(props) {
    super(props)
    const instance = this
    props.constructor && props.constructor(instance)
    this.componentDidMount = () =>
      props.componentDidMount && props.componentDidMount(instance)
    this.render = () => props.render && props.render(instance)
  }
}
