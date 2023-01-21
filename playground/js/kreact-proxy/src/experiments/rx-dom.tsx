import React, {useEffect, useState} from "react"
import {elById} from "../domutil"
import {has, idGenerator, proxy} from "../util"
import {cellx} from "cellx"
import {ipsum} from "../lorem"

import Graph from 'graphology';
import ReactDOM from "react-dom"

declare var v: any
declare var o: any
declare var global: any

function defGlobalProp(key, get) {
  Object.defineProperty(global, key, {
    get
  })
}

defGlobalProp('cell', makeCellProxy)

const cells = {}
const log = console.log
//elById('root').style.visibility="hidden"
function makeCellProxy() {
  return proxy((data) => {
    data.path = []
  }, (data, key) => {
    data.path.push(key)
  }, (data, args) => {
    const path = data.path.join('/')
    return path
  })
}

function getCell(path, initialValue) {
  let ret
  if (!(path in cells)) {
    log('new cell',path, initialValue)
    ret = cells[path] = cellx(initialValue)
  } else {
    ret = cells[path]
  }
  return ret
}
const nodePrototype = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
}

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  children = children.flatMap((c, i) => Array.isArray(c) ? c : [c]) //flatten fragments
  props = props || {}
  return {type,props,children}
}
function ShimComponent(props) {
  const { setValueCallback } = props
  const [value,setValue] = useState(props.node)
  setValueCallback(setValue)
  const children = value.children.map(child=>{
    if (has(child,'type')) {
      return child.reactElement
    }
    return child
  })
  return React.createElement(value.type,value.props,...children)
}
function processJsx(node, index) {
  let {type,props,children} = node
  if (!has(node, 'reactElement')) {
    function setValueCallback(callback) {
      node.setValue = callback
    }
    node.reactElement = React.createElement(ShimComponent,{ setValueCallback, node })
  }
  children.forEach((c,i)=>{
    if (has(c,'type')) {
      processJsx(c, i)
    }
  })

  return node
}
const container = <div id={'foo'} style={{overflow: 'clip', position: 'relative', width: '100%', height: '100%'}}>
  <div id ={'someChild'} style={{position: 'absolute', backgroundColor: 'red', left: '5ch', top: '5ch', }}>someChild</div>
</div>

processJsx(container, 0)

ReactDOM.render(container.reactElement, document.getElementById('root'))
const childNode = container.children[0]
childNode.setValue({...childNode, children: ['yo']})
childNode.setValue({...childNode, children: ['yo2']})


const words = ipsum.split(' ')
const sheet = {
  globalOffset: cellx([0,0])
}
function box() {
  let ret ={}

  const posCell = cellx([0,0])
  ret.offsetPos=cellx(()=>{
    const [x,y] = posCell()
    const [ox,oy] = sheet.globalOffset()
    return [x+ox,y+oy]
  })
  ret.setPosition = function(x,y) {
    const [ox,oy] = posCell()
    x=x || ox
    y=y || oy
    posCell([x,y])
  }
  return ret
}
const boxes = words.map((word,index)=>{

  return { left: 0, top: 0, width: word.length, height: 1, word, index}
})

function makeIter() {
  const iter = { delta: [0,0], maxW: 120 }
  function next(w) {
    const [dW,dH] = iter.delta
    const nextW = dW+w
    if (nextW>iter.maxW) {
      iter.delta = [0,dH+1]
    } else {
      iter.delta = [nextW,dH]
    }

  }
}
boxes.reduce((acc,value,index,arr)=>{

},[])
function modulo(n, length, increment) {
  return (n + length + increment) % length
}
window.addEventListener("resize", e=>{
  const { width, height } = document.body.getBoundingClientRect()
  log({width,height})
})

document.addEventListener("pointermove",e=>{
  //set('x',e.x)
})

export const rxDomExperiment = 2