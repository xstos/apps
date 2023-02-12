import React, {useState} from "react"
import {cellx} from "cellx"
import ReactDOM from "react-dom"
import clonedeep from "lodash.clonedeep"

import {has, idGenerator, proxy} from "../util"
import {elById} from "../domutil"
import {ipsum} from "../lorem"
import {DirectedGraph} from "graphology"

declare var v: any
declare var o: any
declare var Ref: any
declare var global: any

function defGlobalProp(key, get) {
  Object.defineProperty(global, key, {
    get
  })
}

defGlobalProp('cell', makeCellProxy)
defGlobalProp('Ref',makeRefProxy)

const nextUId = idGenerator()
const cells = {}
const log = console.log

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
function makeRefProxy() {
  const t = { _path: ['ref'], _isPath: true }
  t.toString=()=>t.path.join('.')
  const handler = {get}
  const ret = new Proxy(t,handler)
  function get(target, key) {
    if (key.startsWith('_')) {
      return t[key]
    }
    t._path.push(key)
    return ret
  }
  return ret
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
const clipContainerStyle = {
  overflow: 'clip',
  position: 'relative',
  width: '100%',
  height: '100%'
}
const words = ipsum.split(' ')
function isNode(o) {
  return has(o,'type')
}
function wrap(node) {
  if (has(node,'type')) return node
  return {
    type: typeof node,
    props: {},
    children: [node]
  }
}

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  let ret = {}
  props=props||{}
  children = children.flatMap((c, i) => {
    const ret = (Array.isArray(c) ? c.map(wrap) : [wrap(c)])
    return ret
  })
  if (type===React.Fragment) {
    type='<>'
  } else if (type._isPath) {
    type=type._path.join('.')
  }
  const uid = idGenerator()
  ret.uid=uid
  Object.assign(ret,{type,props,children})

  if (has(props,'mount')) {
    const graph = new DirectedGraph()
    ret.graph = graph
    
    const el = elById(props.mount)
    ret.el = el
    function updateBounds() {
      const { width, height, left, top } = el.getBoundingClientRect()
      Object.assign(props,{ width, height, left, top })
    }
    updateBounds()
    window.addEventListener("resize", updateBounds)
    function processNode(node,index, parent) {
      const {type,props,children, uid} = node

      const graphNode = graph.addNode(uid, node)
      if (parent) {
        graph.addEdge(graphNode,parent.graphNode, {parent: true})
        if (parent.children[index-1]) {

        }
      }
      node.graphNode = graphNode
      const childNodes = children.map((c,i)=>{
        return processNode(c,i,node)
      })
    }
    processNode(ret,0,null)

  }

  return ret
}
//when rendering each line, we're creating a virtual box
// representing the current line

function ShimComponent(props) {
  const { setValueCallback, innerRef: ref, node } = props
  const [value,setValue] = useState(node)
  setValueCallback(setValue)
  const children = value.children.map(child=>{
    if (isNode(child)) {
      return child.reactElement
    }
    return child
  })

  return React.createElement(value.type,{...value.props, ref},...children)
}
function processJsx(node, index) {
  let {type,props,children} = node
  if (!has(props, 'style')) {
    props.style={}
  }
  if (!has(node, 'reactElement')) {
    function update(callback) {
      const cloned = clonedeep(node)
      let newVal = callback(cloned)
      if (newVal === undefined) {
        newVal = cloned
        node = cloned
      }
      node.setValue(newVal)
    }
    node.update=update
    function setValueCallback(callback) {
      node.setValue = callback
    }
    function innerRef(el) {
      if (!el) return
      node.el=el
    }
    node.reactElement = React.createElement(ShimComponent,{ setValueCallback, node, innerRef })
  }
  children.forEach((c,i)=>{
    if (has(c,'type')) {
      processJsx(c, i)
    }
  })
  log('render',node)
  return node
}

//todo time part of engine as variable

const wordEls = words.map((word,i)=>{

  return <button id={i}>{word}</button>
})
const rootEls = <div mount="root">
  {wordEls}
</div>

function makeChild(props) {
  const { left, top, value, index } = props
  return <div id={index} style={{position: 'absolute', left, top }}>{value}</div>
}

return

const container = <div
  id={'foo'}
  style={clipContainerStyle}>
  <div id={'someChild'} style={{position: 'absolute', left: '5ch', top: '5ch', }}>someChild</div>
  {wordEls}
</div>

processJsx(container, 0)
ReactDOM.render(container.reactElement, document.getElementById('root'))
const childNode = container.children[0]
childNode.update((n)=>{
  n.props.style.backgroundColor='red'
  n.children[0]='yo'
  n.children[1]='yo2'
})

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


window.addEventListener("resize", e=>{
  const { width, height } = document.body.getBoundingClientRect()
  log({width,height})
})

document.addEventListener("pointermove",e=>{
  childNode.update((n)=>{
    n.props.style.left=e.x+'px'
    n.props.style.top=e.y+'px'
  })

})

export const rxDomExperiment = 2