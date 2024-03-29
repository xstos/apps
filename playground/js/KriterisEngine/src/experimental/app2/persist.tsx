import '../../App.global.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { connect as rrconnect, Provider } from 'react-redux'
import { createStore } from 'redux'
import { stringify } from 'javascript-stringify'
import { bindkeys } from './keybindings'

const program = {
  statements: [],
}
const store = createStore(Reducer, {})
const ConnectedApp = rrconnect((state) => state, {})(App)
function dispatch(type, payload) {
  const d = { type, payload }
  console.log('dispatch', stringify(d))
  store.dispatch(d)
}
export function Persist() {
  bindkeys(dispatch)
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedApp />
    </Provider>,
    document.getElementById('root')
  )
}
function Reducer(oldState, action) {
  return oldState
}

function App(props) {
  return <pre>{JSON.stringify(program, null, 2)}</pre>
}

const prox = (h) => new Proxy(() => {}, h)
function o(type) {
  if (type === 'set') {
    return prox({
      get(target, name, proxy) {
        return prox({
          apply(target, thisArg, argumentsList) {
            const val = {
              type,
              name,
              value: argumentsList[0],
            }
            program.statements.push(val)
          },
        })
      },
    })
  }
  if (type === 'f') {
    return prox({
      get(target, name, proxy) {
        return prox({
          apply(target, thisArg, args) {
            return prox({
              apply(target, thisArg, body) {
                const f = {
                  type,
                  name,
                  args,
                  body,
                }
                program.statements.push(f)
              },
            })
          },
        })
      },
    })
  }
  if (type === 'arg') {
    return prox({
      get(target, name, proxy) {
        return { type, name }
      },
    })
  }
  if (type === 'ncall') {
    return prox({
      get(target, name, proxy) {
        return prox({
          apply(target, thisArg, args) {
            return {
              type,
              name,
              args,
            }
          },
        })
      },
    })
  }
  if (type === 'get') {
    return prox({
      get(target, name, proxy) {
        return {
          type,
          name,
        }
      },
    })
  }
  if (type === 'call') {
    return prox({
      get(target, name, proxy) {
        return prox({
          apply(target, thisArg, args) {
            const stmt = {
              type,
              name,
              args,
            }
            program.statements.push(stmt)
          },
        })
      },
    })
  }
}

const set = o('set')
const get = o('get')
const f = o('f')
const call = o('call')
const ncall = o('ncall')
const arg = o('arg')
const ret = o('ret')

set.myname('jimmy')

f.toUpper(arg.str)(ncall.toUpperCase(arg.str))

call.toUpper(get.myname)

// ==================================

function quickSort(items, left, right) {
  let index
  if (items.length > 1) {
    index = partition(items, left, right) //index returned from partition
    if (left < index - 1) {
      //more elements on the left side of the pivot
      quickSort(items, left, index - 1)
    }
    if (index < right) {
      //more elements on the right side of the pivot
      quickSort(items, index, right)
    }
  }
  return items
}

function partition(items, left, right) {
  const pivot = items[Math.floor((right + left) / 2)] //middle element
  let i = left //left pointer
  let j = right //right pointer
  while (i <= j) {
    while (items[i] < pivot) {
      i++
    }
    while (items[j] > pivot) {
      j--
    }
    if (i <= j) {
      swap(items, i, j) //sawpping two elements
      i++
      j--
    }
  }
  return i
}
function swap(items, leftIndex, rightIndex){
  var temp = items[leftIndex];
  items[leftIndex] = items[rightIndex];
  items[rightIndex] = temp;
}
