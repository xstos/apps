import './index.css';
import React from "react";
//import hyperactiv from 'hyperactiv'
import {bindkeys} from "./io"
import {customJsx} from "./reactUtil"
import {cellx} from "cellx"
import * as jsondiffpatch from 'jsondiffpatch'
import {hasClass, insertAfter, insertBefore, toggleClass, unmount} from "./domutil"
import clonedeep from "lodash.clonedeep"
import {filter, log} from "./util"
import {Delta} from "jsondiffpatch"
//import {BoxComponent, DragDropDemo} from "./dragdrop"
//const {observe, computed} = hyperactiv
type Pred<T> = (value: T) => boolean
type Callback<T> = (value: T) => any
//todo: idea: typescript needs map filter reduce i.e. pairs(SomeType).map(pair=> SomeOtherType)
type PartialState = Partial<TState>
type TMutatorObj = { [Prop in keyof PartialState]: Function | PartialState[Prop] }
type TMutatorFun = (s: TState) => TMutatorObj
type TMutator = TMutatorObj | TMutatorFun
type TStatePatternMatcher<T> = Function | T
type TPattern = { [Prop in keyof PartialState]: [TStatePatternMatcher<PartialState[Prop]>, TStatePatternMatcher<PartialState[Prop]>] | Function }
const NOKEY = '$NIL'
const CURSORKEY = '█'
let elIds = 1
let jsxCallback = customJsx
const dummyEl = document.createElement('div')
const rootEL = elById('root')
export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return jsxCallback(type, props, ...children)
}
function setStyles() {
  document.body.style.fontFamily = "monospace, sans-serif"
  document.body.style.fontSize = "24pt"
  document.body.style.color = "grey"
  document.body.style.backgroundColor = "rgb(28,28,28)"
}
setStyles()

//makeGLRenderer()
//proxyWrapperDemo()

function addKey(key: string) {
  const myjsx = <span id={'' + elIds++}>{key}</span>
  // @ts-ignore
  const el2 = render(myjsx)
  rootEL.appendChild(el2)
  //log(myjsx)
}

//'hello'.split('').map(addKey)

type TJsx = { type: string; props: { [key: string]: any }, children: any[]; }
function render(jsx: TJsx) {
  const ret = document.createElement(jsx.type)
  if (jsx.type === 'span') {
    ret.tabIndex = 0
    ret.style.cursor = 'default'
    ret.classList.add('drg')
    ret.id = jsx.props.id
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
  mouseButton: -1,
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  x: 0,
  y: 0,
  dragging: false,
  el: '',
  hoverElId: '',
  hoverBounds: {
    left: 0,
    right: 0,
    width: 0
  },
  hoverBefore: true,
  selectedItemIds: [],
  key: NOKEY,
  nodes: T<TNode[]>([]),
  lastId: 0,
}
const initialState = {
  ...initialStateSansDiff,
  diff: T<Delta>(jsondiffpatch.diff({}, initialStateSansDiff) as Delta),
}

type TStateSansDiff = typeof initialStateSansDiff
type TNode = { id: number, v: string }
type TState = typeof initialState
type TCreateEvent<T> = (s: TState) => T
type TStateFunc = ((o?: Partial<TState>, push?: boolean) => TState) & { getPrevious: () => TState }
type TRule = (s: TState) => (Partial<TState> | null)

function createPredicate(statePattern: TPattern) {
  const predicates = Object.entries(statePattern).map((pair) => {
    let [key, value] = pair
    if (typeof value === "function") {
      value = [value, any]
    }
    const [a, b] = value.map(funcify)

    function result(s: TState) {
      const diff = s.diff
      if (!diff) {
        throw new Error("wtf")
      }
      const hasDiff = key in diff
      let pair: any
      if (hasDiff) {
        pair = diff[key]
      } else {
        // @ts-ignore
        pair = [s[key], s[key]]
      }
      if (pair.length < 2) {
        return false
      }
      const [sa, sb] = pair
      const ret = a(sa, sb) && b(sb)
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
  if (typeof stateMutator === "function") {
    stateMutator = stateMutator(s)
  }
  const newStates = Object.entries(stateMutator).map((pair) => {
    let [key, value] = pair
    if (typeof value === "function") {
      value = value(s)
    }
    return [key, value]
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
  type TStateTransitionCallback = (curState: TState, prevState: TState) => void
  const effectList: TStateTransitionCallback[] = []

  function pushRule(statePattern: TPattern, stateMutator: TMutator) {
    ruleList.push(rule(statePattern, stateMutator))
    return pushRule
  }

  function run() {
    const len = ruleList.length
    let dirty = false
    let currentState = clonedeep(state())

    for (let i = 0; i < len; i++) {
      const rule = ruleList[i]
      const ruleResult = rule(currentState)
      if (ruleResult === null) continue
      const next = stateDiff(currentState, ruleResult)
      if (!next) {
        continue
      }
      dirty = true
      Object.assign(currentState, ruleResult)
      Object.assign(currentState.diff, next.diff)
    }
    if (!dirty) return
    state(currentState)
    const prevState = state.getPrevious()
    effectList.forEach(r => r(currentState, prevState))
  }

  function wrappedState(o?: Partial<TState>): TState {
    const ret = state(o)
    const prevState = state.getPrevious()
    effectList.forEach(r => r(ret, prevState))
    run()
    return ret
  }

  wrappedState.getPrevious = state.getPrevious

  function effects(statePattern: TPattern, callback: (s: TState, prevState: TState) => void) {
    const pred = createPredicate(statePattern)

    function ret(curState: TState, prevState: TState): void {
      const shouldBroadcast = pred(curState)
      if (!shouldBroadcast) return
      callback(curState, prevState)
    }

    effectList.push(ret)
    return effects
  }

  pushRule.state = wrappedState
  pushRule.effects = effects
  effects.state = wrappedState
  return pushRule
}
function stateDiff(prev: TState, o: Partial<TState>): TState | undefined {
  const {diff: oldDiff, ...prevStateSansDiff} = prev
  const nextStateSansDiff = {...prevStateSansDiff, ...o}
  const diff = jsondiffpatch.diff(prevStateSansDiff, nextStateSansDiff)
  if (diff === undefined) return undefined
  return {diff, ...nextStateSansDiff}
}
function logHist(s: TState, historyLen: number) {
  const fd = filter(s.diff || {}, (k, v) => {
    return ["x", "y", "deltaX", "deltaY"].every((s) => s !== k)
  })
  fd && log(fd, (historyLen) + '')
}
function makeStateHistory() {
  const history: TState[] = []
  function pushHistory(s: TState) {
    logHist(s, history.length)
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
    const next = stateDiff(prev, o)
    if (!next) {
      return prev
    }
    push && pushHistory(next)
    return next
  }
  function getPrevious() {
    return history[history.length - 2] || initialState
  }
  state.getPrevious = getPrevious
  return state
}

function hookupEventHandlersFRP() {
  const hist = makeStateHistory()
  const machine = rules(hist)
  ({
    mouseState: [any, 'down'],
    dragging: [false, false],
  }, {
    dragging: (s: TState): boolean => {
      const delta = 5
      const diffX = Math.abs(s.x - s.startX)
      const diffY = Math.abs(s.y - s.startY)
      const magnitude = Math.sqrt(diffX * diffX + diffY * diffY)
      return magnitude > delta
    }
  })
  ({
    dragging: [any, true]
  }, {
    deltaX: (s: TState) => s.x - s.startX,
    deltaY: (s: TState) => s.y - s.startY,
  })
  ({
    dragging: [any, true],
    hoverElId: changed
  }, {
    hoverBounds: (s: TState) => {
      const el = elById(s.hoverElId)
      const {left, width} = el.getBoundingClientRect()
      return {left, width}
    },
  })
  ({
    dragging: [any, true],
  }, {
    hoverBefore: (s: TState) => {
      const {left, width} = s.hoverBounds
      const mid = left + width * 0.5
      return s.x <= mid
    },
  })
  ({
      dragging: [false, true]
    },
    {
      selectedItemIds: (s: TState): string[] => {
        return Array.from(document.querySelectorAll('.sel'))
          .filter((el) => hasClass(el, 'drg'))
          .map(el => el.id)
      }
    }
  )
  ({
    mouseState: ['down', 'up'],
    dragging: [false, false]
  }, {
    key: 'click'
  })
  (
    {
      key: [NOKEY, complement(NOKEY)]
    },
    keyInputMutator
  )
    .effects
    ({
      key: [complement(NOKEY), NOKEY],
    }, keyEffect)
    ({
      mouseState: ['down', 'up'],
      dragging: [false, false]
    }, clickEffect)
    ({
      dragging: [false, true],
    }, startDragEffect)
    ({
      dragging: [any, true]
    }, dragEffect)
    ({
      dragging: [any, true],
      hoverElId: [changed, any]
    }, hoverEffect)
    ({
      dragging: [true, false],
    }, dropEffect)

  function keyInputMutator(s: TState) {
    let {nodes, key, lastId} = s
    nodes = clonedeep(nodes)
    if (key === 'cursor') {
      nodes.push({id: lastId++, v: key})
    } else if (key === 'backspace') {
      nodes = nodes.filter((n, i) => {
        const next = nodes[i + 1]
        return !(next && next.v === 'cursor')
      })
    } else if (key === 'arrowleft') {
      nodes = nodes.map((n, i) => {
        const next = nodes[i + 1]
        if (next && next.v === 'cursor') {
          return next
        } else if (n.v === 'cursor' && i > 0) {
          return nodes[i - 1]
        }
        return n
      })
    } else if (key === 'arrowright') {
      nodes = nodes.map((n, i) => {
        const next = nodes[i + 1]
        const prev = nodes[i - 1]
        if (n.v === 'cursor' && next) {
          return next
        } else if (prev && prev.v === 'cursor') {
          return prev
        }
        return n
      })
    } else if (key === 'delete') {
      nodes = nodes.filter((n, i) => {
        const prev = nodes[i - 1]
        return !(prev && prev.v === 'cursor')
      })
    } else if (true) {
      nodes = nodes.reduce((acc, cur, i) => {
        if (cur.v === 'cursor') {
          acc.push({id: lastId++, v: key}, cur)
        } else {
          acc.push(cur)
        }
        return acc
      }, T<TNode[]>([]))
    }
    //log(JSON.stringify(nodes))
    /*
    {"nodes":{"0":{"id":[0,1],"v":["cursor","j"]},"_t":"a"},"lastId":[1,2]}
     */
    return {
      nodes,
      lastId,
      key: NOKEY
    }
  }
  function keyEffect(s: TState) {
    const {diff} = s
    if (!('nodes' in diff)) {
      return
    }
    const {nodes} = diff
    const {_t, ...rest} = nodes
    const deferred = []
    for (const index in rest) {
      const value = rest[index]
      if (index.startsWith('_')) {
        const [deletedNode] = value
        const el = elById(deletedNode.id)
        deferred.push(() => unmount(el))
        continue
      }

      if (Array.isArray(value)) { //created
        let [{id, v}] = value
        let text
        if (v === 'cursor') {
          text = CURSORKEY
        } else {
          text = v
        }
        const myjsx = <span id={id}>{text}</span>
        // @ts-ignore
        const el = render(myjsx)
        rootEL.appendChild(el)
      } else { //changed
        let {id: [oid, nid], v: [ov, nv] = ['', '']} = value
        const hasValue = 'v' in value
        nv = nv === 'cursor' ? CURSORKEY : nv
        const el = elById(oid)
        deferred.push(() => {
          el.id = nid
          hasValue && el.replaceChild(document.createTextNode(nv), el.childNodes[0])
        })
      }
    }
    deferred.forEach(f => f())
  }

  function dropEffect(s: TState, ps: TState) {
    const selected: HTMLElement[] = s.selectedItemIds.map(elById)
    // @ts-ignore
    selected.forEach(s => s.__cleanup())
    const hoverElement = elById(s.hoverElId)
    if (!hasClass(hoverElement, 'drg')) return
    hoverElement.style.borderLeft = hoverElement.style.borderRight = ""
    //todo: we don't want transitory UI stuff like selections lost. need to keep history for repeatability.
    unmount(...selected)
    const before = s.hoverBefore
    selected.reverse().forEach(sEL => {
      before ? insertBefore(sEL, hoverElement) : insertAfter(sEL, hoverElement)
    })
  }
  function hoverEffect(s: TState, ps: TState) {
    const prevEl = elById(ps.hoverElId)
    prevEl.style.borderLeft = ""
    prevEl.style.borderRight = ""
  }
  function startDragEffect(s: TState, ps: TState) {
    const selected = s.selectedItemIds.map(elById)
    selected.forEach((n, i) => {
      const {pointerEvents, position, transform} = n.style
      // @ts-ignore
      n.__cleanup = () => {
        n.style.pointerEvents = pointerEvents
        n.style.position = position
        n.style.transform = transform
      }
    })
  }
  function dragEffect(s: TState, ps: TState) {
    const selected = s.selectedItemIds.map(elById)
    selected.forEach((n, i) => {
      n.style.pointerEvents = 'none'
      n.style.position = 'absolute'
      n.style.transform = `translate3d(${s.deltaX}px,${s.deltaY}px, 0px)`;
    })
    const hEl = elById(s.hoverElId)
    if (!hasClass(hEl, 'drg')) return
    if (s.hoverBefore) {
      hEl.style.borderLeft = "3px dashed red"
      hEl.style.borderRight = ""
    } else {
      hEl.style.borderLeft = ""
      hEl.style.borderRight = "3px dashed red"
    }
  }
  function clickEffect(s: TState, ps: TState) {
    const el = elById(s.el)
    if (!hasClass(el, 'drg')) return
    toggleClass(el, 'sel')
    console.log('click')
  }

  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)

  const {state} = machine

  function onPointerDown(e: MouseEvent) {
    e.preventDefault()
    const [x, y] = [e.clientX, e.clientY]
    let el = e.composedPath()[0] as HTMLElement
    state({mouseState: 'down', startX: x, startY: y, x, y, el: el.id, mouseButton: e.button})
  }
  function onPointerMove(e: MouseEvent) {
    e.preventDefault()
    const [x, y] = [e.clientX, e.clientY]
    let el = e.composedPath()[0] as HTMLElement
    let hoverElId = el.id || "root"
    state({x, y, hoverElId})
  }
  function onPointerUp(e: MouseEvent) {
    e.preventDefault()
    //let el = e.composedPath()[0]
    state({mouseState: 'up', dragging: false, mouseButton: -1})
  }
  function sendKeyToState(key: string) {
    state({key})
  }
  bindkeys((data: { key: any; }) => {
    const {key} = data
    //addKey(key)
    sendKeyToState(key)
  })
  sendKeyToState('cursor')
}

function elById(id: string): HTMLElement {
  return document.getElementById(id) || dummyEl
}
/*
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
*/
hookupEventHandlersFRP()

function complement(value: any) {
  return (compareValue: any) => value !== compareValue
}
function any() {
  return true
}
function changed(a: any, b: any) {
  return a !== b
}
function funcify(value: any) {
  if (typeof value === 'function') {
    return value
  }
  return (compareValue: any) => compareValue === value
}
function T<T>(o: T) {
  return o
}
/*
for dom state tracking, use paths:
/nodes/0/propname
 */