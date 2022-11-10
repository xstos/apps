import './index.css';
import React from "react";
//import hyperactiv from 'hyperactiv'
import {bindkeys} from "./io"
import {customJsx} from "./reactUtil"
import {cellx} from "cellx"
import * as jsondiffpatch from 'jsondiffpatch'
import {toggleClass} from "./domutil"
//import {BoxComponent, DragDropDemo} from "./dragdrop"
//const {observe, computed} = hyperactiv
type Pred<T> = (value: T) => boolean
type Callback<T> = (value: T) => any
type TMutator = { [key: string]: Function }
type TStatePatternMatcher = Function | string | number | boolean
type TPattern = { [key: string]: [TStatePatternMatcher, TStatePatternMatcher] }

let elIds = 1
let jsxCallback = customJsx

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return jsxCallback(type, props, ...children)
}

const rootEL = document.getElementById('root')
document.body.style.fontFamily = "monospace, sans-serif"
document.body.style.fontSize = "24pt"
document.body.style.color = "grey"
document.body.style.backgroundColor = "rgb(28,28,28)"

//makeGLRenderer()
//proxyWrapperDemo()

bindkeys((data) => {
  const {key} = data
  addKey(key)
})

function addKey(key) {
  const myjsx = <span>{key}</span>
  const el2 = render(myjsx)
  rootEL.appendChild(el2)
  console.log(myjsx)
}

'hello'.split('').map(addKey)

function render(jsx) {
  const ret = document.createElement(jsx.type)
  if (jsx.type === 'span') {
    ret.tabIndex = 0
    ret.style.cursor = 'pointer'
    ret.classList.add('drg')
    ret.id = elIds++
  }
  if (jsx.children) {
    const children = jsx.children.map(c => {
      if (typeof c === 'string') {
        return document.createTextNode(c)
      }
      const ret2 = render(c)
      return ret2
    })
    children.forEach(childNode => ret.appendChild(childNode))
  }

  return ret
}

//todo box dragger https://codepen.io/knobo/pen/WNeMYjO
const initialStateSansDiff = {
  mouseState: 'unknown',
  startX: 0,
  startY: 0,
  x: 0,
  y: 0,
  dragging: false,
  el: -1,
}

const initialState = {
  ...initialStateSansDiff,
  diff: jsondiffpatch.diff({}, initialStateSansDiff)
}

function checkIfDragging(s: TState): boolean {
  const delta = 5
  const diffX = Math.abs(s.x - s.startX)
  const diffY = Math.abs(s.y - s.startY)
  const magnitude = Math.sqrt(diffX * diffX + diffY * diffY)
  const ret = magnitude > delta
  return ret
}

type TState = typeof initialState
type TCreateEvent<T> = (s: TState) => T

function createPredicate(statePattern: TPattern) {
  const predicates = Object.entries(statePattern).map((pair) => {
    const [key, value] = pair
    const [a, b] = value.map(funcify)

    function result(s: TState) {
      const diff = s.diff
      const hasDiff = key in diff
      const pair = hasDiff ? diff[key] : [s[key], s[key]]
      if (pair.length < 2) {
        return false
      }
      const [sa, sb] = pair
      const ret = a(sa) && b(sb)
      return ret
    }

    return result
  })

  function ret(s: TState): boolean {
    return predicates.every(p => p(s))
  }

  return ret
}
function mutate(s: TState, stateMutator: TMutator) {
  const newStates = Object.entries(stateMutator).map((pair) => {
    const [key, value] = pair
    return [key, value(s)]
  })
  const ret = Object.fromEntries(newStates)
  return ret
}
function rule(statePattern: TPattern, stateMutator: TMutator) {
  const predicate = createPredicate(statePattern)

  function result(s: TState): Partial<TState> | null {
    const shouldApplyRule = predicate(s)
    if (!shouldApplyRule) return null
    const ret = mutate(s, stateMutator)
    return ret
  }

  return result
}
function rules(state: TStateFunc, ...mutators: [TPattern, TMutator][]) {
  const ruleList = mutators.map(([p, m]) => rule(p, m))
  function pushRule(statePattern: TPattern, stateMutator: TMutator) {
    ruleList.push(rule(statePattern, stateMutator))
    return pushRule
  }
  function run() {
    const len = ruleList.length
    let i = 0
    let numIter = 0
    while (true) {
      numIter++
      if (numIter > 10000) {
        debugger
      }
      for (i; i < len; i++) {
        const rule = ruleList[i]
        const prev = state()
        const ruleResult = rule(prev)
        if (ruleResult === null) continue
        const newState = state(ruleResult)
        if (prev === newState) continue
        break
      }
      if (i >= len) {
        break
      }
    }
  }
  pushRule.run = run
  return pushRule
}
type TStateFunc = (o?: Partial<TState>) => TState

function hookupEventHandlersFRP() {

  const history: TState[] = []
  const stateCell = cellx(initialState)

  function pushHistory(s: TState) {
    console.log(JSON.stringify(s.diff), (history.length) + '')
    history.push(s)
    stateCell(s)
  }

  function peekHistory(): TState {
    const index = history.length - 1
    return history[index]
  }

  pushHistory(initialState)

  function state(o?: Partial<TState>): TState {
    const prev = peekHistory()
    if (!o) {
      return prev
    }
    const ret = {...prev, ...o}
    const diff = jsondiffpatch.diff(prev, ret)
    if (diff === undefined) {
      return prev
    }
    ret.diff = diff
    pushHistory(ret)
    return ret
  }
  
  function effect<T>(statePattern: TPattern, createEvent: TCreateEvent<T>) {
    const effectCell = cellx(createEvent(peekHistory()))
    const pred = createPredicate(statePattern)
    cellx(() => {
      const state = stateCell()
      const shouldBroadcast = pred(state)
      if (!shouldBroadcast) return
      const e = createEvent(state)
      effectCell(e)
    }).onChange(() => {
    })
    return effectCell
  }

  const machine = rules(state)
  ({
    mouseState: [any, 'down'],
    dragging: [any, complement(true)],
  }, {
    dragging: checkIfDragging
  })
  ({
    dragging: [any, true]
  }, {
    deltaX(s: TState) {
      return s.x - s.startX
    },
    deltaY(s: TState) {
      return s.y - s.startY
    }
  })

  effect({
    mouseState: ['down', 'up'],
    dragging: [false, false]
  }, (s) => ({type: 'click', el: s.el}))
    .onChange(e => {
      const eventData = e.data.value
      let {el} = eventData
      el = document.getElementById(el)
      toggleClass(el, 'sel')
      console.log(eventData)
    })


  effect({
    dragging: [any, true]
  }, (s) => s).onChange(e => {
    const s = e.data.value
    const selected = Array.from(document.querySelectorAll('.sel'))
    selected.forEach((n, i) => {
      n.style.position = 'absolute'
      n.style.transform = `translate3d(${s.deltaX}px,${s.deltaY}px, 0px)`;
    })
  })

  document.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    const [x, y] = [e.clientX, e.clientY]
    let el = e.path[0]
    state({mouseState: 'down', startX: x, startY: y, x, y, el: el.id})
  })
  document.addEventListener('pointermove', (e) => {
    e.preventDefault()
    const [x, y] = [e.clientX, e.clientY]
    state({x, y})
  })
  document.addEventListener('pointerup', (e) => {
    e.preventDefault()
    let el = e.path[0]
    state({mouseState: 'up', dragging: false})
  })

  cellx(() => {
    const s = stateCell()
    //console.log('run')
    machine.run()
  }).onChange(() => {
  })
}

function hookupEventHandlers() {
  const emptyHandler = e => false
  let isClick = emptyHandler
  let handleMove = emptyHandler
  let dragItemsToCursor = emptyHandler
  let resetDraggedItems = emptyHandler
  document.addEventListener('pointerdown', (clickEvent) => {
    const targ = clickEvent.path[0]
    if (!targ.classList.contains('drg')) return
    isClick = (e) => {
      const delta = 6
      const diffX = Math.abs(e.clientX - clickEvent.clientX);
      const diffY = Math.abs(e.clientY - clickEvent.clientY);
      return diffX < delta && diffY < delta
    }
    handleMove = (firstMoveEvent) => {
      if (isClick(firstMoveEvent)) return
      firstMoveEvent.preventDefault()
      handleMove = (startDragMoveEvent) => {
        const selected = Array.from(document.querySelectorAll('.sel'))
        const oldStyles = selected.map(n => ({p: n.style.position, t: n.style.transform}))
        const selectedBounds = selected.map(s => s.getBoundingClientRect())
        dragItemsToCursor = (dragEvent) => {
          const [deltaX, deltaY] = [dragEvent.clientX - clickEvent.clientX, dragEvent.clientY - clickEvent.clientY]
          selected.forEach((n, i) => {
            n.style.position = 'absolute'
            n.style.transform = "translate3d(" + deltaX + "px," + deltaY + "px, 0px)";
          })
        }
        resetDraggedItems = () => {
          selected.forEach((n, i) => {
            n.style.position = oldStyles[i].p
            n.style.transform = oldStyles[i].t
          })
          resetDraggedItems = emptyHandler
        }
        dragItemsToCursor(startDragMoveEvent)
        handleMove = (dragInProgressEvent) => {
          dragItemsToCursor(dragInProgressEvent)
        }
      }
    }

  }, {passive: false})
  document.addEventListener('pointermove', (e) => {
    handleMove(e)
  }, {passive: false})
  document.addEventListener('pointerup', (e) => {
    if (isClick(e)) {
      const el = e.path[0]
      toggleClass(el, 'sel')
    }
    resetDraggedItems(e)
    handleMove = emptyHandler
    isClick = emptyHandler
  }, {passive: true})
}

hookupEventHandlersFRP()

function complement(value) {
  return (compareValue) => value !== compareValue
}

function any() {
  return true
}

function funcify(value) {
  if (typeof value === 'function') {
    return value
  }
  return (compareValue) => compareValue === value
}