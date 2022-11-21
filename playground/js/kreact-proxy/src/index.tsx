import './index.css';
import React from "react";
//import hyperactiv from 'hyperactiv'
import {bindkeys} from "./io"
import {customJsx} from "./reactUtil"
import * as jsondiffpatch from 'jsondiffpatch'
import {Delta} from 'jsondiffpatch'
import {hasClass, insertAfter, insertBefore, setClass, toggleClass, unmount} from "./domutil"
import clonedeep from "lodash.clonedeep"
import {filter, log} from "./util"
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
  rootEL.style.whiteSpace = 'pre'
}
setStyles()

//makeGLRenderer()
//proxyWrapperDemo()

type TJsx = { type: string; props: { [key: string]: any }, children: any[]; }
function render(jsx: TJsx) {
  const ret = document.createElement(jsx.type)
  if (jsx.type === 'span') {
    ret.tabIndex = 0
    ret.style.cursor = 'default'
    ret.classList.add('drg')
    if ('id' in jsx.props) {
      ret.id = jsx.props.id
    }
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
  mouseMove: false,
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0,
  x: 0,
  y: 0,
  dragging: false,
  el: '',
  hoverElId: T<string>(''),
  hoverBounds: {
    left: 0,
    right: 0,
    width: 0,
  },
  hoverBefore: true,
  selectedItemIds: T<string[]>([]),
  key: NOKEY,
  nodes: T<TNode[]>([]),
  lastId: 1,
}
const initialState = {
  ...initialStateSansDiff,
  diff: T<Delta>(jsondiffpatch.diff({}, initialStateSansDiff) as Delta),
}

type TStateSansDiff = typeof initialStateSansDiff
type TStyle = {
  pointerEvents: any,
  position: any,
  transform: any,
  borderLeft: any,
  borderRight: any,
}
type TNode = { id: number, v: string, sl: boolean, style: TStyle }
type TState = typeof initialState
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
      log('rule',i)
      dirty = true
      Object.assign(currentState, ruleResult)
      Object.assign(currentState.diff, next.diff)
    }
    if (!dirty) return
    Object.seal(currentState)
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
    return ["x", "y", "deltaX", "deltaY", "nodes", 'mouseMove'].every((s) => s !== k)
  })
  const cs = clonedeep(s)
  //delete cs.diff.nodes.style
  fd && log(JSON.stringify(fd), (historyLen) + '')
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
  ({ //0
    mouseState: [any, 'down'],
    dragging: [false, false],
  }, {
    dragging: (s: TState): boolean => {
      const delta = 5
      const diffX = Math.abs(s.x - s.startX)
      const diffY = Math.abs(s.y - s.startY)
      const magnitude = Math.sqrt(diffX * diffX + diffY * diffY)
      return magnitude > delta
    },
  })
  ({ //1
    dragging: [any, true],
  }, {
    deltaX: (s: TState) => s.x - s.startX,
    deltaY: (s: TState) => s.y - s.startY,
  })
  ({ //2
    dragging: [any, true],
    hoverElId: changed,
  }, {
    hoverBounds: (s: TState) => {
      const el = elById(s.hoverElId)
      const {left, width} = el.getBoundingClientRect()
      return {left, width}
    },
  })
  ({ //3
    dragging: [any, true],
  }, {
    hoverBefore: (s: TState) => {
      const {left, width} = s.hoverBounds
      const mid = left + width * 0.5
      return s.x <= mid
    },
    nodes: (s: TState) => {
      const nodes = clonedeep(s.nodes)
      return nodes.map((n,i)=>{
        const id = String(i)
        if (id===s.hoverElId) {
          if (s.hoverBefore) {
            n.style.borderLeft = "3px dashed red"
            n.style.borderRight = ''
          } else {
            n.style.borderLeft = ''
            n.style.borderRight = "3px dashed red"
          }
        }
        if (n.sl) {
          const newStyle = {
            pointerEvents: 'none',
            position: 'absolute',
            transform: `translate3d(${s.deltaX}px,${s.deltaY}px, 0px)`
          }
          Object.assign(n.style,newStyle)
        }
        return n
      })
    }
  })
  ({ //4
    dragging: [any, true],
    hoverElId: changed,
  }, {
    nodes: (s: TState) => {
      const [prevId,_] =  s.diff.hoverElId
      const nodes = clonedeep(s.nodes)
      return nodes.map((n,i)=>{
        const id = String(i)
        if (id===prevId) {
          n.style.borderLeft=''
          n.style.borderRight=''
        }
        return n
      })
    }
  })
  /*({ //startDrag
      dragging: [false, true],
    },
    {
      selectedItemIds: (s: TState): string[] => {
        return []
        return Array.from(document.querySelectorAll('.sel'))
          .filter((el) => hasClass(el, 'drg'))
          .map(el => el.id)
      },
    },
  )*/
  ({ //drop
    dragging: [true, false],
    mouseMove: [any, false],
  }, {
    nodes: (s: TState) => {

      const nodes = clonedeep(s.nodes)
      const selected = nodes.filter(n=>{
        const ret = n.sl
        if (ret) {
          Object.assign(n.style, {
            pointerEvents: '',
            position: '',
            transform: '',
          })
        }
        return ret
      })
      const hoverId = Number(s.hoverElId)
      function getRet() {
        return nodes.reduce((newNodes, node, i) => {
          if (node.sl) return newNodes
          if (hoverId === i) {
            node.style.borderLeft = ''
            node.style.borderRight = ''
            if (s.hoverBefore) {
              newNodes.push(...selected)
              newNodes.push(node)
            } else {
              newNodes.push(node)
              newNodes.push(...selected)
            }
          } else {
            newNodes.push(node)
          }
          return newNodes
        }, T<TNode[]>([]))
      }
      const ret = getRet()
      if (ret.length<3) {
        debugger
        const r2 = getRet()
      }
      //log(JSON.stringify(nodes))
      return ret
    }
  })
  ({
    mouseState: ['down', 'up'],
    dragging: [false, false],
    mouseMove: [any, false],
  }, {
    key: 'click',
  })
  ({
      key: [NOKEY, complement(NOKEY)],
    },
    keyInputMutator,
  )
  machine.effects
  ({
    key: [complement(NOKEY), NOKEY],
  }, nodesChangedEffect)
  ({
    mouseState: ['down', 'up'],
    dragging: [false, false],
  }, clickEffect)
  ({
    dragging: [false, true],
  }, startDragEffect)
  ({
    dragging: [any, true],
  }, dragEffect)
  ({
    dragging: [any, true],
    hoverElId: [changed, any],
  }, hoverEffect)
  ({
    dragging: [true, false],
  }, dropEffect)
  function newStyle() {
    return {
      pointerEvents: '',
      position: '',
      transform: '',
      borderLeft: '',
      borderRight: '',
    }
  }
  function keyInputMutator(s: TState) {
    let {nodes, key, lastId, selectedItemIds} = s
    nodes = clonedeep(nodes)
    selectedItemIds = clonedeep(selectedItemIds)
    if (false) {
    } else if (key === 'cursor') {
      nodes.push({id: lastId++, v: key, sl: false, style: newStyle()})
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
    } else if (key === 'click') {
      nodes = nodes.map((n,i) => {
        if (i !== Number(s.hoverElId)) {
          return n
        }
        n.sl = !n.sl
        return n
      })
    } else if (true) {
      nodes = nodes.reduce((nodes, node, i) => {
        if (node.v === 'cursor') {
          nodes.push({id: lastId++, v: key, sl: false, style: newStyle()}, node)
        } else {
          nodes.push(node)
        }
        return nodes
      }, T<TNode[]>([]))
    }
    //{"nodes":{"0":{"id":[0,1],"v":["cursor","j"]},"_t":"a"},"lastId":[1,2]}
    return {
      nodes,
      lastId,
      key: NOKEY,
      selectedItemIds,
    }
  }
  function nodesChangedEffect(s: TState, ps: TState) {
    const {diff} = s
    if (!('nodes' in diff)) {
      return
    }
    const {nodes} = diff
    const {_t, ...rest} = nodes

    const entries = Object.entries(rest).reduce((acc,value)=>{
      let [k,v]=value
      if (k.startsWith("_")) {
        k=k.replace('_','')
        acc.deleted.push([Number(k),v])
      } else if (Array.isArray(v)) {
        acc.created.push([Number(k),v])
      } else {
        acc.modified.push([Number(k),v])
      }
      return acc
    },{
      deleted: [],
      created: [],
      modified: [],
    })
    /*if (entries.deleted.length>0) {
      debugger
    }*/
    entries.created.forEach((e)=>{
      const [index,value]=e
      let [{id, v, sl}] = value
      let text
      if (v === 'cursor') {
        text = CURSORKEY
      } else if (v === ' ') {
        text = '&nbsp'
      }
      else {
        text = v
      }
      const myjsx = <span id={index}>{text+"("+id+")"}</span>
      // @ts-ignore
      const el = render(myjsx)
      if (sl) {
        el.classList.add('sel')
      }
      rootEL.appendChild(el)
    })
    entries.modified.forEach((e)=>{
      const [ix,value]=e
      const origNode: TNode = s.nodes[ix]
      let {
        id: [oid, nid] = [origNode.id, origNode.id],
        v: [ov, nv] = [origNode.v, origNode.v],
        sl: [oldSel,newSel] = [origNode.sl,origNode.sl]
      } = value
      const hasValue = 'v' in value
      const hasSel = 'sl' in value
      const hasStyle = 'style' in value
      nv = nv === 'cursor' ? CURSORKEY : nv

      let el = elById(ix)
      hasValue && el.replaceChild(
        document.createTextNode(nv+"("+nid+")"),
        el.childNodes[0])
      hasSel && setClass(el, newSel, 'sel')

      if (hasStyle) {
        const snew = Object.fromEntries(Object.entries(value.style).map(e=>{
          const [k,v] = e
          return [k,v[1]]
        }))
        Object.assign(el.style,snew)
      }
    })
    entries.deleted.forEach((e)=>{
      const [index,value]=e
      const [deletedNode] = value
      const elToDel = elById(index+'')
      unmount(elToDel)
      log('deleted',deletedNode,elToDel)
    })
  }
  function startDragEffect(s: TState, ps: TState) {
    nodesChangedEffect(s,ps)
  }
  function dragEffect(s: TState, ps: TState) {
    nodesChangedEffect(s,ps)
  }
  function dropEffect(s: TState, ps: TState) {
    nodesChangedEffect(s,ps)
  }
  function hoverEffect(s: TState, ps: TState) {
  }

  function clickEffect(s: TState, ps: TState) {
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
    state({x, y, hoverElId, mouseMove: true})
    state({mouseMove: false})
  }
  function onPointerUp(e: MouseEvent) {
    e.preventDefault()
    //let el = e.composedPath()[0]
    state({mouseState: 'up', dragging: false, mouseButton: -1})
  }
  function sendKeyToState(...keys: string[]) {
    keys.forEach(key=>state({key}))
  }
  bindkeys((data: { key: any; }) => {
    const {key} = data
    //addKey(key)
    sendKeyToState(key)
  })
  sendKeyToState('cursor',..."23".split(''))
}
function elById(id: string): HTMLElement {
  const ret = document.getElementById(id)
  if (!ret) throw new Error("id not found")
  return ret
}
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