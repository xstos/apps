import './index.css';
import React from "react";
import {cellx} from "cellx"
//import hyperactiv from 'hyperactiv'
import {bindkeys} from "./io"
import {customJsx} from "./reactUtil"
import * as jsondiffpatch from 'jsondiffpatch'
import { DiffDOM } from "diff-dom"
import {insertAfter, insertBefore, unmount} from "./domutil"
import clonedeep from "lodash.clonedeep"
import {debouncer, filter, log, proxy} from "./util"
import {initialState, NOKEY, T, TJsx, TMutator, TNode, TPattern, TRule, TState, TStateFunc} from "./types"
//import {BoxComponent, DragDropDemo} from "./dragdrop"
//const {observe, computed} = hyperactiv
const dd = new DiffDOM()
const CURSORKEY = '█'
let jsxCallback = customJsx
const rootEL = elById('root')
const body = document.body
export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  const ret = jsxCallback(type, props, ...children)
  return ret
}
function initHTML() {
  body.style.fontFamily = "monospace, sans-serif"
  body.style.fontSize = "24pt"
  body.style.paddingLeft="0.5ch"
  //document.body.style.color = "grey"
  //document.body.style.backgroundColor = "rgb(28,28,28)"
  rootEL.style.whiteSpace = 'pre'
  rootEL.style.border="1px solid gray"
  rootEL.tabIndex=0
  rootEL.style.borderTop = "3px dotted yellow"
  rootEL.style.borderBottom = "3px dotted yellow"
}
initHTML()

//makeGLRenderer()
//proxyWrapperDemo()
const cells = {

}
function getCell(name: string, initialValue = null) {
  let ret
  if (!(name in cells)) {
    ret = cells[name] = cellx(initialValue)
  } else {
    ret = cells[name]
  }
  return ret
}
function render2(...jsx: TJsx[]) {
  return jsx.map(render)
}
function render(jsx: TJsx) {
  let { type, props, children } = jsx
  const { id, ['data-appendBefore']: appendBefore, ['data-appendAfter']: appendAfter, ...rest } = props
  const ret = document.createElement(type)
  for (const key in rest) {
    const propVal = props[key]
    const data = propVal._data
    if (!data) {
      ret.setAttribute(key,propVal)
      continue
    }
    const { type, value } = data
    if (type!=='cell') continue
    if (!id) continue
    //todo: cells by name map/setter/getter
    const mycell = getCell(id+"."+key)
    mycell.onChange(e => {
      //log('set cell',key, e.data.value)
      ret[key]=e.data.value
    })
    if ('value' in data) {
      mycell(value)
    }
  }

  if (type === 'span') {
    ret.style.display='inline-block'
    //ret.tabIndex = 0
    ret.style.cursor = 'default'
  }
  if ('id' in props) {
    ret.id = id
  }
  if (children) {
    const childEls = children.map(c => {
      if (typeof c === 'string') {
        return document.createTextNode(c)
      }
      const ret2 = render(c)
      return ret2
    })
    childEls.forEach(childNode => ret.appendChild(childNode))
  }
  if (appendBefore) {
    insertBefore(ret, elById(appendBefore))
  } else if (appendAfter) {
    insertAfter(ret, elById(appendAfter))
  }
  return ret
}
function getHTML() {
  return elById('root').innerHTML
}
function newStyle() {
  return {
    pointerEvents: '',
    position: '',
    transform: '',
    borderLeft: '',
    borderRight: '',
  }
}

function renderNode(node: TNode, index: any) {
  const {id, v, sl} = node
  const replace = {
    cursor: CURSORKEY,
    cell: "〈",
    _cell: "〉",
  }
  const isCode = {
    cell: true,
    _cell: true
  }
  let text = v, myjsx
  if (v in replace) {
    text = replace[v]
  }
  const isSlider = v === 'slider'
  if (isSlider) {
    myjsx = <input id={index} type={"range"} min={"1"} max={"1000"} value={1}/>
  } else {
    myjsx = <span id={index}>{text}</span>
  }

  // @ts-ignore
  const el = render(myjsx)
  if (sl) {
    selectEl(el, true)
  }
  if (isCode[v]) {
    el.style.color = "green"
  } else {
    el.style.color = ""
  }
  Object.assign(el.style,node.style)
  return el
}
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
      //log('rule',i)
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
    //const oldHtml = getHTML()

    const ret = state(o)
    const prevState = state.getPrevious()
    effectList.forEach(r => r(ret, prevState))
    run()
    /*
    const newHtml = getHTML()
    if (oldHtml!==newHtml) {
      false && state.htmlChanged(newHtml)
    }
    */
    return ret
  }

  wrappedState.getPrevious = state.getPrevious
  wrappedState.htmlChanged = state.htmlChanged
  wrappedState.html = state.html
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
function logState(s: TState, historyLen: number) {
  const fd = filter(s.diff || {}, (k, v) => {
    return ["x", "y", "deltaX", "deltaY", "nodes", 'mouseMove','html'].every((s) => s !== k)
  })
  fd && log(JSON.stringify(fd), (historyLen) + '')
}
function makeStateStream() {
  const history: TState[] = []
  const htmlHistory=[]
  function pushHistory(s: TState) {
    logState(s, history.length)
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
  function getPrevious(ix? : number) {
    if (ix) {
      return history[Math.max(history.length-ix,0)]
    }
    return history[history.length - 2] || initialState
  }
  function htmlChanged(html: string) {
    htmlHistory.push([html,history.length-1])
    getCell('scrubber.max')(htmlHistory.length-1)
  }
  function html(index: number) {
    return htmlHistory[index]
  }
  state.getPrevious = getPrevious
  state.htmlChanged = htmlChanged
  state.html = html
  return state
}
function getJsonDiffPatchEntries(nodes) {
  const {_t, ...rest} = nodes

  const entries = Object.entries(rest).reduce((acc, value) => {
    let [k, v] = value
    if (k.startsWith("_")) {
      k = k.replace('_', '')
      acc.deleted.push([Number(k), v])
    } else if (Array.isArray(v)) {
      acc.created.push([Number(k), v])
    } else {
      acc.modified.push([Number(k), v])
    }
    return acc
  }, {
    deleted: [],
    created: [],
    modified: [],
  })
  return entries
}

function hookupEventHandlersFRP() {
  const stateStream = makeStateStream()
  const machine = rules(stateStream)
  const { effects, state } = machine
  machine({
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
  ({
    dragging: [any, true],
  }, {
    deltaX: (s: TState) => s.x - s.startX,
    deltaY: (s: TState) => s.y - s.startY,
  })
  ({
    dragging: [any, true],
    hoverElId: changed,
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
            transform: `translate3d(${s.deltaX}px,${s.deltaY}px,10px)`
          }

          Object.assign(n.style,newStyle)
        }
        return n
      })
    }
  })
  ({
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
            transform: '',
          })
        }
        return ret
      })
      const hoverId = Number(s.hoverElId)
      if (Number.isNaN(hoverId)) return nodes
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
      // if (ret.length<3) {
      //   debugger
      //   const r2 = getRet()
      // }
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
  effects
  ({
    key: [complement(NOKEY), NOKEY],
  }, domSyncEffect)
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
  const verbs = {
    split: String.prototype.split
  }
  function domSyncEffect(s: TState, ps: TState) {
    const {diff} = s
    if (!('nodes' in diff)) {
      return
    }
    const {nodes} = diff
    const entries = getJsonDiffPatchEntries(nodes)

    entries.created.forEach((e)=>{
      const [index,value]=e
      let [node] = value as [TNode]
      const el = renderNode(node, index)
      rootEL.appendChild(el)
    })
    entries.modified.forEach((e)=>{
      const [ix,value]=e
      const node: TNode = s.nodes[ix]
      const newNode = renderNode(node,ix)
      let el = elById(ix)
      const diff = dd.diff(el,newNode)
      dd.apply(el,diff)
      
      function oldModLogic() {
        let {
          v: [ov, nv] = [node.v, node.v],
          sl: [oldSel, newSel] = [node.sl, node.sl],
        } = value
        let text = nv
        const hasValue = 'v' in value
        const hasSel = 'sl' in value
        const hasStyle = 'style' in value
        if (nv in replace) {
          text = replace[nv]
        }

        hasValue && el.replaceChild(
          document.createTextNode(text),
          el.childNodes[0])
        hasSel && selectEl(el, newSel)
        if (isCode[nv]) {
          el.style.color = "green"
        } else {
          el.style.color = ""
        }
        if (hasStyle) {
          const snew = Object.fromEntries(Object.entries(value.style).map(e => {
            const [k, v] = e
            return [k, v[1]]
          }))
          Object.assign(el.style, snew)
        }
      }
    })
    entries.deleted.forEach((e)=>{
      const [index,value]=e
      const [deletedNode] = value
      const elToDel = elById(index+'')
      unmount(elToDel)
      //log('deleted',deletedNode,elToDel)
    })
  }
  function startDragEffect(s: TState, ps: TState) {
    domSyncEffect(s,ps)
  }
  function dragEffect(s: TState, ps: TState) {
    domSyncEffect(s,ps)
  }
  function dropEffect(s: TState, ps: TState) {
    domSyncEffect(s,ps)
  }
  function hoverEffect(s: TState, ps: TState) {  }
  function clickEffect(s: TState, ps: TState) {  }

  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('pointermove', onPointerMove)
  document.addEventListener('pointerup', onPointerUp)
  document.addEventListener('input', e => {
    let el = e.composedPath()[0] as HTMLElement
    const {id} = el
    getCell(id+".value")(el.value)
  })
  document.addEventListener('click',(e)=>{
    const path = e.composedPath()
    let el = path[0] as HTMLElement
    if (el.tagName==="BUTTON") {
      const dataKey = el.getAttribute('data-key')
      dataKey && sendKeyToState(dataKey)
      rootEL.focus()
    }
  })
  const debounce = debouncer(100, (f)=>f())
  function onPointerDown(e: MouseEvent) {
    const path = e.composedPath()
    let el = path[0] as HTMLElement
    if (!path.includes(rootEL)) {
      return
    } else {
      e.preventDefault()
    }
    const [x, y] = [e.clientX, e.clientY]
    state({mouseState: 'down', startX: x, startY: y, x, y, el: el.id, mouseButton: e.button})
  }
  function onPointerMove(e: MouseEvent) {
    const path = e.composedPath()
    let el = path[0] as HTMLElement
    if (!path.includes(rootEL)) {
      return
    }
    const [x, y] = [e.clientX, e.clientY]
    let hoverElId = el.id || "root"
    debounce(()=>{
      rootEL.focus()
      e.preventDefault()
      state({x, y, hoverElId, mouseMove: true})
      state({mouseMove: false})
    })
  }
  function onPointerUp(e: MouseEvent) {
    const path = e.composedPath()
    let el = path[0] as HTMLElement
    if (!path.includes(rootEL)) {
      return
    } else {
      e.preventDefault()
    }
    state({mouseState: 'up', dragging: false, mouseButton: -1})
  }
  function sendKeyToState(...keys: string[]) {
    keys.forEach(key=>state({key}))
  }
  bindkeys((data: { key: any; }) => {
    const {key} = data
    sendKeyToState(key)
  }, (e,key)=>{
    const path = e.composedPath()
    let el = path[0] as HTMLElement
    if (!path.includes(rootEL)) {
      return false
    } else {
      if (key==='tab' || key==='shift+tab') return false
      e.preventDefault()
    }
  })
  sendKeyToState('cursor',..."23".split(''))
  getCell('scrubber.value').onChange(e=>{
    const htmlAtIndex = state.html(e.data.value)
    getCell('history.srcdoc')(htmlAtIndex[0])
  })
}
function keyInputMutator(s: TState) {
  let {nodes, key, lastId} = s
  nodes = clonedeep(nodes)
  function makeNode(v: string): TNode {
    return {id: lastId++, v, sl: false, style: newStyle()}
  }

  function pushKey(key: string) {
    nodes.push(makeNode(key))
  }
  function insert(key) {
    nodes = nodes.reduce((nodes, node, i) => {
      if (node.v === 'cursor') {
        nodes.push(makeNode(key))
      }
      nodes.push(node)
      return nodes
    }, T<TNode[]>([]))
  }
  function replace(callback: (cursorNode: TNode)=>TNode[]) {
    nodes = nodes.reduce((nodes, node, i) => {
      if (node.v === 'cursor') {
        const nodesToInsert = callback(node)
        nodes.push(...nodesToInsert)
        return nodes
      }
      nodes.push(node)
      return nodes
    }, T<TNode[]>([]))
  }
  if (false) {
  } else if (key === 'cursor' || key === 'slider') {
    pushKey(key)
  } else if (key === 'cell') {
    replace((cur)=>[makeNode('cell'),cur,makeNode('_cell')])
  } else if (key === ' ') {
    insert(' ')
  } else if (key === 'ctrl+ ') {
    insert('␞␞')
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

    insert(key)
  }
  //{"nodes":{"0":{"id":[0,1],"v":["cursor","j"]},"_t":"a"},"lastId":[1,2]}
  return {
    nodes,
    lastId,
    key: NOKEY,
  }
}

function selectEl(el,value) {
  //el.style.color=value ? 'red' : ''
  el.style.boxShadow=value ? "0px 0px 0px 5px rgba(255,0,0,0.5)" : ''
}
function elById(id: string): HTMLElement {
  const ret = document.getElementById(id)
  if (!ret) throw new Error("id not found")
  return ret
}

function cellv(value) {
  const p = proxy((data)=>{
    data.type='cell'
    data.value = value
    data.path = []
  }, (data,key) => {
    data.path.push(key)
  }, null)
  return p
}
/*
const scrubber = <input data-appendAfter='root'
                        id='scrubber'
                        type="range"
                        min={0}
                        max={cellv(0).max}
                        value={cellv(0).value} />
const historyFrame = <iframe data-appendAfter={'root'} id={'history'}
                             srcdoc={cellv('').innerHtml}/>

render2(historyFrame,scrubber)
 */
function toolButton(name) {
  return <button data-appendBefore={'root'} data-key={name}>{name}</button>
}
["cell"].map(toolButton).forEach(render)
//const test = <input data-appendAfter={'root'}></input>
//render(test)
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
/*
for dom state tracking, use paths:
/nodes/0/propname
 */