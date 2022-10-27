import './index.css';
import React from "react";
import hyperactiv from 'hyperactiv'
import ReactDOM from "react-dom"
import {bindkeys} from "./io"
import {customJsx} from "./reactUtil"
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
function hookupEventHandlers() {
  let pointerDown = false
  let dragging = false
  let startX,startY
  let selected = []
  let selectedBounds = []
  function emptyHandler(e) {
    return false
  }
  let isClick = emptyHandler
  let handleMove = emptyHandler
  let dragItemsToCursor = emptyHandler
  let resetDraggedItems = emptyHandler
  document.addEventListener('pointerdown', (clickEvent)=>{
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
        dragItemsToCursor = (ee) => {
          const [deltaX,deltaY] = [ee.clientX - clickEvent.clientX, ee.clientY - clickEvent.clientY]
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
function toggleClass(el,cls) {
  if (el.classList.contains(cls)) {
    el.classList.remove(cls)
  } else {
    el.classList.add(cls)
  }
}
hookupEventHandlers()