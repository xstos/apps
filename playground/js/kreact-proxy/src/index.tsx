import './index.css';
import React from "react";
//import hyperactiv from 'hyperactiv'
import {bindkeys} from "./io"
import {customJsx} from "./reactUtil"
import {cellx} from "cellx"
import * as jsondiffpatch from 'jsondiffpatch'
import {toggleClass} from "./domutil"
import clonedeep from "lodash.clonedeep"
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

type TStateSansDiff = typeof initialStateSansDiff
type TState = typeof initialState
type TCreateEvent<T> = (s: TState) => T
type TStateFunc = (o?: Partial<TState>, push?: boolean) => TState
type TRule = (s: TState) => (Partial<TState> | null)

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
      const ret = a(sa,sb) && b(sb)
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

function rule(statePattern: TPattern, stateMutator: TMutator): TRule {
  const predicate = createPredicate(statePattern)
  function result(s: TState): Partial<TState> | null {
    const shouldApplyRule = predicate(s)
    if (!shouldApplyRule) return null
    const ret = mutate(s, stateMutator)
    return ret
  }
  return result
}
function rules(state: TStateFunc) {
  const ruleList: TRule[] = []
  const effectList = []
  function pushRule(statePattern: TPattern, stateMutator: TMutator) {
    ruleList.push(rule(statePattern, stateMutator))
    return pushRule
  }
  function run() {
    const len = ruleList.length
    let dirty = false
    let currentState = clonedeep(state())

    for (let i=0; i < len; i++) {
      const rule = ruleList[i]
      const ruleResult = rule(currentState)
      if (ruleResult === null) continue
      const {next, changed} = stateDiff(currentState,ruleResult)
      if (!changed) {
        continue
      }
      dirty = true
      Object.assign(currentState,ruleResult)
      Object.assign(currentState.diff, next.diff)
    }
    if (!dirty) return
    state(currentState)
    effectList.forEach(r=>r(currentState))
  }
  function wrappedState(o?: Partial<TState>): TState {
    const ret = state(o)
    effectList.forEach(r=>r(ret))
    run()
    return ret
  }
  function effects(statePattern: TPattern, callback: (s: TState)=>void) {
    const pred = createPredicate(statePattern)
    function ret(s: TState) {
      const shouldBroadcast = pred(s)
      if (!shouldBroadcast) return
      callback(s)
    }
    effectList.push(ret)
    return effects
  }
  pushRule.state = wrappedState
  pushRule.effects = effects
  effects.state = wrappedState
  return pushRule
}
function stateDiff(prev: TState, o: Partial<TState>) {
  let { diff, ...prevSansDiff} = prev
  const nextSansDiff = {...prevSansDiff, ...o}
  diff = jsondiffpatch.diff(prevSansDiff, nextSansDiff)
  const next = { diff, ...nextSansDiff}
  return {next, changed: diff!==undefined}
}

function makeStateHistory() {
  const history: TState[] = []

  function pushHistory(s: TState) {
    console.log(JSON.stringify(s.diff), (history.length) + '')
    history.push(s)
  }
  function peekHistory(): TState {
    const index = history.length - 1
    return history[index]
  }

  pushHistory(initialState)

  function state(o?: Partial<TState>, push: boolean = true): TState {
    const prev = peekHistory()
    if (!o) {
      return prev
    }
    const {next, changed} = stateDiff(prev, o)
    if (!changed) {
      return prev
    }

    push && pushHistory(next)
    return next
  }
  return state
}

function hookupEventHandlersFRP() {
  function dragTest(s: TState): boolean {
    const delta = 5
    const diffX = Math.abs(s.x - s.startX)
    const diffY = Math.abs(s.y - s.startY)
    const magnitude = Math.sqrt(diffX * diffX + diffY * diffY)
    const ret = magnitude > delta
    return ret
  }
  const machine = rules(makeStateHistory())
  ({
    mouseState: [any, 'down'],
    dragging: [false,false],
  }, {
    dragging: dragTest
  })
  ({
    dragging: [any, true]
  }, {
    deltaX: (s: TState) => s.x - s.startX,
    deltaY: (s: TState) => s.y - s.startY
  })
  (
    {dragging: [false, true]},
    {
      selectedItemIds: (s: TState) => Array.from(document.querySelectorAll('.sel')).map(el => el.id)
    }
  )
    .effects
  ({
    mouseState: ['down', 'up'],
    dragging: [false, false]
  },onClick)
  ({
      dragging: [any, true]
  },onDrag)

  const {state} = machine

  function onDrag(s) {
    const selected = s.selectedItemIds.map((id)=>document.getElementById(id))
    selected.forEach((n, i) => {
      n.style.position = 'absolute'
      n.style.transform = `translate3d(${s.deltaX}px,${s.deltaY}px, 0px)`;
    })
  }

  function onClick(s) {
    let {el} = s
    el = document.getElementById(el)
    toggleClass(el, 'sel')
    console.log('click')
  }

  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
  function onPointerDown(e) {
    e.preventDefault()
    const [x, y] = [e.clientX, e.clientY]
    let el = e.path[0]
    state({mouseState: 'down', startX: x, startY: y, x, y, el: el.id})
  }
  function onPointerMove(e) {
    e.preventDefault()
    const [x, y] = [e.clientX, e.clientY]
    state({x, y})
  }
  function onPointerUp(e) {
    e.preventDefault()
    let el = e.path[0]
    state({mouseState: 'up', dragging: false})
  }
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

function anythingBut(value) {
  return (compareValue) => value !== compareValue
}

function any() {
  return true
}
function changed(a,b) {
  return [a!==b,true]
}
function funcify(value) {
  if (typeof value === 'function') {
    return value
  }
  return (compareValue) => compareValue === value
}