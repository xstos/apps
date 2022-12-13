import './index.css';
import React from "react";
import {cellx} from "cellx"
//import hyperactiv from 'hyperactiv'
import {bindkeys} from "./io"
import {customJsx} from "./reactUtil"
import * as jsondiffpatch from 'jsondiffpatch'
import {DiffDOM} from "diff-dom"
import {assignPropsStyle, elById, insertAfter, insertBefore, unmount} from "./domutil"
import clonedeep from "lodash.clonedeep"
import {debouncer, filter, log, proxy} from "./util"
import {
  initialState,
  NOKEY,
  T,
  TEffectCallback,
  TJsx,
  TMutator,
  TNode,
  TPattern,
  TRule,
  TState,
  TStateFunc,
} from "./types"
//import {BoxComponent, DragDropDemo} from "./dragdrop"
import {getControllerById, ReactWindowExample} from "./react-virt"
import {ReactWindowFlow} from "./react-virt-2"


//const {observe, computed} = hyperactiv
const diffDOM = new DiffDOM()
let pasteData:string=null
const CURSORKEY = '█'
const codez = {
  uppercase: "a→A",
  lowercase: "A→a",
};
let jsxCallback = customJsx
const rootEL = elById('root')
const body = document.body
initHTML()

ReactWindowFlow()

return

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  const ret = jsxCallback(type, props, ...children)
  return ret
}
function initHTML() {
  body.style.fontFamily = "monospace, sans-serif"
  body.style.fontSize = "8pt"
  //body.style.paddingLeft="0.5ch"
  //body.style.paddingRight= "1ch"
  //document.body.style.color = "grey"
  //document.body.style.backgroundColor = "rgb(28,28,28)"
  const rootStyle = rootEL.style
  rootStyle.whiteSpace = 'pre'
  rootStyle.border="1px solid gray"
  rootEL.tabIndex=0
  rootStyle.borderTop = "1px solid cyan"
  rootStyle.borderBottom = "1px solid cyan"
  //rootStyle.overflowX="scroll"
  //rootStyle.overflowY="scroll"
  rootStyle.height="50vh"
  rootStyle.width="97vw"
  //rootStyle.overflowWrap = "break-word"
  //rootStyle.maxWidth = "95vw"
}


const cells = { }
function getCell(name: string, initialValue = null) {
  let ret
  if (!(name in cells)) {
    ret = cells[name] = cellx(initialValue)
  } else {
    ret = cells[name]
  }
  return ret
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

type TStatePredicate = (s: TState) => boolean
function createPredicate(statePattern: TPattern): TStatePredicate {
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
function rule(predicate: TStatePredicate, stateMutator: TMutator): TRule {
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

  function pushRule(statePattern: TPattern, stateMutator: TMutator, effect?: TEffectCallback) {
    const predicate = createPredicate(statePattern)
    ruleList.push(rule(predicate, stateMutator))
    if (effect) {
      pushEffect(predicate,effect)
    }
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

    //Object.seal(currentState)
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
  wrappedState.scrub= state.scrub
  function pushEffect(pred: TStatePredicate, callback: TEffectCallback) {
    function ret(curState: TState, prevState: TState): void {
      const shouldBroadcast = pred(curState)
      if (!shouldBroadcast) return
      callback(curState, prevState)
    }

    effectList.push(ret)
  }
  function effects(statePattern: TPattern, callback: TEffectCallback) {
    const pred = createPredicate(statePattern)
    pushEffect(pred,callback)
    return effects
  }

  pushRule.state = wrappedState
  pushRule.effects = effects
  effects.state = wrappedState
  return pushRule
}
function stateDiff(prev: TState, o: Partial<TState>): TState | undefined {
  /*todo: change datastructures for size/speed
     https://github.com/glenjamin/transit-immutable-js
     https://github.com/intelie/immutable-js-diff
   */
  const {diff: oldDiff,nodes, ...prevStateSansDiff} = prev
  const { nodes: newNodes, ...oSansNodes} = o
  const nextStateSansDiff = {...prevStateSansDiff, transitory:true, ...oSansNodes}
  const diff = jsondiffpatch.diff(prevStateSansDiff, nextStateSansDiff)
  if (diff === undefined) return undefined
  return {diff,nodes: newNodes || nodes, ...nextStateSansDiff}
}
const stateKeyFilterEntries = ["x", "y", "deltaX", "deltaY", "nodes", 'mouseMove', 'transitory'].map(k=>[k,null])
const stateKeyFilter = Object.fromEntries(stateKeyFilterEntries)
function logState(s: TState, historyLen: number) {
  const fd = filter(s.diff || {}, (k, v) => {
    if (k==="key" && v.length>50) {
      return false
    }
    return (k in stateKeyFilter)
  })
  fd && log(JSON.stringify(fd), historyLen)
}
function makeStateStream() {
  let history: TState[] = [initialState, initialState]
  let undo: TState[] = []
  const keep = (s: TState) => !s.transitory
  function getCurrent(): TState {
    return history[history.length - 1]
  }
  function state(statePatch?: Partial<TState>): TState {
    let current = getCurrent()
    if (!statePatch) {
      return current
    }
    const next = stateDiff(current, statePatch)
    if (!next) {
      return current
    }
    if (current.key==='undo') {
      history[history.length-1] = next
    } else {
      history.push(next)
      const popped = history.shift()
      if (keep(next)) {
        undo.push(next)
      }
    }
    logState(next,undo.length)
    getCell('scrubber.max')(undo.length-1)
    return next
  }
  function getPrevious() {
    return history[history.length-2]
  }
  state.getPrevious = getPrevious
  state.scrub = function(ix:number) {
    const ret = undo[ix]
    const foo = {
      ...ret,
      key: 'undo'
    }
    return foo
  }
  return state
}
function getJsonDiffPatchEntries(nodes: any) {
  const {_t, ...rest} = nodes
  type TPair = [number,any][]
  const entries = Object.entries(rest).reduce((acc, value) => {
    let [k, v]: [string,any] = value
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
    deleted: T<TPair>([]),
    created: T<TPair>([]),
    modified: T<TPair>([]),
  })
  return entries
}
const stateStream = makeStateStream()

function isBreak(node: TNode) {
  const {v} = node
  return v === "enter" || v === '\n' || v === '\r'
}
function isCursor(node: TNode) {
  return node.v==='cursor'
}
function getCharWidth(node: TNode) {
  let {v, id} = node
  let len = v.length
  if (v in replace) {
    v = replace[v]
    len = v.length
  }
  return len
}
function getSelectedElementIds() {
  return [0,1,2,3].map(i=>i+'') //todo:
}
function setHoverStyle(elId: string, hoverBefore: boolean) {
  const el = elById(elId)
  const style = el.style
  if (hoverBefore) {
    style.borderLeft = "3px dashed red"
    style.borderRight = ''
  } else {
    style.borderLeft = ''
    style.borderRight = "3px dashed red"
  }
}
function clearHover(elId: string) {
  const el = elById(elId)
  el.style.borderLeft = ''
  el.style.borderRight = ''
}
function setDragStyle(s: TState) {
  const sel = getSelectedElementIds().map(elById)
  sel.forEach(el=>{
    el.style.pointerEvents = 'none'
    el.style.transform= `translate3d(${s.deltaX}px,${s.deltaY}px,10px)`
  })
}
function moveDraggedNodes(targetId: string, before: boolean, selectedElementIds: string[]) {
  //todo:
}
function clearDrag(selectedIds: string[]) {
  const selectedElements = selectedIds.map(elById)
  selectedElements.forEach(el => {
    el.style.pointerEvents = ''
    el.style.transform = ''
  })
}
function drop(hoverElId: string, hoverBefore: boolean) {
  const selected = getSelectedElementIds()
  clearDrag(selected)
  if (Number.isNaN(Number(hoverElId))) return
  clearHover(hoverElId)
  moveDraggedNodes(hoverElId, hoverBefore, selected)
}
function hookupEventHandlersFRP() {
  const machine = rules(stateStream)
  const { effects, state } = machine
  function createMachine() {
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
        return nodes.map((n, i) => {
          const id = String(i)
          if (id === s.hoverElId) {
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
              transform: `translate3d(${s.deltaX}px,${s.deltaY}px,10px)`,
            }

            Object.assign(n.style, newStyle)
          }
          return n
        })
      },
    },(s: TState, ps:TState) => {
      setHoverStyle(s.hoverElId, s.hoverBefore)
      setDragStyle(s)
    })
    ({
      dragging: [any, true],
      hoverElId: changed,
    }, {
      nodes: (s: TState) => {
        const [prevId, _] = s.diff.hoverElId
        const nodes = clonedeep(s.nodes)
        return nodes.map((n, i) => {
          const id = String(i)
          if (id === prevId) {
            n.style.borderLeft = ''
            n.style.borderRight = ''
          }
          return n
        })
      },
    },(s: TState, ps:TState) => {
      clearHover(ps.hoverElId)
    })
    ({ //drop
      dragging: [true, false],
      mouseMove: [any, false],
    }, {
      nodes: (s: TState) => {
        const nodes = clonedeep(s.nodes)
        const selected = nodes.filter(n => {
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
        return ret
      },
      transitory: false,
    },(s: TState, ps:TState) => {
      drop(s.hoverElId, s.hoverBefore)
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
  }
  createMachine()
  const verbs = {
    split: String.prototype.split
  }
  function domSyncEffect(s: TState, ps: TState) {

    let currentCols = []
    let rows = [currentCols]
    let w
    let numColsMax=0
    let cursor = [0,0]
    const nullNode = ()=>null

    for (let i = 0; i < s.nodes.length; i++){
      const n = s.nodes[i]
      if (isCursor(n)) {
        cursor = [rows.length,currentCols.length]
      }
      if (isBreak(n)) {
        currentCols = []
        rows.push(currentCols)
      } else {
        w=getCharWidth(n)
        currentCols.push(()=>{
          let ret
          jsxCallback=React.createElement
          ret=renderNodeAsJSX(n,i)
          jsxCallback=jsx
          return ret
        })
        for (let j = 0; j < w - 1; j++) {
          currentCols.push(nullNode)
        }
        numColsMax=Math.max(numColsMax, currentCols.length)
      }
    }
    const data = {numCols: numColsMax, numRows: rows.length, cursor, table: rows}

    getControllerById(0).setData(data)

    return
    function oldNodeSync(s:TState) {
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
        let el = elById(ix+'')
        if (el.nodeName!==newNode.nodeName) {
          el.parentNode.replaceChild(newNode,el)
        } else {
          const diff = diffDOM.diff(el,newNode)
          diffDOM.apply(el,diff)
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
    const max = getCell(id+".max")()
    getCell(id+".value.ui")(max-el.value)
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
  document.addEventListener('paste', (event) => {
    event.preventDefault();

    pasteData = (event.clipboardData || window.clipboardData).getData('text');
    sendKeyToState('cell', 'paste')
  });

  const debounce = debouncer(100, (f: Function)=>f())
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
    e.preventDefault()
    debounce(()=>{
      rootEL.focus()
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
  bindkeys((data: { key: string; }) => {
    sendKeyToState(data.key)
  }, keyBindFilter)
  function keyBindFilter(e: KeyboardEvent, key: string) {
    const path = e.composedPath()
    let el = path[0] as HTMLElement
    if (!path.includes(rootEL)) {
      return false
    } else {
      if (key === 'tab' || key === 'shift+tab' || key === 'ctrl+v') return false
      e.preventDefault()
    }
  }
  sendKeyToState('cursor')
  getCell('scrubber.value.ui').onChange(e=>{
    const old = state.scrub(Number(e.data.value))
    state({
      key: old.key,
      nodes: clonedeep(old.nodes)
    })
  })
}
function render2(...jsx: TJsx[]) {
  return jsx.map(render)
}
function render(myjsx: TJsx) {
  let { type, props, children } = myjsx
  const { id, ['data-appendBefore']: appendBefore, ['data-appendAfter']: appendAfter, style, ...rest } = props
  const ret = document.createElement(type)
  if ('style' in props) {
    assignPropsStyle(props.style, ret.style)
  }
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
    const cellName = id+"."+key
    const mycell = getCell(cellName)
    const myCell2 = getCell(cellName+".ui")
    let fire = true
    mycell.onChange(e => {
      if (!fire) return
      //log('set cell',key, e.data.value)
      ret[key]=e.data.value
    })
    myCell2.onChange(e => {
      //log('set cell.ui',key, e.data.value)
      fire=false
      mycell(e.data.value)
      fire=true
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
      const type = typeof c

      if (type === 'string' || type === "number") {
        const el = document.createTextNode(c)
        return el
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

const replace = {
  cursor: CURSORKEY,
  cell: "〈",
  _cell: "〉",
  button: '〈button',
  _button: 'button〉',
  pipe: "⮞",
  _pipe: "/⮞",
  uppercase: codez.uppercase,
  lowercase: codez.lowercase,
  sep: '┊',
  table: '〈table',
  _table: 'table〉',
}
const codes = `cell button pipe uppercase lowercase table`.split(" ").reduce((acc, value)=>{
  acc.push(value,"_"+value)
  return acc
},[]).map(s=>[s,true])
const isCode = Object.fromEntries(codes)

function renderNodeAsJSX(node: TNode, index: any) {
  const {id, v, sl} = node

  const isClose = v.startsWith('_')
  let text = v, myjsx
  if (v in replace) {
    text = replace[v]
  }
  const isSlider = v === 'slider'
  if (isSlider) {
    myjsx = <input id={index} type={"range"} min={"1"} max={"1000"} value={1}/>
  } else {
    if (isCode[v]) {
      const idDesc = isClose ? id - 1 : id
      myjsx = <span id={index}>{text}<sup style={{fontSize: '50%'}}>{idDesc}</sup></span>
    } else if (isBreak(node)) {
      myjsx = <br id={index}/>
    } else {
      let style = {
        display: 'inline-block',
        maxWidth: '80ch',
        maxHeight: '40ch',

        verticalAlign: "top",
      }
      const largestyle = {
        overflowX: "scroll",
        overflowY: "scroll",
      }
      style = text.length > 30 ? {...style, ...largestyle} : style
      myjsx = <span style={style} id={index}>{text}</span>
    }
  }
  return myjsx
}
function renderNode(node: TNode, index: any) {
  const {id, v, sl} = node
  let myjsx = renderNodeAsJSX(node, index)

  // @ts-ignore
  let el = render(myjsx)
  if (sl) {
    selectEl(el, true)
  }
  if (isCode[v]) {
    el.style.color = "green"
  } else {
    el.style.color = ""
  }
  assignPropsStyle(node.style,el.style)
  return el
}
const shifties = "!@#$%^&*()<>:\"{}+_"
const replaceMap = {
  ...Object.fromEntries(shifties.split('').map(c=>["shift+"+c,c]))
}
function keyInputMutator(s: TState) {
  let {nodes, key, lastId} = s
  let type, value
  nodes = clonedeep(nodes)
  function getCursorIndexes() {
    return nodes.reduce((acc,n,i)=>{
      if (n.v==='cursor') acc.push(i)
      return acc
    },T<number[]>([]))
  }
  const cursors = getCursorIndexes()
  function makeNode(v: string): TNode {
    return {id: lastId++, v, sl: false, style: newStyle()}
  }
  function pushKey(key: string) {
    nodes.push(makeNode(key))
  }
  function insert(...keys: string[]) {
    nodes = nodes.reduce((nodes, node, i) => {
      if (node.v === 'cursor') {
        for (let i1 = 0; i1 < keys.length; i1++){
          const v = keys[i1]
          nodes.push(makeNode(v))
        }
      }
      nodes.push(node)
      return nodes
    }, T<TNode[]>([]))
  }
  function makeNodes(...text: string[]) {
    return text.map(makeNode)
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


  function makeCode(name, callback=null) {
    callback = callback || (cur=>[cur])
    const [o, c] = makeNodes(name, '_'+name)
    replace((cur) => [o, ...callback(cur), c])
  }
  function findCursor() {
    return nodes.findIndex(n=>n.v==='cursor')
  }
  function swap(a,b) {
    let temp = nodes[a]
    nodes[a]=nodes[b]
    nodes[b]=temp
  }
  function arrowLeft() {
    const curix = findCursor()
    if (curix<1) return
    swap(curix,curix-1)
  }
  function arrowRight() {
    const curix = findCursor()
    if (curix+1===nodes.length) return
    swap(curix,curix+1)
  }
  function enter() {
    return makeNode("enter")
  }
  if (false) {
  } else if (key === 'paste') {
    insert(...pasteData.split(''))
    pasteData=null
  } else if (key === 'cursor' || key === 'slider') {
    pushKey(key)
  } else if (key in replaceMap) {
    insert(replaceMap[key])
  } else if (key === 'table') {
    makeCode('table', (cur)=>[enter(), cur, enter()])
  } else if (key === 'cell') {
    makeCode('cell')
  } else if (key === 'button') {
    makeCode("button")
  } else if (key === 'pipe') {
    makeCode("pipe")
  } else if (key === ' ') {
    insert(' ')
  } else if (key === 'enter') {
    insert('sep')
  } else if (key === 'shift+enter') {
    insert('enter')
  } else if (key === 'undo') {

  } else if (key === 'backspace') {
    nodes = nodes.filter((n, i) => {
      const next = nodes[i + 1]
      return !(next && next.v === 'cursor')
    })
  } else if (key === 'arrowleft') {
    arrowLeft()
  } else if (key === 'arrowright') {
    arrowRight()
  } else if (key === 'delete') {
    nodes = nodes.filter((n, i) => {
      const prev = nodes[i - 1]
      return !(prev && prev.v === 'cursor')
    })
  } else if (key === 'click') {
    nodes = nodes.map((n, i) => {
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
    transitory: false,
  }
}

function selectEl(el: HTMLElement,value: string) {
  el.style.boxShadow=value ? "0px 0px 0px 5px rgba(255,0,0,0.5)" : ''
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

const scrublbl = <label style={{fontSize: '14pt'}} data-appendBefore='root' for={"scrubber"}>undo</label>
const scrubber = <input data-appendBefore='root'
                        id='scrubber'
                        type="range"
                        min={0}
                        max={cellv(0).max}
                        value={cellv(0).value} />
/*
const historyFrame = <iframe data-appendAfter={'root'} id={'history'}
                             srcdoc={cellv('').innerHtml}/>

render2(historyFrame,scrubber)
 */
function toolButton(key) {
  const name = key in codez ? codez[key] : key
  return <button data-appendBefore={'root'} data-key={key}>{name}</button>
}
["cell", "button", "pipe", "uppercase", "lowercase", "table"].map(toolButton).forEach(render)
render2(scrublbl, scrubber)
//const test = <input data-appendAfter={'root'}></input>
//render(test)

//hookupEventHandlersFRP()
ReactWindowExample(()=>{
  hookupEventHandlersFRP()
})
//makeGLRenderer()
//proxyWrapperDemo()

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