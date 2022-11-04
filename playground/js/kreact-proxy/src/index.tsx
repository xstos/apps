import './index.css';
import React from "react";
import hyperactiv from 'hyperactiv'
import ReactDOM from "react-dom"
import {bindkeys} from "./io"
import {customJsx} from "./reactUtil"
import {cellx} from "cellx"
import * as jsondiffpatch from 'jsondiffpatch'
import {toggleClass} from "./domutil"
//import {BoxComponent, DragDropDemo} from "./dragdrop"
const {observe, computed} = hyperactiv
let jsxCallback = customJsx
export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return jsxCallback(type, props, ...children)
}

const rootEL = document.getElementById('root')
document.body.style.fontFamily="monospace, sans-serif"
document.body.style.fontSize="24pt"
document.body.style.color = "grey"
document.body.style.backgroundColor = "rgb(28,28,28)"

//makeGLRenderer()
//proxyWrapperDemo()

bindkeys((data)=>{
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
  if (jsx.type==='span') {
    ret.tabIndex=0
    ret.classList.add('drg')
  }
  if (jsx.children) {
    const children = jsx.children.map(c=>{
      if (typeof c === 'string') {
        return document.createTextNode(c)
      }
      const ret2 = render(c)
      return ret2
    })
    children.forEach(childNode=>ret.appendChild(childNode))
  }

  return ret
}

function cx(o) {
  const cell = cellx({
    current: o,
   })
  function accessor(arg, data) {
    if (arguments.length===0) {
      return cell()
    }
    const obj = cell()
    const {current} = obj
    if (arg===current) return obj
    const ret = {
      last: current,
      current: arg,
      data
    }
    cellx(ret)
    return ret
  }
  return accessor
}
type Pred<T> = (value: T) => boolean
type Callback<T> = (value: T) => any
//todo box dragger https://codepen.io/knobo/pen/WNeMYjO
function hookupEventHandlersFRP() {
  type TState = typeof initialState
  const history: TState[] = []
  const stateCell = cellx(0)
  const initialStateSansDiff = {
    mouseState: 'unknown',
    startX: 0,
    startY: 0,
    x: 0,
    y: 0,
    dragging: false,
    el: null,
  }
  const actions = {
    onClick(s: TState) {
      toggleClass(s.el,'sel')
    },
    dragStart(s: TState) {

    },
    dragEnd(s: TState) {

    }
  }

  const initialState = {
    ...initialStateSansDiff,
    diff: jsondiffpatch.diff({},initialStateSansDiff)
  }

  history.push(initialState)

  function state(o?: Partial<TState>): TState {
    const prev = history[stateCell()]
    if (typeof o === 'undefined') {
      return prev
    }
    const historyLength = history.length
    const ret = { ...prev, ...o }
    const diff = jsondiffpatch.diff(prev,ret)
    if (diff === undefined) {
      return prev
    }
    ret.diff = diff
    history.push(ret)

    console.log(JSON.stringify(ret.diff), (historyLength) + '')
    stateCell(historyLength)
    return ret
  }
  function checkIfDragging(s:TState): boolean {
    const delta = 5
    const diffX = Math.abs(s.x - s.startX)
    const diffY = Math.abs(s.y - s.startY)
    const ret = Math.sqrt(diffX*diffX+diffY*diffY) > delta
    console.log('checkIfDrag', ret)
    return ret
  }
  function rule(statePattern, stateMutator) {
    const predicates = Object.entries(statePattern).map(([key,value])=>{
      const [a,b] = value.map(funcify)
      function result(s: TState) {
        const diff = s.diff
        const hasDiff = key in diff

        const pair = hasDiff ? diff[key] : [s[key],s[key]]
        if (pair.length<2) {
          return false
        }
        const [sa,sb] = pair

        const ret = a(sa) && b(sb)
        return ret
      }
      return result
    })
    function result(s: TState) {
      const applyRule = predicates.every(p=>p(s))
      if (!applyRule) return null
      const newStates = Object.entries(stateMutator).map(([key,value])=> {
        return [key, value(s)]
      })
      const ret = Object.fromEntries(newStates)
      return ret
    }
    return result
  }
  function rules(statePattern, stateMutator) {
    const ruleList = [rule(statePattern,stateMutator)]
    const pushRule = (statePattern, stateMutator) => {
      ruleList.push(rule(statePattern,stateMutator))
      return pushRule
    }
    function run() {
      const len = ruleList.length
      let i = 0
      let numIter = 0
      while(true) {
        numIter ++
        if (numIter>10000) {
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
        if (i>=len) {
          break
        }
      }
    }
    pushRule.run = run
    return pushRule
  }

  const machine = rules({
    mouseState: [any(),'down'],
    dragging:  [any(),complement(true)],
  },{
    dragging: checkIfDragging
  })

  document.addEventListener('pointerdown', (e)=> {
    const [x,y] = [e.clientX,e.clientY]
    state({ mouseState: 'down', startX: x, startY: y, x,y})
  })
  document.addEventListener('pointermove',(e)=>{
    const [x,y] = [e.clientX,e.clientY]
    state({x, y})
  })
  document.addEventListener('pointerup',(e)=>{
    let el = e.path[0]
    el = el === rootEL ? document.createElement('div') : el
    state({mouseState: 'up', el, dragging: false})
  })

  const derp = cellx(() => {
    machine.run()
  }).onChange(()=> {})
}
function hookupEventHandlers() {
  const emptyHandler = e => false
  let isClick = emptyHandler
  let handleMove = emptyHandler
  let dragItemsToCursor = emptyHandler
  let resetDraggedItems = emptyHandler
  document.addEventListener('pointerdown', (clickEvent)=>{
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
        const oldStyles = selected.map(n=>({p: n.style.position, t: n.style.transform}))
        const selectedBounds = selected.map(s=>s.getBoundingClientRect())
        dragItemsToCursor = (dragEvent) => {
          const [deltaX,deltaY] = [dragEvent.clientX - clickEvent.clientX, dragEvent.clientY - clickEvent.clientY]
          selected.forEach((n,i)=>{
            n.style.position='absolute'
            n.style.transform = "translate3d("+deltaX+"px,"+deltaY+"px, 0px)";
          })
        }
        resetDraggedItems = () => {
          selected.forEach((n,i) => {
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

  },{passive: false})
  document.addEventListener('pointermove',(e)=>{
    handleMove(e)
  },{passive: false})
  document.addEventListener('pointerup', (e)=>{
    if (isClick(e)) {
      const el = e.path[0]
      toggleClass(el,'sel')
    }
    resetDraggedItems(e)
    handleMove = emptyHandler
    isClick = emptyHandler
  },{passive: true})
}
hookupEventHandlersFRP()

function complement(value) {
  return (compareValue) => value!==compareValue
}
function any() { return ()=>true  }
function funcify(value) {
  if (typeof value === 'function') {
    return value
  }
  return (compareValue) => compareValue === value
}