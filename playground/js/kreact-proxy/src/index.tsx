import './index.css';
import React from "react";
import ReactDOM from 'react-dom'

import {bindkeys} from "./io";
import clonedeep from "lodash.clonedeep"
import {derp} from "./dag"
import {babdemo} from "./babdemo"

declare var v: any
declare var o: any
declare var global: any

derp()

export const cursorBlock = '█'

let seed=0

let reactMode = false
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  //console.log({type,props,children})
  if (props) {
    return {type: tag, props, children}
  }
  //console.log(arguments)
  return {tag, children}
}

function newProxy(state, handler) {
  return new Proxy(state, handler)
}

export const intellisense = <menu>
  <item selected>foo</item>
  <item>bar</item>
</menu>
const app = <cells>
  <pi>{3.14159}</pi>
  <radius>{3}</radius>
  <exponent>{2}</exponent>
  <area><pow><radius/><exponent/></pow></area>
</cells>

const state = {
  vars: {},
  nodes: [],
  dirty: [],
}
function defProp(key,type) {
  Object.defineProperty(global, key, {
    get: () => makeProxy(type)
  })
}
function addNode() {
  const nodeIndex = state.nodes.length
  const node = { id: nodeIndex }
  state.nodes.push(node)
  return node
}

function addEdge(node, otherNode, i) {
  if (!('out' in node)) {
    node.out=[]
  }

  const edge = {id: otherNode.id}
  if (i!==undefined) {
    edge.i=i
  }
  node.out.push(edge)

  return [node, otherNode, i]
}
function setNodeDirty(id) {
  state.dirty.push(id)
}
function calculate() {
  const dirty = state.dirty
  while(dirty.length>0) {
    const id = dirty.pop()
    const node = getNodeById(id)
    
  }
}
function getCreateNode(key, type) {
  let node, nodeId
  const {vars, nodes}=state
  if (type === 'var') {
    if (!(key in vars)) {
      node = addNode()
      nodeId = node.id
      vars[key] = nodeId
      node.type = type
      node.key = key
    } else {
      nodeId = vars[key]
      node = nodes[nodeId]
    }
  } else if (type === 'op') {
    node = addNode()
    nodeId = node.id
    node.type = type
    node.key = key
  }
  return nodeId
}
function getNodeById(id) {
  return state.nodes[id]
}
function isNodeReference(data) {
  if (typeof data === 'object') {
    return 'type' in data && 'id' in data
  }
  return false
}

function apply(data, args) {
  const { id, type } = data
  const node = getNodeById(id)
  if (type === 'var') {
    const [arg] = args
    if (isNodeReference(arg)) {
      const argNode = getNodeById(arg.id)
      addEdge(argNode,node, undefined)
    } else {
      node.value = arg
      node.leaf = true
      setNodeDirty(id)
    }
  } else if (type === 'op') {
    const l = args.length
    node.args = []
    setNodeDirty(id)
    for (let i = 0; i < l; i++) {
      const arg = args[i]
      if (isNodeReference(arg)) {
        const argNode = getNodeById(arg.id)
        addEdge(argNode,node, i)
        node.args[i]={}
      } else {
        node.args[i]={ v: arg}
      }
    }
  }
}

function makeProxy(type) {
  let handler = null
  function prox(target) {
    return newProxy(target, handler)
  }

  handler = {
    get(target, key) {
      if (key.startsWith('_')) {
        return target[key]
      }
      const data = target._data
      const nodeId = getCreateNode(key, data.type)
      data.id = nodeId
      return prox(target)
    },
    apply(target, thisArg, args) {
      const data = target._data
      apply(data, args.map(a=>a._data ? a._data : a))
      return prox(target)
    },
  }

  const f = ()=>{}
  f._data = {
    type
  }

  return newProxy(f, handler)
}
defProp('v','var')
defProp('o','op')

v.a(2)
v.b(v.a)
v.d(100)
v.c(o.plus(v.a,v.a,v.b,v.d, 10))


console.log(JSON.stringify(state,null,2))

reactMode=true
function RRender() {
  ReactDOM.render(
    <div></div>,
    document.getElementById('root')
  )
}
document.getElementById('root').appendChild(createCanvas())
function getWindowSize() {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  return [vw,vh]
}
function createCanvas() {
  const canvas = document.createElement("canvas")
  const [vw,vh] = getWindowSize()
  //canvas.style.width="100vw"
  //canvas.style.height="100vh"
  canvas.width=vw
  canvas.height=vh
  window.addEventListener("resize",(e)=>{
    const [vw,vh] = getWindowSize()
    canvas.width=vw
    canvas.height=vh
  })

  const ctx = canvas.getContext("2d")
  ctx.imageSmoothingEnabled=false
  ctx.scale(10,10)

  ctx.font="20px Consolas"
  ctx.fillRect(0,0,2000,2000)
  ctx.fillStyle="yellow"

  ctx.fillRect(0,0,1,1)


  let metrics = ctx.measureText("W");
  let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
  let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  ctx.fillText("W",0,actualHeight)
  console.log(metrics)
  return canvas
}
function randomColor() {
  return `rgb(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)})`
}