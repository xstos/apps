import {customJsx} from "./reactUtil"
import {getAllIndexes} from "./util"
import clonedeep from "lodash.clonedeep"
import {bindkeys} from "./io"
import {cellx} from "cellx"
import React from "react"
import ReactDOM from "react-dom"
let jsxCallback = customJsx
export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return jsxCallback(type, props, ...children)
}

let id = 0
let elements = [<cursor/>]

function ofType(o,type) {
  return o.type===type
}

function push(item) {
  jsxCallback = customJsx
  if (typeof item === "string") {
    if (item==='ctrl+enter') {
      const newId = id++
      insert(1,<cell id={newId}/>,<cursor/>, <cell_ id={newId}/>)
      return elements
    }
    if (item==="ctrl+c") {
      return elements
    }
    const chars = item.split('')
    console.log({chars})
    function insert(delCount: number,...items) {
      const cursors = getCursors()
      cursors.forEach(i=>{
        elements.splice(i,delCount,...items)
      })
    }
    function getCursors() {
      const cursors = getAllIndexes(elements,o=>ofType(o,'cursor'))
      cursors.reverse()
      return cursors
    }
    insert(0,...chars)
  }
  console.log(elements)
  return elements
}
function elementsToJSX() {
  jsxCallback = customJsx
  const len = elements.length
  const root = <root/>
  const containerStack = [root]

  const topChildren = ()=>containerStack[containerStack.length-1].children

  for (let i = 0; i < len; i++) {
    const el=clonedeep(elements[i])
    if (typeof el === "string") {
      topChildren().push(el)
      continue
    }
    const {type,props} = el

    if ('id' in props) {
      const isStart = !type.endsWith('_')
      if (isStart) {
        topChildren().push(el)
        containerStack.push(el)
      } else {
        containerStack.pop()
      }
    } else {

    }
  }
  return root
}

export function boxlessExperiment() {

  const keyCell = bindkeys(cellx({type:'io', 'key': ''}))
  keyCell.onChange(e=>{
    jsxCallback = customJsx
    push(e.data.value.key)
    const j = elementsToJSX()
    document.getElementById("foo").innerHTML=`<div>${JSON.stringify(elements,null,2)}</div>`
    const renderTarget=document.getElementById("foo2")

    jsxCallback = React.createElement

    const s = JSON.stringify(j,null,2)
    //renderTarget.innerHTML=''
    ReactDOM.render(<pre><br/>{s}</pre>, renderTarget)
  })
}